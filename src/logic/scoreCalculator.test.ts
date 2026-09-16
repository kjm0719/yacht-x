import { describe, it, expect } from 'vitest';
import { calculateBaseScore, calculateAugmentedScore } from './scoreCalculator';
import { ALL_AUGMENTS } from '../constants/augments';

describe('scoreCalculator - calculateBaseScore', () => {
  it('should correctly calculate Aces through Sixes', () => {
    const dice = [1, 2, 2, 3, 6];
    expect(calculateBaseScore('aces', dice)).toBe(1);
    expect(calculateBaseScore('twos', dice)).toBe(4);
    expect(calculateBaseScore('threes', dice)).toBe(3);
    expect(calculateBaseScore('fours', dice)).toBe(0);
    expect(calculateBaseScore('sixes', dice)).toBe(6);
  });

  it('should correctly calculate choice', () => {
    expect(calculateBaseScore('choice', [1, 2, 3, 4, 5])).toBe(15);
  });

  it('should correctly calculate threeOfAKind', () => {
    expect(calculateBaseScore('threeOfAKind', [2, 2, 2, 4, 5])).toBe(15);
    expect(calculateBaseScore('threeOfAKind', [3, 3, 4, 4, 5])).toBe(0);
  });

  it('should correctly calculate fourOfAKind', () => {
    expect(calculateBaseScore('fourOfAKind', [6, 6, 6, 6, 1])).toBe(25);
    expect(calculateBaseScore('fourOfAKind', [2, 2, 2, 4, 4])).toBe(0);
  });

  it('should correctly calculate fullHouse', () => {
    expect(calculateBaseScore('fullHouse', [2, 2, 2, 3, 3])).toBe(25);
    expect(calculateBaseScore('fullHouse', [1, 1, 1, 1, 1])).toBe(25);
    expect(calculateBaseScore('fullHouse', [2, 2, 3, 3, 4])).toBe(0);
  });

  it('should correctly calculate smallStraight', () => {
    expect(calculateBaseScore('smallStraight', [1, 2, 3, 4, 6])).toBe(30);
    expect(calculateBaseScore('smallStraight', [2, 3, 4, 5, 5])).toBe(30);
    expect(calculateBaseScore('smallStraight', [3, 4, 5, 6, 1])).toBe(30);
    expect(calculateBaseScore('smallStraight', [6, 4, 3, 5, 1])).toBe(30);
    expect(calculateBaseScore('smallStraight', [1, 2, 4, 5, 6])).toBe(0);
  });

  it('should correctly calculate largeStraight', () => {
    expect(calculateBaseScore('largeStraight', [1, 2, 3, 4, 5])).toBe(40);
    expect(calculateBaseScore('largeStraight', [2, 3, 4, 5, 6])).toBe(40);
    expect(calculateBaseScore('largeStraight', [6, 4, 3, 5, 2])).toBe(40);
    expect(calculateBaseScore('largeStraight', [1, 2, 3, 4, 6])).toBe(0);
  });

  it('should correctly calculate yacht', () => {
    expect(calculateBaseScore('yacht', [5, 5, 5, 5, 5])).toBe(50);
    expect(calculateBaseScore('yacht', [5, 5, 5, 5, 6])).toBe(0);
  });
});

describe('scoreCalculator - Rebalanced Augments (Prismatic OP & Gold)', () => {
  const getAugment = (id: string) => ALL_AUGMENTS.find(a => a.id === id)!;

  it('yacht_apocalypse (Prismatic OP): should reward 100 pts for 4-of-a-kind and 150 pts for 5-of-a-kind', () => {
    const yachtGod = getAugment('yacht_apocalypse');
    // 4 matching dice (e.g. 5, 5, 5, 5, 2)
    expect(calculateAugmentedScore('yacht', [5, 5, 5, 5, 2], 3, [yachtGod])).toBe(100);
    // 5 matching dice (pure yacht)
    expect(calculateAugmentedScore('yacht', [5, 5, 5, 5, 5], 3, [yachtGod])).toBe(150);
    // 3 matching dice (should still be 0)
    expect(calculateAugmentedScore('yacht', [5, 5, 5, 2, 1], 3, [yachtGod])).toBe(0);
  });

  it('all_in_gambler (Prismatic OP): 1st roll gives 2.5x, 2nd roll gives 1.6x, 3rd roll has no penalty', () => {
    const gambler = getAugment('all_in_gambler');
    const fullHouseDice = [3, 3, 3, 6, 6]; // base score 25
    // 1st roll (rollsUsed = 1) -> 25 * 2.5 = 62.5 -> 63
    expect(calculateAugmentedScore('fullHouse', fullHouseDice, 1, [gambler])).toBe(63);
    // 2nd roll (rollsUsed = 2) -> 25 * 1.6 = 40
    expect(calculateAugmentedScore('fullHouse', fullHouseDice, 2, [gambler])).toBe(40);
    // 3rd roll (rollsUsed = 3) -> 25 * 1.0 = 25 (no penalty!)
    expect(calculateAugmentedScore('fullHouse', fullHouseDice, 3, [gambler])).toBe(25);
  });

  it('alchemy_transmute (Prismatic OP): transmutes all 1s and 2s into 6s', () => {
    const alchemy = getAugment('alchemy_transmute');
    expect(alchemy.modifyRolls!([1, 2, 3, 4, 5, 6])).toEqual([6, 6, 3, 4, 5, 6]);
  });

  it('straight_highway (Gold): gives 50 pts for smallStraight and 75 pts for largeStraight', () => {
    const highway = getAugment('straight_highway');
    expect(calculateAugmentedScore('smallStraight', [1, 2, 3, 4, 6], 3, [highway])).toBe(50);
    expect(calculateAugmentedScore('largeStraight', [1, 2, 3, 4, 5], 3, [highway])).toBe(75);
  });

  it('fullhouse_banquet (Gold): guarantees 45 pts for fullhouse and 1.5x for choice', () => {
    const banquet = getAugment('fullhouse_banquet');
    expect(calculateAugmentedScore('fullHouse', [2, 2, 2, 4, 4], 3, [banquet])).toBe(45);
    // choice sum = 20 -> 20 * 1.5 = 30
    expect(calculateAugmentedScore('choice', [4, 4, 4, 4, 4], 3, [banquet])).toBe(30);
  });
});

