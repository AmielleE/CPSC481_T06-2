import { useState } from 'react'
import { Save } from 'lucide-react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'
import './Purchasing.css'

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

export default function PurchasingPage() {
  const { collections, updateImage } = useLibrary()
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState('')

  const saleImages = collections.flatMap((collection) =>
    collection.images
      .filter((image) => image.forSale)
      .map((image) => ({ collectionId: collection.id, image })),
  )

  const hasChanges = saleImages.some(({ image }) => {
    const draft = draftPrices[image.id]
    const saved = image.price === null ? '' : image.price.toFixed(2)
    return draft !== undefined && draft.trim() !== saved
  })

  const hasInvalidPrice = saleImages.some(({ image }) => {
    const saved = image.price === null ? '' : image.price.toFixed(2)
    return !PRICE_PATTERN.test((draftPrices[image.id] ?? saved).trim())
  })

  function saveChanges(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasChanges || hasInvalidPrice) return

    const nextDrafts = { ...draftPrices }
    saleImages.forEach(({ collectionId, image }) => {
      const value = draftPrices[image.id]
      if (value === undefined) return

      const price = Number(value.trim())
      if (price !== image.price) updateImage(collectionId, image.id, { price })
      nextDrafts[image.id] = price.toFixed(2)
    })

    setDraftPrices(nextDrafts)
    setSaveMessage('Changes saved.')
  }

  return (
    <Layout>
      <form className="purchasing-page" onSubmit={saveChanges}>
        <header className="purchasing-header">
          <h1>Available for purchase</h1>
          <div className="purchasing-actions">
            <span className="purchasing-save-message" role="status" aria-live="polite">
              {saveMessage}
            </span>
            <Link to="/purchasing/history" className="purchasing-button purchasing-history-link">
              Purchase history
            </Link>
            <button
              type="submit"
              className="purchasing-button purchasing-save-button"
              disabled={!hasChanges || hasInvalidPrice}
            >
              <Save size={16} aria-hidden="true" />
              Save changes
            </button>
          </div>
        </header>

        {saleImages.length > 0 ? (
          <div className="purchasing-grid">
            {saleImages.map(({ collectionId, image }) => {
              const savedPrice = image.price === null ? '' : image.price.toFixed(2)
              const price = draftPrices[image.id] ?? savedPrice
              const priceInvalid = !PRICE_PATTERN.test(price.trim())

              return (
                <article className="purchasing-item" key={`${collectionId}-${image.id}`}>
                  <div className="purchasing-image-frame" style={{ aspectRatio: image.aspectRatio }}>
                    {image.thumbSrc ? (
                      <img src={image.thumbSrc} alt={image.title} />
                    ) : (
                      <span className="purchasing-placeholder">Image</span>
                    )}
                    <label className="purchasing-price">
                      <span aria-hidden="true">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Price for ${image.title}`}
                        aria-invalid={priceInvalid}
                        value={price}
                        onChange={(event) => {
                          setDraftPrices((current) => ({ ...current, [image.id]: event.target.value }))
                          setSaveMessage('')
                        }}
                      />
                    </label>
                  </div>
                  <h2 className="purchasing-item-title">{image.title}</h2>
                  {priceInvalid && <p className="purchasing-price-error">Enter a price, such as 25 or 25.50.</p>}
                </article>
              )
            })}
          </div>
        ) : (
          <p className="purchasing-empty">No images are currently available for purchase.</p>
        )}
      </form>
    </Layout>
  )
}
