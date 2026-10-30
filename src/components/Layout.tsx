import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router'
import './Layout.css'

const links = [
  { to: '/', label: 'HOME' },
  { to: '/collections', label: 'COLLECTIONS' },
  { to: '/purchasing', label: 'IMAGES FOR PURCHASE' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">

      {/* Shared sidebar */}
      <aside className="site-sidebar">

        {/* Photographer branding */}
        <div className="site-sidebar-brand">
          <h2>John Doe</h2>
          <p>PHOTOGRAPHY</p>
        </div>

        {/* Navigation */}
        <nav className="site-sidebar-navigation" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `site-sidebar-link${isActive ? ' site-sidebar-link-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <Link to="/login" className="site-sidebar-logout">
          LOGOUT
        </Link>

      </aside>

      {/* Page content */}
      <main className="site-main">
        {children}
      </main>

    </div>
  )
}