import { UI_STRINGS } from '../constants'

interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <section className="screen screen--title" data-screen="P-00">
      <p className="screen__eyebrow">DON&apos;T TRUST ANYONE</p>
      <h1 className="screen__title">{UI_STRINGS.title}</h1>
      <button className="screen__action" type="button" onClick={onStart}>
        {UI_STRINGS.start}
      </button>
    </section>
  )
}
