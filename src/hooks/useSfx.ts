import { useEffect, useState } from 'react'
import { SfxManager } from '../audio/sfxManager'
import { SFX_VOLUME } from '../constants'

export function useSfx() {
  const [manager] = useState(() => new SfxManager())
  const [isEnabled, setIsEnabled] = useState(true)
  const [volume, setVolumeState] = useState(SFX_VOLUME)

  useEffect(() => {
    const playInteractiveClick = (event: MouseEvent) => {
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('button:not(:disabled), input[type="range"]')
      ) {
        manager.playClick()
      }
    }

    document.addEventListener('click', playInteractiveClick)
    return () => document.removeEventListener('click', playInteractiveClick)
  }, [manager])

  return {
    isEnabled,
    volume,
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
