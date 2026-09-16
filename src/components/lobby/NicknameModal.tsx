import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  initialNickname: string;
  onSave: (nickname: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  initialNickname,
  onSave,
}) => {
  const [nickname, setNickname] = useState(initialNickname || '');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setNickname(initialNickname || '');
      setError('');
    }
  }, [isOpen, initialNickname]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length > 12) {
      setError('닉네임은 최대 12글자까지 가능합니다.');
      return;
    }
    setError('');
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="game-panel border-2 border-teal-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(20,184,166,0.35)] flex flex-col items-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Avatar badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-indigo-600 p-[2px] shadow-[0_0_25px_rgba(45,212,191,0.5)] mb-4 relative z-10">
          <div className="w-full h-full bg-[#070e1c] rounded-[14px] flex items-center justify-center text-teal-300">
            <User className="w-8 h-8 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
          </div>
        </div>

        <h2 className="text-2xl font-black font-display text-white mb-1 flex items-center gap-2 relative z-10">
          <span>플레이어 닉네임 설정</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6 relative z-10">
          게임에 참여하기 전, 대전 상대에게 표시될 닉네임을 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 relative z-10">
          <div>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                placeholder="예: 야추마스터99"
                autoFocus
                maxLength={12}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30 text-white font-black placeholder-slate-600 outline-none transition-all text-center text-lg tracking-wide shadow-inner"
              />
            </div>
            {error && <span className="text-xs font-semibold text-rose-400 mt-1.5 block text-center">{error}</span>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl btn-nexon-teal text-slate-950 font-display font-black text-sm tracking-wider shadow-xl transition-all"
          >
            {initialNickname ? '닉네임 변경 확정' : '게임 클라이언트 접속'}
          </button>
        </form>
      </div>
    </div>
  );
};
