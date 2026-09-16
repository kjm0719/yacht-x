import type { ScoreCategory, ScoreCard } from '../types/game';
import type { Augment } from '../types/augment';
import { 
  DEFAULT_UPPER_BONUS_THRESHOLD, 
  DEFAULT_UPPER_BONUS_SCORE,
  UPPER_CATEGORIES 
} from '../constants/rules';

/**
 * Counts frequencies of each die value 1-6
 */
function getFrequencyMap(diceValues: number[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const v of diceValues) {
    if (counts[v] !== undefined) {
      counts[v]++;
    }
  }
  return counts;
}

/**
 * Standard Yacht Dice Base Score Calculator (Pure Function)
 */
export function calculateBaseScore(category: ScoreCategory, diceValues: number[]): number {
  if (!diceValues || diceValues.length === 0) return 0;

  const counts = getFrequencyMap(diceValues);
  const sumAll = diceValues.reduce((acc, curr) => acc + curr, 0);

  switch (category) {
    // Upper Section
    case 'aces':
      return (counts[1] || 0) * 1;
    case 'twos':
      return (counts[2] || 0) * 2;
    case 'threes':
      return (counts[3] || 0) * 3;
    case 'fours':
      return (counts[4] || 0) * 4;
    case 'fives':
      return (counts[5] || 0) * 5;
    case 'sixes':
      return (counts[6] || 0) * 6;

    // Lower Section
    case 'choice':
      return sumAll;

    case 'threeOfAKind': {
      const hasThree = Object.values(counts).some(count => count >= 3);
      return hasThree ? sumAll : 0;
    }

    case 'fourOfAKind': {
      const hasFour = Object.values(counts).some(count => count >= 4);
      return hasFour ? sumAll : 0;
    }

    case 'fullHouse': {
      // Full House: At least one trio (3+) and one pair (2+) of different numbers,
      // or five of a kind.
      const countsArr = Object.values(counts).sort((a, b) => b - a);
      const isFiveOfAKind = countsArr[0] >= 5;
      const isTrioAndPair = countsArr[0] >= 3 && countsArr[1] >= 2;
      return (isFiveOfAKind || isTrioAndPair) ? 25 : 0;
    }

    case 'smallStraight': {
      // 4 consecutive numbers (1-2-3-4, 2-3-4-5, 3-4-5-6)
      const uniqueSorted = Array.from(new Set(diceValues)).sort((a, b) => a - b);
      const str = uniqueSorted.join('');
      const isSmall = 
        str.includes('1234') || 
        str.includes('2345') || 
        str.includes('3456');
      return isSmall ? 30 : 0;
    }

    case 'largeStraight': {
      // 5 consecutive numbers (1-2-3-4-5, 2-3-4-5-6)
      const uniqueSorted = Array.from(new Set(diceValues)).sort((a, b) => a - b);
      const str = uniqueSorted.join('');
      const isLarge = str.includes('12345') || str.includes('23456');
      return isLarge ? 40 : 0;
    }

    case 'yacht': {
      // 5 of the same number
      const hasYacht = Object.values(counts).some(count => count >= 5);
      return hasYacht ? 50 : 0;
    }

    default:
      return 0;
  }
}

import { ALL_AUGMENTS } from '../constants/augments';

/**
 * Calculates final score considering all active augments (Pure Function)
 */
export function calculateAugmentedScore(
  category: ScoreCategory,
  diceValues: number[],
  rollsUsed: number,
  activeAugments: Augment[]
): number {
  let score = calculateBaseScore(category, diceValues);

  // Hydrate augments because functions are lost during JSON serialization over Socket.IO
  const hydratedAugments = activeAugments.map(a => ALL_AUGMENTS.find(full => full.id === a.id) || a);

  // Apply each augment's score modifier in sequence
  for (const aug of hydratedAugments) {
    if (aug.modifyScore) {
      score = aug.modifyScore(score, category, diceValues, rollsUsed, hydratedAugments);
    }
  }

  return score;
}

/**
 * Upper bonus calculation utilities
 */
export function getUpperBonusThreshold(activeAugments: Augment[]): number {
  const hydrated = activeAugments.map(a => ALL_AUGMENTS.find(f => f.id === a.id) || a);
  for (const aug of hydrated) {
    if (aug.bonusThreshold !== undefined) {
      return aug.bonusThreshold;
    }
  }
  return DEFAULT_UPPER_BONUS_THRESHOLD;
}

export function getUpperBonusReward(activeAugments: Augment[]): number {
  const hydrated = activeAugments.map(a => ALL_AUGMENTS.find(f => f.id === a.id) || a);
  for (const aug of hydrated) {
    if (aug.bonusReward !== undefined) {
      return aug.bonusReward;
    }
  }
  return DEFAULT_UPPER_BONUS_SCORE;
}

export function calculateUpperTotal(scoreCard: ScoreCard): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => {
    return sum + (scoreCard[cat] ?? 0);
  }, 0);
}

export function isUpperBonusAchieved(upperTotal: number, threshold: number): boolean {
  return upperTotal >= threshold;
}

export function calculateTotalGameScore(
  scoreCard: ScoreCard,
  activeAugments: Augment[],
  yachtBonusCount: number = 0
): {
  upperTotal: number;
  upperBonus: number;
  lowerTotal: number;
  yachtBonus: number;
  grandTotal: number;
  threshold: number;
  bonusReward: number;
} {
  const upperTotal = calculateUpperTotal(scoreCard);
  const threshold = getUpperBonusThreshold(activeAugments);
  const bonusReward = getUpperBonusReward(activeAugments);
  const upperBonus = isUpperBonusAchieved(upperTotal, threshold) ? bonusReward : 0;

  let lowerTotal = 0;
  for (const [key, val] of Object.entries(scoreCard)) {
    if (!UPPER_CATEGORIES.includes(key as any) && val !== undefined) {
      lowerTotal += val;
    }
  }

  const yachtBonus = yachtBonusCount * 100;
  lowerTotal += yachtBonus;
  
  const grandTotal = upperTotal + upperBonus + lowerTotal;

  return {
    upperTotal,
    upperBonus,
    lowerTotal,
    yachtBonus,
    grandTotal,
    threshold,
    bonusReward
  };
}
