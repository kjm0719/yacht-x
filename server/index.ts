import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { z } from 'zod';
import type { Room, Player, PlayerRanking } from '../src/types/multiplayer';
import { createInitialDice, rollDice } from '../src/logic/diceLogic';
import { calculateTotalGameScore, calculateAugmentedScore } from '../src/logic/scoreCalculator';
import type { ScoreCategory, Die } from '../src/types/game';

const app = express();
app.use(cors()); // In production, this should be restricted to the actual frontend domain.

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// --- Security: Rate Limiting ---
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 30;
const rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(socket: Socket): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(socket.id);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(socket.id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  record.count++;
  if (record.count > MAX_EVENTS_PER_WINDOW) {
    console.warn(`[Security] Rate limit exceeded for socket ${socket.id}`);
    socket.disconnect(true); // Drop connection
    return false;
  }
  return true;
}

// --- Security: Validation Schemas (Zod) ---
const CreateRoomSchema = z.object({
  roomName: z.string().trim().max(30).optional().default('')
    .transform(val => val.replace(/[<>]/g, '')),
  nickname: z.string().trim().max(20).min(1).default('플레이어')
    .transform(val => val.replace(/[<>]/g, '')),
});

const JoinRoomSchema = z.object({
  roomId: z.string().trim().length(6)
    .transform(val => val.replace(/[<>]/g, '')),
  nickname: z.string().trim().max(20).min(1).default('플레이어')
    .transform(val => val.replace(/[<>]/g, '')),
});

const UpdateProgressSchema = z.object({
  turn: z.number().int().min(1).max(13),
  totalScore: z.number().min(0).max(5000), // Anti-cheat: Plausible max score cap
  dice: z.array(z.number().int().min(1).max(6)).max(5),
  activeAugments: z.array(z.any()).max(20), // Just basic array limit for now
});

const FinishGameSchema = z.object({
  finalScore: z.number().min(0).max(5000),
  scoreCard: z.record(z.string(), z.number().nullable()),
});

// In-memory room store
const rooms: Map<string, Room> = new Map();
// Active countdown timers mapped by roomId
const countdownTimers: Map<string, NodeJS.Timeout> = new Map();

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function broadcastRoomList() {
  const openRooms = Array.from(rooms.values())
    .filter(r => r.status === 'waiting' && r.players.length < r.maxPlayers)
    .map(r => ({
      id: r.id,
      name: r.name,
      playersCount: r.players.length,
      maxPlayers: r.maxPlayers,
    }));
  io.emit('room_list', openRooms);
}

function stopCountdown(roomId: string, room: Room) {
  const timer = countdownTimers.get(roomId);
  if (timer) {
    clearInterval(timer);
    countdownTimers.delete(roomId);
  }
  room.status = 'waiting';
  room.countdownSeconds = null;
  io.to(roomId).emit('countdown_cancelled');
  io.to(roomId).emit('room_updated', room);
}

function startCountdown(roomId: string, room: Room) {
  if (countdownTimers.has(roomId)) return;

  room.status = 'countdown';
  let seconds = 5;
  room.countdownSeconds = seconds;
  io.to(roomId).emit('countdown_tick', seconds);
  io.to(roomId).emit('room_updated', room);

  const timer = setInterval(() => {
    seconds -= 1;
    room.countdownSeconds = seconds;

    if (seconds > 0) {
      io.to(roomId).emit('countdown_tick', seconds);
      io.to(roomId).emit('room_updated', room);
    } else {
      // Countdown finished -> Start Game!
      clearInterval(timer);
      countdownTimers.delete(roomId);

      room.status = 'playing';
      room.countdownSeconds = null;
      io.to(roomId).emit('game_started');
      io.to(roomId).emit('room_updated', room);
      broadcastRoomList();
    }
  }, 1000);

  countdownTimers.set(roomId, timer);
}

