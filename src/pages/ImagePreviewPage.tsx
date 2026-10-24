import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'

const imagePath = (collectionId: string, imageId: string) =>
  `/collections/${collectionId}/preview/images/${imageId}`

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
          <h1 className="page-title">{collection.name}</h1>
          <Link to={`/collections/${collection.id}/images/${image.id}`} className="btn btn-secondary">
            Exit preview
          </Link>
        </header>

        <div className="viewer">
          <button
            type="button"
            className="arrow"
            aria-label="Previous image"
            disabled={!prev}
            onClick={() => prev && navigate(imagePath(collectionId, prev.id))}
          >
            ◀
          </button>
          <div className="viewer-image">
            {image.src ? <img src={image.src} alt={image.title} /> : <span className="muted">Image</span>}
          </div>
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
          {image.forSale && image.price !== null && (
            <span className="price">${image.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Layout>
  )
}