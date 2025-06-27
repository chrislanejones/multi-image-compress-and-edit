import React from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import BulkImageEditor from '@/app/bulk-image-editor'
import { EditorState } from '@/types/types'

export function BulkEditComponent() {
  const search = useSearch({ from: '/bulk' })
  const navigate = useNavigate()
  const { images } = useImageContext()

  const handleStateChange = (state: EditorState) => {
    if (state === 'bulkCrop') {
      navigate({ to: '/bulk/crop', search: { selected: search.selected } })
    } else if (state === 'bulkTextEditor') {
      navigate({ to: '/bulk/text', search: { selected: search.selected } })
    } else if (state === 'resizeAndOptimize') {
      navigate({ to: '/gallery', search: { selected: search.selected } })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <BulkImageEditor
        editorState="bulkImageEdit"
        images={images}
        selectedImageId={search.selected || ''}
        onStateChange={handleStateChange}
        onSelectImage={(imageId) => {
          navigate({
            to: '/bulk',
            search: { selected: imageId }
          })
        }}
        onNavigateImage={() => {}}
        onClose={() => navigate({ to: '/gallery' })}
        onRemoveAll={() => {}}
        onUploadNew={() => {}}
      />
    </div>
  )
}
