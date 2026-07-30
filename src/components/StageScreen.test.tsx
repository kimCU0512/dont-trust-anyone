import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import { toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import { StageScreen } from './StageScreen'
import {
  advanceStageTextStep,
  areStageChoicesEnabled,
  getDetectorDisabledReason,
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
        detectorUsedThisStage={false}
        detectorAvailable
        onUseDetector={() => null}
        onSelectChoice={() => undefined}
      />,
    )

    expect(html).toContain(stage.name)
    expect(html).toContain(stage.imageUrl)
    expect(html).toContain(toDisplayText(stage.choices[0].text))
    expect(html).toContain('data-resource="hearts"')
    expect(html).toContain('disabled=""')
    expect(html).toContain(UI_STRINGS.detectorWaitForVoice)
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
        hearts: 1,
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
})
