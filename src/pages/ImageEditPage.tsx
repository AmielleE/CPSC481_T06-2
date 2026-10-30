import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import EditableText from '../components/EditableText'
import Layout from '../components/Layout'
import ViewerImage from '../components/ViewerImage'
import { useLibrary, type Collection, type LibraryImage } from '../data/library'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import './ImagePages.css'

type Draft = { title: string; description: string; forSale: boolean; price: string }

const toDraft = (image: LibraryImage): Draft => ({
  title: image.title,
  description: image.description,
  forSale: image.forSale,
  price: image.price === null ? '' : image.price.toFixed(2),
})

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/ // dollars with optional cents, e.g. 25 or 25.50

const imagePath = (collectionId: string, imageId: string) => `/collections/${collectionId}/images/${imageId}`

function formatFileSize(bytes?: number) {
  if (bytes === undefined) return 'Unavailable'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function ImageEditor({ collection, image }: { collection: Collection; image: LibraryImage }) {
  const { updateImage } = useLibrary()

  // Edits stay in a local draft until "Save changes" is pressed
  const [draft, setDraft] = useState<Draft>(() => toDraft(image))
  const saved = toDraft(image)
  const dirty =
    draft.title !== saved.title ||
    draft.description !== saved.description ||
    draft.forSale !== saved.forSale ||
    draft.price !== saved.price

  const priceText = draft.price.trim()
  const priceMissing = draft.forSale && priceText === ''
  const priceInvalid = draft.forSale && priceText !== '' && !PRICE_PATTERN.test(priceText)
  const canSave = !priceMissing && !priceInvalid

  function save() {
    const price = PRICE_PATTERN.test(priceText) ? Number(priceText) : null
    updateImage(collection.id, image.id, {
      title: draft.title,
      description: draft.description,
      forSale: draft.forSale,
      price,
    })
    // Match the saved formatting (25 -> 25.00) so the draft doesn't read as changed
    setDraft((d) => ({ ...d, price: price === null ? '' : price.toFixed(2) }))
  }

  const { saveChanges, status, requestNavigate, dialog } = useUnsavedChanges(dirty, save, 'photo', canSave)

  const images = collection.images
  const index = images.findIndex((img) => img.id === image.id)
  const prev = images[index - 1]
  const next = images[index + 1]

  // Left / right arrow keys move between images, unless the user is typing
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as Element).closest('input, textarea')) return
      if (e.key === 'ArrowLeft' && prev) requestNavigate(imagePath(collection.id, prev.id))
      if (e.key === 'ArrowRight' && next) requestNavigate(imagePath(collection.id, next.id))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-left">
          <Link to={`/collections/${collection.id}`} className="btn btn-secondary">
            ← Back
          </Link>
          <h1 className="page-title">{collection.name}</h1>
        </div>

        <div className="action-row">
          <span className="save-status" role="status">{status}</span>
          <button
            type="button"
            className="btn"
            disabled={!dirty || !canSave}
            onClick={saveChanges}
          >
            Save changes
          </button>
          <Link
            to={`/collections/${collection.id}/preview/images/${image.id}`}
            className="btn btn-secondary"
          >
            Preview
          </Link>
        </div>
      </header>

      <div className="viewer viewer-centered">
        <button
          type="button"
          className="arrow"
          aria-label="Previous image"
          disabled={!prev}
          onClick={() => prev && requestNavigate(imagePath(collection.id, prev.id))}
        >
          ◀
        </button>
        <ViewerImage image={image} title={draft.title} />
        <button
          type="button"
          className="arrow"
          aria-label="Next image"
          disabled={!next}
          onClick={() => next && requestNavigate(imagePath(collection.id, next.id))}
        >
          ▶
        </button>
      </div>

      <div className="viewer-info">
        <div className="image-details">
          <div className="image-metadata">
            {image.format && <span>{image.format}</span>}
            {image.width && image.height && (
              <span>{image.width} × {image.height} px</span>
            )}
            {image.fileSize !== undefined && (
              <span>{formatFileSize(image.fileSize)}</span>
            )}
          </div>
          <EditableText
            as="h2"
            className="subtitle-text"
            label="image title"
            value={draft.title}
            onChange={(title) => setDraft((d) => ({ ...d, title }))}
            fallback={image.title}
          />
          <EditableText
            className="multiline"
            textClassName="muted"
            label="description"
            multiline
            placeholder="Add a description"
            value={draft.description}
            onChange={(description) => setDraft((d) => ({ ...d, description }))}
          />
        </div>

        <div className="sale-controls">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.forSale}
              onChange={(e) => setDraft((d) => ({ ...d, forSale: e.target.checked }))}
            />
            For sale
          </label>
          <div className={`price-input${priceInvalid ? ' invalid' : ''}`}>
            <span aria-hidden="true">$</span>
            <input
              inputMode="decimal"
              placeholder="Price"
              aria-label="Price in dollars"
              aria-invalid={priceInvalid}
              aria-describedby="price-help"
              disabled={!draft.forSale}
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            />
          </div>
          <p id="price-help" className={priceInvalid ? 'field-error' : 'field-hint'}>
            {priceInvalid
              ? 'Enter a price in dollars, like 25 or 25.50.'
              : priceMissing
                ? 'Add a price to list this photo for sale.'
                : ''}
          </p>
        </div>
      </div>

      {dialog}
    </div>
  )
}

export default function ImageEditPage() {
  const { collectionId = '', imageId = '' } = useParams()
  const { getCollection } = useLibrary()
  const collection = getCollection(collectionId)
  const image = collection?.images.find((img) => img.id === imageId)

  return (
    <Layout>
      {collection && image ? (
        <ImageEditor key={image.id} collection={collection} image={image} />
      ) : (
        <div className="page">
          <p>Image not found.</p>
          <Link to={collection ? `/collections/${collection.id}` : '/collections'}>Back to collection</Link>
        </div>
      )}
    </Layout>
  )
}
