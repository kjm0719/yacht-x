import type { Augment } from './augment';
import type { ScoreCard, Die } from './game';

export interface Player {
  id: string; // Keep as unique identifier (we can use sessionId here)
  sessionId: string;
  socketId: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  
  // In-game state
  currentTurn: number;
  rollsUsed: number;
  totalScore: number;
  currentDice: Die[];
  activeAugments: Augment[];
  augmentPickPending?: boolean;
  augmentCandidates?: Augment[];
  wildcardUsedThisTurn?: boolean;
  isFinished: boolean;
  scoreCard?: ScoreCard;
  turnExpiresAt?: number;
  isDisconnected?: boolean;
  disconnectedAt?: number;
}

export type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'ended';

export interface Room {
  id: string; // 6-digit code or custom
  name: string;
  hostId: string;
  maxPlayers: number; // default 4
  players: Player[];
  status: RoomStatus;
  countdownSeconds: number | null;
}

export interface PlayerRanking {
  rank: number;
  player: Player;
  finalScore: number;
}
