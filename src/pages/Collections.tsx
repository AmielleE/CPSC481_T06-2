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
    { id: 1, name: 'Collection 1', isPrivate: false },
    { id: 2, name: 'Collection 2', isPrivate: false },
    { id: 3, name: 'Collection 3', isPrivate: false },
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
      isPrivate: isPrivate,
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

          <p className="collections-subtitle">
            Your photography, thoughtfully organized.
          </p>
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

                  <span className="collection-name">
                    {collection.name}
                  </span>

                  {collection.isPrivate && (
                    <span className="private-label">
                      PRIVATE
                    </span>
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