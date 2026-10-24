import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'

const MAX_BYTES = 100 * 1024 * 1024 // 100 MB limit from Portfolio 1 constraints

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default function UploadImagesPage() {
  const { collectionId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getCollection, addImages } = useLibrary()

  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const collection = getCollection(collectionId)
  // Cancelling while creating a new collection goes back to all collections
  const cancelTarget =
    searchParams.get('new') === 'true' ? '/collections' : `/collections/${collectionId}`

  function handleFiles(list: FileList | null) {
    if (!list) return
    const accepted: File[] = []
    const rejected: string[] = []
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) rejected.push(`${file.name} is not an image file.`)
      else if (file.size > MAX_BYTES) rejected.push(`${file.name} is larger than 100 MB.`)
      else accepted.push(file)
    }
    setFiles((prev) => [...prev, ...accepted])
    setErrors(rejected)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    e.target.value = '' // lets the same file be picked again
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function onFinish() {
    addImages(collectionId, files)
    navigate(`/collections/${collectionId}`)
  }

  if (!collection) {
    return (
      <Layout>
        <div className="page">
          <p>Collection not found.</p>
          <Link to="/collections">Back to collections</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(cancelTarget)}>
          Cancel
        </button>

        <div className="upload">
          <h1 className="page-title">Upload images</h1>
          <p className="muted">Adding to {collection.name}</p>

          <div
            className={`dropzone${dragging ? ' dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <p>Drag and drop images here</p>
            <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
              Select files
            </button>
            <p className="muted small">Image files only, up to 100 MB each</p>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onInputChange} />
          </div>

          {errors.length > 0 && (
            <ul className="error-list" role="alert">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {files.length > 0 && (
            <ul className="file-list" aria-label="Files ready to upload">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`}>
                  <span>
                    {file.name} <span className="muted small">({formatSize(file.size)})</span>
                  </span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="btn btn-primary" disabled={files.length === 0} onClick={onFinish}>
            Finish
          </button>
        </div>
      </div>
    </Layout>
  )
}