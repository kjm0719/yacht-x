import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { socket } from './socket/socketClient';
import type { Room, PlayerRanking } from './types/multiplayer';
import type { ScoreCategory } from './types/game';
import type { Augment } from './types/augment';
import { gameReducer, createInitialState } from './reducer/gameReducer';
import { calculateTotalGameScore } from './logic/scoreCalculator';

// Components
import { NicknameModal } from './components/lobby/NicknameModal';
import { RoomBrowser } from './components/lobby/RoomBrowser';
import type { OpenRoom } from './components/lobby/RoomBrowser';
import { WaitingRoom } from './components/lobby/WaitingRoom';
import { Header } from './components/Header';
import { DiceArea } from './components/DiceArea';
import { ScoreTable } from './components/ScoreTable';
import { AugmentModal } from './components/AugmentModal';
import { ActiveAugmentBar } from './components/ActiveAugmentBar';
import { GameOverModal } from './components/GameOverModal';
import { MultiScoreBoard } from './components/multiplayer/MultiScoreBoard';
import { MultiGameOverModal } from './components/multiplayer/MultiGameOverModal';

type ScreenState = 'LOBBY' | 'WAITING' | 'PLAYING';

export function App() {
  // User Profile
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('yacht_nickname') || '';
  });
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(!nickname);

  // Multiplayer Room State
  const [screen, setScreen] = useState<ScreenState>('LOBBY');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [openRooms, setOpenRooms] = useState<OpenRoom[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isSoloMode, setIsSoloMode] = useState<boolean>(false);
  const [multiRankings, setMultiRankings] = useState<PlayerRanking[]>([]);
  const [showMultiGameOver, setShowMultiGameOver] = useState<boolean>(false);

  // Single Player / Local Game Engine
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  // 1. Initial Socket Setup
  useEffect(() => {
    const onConnect = () => setMyPlayerId(socket.id || '');
    const onRoomList = (rooms: any[]) => setOpenRooms(rooms);
    const onRoomCreated = (room: Room) => {
      setCurrentRoom(room);
      setScreen('WAITING');
      setIsSoloMode(false);
    };
    const onRoomJoined = (room: Room) => {
      setCurrentRoom(room);
      setScreen('WAITING');
      setIsSoloMode(false);
    };
    const onRoomUpdated = (room: Room) => setCurrentRoom({ ...room });
    const onCountdownTick = (seconds: number) => {
      setCurrentRoom(prev => prev ? { ...prev, status: 'countdown', countdownSeconds: seconds } : null);
    };
    const onCountdownCancelled = () => {
      setCurrentRoom(prev => prev ? { ...prev, status: 'waiting', countdownSeconds: null } : null);
    };
    const onGameStarted = () => {
      dispatch({ type: 'RESET_GAME' });
      setScreen('PLAYING');
      setShowMultiGameOver(false);
      // Reset the game-over ref so finish_game fires properly in rematches
      hasEmittedGameOverRef.current = false;
      lastSyncPayloadRef.current = '';
    };
    const onPlayerProgress = (data: any) => {
      setCurrentRoom(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map(p => {
          if (p.id === data.playerId) {
            return {
              ...p,
              currentTurn: data.turn,
              totalScore: data.totalScore,
              currentDice: data.dice,
              activeAugments: data.activeAugments,
            };
          }
          return p;
        });
        return { ...prev, players: updatedPlayers };
      });
    };
    const onAllFinished = (rankings: PlayerRanking[]) => {
      setMultiRankings(rankings);
      setShowMultiGameOver(true);
    };
    const onError = (msg: string) => alert(msg);

    // Register listeners
    socket.on('connect', onConnect);
    socket.on('room_list', onRoomList);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('room_updated', onRoomUpdated);
    socket.on('countdown_tick', onCountdownTick);
    socket.on('countdown_cancelled', onCountdownCancelled);
    socket.on('game_started', onGameStarted);
    socket.on('player_progress_updated', onPlayerProgress);
    socket.on('all_players_finished', onAllFinished);
    socket.on('error_message', onError);

    // Initial fetch if already connected
    if (socket.connected) {
      setMyPlayerId(socket.id || '');
      socket.emit('get_rooms');
    }

    // Auto join via URL param ?room=CODE on initial load if nickname exists
    const initialNickname = localStorage.getItem('yacht_nickname');
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam && initialNickname) {
      socket.emit('join_room', { roomId: roomParam, nickname: initialNickname });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_list', onRoomList);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('room_updated', onRoomUpdated);
      socket.off('countdown_tick', onCountdownTick);
      socket.off('countdown_cancelled', onCountdownCancelled);
      socket.off('game_started', onGameStarted);
      socket.off('player_progress_updated', onPlayerProgress);
      socket.off('all_players_finished', onAllFinished);
      socket.off('error_message', onError);
    };
  }, []); // Run only once on mount

  // Keep track of the last emitted payload to avoid infinite loops and excessive state updates
  const lastSyncPayloadRef = useRef<string>('');
  const hasEmittedGameOverRef = useRef<boolean>(false);

  // Sync my in-game progress to socket room
  useEffect(() => {
    if (screen === 'PLAYING' && !isSoloMode && currentRoom) {
      const stats = calculateTotalGameScore(state.scoreCard, state.activeAugments, state.yachtBonusCount);
      const diceValues = state.dice.map(d => d.value);

      const currentPayload = JSON.stringify({
        turn: state.currentTurn,
        totalScore: stats.grandTotal,
        dice: diceValues,
        augmentsCount: state.activeAugments.length,
      });

      // Only emit and update if the meaningful stats have changed
      if (lastSyncPayloadRef.current !== currentPayload) {
        lastSyncPayloadRef.current = currentPayload;

        socket.emit('update_game_progress', {
          turn: state.currentTurn,
          totalScore: stats.grandTotal,
          dice: diceValues,
          activeAugments: state.activeAugments,
        });

        // Update my own player stats in currentRoom locally
        setCurrentRoom(prev => {
          if (!prev) return null;
          const updated = prev.players.map(p => {
            if (p.id === (socket.id || myPlayerId)) {
              return {
                ...p,
                currentTurn: state.currentTurn,
                totalScore: stats.grandTotal,
                currentDice: state.dice,
                activeAugments: state.activeAugments,
              };
            }
            return p;
          });
          return { ...prev, players: updated };
        });
      }

      // Check if finished 13 turns
      if (state.gameStatus === 'game_over' && !hasEmittedGameOverRef.current) {
        hasEmittedGameOverRef.current = true;
        socket.emit('finish_game', {
          finalScore: stats.grandTotal,
          scoreCard: state.scoreCard,
        });
      }
    }
    
    // Reset game over ref if we restart or go back to lobby
    if (screen !== 'PLAYING') {
      hasEmittedGameOverRef.current = false;
      lastSyncPayloadRef.current = '';
    }
  }, [state.currentTurn, state.scoreCard, state.dice, state.activeAugments, state.gameStatus, screen, isSoloMode]);

  // Handle Nickname Save
  const handleSaveNickname = (newNick: string) => {
    localStorage.setItem('yacht_nickname', newNick);
    setNickname(newNick);
    setShowNicknameModal(false);

    // If there was an invite param in URL, join after nickname set
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      socket.emit('join_room', { roomId: roomParam, nickname: newNick });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Lobby actions
  const handleCreateRoom = (roomName: string) => {
    socket.emit('create_room', { roomName, nickname });
  };

  const handleJoinRoom = (roomId: string) => {
    socket.emit('join_room', { roomId, nickname });
  };

  const handleRefreshRooms = () => {
    socket.emit('get_rooms');
  };

  const handleStartSolo = () => {
    setIsSoloMode(true);
    setScreen('PLAYING');
    dispatch({ type: 'RESET_GAME' });
  };

  // Waiting Room actions
  const handleToggleReady = () => {
    socket.emit('toggle_ready');
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room');
    setCurrentRoom(null);
    setScreen('LOBBY');
    // Remove query param from url
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Game Play Actions
  const handleRollDice = useCallback(() => {
    if (state.rollsLeft <= 0 || state.gameStatus === 'rolling') return;
    dispatch({ type: 'ROLL_DICE_START' });
    setTimeout(() => {
      dispatch({ type: 'ROLL_DICE_COMPLETE' });
    }, 450);
  }, [state.rollsLeft, state.gameStatus]);

  const handleToggleHold = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_HOLD', index });
  }, []);

  const handleUseWildcard = useCallback((index: number, value: number) => {
    dispatch({ type: 'USE_WILDCARD', index, value });
  }, []);

  const handleSelectScore = useCallback((category: ScoreCategory) => {
    dispatch({ type: 'SELECT_SCORE', category });
  }, []);

  const handleSelectAugment = useCallback((augment: Augment) => {
    dispatch({ type: 'SELECT_AUGMENT', augment });
  }, []);

  const handleResetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const totalScoreStats = calculateTotalGameScore(state.scoreCard, state.activeAugments, state.yachtBonusCount);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8">
      {/* 1. Lobby Screen */}
      {screen === 'LOBBY' && (
        <RoomBrowser
          nickname={nickname || '플레이어'}
          openRooms={openRooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onRefreshRooms={handleRefreshRooms}
          onChangeNickname={() => setShowNicknameModal(true)}
          onStartSolo={handleStartSolo}
        />
      )}

      {/* 2. Waiting Room Screen */}
      {screen === 'WAITING' && currentRoom && (
        <WaitingRoom
          room={currentRoom}
          myPlayerId={socket.id || myPlayerId}
          onToggleReady={handleToggleReady}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* 3. In-Game Screen */}
      {screen === 'PLAYING' && (
        <div className="w-full max-w-5xl flex flex-col gap-5 animate-in fade-in duration-300">
          {/* Header */}
          <Header
            currentTurn={state.currentTurn}
            totalTurns={state.totalTurns}
            grandTotal={totalScoreStats.grandTotal}
            isSoloMode={isSoloMode}
            onResetGame={isSoloMode ? handleResetGame : handleLeaveRoom}
            announcement={state.announcement}
          />

          {/* Multiplayer 4-Player Live Scoreboard if in Room */}
          {!isSoloMode && currentRoom && (
            <MultiScoreBoard
              players={currentRoom.players}
              myPlayerId={socket.id || myPlayerId}
            />
          )}

          {/* Active Augments Bar */}
          <ActiveAugmentBar activeAugments={state.activeAugments} />

          {/* Interactive Dice Play Area */}
          <DiceArea
            dice={state.dice}
            rollsLeft={state.rollsLeft}
            maxRolls={state.maxRolls}
            isRolling={state.gameStatus === 'rolling'}
            onToggleHold={handleToggleHold}
            onRoll={handleRollDice}
            activeAugments={state.activeAugments}
            wildcardUsedThisTurn={state.wildcardUsedThisTurn}
            onUseWildcard={handleUseWildcard}
          />

          {/* 13-category Score Table */}
          <ScoreTable
            scoreCard={state.scoreCard}
            dice={state.dice}
            rollsUsed={state.turnRollsCount}
            activeAugments={state.activeAugments}
            yachtBonusCount={state.yachtBonusCount}
            onSelectScore={handleSelectScore}
            isRolling={state.gameStatus === 'rolling'}
          />
        </div>
      )}

      {/* Nickname Entry Modal */}
      <NicknameModal
        isOpen={showNicknameModal}
        initialNickname={nickname}
        onSave={handleSaveNickname}
      />

      {/* ARAM-style Augment Choice Modal */}
      <AugmentModal
        isOpen={state.augmentPickPending}
        candidates={state.augmentCandidates}
        onSelectAugment={handleSelectAugment}
      />

      {/* Solo Game Over Summary Modal */}
      {isSoloMode && (
        <GameOverModal
          isOpen={state.gameStatus === 'game_over'}
          scoreCard={state.scoreCard}
          activeAugments={state.activeAugments}
          yachtBonusCount={state.yachtBonusCount}
          onRestart={handleResetGame}
        />
      )}

      {/* Multiplayer 4-Player Final Podium Modal */}
      {!isSoloMode && (
        <MultiGameOverModal
          isOpen={showMultiGameOver}
          rankings={multiRankings}
          myPlayerId={socket.id || myPlayerId}
          onBackToLobby={() => {
            socket.emit('return_to_waiting_room');
            setShowMultiGameOver(false);
            setScreen('WAITING');
          }}
        />
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-xs text-slate-500 mt-8 pb-4">
        Yacht Dice x ARAM Augments Multiplayer Engine • Up to 4 Players Live Battle
      </footer>
    </div>
  );
}

export default App;