import { describe, expect, it, vi } from 'vitest'
import type { PreloadableImage } from './imagePreloader'
import { ImagePreloader } from './imagePreloader'

function createHarness() {
  const images: PreloadableImage[] = []
  const factory = vi.fn(() => {
    const image: PreloadableImage = {
      src: '',
      onload: null,
      onerror: null,
    }
    images.push(image)
    return image
  })

  return { images, factory }
}

describe('ImagePreloader', () => {
  it('starts loading immediately and resolves when the image loads', async () => {
    const { images, factory } = createHarness()
    const preloader = new ImagePreloader(factory)
    const result = preloader.preload('/images/stage2.png')

    expect(images[0].src).toBe('/images/stage2.png')
    expect(preloader.has('/images/stage2.png')).toBe(true)
    images[0].onload?.()

    await expect(result).resolves.toBe('loaded')
  })

  it('reuses the same cache entry instead of requesting twice', () => {
    const { factory } = createHarness()
    const preloader = new ImagePreloader(factory)
    const firstResult = preloader.preload('/images/stage2.png')
    const secondResult = preloader.preload('/images/stage2.png')

    expect(secondResult).toBe(firstResult)
    expect(factory).toHaveBeenCalledOnce()
  })

  it('absorbs load errors and synchronous browser failures', async () => {
    const { images, factory } = createHarness()
    const preloader = new ImagePreloader(factory)
    const missingResult = preloader.preload('/images/missing.png')
    images[0].onerror?.()

    await expect(missingResult).resolves.toBe('error')

    const unavailablePreloader = new ImagePreloader(() => {
      throw new Error('Image is unavailable')
    })

    await expect(
      unavailablePreloader.preload('/images/unavailable.png'),
    ).resolves.toBe('error')
  })

  it('deduplicates a preload batch', () => {
    const { factory } = createHarness()
    const preloader = new ImagePreloader(factory)

    void preloader.preloadAll(['/images/a.png', '/images/a.png', ''])

    expect(factory).toHaveBeenCalledOnce()
  })
})
