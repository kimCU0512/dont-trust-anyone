import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import { toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import { StageScreen } from './StageScreen'
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

describe('StageScreen', () => {
  it('renders story data, image slot, HUD, and locked controls', () => {
    const stage = story.stages[0]
    const html = renderToStaticMarkup(
      <StageScreen
        stageId={1}
        hearts={3}
        keyFragments={0}
        detectorUses={2}
        currentVoiceLineId="s1-v1"
        currentChoiceIds={['A', 'B', 'C']}
        currentIntrusionText={stage.intrusionTexts[0]}
        detectorUsedThisStage={false}
        detectorAvailable
        evidenceEntries={[]}
        bgmEnabled
        bgmVolume={0.45}
        sfxEnabled
        sfxVolume={0.6}
        onToggleSfx={() => undefined}
        onSfxVolumeChange={() => undefined}
        onToggleBgm={() => undefined}
        onBgmVolumeChange={() => undefined}
        onUseDetector={() => null}
        onSelectChoice={() => undefined}
        onDiscoverEvidence={() => undefined}
      />,
    )

    expect(html).toContain(stage.name)
    expect(html).toContain(stage.imageUrl)
    expect(html).not.toContain(toDisplayText(stage.choices[0].text))
    expect(html).toContain('현장 대조 중')
    expect(html).toContain('data-resource="hearts"')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain(UI_STRINGS.detectorAction)
    expect(html).toContain(UI_STRINGS.stageDialogueSkip)
  })

  it('layers dialogue inside the image before controls', () => {
    const html = renderToStaticMarkup(
      <StageScreen
        stageId={1}
        hearts={3}
        keyFragments={0}
        detectorUses={2}
        currentVoiceLineId="s1-v1"
        currentChoiceIds={['A', 'B', 'C']}
        currentIntrusionText={story.stages[0].intrusionTexts[0]}
        detectorUsedThisStage={false}
        detectorAvailable
        evidenceEntries={[]}
        bgmEnabled
        bgmVolume={0.45}
        sfxEnabled
        sfxVolume={0.6}
        onToggleSfx={() => undefined}
        onSfxVolumeChange={() => undefined}
        onToggleBgm={() => undefined}
        onBgmVolumeChange={() => undefined}
        onUseDetector={() => null}
        onSelectChoice={() => undefined}
        onDiscoverEvidence={() => undefined}
      />,
    )
    const imagePosition = html.indexOf('stage-scene')
    const textPosition = html.indexOf('stage-dialogue')
    const controlsPosition = html.indexOf('stage-controls')

    expect(imagePosition).toBeGreaterThan(-1)
    expect(imagePosition).toBeLessThan(textPosition)
    expect(textPosition).toBeLessThan(controlsPosition)
    expect(html).toContain('stage-hotspot')
    expect(html).toContain(UI_STRINGS.stageExploreHint)
    expect(html).not.toContain('EVIDENCE COMPLETE')
  })

  it('orders narration before voice and choices', () => {
    const voiceStep = advanceStageTextStep('narration')
    const choiceStep = advanceStageTextStep(voiceStep)

    expect(voiceStep).toBe('voice')
    expect(choiceStep).toBe('choice')
  })

  it('returns a reason when hearts are too low', () => {
    expect(
      getDetectorDisabledReason({
        textStep: 'choice',
        hearts: 0,
        detectorUses: 1,
        detectorUsedThisStage: false,
      }),
    ).toBe(UI_STRINGS.detectorLowHearts)
  })

  it('returns reasons for no uses and same-stage reuse', () => {
    expect(
      getDetectorDisabledReason({
        textStep: 'choice',
        hearts: 3,
        detectorUses: 0,
        detectorUsedThisStage: false,
      }),
    ).toBe(UI_STRINGS.detectorNoUses)

    expect(
      getDetectorDisabledReason({
        textStep: 'choice',
        hearts: 2,
        detectorUses: 1,
        detectorUsedThisStage: true,
      }),
    ).toBe(UI_STRINGS.detectorAlreadyUsed)
  })

  it('locks choices during detector animation and restores them after', () => {
    expect(areStageChoicesEnabled('choice', true)).toBe(false)
    expect(areStageChoicesEnabled('choice', false)).toBe(true)
  })

  it('shows one memory intrusion only after every stage object is discovered', () => {
    expect(shouldShowMemoryIntrusion(2, 3, false)).toBe(false)
    expect(shouldShowMemoryIntrusion(3, 3, false)).toBe(true)
    expect(shouldShowMemoryIntrusion(3, 3, true)).toBe(false)
  })

  it('keeps the decision panel hidden until the memory intrusion is closed', () => {
    expect(isStageDecisionReady(true, false, false, true)).toBe(false)
    expect(isStageDecisionReady(true, false, false, false)).toBe(true)
  })

  it('highlights only the correct choice after using the detector', () => {
    expect(isDetectorRevealedCorrectChoice(false, true)).toBe(false)
    expect(isDetectorRevealedCorrectChoice(true, false)).toBe(false)
    expect(isDetectorRevealedCorrectChoice(true, true)).toBe(true)
  })

  it('locks every choice after the first selection and ignores duplicates', () => {
    const initialState = createStageInteractionState()
    const firstSelection = {
      choiceId: 'A',
      isCorrect: true,
      resultText: '첫 번째 판정',
    }
    const selectedState = stageInteractionReducer(initialState, {
      type: 'SELECT_CHOICE',
      selection: firstSelection,
    })
    const duplicateState = stageInteractionReducer(selectedState, {
      type: 'SELECT_CHOICE',
      selection: {
        choiceId: 'B',
        isCorrect: false,
        resultText: '중복 판정',
      },
    })

    expect(selectedState.selection).toEqual(firstSelection)
    expect(duplicateState).toBe(selectedState)
    expect(areStageChoicesEnabled('choice', false, true)).toBe(false)
  })

  it('starts a fade transition only after a selection exists', () => {
    const initialState = createStageInteractionState()
    const unchangedState = stageInteractionReducer(initialState, {
      type: 'BEGIN_TRANSITION',
    })
    const selectedState = stageInteractionReducer(initialState, {
      type: 'SELECT_CHOICE',
      selection: {
        choiceId: 'B',
        isCorrect: false,
        resultText: '실패 서술',
      },
    })
    const exitingState = stageInteractionReducer(selectedState, {
      type: 'BEGIN_TRANSITION',
    })

    expect(unchangedState).toBe(initialState)
    expect(exitingState.exiting).toBe(true)
  })
})
