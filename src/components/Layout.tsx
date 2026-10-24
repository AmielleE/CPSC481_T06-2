import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Home', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { to: '/collections', label: 'Collections', icon: 'M3 6h6l2 2h10v11H3z' },
  { to: '/purchasing', label: 'Purchasing', icon: 'M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <nav className="sidebar" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="sidebar-link" title={link.label}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={link.icon} />
            </svg>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="main">{children}</main>
    </div>
  )
}