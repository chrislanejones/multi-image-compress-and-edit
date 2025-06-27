import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import BlurBrushCanvas from '@/app/components/blur-tool'

export function BlurComponent() {
  const { imageId } = useParams({ from: '/edit/$imageId/blur' })
  const navigate = useNavigate()
  const { images, selectImage } = useImageContext()

  const selectedImage = images.find(img => img.id === imageId)

  if (!selectedImage) {
    navigate({ to: '/edit/$imageId', params: { imageId } })
    return null
  }

  const handleApply = (blurredImageUrl: string) => {
    const updatedImage = { ...selectedImage, url: blurredImageUrl }
    selectImage(updatedImage)
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  const handleCancel = () => {
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <BlurBrushCanvas
        imageUrl={selectedImage.url}
        blurAmount={5}
        blurRadius={10}
        onApply={handleApply}
        onCancel={handleCancel}
        onBlurAmountChange={() => {}}
        onBlurRadiusChange={() => {}}
      />
    </div>
  )
}
