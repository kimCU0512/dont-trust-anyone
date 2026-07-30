export const INITIAL_HEARTS: number = 3
export const MAX_HEARTS: number = 3
export const INITIAL_KEY_FRAGMENTS: number = 0
export const MAX_KEY_FRAGMENTS: number = 5
export const INITIAL_DETECTOR_USES: number = 2
export const MIN_HEARTS_FOR_DETECTOR: number = 2
export const DETECTOR_HEART_COST: number = 1
export const WRONG_CHOICE_HEART_COST: number = 1
export const TRUE_END_KEY_FRAGMENT_THRESHOLD: number = 3
export const TOTAL_STAGES: number = 5
export const TEXT_TYPING_INTERVAL_MS: number = 36

export const UI_STRINGS = {
  title: '아무도 믿지마',
  titleEnglish: "DON'T TRUST ANYONE",
  titleTagline: '목소리를 의심하고, 기억을 믿어라.',
  titleChapterNumber: '01.',
  titleChapter: '폐교 진입',
  titleStageCount: '5 STAGES',
  titleEndingCount: '2 ENDINGS',
  titlePlayTime: '5–8 MIN',
  start: '시작하기',
  bgm: 'BGM',
  bgmOn: 'ON',
  bgmOff: 'OFF',
  titleBackgroundAlt: '어둠에 잠긴 폐교 외관',
  textBoxNarration: '상황 서술',
  textBoxVoice: '목소리',
  textBoxSystem: '안내',
  textBoxTypingHint: '클릭하면 문장을 바로 표시합니다',
  textBoxAdvanceHint: '클릭하여 계속',
  introHeading: '문이 잠겼다',
  introLocation: '폐교 · 현관',
  introImageAlt: '굳게 잠긴 폐교 현관문',
  introTutorialHeading: '탐지기 사용 안내',
  introTutorialTruth: '진실',
  introTutorialLie: '거짓',
  introReady: '탐지기 동기화 완료',
  enterStageOne: '목소리를 따라간다',
  hudLabel: '현재 게임 상태',
  hudHearts: '하트',
  hudKeyFragments: '열쇠조각',
  hudDetectorUses: '탐지기',
  continue: '계속',
  stage: '스테이지',
  choiceA: '선택지 A',
  choiceB: '선택지 B',
  resetHeading: '다시 눈을 떠야 한다',
  restart: '처음부터',
  trueEnd: 'TRUE END',
  badEnd: 'BAD END',
  playAgain: '다시 하기',
} as const
