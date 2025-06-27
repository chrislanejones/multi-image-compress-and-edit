import React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import ImageEditor from '@/app/image-editor'
import { NavigationDirection } from '@/types/types'
import Image from 'next/image'
import { X } from 'lucide-react'

export function GalleryComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/gallery' })
  const { images, selectedImage, selectImage, removeImage, removeAllImages } = useImageContext()

  const selectedImageFromUrl = images.find(img => img.id === search.selected)
  const currentSelectedImage = selectedImageFromUrl || selectedImage

  React.useEffect(() => {
    if (selectedImageFromUrl && selectedImageFromUrl !== selectedImage) {
      selectImage(selectedImageFromUrl)
    }
  }, [selectedImageFromUrl, selectedImage, selectImage])

  const handleImageChange = (newImageUrl: string) => {
    if (!currentSelectedImage) return
    
    const updatedImage = { ...currentSelectedImage, url: newImageUrl }
    selectImage(updatedImage)
  }

  const handleNavigateImage = (direction: NavigationDirection) => {
    if (!currentSelectedImage) return

    const currentIndex = images.findIndex(img => img.id === currentSelectedImage.id)
    if (currentIndex === -1) return

    let newIndex: number
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

    const newSelectedImage = images[newIndex]
    selectImage(newSelectedImage)
    
    navigate({
      to: '/gallery',
      search: { selected: newSelectedImage.id, page: search.page }
    })
  }

  const handleSelectImage = (image: ImageFile) => {
    selectImage(image)
    navigate({
      to: '/gallery', 
      search: { selected: image.id, page: search.page }
    })
  }

  if (!currentSelectedImage) {
    navigate({ to: '/' })
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Image thumbnails grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg mb-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative group aspect-square animate-fade-scale-in cursor-pointer ${
              currentSelectedImage?.id === image.id ? "ring-2 ring-blue-500" : ""
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => handleSelectImage(image)}
          >
            <Image
              src={image.url}
              alt="Uploaded image"
              fill
              className="object-cover rounded-md"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeImage(image.id)
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <ImageEditor
        imageUrl={currentSelectedImage.url}
        onImageChange={handleImageChange}
        onDownload={() => {
          const a = document.createElement('a')
          a.href = currentSelectedImage.url
          a.download = currentSelectedImage.file.name || 'image.png'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }}
        onClose={() => navigate({ to: '/' })}
        fileName={currentSelectedImage.file.name}
        fileType={currentSelectedImage.file.type}
        fileSize={currentSelectedImage.file.size}
        currentPage={search.page}
        totalPages={Math.ceil(images.length / 10)}
        onNavigateImage={handleNavigateImage}
        onRemoveAll={removeAllImages}
        onUploadNew={() => navigate({ to: '/' })}
        allImages={images}
        currentImageId={currentSelectedImage.id}
        onSelectImage={handleSelectImage}
      />
    </div>
  )
}
