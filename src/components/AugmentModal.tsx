import React, { useState, useEffect } from 'react';
import type { Augment } from '../types/augment';
import { AUGMENT_RARITY_COLORS } from '../constants/augments';
import { sound } from '../utils/soundEffects';
import { 
  RotateCcw, 
  Dices, 
  Wand2, 
  Sparkles, 
  TrendingUp, 
  FastForward, 
  Crown, 
  Coins, 
  Flame, 
  Shield, 
  Cake, 
  Zap, 
  FlameKindling, 
  Skull,
  HelpCircle,
  Infinity as InfinityIcon
} from 'lucide-react';

interface AugmentModalProps {
  isOpen: boolean;
  candidates: Augment[];
  onSelectAugment: (augment: Augment) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  RotateCcw: <RotateCcw className="w-8 h-8" />,
  Dices: <Dices className="w-8 h-8" />,
  Wand2: <Wand2 className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  FastForward: <FastForward className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
  Coins: <Coins className="w-8 h-8" />,
  Flame: <Flame className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Cake: <Cake className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  FlameKindling: <FlameKindling className="w-8 h-8" />,
  Skull: <Skull className="w-8 h-8" />,
  Infinity: <InfinityIcon className="w-8 h-8" />,
};

export const AugmentModal: React.FC<AugmentModalProps> = ({
  isOpen,
  candidates,
  onSelectAugment,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) setSelectedId(null);
  }, [isOpen]);

  const handleSelect = (augment: Augment) => {
    if (selectedId) return; // Prevent double click during animation
    setSelectedId(augment.id);
    setTimeout(() => {
      onSelectAugment(augment);
      setSelectedId(null);
    }, 600); // Matches animation duration
  };

  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl flex flex-col items-center">
        {/* Header */}
        <div className={`text-center mb-8 transition-opacity duration-300 ${selectedId ? 'opacity-0' : 'opacity-100'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-[0_0_20px_rgba(20,184,166,0.35)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            AUGMENT SELECTION PHASE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            증강을 선택하십시오
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto font-medium">
            선택한 증강은 게임 종료 시까지 영구 지속되며 주사위 메커니즘과 점수 배율을 대폭 강화합니다.
          </p>
        </div>

        {/* 3 Augment Cards Grid */}
        <div className="group/container grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2">
          {candidates.map((aug, idx) => {
            const colors = AUGMENT_RARITY_COLORS[aug.rarity] || AUGMENT_RARITY_COLORS.silver;
            const icon = ICON_MAP[aug.iconName] || <HelpCircle className="w-8 h-8" />;

            const rarityLabel = {
              silver: '실버 (SILVER)',
              gold: '골드 (GOLD)',
              prismatic: '프리즘 (PRISMATIC)',
            }[aug.rarity];

            const buttonClass = {
              prismatic: 'btn-nexon-purple text-white',
              gold: 'btn-nexon-gold text-slate-950',
              silver: 'btn-nexon-teal text-slate-950',
            }[aug.rarity] || 'btn-nexon-teal text-slate-950';

            return (
              <div
                key={aug.id}
                onClick={() => handleSelect(aug)}
                onMouseEnter={() => sound.playAugmentHover()}
                style={{ animationDelay: `${idx * 150}ms` }}
                className={`relative flex flex-col justify-between rounded-3xl border-2 p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform 
                  ${selectedId === null ? 'animate-augment-enter hover:-translate-y-2.5 hover:scale-[1.04] hover:opacity-100 hover:z-20 group-hover/container:[&:not(:hover)]:scale-[0.96] group-hover/container:[&:not(:hover)]:opacity-70' : ''} 
                  ${selectedId === aug.id ? 'animate-augment-select z-30' : ''}
                  ${selectedId && selectedId !== aug.id ? 'animate-augment-discard pointer-events-none' : ''}
                  group/card ${colors.bg} ${colors.border} ${colors.glow} shadow-2xl overflow-hidden`}
              >
                {/* Top Corner Metallic Flare */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className={`text-[11px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${colors.badge}`}>
                    {rarityLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {aug.category === 'dice' && '주사위 조작'}
                    {aug.category === 'multiplier' && '점수 배율'}
                    {aug.category === 'special' && '조건부 특수'}
                    {aug.category === 'risk' && '하이리스크'}
                  </span>
                </div>

                {/* Center Icon & Title */}
                <div className="flex flex-col items-center text-center my-3 relative z-10">
                  <div className={`p-4 rounded-2xl mb-4 border transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:scale-110 shadow-lg ${colors.badge}`}>
                    {icon}
                  </div>
                  <h3 className="text-xl font-black font-display text-white mb-1.5 group-hover/card:text-amber-200 transition-colors duration-300 tracking-tight">
                    {aug.name}
                  </h3>
                  <span className="text-xs italic text-amber-300/80 mb-4 font-medium">
                    "{aug.tagline}"
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal bg-black/50 rounded-2xl p-3.5 border border-white/10 w-full min-h-[64px] flex items-center justify-center">
                    {aug.description}
                  </p>
                </div>

                {/* Select Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(aug);
                  }}
                  disabled={selectedId !== null}
                  className={`w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-wider mt-4 disabled:opacity-50 relative z-10 ${buttonClass}`}
                >
                  {selectedId === aug.id ? '선택 완료!' : '특성 장착'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
