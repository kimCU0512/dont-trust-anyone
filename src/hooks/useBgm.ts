import { useEffect, useState } from 'react'
import { BgmManager } from '../audio/bgmManager'

interface UseBgmResult {
  isEnabled: boolean
  volume: number
  toggle: () => void
  setVolume: (volume: number) => void
  unlock: (trackId: string, sceneKey: string) => void
}

export function useBgm(trackId: string | null, sceneKey: string): UseBgmResult {
  const [manager] = useState(() => new BgmManager())
  const [isEnabled, setIsEnabled] = useState(true)
  const [volume, setVolumeState] = useState(0.45)

  useEffect(() => {
    manager.setScene(trackId, sceneKey)
  }, [manager, sceneKey, trackId])

  useEffect(() => () => manager.dispose(), [manager])

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
    setVolume: (nextVolume) => {
      setVolumeState(nextVolume)
      manager.setVolume(nextVolume)
    },
    unlock: (nextTrackId, nextSceneKey) => {
      manager.unlock(nextTrackId, nextSceneKey)
    },
  }
}
