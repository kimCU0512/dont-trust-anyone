import { MIN_HEARTS_FOR_DETECTOR, UI_STRINGS } from '../constants'

export type StageTextStep = 'narration' | 'voice' | 'choice'

interface DetectorAvailability {
  textStep: StageTextStep
  hearts: number
  detectorUses: number
  detectorUsedThisStage: boolean
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
): boolean {
  return textStep === 'choice' && !detectorAnimating
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
