import React from 'react';
import { Dices, Sparkles, X, Swords, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="game-panel border-2 border-teal-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(20,184,166,0.3)] flex flex-col gap-5 text-slate-200 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dices className="w-5 h-5 text-teal-300" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-white tracking-wide flex items-center gap-2">
                야추 x 증강 룰북
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                공식 게임 규칙 및 증강 시너지 시스템 안내
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 text-sm leading-relaxed relative z-10">
          {/* Rule 1 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 h-fit">
              <Dices className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">1. 기본 요트 주사위 룰</h4>
              <p className="text-xs text-slate-300">
                기본 5개의 주사위를 굴려 턴마다 최대 3회까지 원하는 주사위를 고정(Keep)하며 다시 굴릴 수 있습니다.
                총 13개의 족보(에이스~식스 상단 6개, 3오브어카인드~야추 하단 7개)를 13턴에 걸쳐 한 번씩 채워나갑니다.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 h-fit">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">2. 상단 섹션 보너스</h4>
              <p className="text-xs text-slate-300">
                상단 1~6 족보 점수의 합계가 <b>63점 이상</b> 달성 시 <b>+35점</b>의 대형 보너스가 주어집니다.
                (※ 특정 증강 특성 장착 시 기준이 50점으로 완화되거나 보너스가 +50점으로 증가합니다!)
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 h-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">3. 증강 시스템 (핵심 재미)</h4>
              <p className="text-xs text-slate-300">
                <b>게임 시작 직전(1턴 시작 전)</b> 및 <b>매 2턴마다(3, 5, 7, 9, 11, 13턴)</b> 3개의 무작위 증강 중 1개를 선택하여 영구 장착합니다. (최대 7개 증강 중첩 장착!)
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[11px] font-bold text-cyan-300 block mb-0.5">🎲 주사위 조작계</span>
                  <span className="text-[10px] text-slate-400">재굴림 횟수 추가, 주사위 6개 확장, 와일드카드 주사위</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[11px] font-bold text-amber-300 block mb-0.5">⚡ 점수 배율계</span>
                  <span className="text-[10px] text-slate-400">야추/풀하우스 1.5~2배, 상단 기준 대폭 완화</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-300 block mb-0.5">🔥 조건부 특수계</span>
                  <span className="text-[10px] text-slate-400">홀수/짝수 보너스, 연계 폭발, 굴릴 때마다 추가점</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[11px] font-bold text-rose-300 block mb-0.5">💀 하이리스크 하이리턴</span>
                  <span className="text-[10px] text-slate-400">1회만 굴려 확정 시 극대 배율, 0점 처리 시 패널티</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 h-fit">
              <Swords className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">4. 실시간 4인 배틀 & 포디움</h4>
              <p className="text-xs text-slate-300">
                멀티플레이에서는 4명의 플레이어가 동시에 각자의 증강을 선택하고 주사위를 굴리며 실시간으로 상대방의 점수 현황과 증강 빌드를 확인할 수 있습니다. 13턴 종료 후 가장 높은 총점을 기록한 플레이어가 우승합니다!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl btn-nexon-teal text-slate-950 font-black text-sm transition-all"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
