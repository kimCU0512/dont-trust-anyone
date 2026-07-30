import { UI_STRINGS } from '../constants'
import type { StageId } from '../types'

interface StageScreenProps {
  stageId: StageId
  onSelectChoice: (choiceId: string) => void
}

export function StageScreen({
  stageId,
  onSelectChoice,
}: StageScreenProps) {
  return (
    <section className="screen" data-screen="P-10">
      <p className="screen__code">P-10 / STAGE</p>
      <h1 className="screen__heading">
        {UI_STRINGS.stage} {stageId}
      </h1>
      <div className="screen__placeholder" aria-hidden="true" />
      <div className="screen__choices">
        <button
          className="screen__action"
          type="button"
          onClick={() => onSelectChoice('A')}
        >
          {UI_STRINGS.choiceA}
        </button>
        <button
          className="screen__action screen__action--secondary"
          type="button"
          onClick={() => onSelectChoice('B')}
        >
          {UI_STRINGS.choiceB}
        </button>
      </div>
    </section>
  )
}
