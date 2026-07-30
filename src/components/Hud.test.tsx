import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Hud } from './Hud'

describe('Hud', () => {
  it('renders all three game resources', () => {
    const html = renderToStaticMarkup(
      <Hud hearts={3} keyFragments={2} detectorUses={1} />,
    )

    expect(html).toContain('data-resource="hearts"')
    expect(html).toContain('data-resource="key-fragments"')
    expect(html).toContain('data-resource="detector-uses"')
    expect(html).toContain('aria-label="하트 3"')
    expect(html).toContain('aria-label="열쇠조각 2"')
    expect(html).toContain('aria-label="탐지기 1"')
  })

  it('reflects changed resource values', () => {
    const html = renderToStaticMarkup(
      <Hud hearts={1} keyFragments={4} detectorUses={0} />,
    )

    expect(html).toContain('data-resource="hearts" data-value="1"')
    expect(html).toContain('data-resource="key-fragments" data-value="4"')
    expect(html).toContain('data-resource="detector-uses" data-value="0"')
  })
})
