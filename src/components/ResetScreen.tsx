import { UI_STRINGS } from '../constants'

interface ResetScreenProps {
  onRestart: () => void
}

export function ResetScreen({ onRestart }: ResetScreenProps) {
  return (
    <section className="screen screen--reset" data-screen="P-20">
      <p className="screen__code">P-20 / RESET</p>
      <h1 className="screen__heading">{UI_STRINGS.resetHeading}</h1>
      <button className="screen__action" type="button" onClick={onRestart}>
        {UI_STRINGS.restart}
      </button>
    </section>
  )
}
