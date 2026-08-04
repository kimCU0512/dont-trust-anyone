import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BgmAudio } from './bgmManager'
import { BgmManager, getBgmSource, MAIN_BGM_SOURCES } from './bgmManager'

interface FakeAudio extends BgmAudio {
  source: string
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  endedListeners: Array<() => void>
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
      endedListeners: [],
      addEventListener: vi.fn((_type, listener) => {
        audio.endedListeners.push(listener)
      }),
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

  it('plays the bad-ending track only once', () => {
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({
      audioFactory,
      fadeDurationMs: 0,
    })

    manager.unlock('bad_E', 'reset')

    expect(audios[0].play).toHaveBeenCalledOnce()
    expect(audios[0].loop).toBe(false)
  })

  it('keeps playing continuously across scenes that use the same track', () => {
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
    expect(audios[0].play).toHaveBeenCalledOnce()

    manager.setScene('finale', 'stage-5')
    vi.advanceTimersByTime(200)

    expect(audios[0].pause).toHaveBeenCalled()
    expect(audios[1].source).toBe(getBgmSource('finale'))
    expect(audios[1].play).toHaveBeenCalledOnce()
  })

  it('plays all four main tracks in order and loops back to the first', () => {
    const { audios, audioFactory } = createAudioHarness()
    const manager = new BgmManager({ audioFactory, fadeDurationMs: 0 })

    manager.unlock('main', 'intro')

    for (let index = 0; index < MAIN_BGM_SOURCES.length; index += 1) {
      expect(audios[index].source).toBe(MAIN_BGM_SOURCES[index])
      expect(audios[index].loop).toBe(false)
      audios[index].endedListeners[0]()
    }

    expect(audios[MAIN_BGM_SOURCES.length].source).toBe(MAIN_BGM_SOURCES[0])
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
