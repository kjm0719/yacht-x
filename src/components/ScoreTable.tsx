import React from 'react';
import type { ScoreCategory, ScoreCard, Die } from '../types/game';
import type { Augment } from '../types/augment';
import { 
  CATEGORIES_META, 
  UPPER_CATEGORIES, 
  LOWER_CATEGORIES 
} from '../constants/rules';
import { 
  calculateAugmentedScore, 
  calculateTotalGameScore 
} from '../logic/scoreCalculator';
import { CheckCircle2, Award, Sparkles } from 'lucide-react';

interface ScoreTableProps {
  scoreCard: ScoreCard;
  dice: Die[];
  rollsUsed: number;
  activeAugments: Augment[];
  yachtBonusCount: number;
  onSelectScore: (category: ScoreCategory) => void;
  isRolling: boolean;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  scoreCard,
  dice,
  rollsUsed,
  activeAugments,
  yachtBonusCount,
  onSelectScore,
  isRolling,
}) => {
  const diceValues = dice.map(d => d.value);
  const totalStats = calculateTotalGameScore(scoreCard, activeAugments, yachtBonusCount);
  const isBonusAchieved = totalStats.upperBonus > 0;
  const upperProgress = Math.min(100, Math.round((totalStats.upperTotal / totalStats.threshold) * 100));

  const renderCategoryRow = (categoryId: ScoreCategory) => {
    const meta = CATEGORIES_META.find(m => m.id === categoryId);
    if (!meta) return null;

    const isFilled = scoreCard[categoryId] !== undefined;
    const filledScore = scoreCard[categoryId];

    // Calculate preview score with current dice and active augments
    const previewScore = calculateAugmentedScore(
      categoryId,
      diceValues,
      rollsUsed,
      activeAugments
    );

    const isSpecialCombo = !isFilled && previewScore > 0 && (
      (categoryId === 'yacht' && previewScore >= 50) ||
      (categoryId === 'largeStraight' && previewScore >= 40) ||
      (categoryId === 'fullHouse' && previewScore >= 25)
    );

    return (
      <tr
        key={categoryId}
        onClick={() => {
          if (!isFilled && !isRolling && dice.length > 0) {
            onSelectScore(categoryId);
          }
        }}
        className={`group transition-all duration-150 border-b border-slate-800/80 ${
          isFilled
            ? 'bg-slate-900/40 opacity-75 cursor-default'
            : dice.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : isSpecialCombo
            ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40 cursor-pointer shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]'
            : 'hover:bg-teal-950/30 cursor-pointer'
        }`}
      >
        {/* Name and Description */}
        <td className="py-2.5 px-3">
          <div className="flex flex-col">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${
              isFilled
                ? 'text-slate-400'
                : isSpecialCombo
                ? 'text-amber-300 font-bold'
                : 'text-slate-100 group-hover:text-teal-300'
            }`}>
              {meta.name}
              {isFilled && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 inline" />}
              {isSpecialCombo && (
                <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  HIT!
                </span>
              )}
            </span>
            <span className="text-[11px] text-slate-500">{meta.description}</span>
          </div>
        </td>

        {/* Score Column */}
        <td className="py-2.5 px-3 text-right">
          {isFilled ? (
            <span className={`text-base font-mono font-bold ${
              filledScore === 0 ? 'text-rose-400' : 'text-teal-300'
            }`}>
              {filledScore}점
            </span>
          ) : dice.length === 0 ? (
            <span className="text-[11px] font-mono text-slate-600 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              대기
            </span>
          ) : (
            <button
              type="button"
              disabled={isRolling}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                isSpecialCombo
                  ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-105'
                  : previewScore > 0
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 group-hover:bg-teal-500 group-hover:text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 group-hover:bg-slate-700 group-hover:text-slate-300'
              }`}
            >
              +{previewScore}
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="game-panel border-t-2 border-t-amber-400/60 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 font-sans">
      {/* Title & Total Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <h2 className="text-lg font-black text-white flex items-center gap-2 font-display tracking-wider">
          <Award className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span>점수 기록표 (SCORE SHEET)</span>
        </h2>
        <div className="flex items-center gap-2.5 bg-gradient-to-b from-amber-950/40 to-slate-950/80 border border-amber-500/40 px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">현재 총점</span>
          <span className="text-xl font-mono font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
            {totalStats.grandTotal} <span className="text-xs font-normal text-slate-400">PTS</span>
          </span>
        </div>
      </div>

      {/* Tables Grid Layout (Upper & Lower Side by Side or Stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upper Section */}
        <div className="flex flex-col bg-[#0A1424]/80 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-display">
              상단 섹션 (UPPER NUMBERS)
            </span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
              소계: <b className="text-cyan-400">{totalStats.upperTotal}</b> / {totalStats.threshold}
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody>
              {UPPER_CATEGORIES.map(cat => renderCategoryRow(cat))}
            </tbody>
          </table>

          {/* Upper Bonus Progress & Reward */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                상단 보너스 (+{totalStats.bonusReward}점)
              </span>
              <span className={`font-mono font-bold ${
                isBonusAchieved ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-400'
              }`}>
                {isBonusAchieved ? `보너스 획득 완료! (+${totalStats.bonusReward}점)` : `${totalStats.upperTotal} / ${totalStats.threshold}점`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBonusAchieved 
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_#f59e0b]' 
                    : 'bg-gradient-to-r from-teal-500 to-cyan-400'
                }`}
                style={{ width: `${upperProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lower Section */}
        <div className="flex flex-col bg-[#0A1424]/80 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-display">
              하단 섹션 (SPECIAL COMBOS)
            </span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
              소계: <b className="text-cyan-400">{totalStats.lowerTotal}</b> PTS
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody>
              {LOWER_CATEGORIES.map(cat => renderCategoryRow(cat))}
            </tbody>
          </table>

          {yachtBonusCount > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-amber-500/40 flex items-center justify-between bg-amber-950/20 px-3 py-2 rounded-xl">
              <span className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-spin" /> 야추 추가 보너스 (+100x{yachtBonusCount})
              </span>
              <span className="text-sm font-black text-amber-300 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                +{totalStats.yachtBonus} PTS
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
