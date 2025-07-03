'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../../context/ImageContext'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  X,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Droplets,
  Paintbrush,
  Type,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react'
import type { EditorState, ImageDataItem } from '../../types'

interface ImageEditorProps {
  imageUrl?: string
  onImageChange?: (url: string) => void
  onDownload?: () => void
  onClose?: () => void
  fileName?: string
  fileType?: string
  fileSize?: number
  allImages?: ImageDataItem[]
  currentImageId?: string
  onSelectImage?: (img: ImageDataItem) => void
  onNavigateImage?: (direction: string) => void
  onRemoveAll?: () => void
  onUploadNew?: () => void
  onEditModeChange?: (isEditMode: boolean) => void
  currentToolState?: EditorState
  onToolChange?: (tool: EditorState) => void
}

export function ImageEditor(props: ImageEditorProps) {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const {
    images,
    selectedImage,
    selectedImageId,
    selectImage,
    updateImageUrl,
    removeAllImages,
    setEditMode,
  } = useImageContext()

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentTool, setCurrentTool] = useState<EditorState>('editImage')

  const imageRef = useRef<HTMLImageElement>(null)
  const imageId = params.imageId || props.currentImageId

  useEffect(() => {
    if (imageId && images.length > 0) {
      const image = images.find((img: any) => img.id === imageId)
      if (image && selectedImageId !== imageId) {
        selectImage(image)
      }
    }
  }, [imageId, images, selectedImageId, selectImage])

  const handleToolChange = (tool: EditorState) => {
    setCurrentTool(tool)
    if (props.onToolChange) {
      props.onToolChange(tool)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1))
  }

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90)
  }

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90)
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
    if (props.onDownload) {
      props.onDownload()
    }
  }

  const handleClose = () => {
    setEditMode(false)
    navigate({ to: '/gallery' })
    if (props.onClose) {
      props.onClose()
    }
  }

  const currentImage =
    selectedImage ||
    (props.imageUrl
      ? { url: props.imageUrl, file: { name: props.fileName || 'image' } }
      : null)

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg mb-4">Loading image...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Image Editor</h1>
            <span className="text-sm text-gray-400">
              {currentImage.file.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleClose} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Transform</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom In
                </Button>
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ZoomOut className="h-4 w-4 mr-1" />
                  Zoom Out
                </Button>
                <Button
                  onClick={handleRotateLeft}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Rotate L
                </Button>
                <Button
                  onClick={handleRotateRight}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rotate R
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Tools</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleToolChange('crop')}
                  variant={currentTool === 'crop' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Crop
                </Button>
                <Button
                  onClick={() => handleToolChange('blur')}
                  variant={currentTool === 'blur' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Droplets className="h-4 w-4 mr-2" />
                  Blur
                </Button>
                <Button
                  onClick={() => handleToolChange('paint')}
                  variant={currentTool === 'paint' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Paintbrush className="h-4 w-4 mr-2" />
                  Paint
                </Button>
                <Button
                  onClick={() => handleToolChange('text')}
                  variant={currentTool === 'text' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Properties</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Zoom: {Math.round(zoom * 100)}%</div>
                <div>Rotation: {rotation}°</div>
                <div>Tool: {currentTool}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Image Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
          <div className="relative max-w-full max-h-full">
            <img
              ref={imageRef}
              src={currentImage.url}
              alt={currentImage.file.name}
              className="max-w-full max-h-full object-contain border border-gray-600 rounded"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out',
              }}
            />

            {/* Tool overlays would go here */}
            {currentTool !== 'editImage' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}{' '}
                  Tool Active
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Image List */}
        {images.length > 1 && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-sm font-medium mb-3">
              Images ({images.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {images.map((image: any) => (
                <Card
                  key={image.id}
                  className={`p-2 cursor-pointer transition-colors ${
                    selectedImageId === image.id
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    selectImage(image)
                    navigate({
                      to: '/edit/$imageId',
                      params: { imageId: image.id },
                      search: { state: 'editImage' },
                    })
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.round(image.file.size / 1024)}KB
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Default export for compatibility
export default ImageEditor
