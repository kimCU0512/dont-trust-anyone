export const INITIAL_HEARTS: number = 3
export const MAX_HEARTS: number = 3
export const INITIAL_KEY_FRAGMENTS: number = 0
export const MAX_KEY_FRAGMENTS: number = 5
export const INITIAL_DETECTOR_USES: number = 2
export const MIN_HEARTS_FOR_DETECTOR: number = 1
export const DETECTOR_HEART_COST: number = 0
export const WRONG_CHOICE_HEART_COST: number = 1
export const TRUE_END_KEY_FRAGMENT_THRESHOLD: number = 5
export const TOTAL_STAGES: number = 5
export const EVIDENCE_PER_STAGE: number = 3
export const MAX_EVIDENCE_COUNT: number = TOTAL_STAGES * EVIDENCE_PER_STAGE
export const TEXT_TYPING_INTERVAL_MS: number = 36
export const STAGE_TRANSITION_MS: number = 420
export const BGM_FADE_DURATION_MS: number = 600
export const BGM_FADE_STEP_MS: number = 50
export const BGM_VOLUME: number = 0.45
export const TITLE_BACKGROUND_URL = '/images/stage5_hallway.png'
export const DETECTOR_TRUTH_SYMBOL = '.....'
export const DETECTOR_LIE_SYMBOL = '.|.|.|.'

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
  bgmToggleLabel: '배경음악 켜기 또는 끄기',
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
  stageImageAltSuffix: '의 현재 모습',
  stageNarrationComplete: '주변을 확인했다',
  stageVoiceReady: '목소리를 판단하세요',
  stageExploreHint: '빛나는 지점을 눌러 단서를 조사하세요',
  objectDiscovered: '단서 확인',
  objectClose: '조사 마치기',
  intrusionLabel: '기억 침식',
  evidenceJournal: '증거 수첩',
  evidenceClose: '수첩 닫기',
  evidenceEmpty: '아직 직접 확인한 증거가 없습니다.',
  evidenceIndex: '발견한 증거 목록',
  evidenceVerified: '직접 확인한 기억',
  detectorAction: '판별 도구 사용',
  detectorClose: '판별 결과 닫기',
  detectorCost: '탐지기 1회 소모',
  detectorWaitForVoice: '목소리 대사가 끝난 뒤 사용할 수 있습니다.',
  detectorAlreadyUsed: '이 스테이지에서는 이미 탐지기를 사용했습니다.',
  detectorNoUses: '남은 탐지기 사용 횟수가 없습니다.',
  detectorLowHearts: '의식을 잃은 상태에서는 사용할 수 없습니다.',
  stageInteractionLocked: '판정이 끝날 때까지 입력할 수 없습니다.',
  choiceCorrect: '올바른 선택',
  choiceWrong: '잘못된 선택',
  stageTransitioning: '다음 장면으로 이동 중',
  detectorResultLabel: '탐지 결과',
  detectorScanning: '음성 파형 분석 중',
  detectorSignalLocked: '신호 분석 완료',
  continue: '계속',
  stage: '스테이지',
  choiceA: '선택지 A',
  choiceB: '선택지 B',
  resetHeading: '다시 눈을 떠야 한다',
  resetSubheading: '목소리는 아직 문 너머에서 기다리고 있다.',
  resetImageAlt: '어둠 속 폐교 입구로 되돌아가는 순간',
  restart: '처음부터',
  trueEnd: 'TRUE END',
  badEnd: 'BAD END',
  trueEndingSubheading: '새벽의 문이 열렸다.',
  badEndingSubheading: '목소리가 마지막 거짓말을 속삭였다.',
  trueEndingImageAlt: '새벽빛 속 열린 폐교 정문',
  badEndingImageAlt: '어둠 속 존재에게 끌려가는 사람',
  endingHint: '남겨진 단서',
  playAgain: '다시 하기',
} as const
