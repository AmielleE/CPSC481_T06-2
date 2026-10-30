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
  format?: string
  width?: number
  height?: number
  fileSize?: number
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
    return {
      src: fullSrc,
      thumbSrc: blob ? URL.createObjectURL(blob) : fullSrc,
      aspectRatio: width / height,
      width,
      height,
    }
  } catch {
    // Formats the browser can't decode here (e.g. some RAW/HEIC files) fall back to the original
    return {
      src: fullSrc,
      thumbSrc: fullSrc,
      aspectRatio: 1,
    }
  }
}

// Sample photos bundled with the prototype. Each <name>.jpg has a pre-made <name>_thumb.jpg beside it
// (480px long side) so the grids stay fast.
const sampleUrls = import.meta.glob<string>('../assets/images/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const LANDSCAPE = 3 / 2
const PORTRAIT = 2 / 3

// [folder/file name, width / height]
type SamplePhoto = [string, number]

const COLLECTION_1: SamplePhoto[] = [
  ['collection1/DSC00013', LANDSCAPE],
  ['collection1/DSC00098', LANDSCAPE],
  ['collection1/DSC00459', PORTRAIT],
  ['collection1/DSC00668', PORTRAIT],
  ['collection1/DSC00988', LANDSCAPE],
  ['collection1/DSC01203', 3723 / 5630],
  ['collection1/DSC01503', LANDSCAPE],
  ['collection1/DSC01538', LANDSCAPE],
  ['collection1/DSC01662', 3874 / 5922],
  ['collection1/DSC01743', PORTRAIT],
  ['collection1/DSC01755', PORTRAIT],
]

const COLLECTION_2: SamplePhoto[] = [
  ['collection2/20230723_0102', LANDSCAPE],
  ['collection2/20230828_0269', LANDSCAPE],
  ['collection2/20230828_0389', LANDSCAPE],
  ['collection2/20230916_0012', LANDSCAPE],
  ['collection2/20230916_0022', LANDSCAPE],
  ['collection2/20230916_0131', LANDSCAPE],
]

const COLLECTION_3: SamplePhoto[] = [
  ['collection3/20241119_0055', LANDSCAPE],
  ['collection3/20241119_0124', LANDSCAPE],
  ['collection3/20241119_0155', 5969 / 3948],
  ['collection3/20241119_0186', LANDSCAPE],
  ['collection3/20241119_0189', LANDSCAPE],
  ['collection3/20241119_0230', LANDSCAPE],
  ['collection3/20241119_0331', LANDSCAPE],
]

// Every 4th photo is for sale; borrowed photos pass sell = false so a photo isn't listed twice
function makeSamples(collectionId: string, photos: SamplePhoto[], sell = true): LibraryImage[] {
  return photos.map(([path, aspectRatio], i) => {
    const forSale = sell && i % 4 === 0
    return {
      id: `${collectionId}-img-${i + 1}`,
      title: path.split('/')[1],
      description: '',
      src: sampleUrls[`../assets/images/${path}.jpg`],
      thumbSrc: sampleUrls[`../assets/images/${path}_thumb.jpg`],
      aspectRatio,
      forSale,
      price: forSale ? 25 + i * 5 : null,
    }
  })
}

// IDs and names match the "All Collections" page (src/pages/Collections.tsx) so its cards open these
const initialCollections: Collection[] = [
  {
    id: '1',
    name: 'Spain/Portugal',
    info: '',
    isPrivate: false,
    images: makeSamples('1', COLLECTION_1),
  },
  {
    id: '2',
    name: 'Alberta',
    info: '',
    isPrivate: false,
    images: makeSamples('2', COLLECTION_2),
  },
  {
    id: '3',
    name: 'Patagonia',
    info: '',
    isPrivate: false,
    images: makeSamples('3', COLLECTION_3),
  },
  {
    id: '4',
    name: 'Collection 4',
    info: '',
    isPrivate: false,
    images: [], // empty collection: shows the "add images" state
  },
  {
    id: '5',
    name: 'Collection 5',
    info: '',
    isPrivate: true,
    // No folder for this one, so it borrows a few photos to keep the private collection walkable
    images: makeSamples('5', [COLLECTION_1[2], COLLECTION_2[0], COLLECTION_3[3], COLLECTION_1[7], COLLECTION_2[4]], false),
  },
]

type LibraryContextValue = {
  collections: Collection[]
  getCollection: (id: string) => Collection | undefined
  addCollection: (name: string, isPrivate: boolean) => void
  addImages: (collectionId: string, files: File[]) => Promise<void>
  updateCollection: (collectionId: string, changes: Partial<Omit<Collection, 'id'>>) => void
  deleteCollection: (collectionId: string) => void
  updateImage: (collectionId: string, imageId: string, changes: Partial<Omit<LibraryImage, 'id'>>) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)

  const getCollection = (id: string) => collections.find((c) => c.id === id)

  const addCollection = (name: string, isPrivate: boolean) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      info: '',
      isPrivate,
      images: [],
    }
  
    setCollections((prev) => [...prev, newCollection])
  }

  // Thumbnails are generated in the background; the images appear once they're ready
  const addImages = async (collectionId: string, files: File[]) => {
    const stamp = Date.now()
    const thumbnails = await Promise.all(files.map(makeThumbnail))
    const newImages: LibraryImage[] = files.map((file, i) => ({
      id: `${collectionId}-${stamp}-${i}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      ...thumbnails[i],
      format: file.type.split('/')[1]?.toUpperCase() || file.name.split('.').pop()?.toUpperCase() || 'Unknown',
      width: thumbnails[i].width,
      height: thumbnails[i].height,
      fileSize: file.size,
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
      value={{
        collections,
        getCollection,
        addCollection,
        addImages,
        updateCollection,
        deleteCollection,
        updateImage,
      }}    
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