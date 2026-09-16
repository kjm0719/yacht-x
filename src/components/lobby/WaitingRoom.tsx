import React, { useState } from 'react';
import type { Room } from '../../types/multiplayer';
import { 
  Crown, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  LogOut, 
  Share2, 
  Users, 
  Flame,
  Sparkles
} from 'lucide-react';
import { RadialCountdownDial } from './RadialCountdownDial';

interface WaitingRoomProps {
  room: Room;
  myPlayerId: string;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  myPlayerId,
  onToggleReady,
  onLeaveRoom,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const me = room.players.find(p => p.id === myPlayerId);
  const isReady = me?.isReady || false;

  const totalPlayers = room.players.length;
  const readyPlayers = room.players.filter(p => p.isReady).length;
  const majorityThreshold = Math.floor(totalPlayers / 2) + 1; // 과반수 인원수

  // Copy Invite Link
  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Copy Room Code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-300 relative">
      {/* 5-Second Countdown Screen Overlay */}
      {room.status === 'countdown' && room.countdownSeconds !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center p-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4 animate-spin" />
              과반수 준비 완료!
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
              게임이 시작됩니다
            </h2>
            {/* Radial Ticks Inside Golden Circle HUD */}
            <RadialCountdownDial seconds={room.countdownSeconds} />
          </div>
        </div>
      )}

      {/* Room Header Info */}
      <div className="game-panel border-t-2 border-t-cyan-400/80 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-400 to-cyan-400 p-[2px] shadow-[0_0_25px_rgba(45,212,191,0.5)] flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#070e1c] rounded-[14px] flex items-center justify-center">
              <Users className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">{room.name}</h1>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 tracking-wider shadow-sm">
                코드: {room.id}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              준비 인원: <b className="text-cyan-400 font-mono text-sm">{readyPlayers}</b> / {totalPlayers}명 (과반수 {majorityThreshold}명 달성 시 5초 카운트다운 시작)
            </p>
          </div>
        </div>

        {/* Action / Invite Buttons */}
        <div className="flex items-center gap-2 relative z-10">
          {/* Copy Invite Link */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            title="초대 링크 복사"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">링크 복사됨!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>초대 링크 복사</span>
              </>
            )}
          </button>

          {/* Copy Room Code */}
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            title="방 코드 복사"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">코드 복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>방 코드 복사</span>
              </>
            )}
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 shadow-md transition-all active:scale-95"
            title="방 나가기"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 Player Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: room.maxPlayers }).map((_, slotIdx) => {
          const player = room.players[slotIdx];
          const isMe = player?.id === myPlayerId;

          if (player) {
            return (
              <div
                key={player.id}
                className={`relative rounded-2xl p-5 border-2 flex flex-col justify-between min-h-[200px] transition-all duration-300 ${
                  player.isReady
                    ? 'bg-gradient-to-b from-[#0a2636] to-[#06101c] border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)]'
                    : 'bg-[#0A1424]/90 border-slate-800 shadow-lg'
                }`}
              >
                {/* Top Role Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {player.isHost && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                        <Crown className="w-3 h-3 text-amber-400" /> 방장
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        나 (YOU)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    SLOT {slotIdx + 1}
                  </span>
                </div>

                {/* Nickname & Avatar */}
                <div className="flex flex-col items-center text-center my-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-2 shadow-md transition-all ${
                    player.isReady
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                      : 'bg-slate-800 border border-slate-700 text-slate-200'
                  }`}>
                    {player.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-bold text-base text-white truncate max-w-[140px]">
                    {player.nickname}
                  </span>
                </div>

                {/* Ready Status Banner */}
                <div
                  className={`w-full py-2 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    player.isReady
                      ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                  }`}
                >
                  {player.isReady ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> READY
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 opacity-60" /> WAITING
                    </>
                  )}
                </div>
              </div>
            );
          }

          // Empty Slot
          return (
            <div
              key={`empty-${slotIdx}`}
              className="rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/30 p-5 flex flex-col items-center justify-center text-center min-h-[200px] text-slate-600 gap-2"
            >
              <div className="w-12 h-12 rounded-xl border border-slate-800 flex items-center justify-center text-slate-700">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500">대기 슬롯 {slotIdx + 1}</span>
              <span className="text-[11px] text-slate-600">초대 링크로 친구를 초대하세요</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Ready Toggle & Status Controls */}
      <div className="game-panel rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-3 text-xs text-slate-300 relative z-10">
          <Flame className="w-6 h-6 text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-sm">
            {readyPlayers >= majorityThreshold ? (
              <span className="text-amber-400 font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                과반수 달성! 카운트다운이 진행 중입니다.
              </span>
            ) : (
              <span>
                과반수(<b className="text-cyan-400 font-black">{majorityThreshold}명</b>) 이상이 준비를 완료하면 <b className="text-white">5초 카운트다운</b> 후 게임이 시작됩니다.
              </span>
            )}
          </span>
        </div>

        {/* Ready Action Button */}
        <button
          type="button"
          onClick={onToggleReady}
          className={`relative z-10 w-full sm:w-auto px-12 py-3.5 rounded-2xl font-black text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            isReady
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border border-rose-400 shadow-[0_4px_0_#991b1b,0_8px_20px_rgba(239,68,68,0.4)] active:translate-y-1 active:shadow-none'
              : 'btn-nexon-teal text-slate-950'
          }`}
        >
          {isReady ? (
            <>
              <Clock className="w-6 h-6" />
              <span className="tracking-widest">준비 취소</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              <span className="tracking-widest">READY (준비 완료)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
