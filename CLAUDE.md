# CLAUDE.md — 「아무도 믿지마」 프로젝트 가이드

이 파일은 코딩 에이전트가 **매 세션 시작 시 반드시 읽는** 프로젝트 지식 파일이다.
여기 적힌 결정 사항은 확정이며, 임의로 변경하지 않는다. 변경이 필요하면 코드를 고치지 말고 PROGRESS.md에 `BLOCKED`로 기록하고 종료한다.

## 1. 프로젝트 개요

- 텍스트 중심 포인트클릭 공포 어드벤처 웹 게임 (NHN NAN 2026 해커톤 사전과제)
- 정지 이미지 + 텍스트 + BGM. 효과음 없음
- 5스테이지 고정: 복도 → 교실 → 화장실 → 보건실 → 복도(순환). 1회 플레이 5~8분
- 상세 요구사항: `specs/SPEC.md` (페이지별 기능명세서 — 단일 진실 소스)

## 2. 확정 기술 결정

- **스택**: Vite + React + TypeScript
- **상태 관리**: 로컬 state 우선. 전역 필요 시에만 Zustand 도입
- **스토리 데이터**: `src/data/story.json` (스키마는 SPEC.md 3-5항)
- **배포**: 완전 정적 (GitHub Pages 기준으로 빌드 설정)
- **서버 없음. 런타임 외부 API 호출 없음. GPT/LLM API 호출 코드 작성 금지** (텍스트는 개발 단계에서 사람이 JSON에 채워 넣음)
- **localStorage / sessionStorage 사용 금지** (SPEC C-1: 새로고침 시 초기화 허용)
- **효과음 파일 추가 금지**. 오디오는 BGM만

## 3. 디렉터리 구조 (목표)

```
src/
  main.tsx / App.tsx
  types.ts              # GameState, StoryData 타입 (SPEC 3-4, 3-5)
  data/story.json       # 스토리 데이터 (플레이스홀더 → 실제 텍스트)
  hooks/useGameState.ts # 게임 루프 상태 머신 (판정/도구/전환/엔딩분기/리셋)
  components/
    TitleScreen.tsx     # P-00
    IntroScreen.tsx     # P-01 (튜토리얼 포함)
    StageScreen.tsx     # P-10 공통 템플릿
    ResetScreen.tsx     # P-20
    EndingScreen.tsx    # P-30/P-31 (props로 분기)
    Hud.tsx / TextBox.tsx / DetectorResult.tsx
  audio/bgmManager.ts   # 첫 인터랙션 후 재생, 페이드, 토글
public/images/          # 스테이지/엔딩 이미지 (플레이스홀더 허용)
public/bgm/             # 무료 라이선스 음원 (없으면 무음 파일 플레이스홀더)
```

## 4. 명령어 / 검증

- 의존성 설치: `npm ci` (lock 없으면 `npm install`)
- 검증 단일 진입점: `./verify.sh` — **모든 태스크는 이것이 통과해야 완료**
  - 내용: lint → tsc --noEmit → vitest run → vite build
- 테스트: 상태 머신(useGameState)과 데이터 검증 로직은 반드시 단위 테스트 작성. UI 컴포넌트는 테스트 선택

## 5. 코딩 컨벤션

- 함수형 컴포넌트 + hooks만 사용. 클래스 컴포넌트 금지
- 게임 규칙 수치(하트 3, 도구 2, 열쇠조각 기준 3 등)는 `src/constants.ts`에 상수로 모은다. 매직 넘버 금지
- 화면 전환은 라우터 없이 `gamePhase` 상태값으로 처리 (SPEC 0항). react-router 설치 금지
- 텍스트/대사는 코드에 하드코딩하지 않고 전부 `story.json` 또는 UI 문자열 상수에서 가져온다
- 커밋 메시지: `feat|fix|chore|test: 한 줄 요약 (TODO 항목 번호)`

## 6. 미결 사항에 대한 기본값 (채택 완료)

SPEC.md 7항의 미결 사항은 아래 기본값으로 구현한다:

1. 하트 1개일 때 판별 도구: **비활성화 + 비활성 사유 툴팁** (경고 모달 방식 아님)
2. 스테이지 5 복도 이미지: **별도 파일 슬롯(`stage5_hallway.png`)로 분리**하되, 실제 이미지가 없으면 스테이지 1 이미지를 임시 재사용
3. 판별 도구 튜토리얼 문구(P-01): 임시 문구 "탐지기는 목소리의 진위를 파형으로 보여준다. `.....`은 진실, `.|.|.|.`은 거짓." — 이후 사람이 다듬음
4. 스테이지별 실제 서술문/대사: 스키마를 만족하는 **플레이스홀더 텍스트**로 채우고, 각 항목에 `"TODO_CONTENT"` 주석 플래그를 남긴다

## 7. 작업 규칙 (루프 규율)

- **한 세션 = TODO.md의 태스크 1개.** 절대 2개 이상 건드리지 않는다
- 태스크 착수 전 관련 파일을 먼저 읽고, 완료 기준을 확인한다
- `./verify.sh` 통과 → TODO 체크 → PROGRESS.md 1줄 기록 → git commit → 종료
- verify 3회 연속 실패 시: 원인을 PROGRESS.md에 `BLOCKED`로 남기고 되돌린 뒤(git checkout) 종료
- SPEC.md와 코드가 충돌하면 SPEC.md가 우선. SPEC 자체가 모순이면 `BLOCKED` 기록
- 의존성 추가는 최소화. 새 패키지 설치 시 PROGRESS.md에 사유 1줄 기록
