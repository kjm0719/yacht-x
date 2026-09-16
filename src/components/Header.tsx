import React, { useState } from 'react';
import { LogOut, RotateCcw, HelpCircle, Dices, Flame, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { RulesModal } from './RulesModal';

interface HeaderProps {
  currentTurn: number;
  totalTurns: number;
  grandTotal: number;
  isSoloMode?: boolean;
  onResetGame: () => void;
  announcement?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTurn,
  totalTurns,
  grandTotal,
  isSoloMode = false,
  onResetGame,
  announcement,
}) => {
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="w-full flex flex-col gap-3 font-sans">
      <div className="w-full game-panel border-t-2 border-t-teal-400/80 rounded-3xl px-6 py-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        {/* Top Metallic Cyan Edge Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />
        
        {/* Logo and Subtitle */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-400 to-cyan-300 p-[2px] shadow-[0_0_20px_rgba(45,212,191,0.5)] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#070e1c] rounded-[14px] flex items-center justify-center">
              <Dices className="w-7 h-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-wider flex items-center gap-1.5">
                <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-md">YACHT</span>
                <span className="text-amber-400 text-xl font-mono">X</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]">ARAM</span>
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.25)]">
                SEASON 1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium tracking-tight">
              증강 시스템 결합 • 4인 동시 대전 엔진
            </p>
          </div>
        </div>

        {/* Turn & Score Stats */}
        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          {/* Turn Indicator */}
          <div className="flex flex-col items-center sm:items-end bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-inner">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              ROUND
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {String(currentTurn).padStart(2, '0')}
              </span>
              <span className="text-xs font-mono text-slate-500">
                / {totalTurns}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex flex-col items-center sm:items-end bg-gradient-to-b from-amber-950/50 to-slate-950/90 border border-amber-500/50 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span className="text-[9px] uppercase tracking-wider text-amber-300/80 font-bold font-mono">
              TOTAL SCORE
            </span>
            <span className="text-xl font-mono font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
              {grandTotal} <span className="text-xs font-normal text-slate-400">PTS</span>
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSound}
              title={isMuted ? '소리 켜기' : '소리 끄기'}
              className="p-2.5 rounded-xl btn-nexon-dark text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={() => setShowRules(true)}
              title="규칙 설명"
              className="p-2.5 rounded-xl btn-nexon-dark text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </button>
            <button
              type="button"
              onClick={() => {
                const msg = isSoloMode
                  ? '게임을 새로 시작하시겠습니까? 현재 진행 상황이 초기화됩니다.'
                  : '방을 나가시겠습니까? 현재 게임 진행이 종료됩니다.';
                if (window.confirm(msg)) {
                  onResetGame();
                }
              }}
              title={isSoloMode ? '게임 재시작' : '방 나가기'}
              className="p-2.5 rounded-xl btn-nexon-dark hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-all active:scale-95"
            >
              {isSoloMode ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <LogOut className="w-4 h-4 text-rose-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ticker / Announcement Bar */}
      {announcement && (
        <div className="w-full bg-[#081222]/90 border border-slate-800/90 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-200 shadow-md animate-in fade-in duration-200">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-medium">{announcement}</span>
        </div>
      )}

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </header>
  );
};
