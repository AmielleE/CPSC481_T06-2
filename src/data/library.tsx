import { createContext, useContext, useState, type ReactNode } from 'react'

export type LibraryImage = {
  id: string
  title: string
  description: string
  src: string | null // null = grey placeholder tile
  thumbSrc: string | null // small copy used in grids; full-size images are slow to repaint
  aspectRatio: number // width / height
  forSale: boolean
  price: number | null
}

export type Collection = {
  id: string
  name: string
  info: string
  isPrivate: boolean
  images: LibraryImage[]
}

const THUMB_SIZE = 480 // px on the longest side; sharp enough for grid tiles on high-DPI screens
// When you add large images to the library it slows down the UI quite a lot so we are making thumbnails for images.
async function makeThumbnail(file: File) {
  const fullSrc = URL.createObjectURL(file)
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const scale = Math.min(1, THUMB_SIZE / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    return { src: fullSrc, thumbSrc: blob ? URL.createObjectURL(blob) : fullSrc, aspectRatio: width / height }
  } catch {
    // Formats the browser can't decode here (e.g. some RAW/HEIC files) fall back to the original
    return { src: fullSrc, thumbSrc: fullSrc, aspectRatio: 1 }
  }
}

// Blank stand-ins for photos so the prototype can be walked through on GitHub Pages without real images.
// Shapes vary (landscape, portrait, square) so the original-aspect-ratio thumbnails are visible.
const PLACEHOLDER_RATIOS = [3 / 2, 2 / 3, 1, 4 / 3, 3 / 4, 16 / 9]

function makePlaceholders(collectionId: string, count: number): LibraryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${collectionId}-img-${i + 1}`,
    title: `Image ${i + 1}`,
    description: i % 2 === 0 ? 'A short description of this photo.' : '',
    src: null,
    thumbSrc: null,
    aspectRatio: PLACEHOLDER_RATIOS[i % PLACEHOLDER_RATIOS.length],
    forSale: i % 4 === 0,
    price: i % 4 === 0 ? 25 + i * 5 : null,
  }))
}

// IDs and names match the "All Collections" page (src/pages/Collections.tsx) so its cards open these
const initialCollections: Collection[] = [
  {
    id: '1',
    name: 'Collection 1',
    info: 'General info about this collection.\nUse this space for context about the shoot or project.',
    isPrivate: false,
    images: makePlaceholders('1', 12),
  },
  {
    id: '2',
    name: 'Collection 2',
    info: 'General info about this collection.',
    isPrivate: false,
    images: makePlaceholders('2', 8),
  },
  {
    id: '3',
    name: 'Collection 3',
    info: 'General info about this collection.',
    isPrivate: false,
    images: makePlaceholders('3', 6),
  },
  {
    id: '4',
    name: 'Collection 4',
    info: '', // empty collection: shows the "add images" state
    isPrivate: false,
    images: [],
  },
  {
    id: '5',
    name: 'Collection 5',
    info: 'General info about this collection.',
    isPrivate: true,
    images: makePlaceholders('5', 5),
  },
]

type LibraryContextValue = {
  collections: Collection[]
  getCollection: (id: string) => Collection | undefined
  addImages: (collectionId: string, files: File[]) => Promise<void>
  updateCollection: (collectionId: string, changes: Partial<Omit<Collection, 'id'>>) => void
  deleteCollection: (collectionId: string) => void
  updateImage: (collectionId: string, imageId: string, changes: Partial<Omit<LibraryImage, 'id'>>) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)

  const getCollection = (id: string) => collections.find((c) => c.id === id)

  // Thumbnails are generated in the background; the images appear once they're ready
  const addImages = async (collectionId: string, files: File[]) => {
    const stamp = Date.now()
    const thumbnails = await Promise.all(files.map(makeThumbnail))
    const newImages: LibraryImage[] = files.map((file, i) => ({
      id: `${collectionId}-${stamp}-${i}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      ...thumbnails[i],
      forSale: false,
      price: null,
    }))
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, images: [...c.images, ...newImages] } : c)),
    )
  }

  const updateCollection = (collectionId: string, changes: Partial<Omit<Collection, 'id'>>) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, ...changes } : c)))
  }

  const deleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
  }

  const updateImage = (collectionId: string, imageId: string, changes: Partial<Omit<LibraryImage, 'id'>>) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id !== collectionId
          ? c
          : { ...c, images: c.images.map((img) => (img.id === imageId ? { ...img, ...changes } : img)) },
      ),
    )
  }

  return (
    <LibraryContext.Provider
      value={{ collections, getCollection, addImages, updateCollection, deleteCollection, updateImage }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>')
  return ctx
}