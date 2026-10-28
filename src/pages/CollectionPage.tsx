import { useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Dialog from '../components/Dialog'
import EditableText from '../components/EditableText'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
import { useLibrary, type Collection, type LibraryImage } from '../data/library'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'

type Draft = Pick<Collection, 'name' | 'info' | 'isPrivate' | 'images'>

const toDraft = ({ name, info, isPrivate, images }: Collection): Draft => ({ name, info, isPrivate, images })

function isSameDraft(a: Draft, b: Draft) {
  return (
    a.name === b.name &&
    a.info === b.info &&
    a.isPrivate === b.isPrivate &&
    a.images.length === b.images.length &&
    a.images.every((img, i) => img.id === b.images[i].id)
  )
}

function CollectionEditor({ collection }: { collection: Collection }) {
  const navigate = useNavigate()
  const { updateCollection, deleteCollection } = useLibrary()

  // Edits stay in a local draft until "Save changes" is pressed
  const [draft, setDraft] = useState<Draft>(() => toDraft(collection))
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [imageToRemove, setImageToRemove] = useState<LibraryImage | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const dirty = !isSameDraft(draft, toDraft(collection))
  const { saveChanges, status, dialog } = useUnsavedChanges(
    dirty,
    () => updateCollection(collection.id, draft),
    'collection',
  )

  function moveImage(imageId: string, toIndex: number) {
    setDraft((d) => {
      const moved = d.images.find((img) => img.id === imageId)
      if (!moved || toIndex < 0 || toIndex >= d.images.length) return d
      const images = d.images.filter((img) => img.id !== imageId)
      images.splice(toIndex, 0, moved)
      return { ...d, images }
    })
  }

  // Keyboard alternative to dragging: Alt + arrow keys move the focused image
  function onTileKeyDown(e: KeyboardEvent<HTMLLIElement>, imageId: string, index: number) {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
    e.preventDefault()
    moveImage(imageId, index + (e.key === 'ArrowLeft' ? -1 : 1))
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-image-id="${imageId}"] .thumb-link`)?.focus(),
    )
  }

  // Images move on drop (not while hovering) so tiles stay still while dragging
  function dropOn(index: number) {
    if (dragId) moveImage(dragId, index)
    setDragId(null)
    setOverId(null)
  }

  function removeImage() {
    if (!imageToRemove) return
    setDraft((d) => ({ ...d, images: d.images.filter((img) => img.id !== imageToRemove.id) }))
    setImageToRemove(null)
  }

  function confirmDeleteCollection() {
    navigate('/collections')
    deleteCollection(collection.id)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="collection-meta">
          <EditableText
            as="h1"
            className="title-text"
            label="collection name"
            value={draft.name}
            onChange={(name) => setDraft((d) => ({ ...d, name }))}
            fallback={collection.name}
          />
          <EditableText
            className="multiline"
            textClassName="muted"
            label="general info"
            multiline
            placeholder="Add general info about this collection"
            value={draft.info}
            onChange={(info) => setDraft((d) => ({ ...d, info }))}
          />
        </div>

        <div className="collection-actions">
          <div className="action-row">
            <span className="save-status" role="status">
              {status}
            </span>
            <button type="button" className="btn" disabled={!dirty} onClick={saveChanges}>
              Save changes
            </button>
            {/* Preview sits top-right, where "Exit preview" is, so returning doesn't land on Delete */}
            <Link to={`/collections/${collection.id}/preview`} className="btn btn-secondary">
              Preview
            </Link>
          </div>
          <div className="action-row">
            <label className="toggle">
              <span>Private</span>
              <input
                type="checkbox"
                role="switch"
                checked={draft.isPrivate}
                onChange={(e) => setDraft((d) => ({ ...d, isPrivate: e.target.checked }))}
              />
              <span className="toggle-track" aria-hidden="true" />
            </label>
            <button type="button" className="btn btn-secondary btn-delete" onClick={() => setConfirmingDelete(true)}>
              Delete collection
            </button>
          </div>
        </div>
      </header>

      <p className="drag-hint muted">
        {draft.images.length === 0
          ? 'No images yet. Click + to add some.'
          : 'Drag an image onto another to move it there (or focus one and press Alt + arrow keys)'}
      </p>

      <ul className="image-grid">
        {draft.images.map((image, i) => (
          <li
            key={image.id}
            data-image-id={image.id}
            className={[
              'tile-wrap',
              dragId === image.id && 'dragging',
              overId === image.id && dragId !== image.id && 'drop-target',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', image.id) // Firefox needs data set to start a drag
              e.dataTransfer.effectAllowed = 'move'
              setDragId(image.id)
            }}
            onDragOver={(e) => {
              if (!dragId) return
              e.preventDefault()
              setOverId(image.id)
            }}
            onDrop={(e) => {
              e.preventDefault()
              dropOn(i)
            }}
            onDragEnd={() => {
              setDragId(null)
              setOverId(null)
            }}
            onKeyDown={(e) => onTileKeyDown(e, image.id, i)}
          >
            <Thumbnail
              image={image}
              to={`/collections/${collection.id}/images/${image.id}`}
              label={`${image.title}, position ${i + 1} of ${draft.images.length}`}
            >
              <button
                type="button"
                className="remove-badge"
                aria-label={`Delete ${image.title}`}
                title="Delete photo"
                onClick={() => setImageToRemove(image)}
              >
                ×
              </button>
            </Thumbnail>
          </li>
        ))}
        <li
          className={overId === 'add' ? 'drop-target' : undefined}
          onDragOver={(e) => {
            if (!dragId) return
            e.preventDefault()
            setOverId('add')
          }}
          onDrop={(e) => {
            e.preventDefault()
            dropOn(draft.images.length - 1) // dropping on + moves the image to the end
          }}
        >
          <Link to={`/collections/${collection.id}/upload`} className="thumb add-tile" title="Add images" aria-label="Add images">
            +
          </Link>
        </li>
      </ul>

      <Dialog
        open={imageToRemove !== null}
        title="Delete this photo from your library?"
        onClose={() => setImageToRemove(null)}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setImageToRemove(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={removeImage}>
              Delete photo
            </button>
          </>
        }
      >
        <p>
          “{imageToRemove?.title}” will be deleted from your library, not just this collection. It is
          removed when you save changes.
        </p>
      </Dialog>

      <Dialog
        open={confirmingDelete}
        title={`Delete ${collection.name}?`}
        onClose={() => {
          setConfirmingDelete(false)
          setDeleteText('')
        }}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={deleteText !== collection.name}
              onClick={confirmDeleteCollection}
            >
              Delete collection
            </button>
          </>
        }
      >
        <p>
          This permanently deletes the collection and all {collection.images.length} photos in it. This
          cannot be undone.
        </p>
        <label className="field">
          <span className="small">
            Type <strong>{collection.name}</strong> to confirm
          </span>
          <input className="text-input" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} />
        </label>
      </Dialog>

      {dialog}
    </div>
  )
}

export default function CollectionPage() {
  const { collectionId = '' } = useParams()
  const { getCollection } = useLibrary()
  const collection = getCollection(collectionId)

  return (
    <Layout>
      {collection ? (
        <CollectionEditor key={collection.id} collection={collection} />
      ) : (
        <div className="page">
          <p>Collection not found.</p>
          <Link to="/collections">Back to collections</Link>
        </div>
      )}
    </Layout>
  )
}
