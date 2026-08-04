import {
  BGM_FADE_DURATION_MS,
  BGM_FADE_STEP_MS,
  BGM_VOLUME,
} from '../constants'
import { resolveAssetUrl } from '../assets/assetUrl'

export interface BgmAudio {
  loop: boolean
  preload: string
  volume: number
  play: () => Promise<void> | void
  pause: () => void
  addEventListener?: (
    type: 'ended',
    listener: () => void,
    options?: { once: boolean },
  ) => void
}

export const MAIN_BGM_SOURCES = [
  '/images/audio/bgm/main/125651__dariachic__eerie-ambience-wine-glasses.wav',
  '/images/audio/bgm/main/219418__medude113__mysterious-sound.wav',
  '/images/audio/bgm/main/262952__casonika__ice.wav',
  '/images/audio/bgm/main/709894__freqwincy__gate-squeek-eerie-metal-scrape.wav',
] as const

type AudioFactory = (source: string) => BgmAudio

interface BgmManagerOptions {
  audioFactory?: AudioFactory
  fadeDurationMs?: number
  fadeStepMs?: number
}

function createBrowserAudio(source: string): BgmAudio {
  return new Audio(source)
}

export function getBgmSource(trackId: string): string {
  if (trackId === 'main') {
    return resolveAssetUrl(MAIN_BGM_SOURCES[0])
  }
  if (trackId === 'true_E') {
    return resolveAssetUrl(
      '/images/audio/bgm/true_E/807746__inesmorais__som-da-natureza-e-de-carros-sound-of-nature-and-cars.wav',
    )
  }
  if (trackId === 'bad_E') {
    return resolveAssetUrl(
      '/images/audio/bgm/bad_E/dragon-studio-spooky-transition-401719.mp3',
    )
  }
  return resolveAssetUrl(`/audio/${trackId}.mp3`)
}

export class BgmManager {
  private readonly audioFactory: AudioFactory
  private readonly fadeDurationMs: number
  private readonly fadeStepMs: number
  private audio: BgmAudio | null = null
  private currentTrackId: string | null = null
  private desiredTrackId: string | null = null
  private currentSceneKey = ''
  private unlocked = false
  private enabled = true
  private volume = BGM_VOLUME
  private fadeTimer: ReturnType<typeof setInterval> | null = null
  private fadeGeneration = 0

  constructor({
    audioFactory = createBrowserAudio,
    fadeDurationMs = BGM_FADE_DURATION_MS,
    fadeStepMs = BGM_FADE_STEP_MS,
  }: BgmManagerOptions = {}) {
    this.audioFactory = audioFactory
    this.fadeDurationMs = fadeDurationMs
    this.fadeStepMs = fadeStepMs
  }

  unlock(trackId: string, sceneKey: string): void {
    this.unlocked = true
    this.desiredTrackId = trackId
    this.currentSceneKey = sceneKey

    if (this.enabled) {
      this.startTrack(trackId)
    }
  }

  setScene(trackId: string | null, sceneKey: string): void {
    const sceneChanged = sceneKey !== this.currentSceneKey
    const trackChanged = trackId !== this.desiredTrackId

    this.currentSceneKey = sceneKey
    this.desiredTrackId = trackId

    if (!this.unlocked || (!sceneChanged && !trackChanged)) {
      return
    }

    if (!trackId) {
      this.stopWithFade()
      return
    }

    if (!this.enabled) {
      return
    }

    if (trackId === this.currentTrackId && this.audio) {
      return
    }

    this.stopWithFade(() => {
      if (this.enabled && this.unlocked && this.desiredTrackId === trackId) {
        this.startTrack(trackId)
      }
    })
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) {
      return
    }

    this.enabled = enabled

    if (!enabled) {
      this.stopWithFade()
      return
    }

    if (!this.unlocked || !this.desiredTrackId) {
      return
    }

    if (this.audio && this.currentTrackId === this.desiredTrackId) {
      this.safePlay(this.audio)
      this.fadeTo(this.volume)
      return
    }

    this.startTrack(this.desiredTrackId)
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))

    if (this.audio && this.enabled) {
      this.audio.volume = this.volume
    }
  }

  dispose(): void {
    this.cancelFade()
    this.audio?.pause()
    this.audio = null
    this.currentTrackId = null
  }

  private startTrack(trackId: string, playlistIndex = 0): void {
    this.cancelFade()
    this.audio?.pause()

    const source =
      trackId === 'main'
        ? resolveAssetUrl(MAIN_BGM_SOURCES[playlistIndex])
        : getBgmSource(trackId)
    const audio = this.audioFactory(source)
    audio.loop = trackId !== 'bad_E' && trackId !== 'main'
    audio.preload = 'auto'
    audio.volume = 0
    this.audio = audio
    this.currentTrackId = trackId
    if (trackId === 'main') {
      audio.addEventListener?.(
        'ended',
        () => {
          if (this.enabled && this.unlocked && this.desiredTrackId === 'main') {
            this.startTrack(
              'main',
              (playlistIndex + 1) % MAIN_BGM_SOURCES.length,
            )
          }
        },
        { once: true },
      )
    }
    this.safePlay(audio)
    this.fadeTo(this.volume)
  }

  private stopWithFade(onComplete?: () => void): void {
    if (!this.audio) {
      onComplete?.()
      return
    }

    const fadingAudio = this.audio

    this.fadeTo(0, () => {
      fadingAudio.pause()
      onComplete?.()
    })
  }

  private fadeTo(targetVolume: number, onComplete?: () => void): void {
    this.cancelFade()

    const audio = this.audio

    if (!audio) {
      onComplete?.()
      return
    }

    const generation = this.fadeGeneration
    const startVolume = audio.volume
    const startedAt = Date.now()

    if (this.fadeDurationMs <= 0) {
      audio.volume = targetVolume
      onComplete?.()
      return
    }

    this.fadeTimer = setInterval(() => {
      if (generation !== this.fadeGeneration) {
        return
      }

      const progress = Math.min(
        1,
        (Date.now() - startedAt) / this.fadeDurationMs,
      )
      audio.volume = startVolume + (targetVolume - startVolume) * progress

      if (progress === 1) {
        this.cancelFade()
        onComplete?.()
      }
    }, this.fadeStepMs)
  }

  private safePlay(audio: BgmAudio): void {
    try {
      const playResult = audio.play()

      if (playResult && 'catch' in playResult) {
        void playResult.catch(() => undefined)
      }
    } catch {
      // Missing files and browser autoplay rejection must not block the game.
    }
  }

  private cancelFade(): void {
    this.fadeGeneration += 1

    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer)
      this.fadeTimer = null
    }
  }
}
