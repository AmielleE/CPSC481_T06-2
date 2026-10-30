import { Link } from 'react-router'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">

      {/* Left sidebar */}
      <aside className="home-sidebar">

        {/* Centered sidebar content */}
        <div className="home-sidebar-content">

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

            {/* Purchase */}
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

              <span>Purchase</span>
            </Link>

          </nav>

        </div>

        {/* Logout button at bottom of sidebar */}
        <Link to="/login" className="home-logout-button">
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
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
          </svg>

          <span>Logout</span>
        </Link>

      </aside>

      {/* Main content */}
      <main className="home-content">

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