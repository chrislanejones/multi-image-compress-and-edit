import { useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import {
  X,
  Upload,
  ArrowLeft,
  Minus,
  Plus,
  Edit,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Sun,
  Moon,
  Monitor,
  User,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Settings,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Slider } from './ui/slider'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type {
  ImageFile,
  OptimizedImageProps,
  ResizeSettings,
  GalleryData,
} from '../types'

// Optimized Image Component with lazy loading and thumbnail generation
const OptimizedImage = ({
  image,
  isSelected,
  onClick,
  onRemove,
}: OptimizedImageProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Generate thumbnail only when needed
  useEffect(() => {
    let isCancelled = false

    const generateThumbnail = async () => {
      try {
        const img = new Image()
        img.onload = () => {
          if (isCancelled) return

          const canvas = canvasRef.current || document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) return

          // Small thumbnail size for performance
          const maxSize = 150
          const ratio = Math.min(maxSize / img.width, maxSize / img.height)
          canvas.width = img.width * ratio
          canvas.height = img.height * ratio

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(
            (blob) => {
              if (isCancelled || !blob) return
              const url = URL.createObjectURL(blob)
              setThumbnailUrl(url)
              setIsLoaded(true)
            },
            'image/jpeg',
            0.7
          )
        }

        img.onerror = () => {
          if (!isCancelled) {
            setThumbnailUrl(image.url) // Fallback to original
            setIsLoaded(true)
          }
        }

        img.src = image.url
      } catch (error) {
        if (!isCancelled) {
          setThumbnailUrl(image.url) // Fallback to original
          setIsLoaded(true)
        }
      }
    }

    generateThumbnail()

    return () => {
      isCancelled = true
      if (thumbnailUrl && thumbnailUrl !== image.url) {
        URL.revokeObjectURL(thumbnailUrl)
      }
    }
  }, [image.url])

  return (
    <div
      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${
        isSelected
          ? 'border-primary ring-2 ring-primary/50'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      {isLoaded ? (
        <img
          src={thumbnailUrl || image.url}
          alt={image.file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(image.id, e)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default function GalleryComponent() {
  const navigate = useNavigate()
  const {
    images,
    selectedImage,
    currentPage,
    totalPages,
    removeImage,
    removeAllImages,
    selectImage,
    setCurrentPage,
  } = useImageContext()

  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    () => images[0]?.id || null
  )
  const [currentGalleryPage, setCurrentGalleryPage] = useState(0)
  const [theme, setTheme] = useState('system')
  const [zoom, setZoom] = useState(100)

  // Resize & Optimize settings - memoized to prevent re-renders
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    width: 400,
    height: 300,
    quality: 85,
    format: 'jpeg',
  })

  const imagesPerPage = 10

  // Memoized calculations to prevent expensive re-computations
  const galleryData = useMemo((): GalleryData => {
    const totalGalleryPages = Math.ceil(images.length / imagesPerPage)
    const currentImages = images.slice(
      currentGalleryPage * imagesPerPage,
      (currentGalleryPage + 1) * imagesPerPage
    )
    const currentSelectedImage =
      images.find((img) => img.id === selectedImageId) || null

    return {
      totalGalleryPages,
      currentImages,
      currentSelectedImage,
    }
  }, [images, currentGalleryPage, selectedImageId, imagesPerPage])

  // Memoized handlers to prevent re-renders
  const handleSelectImage = useCallback(
    (image: ImageFile) => {
      setSelectedImageId(image.id)
      selectImage(image)
    },
    [selectImage]
  )

  const handleRemoveImage = useCallback(
    (imageId: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      removeImage(imageId)
      // Update selected image if the removed one was selected
      if (selectedImageId === imageId && images.length > 1) {
        const remainingImages = images.filter((img) => img.id !== imageId)
        if (remainingImages.length > 0) {
          setSelectedImageId(remainingImages[0].id)
        }
      }
    },
    [removeImage, selectedImageId, images]
  )

  const handleNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedImageId || images.length === 0) return

      const currentIndex = images.findIndex((img) => img.id === selectedImageId)
      let newIndex

      switch (direction) {
        case 'prev':
          newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
          break
        case 'next':
          newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
          break
        default:
          return
      }

      setSelectedImageId(images[newIndex].id)
    },
    [selectedImageId, images]
  )

  const handlePageNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      const { totalGalleryPages } = galleryData

      if (direction === 'prev' && currentGalleryPage > 0) {
        const newPage = currentGalleryPage - 1
        setCurrentGalleryPage(newPage)
        const newPageImages = images.slice(
          newPage * imagesPerPage,
          (newPage + 1) * imagesPerPage
        )
        if (newPageImages.length > 0) {
          setSelectedImageId(newPageImages[0].id)
        }
      } else if (
        direction === 'next' &&
        currentGalleryPage < totalGalleryPages - 1
      ) {
        const newPage = currentGalleryPage + 1
        setCurrentGalleryPage(newPage)
        const newPageImages = images.slice(
          newPage * imagesPerPage,
          (newPage + 1) * imagesPerPage
        )
        if (newPageImages.length > 0) {
          setSelectedImageId(newPageImages[0].id)
        }
      }
    },
    [currentGalleryPage, galleryData.totalGalleryPages, images, imagesPerPage]
  )

  const handleZoomChange = useCallback((direction: 'in' | 'out') => {
    setZoom((prev) => {
      if (direction === 'in') {
        return Math.min(400, prev + 25)
      } else {
        return Math.max(25, prev - 25)
      }
    })
  }, [])

  const handleResizeSettingChange = useCallback(
    (key: keyof typeof resizeSettings, value: any) => {
      setResizeSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Set initial selected image when images load
  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id)
    }
  }, [images, selectedImageId])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">No images uploaded yet.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>
    )
  }

  const { totalGalleryPages, currentImages, currentSelectedImage } = galleryData

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Gallery Grid - Top Section */}
      <div className="mb-6">
        <div className="grid grid-cols-10 gap-2 mb-4">
          {currentImages.map((image) => (
            <OptimizedImage
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onClick={() => handleSelectImage(image)}
              onRemove={handleRemoveImage}
            />
          ))}
        </div>

        {/* Menu Bar */}
        <div className="flex items-center justify-between bg-card border rounded-lg p-2 gap-2">
          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoomChange('out')}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoomChange('in')}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Editor Mode Buttons */}
            <Button variant="outline" size="sm" disabled>
              <Edit className="h-4 w-4 mr-1" />
              Edit Image
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Layers className="h-4 w-4 mr-1" />
              Bulk Edit
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Editor
            </Button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageNavigation('prev')}
              disabled={currentGalleryPage === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">Switch Photos</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageNavigation('next')}
              disabled={currentGalleryPage === totalGalleryPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Upload
            </Button>
            <Button variant="destructive" size="sm" onClick={removeAllImages}>
              <Trash2 className="h-4 w-4 mr-1" />
              Remove All
            </Button>

            {/* Theme Toggle */}
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-12 h-8">
                <SelectValue>
                  {theme === 'light' && <Sun className="h-4 w-4" />}
                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                  {theme === 'system' && <Monitor className="h-4 w-4" />}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" disabled>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-4 gap-6">
        {/* Selected Image Display */}
        <div className="col-span-3">
          {currentSelectedImage && (
            <Card>
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-center bg-muted rounded-lg"
                  style={{ minHeight: '400px' }}
                >
                  <img
                    src={currentSelectedImage.url}
                    alt={currentSelectedImage.file.name}
                    className="max-w-full max-h-full object-contain rounded"
                    style={{ transform: `scale(${zoom / 100})` }}
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resize & Optimize Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Resize & Optimize
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dimensions */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Width
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.width}
                      onChange={(e) =>
                        handleResizeSettingChange(
                          'width',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Height
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.height}
                      onChange={(e) =>
                        handleResizeSettingChange(
                          'height',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select
                  value={resizeSettings.format}
                  onValueChange={(value) =>
                    handleResizeSettingChange('format', value)
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quality: {resizeSettings.quality}%
                </label>
                <Slider
                  value={[resizeSettings.quality]}
                  onValueChange={(value) =>
                    handleResizeSettingChange('quality', value[0])
                  }
                  max={100}
                  min={1}
                  step={1}
                  disabled
                />
              </div>

              {/* Transform Controls */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Transform
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <Button variant="outline" size="sm" disabled>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <FlipVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button className="w-full" disabled>
                  <Crop className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Image Info Card */}
      {currentSelectedImage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Original Image Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Filename:
                </span>
                <p className="font-mono">{currentSelectedImage.file.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Dimensions:
                </span>
                <p>
                  {currentSelectedImage.width || 'Unknown'} ×{' '}
                  {currentSelectedImage.height || 'Unknown'} px
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  File Size:
                </span>
                <p>{formatFileSize(currentSelectedImage.file.size)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Format:
                </span>
                <p>{currentSelectedImage.file.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
