import { useState } from 'react'
import { UI_STRINGS } from '../constants'
import { toDisplayParagraphs, toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import type { DetectorResult as DetectorResultType, StageId } from '../types'
import { DetectorResult } from './DetectorResult'
import { Hud } from './Hud'
import { TextBox } from './TextBox'
import {
  advanceStageTextStep,
  areStageChoicesEnabled,
  getDetectorDisabledReason,
} from './stageScreenState'
import type { StageTextStep } from './stageScreenState'

interface StageScreenProps {
  stageId: StageId
  hearts: number
  keyFragments: number
  detectorUses: number
  currentVoiceLineId: string
  detectorUsedThisStage: boolean
  detectorAvailable: boolean
  onUseDetector: () => DetectorResultType | null
  onSelectChoice: (choiceId: string) => void
}

export function StageScreen({
  stageId,
  hearts,
  keyFragments,
  detectorUses,
  currentVoiceLineId,
  detectorUsedThisStage,
  detectorAvailable,
  onUseDetector,
  onSelectChoice,
}: StageScreenProps) {
  const stage = story.stages.find((candidate) => candidate.id === stageId)

  if (!stage) {
    throw new Error(`Stage ${stageId} does not exist`)
  }

  const voiceLine =
    stage.voiceLines.find((candidate) => candidate.id === currentVoiceLineId) ??
    stage.voiceLines[0]
  const [textStep, setTextStep] = useState<StageTextStep>('narration')
  const [imageUrl, setImageUrl] = useState<string | null>(stage.imageUrl)
  const [detectorAnimationResult, setDetectorAnimationResult] =
    useState<DetectorResultType | null>(null)
  const [detectorAnimating, setDetectorAnimating] = useState(false)
  const narration = toDisplayParagraphs(stage.narration)
  const voiceText = `“${toDisplayText(voiceLine.text)}”`
  const choicesEnabled = areStageChoicesEnabled(
    textStep,
    detectorAnimating,
  )
  const detectorDisabledReason = getDetectorDisabledReason({
    textStep,
    hearts,
    detectorUses,
    detectorUsedThisStage,
  })
  const detectorEnabled =
    choicesEnabled && detectorAvailable && detectorDisabledReason === null

  const advanceText = () => {
    setTextStep((currentStep) => advanceStageTextStep(currentStep))
  }

  const handleImageError = () => {
    const stageFallback =
      'fallbackImageUrl' in stage ? stage.fallbackImageUrl : null

    if (stageFallback && imageUrl !== stageFallback) {
      setImageUrl(stageFallback)
      return
    }

    setImageUrl(null)
  }

  const handleUseDetector = () => {
    if (!detectorEnabled) {
      return
    }

    const result = onUseDetector()

    if (result) {
      setDetectorAnimationResult(result)
      setDetectorAnimating(true)
    }
  }

  return (
    <section className="screen screen--stage" data-screen="P-10">
      <Hud
        hearts={hearts}
        keyFragments={keyFragments}
        detectorUses={detectorUses}
      />

      <header className="stage-heading">
        <div>
          <p className="screen__code">P-10 / STAGE 0{stageId}</p>
          <h1>
            <span>0{stageId}.</span> {stage.name}
          </h1>
        </div>
        <span className="stage-heading__track">{stage.bgmTrack}</span>
      </header>

      <figure
        className={`stage-scene stage-scene--${stageId}`}
        aria-label={`${stage.name}${UI_STRINGS.stageImageAltSuffix}`}
      >
        <div className="stage-scene__fallback" aria-hidden="true">
          <span className="stage-scene__architecture" />
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="" onError={handleImageError} />
        )}
        <span className="stage-scene__shade" aria-hidden="true" />
        <figcaption>
          <span>LOCATION</span>
          {stage.name}
        </figcaption>
      </figure>

      <div className="stage-dialogue">
        {textStep === 'narration' && (
          <TextBox
            key={`stage-${stageId}-narration`}
            paragraphs={narration}
            onComplete={advanceText}
          />
        )}

        {textStep === 'voice' && (
          <TextBox
            key={`stage-${stageId}-voice`}
            paragraphs={[voiceText]}
            speaker="voice"
            onComplete={advanceText}
          />
        )}

        {textStep === 'choice' && detectorAnimationResult === null && (
          <div
            className="text-box text-box--voice stage-dialogue__complete"
            aria-label={UI_STRINGS.textBoxVoice}
          >
            <span className="text-box__header">
              <span className="text-box__speaker">
                {UI_STRINGS.textBoxVoice}
              </span>
              <span>{UI_STRINGS.stageVoiceReady}</span>
            </span>
            <span className="text-box__body">{voiceText}</span>
          </div>
        )}

        {textStep === 'choice' && detectorAnimationResult !== null && (
          <DetectorResult
            key={detectorAnimationResult}
            result={detectorAnimationResult}
            onComplete={() => setDetectorAnimating(false)}
          />
        )}
      </div>

      <div className="stage-controls">
        <div className="stage-choices">
          {stage.choices.map((choice) => (
            <button
              className="stage-choice"
              type="button"
              disabled={!choicesEnabled}
              key={choice.id}
              onClick={() => onSelectChoice(choice.id)}
            >
              <span>{choice.id}</span>
              {toDisplayText(choice.text)}
            </button>
          ))}
        </div>
        <button
          className="stage-detector"
          type="button"
          disabled={!detectorEnabled}
          title={detectorDisabledReason ?? undefined}
          onClick={handleUseDetector}
        >
          <span className="stage-detector__signal" aria-hidden="true">
            ⌁
          </span>
          <span>
            <strong>{UI_STRINGS.detectorAction}</strong>
            <small>{UI_STRINGS.detectorCost}</small>
          </span>
        </button>
      </div>
    </section>
  )
}
