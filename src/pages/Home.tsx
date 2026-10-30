import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import { useLibrary } from '../data/library'
import type { LibraryImage } from '../data/library'
import './Home.css'

const SLIDESHOW_INTERVAL = 10000
const FADE_DURATION = 350

type FeaturedImage = {
  image: LibraryImage
  collectionId: string
  collectionName: string
}

function shuffleImages(total: number, previousLast?: number): number[] {
  const indices = Array.from({ length: total }, (_, index) => index)

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  // Avoid displaying the same image across shuffle boundaries.
  if (total > 1 && indices[0] === previousLast) {
    const swapIndex = 1 + Math.floor(Math.random() * (total - 1))

    ;[indices[0], indices[swapIndex]] = [
      indices[swapIndex],
      indices[0],
    ]
  }

  return indices
}

export default function Home() {
  const { collections } = useLibrary()

  // Gather photographs from PUBLIC collections only.
  // Private collections are completely excluded from the slideshow.
  const featuredImages: FeaturedImage[] = collections
    .filter((collection) => !collection.isPrivate)
    .flatMap((collection) =>
      collection.images
        .filter((image) => image.src || image.thumbSrc)
        .map((image) => ({
          image,
          collectionId: collection.id,
          collectionName: collection.name,
        }))
    )

  // A shuffled playlist, rather than the original collection order.
  const [slideshow, setSlideshow] = useState<{
    order: number[]
    position: number
  }>(() => ({
    order: shuffleImages(featuredImages.length),
    position: 0,
  }))

  const [imageVisible, setImageVisible] = useState(true)

  // Rebuild the playlist when the number of public photographs changes.
  useEffect(() => {
    setSlideshow({
      order: shuffleImages(featuredImages.length),
      position: 0,
    })

    setImageVisible(true)
  }, [featuredImages.length])

  // Advance through the randomized playlist.
  useEffect(() => {
    if (featuredImages.length <= 1) return

    let fadeTimeout: number | undefined

    const interval = window.setInterval(() => {
      setImageVisible(false)

      fadeTimeout = window.setTimeout(() => {
        setSlideshow((previous) => {
          const nextPosition = previous.position + 1

          // Continue through the shuffled images.
          if (nextPosition < previous.order.length) {
            return {
              ...previous,
              position: nextPosition,
            }
          }

          // Once every photograph has appeared, shuffle again.
          const lastImage =
            previous.order[previous.order.length - 1]

          return {
            order: shuffleImages(featuredImages.length, lastImage),
            position: 0,
          }
        })

        setImageVisible(true)
      }, FADE_DURATION)
    }, SLIDESHOW_INTERVAL)

    return () => {
      window.clearInterval(interval)

      if (fadeTimeout !== undefined) {
        window.clearTimeout(fadeTimeout)
      }
    }
  }, [featuredImages.length])

  const currentIndex = slideshow.order[slideshow.position]

  const current =
    currentIndex !== undefined
      ? featuredImages[currentIndex]
      : undefined

  return (
    <Layout>
      <div className="home-page">
        <section className="home-collection">
          {current ? (
            <>
              {/* Collection heading */}
              <div className="home-collection-header">
                <div>
                  <span className="home-section-label">
                    FEATURED PHOTOGRAPHY
                  </span>

                  <h1>{current.collectionName}</h1>
                </div>

                <Link
                  to={`/collections/${current.collectionId}/preview`}
                  className="home-view-collection"
                >
                  VIEW COLLECTION
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              {/* Featured photograph */}
              <div className="home-image">
                <img
                  src={
                    current.image.src ||
                    current.image.thumbSrc ||
                    ''
                  }
                  alt={
                    current.image.description ||
                    current.image.title
                  }
                  className={`home-featured-image ${
                    imageVisible ? 'visible' : 'hidden'
                  }`}
                />
              </div>

              {/* Image information */}
              <div className="home-image-info">
                <div className="home-image-description">
                  <h3>{current.image.title}</h3>

                  {current.image.description?.trim() && (
                    <p>{current.image.description}</p>
                  )}
                </div>

                <div className="home-image-details">

                  {/* Counter always stays at the top */}
                  <span className="home-slideshow-counter">
                    {String(slideshow.position + 1).padStart(2, '0')}
                    {' / '}
                    {String(featuredImages.length).padStart(2, '0')}
                  </span>

                  {/* Purchase status appears below the counter */}
                  {current.image.forSale && (
                    <span>AVAILABLE FOR PURCHASE</span>
                  )}

                </div>
              </div>
            </>
          ) : (
            <div className="home-empty">
              <span className="home-section-label">
                YOUR PHOTOGRAPHY LIBRARY
              </span>

              <h1>Your photographs, beautifully organized.</h1>

              <p>
                Create a public collection and upload your first
                photographs to get started.
              </p>

              <Link
                to="/collections"
                className="home-empty-button"
              >
                VIEW COLLECTIONS
              </Link>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}