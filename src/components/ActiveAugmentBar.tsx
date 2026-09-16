import React from 'react';
import type { Augment } from '../types/augment';
import { Sparkles, Layers, Zap } from 'lucide-react';
import { AUGMENT_RARITY_COLORS } from '../constants/augments';

interface ActiveAugmentBarProps {
  activeAugments: Augment[];
}

export const ActiveAugmentBar: React.FC<ActiveAugmentBarProps> = ({ activeAugments }) => {
  if (activeAugments.length === 0) {
    return (
      <div className="w-full game-panel rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400 border-teal-500/30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-300">장착된 증강: 없음</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          매 2턴마다 (3, 5, 7, 9, 11, 13턴) 3지선다 증강 획득 기회가 주어집니다.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full game-panel border-t-2 border-t-teal-400/50 rounded-2xl p-3.5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-black font-display text-white uppercase tracking-wider block">
            활성 증강 덱
          </span>
          <span className="text-[10px] font-mono text-teal-300">
            {activeAugments.length} / 7 SLOT ACTIVE
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeAugments.map((aug) => {
          const colors = AUGMENT_RARITY_COLORS[aug.rarity] || AUGMENT_RARITY_COLORS.silver;
          return (
            <div
              key={aug.id}
              className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm ${colors.badge}`}
            >
              <Zap className="w-3 h-3 text-current opacity-80" />
              <span>{aug.name}</span>

              {/* Hover Tooltip Card */}
              <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col z-40 w-64 p-3.5 bg-[#08101E] border border-cyan-500/40 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] text-slate-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-black text-xs text-white">
                    {aug.name}
                  </span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${colors.badge}`}>
                    {aug.rarity}
                  </span>
                </div>
                <span className="text-[10px] italic text-amber-300/90 mb-1.5 block">
                  "{aug.tagline}"
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  {aug.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
