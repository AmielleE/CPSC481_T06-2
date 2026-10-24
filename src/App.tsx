import { Link, Route, Routes } from 'react-router'
import { LibraryProvider } from './data/library'
import CollectionPreviewPage from './pages/CollectionPreviewPage'
import ImagePreviewPage from './pages/ImagePreviewPage'
import UploadImagesPage from './pages/UploadImagesPage'

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
    <LibraryProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections/:collectionId/upload" element={<UploadImagesPage />} />
        <Route path="/collections/:collectionId/preview" element={<CollectionPreviewPage />} />
        <Route
          path="/collections/:collectionId/preview/images/:imageId"
          element={<ImagePreviewPage />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LibraryProvider>
  )
}