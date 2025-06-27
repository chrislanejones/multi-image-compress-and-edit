import React from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import BulkImageEditor from '@/app/bulk-image-editor'
import { EditorState } from '@/types/types'

export function BulkTextComponent() {
  const search = useSearch({ from: '/bulk/text' })
  const navigate = useNavigate()
  const { images } = useImageContext()

  const handleStateChange = (state: EditorState) => {
    if (state === 'bulkImageEdit') {
      navigate({ to: '/bulk', search: { selected: search.selected } })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <BulkImageEditor
        editorState="bulkTextEditor"
        images={images}
        selectedImageId={search.selected || ''}
        onStateChange={handleStateChange}
        onSelectImage={() => {}}
        onNavigateImage={() => {}}
        onClose={() => navigate({ to: '/bulk' })}
        onRemoveAll={() => {}}
        onUploadNew={() => {}}
      />
    </div>
  )
}
