import { describe, expect, it } from 'vitest'
import { resolveAssetUrl } from './assetUrl'

describe('resolveAssetUrl', () => {
  it('places root-style assets under the GitHub Pages repository path', () => {
    expect(
      resolveAssetUrl(
        '/images/stage1_hallway.png',
        '/dont-trust-anyone/',
      ),
    ).toBe('/dont-trust-anyone/images/stage1_hallway.png')
  })

  it('normalizes base and relative path slashes', () => {
    expect(
      resolveAssetUrl('./audio/main.mp3', '/dont-trust-anyone'),
    ).toBe('/dont-trust-anyone/audio/main.mp3')
  })

  it('keeps external and data URLs unchanged', () => {
    expect(
      resolveAssetUrl('https://example.com/image.png', '/repository/'),
    ).toBe('https://example.com/image.png')
    expect(resolveAssetUrl('data:image/png;base64,abc', '/repository/')).toBe(
      'data:image/png;base64,abc',
    )
  })
})
