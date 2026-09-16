import React, { useState } from 'react';
import { Dices, Volume2, VolumeX, HelpCircle, User, Edit3, Wifi } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { RulesModal } from './RulesModal';

interface LayoutProps {
  children: React.ReactNode;
  nickname: string;
  onEditNickname: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  nickname,
  onEditNickname,
}) => {
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [showRules, setShowRules] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Global Nexon Game Portal Top Navbar */}
      <header className="w-full border-b border-[#1A3357]/70 bg-[#050D1C]/90 backdrop-blur-xl sticky top-0 z-40 px-4 py-2.5 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Season Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-teal-400 to-cyan-300 p-[1.5px] shadow-[0_0_15px_rgba(45,212,191,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-[#070e1c] rounded-[9px] flex items-center justify-center">
                <Dices className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-wider text-white">
                YACHT <span className="text-amber-400 font-mono">X</span> <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">ARAM</span>
              </span>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 hidden sm:inline-block">
                SEASON 1
              </span>
            </div>
          </div>

          {/* Center Esports Status (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              KR-SEOUL ARENA
            </span>
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Wifi className="w-3 h-3 text-cyan-400" />
              12ms • 60 FPS
            </span>
          </div>

          {/* Right Action Icons & Summoner Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rules Trigger */}
            <button
              type="button"
              onClick={() => setShowRules(true)}
              title="게임 규칙 설명 보기"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1 text-xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-bold text-slate-300">룰북</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={isMuted ? '음소거 해제' : '음소거'}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all active:scale-95"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Pilot Profile Badge */}
            <button
              type="button"
              onClick={onEditNickname}
              title="닉네임 변경하기"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all group active:scale-95"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {nickname ? nickname.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-bold text-cyan-300 max-w-[90px] sm:max-w-[120px] truncate group-hover:text-cyan-200">
                {nickname || '플레이어'}
              </span>
              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Game View Container */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-start p-3 sm:p-6 relative z-10">
        {children}
      </main>

      {/* 3. Nexon/Esports Gaming Portal Footer */}
      <footer className="w-full border-t border-[#142642] bg-[#050B17]/95 backdrop-blur-md mt-10 py-6 px-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-display font-black text-sm text-slate-300">
                YACHT X ARAM
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v1.4.0 CLIENT
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              프리미엄 하이엔드 주사위 대전 • 실시간 4인 증강 대전 엔진
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              KR-SEOUL OPERATIONAL
            </span>
            <span>•</span>
            <span className="text-slate-500">ZERO LATENCY AUDIO</span>
            <span>•</span>
            <span className="text-slate-500">PRO RATED</span>
          </div>
        </div>
      </footer>

      {/* Global Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};
