import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LibraryImage } from '../data/library'

type ThumbnailProps = {
  image: LibraryImage
  to: string
  label: string
  children?: ReactNode // overlays positioned on the image, e.g. a delete button
}

// Square box (same size as the + tile) holding the image at its original aspect ratio.
// The frame matches the image's shape, so overlays sit on the image's corners, not the box's.
export default function Thumbnail({ image, to, label, children }: ThumbnailProps) {
  const ratio = image.aspectRatio
  const frameStyle = ratio >= 1 ? { aspectRatio: ratio, width: '100%' } : { aspectRatio: ratio, height: '100%' }

  return (
    <div className="thumb">
      <div className="thumb-frame" style={frameStyle}>
        <Link to={to} className="thumb-link" draggable={false} aria-label={label}>
          {image.thumbSrc ? (
            <img src={image.thumbSrc} alt="" draggable={false} decoding="async" />
          ) : (
            <span className="thumb-placeholder">{image.title}</span> // blank prototype image
          )}
        </Link>
        {children}
      </div>
    </div>
  )
}
