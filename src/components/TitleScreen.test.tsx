import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TITLE_BACKGROUND_URL, UI_STRINGS } from '../constants'
import { TitleScreen } from './TitleScreen'

describe('TitleScreen', () => {
  it('renders the title, start action, and background slot', () => {
    const html = renderToStaticMarkup(<TitleScreen onStart={() => undefined} />)

    expect(html).toContain(UI_STRINGS.title)
    expect(html).toContain(UI_STRINGS.start)
    expect(html).toContain(TITLE_BACKGROUND_URL)
    expect(html).toContain('title-backdrop__fallback')
  })
})
