import React, { useState } from 'react';
import type { Die } from '../types/game';
import type { Augment } from '../types/augment';
import { Lock, Unlock, Wand2, Dices, RotateCcw } from 'lucide-react';

interface DiceAreaProps {
  dice: Die[];
  rollsLeft: number;
  maxRolls: number;
  isRolling: boolean;
  onToggleHold: (index: number) => void;
  onRoll: () => void;
  activeAugments: Augment[];
  wildcardUsedThisTurn: boolean;
  onUseWildcard: (index: number, value: number) => void;
}

/**
 * 3x3 Grid based realistic dice face
 */
const DieFace: React.FC<{ value: number; isRolling?: boolean }> = ({ value, isRolling }) => {
  const [displayValue, setDisplayValue] = useState(value);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 60);
    } else {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  // 3x3 positions for dots: row 1-3, col 1-3
  // index 0: (1,1), 1: (1,2), 2: (1,3), 3: (2,1), 4: (2,2), 5: (2,3), 6: (3,1), 7: (3,2), 8: (3,3)
  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeDots = dotPositions[displayValue] || [4];
  const isRed = displayValue === 1;

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 sm:w-14 sm:h-14 p-1 sm:p-1.5 gap-0.5 sm:gap-1 items-center justify-items-center">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="w-full h-full flex items-center justify-center">
          {activeDots.includes(idx) && (
            <div
              className={`rounded-full shadow-inner flex-shrink-0 ${
                isRed 
                  ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-500 shadow-red-700' 
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-800 shadow-slate-900'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const DiceArea: React.FC<DiceAreaProps> = ({
  dice,
  rollsLeft,
  maxRolls,
  isRolling,
  onToggleHold,
  onRoll,
  activeAugments,
  wildcardUsedThisTurn,
  onUseWildcard,
}) => {
  const [selectedWildcardDie, setSelectedWildcardDie] = useState<number | null>(null);
  const hasWildcardAugment = activeAugments.some(a => a.wildcardAllowed);

  return (
    <div className="game-panel border-t-2 border-t-teal-400/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center font-sans">
      {/* Upper Status & Rolls Counter */}
      <div className="w-full flex items-center justify-between mb-4 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <span className="text-sm font-black text-white tracking-wider uppercase font-display">
            주사위 존 ({dice.length}개)
          </span>
        </div>

        {/* Rolls Left Energy Badges */}
        <div className="flex items-center gap-2.5 bg-slate-950/70 border border-slate-800/90 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">재굴림 게이지:</span>
          <div className="flex gap-1.5">
            {Array.from({ length: maxRolls }).map((_, idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  idx < rollsLeft
                    ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-mono font-black text-cyan-300 ml-1">
            {rollsLeft} / {maxRolls}
          </span>
        </div>
      </div>

      {/* Dice Grid Container */}
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 my-4 min-h-[130px]" style={{ perspective: '1000px' }}>
        {dice.length === 0 ? (
          <button
            type="button"
            onClick={onRoll}
            disabled={isRolling}
            className="btn-nexon-teal px-10 py-5 rounded-2xl text-slate-950 font-display font-black text-2xl tracking-wider shadow-2xl flex items-center gap-3 disabled:opacity-50"
          >
            <RotateCcw className={`w-7 h-7 ${isRolling ? 'animate-spin' : ''}`} />
            {isRolling ? '주사위 굴리는 중...' : '주사위 굴리기 (첫 굴림)'}
          </button>
        ) : (
          dice.map((die, idx) => {
            const isHeld = die.isHeld;
            return (
              <div key={die.id} className="relative flex flex-col items-center gap-2 group">
              {/* Die Box */}
              <button
                type="button"
                onClick={() => onToggleHold(idx)}
                disabled={isRolling}
                className={`relative rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] 
                  transition-all duration-150 ease-out cursor-pointer transform select-none
                  ${isHeld 
                    ? 'dice-held brightness-90 translate-y-1 ring-2 ring-cyan-400' 
                    : 'dice-face hover:-translate-y-1.5 hover:shadow-[0_12px_0_#cbd5e1,0_18px_24px_rgba(0,0,0,0.5)]'}
                  ${isRolling && !isHeld ? 'animate-dice-roll' : ''}
                  ${rollsLeft === 0 ? 'opacity-90' : ''}
                `}
                title={isHeld ? '클릭하여 잠금 해제' : '클릭하여 주사위 잠금(홀드)'}
              >
                <DieFace value={die.value} isRolling={isRolling && !isHeld} />

                {/* Held Badge Indicator */}
                {isHeld && (
                  <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 rounded-full p-1 shadow-lg shadow-cyan-500/50">
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </button>

              {/* Hold label */}
              <button
                type="button"
                onClick={() => onToggleHold(idx)}
                disabled={isRolling || rollsLeft === 0}
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                  isHeld
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isHeld ? (
                  <>
                    <Lock className="w-3 h-3 text-cyan-400" /> 잠금됨
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 opacity-60" /> 홀드
                  </>
                )}
              </button>

              {/* Wildcard selector button if augment enabled */}
              {hasWildcardAugment && !wildcardUsedThisTurn && (
                <button
                  type="button"
                  onClick={() => setSelectedWildcardDie(selectedWildcardDie === idx ? null : idx)}
                  className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-sm transition-all active:scale-95"
                >
                  <Wand2 className="w-3 h-3 text-amber-400" /> 숫자 변경
                </button>
              )}

              {/* Wildcard Value Picker Popup */}
              {selectedWildcardDie === idx && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 bg-slate-950 border-2 border-amber-400 rounded-xl p-2 shadow-2xl flex gap-1 animate-in fade-in zoom-in-90 duration-150">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        onUseWildcard(idx, num);
                        setSelectedWildcardDie(null);
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-400 hover:text-slate-950 font-black text-sm text-slate-100 transition-colors shadow-md active:scale-90"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>

      {/* Action Buttons & Roll Controls */}
      <div className="w-full mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[64px]">
        <div className="text-xs text-slate-400 font-medium">
          {dice.length > 0 ? (
            <>💡 <span className="text-cyan-300 font-bold">보관할 주사위를 클릭</span>하여 잠근 뒤, 다시 굴리기 버튼을 누르세요.</>
          ) : (
            <>💡 먼저 주사위를 굴려주세요.</>
          )}
        </div>

        {dice.length > 0 && (
          <button
            type="button"
            onClick={onRoll}
            disabled={rollsLeft <= 0 || isRolling}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-display font-black text-base tracking-wider flex items-center justify-center gap-2.5 transition-all ${
              rollsLeft > 0 && !isRolling
                ? 'btn-nexon-teal text-slate-950'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <RotateCcw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? '주사위 굴리는 중...' : `주사위 재굴림 (${rollsLeft}회 남음)`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
