import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import PaintTool from '@/app/components/paint-tool'

export function PaintComponent() {
  const { imageId } = useParams({ from: '/edit/$imageId/paint' })
  const navigate = useNavigate()
  const { images, selectImage } = useImageContext()

  const selectedImage = images.find(img => img.id === imageId)

  if (!selectedImage) {
    navigate({ to: '/edit/$imageId', params: { imageId } })
    return null
  }

  const handleApply = (paintedImageUrl: string) => {
    const updatedImage = { ...selectedImage, url: paintedImageUrl }
    selectImage(updatedImage)
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  const handleCancel = () => {
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <PaintTool
        imageUrl={selectedImage.url}
        onApplyPaint={handleApply}
        onCancel={handleCancel}
        isEraser={false}
      />
    </div>
  )
}
