import type { Die } from '../types/game';
import type { Augment } from '../types/augment';
import { DEFAULT_DICE_COUNT } from '../constants/rules';

export function createInitialDice(diceCount: number = DEFAULT_DICE_COUNT): Die[] {
  return Array.from({ length: diceCount }, (_, idx) => ({
    id: idx + 1,
    value: 1 + Math.floor(Math.random() * 6),
    isHeld: false,
  }));
}

export function rollDice(currentDice: Die[], activeAugments: Augment[]): Die[] {
  // 1. Roll unheld dice
  let newDice = currentDice.map(die => {
    if (die.isHeld) return die;
    return {
      ...die,
      value: 1 + Math.floor(Math.random() * 6),
    };
  });

  // 2. Apply any roll modifiers from active augments
  const rollModifiers = activeAugments.filter(a => a.modifyRolls);
  if (rollModifiers.length > 0) {
    const unheldIndices = newDice
      .map((d, i) => (!d.isHeld ? i : -1))
      .filter(i => i !== -1);
    
    let unheldValues = unheldIndices.map(i => newDice[i].value);

    for (const aug of rollModifiers) {
      if (aug.modifyRolls) {
        unheldValues = aug.modifyRolls(unheldValues);
      }
    }

    // Apply back
    newDice = newDice.map((d, i) => {
      const uIndex = unheldIndices.indexOf(i);
      if (uIndex !== -1) {
        return { ...d, value: unheldValues[uIndex] };
      }
      return d;
    });
  }

  return newDice;
}
