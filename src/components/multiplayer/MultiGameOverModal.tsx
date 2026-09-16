import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { PlayerRanking } from '../../types/multiplayer';
import { Trophy, Medal, RotateCcw, Crown } from 'lucide-react';

interface MultiGameOverModalProps {
  isOpen: boolean;
  rankings: PlayerRanking[];
  myPlayerId: string;
  onBackToLobby: () => void;
}

export const MultiGameOverModal: React.FC<MultiGameOverModalProps> = ({
  isOpen,
  rankings,
  myPlayerId,
  onBackToLobby,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen || rankings.length === 0) return null;

  const myRanking = rankings.find(r => r.player.id === myPlayerId);
  const winner = rankings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="game-panel border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_60px_rgba(243,186,47,0.3)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow & Sparkles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-3 relative z-10">
          <div className="w-full h-full bg-[#120D04] rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1 relative z-10">
          실시간 최종 순위
        </h2>
        <p className="text-xs text-slate-300 mb-5 relative z-10">
          영예의 우승자: <b className="text-amber-300 font-bold">{winner.player.nickname}</b> ({winner.finalScore} PTS)
        </p>

        {/* My Result Alert */}
        {myRanking && (
          <div className="w-full bg-[#070e1c]/90 border border-teal-500/50 rounded-2xl p-4 mb-5 flex items-center justify-between relative z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                #{myRanking.rank}위
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">나의 최종 랭크</span>
                <span className="text-sm font-bold text-white">{myRanking.player.nickname}</span>
              </div>
            </div>
            <span className="text-2xl font-mono font-black text-amber-300">
              {myRanking.finalScore} <span className="text-xs font-normal text-slate-400">PTS</span>
            </span>
          </div>
        )}

        {/* Podium / Rankings List */}
        <div className="w-full flex flex-col gap-2.5 mb-6 relative z-10">
          {rankings.map((entry) => {
            const isMe = entry.player.id === myPlayerId;
            const isWinner = entry.rank === 1;

            return (
              <div
                key={entry.player.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : isMe
                    ? 'bg-teal-950/40 border-teal-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center font-bold text-xs">
                    {entry.rank === 1 ? (
                      <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    ) : (
                      <Medal className={`w-4 h-4 ${entry.rank === 2 ? 'text-slate-300' : 'text-amber-700'}`} />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-sm font-bold ${isMe ? 'text-cyan-300' : 'text-white'}`}>
                      {entry.player.nickname} {isMe && <span className="text-xs text-teal-400 font-mono font-normal">(나)</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      증강 빌드: {entry.player.activeAugments?.length || 0}개 장착
                    </span>
                  </div>
                </div>

                <span className="text-lg font-mono font-black text-amber-300">
                  {entry.finalScore} <span className="text-xs font-normal text-slate-400">PTS</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Back to Lobby Button */}
        <button
          type="button"
          onClick={onBackToLobby}
          className="w-full py-4 rounded-2xl btn-nexon-teal text-slate-950 font-display font-black text-base tracking-wider flex items-center justify-center gap-2 relative z-10"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>대기실로 돌아가기</span>
        </button>
      </div>
    </div>
  );
};
