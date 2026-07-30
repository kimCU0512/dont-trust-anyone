export type IntroStep = 'narration' | 'tutorial' | 'ready'

export function advanceIntroStep(step: IntroStep): IntroStep {
  switch (step) {
    case 'narration':
      return 'tutorial'
    case 'tutorial':
      return 'ready'
    case 'ready':
      return 'ready'
  }
}

export function canEnterFirstStage(step: IntroStep): boolean {
  return step === 'ready'
}
