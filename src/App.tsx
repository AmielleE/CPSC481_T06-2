import { Link, Route, Routes } from 'react-router'
import './App.css'

function Home() {
  return (
    <section>
      <h1>Home</h1>
      <p>Your React app is ready.</p>
    </section>
  )
}

function About() {
  return (
    <section>
      <h1>About</h1>
      <p>A second route, powered by React Router.</p>
    </section>
  )
}

function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </section>
  )
}

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link className="site-title" to="/">CPSC481_T06-2</Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
