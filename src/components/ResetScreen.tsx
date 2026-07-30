import { useState } from 'react'
import { UI_STRINGS } from '../constants'
import { toDisplayParagraphs } from '../data/contentText'
import story from '../data/story.json'
import { ConclusionArtwork } from './ConclusionArtwork'
import { TextBox } from './TextBox'
import {
  completeConclusionText,
  createConclusionFlowState,
} from './conclusionFlow'

interface ResetScreenProps {
  onRestart: () => void
}

export function ResetScreen({ onRestart }: ResetScreenProps) {
  const [flow, setFlow] = useState(createConclusionFlowState)
  const reset = story.reset

  return (
    <section className="screen screen--reset" data-screen="P-20">
      <header className="conclusion-heading">
        <p className="screen__code">P-20 / RESET</p>
        <h1 className="screen__heading">{UI_STRINGS.resetHeading}</h1>
        <p>{UI_STRINGS.resetSubheading}</p>
      </header>

      <ConclusionArtwork
        imageUrl={reset.imageUrl}
        alt={UI_STRINGS.resetImageAlt}
        variant="reset"
      />

      <div className="conclusion-copy">
        <TextBox
          paragraphs={toDisplayParagraphs(reset.text)}
          speaker="system"
          onComplete={() => setFlow(completeConclusionText)}
        />
      </div>

      {flow.textComplete && (
        <button className="screen__action" type="button" onClick={onRestart}>
          {UI_STRINGS.restart}
        </button>
      )}
    </section>
  )
}
