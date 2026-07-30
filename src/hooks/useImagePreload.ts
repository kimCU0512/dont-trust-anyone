import { useEffect } from 'react'
import { gameImagePreloader } from '../images/imagePreloader'

export function useImagePreload(sources: string[]): void {
  const sourceKey = sources.join('\u0000')

  useEffect(() => {
    const upcomingSources = sourceKey ? sourceKey.split('\u0000') : []

    void gameImagePreloader.preloadAll(upcomingSources)
  }, [sourceKey])
}
