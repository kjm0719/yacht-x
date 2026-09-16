import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ScoreCard } from '../types/game';
import type { Augment } from '../types/augment';
import { calculateTotalGameScore } from '../logic/scoreCalculator';
import { Trophy, RotateCcw, Sparkles, Award } from 'lucide-react';
import { AUGMENT_RARITY_COLORS } from '../constants/augments';

interface GameOverModalProps {
  isOpen: boolean;
  scoreCard: ScoreCard;
  activeAugments: Augment[];
  yachtBonusCount: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  scoreCard,
  activeAugments,
  yachtBonusCount,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = calculateTotalGameScore(scoreCard, activeAugments, yachtBonusCount);

  // Determine rank or evaluation tier based on final score
  let rankTier = '브론즈 티어';
  let rankColor = 'text-amber-600';
  let rankBadge = 'bg-amber-950/60 border-amber-700/50';
  if (stats.grandTotal >= 320) {
    rankTier = 'CHALLENGER (신화급 빌드)';
    rankColor = 'text-purple-300';
    rankBadge = 'bg-purple-950/80 border-purple-500/50 shadow-[0_0_15px_rgba(192,132,252,0.4)]';
  } else if (stats.grandTotal >= 260) {
    rankTier = 'DIAMOND (마스터)';
    rankColor = 'text-cyan-300';
    rankBadge = 'bg-cyan-950/80 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
  } else if (stats.grandTotal >= 200) {
    rankTier = 'PLATINUM (숙련자)';
    rankColor = 'text-teal-300';
    rankBadge = 'bg-teal-950/80 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]';
  } else if (stats.grandTotal >= 150) {
    rankTier = 'GOLD (우수 플레이어)';
    rankColor = 'text-amber-300';
    rankBadge = 'bg-amber-950/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="game-panel-gold border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(243,186,47,0.3)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow & Sparkles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-3 relative z-10">
          <div className="w-full h-full bg-[#120D04] rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1 relative z-10">
          전장 완료 (VICTORY)
        </h2>
        <p className="text-xs text-slate-300 mb-5 relative z-10">
          13턴의 치열한 주사위 승부와 증강 시너지가 완료되었습니다.
        </p>

        {/* Score Summary Card */}
        <div className="w-full bg-[#070e1c]/90 border border-amber-500/40 rounded-2xl p-5 mb-5 flex flex-col gap-3 relative z-10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">랭크 달성도</span>
            <span className={`text-xs font-mono font-black uppercase px-2.5 py-1 rounded-lg border ${rankColor} ${rankBadge}`}>
              {rankTier}
            </span>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">상단 족보 점수</span>
            <span className="font-mono font-bold text-slate-200">
              {stats.upperTotal}점 {stats.upperBonus > 0 && <span className="text-amber-400">(+{stats.upperBonus} 보너스)</span>}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">하단 특수 족보</span>
            <span className="font-mono font-bold text-slate-200">
              {yachtBonusCount > 0 ? stats.lowerTotal - stats.yachtBonus : stats.lowerTotal}점
            </span>
          </div>

          {yachtBonusCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Sparkles className="w-4 h-4" /> 야추 추가 보너스 (x{yachtBonusCount})
              </span>
              <span className="font-mono font-bold text-amber-400">+{stats.yachtBonus}점</span>
            </div>
          )}

          <div className="h-px bg-slate-800" />

          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-400" />
              최종 스코어
            </span>
            <span className="text-3xl font-mono font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]">
              {stats.grandTotal} <span className="text-sm font-normal text-slate-400">PTS</span>
            </span>
          </div>
        </div>

        {/* Selected Augments Build Review */}
        {activeAugments.length > 0 && (
          <div className="w-full mb-5 text-left relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>완성된 증강 빌드 ({activeAugments.length}개)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeAugments.map(aug => {
                const colors = AUGMENT_RARITY_COLORS[aug.rarity] || AUGMENT_RARITY_COLORS.silver;
                return (
                  <div
                    key={aug.id}
                    className={`px-3 py-2 rounded-xl border text-xs flex flex-col ${colors.bg} ${colors.border}`}
                  >
                    <span className="font-bold text-white">{aug.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">"{aug.tagline}"</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 rounded-2xl btn-nexon-gold text-slate-950 font-display font-black text-base tracking-wider flex items-center justify-center gap-2 relative z-10"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>새 게임 시작하기</span>
        </button>
      </div>
    </div>
  );
};
