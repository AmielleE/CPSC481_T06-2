import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { ArrowLeft, ImagePlus, X, Check } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'
import './UploadImages.css'

const MAX_BYTES = 100 * 1024 * 1024

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
  const [processing, setProcessing] = useState(false)

  const collection = getCollection(collectionId)

  const cancelTarget =
    searchParams.get('new') === 'true'
      ? '/collections'
      : `/collections/${collectionId}`

  function handleFiles(list: FileList | null) {
    if (!list) return

    const accepted: File[] = []
    const rejected: string[] = []

    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) {
        rejected.push(`${file.name} is not an image file.`)
      } else if (file.size > MAX_BYTES) {
        rejected.push(`${file.name} is larger than 100 MB.`)
      } else {
        accepted.push(file)
      }
    }

    setFiles((prev) => [...prev, ...accepted])
    setErrors(rejected)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onFinish() {
    if (files.length === 0 || processing) return

    setProcessing(true)

    try {
      await addImages(collectionId, files)
      navigate(`/collections/${collectionId}`)
    } catch {
      setErrors(['Unable to upload images. Please try again.'])
      setProcessing(false)
    }
  }

  if (!collection) {
    return (
      <Layout>
        <div className="upload-images-page">
          <p>Collection not found.</p>
          <Link to="/collections">Back to collections</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="upload-images-page">

        <div className="upload-images-container">

          {/* Back navigation */}
          <Link
            to={cancelTarget}
            className="upload-images-back"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>BACK TO COLLECTION</span>
          </Link>

          {/* Page heading */}
          <header className="upload-images-header">
            <h1>Upload Images</h1>

            <p>
              Adding photographs to{' '}
              <span>{collection.name}</span>
            </p>
          </header>

          {/* Upload section */}
          <div className="upload-images-content">

            <div
              className={`upload-images-dropzone ${
                dragging ? 'dragging' : ''
              }`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >

              <div className="upload-images-dropzone-content">

                <div className="upload-images-icon">
                  <ImagePlus
                    size={42}
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                </div>

                <h2>Drag and drop your images here</h2>

                <p>
                  Or browse your device to select photographs
                </p>

                <button
                  type="button"
                  className="upload-images-select"
                  onClick={() => inputRef.current?.click()}
                  disabled={processing}
                >
                  SELECT FILES
                </button>

                <span className="upload-images-limit">
                  IMAGE FILES ONLY · MAXIMUM 100 MB PER FILE
                </span>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={onInputChange}
                />

              </div>

            </div>

            {/* Upload errors */}
            {errors.length > 0 && (
              <div
                className="upload-images-errors"
                role="alert"
              >
                {errors.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            )}

            {/* Selected files */}
            {files.length > 0 && (
              <div className="upload-images-selected">

                <div className="upload-images-selected-header">
                  <h2>Selected Images</h2>

                  <span>
                    {files.length}{' '}
                    {files.length === 1 ? 'IMAGE' : 'IMAGES'}
                  </span>
                </div>

                <ul className="upload-images-file-list">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>

                      <div className="upload-images-file-info">

                        <div className="upload-images-file-icon">
                          <Check
                            size={17}
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </div>

                        <div className="upload-images-file-details">
                          <span className="upload-images-file-name">
                            {file.name}
                          </span>

                          <span className="upload-images-file-size">
                            {formatSize(file.size)}
                          </span>
                        </div>

                      </div>

                      <button
                        type="button"
                        className="upload-images-remove"
                        onClick={() => removeFile(index)}
                        disabled={processing}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>

                    </li>
                  ))}
                </ul>

              </div>
            )}

            {/* Actions */}
            <div className="upload-images-actions">

              <button
                type="button"
                className="upload-images-cancel"
                onClick={() => navigate(cancelTarget)}
                disabled={processing}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="upload-images-finish"
                disabled={files.length === 0 || processing}
                onClick={onFinish}
              >
                {processing
                  ? 'PREPARING IMAGES...'
                  : `FINISH${files.length > 0 ? ` (${files.length})` : ''}`}
              </button>

            </div>

          </div>

        </div>

      </section>
    </Layout>
  )
}