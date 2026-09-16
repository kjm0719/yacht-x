export type AugmentRarity = 'silver' | 'gold' | 'prismatic';

export type AugmentCategory = 'dice' | 'multiplier' | 'special' | 'risk';

export type AugmentTrigger = 'passive' | 'onRoll' | 'onScore' | 'conditional';

export interface Augment {
  id: string;
  name: string;
  tagline: string;
  description: string;
  rarity: AugmentRarity;
  category: AugmentCategory;
  iconName: string; // lucide icon identifier
  
  // Custom modifiers / handlers
  extraRolls?: number; // e.g. +1 roll per turn
  extraDice?: number; // e.g. +1 extra die (play with 6 dice)
  bonusThreshold?: number; // e.g. upper bonus threshold relaxed from 63 to 50
  bonusReward?: number; // upper bonus score amount (default 35)
  wildcardAllowed?: boolean; // can change one die per turn
  
  // Custom score calculation hook
  modifyScore?: (
    baseScore: number,
    category: string,
    diceValues: number[],
    rollsUsed: number,
    allAugments: Augment[]
  ) => number;

  // Custom roll modifier hook (e.g. transmute 1s to 5/6, or weighted 6s)
  modifyRolls?: (diceValues: number[]) => number[];
}
