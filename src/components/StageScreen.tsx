import { useEffect, useReducer, useRef, useState } from 'react'
import {
  STAGE_TRANSITION_MS,
  UI_STRINGS,
  WRONG_CHOICE_HEART_COST,
} from '../constants'
import { resolveAssetUrl } from '../assets/assetUrl'
import { toDisplayParagraphs, toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import type {
  DetectorResult as DetectorResultType,
  EvidenceEntry,
  StageId,
} from '../types'
import { DetectorResult, DetectorScanning } from './DetectorResult'
import { BgmControl } from './BgmControl'
import { EvidenceJournal } from './EvidenceJournal'
import { Hud } from './Hud'
import { TextBox } from './TextBox'
import {
  advanceStageTextStep,
  areStageChoicesEnabled,
  createStageInteractionState,
  getDetectorDisabledReason,
  isDetectorRevealedCorrectChoice,
  isStageDecisionReady,
  shouldShowMemoryIntrusion,
  stageInteractionReducer,
} from './stageScreenState'
import type { StageTextStep } from './stageScreenState'
import type { SfxId } from '../audio/sfxManager'

const CHOICE_COMMIT_MS = 720

interface StageScreenProps {
  stageId: StageId
  hearts: number
  keyFragments: number
  detectorUses: number
  currentVoiceLineId: string
  currentChoiceIds: string[]
  currentIntrusionText: string
  detectorUsedThisStage: boolean
  detectorAvailable: boolean
  evidenceEntries: EvidenceEntry[]
  bgmEnabled: boolean
  bgmVolume: number
  onToggleBgm: () => void
  onBgmVolumeChange: (volume: number) => void
  sfxEnabled: boolean
  sfxVolume: number
  onToggleSfx: () => void
  onSfxVolumeChange: (volume: number) => void
  onPlaySfx?: (id: SfxId, onEnded?: () => void) => void
  onUseDetector: () => DetectorResultType | null
  onSelectChoice: (choiceId: string) => void
  onDiscoverEvidence: (entry: EvidenceEntry) => void
  onRestart?: () => void
}

export function StageScreen({
  stageId,
  hearts,
  keyFragments,
  detectorUses,
  currentVoiceLineId,
  currentChoiceIds,
  currentIntrusionText,
  detectorUsedThisStage,
  detectorAvailable,
  evidenceEntries,
  bgmEnabled,
  bgmVolume,
  sfxEnabled,
  sfxVolume,
  onToggleSfx,
  onSfxVolumeChange,
  onPlaySfx = (_id, onEnded) => onEnded?.(),
  onToggleBgm,
  onBgmVolumeChange,
  onUseDetector,
  onSelectChoice,
  onDiscoverEvidence,
  onRestart,
}: StageScreenProps) {
  const stage = story.stages.find((candidate) => candidate.id === stageId)

  if (!stage) {
    throw new Error(`Stage ${stageId} does not exist`)
  }

  const voiceLine =
    stage.voiceLines.find((candidate) => candidate.id === currentVoiceLineId) ??
    stage.voiceLines[0]
  const stageChoices = currentChoiceIds
    .map((choiceId) =>
      stage.choices.find((candidate) => candidate.id === choiceId),
    )
    .filter((choice): choice is (typeof stage.choices)[number] =>
      Boolean(choice),
    )
  const [textStep, setTextStep] = useState<StageTextStep>('narration')
  const [imageUrl, setImageUrl] = useState<string | null>(
    resolveAssetUrl(stage.imageUrl),
  )
  const [detectorAnimationResult, setDetectorAnimationResult] =
    useState<DetectorResultType | null>(null)
  const [detectorAnimating, setDetectorAnimating] = useState(false)
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null)
  const [discoveredObjectIds, setDiscoveredObjectIds] = useState<string[]>([])
  const [intrusionSeen, setIntrusionSeen] = useState(false)
  const [sceneIntruding, setSceneIntruding] = useState(false)
  const [selectionRevealReady, setSelectionRevealReady] = useState(false)
  const [interaction, dispatchInteraction] = useReducer(
    stageInteractionReducer,
    undefined,
    createStageInteractionState,
  )
  const transitionTimerRef = useRef<number | null>(null)
  const selectionRevealTimerRef = useRef<number | null>(null)
  const narration = toDisplayParagraphs(stage.narration)
  const voiceText = `“${toDisplayText(voiceLine.text)}”`
  const inputLocked = interaction.selection !== null
  const interactionLocked = inputLocked || sceneIntruding
  const baseChoicesEnabled = areStageChoicesEnabled(
    textStep,
    detectorAnimating,
    interactionLocked,
  )
  const investigationComplete =
    discoveredObjectIds.length === stage.objects.length
  const decisionReady = isStageDecisionReady(
    investigationComplete,
    activeObjectId !== null,
    interaction.selection !== null,
    sceneIntruding,
  )
  const choicesEnabled =
    baseChoicesEnabled && decisionReady && detectorAnimationResult === null
  const activeObject = stage.objects.find(
    (object) => object.id === activeObjectId,
  )
  const detectorDisabledReason = getDetectorDisabledReason({
    textStep,
    hearts,
    detectorUses,
    detectorUsedThisStage,
  })
  const detectorEnabled =
    baseChoicesEnabled &&
    activeObjectId === null &&
    detectorAvailable &&
    detectorDisabledReason === null

  useEffect(
    () => () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current)
      }
      if (selectionRevealTimerRef.current !== null) {
        window.clearTimeout(selectionRevealTimerRef.current)
      }
    },
    [],
  )

  const advanceText = () => {
    setTextStep((currentStep) => advanceStageTextStep(currentStep))
  }

  const skipDialogue = () => {
    if (textStep !== 'choice' && !interactionLocked) {
      setTextStep('choice')
    }
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
    if (detectorAnimationResult !== null) {
      setDetectorAnimationResult(null)
      setDetectorAnimating(false)
      return
    }

    if (!detectorEnabled) {
      return
    }

    const result = onUseDetector()

    if (result) {
      setDetectorAnimating(true)
      onPlaySfx('detector', () => {
        setDetectorAnimationResult(result)
      })
    }
  }

  const handleSelectChoice = (choice: (typeof stage.choices)[number]) => {
    if (choice.isCorrect) {
      onPlaySfx('correct')
    } else if (hearts > 0 && WRONG_CHOICE_HEART_COST > 0) {
      onPlaySfx('incorrect')
    }
    setSelectionRevealReady(choice.isCorrect)
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
    if (!choice.isCorrect) {
      selectionRevealTimerRef.current = window.setTimeout(() => {
        setSelectionRevealReady(true)
        selectionRevealTimerRef.current = null
      }, CHOICE_COMMIT_MS)
    }
  }

  const handleInspectObject = (objectId: string) => {
    if (textStep !== 'choice' || interactionLocked) {
      return
    }

    setActiveObjectId(objectId)
    onPlaySfx('click')
    const inspectedObject = stage.objects.find(
      (object) => object.id === objectId,
    )

    if (inspectedObject) {
      onDiscoverEvidence({
        id: inspectedObject.id,
        stageId,
        stageName: stage.name,
        label: inspectedObject.label,
        imageUrl: inspectedObject.imageUrl,
        clue: inspectedObject.clue,
        deduction: inspectedObject.deduction,
      })
    }
    setDiscoveredObjectIds((currentIds) =>
      currentIds.includes(objectId) ? currentIds : [...currentIds, objectId],
    )
  }

  const handleCloseInspection = () => {
    setActiveObjectId(null)

    if (
      !shouldShowMemoryIntrusion(
        discoveredObjectIds.length,
        stage.objects.length,
        intrusionSeen,
      )
    ) {
      return
    }

    setIntrusionSeen(true)
    setSceneIntruding(true)
  }

  const handleResultComplete = () => {
    if (!interaction.selection || transitionTimerRef.current !== null) {
      return
    }

    dispatchInteraction({ type: 'BEGIN_TRANSITION' })
    if (stageId < 5) {
      onPlaySfx('moving')
    }
    transitionTimerRef.current = window.setTimeout(() => {
      onSelectChoice(interaction.selection?.choiceId ?? '')
    }, STAGE_TRANSITION_MS)
  }

  return (
    <section
      className={`screen screen--stage${interaction.exiting ? ' stage-screen--exiting' : ''}${sceneIntruding ? ' stage-screen--intruding' : ''}`}
      data-screen="P-10"
      aria-busy={interactionLocked}
    >
      <Hud
        hearts={hearts}
        keyFragments={keyFragments}
        detectorUses={detectorUses}
        onRestart={onRestart}
      />

      <div className="stage-workspace">
        <div
          className={`stage-playfield${decisionReady ? ' stage-playfield--decision' : ''}`}
        >
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
            <div
              className={`stage-hotspots${activeObject ? ' stage-hotspots--inspection-open' : ''}`}
              aria-label={UI_STRINGS.stageExploreHint}
            >
              {stage.objects.map((object, index) => {
                const discovered = discoveredObjectIds.includes(object.id)

                return (
                  <button
                    className={`stage-hotspot${discovered ? ' stage-hotspot--discovered' : ''}`}
                    type="button"
                    key={object.id}
                    style={{
                      left: `${object.position.x}%`,
                      top: `${object.position.y}%`,
                    }}
                    disabled={textStep !== 'choice' || interactionLocked}
                    aria-label={`${object.label} 조사`}
                    aria-pressed={activeObjectId === object.id}
                    onClick={() => handleInspectObject(object.id)}
                  >
                    <span>{index + 1}</span>
                  </button>
                )
              })}
            </div>
            <figcaption>
              <span>LOCATION</span>
              {stage.name}
            </figcaption>
            {textStep !== 'choice' && !interaction.selection && (
              <button
                type="button"
                className="stage-dialogue-skip"
                onClick={skipDialogue}
              >
                <span>SKIP</span>
                {UI_STRINGS.stageDialogueSkip}
              </button>
            )}
            {textStep === 'choice' && !interaction.selection && (
              <p className="stage-explore-hint">
                {UI_STRINGS.stageExploreHint}
                <span>
                  {discoveredObjectIds.length} / {stage.objects.length}
                </span>
              </p>
            )}

            <div className="stage-dialogue">
              {activeObject ? (
                <div className="object-inspection">
                  <img
                    src={resolveAssetUrl(activeObject.imageUrl)}
                    alt=""
                    className="object-inspection__image"
                  />
                  <div className="object-inspection__copy">
                    <span>{UI_STRINGS.objectDiscovered}</span>
                    <h2>{activeObject.label}</h2>
                    <p>{activeObject.clue}</p>
                  </div>
                  <button
                    type="button"
                    className="object-inspection__close"
                    onClick={handleCloseInspection}
                  >
                    {UI_STRINGS.objectClose}
                  </button>
                </div>
              ) : interaction.selection && selectionRevealReady ? (
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
                </>
              )}
            </div>
            {sceneIntruding && (
              <button
                type="button"
                className="stage-intrusion"
                aria-label="기억 침식 닫기"
                onClick={() => setSceneIntruding(false)}
              >
                <span>{UI_STRINGS.intrusionLabel}</span>
                <p>{currentIntrusionText}</p>
              </button>
            )}
          </figure>

          <div
            className={`stage-controls${decisionReady ? ' stage-controls--decision' : ' stage-controls--investigation'}`}
          >
            {decisionReady &&
            detectorAnimating &&
            detectorAnimationResult === null ? (
              <div className="stage-detector-panel">
                <DetectorScanning />
              </div>
            ) : decisionReady && detectorAnimationResult !== null ? (
              <div className="stage-detector-panel">
                <DetectorResult
                  key={detectorAnimationResult}
                  result={detectorAnimationResult}
                  onComplete={() => {
                    setDetectorAnimating(false)
                  }}
                />
                <button
                  className="stage-detector stage-detector--result-open"
                  type="button"
                  aria-expanded="true"
                  onClick={handleUseDetector}
                >
                  <span className="stage-detector__signal" aria-hidden="true">
                    ×
                  </span>
                  <span>
                    <strong>{UI_STRINGS.detectorClose}</strong>
                    <small>{UI_STRINGS.detectorSignalLocked}</small>
                  </span>
                </button>
              </div>
            ) : decisionReady ? (
              <div className="stage-choices">
                <p className="stage-decision__label">목소리를 판단하라</p>
                {stageChoices.map((choice, index) => (
                  <button
                    className={`stage-choice${
                      isDetectorRevealedCorrectChoice(
                        detectorUsedThisStage,
                        choice.isCorrect,
                      )
                        ? ' stage-choice--detector-correct'
                        : ''
                    }`}
                    type="button"
                    disabled={!choicesEnabled}
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {toDisplayText(choice.text)}
                  </button>
                ))}
                <button
                  className="stage-detector"
                  type="button"
                  disabled={!detectorEnabled}
                  title={
                    inputLocked
                      ? UI_STRINGS.stageInteractionLocked
                      : (detectorDisabledReason ?? undefined)
                  }
                  aria-expanded="false"
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
            ) : (
              <p className="stage-investigation-status">
                <span>현장 대조 중</span>
                기록 {discoveredObjectIds.length} / {stage.objects.length}
              </p>
            )}
          </div>
        </div>
        <div className="stage-side-panel">
          <BgmControl
            isEnabled={bgmEnabled}
            volume={bgmVolume}
            onToggle={onToggleBgm}
            onVolumeChange={onBgmVolumeChange}
            sfxEnabled={sfxEnabled}
            sfxVolume={sfxVolume}
            onToggleSfx={onToggleSfx}
            onSfxVolumeChange={onSfxVolumeChange}
          />
          <EvidenceJournal
            entries={evidenceEntries}
            currentVoiceText={voiceText}
            currentStageId={stageId}
          />
        </div>
      </div>
      {interaction.selection?.isCorrect === false && !selectionRevealReady && (
        <div
          className="choice-commit-veil choice-commit-veil--wrong"
          role="status"
          aria-label="선택 처리 중"
        />
      )}
      {interaction.exiting && (
        <p className="stage-transition-lock" role="status">
          {UI_STRINGS.stageTransitioning}
        </p>
      )}
    </section>
  )
}
