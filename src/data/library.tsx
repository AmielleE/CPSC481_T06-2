import { createContext, useContext, useState, type ReactNode } from 'react'

export type LibraryImage = {
  id: string
  title: string
  description: string
  src: string | null // null = grey placeholder tile
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

function makePlaceholders(collectionId: string, count: number): LibraryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${collectionId}-img-${i + 1}`,
    title: `Image title ${i + 1}`,
    description: 'Image description goes here.',
    src: null,
    forSale: i % 3 === 0,
    price: i % 3 === 0 ? 25 + i * 5 : null,
  }))
}

const initialCollections: Collection[] = [
  {
    id: 'collection-1',
    name: 'Collection 1',
    info: 'General info about this collection.',
    isPrivate: false,
    images: makePlaceholders('collection-1', 12),
  },
  {
    id: 'collection-2',
    name: 'Collection 2',
    info: 'General info about this collection.',
    isPrivate: true,
    images: makePlaceholders('collection-2', 8),
  },
]

type LibraryContextValue = {
  collections: Collection[]
  getCollection: (id: string) => Collection | undefined
  addImages: (collectionId: string, files: File[]) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)

  const getCollection = (id: string) => collections.find((c) => c.id === id)

  const addImages = (collectionId: string, files: File[]) => {
    const stamp = Date.now()
    setCollections((prev) =>
      prev.map((c) =>
        c.id !== collectionId
          ? c
          : {
              ...c,
              images: [
                ...c.images,
                ...files.map((file, i) => ({
                  id: `${collectionId}-${stamp}-${i}`,
                  title: file.name.replace(/\.[^.]+$/, ''),
                  description: '',
                  src: URL.createObjectURL(file),
                  forSale: false,
                  price: null,
                })),
              ],
            },
      ),
    )
  }

  return (
    <LibraryContext.Provider value={{ collections, getCollection, addImages }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>')
  return ctx
}