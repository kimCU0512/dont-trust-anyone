import { UI_STRINGS } from '../constants'

interface IntroScreenProps {
  onContinue: () => void
}

export function IntroScreen({ onContinue }: IntroScreenProps) {
  return (
    <section className="screen" data-screen="P-01">
      <p className="screen__code">P-01 / INTRO</p>
      <h1 className="screen__heading">{UI_STRINGS.introHeading}</h1>
      <div className="screen__placeholder" aria-hidden="true" />
      <button className="screen__action" type="button" onClick={onContinue}>
        {UI_STRINGS.continue}
      </button>
    </section>
  )
}
