import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import './Collections.css'

type Collection = {
  id: number
  name: string
  isPrivate: boolean
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([
    { id: 1, name: 'Spain/Portugal', isPrivate: false },
    { id: 2, name: 'Alberta', isPrivate: false },
    { id: 3, name: 'Patagonia', isPrivate: false },
    { id: 4, name: 'Collection 4', isPrivate: false },
    { id: 5, name: 'Collection 5', isPrivate: true },
  ])

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  function addCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newName.trim()) return

    const newCollection: Collection = {
      id: Date.now(),
      name: newName.trim(),
      isPrivate,
    }

    setCollections([...collections, newCollection])

    setNewName('')
    setIsPrivate(false)
    setShowForm(false)
  }

  function closeForm() {
    setShowForm(false)
    setNewName('')
    setIsPrivate(false)
  }

  return (
    <Layout>
      <div className="collections-page">

        {/* Page heading */}
        <header className="collections-header">
          <h1 className="collections-title">
            All Collections
          </h1>
        </header>

        {/* Collections grid */}
        <div className="collections-grid">

          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}/preview`}
              className={`collection-card ${
                collection.isPrivate ? 'private' : ''
              }`}
            >
              <div className="collection-stack">

                {/* Back layer */}
                <div className="collection-stack-back" />

                {/* Middle layer */}
                <div className="collection-stack-middle" />

                {/* Front layer */}
                <div className="collection-stack-front">

                  {collection.isPrivate && (
                    <svg
                      className="collection-lock-icon"
                      viewBox="0 0 24 24"
                      width="26"
                      height="26"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="11"
                        rx="1"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  )}

                  <span className="collection-name">
                    {collection.name}
                  </span>

                  {collection.isPrivate && (
                    <div className="collection-private-indicator">
                      <span className="private-divider" />
                      <span className="private-label">
                        PRIVATE COLLECTION
                      </span>
                    </div>
                  )}

                </div>

              </div>
            </Link>
          ))}

          {/* Add collection card */}
          <button
            type="button"
            className="collection-card add-collection-card"
            onClick={() => setShowForm(true)}
            aria-label="Add a new collection"
          >
            <div className="collection-stack">

              <div className="collection-stack-back" />

              <div className="collection-stack-middle" />

              <div className="collection-stack-front">

                <span className="add-icon">+</span>

                <span className="add-collection-label">
                  ADD COLLECTION
                </span>

              </div>

            </div>
          </button>

        </div>

        {/* Add collection modal */}
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

              <form onSubmit={addCollection}>

                {/* Collection name */}
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

                {/* Privacy setting */}
                <div className="collection-privacy-section">

                  <label className="collection-checkbox">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(event) =>
                        setIsPrivate(event.target.checked)
                      }
                      aria-describedby={
                        isPrivate
                          ? 'collection-privacy-info'
                          : undefined
                      }
                    />

                    <span>Make this collection private</span>
                  </label>

                  {/* Privacy explanation */}
                  {isPrivate && (
                    <div
                      className="collection-privacy-info"
                      id="collection-privacy-info"
                      role="status"
                    >
                      <svg
                        className="collection-info-icon"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 11v5" />
                        <path d="M12 8h.01" />
                      </svg>

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

                {/* Modal buttons */}
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

      </div>
    </Layout>
  )
}