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

export const UI_STRINGS = {
  title: '아무도 믿지마',
  start: '시작하기',
  introHeading: '문이 잠겼다',
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
