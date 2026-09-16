import React from 'react';
import type { Player } from '../../types/multiplayer';
import { Trophy, CheckCircle, Sparkles } from 'lucide-react';
import { AUGMENT_RARITY_COLORS } from '../../constants/augments';

interface MultiScoreBoardProps {
  players: Player[];
  myPlayerId: string;
}

export const MultiScoreBoard: React.FC<MultiScoreBoardProps> = ({
  players,
  myPlayerId,
}) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full game-panel border-t-2 border-t-cyan-400/60 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-sans">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-xs font-black text-white tracking-wider uppercase font-display">
            실시간 4인 랭킹 HUD
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span>LIVE BROADCAST</span>
        </div>
      </div>

      {/* Players Cards Horizontal or Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedPlayers.map((player, idx) => {
          const isMe = player.id === myPlayerId;
          const rank = idx + 1;

          const rankBadgeColor = {
            1: 'bg-amber-400 text-slate-950 font-black shadow-[0_0_8px_rgba(251,191,36,0.8)]',
            2: 'bg-slate-200 text-slate-900 font-black',
            3: 'bg-amber-700 text-amber-100 font-black',
          }[rank] || 'bg-slate-800 text-slate-400 font-bold';

          const isLeader = rank === 1;

          return (
            <div
              key={player.id}
              className={`rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between gap-2.5 ${
                isLeader
                  ? 'bg-gradient-to-b from-[#1c160a] to-[#0d0a05] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : isMe
                  ? 'bg-[#0A1828]/95 border-cyan-500/80 shadow-[0_0_20px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400'
                  : 'bg-[#08101E]/80 border-slate-800'
              }`}
            >
              {/* Header: Rank + Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${rankBadgeColor}`}>
                    {rank}
                  </span>
                  <span className={`text-xs font-black truncate max-w-[110px] ${
                    isMe ? 'text-cyan-300' : isLeader ? 'text-amber-300' : 'text-slate-100'
                  }`}>
                    {player.nickname} {isMe && '(나)'}
                  </span>
                </div>

                {player.isFinished ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
                    <CheckCircle className="w-3 h-3" /> FINISHED
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {player.currentTurn}/13 TURN
                  </span>
                )}
              </div>

              {/* Score & Mini Dice */}
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SCORE</span>
                  <span className={`text-xl font-mono font-black ${
                    isLeader ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-100'
                  }`}>
                    {player.totalScore}
                    <span className="text-xs font-normal text-slate-400 ml-1">PTS</span>
                  </span>
                </div>

                {/* Mini Dice preview chips if available */}
                {player.currentDice && player.currentDice.length > 0 && (
                  <div className="flex gap-1 items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shadow-inner">
                    {player.currentDice.map((val, dIdx) => (
                      <span key={dIdx} className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono font-black text-cyan-300">
                        {val.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Augments Badges */}
              {player.activeAugments && player.activeAugments.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1 flex-wrap">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  {player.activeAugments.map((aug) => {
                    const colors = AUGMENT_RARITY_COLORS[aug.rarity] || AUGMENT_RARITY_COLORS.silver;
                    return (
                      <span
                        key={aug.id}
                        title={`${aug.name}: ${aug.description}`}
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border truncate max-w-[70px] ${colors.badge}`}
                      >
                        {aug.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
