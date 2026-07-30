import { UI_STRINGS } from '../constants'

interface EndingScreenProps {
  ending: 'true' | 'bad'
  onReturnToTitle: () => void
}

export function EndingScreen({
  ending,
  onReturnToTitle,
}: EndingScreenProps) {
  const isTrueEnding = ending === 'true'

  return (
    <section
      className={`screen screen--ending screen--ending-${ending}`}
      data-screen={isTrueEnding ? 'P-30' : 'P-31'}
    >
      <p className="screen__code">{isTrueEnding ? 'P-30' : 'P-31'}</p>
      <h1 className="screen__heading">
        {isTrueEnding ? UI_STRINGS.trueEnd : UI_STRINGS.badEnd}
      </h1>
      <button
        className="screen__action"
        type="button"
        onClick={onReturnToTitle}
      >
        {UI_STRINGS.playAgain}
      </button>
    </section>
  )
}
