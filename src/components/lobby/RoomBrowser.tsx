import React, { useState } from 'react';
import { PlusCircle, KeyRound, Users, RefreshCw, Dices, Flame, Edit3, Play, Check } from 'lucide-react';

export interface OpenRoom {
  id: string;
  name: string;
  playersCount: number;
  maxPlayers: number;
}

interface RoomBrowserProps {
  nickname: string;
  openRooms: OpenRoom[];
  onCreateRoom: (roomName: string) => void;
  onJoinRoom: (roomId: string) => void;
  onRefreshRooms: () => void;
  onChangeNickname: (newNick?: string) => void;
  onStartSolo: () => void;
}

export const RoomBrowser: React.FC<RoomBrowserProps> = ({
  nickname,
  openRooms,
  onCreateRoom,
  onJoinRoom,
  onRefreshRooms,
  onChangeNickname,
  onStartSolo,
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [editNickValue, setEditNickValue] = useState(nickname);

  const handleSaveEditNick = () => {
    if (editNickValue.trim()) {
      onChangeNickname(editNickValue.trim());
    }
    setIsEditingNick(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(newRoomName.trim() || `${nickname}의 방`);
    setNewRoomName('');
    setShowCreateModal(false);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim()) return;
    onJoinRoom(inputRoomCode.trim());
    setInputRoomCode('');
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Top Banner / Game Portal Hero */}
      <div className="game-panel border-t-2 border-t-cyan-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow & Grid Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-400 to-cyan-300 p-[2px] shadow-[0_0_30px_rgba(45,212,191,0.6)] flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#070e1c] rounded-[14px] flex items-center justify-center">
              <Dices className="w-9 h-9 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-wider">
                <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-md">YACHT</span>
                <span className="text-amber-400 text-xl font-mono mx-1">X</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">ARAM</span>
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                SEASON 1 ARENA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium tracking-tight">
              실시간 4인 증강 대전 • 13턴 전략적 주사위 승부
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                KR-SEOUL LIVE
              </span>
              <span className="text-[10px] text-slate-500 font-mono">| PING 12ms</span>
            </div>
          </div>
        </div>

        {/* User Profile / Summoner Badge */}
        <div className="bg-slate-950/80 border border-slate-700/80 p-3.5 rounded-2xl relative z-10 shadow-xl flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-display font-black text-white text-lg shadow-md">
            {nickname ? nickname.slice(0, 1).toUpperCase() : 'P'}
          </div>
          <div className="flex flex-col min-w-[100px]">
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">접속 파일럿</span>
            {isEditingNick ? (
              <input
                type="text"
                autoFocus
                maxLength={12}
                value={editNickValue}
                onChange={(e) => setEditNickValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEditNick();
                  if (e.key === 'Escape') setIsEditingNick(false);
                }}
                onBlur={handleSaveEditNick}
                className="text-sm font-bold text-cyan-300 bg-transparent border-b border-cyan-500/50 outline-none w-[110px]"
              />
            ) : (
              <span 
                className="text-sm font-black text-cyan-300 truncate max-w-[130px] cursor-pointer hover:text-cyan-200 transition-colors"
                onClick={() => {
                  setEditNickValue(nickname);
                  setIsEditingNick(true);
                }}
              >
                {nickname}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditingNick) {
                handleSaveEditNick();
              } else {
                setEditNickValue(nickname);
                setIsEditingNick(true);
              }
            }}
            title="닉네임 변경"
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            {isEditingNick ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Create Room Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="game-panel shimmer-sweep border-teal-500/40 hover:border-cyan-400 rounded-2xl p-6 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(20,184,166,0.35)] group flex flex-col justify-between overflow-hidden min-h-[170px]"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.6)] group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              CREATE ROOM
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-black text-white mb-1 group-hover:text-cyan-300 transition-colors tracking-tight">
              방 만들기
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              4인 동시 플레이 방을 생성하고 초대 링크를 공유하세요.
            </p>
          </div>
        </div>

        {/* Join by Code Card */}
        <div className="game-panel-gold rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[170px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <KeyRound className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
              <h3 className="text-sm font-black text-amber-300 tracking-wide uppercase">초대 코드로 빠른 입장</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              JOIN CODE
            </span>
          </div>
          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
              placeholder="6자리 코드 입력"
              maxLength={6}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-amber-500/40 text-sm font-mono tracking-widest text-center text-amber-200 placeholder-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 outline-none uppercase transition-all"
            />
            <button
              type="submit"
              disabled={!inputRoomCode.trim()}
              className="w-full py-2.5 rounded-xl btn-nexon-gold text-slate-950 font-black tracking-wider text-xs transition-all disabled:opacity-50 disabled:shadow-none"
            >
              방 참가하기
            </button>
          </form>
        </div>

        {/* Solo Play Card */}
        <div
          onClick={onStartSolo}
          className="game-panel shimmer-sweep border-purple-500/40 hover:border-purple-400 rounded-2xl p-6 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(192,132,252,0.35)] group flex flex-col justify-between overflow-hidden min-h-[170px]"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,132,252,0.6)] group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
              SINGLE MODE
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-black text-white mb-1 group-hover:text-purple-300 transition-colors tracking-tight">
              싱글모드
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              증강을 7개까지 맞춰보며 최고 기록을 경신하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Open Rooms List */}
      <div className="game-panel rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white tracking-wide">실시간 매칭 대기실 목록</h2>
            <span className="text-xs font-mono text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {openRooms.length}개 오픈
            </span>
          </div>
          <button
            type="button"
            onClick={onRefreshRooms}
            title="새로고침"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> 새로고침
          </button>
        </div>

        {openRooms.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
            <Flame className="w-10 h-10 text-amber-500/40 animate-pulse" />
            <p className="text-sm font-semibold text-slate-400">현재 대기 중인 방이 없습니다.</p>
            <p className="text-xs text-slate-500">'방 만들기' 버튼을 눌러 첫 번째 방을 열어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {openRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onJoinRoom(room.id)}
                className="bg-[#0A1424]/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group shadow-md hover:shadow-cyan-500/10"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {room.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 tracking-wider">
                    CODE: <b className="text-slate-400">{room.id}</b>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                    {room.playersCount} / {room.maxPlayers} 명
                  </span>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-xl btn-nexon-teal text-slate-950 font-black text-xs"
                  >
                    입장
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="game-panel border-2 border-teal-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(20,184,166,0.35)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-400" />
                새로운 방 만들기
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                닫기 ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">방 제목</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder={`${nickname}의 방`}
                  maxLength={20}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium placeholder-slate-500 focus:border-teal-400 outline-none"
                />
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <p>• 최대 4인까지 동시 입장이 가능합니다.</p>
                <p>• 참가자의 <b>과반수 이상</b>이 준비를 누르면 5초 카운트다운 후 게임이 시작됩니다.</p>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-3 rounded-2xl btn-nexon-dark text-slate-300 font-bold text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-2xl btn-nexon-teal text-slate-950 font-black text-sm"
                >
                  방 생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