function checkMajorityReady(room: Room) {
  const total = room.players.length;
  if (total === 0) return;

  const readyCount = room.players.filter(p => p.isReady).length;
  const hasMajority = readyCount > total / 2;

  if (hasMajority && room.status === 'waiting') {
    startCountdown(room.id, room);
  } else if (!hasMajority && room.status === 'countdown') {
    stopCountdown(room.id, room);
  }
}

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Rate Limiting Middleware
  socket.use((packet, next) => {
    if (!checkRateLimit(socket)) {
      return next(new Error('Rate limit exceeded'));
    }
    next();
  });
  
  let currentRoomId: string | null = null;

  // Send initial room list
  socket.on('get_rooms', () => {
    const openRooms = Array.from(rooms.values())
      .filter(r => r.status === 'waiting' && r.players.length < r.maxPlayers)
      .map(r => ({
        id: r.id,
        name: r.name,
        playersCount: r.players.length,
        maxPlayers: r.maxPlayers,
      }));
    socket.emit('room_list', openRooms);
  });

  // Create Room
  socket.on('create_room', (rawData: any) => {
    const parsed = CreateRoomSchema.safeParse(rawData);
    if (!parsed.success) return socket.emit('error_message', '잘못된 입력입니다.');
    const { roomName, nickname } = parsed.data;

    let roomId = generateRoomId();
    while (rooms.has(roomId)) {
      roomId = generateRoomId();
    }

    const newPlayer: Player = {
      id: socket.id,
      nickname,
      isHost: true,
      isReady: false,
      currentTurn: 1,
      totalScore: 0,
      currentDice: [],
      activeAugments: [],
      isFinished: false,
    };

    const newRoom: Room = {
      id: roomId,
      name: roomName || `${nickname}의 방`,
      hostId: socket.id,
      maxPlayers: 4,
      players: [newPlayer],
      status: 'waiting',
      countdownSeconds: null,
    };

    rooms.set(roomId, newRoom);
    currentRoomId = roomId;
    socket.join(roomId);

    socket.emit('room_created', newRoom);
    broadcastRoomList();
    console.log(`[Socket] Room created: ${roomId} by ${nickname}`);
  });

  // Join Room
  socket.on('join_room', (rawData: any) => {
    const parsed = JoinRoomSchema.safeParse(rawData);
    if (!parsed.success) return socket.emit('error_message', '잘못된 방 코드 또는 닉네임입니다.');
    
    const { roomId, nickname } = parsed.data;
    const formattedId = roomId.toUpperCase();
    const room = rooms.get(formattedId);

    if (!room) {
      socket.emit('error_message', '존재하지 않는 방입니다.');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error_message', '방 인원이 가득 찼습니다. (최대 4인)');
      return;
    }

    if (room.status === 'playing') {
      socket.emit('error_message', '이미 게임이 진행 중인 방입니다.');
      return;
    }

    const newPlayer: Player = {
      id: socket.id,
      nickname,
      isHost: false,
      isReady: false,
      currentTurn: 1,
      totalScore: 0,
      currentDice: [],
      activeAugments: [],
      isFinished: false,
    };

    room.players.push(newPlayer);
    currentRoomId = formattedId;
    socket.join(formattedId);

    socket.emit('room_joined', room);
    io.to(formattedId).emit('room_updated', room);
    broadcastRoomList();
  });

  // Toggle Ready
  socket.on('toggle_ready', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = !player.isReady;
    io.to(currentRoomId).emit('room_updated', room);

    checkMajorityReady(room);
  });

  // In-Game Live Progress Update
  socket.on('update_game_progress', (rawData: any) => {
    const parsed = UpdateProgressSchema.safeParse(rawData);
    if (!parsed.success) {
      console.warn(`[Security] Invalid progress payload from ${socket.id}`, parsed.error.issues);
      return;
    }
    const data = parsed.data;

    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.currentTurn = data.turn;
    player.totalScore = data.totalScore;
    player.currentDice = data.dice;
    player.activeAugments = data.activeAugments;

    // Broadcast updated player state to other players in the room
    socket.to(currentRoomId).emit('player_progress_updated', {
      playerId: socket.id,
      turn: data.turn,
      totalScore: data.totalScore,
      dice: data.dice,
      activeAugments: data.activeAugments,
    });
  });

  // Player Finished Game (Turn 13 complete)
  socket.on('finish_game', (rawData: any) => {
    const parsed = FinishGameSchema.safeParse(rawData);
    if (!parsed.success) {
      console.warn(`[Security] Invalid finish_game payload from ${socket.id}`, parsed.error.issues);
      return;
    }
    const data = parsed.data;

    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isFinished = true;
    player.totalScore = data.finalScore;
    player.scoreCard = data.scoreCard;

    io.to(currentRoomId).emit('room_updated', room);

    // Check if all players in the room finished
    const allFinished = room.players.every(p => p.isFinished);
    if (allFinished) {
      room.status = 'ended';

      // Sort by final score descending
      const sortedPlayers = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
      const rankings: PlayerRanking[] = sortedPlayers.map((p, idx) => ({
        rank: idx + 1,
        player: p,
        finalScore: p.totalScore,
      }));

      io.to(currentRoomId).emit('all_players_finished', rankings);
    }
  });

  // Return to Waiting Room (Reset for next game)
  socket.on('return_to_waiting_room', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    // Only host or any player can trigger? Let's say any player clicking it resets their own ready state,
    // but if the room is ended, we reset the room to waiting.
    if (room.status === 'ended') {
      room.status = 'waiting';
      room.countdownSeconds = null;
      room.players.forEach(p => {
        p.isReady = false;
        p.isFinished = false;
        p.currentTurn = 1;
        p.totalScore = 0;
        p.currentDice = [];
        p.activeAugments = [];
        p.scoreCard = undefined;
      });
      io.to(currentRoomId).emit('room_updated', room);
      broadcastRoomList();
    }
  });

  // Leave Room
  const handleLeaveRoom = () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const leavingPlayerIndex = room.players.findIndex(p => p.id === socket.id);
    if (leavingPlayerIndex === -1) return;

    const wasHost = room.players[leavingPlayerIndex].isHost;
    room.players.splice(leavingPlayerIndex, 1);
    socket.leave(currentRoomId);

    if (room.players.length === 0) {
      // Room empty -> delete
      stopCountdown(currentRoomId, room);
      rooms.delete(currentRoomId);
    } else {
      // Reassign host if host left
      if (wasHost) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }
      checkMajorityReady(room);
      io.to(currentRoomId).emit('room_updated', room);
      
      // If the game is playing, check if remaining players are all finished
      if (room.status === 'playing') {
        // Mark the leaving player as finished so they don't block game end
        // (their data was already removed from room.players above)
        const allFinished = room.players.every(p => p.isFinished);
        if (allFinished && room.players.length > 0) {
          room.status = 'ended';
          const sortedPlayers = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
          const rankings: PlayerRanking[] = sortedPlayers.map((p, idx) => ({
            rank: idx + 1,
            player: p,
            finalScore: p.totalScore,
          }));
          io.to(currentRoomId).emit('all_players_finished', rankings);
        }
      }
    }

    currentRoomId = null;
    broadcastRoomList();
  };

  socket.on('leave_room', handleLeaveRoom);
  socket.on('disconnect', handleLeaveRoom);
});

server.listen(PORT, () => {
  console.log(`[Multiplayer Engine] Server running on http://localhost:${PORT}`);
});
