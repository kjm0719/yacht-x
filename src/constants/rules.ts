import type { ScoreCategory, UpperCategory, LowerCategory } from '../types/game';

export const TOTAL_TURNS = 13;
export const DEFAULT_MAX_ROLLS = 3;
export const DEFAULT_DICE_COUNT = 5;
export const DEFAULT_UPPER_BONUS_THRESHOLD = 63;
export const DEFAULT_UPPER_BONUS_SCORE = 35;

export interface CategoryMeta {
  id: ScoreCategory;
  name: string;
  nameEn: string;
  description: string;
  section: 'upper' | 'lower';
  example: string;
}

export const CATEGORIES_META: CategoryMeta[] = [
  {
    id: 'aces',
    name: '에이스 (1)',
    nameEn: 'Aces',
    description: '1의 눈의 합',
    section: 'upper',
    example: '⚀ x 개수'
  },
  {
    id: 'twos',
    name: '듀스 (2)',
    nameEn: 'Twos',
    description: '2의 눈의 합',
    section: 'upper',
    example: '⚁ x 개수'
  },
  {
    id: 'threes',
    name: '쓰리 (3)',
    nameEn: 'Threes',
    description: '3의 눈의 합',
    section: 'upper',
    example: '⚂ x 개수'
  },
  {
    id: 'fours',
    name: '포 (4)',
    nameEn: 'Fours',
    description: '4의 눈의 합',
    section: 'upper',
    example: '⚃ x 개수'
  },
  {
    id: 'fives',
    name: '파이브 (5)',
    nameEn: 'Fives',
    description: '5의 눈의 합',
    section: 'upper',
    example: '⚄ x 개수'
  },
  {
    id: 'sixes',
    name: '식스 (6)',
    nameEn: 'Sixes',
    description: '6의 눈의 합',
    section: 'upper',
    example: '⚅ x 개수'
  },
  // Lower Section
  {
    id: 'choice',
    name: '초이스',
    nameEn: 'Choice',
    description: '조건 없음. 모든 주사위 눈의 총합',
    section: 'lower',
    example: '주사위 전체 합'
  },
  {
    id: 'threeOfAKind',
    name: '트리플',
    nameEn: '3 of a Kind',
    description: '같은 눈 3개 이상일 때 모든 주사위의 총합',
    section: 'lower',
    example: '⚂⚂⚂ 포함 시 전체 합'
  },
  {
    id: 'fourOfAKind',
    name: '포카드',
    nameEn: '4 of a Kind',
    description: '같은 눈 4개 이상일 때 모든 주사위의 총합',
    section: 'lower',
    example: '⚃⚃⚃⚃ 포함 시 전체 합'
  },
  {
    id: 'fullHouse',
    name: '풀하우스',
    nameEn: 'Full House',
    description: '같은 눈 3개 + 같은 눈 2개일 때 고정 25점',
    section: 'lower',
    example: '⚄⚄⚄ + ⚁⚁ = 25점'
  },
  {
    id: 'smallStraight',
    name: '스몰 스트레이트',
    nameEn: 'Small Straight',
    description: '연속된 4개 이상의 주사위 눈 (고정 30점)',
    section: 'lower',
    example: '1-2-3-4 / 2-3-4-5 / 3-4-5-6'
  },
  {
    id: 'largeStraight',
    name: '라지 스트레이트',
    nameEn: 'Large Straight',
    description: '연속된 5개의 주사위 눈 (고정 40점)',
    section: 'lower',
    example: '1-2-3-4-5 / 2-3-4-5-6'
  },
  {
    id: 'yacht',
    name: '야추 (Yacht)',
    nameEn: 'Yacht',
    description: '5개 주사위 눈이 모두 동일할 때 (고정 50점)',
    section: 'lower',
    example: '⚅⚅⚅⚅⚅ (50점)'
  },
];

export const UPPER_CATEGORIES: UpperCategory[] = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'];
export const LOWER_CATEGORIES: LowerCategory[] = [
  'choice',
  'threeOfAKind',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht'
];
