import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UI_STRINGS } from '../constants'
import { BgmControl } from './BgmControl'

describe('BgmControl', () => {
  it.each([
    [true, UI_STRINGS.bgmOn],
    [false, UI_STRINGS.bgmOff],
  ])('renders the global enabled state %s', (isEnabled, label) => {
    const html = renderToStaticMarkup(
      <BgmControl
        isEnabled={isEnabled}
        onToggle={() => undefined}
      />,
    )

    expect(html).toContain(`aria-pressed="${isEnabled}"`)
    expect(html).toContain(`>${label}</button>`)
  })
})
