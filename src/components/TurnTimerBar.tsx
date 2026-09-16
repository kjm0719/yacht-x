import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface TurnTimerBarProps {
  turnTimeLimit?: number; // Total seconds per turn (default 45)
  currentTurn: number;
  isActive: boolean;
  onTimeout?: () => void;
}

export const TurnTimerBar: React.FC<TurnTimerBarProps> = ({
  turnTimeLimit = 45,
  currentTurn,
  isActive,
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(turnTimeLimit);
  const warnedRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // Reset timer on turn change or when active status starts
  useEffect(() => {
    setTimeLeft(turnTimeLimit);
    warnedRef.current = false;
  }, [currentTurn, isActive, turnTimeLimit]);

  // 1-second countdown ticker
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeoutRef.current) {
            onTimeoutRef.current();
          }
          return 0;
        }

        const next = prev - 1;

        // Sound Triggers
        if (next === 10 && !warnedRef.current) {
          warnedRef.current = true;
          sound.playTimerWarning();
        } else if (next < 10 && next > 0) {
          sound.playUrgentTick(next);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentTurn]);

  if (!isActive) return null;

  const isDanger = timeLeft <= 10;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / turnTimeLimit) * 100));

  return (
    <div
      className={`w-full game-panel rounded-2xl px-4 py-3 shadow-xl transition-all duration-300 ${
        isDanger
          ? 'border-2 border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
          : 'border-teal-500/40'
      }`}
    >
      {/* Upper Status & Numerical Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock
            className={`w-4 h-4 transition-colors ${
              isDanger ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
            }`}
          />
          <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-300">
            턴 제한 시간
          </span>
          {isDanger && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              제한 시간 임박!
            </span>
          )}
        </div>

        {/* Digital Countdown Number */}
        <div className="flex items-baseline gap-1">
          <span
            className={`text-lg font-mono font-black tracking-widest transition-colors ${
              isDanger
                ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse text-xl'
                : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
            }`}
          >
            {String(timeLeft).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-mono text-slate-400">/ {turnTimeLimit}초</span>
        </div>
      </div>

      {/* Progress Bar Groove with Tick Mark Subdivisions */}
      <div className="w-full h-3 bg-slate-950/90 rounded-full p-[2px] border border-slate-800 relative overflow-hidden">
        {/* Subtle grid background markings */}
        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
        </div>

        {/* Draining Fill Bar */}
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isDanger
              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 shadow-[0_0_15px_#f43f5e]'
              : 'bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 shadow-[0_0_10px_#22d3ee]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
