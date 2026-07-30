import { useEffect, useReducer, useRef, useState } from 'react'
import { STAGE_TRANSITION_MS, UI_STRINGS } from '../constants'
import { resolveAssetUrl } from '../assets/assetUrl'
import { toDisplayParagraphs, toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import type { DetectorResult as DetectorResultType, StageId } from '../types'
import { DetectorResult } from './DetectorResult'
import { Hud } from './Hud'
import { TextBox } from './TextBox'
import {
  advanceStageTextStep,
  areStageChoicesEnabled,
  createStageInteractionState,
  getDetectorDisabledReason,
  stageInteractionReducer,
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
  const [imageUrl, setImageUrl] = useState<string | null>(
    resolveAssetUrl(stage.imageUrl),
  )
  const [detectorAnimationResult, setDetectorAnimationResult] =
    useState<DetectorResultType | null>(null)
  const [detectorAnimating, setDetectorAnimating] = useState(false)
  const [interaction, dispatchInteraction] = useReducer(
    stageInteractionReducer,
    undefined,
    createStageInteractionState,
  )
  const transitionTimerRef = useRef<number | null>(null)
  const narration = toDisplayParagraphs(stage.narration)
  const voiceText = `“${toDisplayText(voiceLine.text)}”`
  const inputLocked = interaction.selection !== null
  const choicesEnabled = areStageChoicesEnabled(
    textStep,
    detectorAnimating,
    inputLocked,
  )
  const detectorDisabledReason = getDetectorDisabledReason({
    textStep,
    hearts,
    detectorUses,
    detectorUsedThisStage,
  })
  const detectorEnabled =
    choicesEnabled && detectorAvailable && detectorDisabledReason === null

  useEffect(
    () => () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current)
      }
    },
    [],
  )

  const advanceText = () => {
    setTextStep((currentStep) => advanceStageTextStep(currentStep))
  }

  const handleImageError = () => {
    const stageFallback =
      'fallbackImageUrl' in stage && stage.fallbackImageUrl
        ? resolveAssetUrl(stage.fallbackImageUrl)
        : null

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

  const handleSelectChoice = (choice: (typeof stage.choices)[number]) => {
    dispatchInteraction({
      type: 'SELECT_CHOICE',
      selection: {
        choiceId: choice.id,
        isCorrect: choice.isCorrect,
        resultText: toDisplayText(
          choice.isCorrect ? stage.resultText.correct : stage.resultText.wrong,
        ),
      },
    })
  }

  const handleResultComplete = () => {
    if (!interaction.selection || transitionTimerRef.current !== null) {
      return
    }

    dispatchInteraction({ type: 'BEGIN_TRANSITION' })
    transitionTimerRef.current = window.setTimeout(() => {
      onSelectChoice(interaction.selection?.choiceId ?? '')
    }, STAGE_TRANSITION_MS)
  }

  return (
    <section
      className={`screen screen--stage${interaction.exiting ? ' stage-screen--exiting' : ''}`}
      data-screen="P-10"
      aria-busy={inputLocked}
    >
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
        {interaction.selection ? (
          <div
            className={`stage-result stage-result--${interaction.selection.isCorrect ? 'correct' : 'wrong'}`}
          >
            <p className="stage-result__verdict">
              {interaction.selection.isCorrect
                ? UI_STRINGS.choiceCorrect
                : UI_STRINGS.choiceWrong}
            </p>
            <TextBox
              key={`stage-${stageId}-result-${interaction.selection.choiceId}`}
              paragraphs={[interaction.selection.resultText]}
              speaker="system"
              onComplete={handleResultComplete}
            />
          </div>
        ) : (
          <>
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
          </>
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
              onClick={() => handleSelectChoice(choice)}
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
          title={
            inputLocked
              ? UI_STRINGS.stageInteractionLocked
              : (detectorDisabledReason ?? undefined)
          }
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
      {interaction.exiting && (
        <p className="stage-transition-lock" role="status">
          {UI_STRINGS.stageTransitioning}
        </p>
      )}
    </section>
  )
}
