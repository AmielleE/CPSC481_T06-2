import { Link } from 'react-router'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">

      {/* Left sidebar */}
      <aside className="home-sidebar">

        {/* Photographer name */}
        <h2>John Doe</h2>

        {/* Sidebar navigation */}
        <nav className="home-navigation">

          {/* Collections */}
          <Link to="/collections" className="home-nav-button">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h6l2 2h10v11H3z" />
            </svg>

            <span>Collections</span>
          </Link>

          {/* Images for Purchase */}
          <Link to="/purchasing" className="home-nav-button">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01" />
            </svg>

            <span>Images for Purchase</span>
          </Link>

        </nav>
      </aside>

      {/* Main content */}
      <main className="home-content">

        {/* Login button */}
        <div className="home-header">
          <Link to="/login" className="home-login">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>

            Login
          </Link>
        </div>

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

      </main>
    </div>
  )
}