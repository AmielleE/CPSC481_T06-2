import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Layout from '../components/Layout'
import ViewerImage from '../components/ViewerImage'
import { useLibrary } from '../data/library'
import './ImagePages.css'

const imagePath = (collectionId: string, imageId: string) =>
  `/collections/${collectionId}/preview/images/${imageId}`

function formatFileSize(bytes?: number) {
  if (bytes === undefined) return 'Unavailable'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImagePreviewPage() {
  const { collectionId = '', imageId = '' } = useParams()
  const navigate = useNavigate()
  const { getCollection } = useLibrary()

  const collection = getCollection(collectionId)
  const images = collection?.images ?? []
  const index = images.findIndex((img) => img.id === imageId)
  const image = index >= 0 ? images[index] : undefined
  const prev = index > 0 ? images[index - 1] : undefined
  const next = index >= 0 && index < images.length - 1 ? images[index + 1] : undefined

  // Left / right arrow keys move between images
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && prev) navigate(imagePath(collectionId, prev.id))
      if (e.key === 'ArrowRight' && next) navigate(imagePath(collectionId, next.id))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, collectionId, navigate])

  if (!collection || !image) {
    return (
      <Layout>
        <div className="page">
          <p>Image not found.</p>
          <Link to="/collections">Back to collections</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page">
        <header className="page-header">
          <div className="header-left">
            <Link to={`/collections/${collection.id}/preview`} className="btn btn-secondary">
              ← Back
            </Link>
            <h1 className="page-title">{collection.name}</h1>
          </div>

          <Link
            to={`/collections/${collection.id}/images/${image.id}`}
            className="btn btn-secondary"
          >
            Exit preview
          </Link>
        </header>

        <div className="viewer viewer-centered">
          <button
            type="button"
            className="arrow"
            aria-label="Previous image"
            disabled={!prev}
            onClick={() => prev && navigate(imagePath(collectionId, prev.id))}
          >
            ◀
          </button>
          <ViewerImage image={image} title={image.title} />
          <button
            type="button"
            className="arrow"
            aria-label="Next image"
            disabled={!next}
            onClick={() => next && navigate(imagePath(collectionId, next.id))}
          >
            ▶
          </button>
        </div>

        <div className="viewer-info">
          <div>
            <h2 className="image-title">{image.title}</h2>
            {image.description && <p className="muted">{image.description}</p>}
          </div>
          <div className="image-metadata">
            {image.format && <span>{image.format}</span>}
            {image.width && image.height && (
              <span>{image.width} × {image.height} px</span>
            )}
            {image.fileSize !== undefined && (
              <span>{formatFileSize(image.fileSize)}</span>
            )}
          </div>
          {image.forSale && image.price !== null && (
            <span className="price">${image.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Layout>
  )
}