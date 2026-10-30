import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
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
    setSaveMessage('Changes saved')
  }

  return (
    <Layout>
      <form className="page" onSubmit={saveChanges}>
        {/* Same header and button order as the collection page: status, Save changes, then the secondary link */}
        <header className="page-header">
          <h1 className="page-title">Available for purchase</h1>
          <div className="action-row">
            <span className="save-status" role="status" aria-live="polite">
              {hasChanges ? 'Unsaved changes' : saveMessage}
            </span>
            <button type="submit" className="btn" disabled={!hasChanges || hasInvalidPrice}>
              Save changes
            </button>
            <Link to="/purchasing/history" className="btn btn-secondary">
              Purchase history
            </Link>
          </div>
        </header>

        {saleImages.length > 0 ? (
          <ul className="image-grid">
            {saleImages.map(({ collectionId, image }) => {
              const savedPrice = image.price === null ? '' : image.price.toFixed(2)
              const price = draftPrices[image.id] ?? savedPrice
              const priceInvalid = !PRICE_PATTERN.test(price.trim())

              return (
                <li
                  className="sale-item"
                  key={`${collectionId}-${image.id}`}
                  style={{ '--ar': image.aspectRatio } as CSSProperties}
                >
                  <Thumbnail image={image} to={`/collections/${collectionId}/images/${image.id}`} label={image.title} />
                  {/* Name under the bottom-left corner, price under the bottom-right */}
                  <div className="sale-caption">
                    <p className="sale-title" title={image.title}>
                      {image.title}
                    </p>
                    <div className={`price-input${priceInvalid ? ' invalid' : ''}`}>
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
                    </div>
                  </div>
                  {priceInvalid && <p className="field-error">Enter a price, such as 25 or 25.50.</p>}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="muted">No images are currently available for purchase.</p>
        )}
      </form>
    </Layout>
  )
}
