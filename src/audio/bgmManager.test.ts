import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BgmAudio } from './bgmManager'
import { BgmManager, getBgmSource } from './bgmManager'

interface FakeAudio extends BgmAudio {
  source: string
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
}

function createAudioHarness(rejectPlay = false) {
  const audios: FakeAudio[] = []
  const audioFactory = (source: string): FakeAudio => {
    const audio: FakeAudio = {
      source,
      loop: false,
      preload: '',
      volume: 1,
      play: vi.fn(() =>
        rejectPlay ? Promise.reject(new Error('missing')) : Promise.resolve(),
      ),
      pause: vi.fn(),
    }
    audios.push(audio)
    return audio
  }

  return { audios, audioFactory }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('BgmManager', () => {
  it('does not create audio before the start interaction', () => {
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({ audioFactory })

    manager.setScene('intro', 'intro')

    expect(audios).toHaveLength(0)
  })

  it('plays synchronously when start unlocks audio', () => {
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({
      audioFactory,
      fadeDurationMs: 0,
    })

    manager.unlock('intro', 'intro')

    expect(audios[0].source).toBe('/audio/intro.mp3')
    expect(audios[0].play).toHaveBeenCalledOnce()
    expect(audios[0].loop).toBe(true)
  })

  it('fades between story tracks and on same-track scene changes', () => {
    vi.useFakeTimers()
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({
      audioFactory,
      fadeDurationMs: 100,
      fadeStepMs: 10,
    })

    manager.unlock('main', 'stage-1')
    vi.advanceTimersByTime(100)
    manager.setScene('main', 'stage-2')
    vi.advanceTimersByTime(200)

    expect(audios).toHaveLength(1)
    expect(audios[0].play).toHaveBeenCalledTimes(2)

    manager.setScene('finale', 'stage-5')
    vi.advanceTimersByTime(200)

    expect(audios[0].pause).toHaveBeenCalled()
    expect(audios[1].source).toBe(getBgmSource('finale'))
    expect(audios[1].play).toHaveBeenCalledOnce()
  })

  it('mutes globally and safely resumes the current track', () => {
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({
      audioFactory,
      fadeDurationMs: 0,
    })

    manager.unlock('main', 'stage-1')
    manager.setEnabled(false)
    manager.setEnabled(true)

    expect(audios[0].pause).toHaveBeenCalledOnce()
    expect(audios[0].play).toHaveBeenCalledTimes(2)
  })

  it('absorbs missing-file play rejections', async () => {
    const { audioFactory } = createAudioHarness(true)
    const manager = new BgmManager({
      audioFactory,
      fadeDurationMs: 0,
    })

    expect(() => manager.unlock('missing', 'intro')).not.toThrow()
    await Promise.resolve()
  })
})
