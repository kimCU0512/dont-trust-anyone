import { UI_STRINGS } from '../constants'
import type { StageId } from '../types'
import { Hud } from './Hud'

interface StageScreenProps {
  stageId: StageId
  hearts: number
  keyFragments: number
  detectorUses: number
  onSelectChoice: (choiceId: string) => void
}

export function StageScreen({
  stageId,
  hearts,
  keyFragments,
  detectorUses,
  onSelectChoice,
}: StageScreenProps) {
  return (
    <section className="screen screen--stage" data-screen="P-10">
      <Hud
        hearts={hearts}
        keyFragments={keyFragments}
        detectorUses={detectorUses}
      />
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
