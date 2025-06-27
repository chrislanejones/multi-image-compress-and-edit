import React from 'react'
import { useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import ImageEditor from '@/app/image-editor'

export function EditComponent() {
  const { imageId } = useParams({ from: '/edit/$imageId' })
  const search = useSearch({ from: '/edit/$imageId' })
  const navigate = useNavigate()
  const { images, selectImage } = useImageContext()

  const selectedImage = images.find(img => img.id === imageId)

  React.useEffect(() => {
    if (selectedImage) {
      selectImage(selectedImage)
    }
  }, [selectedImage, selectImage])

  if (!selectedImage) {
    navigate({ to: '/gallery' })
    return null
  }

  const handleImageChange = (newImageUrl: string) => {
    const updatedImage = { ...selectedImage, url: newImageUrl }
    selectImage(updatedImage)
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <ImageEditor
        imageUrl={selectedImage.url}
        onImageChange={handleImageChange}
        onClose={() => navigate({ 
          to: '/gallery',
          search: { selected: imageId }
        })}
        fileName={selectedImage.file.name}
        fileType={selectedImage.file.type}
        fileSize={selectedImage.file.size}
        allImages={images}
        currentImageId={selectedImage.id}
        onSelectImage={(image) => {
          selectImage(image)
          navigate({
            to: '/edit/$imageId',
            params: { imageId: image.id },
            search: { mode: search.mode }
          })
        }}
      />
    </div>
  )
}
