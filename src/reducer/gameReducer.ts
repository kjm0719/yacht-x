import type { GameState, GameAction } from '../types/game';
import type { Augment } from '../types/augment';
import { 
  TOTAL_TURNS, 
  DEFAULT_MAX_ROLLS, 
  DEFAULT_DICE_COUNT 
} from '../constants/rules';
import { ALL_AUGMENTS } from '../constants/augments';
import { createInitialDice } from '../logic/diceLogic';

export function getAugmentCandidates(activeAugments: Augment[]): Augment[] {
  const activeIds = new Set(activeAugments.map(a => a.id));
  const available = ALL_AUGMENTS.filter(a => !activeIds.has(a.id));

  // Shuffle and pick 3
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function createInitialState(): GameState {
  const initialDice = createInitialDice(DEFAULT_DICE_COUNT);
  return {
    currentTurn: 1,
    totalTurns: TOTAL_TURNS,
    dice: initialDice,
    rollsLeft: DEFAULT_MAX_ROLLS - 1, // First roll already performed
    maxRolls: DEFAULT_MAX_ROLLS,
    scoreCard: {},
    activeAugments: [],
    augmentPickPending: false,
    augmentCandidates: [],
    gameStatus: 'in_turn',
    wildcardUsedThisTurn: false,
    turnRollsCount: 1,
    yachtBonusCount: 0,
    announcement: '1턴이 시작되었습니다! 주사위를 홀드하거나 다시 굴려보세요.'
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SYNC_STATE':
      return { ...state, ...action.payload };
    case 'START_GAME':
    case 'RESET_GAME':
      return createInitialState();
    case 'ROLL_DICE_START':
      return { ...state, gameStatus: 'rolling' };
    case 'ROLL_DICE_COMPLETE':
      return { ...state, gameStatus: 'in_turn' };
    case 'TOGGLE_HOLD':
      const newDice = [...state.dice];
      newDice[action.index] = { ...newDice[action.index], isHeld: !newDice[action.index].isHeld };
      return { ...state, dice: newDice };
    default:
      return state;
  }
}
