import { useState } from 'react'

type ConclusionArtworkVariant = 'reset' | 'true' | 'bad'

interface ConclusionArtworkProps {
  imageUrl: string
  alt: string
  variant: ConclusionArtworkVariant
}

export function ConclusionArtwork({
  imageUrl,
  alt,
  variant,
}: ConclusionArtworkProps) {
  const [visibleImageUrl, setVisibleImageUrl] = useState<string | null>(
    imageUrl,
  )

  return (
    <figure
      className={`conclusion-artwork conclusion-artwork--${variant}`}
      aria-label={alt}
    >
      <div className="conclusion-artwork__fallback" aria-hidden="true">
        <span className="conclusion-artwork__school" />
        <span className="conclusion-artwork__figure" />
        <span className="conclusion-artwork__hand" />
      </div>
      {visibleImageUrl && (
        <img
          src={visibleImageUrl}
          alt=""
          onError={() => setVisibleImageUrl(null)}
        />
      )}
      <span className="conclusion-artwork__veil" aria-hidden="true" />
    </figure>
  )
}
