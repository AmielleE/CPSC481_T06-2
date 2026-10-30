import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LibraryImage } from '../data/library'

type ThumbnailProps = {
  image: LibraryImage
  to?: string
  onClick?: () => void // used instead of `to` when clicking does something other than open the image
  label: string
  children?: ReactNode // overlays positioned on the image, e.g. a delete button
}

// Image at its original aspect ratio. Its width comes from the grid row (the <li> sets --ar).
// The frame matches the image's shape, so overlays sit on the image's corners.
export default function Thumbnail({ image, to, onClick, label, children }: ThumbnailProps) {
  const picture = image.thumbSrc ? (
    <img src={image.thumbSrc} alt="" draggable={false} decoding="async" />
  ) : (
    <span className="thumb-placeholder">{image.title}</span> // blank prototype image
  )

  return (
    <div className="thumb">
      <div className="thumb-frame" style={{ aspectRatio: image.aspectRatio }}>
        {onClick ? (
          <button type="button" className="thumb-link thumb-button" aria-label={label} onClick={onClick}>
            {picture}
          </button>
        ) : to ? (
          <Link to={to} className="thumb-link" draggable={false} aria-label={label}>
            {picture}
          </Link>
        ) : (
          // Neither `to` nor `onClick`: just the picture, e.g. on preview pages
          <div className="thumb-link thumb-static" role="img" aria-label={label}>
            {picture}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
