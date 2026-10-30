import Layout from '../components/Layout'
import './Home.css'

export default function Home() {
  return (
    <Layout>

      <div className="home-page">

        {/* Collection preview */}
        <section className="home-collection">

          <h1>Collection 1</h1>

          {/* Image */}
          <div className="home-image">
            <span>image</span>
          </div>

          {/* Image information */}
          <div className="home-image-info">

            <div className="home-image-description">
              <h3>Title</h3>
              <p>Image Description</p>
            </div>

            <p className="home-image-details">
              Image Details (format, date, size, etc.)
            </p>

          </div>

        </section>

      </div>

    </Layout>
  )
}