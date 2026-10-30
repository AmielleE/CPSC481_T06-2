import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router'

const links = [
  { to: '/', label: 'Home', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { to: '/collections', label: 'Collections', icon: 'M3 6h6l2 2h10v11H3z' },
  { to: '/purchasing', label: 'Purchase', icon: 'M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">

      <nav className="sidebar" aria-label="Main navigation">

        {/* Main navigation links */}
        <div className="sidebar-navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="sidebar-link"
              title={link.label}
            >
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
                <path d={link.icon} />
              </svg>

              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Logout button */}
        <Link
          to="/login"
          className="sidebar-link sidebar-logout"
          title="Logout"
        >
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

      </nav>

      <main className="main">
        {children}
      </main>

    </div>
  )
}