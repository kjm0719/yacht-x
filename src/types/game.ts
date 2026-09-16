import type { Augment } from './augment';

export type UpperCategory = 'aces' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes';

export type LowerCategory = 
  | 'choice'
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yacht';

export type ScoreCategory = UpperCategory | LowerCategory;

export interface Die {
  id: number;
  value: number; // 1 to 6
  isHeld: boolean;
}

export type ScoreCard = Partial<Record<ScoreCategory, number>>;

export type GameStatus = 
  | 'rolling'         // Dice rolling animation
  | 'in_turn'         // Player can hold, reroll, or pick score
  | 'augment_pending' // Augment selection modal open
  | 'game_over';      // 13 turns completed

export interface GameState {
  currentTurn: number; // 1 to 13
  totalTurns: number; // 13
  dice: Die[];
  rollsLeft: number;
  maxRolls: number; // 기본 3 (증강으로 증가)
  scoreCard: ScoreCard;
  activeAugments: Augment[];
  augmentPickPending: boolean;
  augmentCandidates: Augment[];
  gameStatus: GameStatus;
  wildcardUsedThisTurn: boolean;
  turnRollsCount: number; // 이번 턴에 실제로 굴린 횟수 (1~3)
  yachtBonusCount: number; // 야추 중복 획득 시 보너스 카운트 (+100점씩)
  announcement?: string;
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE_START' }
  | { type: 'ROLL_DICE_COMPLETE' }
  | { type: 'TOGGLE_HOLD'; index: number }
  | { type: 'USE_WILDCARD'; index: number; value: number }
  | { type: 'SELECT_SCORE'; category: ScoreCategory }
  | { type: 'SELECT_AUGMENT'; augment: Augment }
  | { type: 'CLOSE_AUGMENT_MODAL' }
  | { type: 'SYNC_STATE'; payload: Partial<GameState> }
  | { type: 'RESET_GAME' };
