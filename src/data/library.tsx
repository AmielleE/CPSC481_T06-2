import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export type LibraryImage = {
  id: string
  title: string
  description: string
  src: string | null // null = grey placeholder tile
  thumbSrc: string | null // small copy used in grids
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

const THUMB_SIZE = 480

// Generate smaller thumbnails so large images don't slow down the UI.
async function makeThumbnail(file: File) {
  const fullSrc = URL.createObjectURL(file)

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap

    const scale = Math.min(
      1,
      THUMB_SIZE / Math.max(width, height)
    )

    const canvas = document.createElement('canvas')

    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)

    canvas
      .getContext('2d')!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85)
    )

    return {
      src: fullSrc,
      thumbSrc: blob ? URL.createObjectURL(blob) : fullSrc,
      aspectRatio: width / height,
      width,
      height,
    }
  } catch {
    // Unsupported image formats fall back to the original file.
    return {
      src: fullSrc,
      thumbSrc: fullSrc,
      aspectRatio: 1,
    }
  }
}

// ========================================
// SAMPLE PHOTOS
// ========================================

// Each sample photo has a pre-generated thumbnail.
const sampleUrls = import.meta.glob<string>(
  '../assets/images/*/*.jpg',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
)

const LANDSCAPE = 3 / 2
const PORTRAIT = 2 / 3

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

// Every fourth photo is available for sale.
// Borrowed photos use sell = false to avoid duplicate listings.
function makeSamples(
  collectionId: string,
  photos: SamplePhoto[],
  sell = true
): LibraryImage[] {
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

// ========================================
// INITIAL COLLECTIONS
// ========================================

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
    images: [],
  },
  {
    id: '5',
    name: 'Collection 5',
    info: '',
    isPrivate: true,
    images: makeSamples(
      '5',
      [
        COLLECTION_1[2],
        COLLECTION_2[0],
        COLLECTION_3[3],
        COLLECTION_1[7],
        COLLECTION_2[4],
      ],
      false
    ),
  },
]

// ========================================
// LIBRARY CONTEXT
// ========================================

type LibraryContextValue = {
  collections: Collection[]

  getCollection: (id: string) => Collection | undefined

  addCollection: (
    name: string,
    isPrivate: boolean
  ) => Collection

  addImages: (
    collectionId: string,
    files: File[]
  ) => Promise<void>

  updateCollection: (
    collectionId: string,
    changes: Partial<Omit<Collection, 'id'>>
  ) => void

  deleteCollection: (collectionId: string) => void

  updateImage: (
    collectionId: string,
    imageId: string,
    changes: Partial<Omit<LibraryImage, 'id'>>
  ) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

// ========================================
// LIBRARY PROVIDER
// ========================================

export function LibraryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections)

  // ========================================
  // GET COLLECTION
  // ========================================

  const getCollection = useCallback(
    (id: string) => {
      return collections.find((c) => c.id === id)
    },
    [collections]
  )

  // ========================================
  // ADD COLLECTION
  // ========================================

  const addCollection = useCallback(
    (name: string, isPrivate: boolean): Collection => {
      const newCollection: Collection = {
        id: crypto.randomUUID(),
        name,
        info: '',
        isPrivate,
        images: [],
      }

      setCollections((prev) => [
        ...prev,
        newCollection,
      ])

      // Return the new collection so the page can
      // navigate directly to its upload screen.
      return newCollection
    },
    []
  )

  // ========================================
  // ADD IMAGES
  // ========================================

  const addImages = useCallback(
    async (collectionId: string, files: File[]) => {
      const stamp = Date.now()

      const thumbnails = await Promise.all(
        files.map(makeThumbnail)
      )

      const newImages: LibraryImage[] = files.map(
        (file, i) => ({
          id: `${collectionId}-${stamp}-${i}`,
          title: file.name.replace(/\.[^.]+$/, ''),
          description: '',

          ...thumbnails[i],

          format:
            file.type.split('/')[1]?.toUpperCase() ||
            file.name.split('.').pop()?.toUpperCase() ||
            'Unknown',

          width: thumbnails[i].width,
          height: thumbnails[i].height,
          fileSize: file.size,

          forSale: false,
          price: null,
        })
      )

      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                images: [
                  ...c.images,
                  ...newImages,
                ],
              }
            : c
        )
      )
    },
    []
  )

  // ========================================
  // UPDATE COLLECTION
  // ========================================

  const updateCollection = useCallback(
    (
      collectionId: string,
      changes: Partial<Omit<Collection, 'id'>>
    ) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? { ...c, ...changes }
            : c
        )
      )
    },
    []
  )

  // ========================================
  // DELETE COLLECTION
  // ========================================

  const deleteCollection = useCallback(
    (collectionId: string) => {
      setCollections((prev) =>
        prev.filter((c) => c.id !== collectionId)
      )
    },
    []
  )

  // ========================================
  // UPDATE IMAGE
  // ========================================

  const updateImage = useCallback(
    (
      collectionId: string,
      imageId: string,
      changes: Partial<Omit<LibraryImage, 'id'>>
    ) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id !== collectionId
            ? c
            : {
                ...c,
                images: c.images.map((img) =>
                  img.id === imageId
                    ? { ...img, ...changes }
                    : img
                ),
              }
        )
      )
    },
    []
  )

  // ========================================
  // PROVIDER
  // ========================================

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

// ========================================
// USE LIBRARY HOOK
// ========================================

export function useLibrary() {
  const ctx = useContext(LibraryContext)

  if (!ctx) {
    throw new Error(
      'useLibrary must be used inside <LibraryProvider>'
    )
  }

  return ctx
}