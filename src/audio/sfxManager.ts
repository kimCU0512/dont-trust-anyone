import { SFX_VOLUME } from '../constants'

type AudioContextFactory = () => AudioContext

const createBrowserAudioContext: AudioContextFactory = () =>
  new window.AudioContext()

export class SfxManager {
  private context: AudioContext | null = null
  private enabled = true
  private volume = SFX_VOLUME

  constructor(private readonly contextFactory = createBrowserAudioContext) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
  }

  playClick(): void {
    if (!this.enabled || this.volume === 0 || typeof window === 'undefined') {
      return
    }

    try {
      const context = this.context ?? this.contextFactory()
      this.context = context
      void context.resume()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const now = context.currentTime

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(420, now)
      oscillator.frequency.exponentialRampToValueAtTime(260, now + 0.055)
      gain.gain.setValueAtTime(this.volume * 0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.065)
    } catch {
      // Audio support is optional; interaction must never block the game.
    }
  }
}
