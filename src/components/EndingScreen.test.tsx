import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import story from '../data/story.json'
import { EndingScreen } from './EndingScreen'

describe('EndingScreen', () => {
  it.each([
    ['true', 'P-30', UI_STRINGS.trueEndingImageAlt],
    ['bad', 'P-31', UI_STRINGS.badEndingImageAlt],
  ] as const)('renders the %s ending artwork and label', (ending, page, alt) => {
    const html = renderToStaticMarkup(
      <EndingScreen
        ending={ending}
        onReturnToTitle={() => undefined}
      />,
    )

    expect(html).toContain(`data-screen="${page}"`)
    expect(html).toContain(story.endings[ending].imageUrl)
    expect(html).toContain(story.endings[ending].label)
    expect(html).toContain(alt)
    expect(html).not.toContain(`>${UI_STRINGS.playAgain}</button>`)
  })

  it('shows the key-fragment hint only for the bad ending', () => {
    const badHtml = renderToStaticMarkup(
      <EndingScreen ending="bad" onReturnToTitle={() => undefined} />,
    )
    const trueHtml = renderToStaticMarkup(
      <EndingScreen ending="true" onReturnToTitle={() => undefined} />,
    )

    expect(badHtml).toContain(UI_STRINGS.endingHint)
    expect(trueHtml).not.toContain(UI_STRINGS.endingHint)
  })
})
