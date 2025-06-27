import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import CroppingTool from '@/app/components/cropping-tool'

export function CropComponent() {
  const { imageId } = useParams({ from: '/edit/$imageId/crop' })
  const navigate = useNavigate()
  const { images, selectImage } = useImageContext()

  const selectedImage = images.find(img => img.id === imageId)

  if (!selectedImage) {
    navigate({ to: '/edit/$imageId', params: { imageId } })
    return null
  }

  const handleApply = (croppedImageUrl: string) => {
    const updatedImage = { ...selectedImage, url: croppedImageUrl }
    selectImage(updatedImage)
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  const handleCancel = () => {
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <CroppingTool
        imageUrl={selectedImage.url}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  )
}
