import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import { toDisplayParagraphs, toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import { IntroScreen } from './IntroScreen'
import {
  advanceIntroStep,
  canEnterFirstStage,
} from './introFlow'

describe('IntroScreen flow', () => {
  it('requires narration and tutorial completion before stage entry', () => {
    const tutorialStep = advanceIntroStep('narration')
    const readyStep = advanceIntroStep(tutorialStep)

    expect(tutorialStep).toBe('tutorial')
    expect(canEnterFirstStage(tutorialStep)).toBe(false)
    expect(readyStep).toBe('ready')
    expect(canEnterFirstStage(readyStep)).toBe(true)
  })

  it('contains the required detector symbols in the tutorial data', () => {
    const tutorial = toDisplayParagraphs(story.intro.tutorial).join(' ')

    expect(tutorial).toContain('.....')
    expect(tutorial).toContain('.|.|.|.')
    expect(tutorial).toContain('진실')
    expect(tutorial).toContain('거짓')
  })

  it('removes content flags and authoring backticks from displayed text', () => {
    expect(toDisplayText('TODO_CONTENT: `.....`은 진실')).toBe(
      '.....은 진실',
    )
  })

  it('does not expose the stage entry action on initial render', () => {
    const html = renderToStaticMarkup(
      <IntroScreen onContinue={() => undefined} />,
    )

    expect(html).toContain('data-screen="P-01"')
    expect(html).toContain(story.intro.imageUrl)
    expect(html).toContain(UI_STRINGS.stageDialogueSkip)
    expect(html).not.toContain(UI_STRINGS.enterStageOne)
  })
})
