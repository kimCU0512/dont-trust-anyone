import { resolveAssetUrl } from '../assets/assetUrl'
import { SFX_VOLUME } from '../constants'

export const SFX_SOURCES = {
  click: '/images/audio/sfx/click/dragon-studio-mouse-click-4-393911.mp3',
  correct:
    '/images/audio/sfx/correct/freesound_community-coins-falling-013-36967.mp3',
  detector:
    '/images/audio/sfx/detector/freesound_community-smoke-detector-90594.mp3',
  incorrect:
    '/images/audio/sfx/incorrect/dragon-studio-violent-sword-slice-2-393841.mp3',
  moving:
    '/images/audio/sfx/move/moving/dragon-studio-footsteps-on-wood-397989.mp3',
  start:
    '/images/audio/sfx/move/start/freesound_community-school-door-with-metal-latch-96124.mp3',
} as const

export type SfxId = keyof typeof SFX_SOURCES

export interface SfxAudio {
  loop: boolean
  volume: number
  currentTime: number
  addEventListener: (
    type: 'ended' | 'error',
    listener: () => void,
    options?: { once: boolean },
  ) => void
  play: () => Promise<void> | void
}

type AudioFactory = (source: string) => SfxAudio
const createBrowserAudio: AudioFactory = (source) => new Audio(source)

export class SfxManager {
  private enabled = true
  private volume = SFX_VOLUME

  constructor(private readonly audioFactory = createBrowserAudio) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
  }

  play(id: SfxId, onEnded?: () => void): void {
    if (!this.enabled || this.volume === 0 || typeof window === 'undefined') {
      onEnded?.()
      return
    }

    try {
      const audio = this.audioFactory(resolveAssetUrl(SFX_SOURCES[id]))
      let completed = false
      const complete = () => {
        if (completed) {
          return
        }
        completed = true
        onEnded?.()
      }
      audio.loop = false
      audio.volume = this.volume
      audio.currentTime = 0
      audio.addEventListener('ended', complete, { once: true })
      audio.addEventListener('error', complete, { once: true })
      const result = audio.play()

      if (result && 'catch' in result) {
        void result.catch(complete)
      }
    } catch {
      // Missing files or unsupported audio must never block interaction.
      onEnded?.()
    }
  }
}
