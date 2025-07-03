import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { globalImages } from './photo-upload'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import {
  X,
  Upload,
  ArrowLeft,
  Minus,
  Plus,
  Download,
  Settings,
  Trash2,
  Image as ImageIcon,
  Zap,
  FileDown,
} from 'lucide-react'

// Import your existing utils
import { formatBytes, safeRevokeURL, downloadImagesAsZip } from '../utils/image-utils'
import { compressImageAggressively } from '../utils/image-processing'

// Ultra-fast thumbnail component with zero re-renders
const SuperFastThumbnail = React.memo(({ 
  image, 
  isSelected, 
  onClick, 
  onRemove 
}: {
  image: any
  isSelected: boolean
  onClick: () => void
  onRemove: (e: React.MouseEvent) => void
}) => (
  <div
    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${
      isSelected
        ? 'border-primary ring-2 ring-primary/50'
        : 'border-border hover:border-primary/50'
    }`}
    onClick={onClick}
  >
    <img
      src={image.thumbnail} // Always use the fast thumbnail
      alt={image.file.name}
      className="w-full h-full object-cover"
      loading="lazy"
      decoding="async" // Performance optimization
    />
    {/* Compression indicator */}
    {image.compressed && (
      <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 text-xs rounded">
        <Zap className="w-3 h-3 inline" />
      </div>
    )}
    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="destructive"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
    {/* Size reduction indicator */}
    {image.compressed && (
      <div className="absolute bottom-1 left-1 bg-black/75 text-white px-1 py-0.5 text-xs rounded">
        -{Math.round(((image.originalSize - image.compressedSize) / image.originalSize) * 100)}%
      </div>
    )}
  </div>
))

export default function ResizeAndOptimize() {
  const navigate = useNavigate()
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isDownloading, setIsDownloading] = useState(false)

  const imagesPerPage = 12 // Show more images per page

  // Memoized data - prevents expensive recalculations
  const pageData = useMemo(() => {
    const totalPages = Math.ceil(globalImages.length / imagesPerPage)
    const currentImages = globalImages.slice(
      currentPage * imagesPerPage,
      (currentPage + 1) * imagesPerPage
    )
    const selectedImage = globalImages.find(img => img.id === selectedImageId)
    
    // Calculate total savings
    const totalOriginalSize = globalImages.reduce((sum, img) => sum + img.originalSize, 0)
    const totalCompressedSize = globalImages.reduce((sum, img) => sum + (img.compressedSize || img.originalSize), 0)
    const totalSavings = totalOriginalSize - totalCompressedSize
    const savingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0
    
    return { 
      totalPages, 
      currentImages, 
      selectedImage, 
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      savingsPercent
    }
  }, [globalImages.length, currentPage, selectedImageId])

  // Set initial selection
  useEffect(() => {
    if (globalImages.length > 0 && !selectedImageId) {
      setSelectedImageId(globalImages[0].id)
    }
  }, [selectedImageId])

  const handleSelectImage = useCallback((image: any) => {
    setSelectedImageId(image.id)
  }, [])

  const handleRemoveImage = useCallback((imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const index = globalImages.findIndex(img => img.id === imageId)
    if (index === -1) return

    // Clean up URLs using your util
    const imageToRemove = globalImages[index]
    safeRevokeURL(imageToRemove.url)
    safeRevokeURL(imageToRemove.thumbnail)
    if (imageToRemove.compressed) safeRevokeURL(imageToRemove.compressed)

    // Remove from global array
    globalImages.splice(index, 1)

    // Update selection
    if (selectedImageId === imageId) {
      if (globalImages.length > 0) {
        const newIndex = Math.min(index, globalImages.length - 1)
        setSelectedImageId(globalImages[newIndex]?.id || null)
      } else {
        setSelectedImageId(null)
      }
    }

    // Force re-render
    setCurrentPage(prev => prev)
  }, [selectedImageId])

  const handleRemoveAll = useCallback(() => {
    // Clean up all URLs using your util
    globalImages.forEach(img => {
      safeRevokeURL(img.url)
      safeRevokeURL(img.thumbnail)
      if (img.compressed) safeRevokeURL(img.compressed)
    })
    
    globalImages.length = 0
    setSelectedImageId(null)
    setCurrentPage(0)
  }, [])

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (globalImages.length === 0 || !selectedImageId) return
    
    const currentIndex = globalImages.findIndex(img => img.id === selectedImageId)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : globalImages.length - 1
    } else {
      newIndex = currentIndex < globalImages.length - 1 ? currentIndex + 1 : 0
    }
    
    setSelectedImageId(globalImages[newIndex].id)
  }, [selectedImageId])

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(400, prev + 25)
      } else {
        return Math.max(25, prev - 25)
      }
    })
  }, [])

  if (globalImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-20">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No images uploaded yet.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>
    )
  }

  const { totalPages, currentImages, selectedImage, totalOriginalSize, totalSavings, savingsPercent } = pageData

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Stats Header */}
      <div className="mb-4 p-4 bg-card border rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{globalImages.length}</span> images
            </div>
            <div className="text-sm">
              Original: <span className="font-medium">{formatBytes(totalOriginalSize)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="text-sm text-green-600">
                Saved: <span className="font-medium">{formatBytes(totalSavings)}</span> ({savingsPercent.toFixed(1)}%)
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate({ to: '/' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Upload More
            </Button>
            <Button variant="destructive" onClick={handleRemoveAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove All
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-4">
          {currentImages.map((image) => (
            <SuperFastThumbnail
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onClick={() => handleSelectImage(image)}
              onRemove={(e) => handleRemoveImage(image.id, e)}
            />
          ))}
        </div>

        {/* Menu Bar */}
        <div className="flex items-center justify-between bg-card border rounded-lg p-2 gap-2">
          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handleNavigation('prev')}>
              ‹ Prev
            </Button>
            <span className="text-sm px-2">
              {selectedImage ? `${globalImages.findIndex(img => img.id === selectedImageId) + 1} of ${globalImages.length}` : ''}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleNavigation('next')}>
              Next ›
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      {selectedImage && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-center bg-muted rounded-lg"
              style={{ minHeight: '400px' }}
            >
              <img
                src={selectedImage.compressed || selectedImage.url}
                alt={selectedImage.file.name}
                className="max-w-full max-h-full object-contain rounded"
                style={{ transform: `scale(${zoom / 100})` }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Info */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Image Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Filename:</span>
                <p className="font-mono text-xs">{selectedImage.file.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Dimensions:</span>
                <p>{selectedImage.width} × {selectedImage.height}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Original Size:</span>
                <p>{formatBytes(selectedImage.originalSize)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Compressed:</span>
                <p>{formatBytes(selectedImage.compressedSize || selectedImage.originalSize)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Savings:</span>
                <p className="text-green-600">
                  {selectedImage.compressedSize 
                    ? `${Math.round(((selectedImage.originalSize - selectedImage.compressedSize) / selectedImage.originalSize) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Format:</span>
                <p>{selectedImage.file.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
