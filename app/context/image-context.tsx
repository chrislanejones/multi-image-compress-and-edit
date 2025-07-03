'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import type { ImageFile, EditorState, NavigationDirection } from '@/types'

interface ImageContextType {
  images: ImageFile[]
  selectedImage: ImageFile | null
  selectedImageId: string | null
  editorState: EditorState
  isEditMode: boolean
  currentPage: number
  totalPages: number
  addImages: (files: FileList) => void
  removeImage: (id: string) => void
  removeAllImages: () => void
  selectImage: (image: ImageFile) => void
  updateImageUrl: (id: string, newUrl: string) => void
  navigateImage: (direction: NavigationDirection) => void
  setCurrentPage: (page: number) => void
  setEditorState: (state: EditorState) => void
  setEditMode: (isEditMode: boolean) => void
}

const ImageContext = createContext<ImageContextType | null>(null)

export const useImageContext = () => {
  const context = useContext(ImageContext)
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider')
  }
  return context
}

const IMAGES_PER_PAGE = 10

// Utility function to create optimized image thumbnails
const createOptimizedThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Create a smaller thumbnail for better performance
      const maxSize = 300
      const ratio = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob))
            } else {
              resolve(URL.createObjectURL(file))
            }
          },
          'image/jpeg',
          0.8
        )
      } else {
        resolve(URL.createObjectURL(file))
      }
    }

    img.onerror = () => {
      resolve(URL.createObjectURL(file))
    }

    img.src = URL.createObjectURL(file)
  })
}

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [editorState, setEditorState] =
    useState<EditorState>('resizeAndOptimize')
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Use refs to track cleanup URLs to prevent memory leaks
  const urlsToCleanup = useRef<Set<string>>(new Set())

  // Memoize selected image to prevent unnecessary re-renders
  const selectedImage = useMemo(() => {
    return images.find((img) => img.id === selectedImageId) || null
  }, [images, selectedImageId])

  const totalPages = useMemo(() => {
    return Math.ceil(images.length / IMAGES_PER_PAGE)
  }, [images.length])

  const addImages = useCallback(
    async (files: FileList) => {
      const newImages: ImageFile[] = []

      // Process files in batches to prevent UI blocking
      const batchSize = 5
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = Array.from(files).slice(i, i + batchSize)

        const batchPromises = batch.map(async (file) => {
          if (file.type.startsWith('image/')) {
            try {
              // Create optimized thumbnail for better performance
              const optimizedUrl = await createOptimizedThumbnail(file)
              urlsToCleanup.current.add(optimizedUrl)

              return {
                id: crypto.randomUUID(),
                file,
                url: optimizedUrl,
              }
            } catch (error) {
              // Fallback to original file if optimization fails
              const fallbackUrl = URL.createObjectURL(file)
              urlsToCleanup.current.add(fallbackUrl)

              return {
                id: crypto.randomUUID(),
                file,
                url: fallbackUrl,
              }
            }
          }
          return null
        })

        const batchResults = await Promise.all(batchPromises)
        newImages.push(...(batchResults.filter(Boolean) as ImageFile[]))

        // Allow UI to update between batches
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      setImages((prev) => {
        const combined = [...prev, ...newImages]

        // Set first image as selected if none is currently selected
        if (!selectedImageId && newImages.length > 0) {
          setSelectedImageId(newImages[0].id)
          setCurrentPage(1)
        }

        return combined
      })
    },
    [selectedImageId]
  )

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const imageIndex = prev.findIndex((img) => img.id === id)
        if (imageIndex === -1) return prev

        const imageToRemove = prev[imageIndex]

        // Clean up URL
        if (urlsToCleanup.current.has(imageToRemove.url)) {
          URL.revokeObjectURL(imageToRemove.url)
          urlsToCleanup.current.delete(imageToRemove.url)
        }

        const updatedImages = prev.filter((image) => image.id !== id)

        // Update selected image if the removed one was selected
        if (selectedImageId === id && updatedImages.length > 0) {
          const nextIndex = Math.min(imageIndex, updatedImages.length - 1)
          const nextImage = updatedImages[nextIndex]
          setSelectedImageId(nextImage.id)

          const newPage = Math.floor(nextIndex / IMAGES_PER_PAGE) + 1
          setCurrentPage(newPage)
        } else if (updatedImages.length === 0) {
          setSelectedImageId(null)
        }

        return updatedImages
      })
    },
    [selectedImageId]
  )

  const removeAllImages = useCallback(() => {
    // Clean up all URLs
    urlsToCleanup.current.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    urlsToCleanup.current.clear()

    setImages([])
    setSelectedImageId(null)
    setCurrentPage(1)
    setEditorState('resizeAndOptimize')
    setIsEditMode(false)
  }, [])

  const selectImage = useCallback(
    (image: ImageFile) => {
      setSelectedImageId(image.id)

      // Update current page based on image position
      const imageIndex = images.findIndex((img) => img.id === image.id)
      if (imageIndex !== -1) {
        const newPage = Math.floor(imageIndex / IMAGES_PER_PAGE) + 1
        setCurrentPage(newPage)
      }
    },
    [images]
  )

  const updateImageUrl = useCallback((id: string, newUrl: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          // Clean up old URL if we're tracking it
          if (urlsToCleanup.current.has(img.url)) {
            URL.revokeObjectURL(img.url)
            urlsToCleanup.current.delete(img.url)
          }

          // Track new URL
          urlsToCleanup.current.add(newUrl)

          return { ...img, url: newUrl }
        }
        return img
      })
    )
  }, [])

  const navigateImage = useCallback(
    (direction: NavigationDirection) => {
      if (images.length === 0 || !selectedImageId) return

      const currentIndex = images.findIndex((img) => img.id === selectedImageId)
      if (currentIndex === -1) return

      let newIndex
      switch (direction) {
        case 'next':
          newIndex = (currentIndex + 1) % images.length
          break
        case 'prev':
          newIndex = (currentIndex - 1 + images.length) % images.length
          break
        case 'next10':
          newIndex = Math.min(currentIndex + 10, images.length - 1)
          break
        case 'prev10':
          newIndex = Math.max(currentIndex - 10, 0)
          break
        default:
          return
      }

      const newImage = images[newIndex]
      setSelectedImageId(newImage.id)

      const newPage = Math.floor(newIndex / IMAGES_PER_PAGE) + 1
      if (newPage !== currentPage) {
        setCurrentPage(newPage)
      }
    },
    [images, selectedImageId, currentPage]
  )

  const setEditModeHandler = useCallback((editMode: boolean) => {
    setIsEditMode(editMode)
    if (!editMode) {
      setEditorState('resizeAndOptimize')
    }
  }, [])

  // Cleanup URLs when component unmounts
  React.useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  const value: ImageContextType = useMemo(
    () => ({
      images,
      selectedImage,
      selectedImageId,
      editorState,
      isEditMode,
      currentPage,
      totalPages,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      updateImageUrl,
      navigateImage,
      setCurrentPage,
      setEditorState,
      setEditMode: setEditModeHandler,
    }),
    [
      images,
      selectedImage,
      selectedImageId,
      editorState,
      isEditMode,
      currentPage,
      totalPages,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      updateImageUrl,
      navigateImage,
      setEditModeHandler,
    ]
  )

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}
