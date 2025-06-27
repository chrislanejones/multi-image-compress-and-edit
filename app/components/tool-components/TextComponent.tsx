import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import TextTool from '@/app/components/text-tool'

export function TextComponent() {
  const { imageId } = useParams({ from: '/edit/$imageId/text' })
  const navigate = useNavigate()
  const { images, selectImage } = useImageContext()

  const selectedImage = images.find(img => img.id === imageId)

  if (!selectedImage) {
    navigate({ to: '/edit/$imageId', params: { imageId } })
    return null
  }

  const handleApply = (textedImageUrl: string) => {
    const updatedImage = { ...selectedImage, url: textedImageUrl }
    selectImage(updatedImage)
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  const handleCancel = () => {
    navigate({ to: '/edit/$imageId', params: { imageId } })
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <TextTool
        imageUrl={selectedImage.url}
        onApplyText={handleApply}
        onCancel={handleCancel}
        setEditorState={() => {}}
        setBold={() => {}}
        setItalic={() => {}}
      />
    </div>
  )
}
