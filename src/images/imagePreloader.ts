export type ImagePreloadStatus = 'loaded' | 'error'

export interface PreloadableImage {
  src: string
  onload: (() => void) | null
  onerror: (() => void) | null
}

type ImageFactory = () => PreloadableImage

interface PreloadEntry {
  image: PreloadableImage | null
  result: Promise<ImagePreloadStatus>
}

function createBrowserImage(): PreloadableImage {
  return new Image() as unknown as PreloadableImage
}

export class ImagePreloader {
  private readonly imageFactory: ImageFactory
  private readonly entries = new Map<string, PreloadEntry>()

  constructor(imageFactory: ImageFactory = createBrowserImage) {
    this.imageFactory = imageFactory
  }

  preload(source: string): Promise<ImagePreloadStatus> {
    const cachedEntry = this.entries.get(source)

    if (cachedEntry) {
      return cachedEntry.result
    }

    let image: PreloadableImage | null = null
    const result = new Promise<ImagePreloadStatus>((resolve) => {
      try {
        image = this.imageFactory()
        image.onload = () => resolve('loaded')
        image.onerror = () => resolve('error')
        image.src = source
      } catch {
        resolve('error')
      }
    })

    this.entries.set(source, { image, result })
    return result
  }

  preloadAll(sources: string[]): Promise<ImagePreloadStatus[]> {
    return Promise.all(
      [...new Set(sources)].filter(Boolean).map((source) => this.preload(source)),
    )
  }

  has(source: string): boolean {
    return this.entries.has(source)
  }
}

export const gameImagePreloader = new ImagePreloader()
