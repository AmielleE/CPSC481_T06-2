import { useState } from 'react'
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

  function addCollection(event: React.FormEvent<HTMLFormElement>) {
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

  return (
    <Layout>
      <div className="collections-page">

        <h1 className="collections-title">All Collections</h1>

        <div className="collections-grid">

          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}/preview`}
              className={`collection-card ${collection.isPrivate ? 'private' : ''}`}
            >
              <div className="collection-stack">
                <div className="collection-stack-back"></div>
                <div className="collection-stack-middle"></div>

                <div className="collection-stack-front">
                  <span>{collection.name}</span>

                  {collection.isPrivate && (
                    <span className="private-label">
                      🔒 Private
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
          >
            <div className="collection-stack">
              <div className="collection-stack-back"></div>
              <div className="collection-stack-middle"></div>

              <div className="collection-stack-front">
                <span className="add-icon">+</span>
                <span>Add Collection</span>
              </div>
            </div>
          </button>

        </div>

        {/* Add collection form */}
        {showForm && (
          <div className="collection-modal-overlay">
            <div
              className="collection-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-collection-title"
            >
              <h2 id="add-collection-title">Create Collection</h2>

              <form onSubmit={addCollection}>
                <label htmlFor="collection-name">
                  Collection Name
                </label>

                <input
                  id="collection-name"
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Enter collection name"
                  required
                />

                <label className="collection-checkbox">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(event) => setIsPrivate(event.target.checked)}
                  />
                  Private Collection
                </label>

                <div className="collection-modal-buttons">
                  <button
                    type="button"
                    className="collection-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="collection-create">
                    Create
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