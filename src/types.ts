export type GamePhase =
  'title' | 'intro' | 'stage' | 'reset' | 'endingTrue' | 'endingBad'

export type StageId = 1 | 2 | 3 | 4 | 5
export type DetectorResult = 'truth' | 'lie'

export interface GameState {
  gamePhase: GamePhase
  stageId: StageId
  hearts: number
  keyFragments: number
  detectorUses: number
  currentVoiceLineId: string
  detectorUsedThisStage: boolean
  textCursor: number
}

export interface VoiceLine {
  id: string
  text: string
  isLie: boolean
  contradictsStage: StageId | null
}

export interface Choice {
  id: string
  text: string
  isCorrect: boolean
}

export interface StageResultText {
  correct: string
  wrong: string
}

export interface PointOfInterest {
  id: string
  label: string
  imageUrl: string
  position: {
    x: number
    y: number
  }
  clue: string
}

export interface EvidenceEntry {
  id: string
  stageId: StageId
  stageName: string
  label: string
  imageUrl: string
  clue: string
}

export interface Stage {
  id: StageId
  name: string
  imageUrl: string
  bgmTrack: string
  narration: string[]
  intrusionText: string
  voiceLines: VoiceLine[]
  objects: PointOfInterest[]
  choices: Choice[]
  resultText: StageResultText
}

export interface StoryData {
  stages: Stage[]
}
