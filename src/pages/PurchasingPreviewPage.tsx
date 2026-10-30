import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
import { useLibrary } from '../data/library'
import './Purchasing.css'

// What a customer sees: only the images for sale, each with its name and price
export default function PurchasingPreviewPage() {
  const { collections } = useLibrary()

  const saleImages = collections.flatMap((collection) =>
    collection.images
      .filter((image) => image.forSale)
      .map((image) => ({ collectionId: collection.id, image })),
  )

  return (
    <Layout>
      <div className="page">
        <header className="page-header">
          <h1 className="page-title">Available for purchase</h1>
          <Link to="/purchasing" className="btn btn-secondary">
            Exit preview
          </Link>
        </header>

        {saleImages.length > 0 ? (
          <ul className="image-grid">
            {saleImages.map(({ collectionId, image }) => (
              <li
                className="sale-item"
                key={`${collectionId}-${image.id}`}
                style={{ '--ar': image.aspectRatio } as CSSProperties}
              >
                <Thumbnail image={image} label={image.title} />
                <div className="sale-caption">
                  <p className="sale-title" title={image.title}>
                    {image.title}
                  </p>
                  {image.price !== null && <p className="sale-price">${image.price.toFixed(2)}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No images are currently available for purchase.</p>
        )}
      </div>
    </Layout>
  )
}
