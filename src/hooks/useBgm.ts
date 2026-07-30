import { useEffect, useState } from 'react'
import { BgmManager } from '../audio/bgmManager'

interface UseBgmResult {
  isEnabled: boolean
  toggle: () => void
  unlock: (trackId: string, sceneKey: string) => void
}

export function useBgm(
  trackId: string | null,
  sceneKey: string,
): UseBgmResult {
  const [manager] = useState(() => new BgmManager())
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    manager.setScene(trackId, sceneKey)
  }, [manager, sceneKey, trackId])

  useEffect(() => () => manager.dispose(), [manager])

  return {
    isEnabled,
    toggle: () => {
      setIsEnabled((currentEnabled) => {
        const nextEnabled = !currentEnabled
        manager.setEnabled(nextEnabled)
        return nextEnabled
      })
    },
    unlock: (nextTrackId, nextSceneKey) => {
      manager.unlock(nextTrackId, nextSceneKey)
    },
  }
}
