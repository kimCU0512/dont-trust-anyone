import { MIN_HEARTS_FOR_DETECTOR, UI_STRINGS } from '../constants'

export type StageTextStep = 'narration' | 'voice' | 'choice'

export interface StageSelection {
  choiceId: string
  isCorrect: boolean
  resultText: string
}

export interface StageInteractionState {
  selection: StageSelection | null
  exiting: boolean
}

export type StageInteractionAction =
  | { type: 'SELECT_CHOICE'; selection: StageSelection }
  | { type: 'BEGIN_TRANSITION' }

interface DetectorAvailability {
  textStep: StageTextStep
  hearts: number
  detectorUses: number
  detectorUsedThisStage: boolean
}

export function createStageInteractionState(): StageInteractionState {
  return {
    selection: null,
    exiting: false,
  }
}

export function stageInteractionReducer(
  state: StageInteractionState,
  action: StageInteractionAction,
): StageInteractionState {
  switch (action.type) {
    case 'SELECT_CHOICE':
      if (state.selection || state.exiting) {
        return state
      }

      return {
        ...state,
        selection: action.selection,
      }
    case 'BEGIN_TRANSITION':
      if (!state.selection || state.exiting) {
        return state
      }

      return {
        ...state,
        exiting: true,
      }
  }
}

export function advanceStageTextStep(step: StageTextStep): StageTextStep {
  switch (step) {
    case 'narration':
      return 'voice'
    case 'voice':
      return 'choice'
    case 'choice':
      return 'choice'
  }
}

export function areStageChoicesEnabled(
  textStep: StageTextStep,
  detectorAnimating: boolean,
  inputLocked = false,
): boolean {
  return textStep === 'choice' && !detectorAnimating && !inputLocked
}

export function getDetectorDisabledReason({
  textStep,
  hearts,
  detectorUses,
  detectorUsedThisStage,
}: DetectorAvailability): string | null {
  if (textStep !== 'choice') {
    return UI_STRINGS.detectorWaitForVoice
  }

  if (detectorUsedThisStage) {
    return UI_STRINGS.detectorAlreadyUsed
  }

  if (detectorUses < 1) {
    return UI_STRINGS.detectorNoUses
  }

  if (hearts < MIN_HEARTS_FOR_DETECTOR) {
    return UI_STRINGS.detectorLowHearts
  }

  return null
}
