import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import Layout from '../components/Layout'
import Thumbnail from '../components/Thumbnail'
import { useLibrary } from '../data/library'

export default function CollectionPreviewPage() {
  const { collectionId = '' } = useParams()
  const { getCollection } = useLibrary()
  const collection = getCollection(collectionId)

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
        <header className="page-header">
          <div>
            <h1 className="page-title">{collection.name}</h1>
            <p className="muted">{collection.info}</p>
            {collection.isPrivate && (
              <p className="notice">Private: visitors cannot see this collection.</p>
            )}
          </div>
          <Link to={`/collections/${collection.id}`} className="btn btn-secondary">
            Exit preview
          </Link>
        </header>

        <ul className="image-grid">
          {collection.images.map((image) => (
            <li key={image.id} style={{ '--ar': image.aspectRatio } as CSSProperties}>
              <Thumbnail
                image={image}
                to={`/collections/${collection.id}/preview/images/${image.id}`}
                label={image.title}
              />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}