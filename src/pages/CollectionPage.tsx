import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { ArrowLeft, Info, AlertTriangle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import Dialog from '../components/Dialog'
import EditableText from '../components/EditableText'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
import { useLibrary, type Collection, type LibraryImage } from '../data/library'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import './CollectionPage.css'

type Draft = Pick<Collection, 'name' | 'info' | 'isPrivate' | 'images'>

const toDraft = ({ name, info, isPrivate, images }: Collection): Draft => ({
  name,
  info,
  isPrivate,
  images,
})

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

  // Edits stay in a local draft until Save changes is pressed
  const [draft, setDraft] = useState<Draft>(() => toDraft(collection))
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [imageToRemove, setImageToRemove] = useState<LibraryImage | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // null = no popup, true = switching to private, false = switching to public
  const [pendingPrivacy, setPendingPrivacy] = useState<boolean | null>(null)

  const dirty = !isSameDraft(draft, toDraft(collection))

  const { saveChanges, status, requestNavigate, dialog } = useUnsavedChanges(
    dirty,
    () => updateCollection(collection.id, draft),
    'collection',
  )

  function moveImage(imageId: string, toIndex: number) {
    setDraft((d) => {
      const moved = d.images.find((img) => img.id === imageId)

      if (!moved || toIndex < 0 || toIndex >= d.images.length) {
        return d
      }

      const images = d.images.filter((img) => img.id !== imageId)
      images.splice(toIndex, 0, moved)

      return { ...d, images }
    })
  }

  // Keyboard alternative to dragging: Alt + arrow keys move the focused image
  function onTileKeyDown(
    e: KeyboardEvent<HTMLLIElement>,
    imageId: string,
    index: number
  ) {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) {
      return
    }

    e.preventDefault()

    moveImage(imageId, index + (e.key === 'ArrowLeft' ? -1 : 1))

    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(`[data-image-id="${imageId}"] .thumb-link`)
        ?.focus()
    )
  }

  // Images move on drop, not while hovering
  function dropOn(index: number) {
    if (dragId) {
      moveImage(dragId, index)
    }

    setDragId(null)
    setOverId(null)
  }

  function removeImage() {
    if (!imageToRemove) return

    setDraft((d) => ({
      ...d,
      images: d.images.filter((img) => img.id !== imageToRemove.id),
    }))

    setImageToRemove(null)
  }

  function confirmDeleteCollection() {
    deleteCollection(collection.id)
    navigate('/collections')
  }

  function confirmPrivacyChange() {
    if (pendingPrivacy === null) return

    setDraft((d) => ({
      ...d,
      isPrivate: pendingPrivacy,
    }))

    setPendingPrivacy(null)
  }

  const previewPath = `/collections/${collection.id}/preview`

  return (
    <div className="page collection-edit-page">

      {/* ========================================
          TOP NAVIGATION
      ======================================== */}

      <div className="collection-edit-top-nav">

        <Link
          to="/collections"
          className="collection-edit-back"
          onClick={(e) => {
            if (dirty) {
              e.preventDefault()
              requestNavigate('/collections')
            }
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>BACK TO ALL COLLECTIONS</span>
        </Link>

        <div className="collection-edit-controls">

          <div className="collection-edit-top-actions">

            <span className="save-status" role="status">
              {status}
            </span>

            <button
              type="button"
              className="btn"
              disabled={!dirty}
              onClick={saveChanges}
            >
              Save changes
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-delete"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete collection
            </button>

            <Link
              to={previewPath}
              className="btn btn-secondary"
              onClick={(e) => {
                if (dirty) {
                  e.preventDefault()
                  requestNavigate(previewPath)
                }
              }}
            >
              Preview
            </Link>

          </div>

          {/* Privacy toggle */}
          <div className="collection-edit-privacy">

            <label className="toggle">
              <span>Private</span>

              <input
                type="checkbox"
                role="switch"
                checked={draft.isPrivate}
                onChange={(e) => {
                  setPendingPrivacy(e.target.checked)
                }}
              />

              <span className="toggle-track" aria-hidden="true" />
            </label>

          </div>

        </div>
      </div>

      {/* ========================================
          COLLECTION INFORMATION
      ======================================== */}

      <header className="page-header collection-edit-header">

        <div className="collection-meta">

          <EditableText
            as="h1"
            className="title-text"
            label="collection name"
            value={draft.name}
            onChange={(name) =>
              setDraft((d) => ({
                ...d,
                name,
              }))
            }
            fallback={collection.name}
          />

          <EditableText
            className="multiline"
            textClassName="muted"
            label="general info"
            multiline
            placeholder="Add general info about this collection"
            value={draft.info}
            onChange={(info) =>
              setDraft((d) => ({
                ...d,
                info,
              }))
            }
          />

        </div>

      </header>

      {/* ========================================
          DRAG-AND-DROP INSTRUCTIONS
      ======================================== */}

      <p className="drag-hint muted">
        {draft.images.length === 0
          ? 'No images yet. Click + to add some.'
          : 'Drag an image onto another to move it there (or focus one and press Alt + arrow keys)'}
      </p>

      {/* ========================================
          IMAGE GRID
      ======================================== */}

      <ul className="image-grid">

        {draft.images.map((image, i) => (
          <li
            key={image.id}
            data-image-id={image.id}
            style={{ '--ar': image.aspectRatio } as CSSProperties}
            className={[
              'tile-wrap',
              dragId === image.id && 'dragging',
              overId === image.id &&
                dragId !== image.id &&
                'drop-target',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', image.id)
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
            onKeyDown={(e) =>
              onTileKeyDown(e, image.id, i)
            }
          >
            <Thumbnail
              image={image}
              to={`/collections/${collection.id}/images/${image.id}`}
              label={`${image.title}, position ${
                i + 1
              } of ${draft.images.length}`}
            >
              <button
                type="button"
                className="remove-badge"
                aria-label={`Delete ${image.title}`}
                title="Delete photo"
                onClick={() =>
                  setImageToRemove(image)
                }
              >
                ×
              </button>
            </Thumbnail>
          </li>
        ))}

        {/* Add images tile */}
        <li
          className={
            overId === 'add'
              ? 'drop-target'
              : undefined
          }
          onDragOver={(e) => {
            if (!dragId) return

            e.preventDefault()
            setOverId('add')
          }}
          onDrop={(e) => {
            e.preventDefault()
            dropOn(draft.images.length - 1)
          }}
        >
          <Link
            to={`/collections/${collection.id}/upload`}
            className="thumb add-tile"
            title="Add images"
            aria-label="Add images"
          >
            +
          </Link>
        </li>

      </ul>

      {/* ========================================
          PRIVACY CONFIRMATION DIALOG
      ======================================== */}

      <Dialog
        open={pendingPrivacy !== null}
        title={
          pendingPrivacy
            ? 'Make Collection Private'
            : 'Make Collection Public'
        }
        onClose={() => setPendingPrivacy(null)}
        actions={
          <>
            <button
              type="button"
              className="collection-dialog-cancel"
              onClick={() => setPendingPrivacy(null)}
            >
              CANCEL
            </button>

            <button
              type="button"
              className="collection-dialog-confirm"
              onClick={confirmPrivacyChange}
            >
              CONFIRM
            </button>
          </>
        }
      >
        <div className="collection-confirmation-content">

          <p className="collection-confirmation-description">
            {pendingPrivacy
              ? 'Are you sure you want to make this collection private?'
              : 'Are you sure you want to make this collection public?'}
          </p>

          <div className="collection-confirmation-info">

            <Info
              size={20}
              strokeWidth={1.5}
              className="collection-confirmation-icon"
              aria-hidden="true"
            />

            <div>
              <h3>
                {pendingPrivacy
                  ? 'About private collections'
                  : 'About public collections'}
              </h3>

              <p>
                {pendingPrivacy
                  ? 'Private collections can only be viewed by people who have access to the collection link. They will not appear in the general collections view.'
                  : 'Public collections appear in the general collections view and can be viewed by visitors.'}
              </p>
            </div>

          </div>

          <p className="collection-confirmation-note">
            Changes will take effect after clicking Save changes.
          </p>

        </div>
      </Dialog>

      {/* ========================================
          DELETE IMAGE DIALOG
      ======================================== */}

      <Dialog
        open={imageToRemove !== null}
        title="Delete this photo from your library?"
        onClose={() => setImageToRemove(null)}
        actions={
          <>
            <button
              type="button"
              className="collection-dialog-cancel"
              onClick={() => setImageToRemove(null)}
            >
              CANCEL
            </button>

            <button
              type="button"
              className="collection-dialog-confirm collection-dialog-danger"
              onClick={removeImage}
            >
              DELETE PHOTO
            </button>
          </>
        }
      >
        <div className="collection-confirmation-content">

          <p className="collection-confirmation-description">
            Are you sure you want to remove “{imageToRemove?.title}”?
          </p>

          <div className="collection-confirmation-info collection-confirmation-danger">

            <AlertTriangle
              size={20}
              strokeWidth={1.5}
              className="collection-confirmation-icon"
              aria-hidden="true"
            />

            <div>
              <h3>About deleting photos</h3>

              <p>
                This photo will be removed from your library, not just this
                collection. The removal takes effect when you save changes.
              </p>
            </div>

          </div>

        </div>
      </Dialog>

      {/* ========================================
          DELETE COLLECTION DIALOG
      ======================================== */}

      <Dialog
        open={confirmingDelete}
        title="Delete Collection"
        onClose={() => setConfirmingDelete(false)}
        actions={
          <>
            <button
              type="button"
              className="collection-dialog-cancel"
              onClick={() => setConfirmingDelete(false)}
            >
              CANCEL
            </button>

            <button
              type="button"
              className="collection-dialog-confirm collection-dialog-danger"
              onClick={confirmDeleteCollection}
            >
              CONFIRM
            </button>
          </>
        }
      >
        <div className="collection-confirmation-content">

          <p className="collection-confirmation-description">
            Are you sure you want to delete “{collection.name}”?
          </p>

          <div className="collection-confirmation-info collection-confirmation-danger">

            <AlertTriangle
              size={20}
              strokeWidth={1.5}
              className="collection-confirmation-icon"
              aria-hidden="true"
            />

            <div>
              <h3>This action cannot be undone</h3>

              <p>
                Deleting this collection will permanently remove the
                collection and all {collection.images.length}{' '}
                {collection.images.length === 1 ? 'photo' : 'photos'} in it.
              </p>
            </div>

          </div>

        </div>
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
        <CollectionEditor
          key={collection.id}
          collection={collection}
        />
      ) : (
        <div className="page">
          <p>Collection not found.</p>
          <Link to="/collections">
            Back to collections
          </Link>
        </div>
      )}
    </Layout>
  )
}