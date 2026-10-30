import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Lock, Plus, Info } from 'lucide-react'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'
import type { Collection } from '../data/library'
import './Collections.css'

const SLIDESHOW_INTERVAL = 5000

// Individual collection card
function CollectionCard({ collection }: { collection: Collection }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageVisible, setImageVisible] = useState(true)

  const images = collection.images.filter(
    (image) => image.thumbSrc || image.src
  )

  useEffect(() => {
    if (images.length <= 1) return

    const interval = window.setInterval(() => {
      setImageVisible(false)

      window.setTimeout(() => {
        setCurrentImageIndex((previous) =>
          (previous + 1) % images.length
        )

        setImageVisible(true)
      }, 300)
    }, SLIDESHOW_INTERVAL)

    return () => window.clearInterval(interval)
  }, [images.length])

  const currentImage = images[currentImageIndex]

  return (
    <Link
      to={`/collections/${collection.id}`}
      className={`collection-photo-card ${
        collection.isPrivate ? 'private' : ''
      }`}
    >
      <div className="collection-photo-preview">

        {currentImage ? (
          <img
            src={currentImage.thumbSrc || currentImage.src || ''}
            alt={`${collection.name} collection preview`}
            className={`collection-preview-image ${
              imageVisible ? 'visible' : 'hidden'
            }`}
          />
        ) : (
          <div className="collection-photo-placeholder">
            <span>NO IMAGES YET</span>
          </div>
        )}

        {collection.isPrivate && (
          <div className="collection-photo-private-badge">
            <Lock size={13} strokeWidth={1.5} />
            <span>PRIVATE</span>
          </div>
        )}

      </div>

      <div className="collection-photo-details">

        <h2>{collection.name}</h2>

        <span className="collection-photo-count">
          {collection.images.length}{' '}
          {collection.images.length === 1
            ? 'PHOTOGRAPH'
            : 'PHOTOGRAPHS'}
        </span>

      </div>
    </Link>
  )
}

export default function Collections() {
  const navigate = useNavigate()
  const { collections, addCollection } = useLibrary()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  // Only show public collections in preview mode
  const visibleCollections = isPreview
    ? collections.filter((collection) => !collection.isPrivate)
    : collections

  function handleAddCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = newName.trim()

    if (!name) return

    const newCollection = addCollection(name, isPrivate)

    setNewName('')
    setIsPrivate(false)
    setShowForm(false)

    // Go directly to the upload page for the new collection
    navigate(`/collections/${newCollection.id}/upload?new=true`)
  }

  function closeForm() {
    setShowForm(false)
    setNewName('')
    setIsPrivate(false)
  }

  return (
    <Layout>
      <section className="collections-page">

        {/* Page header */}
        <header className="collections-header">

          <h1 className="collections-title">
            All Collections
          </h1>

          <button
            type="button"
            className={`collections-preview-button ${
              isPreview ? 'active' : ''
            }`}
            onClick={() => setIsPreview((previous) => !previous)}
          >
            {isPreview ? 'EXIT PREVIEW' : 'PREVIEW'}
          </button>

        </header>

        {/* Collection cards */}
        <div className="collections-photo-grid">

          {visibleCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
            />
          ))}

          {/* Add collection - hidden in preview mode */}
          {!isPreview && (
            <button
              type="button"
              className="collection-photo-add"
              onClick={() => setShowForm(true)}
            >
              <div className="collection-photo-add-preview">
                <Plus size={42} strokeWidth={1} />
                <span>ADD COLLECTION</span>
              </div>

              <div className="collection-photo-details">
                <h2>New Collection</h2>
              </div>
            </button>
          )}

        </div>

        {/* Empty preview state */}
        {isPreview && visibleCollections.length === 0 && (
          <div className="collections-preview-empty">
            <p>No public collections to display.</p>
          </div>
        )}

        {/* Create collection modal */}
        {showForm && (
          <div
            className="collection-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeForm()
              }
            }}
          >
            <div
              className="collection-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-collection-title"
            >

              <h2 id="add-collection-title">
                Create Collection
              </h2>

              <p className="collection-modal-description">
                Create a new space for your photographs.
              </p>

              <form onSubmit={handleAddCollection}>

                <div className="collection-form-field">
                  <label htmlFor="collection-name">
                    COLLECTION NAME
                  </label>

                  <input
                    id="collection-name"
                    type="text"
                    value={newName}
                    onChange={(event) =>
                      setNewName(event.target.value)
                    }
                    placeholder="Enter collection name"
                    required
                    autoFocus
                  />
                </div>

                <div className="collection-privacy-section">

                  <label className="collection-checkbox">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(event) =>
                        setIsPrivate(event.target.checked)
                      }
                    />

                    <span>Make this collection private</span>
                  </label>

                  {isPrivate && (
                    <div
                      className="collection-privacy-info"
                      role="status"
                    >
                      <Info
                        size={20}
                        strokeWidth={1.5}
                        className="collection-info-icon"
                      />

                      <div className="collection-privacy-info-text">
                        <h3>About private collections</h3>

                        <p>
                          Private collections can only be viewed by
                          people who have access to the collection
                          link. They will not appear in the general
                          collections view.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                <div className="collection-modal-buttons">

                  <button
                    type="button"
                    className="collection-cancel"
                    onClick={closeForm}
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    className="collection-create"
                  >
                    CREATE
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

      </section>
    </Layout>
  )
}