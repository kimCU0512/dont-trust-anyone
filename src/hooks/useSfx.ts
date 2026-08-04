import { useState } from 'react'
import { SfxManager } from '../audio/sfxManager'
import type { SfxId } from '../audio/sfxManager'
import { SFX_VOLUME } from '../constants'

export function useSfx() {
  const [manager] = useState(() => new SfxManager())
  const [isEnabled, setIsEnabled] = useState(true)
  const [volume, setVolumeState] = useState(SFX_VOLUME)

  return {
    isEnabled,
    volume,
    play: (id: SfxId, onEnded?: () => void) => manager.play(id, onEnded),
    toggle: () => {
      setIsEnabled((currentEnabled) => {
        const nextEnabled = !currentEnabled
        manager.setEnabled(nextEnabled)
        return nextEnabled
      })
    },
    setVolume: (nextVolume: number) => {
      setVolumeState(nextVolume)
      manager.setVolume(nextVolume)
    },
  }
}
