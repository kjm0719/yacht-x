import type { Augment, AugmentRarity } from '../types/augment';

export const ALL_AUGMENTS: Augment[] = [
  // ==========================================
  // 1. 주사위 조작계 (Dice Manipulation)
  // ==========================================
  {
    id: 'extra_roll',
    name: '신속한 손재주',
    tagline: '굴릴수록 기회는 늘어난다',
    description: '매 턴 기본 재굴림 횟수가 1회 증가합니다. (기본 3회 → 4회)',
    rarity: 'silver',
    category: 'dice',
    iconName: 'RotateCcw',
    extraRolls: 1,
  },
  {
    id: 'sixth_dice',
    name: '여분의 주사위',
    tagline: '주사위가 많으면 족보도 쉬워진다',
    description: '영구적으로 주사위 개수가 1개 추가됩니다. (5개 → 6개로 플레이)',
    rarity: 'gold',
    category: 'dice',
    iconName: 'Dices',
    extraDice: 1,
  },
  {
    id: 'wildcard_touch',
    name: '운명의 조작',
    tagline: '원하는 숫자를 쥐어뜯어 만든다',
    description: '턴당 1회, 주사위 1개를 원하는 눈(1~6)으로 직접 변경할 수 있습니다.',
    rarity: 'gold',
    category: 'dice',
    iconName: 'Wand2',
    wildcardAllowed: true,
  },
  {
    id: 'alchemy_transmute',
    name: '연금술사의 연마',
    tagline: '천대받는 1과 2를 황금 6으로 바꾼다',
    description: '주사위를 굴릴 때 1 또는 2의 눈이 나오면 무조건 6의 눈으로 변환됩니다!',
    rarity: 'prismatic',
    category: 'dice',
    iconName: 'Sparkles',
    modifyRolls: (values: number[]) => {
      return values.map(v => (v === 1 || v === 2 ? 6 : v));
    }
  },
  {
    id: 'infinite_dimension',
    name: '무한의 차원',
    tagline: '주사위가 쏟아져 내린다',
    description: '영구적으로 주사위 개수가 2개 추가됩니다! (기본 5개 → 총 7개로 플레이)',
    rarity: 'prismatic',
    category: 'dice',
    iconName: 'Infinity',
    extraDice: 2,
  },

  // ==========================================
  // 2. 점수 배율계 (Score Multipliers)
  // ==========================================
  {
    id: 'upper_soft',
    name: '실속파 모임',
    tagline: '상단 보너스가 이렇게 쉬웠나?',
    description: '상단 보너스 요구치가 63점에서 50점으로 대폭 완화되며, 보너스 점수가 40점으로 증가합니다.',
    rarity: 'silver',
    category: 'multiplier',
    iconName: 'TrendingUp',
    bonusThreshold: 50,
    bonusReward: 40,
  },
  {
    id: 'straight_highway',
    name: '스트레이트 고속도로',
    tagline: '줄세우기의 달인',
    description: '스몰 스트레이트(50점)와 라지 스트레이트(75점) 점수가 파격적으로 대폭 상승합니다!',
    rarity: 'gold',
    category: 'multiplier',
    iconName: 'FastForward',
    modifyScore: (baseScore, category) => {
      if (category === 'smallStraight' && baseScore > 0) return 50;
      if (category === 'largeStraight' && baseScore > 0) return 75;
      return baseScore;
    }
  },
  {
    id: 'yacht_apocalypse',
    name: '야추의 강림',
    tagline: '포카드만 나와도 야추의 권능이 깃든다',
    description: '야추(Yacht) 성공 시 150점을 획득하며, 4개만 일치(포카드)해도 야추(100점)로 자동 인정됩니다!',
    rarity: 'prismatic',
    category: 'multiplier',
    iconName: 'Crown',
    modifyScore: (baseScore, category, diceValues) => {
      if (category === 'yacht') {
        const counts: Record<number, number> = {};
        diceValues.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        const maxCount = Math.max(0, ...Object.values(counts));
        if (maxCount >= 5) {
          return 150; // 5개 일치 진 야추
        } else if (maxCount >= 4) {
          return 100; // 4개만 일치해도 야추 100점!
        }
      }
      return baseScore;
    }
  },
  {
    id: 'golden_sixes',
    name: '황금빛 6',
    tagline: '6이 가장 강한 법이지',
    description: '식스(6) 족보를 채울 때 점수가 1.8배로 계산되며, 다른 족보에서도 주사위 6 하나당 +4점 보너스를 받습니다.',
    rarity: 'gold',
    category: 'multiplier',
    iconName: 'Coins',
    modifyScore: (baseScore, category, diceValues) => {
      if (baseScore === 0) return 0;
      if (category === 'sixes') {
        return Math.round(baseScore * 1.8);
      }
      const sixCount = diceValues.filter(v => v === 6).length;
      return baseScore + (sixCount * 4);
    }
  },

  // ==========================================
  // 3. 조건부 특수계 (Conditional / Specials)
  // ==========================================
  {
    id: 'odd_fever',
    name: '홀수 열풍',
    tagline: '홀수가 모이면 힘이 된다',
    description: '족보 점수 등록 시 주사위에 포함된 홀수(1, 3, 5) 1개당 최종 점수에 +3점의 추가 보너스를 얻습니다.',
    rarity: 'silver',
    category: 'special',
    iconName: 'Flame',
    modifyScore: (baseScore, _, diceValues) => {
      if (baseScore === 0) return 0;
      const oddCount = diceValues.filter(v => v % 2 !== 0).length;
      return baseScore + (oddCount * 3);
    }
  },
  {
    id: 'even_harmony',
    name: '짝수의 조화',
    tagline: '안정적인 짝수들의 시너지',
    description: '족보 점수 등록 시 주사위에 포함된 짝수(2, 4, 6) 1개당 최종 점수에 +3점의 추가 보너스를 얻습니다.',
    rarity: 'silver',
    category: 'special',
    iconName: 'Shield',
    modifyScore: (baseScore, _, diceValues) => {
      if (baseScore === 0) return 0;
      const evenCount = diceValues.filter(v => v % 2 === 0).length;
      return baseScore + (evenCount * 3);
    }
  },
  {
    id: 'fullhouse_banquet',
    name: '풍요로운 연회',
    tagline: '가족이 모이면 축제가 열린다',
    description: '풀하우스 기본 점수가 45점으로 고정 증가하며, 초이스(Choice) 점수도 1.5배 대폭 상승합니다.',
    rarity: 'gold',
    category: 'special',
    iconName: 'Cake',
    modifyScore: (baseScore, category) => {
      if (category === 'fullHouse' && baseScore > 0) {
        return Math.max(baseScore, 45);
      }
      if (category === 'choice' && baseScore > 0) {
        return Math.round(baseScore * 1.5);
      }
      return baseScore;
    }
  },
  {
    id: 'chain_reaction',
    name: '연쇄 폭발',
    tagline: '트리플과 포카드의 파괴력',
    description: '트리플(3 of a Kind) 및 포카드(4 of a Kind) 달성 시 기본 점수에 +15점의 고정 폭발 보너스가 더해집니다.',
    rarity: 'silver',
    category: 'special',
    iconName: 'Zap',
    modifyScore: (baseScore, category) => {
      if ((category === 'threeOfAKind' || category === 'fourOfAKind') && baseScore > 0) {
        return baseScore + 15;
      }
      return baseScore;
    }
  },

  // ==========================================
  // 4. 리스크-리워드계 (Risk & Reward)
  // ==========================================
  {
    id: 'all_in_gambler',
    name: '잭팟 승부사',
    tagline: '첫 굴림에 걸면 상상을 초월하는 잭팟이 터진다',
    description: '첫 굴림(재굴림 0회)으로 확정 시 점수 2.5배 잭팟! 재굴림 1회로 확정 시 1.6배를 받습니다. (3회 굴려도 패널티 없음)',
    rarity: 'prismatic',
    category: 'risk',
    iconName: 'FlameKindling',
    modifyScore: (baseScore, _, __, rollsUsed) => {
      if (baseScore === 0) return 0;
      // rollsUsed: 1 (첫 굴림 확정), 2 (재굴림 1회), >=3 (재굴림 2회 이상)
      if (rollsUsed === 1) {
        return Math.round(baseScore * 2.5); // 첫 굴림 2.5배 잭팟!
      } else if (rollsUsed === 2) {
        return Math.round(baseScore * 1.6); // 재굴림 1회 1.6배
      }
      return baseScore; // 3회 이상은 패널티 없이 100% 정상 지급
    }
  },
  {
    id: 'high_roller_curse',
    name: '도박사의 맹세',
    tagline: '모든 것을 걸어라',
    description: '모든 족보의 획득 점수가 1.35배로 대폭 상승합니다. 단, 족보를 0점으로 버릴 경우(찬물) 즉시 총점에서 -8점 차감됩니다.',
    rarity: 'gold',
    category: 'risk',
    iconName: 'Skull',
    modifyScore: (baseScore) => {
      if (baseScore === 0) return -8; // 0점 버리기 시 -8점 패널티
      return Math.round(baseScore * 1.35);
    }
  }
];

export const AUGMENT_RARITY_COLORS: Record<AugmentRarity, { bg: string; border: string; text: string; badge: string; glow: string }> = {
  silver: {
    bg: 'bg-slate-900/90',
    border: 'border-slate-400',
    text: 'text-slate-200',
    badge: 'bg-slate-700 text-slate-200 border-slate-400',
    glow: 'hover:border-slate-300 hover:shadow-slate-400/30'
  },
  gold: {
    bg: 'bg-amber-950/80',
    border: 'border-amber-400',
    text: 'text-amber-200',
    badge: 'bg-amber-800 text-amber-100 border-amber-400',
    glow: 'hover:border-amber-300 hover:shadow-amber-400/50'
  },
  prismatic: {
    bg: 'bg-purple-950/80',
    border: 'border-purple-400',
    text: 'text-purple-200',
    badge: 'bg-purple-800 text-purple-100 border-purple-400',
    glow: 'hover:border-purple-300 hover:shadow-purple-400/60'
  }
};
