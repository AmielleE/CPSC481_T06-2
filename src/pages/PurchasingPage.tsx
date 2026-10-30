import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import Dialog from '../components/Dialog'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
import { useLibrary, type LibraryImage } from '../data/library'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import './Purchasing.css'

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

export default function PurchasingPage() {
  const { collections, updateImage } = useLibrary()
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({})
  // Unsaved moves between the two sections (× removes, the price dialog adds); applied on save
  const [forSaleDrafts, setForSaleDrafts] = useState<Record<string, boolean>>({})
  // Image being listed for sale; the dialog asks for its price first
  const [listing, setListing] = useState<{ collectionId: string; image: LibraryImage } | null>(null)
  const [listingPrice, setListingPrice] = useState('')
  const [listingTouched, setListingTouched] = useState(false)

  const isForSale = (image: LibraryImage) => forSaleDrafts[image.id] ?? image.forSale

  const saleImages = collections.flatMap((collection) =>
    collection.images.filter(isForSale).map((image) => ({ collectionId: collection.id, image })),
  )

  // Images not yet for sale, grouped by collection; collections with none are left out
  const unavailableByCollection = collections
    .map((collection) => ({ collection, images: collection.images.filter((image) => !isForSale(image)) }))
    .filter(({ images }) => images.length > 0)

  const hasChanges =
    collections.some((collection) => collection.images.some((image) => isForSale(image) !== image.forSale)) ||
    saleImages.some(({ image }) => {
      const draft = draftPrices[image.id]
      const saved = image.price === null ? '' : image.price.toFixed(2)
      return draft !== undefined && draft.trim() !== saved
    })

  const hasInvalidPrice = saleImages.some(({ image }) => {
    const saved = image.price === null ? '' : image.price.toFixed(2)
    return !PRICE_PATTERN.test((draftPrices[image.id] ?? saved).trim())
  })

  const listingPriceInvalid = !PRICE_PATTERN.test(listingPrice.trim())

  function openListing(collectionId: string, image: LibraryImage) {
    setListing({ collectionId, image })
    setListingPrice(image.price === null ? '' : image.price.toFixed(2))
    setListingTouched(false)
  }

  // Moves the image up with the chosen price as an unsaved edit, so it can still be changed before saving
  function confirmListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setListingTouched(true)
    if (!listing || listingPriceInvalid) return

    setForSaleDrafts((current) => ({ ...current, [listing.image.id]: true }))
    setDraftPrices((current) => ({ ...current, [listing.image.id]: Number(listingPrice.trim()).toFixed(2) }))
    setListing(null)
  }

  // Unsaved price edits are dropped so the image shows its saved price if it's listed again
  function removeFromSale(imageId: string) {
    setForSaleDrafts((current) => ({ ...current, [imageId]: false }))
    setDraftPrices((current) => {
      const next = { ...current }
      delete next[imageId]
      return next
    })
  }

  function save() {
    const nextDrafts = { ...draftPrices }
    collections.forEach((collection) =>
      collection.images.forEach((image) => {
        const changes: Partial<LibraryImage> = {}
        const forSale = isForSale(image)
        if (forSale !== image.forSale) changes.forSale = forSale

        // Prices are only saved for images that end up for sale; removed ones keep their old price
        const value = draftPrices[image.id]
        if (forSale && value !== undefined) {
          const price = Number(value.trim())
          if (price !== image.price) changes.price = price
          nextDrafts[image.id] = price.toFixed(2)
        }

        if (Object.keys(changes).length > 0) updateImage(collection.id, image.id, changes)
      }),
    )

    setForSaleDrafts({})
    setDraftPrices(nextDrafts)
  }

  // Leaving with unsaved changes (including via Preview) asks to save first, like the edit pages
  const { saveChanges, status, dialog } = useUnsavedChanges(hasChanges, save, 'page', !hasInvalidPrice)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (hasChanges && !hasInvalidPrice) saveChanges()
  }

  return (
    <Layout>
      <form className="page" onSubmit={submit}>
        {/* Status, Save changes and Preview on top like the collection page; sales history spans both buttons below */}
        <header className="page-header">
          <h1 className="page-title">Purchasing</h1>
          <div className="purchase-actions">
            <span className="save-status" role="status" aria-live="polite">
              {status}
            </span>
            <button type="submit" className="btn" disabled={!hasChanges || hasInvalidPrice}>
              Save changes
            </button>
            {/* Preview sits top-right, where "Exit preview" is */}
            <Link to="/purchasing/preview" className="btn btn-secondary">
              Preview
            </Link>
            <Link to="/purchasing/history" className="btn btn-secondary purchase-history-btn">
              View sales history
            </Link>
          </div>
        </header>

        <section className="purchase-section">
          <h2 className="section-heading">Images available for purchase</h2>
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
                    <Thumbnail image={image} to={`/collections/${collectionId}/images/${image.id}`} label={image.title}>
                      <button
                        type="button"
                        className="remove-badge"
                        aria-label={`Remove ${image.title} from sale`}
                        title="Remove from sale"
                        onClick={() => removeFromSale(image.id)}
                      >
                        ×
                      </button>
                    </Thumbnail>
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
                          onChange={(event) =>
                            setDraftPrices((current) => ({ ...current, [image.id]: event.target.value }))
                          }
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
        </section>

        <section className="purchase-section">
          <h2 className="section-heading">Not available for purchase</h2>
          {unavailableByCollection.length > 0 && (
            <p className="section-hint muted">
              Click an image to set its price and add it to the images available for purchase. Save changes to make it
              available to customers.
            </p>
          )}
          {unavailableByCollection.length > 0 ? (
            unavailableByCollection.map(({ collection, images }) => (
              <div className="purchase-group" key={collection.id}>
                <h3 className="group-heading">{collection.name}</h3>
                <ul className="scroll-row">
                  {images.map((image) => (
                    <li
                      className="sale-item"
                      key={`${collection.id}-${image.id}`}
                      style={{ '--ar': image.aspectRatio } as CSSProperties}
                    >
                      <Thumbnail
                        image={image}
                        onClick={() => openListing(collection.id, image)}
                        label={`List ${image.title} for sale`}
                      >
                        {/* Shown on hover or keyboard focus so it's clear clicking adds the image */}
                        <span className="add-overlay" aria-hidden="true">
                          + Add for sale
                        </span>
                      </Thumbnail>
                      <p className="sale-title" title={image.title}>
                        {image.title}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="muted">Every image is available for purchase.</p>
          )}
        </section>
      </form>

      {/* Outside the page form so submitting the price doesn't also save the page */}
      <Dialog
        open={listing !== null}
        title="List this photo for sale"
        onClose={() => setListing(null)}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setListing(null)}>
              Cancel
            </button>
            <button type="submit" form="listing-form" className="btn">
              Make available
            </button>
          </>
        }
      >
        <form id="listing-form" className="field" onSubmit={confirmListing} noValidate>
          <span className="small">Set a price for “{listing?.image.title}”</span>
          <div className={`price-input${listingTouched && listingPriceInvalid ? ' invalid' : ''}`}>
            <span aria-hidden="true">$</span>
            <input
              type="text"
              inputMode="decimal"
              aria-label="Price in dollars"
              aria-invalid={listingTouched && listingPriceInvalid}
              autoFocus
              value={listingPrice}
              onChange={(event) => setListingPrice(event.target.value)}
            />
          </div>
          {listingTouched && listingPriceInvalid && <p className="field-error">Enter a price, such as 25 or 25.50.</p>}
        </form>
      </Dialog>

      {dialog}
    </Layout>
  )
}
