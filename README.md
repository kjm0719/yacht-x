# 🎲 YACHT X AUGMENTS (야추 다이스 x 특성 증강)

> **넥슨 / 라이엇 풍 e스포츠 감성의 하이엔드 실시간 4인 주사위 대전 엔진**  
> 고전 요트 다이스(Yacht Dice)의 두뇌 싸움에 칼바람 나락 스타일의 **15종 특성 증강 시스템**을 결합한 웹 게임 프로젝트입니다.

---

## 🌟 주요 특징 (Key Features)

- **🎲 15종 특성 증강 시스템**:
  - **프리즘 (4종)**: 게임 판도를 뒤흔드는 사기급(OP) 파워 (*1·2 주사위 6 강제 변환, 포카드 야추 인정, 첫 굴림 2.5배 잭팟, 7개 주사위 플레이*)
  - **골드 (6종)**: 스트레이트 75점, 황금빛 6, 풀하우스 45점, 턴당 와일드카드, 6개 주사위 등 강력한 전략적 우위
  - **실버 (5종)**: 상단 보너스 50점 완화, 재굴림 추가, 홀수/짝수 보너스 등 안정적인 기본 빌드업
- **⏱️ 실시간 인터랙티브 HUD & 타이머**:
  - **360° 반시계 방향 원형 눈금 소등 카운트다운**: 1초마다 눈금이 회전하며 소등되고 시작점 귀환 시 골드 쇼크웨이브와 함께 카운트 감소
  - **45초 실시간 턴 타이머 게이지**: 10초 이하 진입 시 네온 레드 펄스 경고 및 긴급 사운드 재생
- **🔊 Web Audio API 무손실 사운드 엔진**:
  - 외부 음원 파일 다운로드 없이 브라우저 오실레이터 주파수 합성을 통해 0ms 지연시간의 타격감 넘치는 효과음 제공
- **🌐 실시간 4인 동시 멀티플레이**:
  - Socket.IO 기반 실시간 룸 브라우저, 4인 라이브 스코어보드, 관전 및 실시간 점수 순위표
- **🛡️ 엔터프라이즈급 보안 & AFK 방어**:
  - Zod 스키마 기반 전 패킷 위·변조 검증, IP 기반 레이트 리미터, 45초 재접속 유예(Grace Period), 서버 턴 타임아웃 AFK 자동 진행

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Glassmorphism, Esports Dark HUD)
- **Bundler**: Vite 8
- **Icons & FX**: Lucide React, Canvas Confetti

### Backend & Realtime
- **Runtime**: Node.js
- **Server Framework**: Express 5
- **Networking**: Socket.IO 4
- **Validation & Security**: Zod, Node.js `crypto`
- **Runner**: tsx

### Testing & QA
- **Test Runner**: Vitest (13/13 단위 테스트 100% 통과)

---

## 🚀 시작 가이드 (Quick Start)

### 1. 레포지토리 클론 및 의존성 설치
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
cd capstone
npm install
```

### 2. 개발 서버 실행 (프론트엔드 + 백엔드 동시 구동)
```bash
npm run dev
```
- **클라이언트 접속**: `http://localhost:5173`
- **소켓 서버**: `http://localhost:3001`

### 3. 프로덕션 빌드 및 테스트
```bash
# 단위 테스트 실행
npm test

# 프로덕션 번들 빌드
npm run build
```

---

## 📜 라이선스 (License)

This project is open source and available under the [MIT License](LICENSE).
