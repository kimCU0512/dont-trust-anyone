import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import story from '../data/story.json'
import { ResetScreen } from './ResetScreen'

describe('ResetScreen', () => {
  it('renders a distinct failure scene and waits to reveal restart', () => {
    const html = renderToStaticMarkup(
      <ResetScreen onRestart={() => undefined} />,
    )

    expect(html).toContain('data-screen="P-20"')
    expect(html).toContain(story.reset.imageUrl)
    expect(html).toContain(UI_STRINGS.resetHeading)
    expect(html).toContain(UI_STRINGS.resetImageAlt)
    expect(html).not.toContain(`>${UI_STRINGS.restart}</button>`)
  })
})
