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
}

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
      const currentAudio = this.audio

      this.fadeTo(0, () => {
        if (this.enabled && this.unlocked && this.desiredTrackId === trackId) {
          this.safePlay(currentAudio)
          this.fadeTo(this.volume)
        }
      })
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

  private startTrack(trackId: string): void {
    this.cancelFade()
    this.audio?.pause()

    const audio = this.audioFactory(getBgmSource(trackId))
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    this.audio = audio
    this.currentTrackId = trackId
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
