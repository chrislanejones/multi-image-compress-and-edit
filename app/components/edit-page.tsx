import { useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import { ImageEditor } from './editor/image-editor'

export default function EditPageComponent() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const imageId = params.imageId

  const {
    images,
    selectedImage,
    selectedImageId,
    selectImage,
    updateImageUrl,
    removeAllImages,
    setEditMode,
  } = useImageContext()

  useEffect(() => {
    if (!imageId) {
      navigate({ to: '/gallery' })
      return
    }

    if (images.length === 0) {
      navigate({ to: '/' })
      return
    }

    const image = images.find((img: any) => img.id === imageId)
    if (!image) {
      navigate({ to: '/gallery' })
      return
    }

    if (selectedImageId !== imageId) {
      selectImage(image)
    }
  }, [imageId, images, selectedImageId, selectImage, navigate])

  const handleImageChange = (newImageUrl: string) => {
    if (selectedImage) {
      updateImageUrl(selectedImage.id, newImageUrl)
    }
  }

  const handleDownload = () => {
    if (selectedImage) {
      const a = document.createElement('a')
      a.href = selectedImage.url
      a.download = selectedImage.file.name || 'image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleClose = () => {
    setEditMode(false)
    navigate({ to: '/gallery' })
  }

  if (!selectedImage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Loading image...</p>
        </div>
      </div>
    )
  }

  return (
    <ImageEditor
      imageUrl={selectedImage.url}
      onImageChange={handleImageChange}
      onDownload={handleDownload}
      onClose={handleClose}
      fileName={selectedImage.file.name}
      fileType={selectedImage.file.type}
      fileSize={selectedImage.file.size}
      allImages={images}
      currentImageId={selectedImage.id}
      onSelectImage={(img: any) => {
        if (img.id !== selectedImageId) {
          navigate({ 
            to: '/edit/$imageId', 
            params: { imageId: img.id },
            search: { state: 'editImage' }
          })
        }
      }}
      onNavigateImage={() => {}}
      onRemoveAll={removeAllImages}
      onUploadNew={() => navigate({ to: '/' })}
      onEditModeChange={(isEditMode: boolean) => setEditMode(isEditMode)}
      currentToolState={'editImage'}
      onToolChange={() => {}}
    />
  )
}
