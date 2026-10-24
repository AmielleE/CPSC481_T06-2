import { Link, useParams } from 'react-router'
import Layout from '../components/Layout'
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
            <li key={image.id}>
              <Link
                to={`/collections/${collection.id}/preview/images/${image.id}`}
                className="tile"
                aria-label={image.title}
              >
                {image.src && <img src={image.src} alt={image.title} />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}