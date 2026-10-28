import type { LibraryImage } from '../data/library'

// Large single-image display shared by the image edit and preview pages.
// Blank prototype images are drawn as a grey shape at their aspect ratio inside the 4:3 viewer.
export default function ViewerImage({ image, title }: { image: LibraryImage; title: string }) {
  return (
    <div className="viewer-image bare">
      {image.src ? (
        <img src={image.src} alt={title} />
      ) : (
        <div
          className="viewer-placeholder"
          style={{ aspectRatio: image.aspectRatio, [image.aspectRatio >= 4 / 3 ? 'width' : 'height']: '100%' }}
        >
          {title}
        </div>
      )}
    </div>
  )
}
