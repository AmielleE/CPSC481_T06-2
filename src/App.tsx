import { Link, Route, Routes } from 'react-router'
import { LibraryProvider } from './data/library'

import Home from './pages/Home'
import Login from './pages/Login'
import Collections from './pages/Collections'

import CollectionPage from './pages/CollectionPage'
import CollectionPreviewPage from './pages/CollectionPreviewPage'
import ImageEditPage from './pages/ImageEditPage'
import ImagePreviewPage from './pages/ImagePreviewPage'
import UploadImagesPage from './pages/UploadImagesPage'
import PurchasingPage from './pages/PurchasingPage'
import PurchaseHistoryPage from './pages/PurchaseHistoryPage'

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
        <Route path="/login" element={<Login />} />
        <Route path="/purchasing" element={<PurchasingPage />} />
        <Route path="/purchasing/history" element={<PurchaseHistoryPage />} />

        {/* Collections page */}
        <Route path="/collections" element={<Collections />} />

        {/* Existing collection routes */}
        <Route
          path="/collections/:collectionId"
          element={<CollectionPage />}
        />

        <Route
          path="/collections/:collectionId/images/:imageId"
          element={<ImageEditPage />}
        />

        <Route
          path="/collections/:collectionId/upload"
          element={<UploadImagesPage />}
        />

        <Route
          path="/collections/:collectionId/preview"
          element={<CollectionPreviewPage />}
        />

        <Route
          path="/collections/:collectionId/preview/images/:imageId"
          element={<ImagePreviewPage />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </LibraryProvider>
  )
}