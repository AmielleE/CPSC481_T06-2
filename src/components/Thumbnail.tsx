import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LibraryImage } from '../data/library'

type ThumbnailProps = {
  image: LibraryImage
  to: string
  label: string
  children?: ReactNode // overlays positioned on the image, e.g. a delete button
}

// Image at its original aspect ratio. Its width comes from the grid row (the <li> sets --ar).
// The frame matches the image's shape, so overlays sit on the image's corners.
export default function Thumbnail({ image, to, label, children }: ThumbnailProps) {
  return (
    <div className="thumb">
      <div className="thumb-frame" style={{ aspectRatio: image.aspectRatio }}>
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
