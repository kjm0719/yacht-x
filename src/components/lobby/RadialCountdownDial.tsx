import React, { useState, useEffect, useRef } from 'react';

interface RadialCountdownDialProps {
  seconds: number;
}

const TOTAL_TICKS = 36; // 36개 눈금 (10도 간격, 12·9·6·3시 4방위 및 30도 시간축 정밀 분할)

export const RadialCountdownDial: React.FC<RadialCountdownDialProps> = ({ seconds }) => {
  const [progress, setProgress] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const rafRef = useRef<number | null>(null);

  // 초(seconds)가 변경될 때마다(시작점에 귀환하여 숫자가 줄어들 때) 완벽한 충전 펄스 및 연속 사이클 트리거
  useEffect(() => {
    setPulseKey(prev => prev + 1);

    const startTime = performance.now();
    const duration = 1000; // 1초 동안 한 바퀴(360도) 부드럽게 완주

    const updateFrame = (now: number) => {
      const elapsed = now - startTime;
      // 0.0 ~ 0.999까지 끊김 없이 진행 (마지막 35번 눈금에서 다음 0번 눈금으로 자연스럽게 바통 터치)
      const p = Math.min(elapsed / duration, 0.999);
      setProgress(p);

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(updateFrame);
      }
    };

    setProgress(0);
    rafRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [seconds]);

  // 반시계 방향으로 현재 활성화된 선두 스파크의 위치 (0 ~ 35)
  const activeIdx = Math.min(Math.floor(progress * TOTAL_TICKS), TOTAL_TICKS - 1);

  return (
    <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center my-4 select-none">
      {/* 1. 사이클 완료 시 확산되는 황금빛 충전 펄스 링 (자연스러운 사이클 전환 효과) */}
      {pulseKey > 1 && (
        <div
          key={`shockwave-${pulseKey}`}
          className="absolute -inset-2 rounded-full border-2 border-amber-300/80 pointer-events-none animate-ping opacity-60"
          style={{ animationDuration: '650ms' }}
        />
      )}

      {/* 2. 동그라미 황금빛 외곽 링 테두리 (사이클 완료 시 섬세한 발광 펄스) */}
      <div className={`absolute inset-0 rounded-full border-[3.5px] border-amber-400 pointer-events-none bg-[#070d19] transition-all duration-300 ${
        pulseKey > 0 
          ? 'shadow-[0_0_45px_rgba(245,158,11,0.6),inset_0_0_25px_rgba(245,158,11,0.3)]' 
          : 'shadow-[0_0_35px_rgba(245,158,11,0.4)]'
      }`} />

      {/* 3. 안쪽 은은한 앰버 래디얼 플레어 */}
      <div className="absolute inset-0 rounded-full bg-radial from-amber-500/15 via-transparent to-transparent pointer-events-none" />

      {/* 4. 동그라미 안쪽 반시계 방향 눈금(Radial Ticks) 링 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: TOTAL_TICKS }).map((_, idx) => {
          // 12시(0도)에서 시작하여 반시계 방향으로 회전 (0°, -10°, -20°, ..., -350°)
          const angle = -(idx / TOTAL_TICKS) * 360;
          
          // 상태 구분: 선두 스파크(Lead Spark) -> 잔상 엠버(Trail) -> 소등(Disappeared) -> 대기 점등(Waiting)
          const isLeadSpark = idx === activeIdx;
          const isTrailEmber = (activeIdx - idx + TOTAL_TICKS) % TOTAL_TICKS === 1;
          const isDisappeared = idx < activeIdx;
          
          const isCardinal = idx % 9 === 0; // 12시, 9시, 6시, 3시 메인 방위 눈금
          const isMajor = idx % 3 === 0; // 30도 간격 시간축 보조 눈금

          // 눈금 크기: 메인 방위 > 보조 > 일반
          const tickHeight = isCardinal ? 'h-3.5' : isMajor ? 'h-2.5' : 'h-1.5';
          const tickWidth = isCardinal ? 'w-[2.5px]' : 'w-[2px]';

          return (
            <div
              key={idx}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotate(${angle}deg) translateY(-88px)`,
              }}
            >
              <div
                className={`${tickWidth} ${tickHeight} rounded-full transition-all duration-100 ${
                  isLeadSpark
                    ? 'bg-white shadow-[0_0_14px_#ffffff,0_0_8px_#f59e0b] scale-135 opacity-100 z-20'
                    : isTrailEmber
                    ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b] scale-110 opacity-80 z-10'
                    : !isDisappeared
                    ? isCardinal
                      ? 'bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 shadow-[0_0_8px_#f59e0b] scale-100 opacity-100'
                      : 'bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.7)] scale-100 opacity-90'
                    : 'bg-slate-800/40 scale-75 opacity-20 shadow-none'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* 5. 중앙 디지털 카운트다운 숫자 및 라벨 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* 숫자가 줄어들 때 탄력적인 팝(Pop) 줌 인 애니메이션 */}
        <span
          key={seconds}
          className="text-6xl sm:text-7xl font-mono font-black text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.95)] animate-in zoom-in-90 duration-200"
        >
          {seconds}
        </span>
        <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400 font-extrabold uppercase mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
          STARTING
        </span>
      </div>
    </div>
  );
};
