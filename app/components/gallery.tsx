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
import { useState, useEffect } from 'react'

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

  const [selectedImageId, setSelectedImageId] = useState(images[0]?.id || null)
  const [currentGalleryPage, setCurrentGalleryPage] = useState(0)
  const [theme, setTheme] = useState('system')
  const [zoom, setZoom] = useState(100)

  // Resize & Optimize settings
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(300)
  const [quality, setQuality] = useState(85)
  const [format, setFormat] = useState('jpeg')

  const imagesPerPage = 10
  const totalGalleryPages = Math.ceil(images.length / imagesPerPage)
  const currentImages = images.slice(
    currentGalleryPage * imagesPerPage,
    (currentGalleryPage + 1) * imagesPerPage
  )
  const currentSelectedImage = images.find((img) => img.id === selectedImageId)

  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id)
    }
  }, [images, selectedImageId])

  const handleBackToUpload = () => {
    navigate({ to: '/' })
  }

  const handleSelectImage = (image: any) => {
    setSelectedImageId(image.id)
    selectImage(image)
  }

  const handleRemoveImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeImage(imageId)
    // Update selected image if the removed one was selected
    if (selectedImageId === imageId && images.length > 1) {
      const remainingImages = images.filter((img) => img.id !== imageId)
      if (remainingImages.length > 0) {
        setSelectedImageId(remainingImages[0].id)
      }
    }
  }

  const handlePrevImage = () => {
    if (!selectedImageId) return
    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    setSelectedImageId(images[prevIndex].id)
  }

  const handleNextImage = () => {
    if (!selectedImageId) return
    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    setSelectedImageId(images[nextIndex].id)
  }

  const handlePrevPage = () => {
    if (currentGalleryPage > 0) {
      setCurrentGalleryPage(currentGalleryPage - 1)
      const newPageImages = images.slice(
        (currentGalleryPage - 1) * imagesPerPage,
        currentGalleryPage * imagesPerPage
      )
      if (newPageImages.length > 0) {
        setSelectedImageId(newPageImages[0].id)
      }
    }
  }

  const handleNextPage = () => {
    if (currentGalleryPage < totalGalleryPages - 1) {
      setCurrentGalleryPage(currentGalleryPage + 1)
      const newPageImages = images.slice(
        (currentGalleryPage + 1) * imagesPerPage,
        (currentGalleryPage + 2) * imagesPerPage
      )
      if (newPageImages.length > 0) {
        setSelectedImageId(newPageImages[0].id)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">No images uploaded yet.</p>
          <Button onClick={handleBackToUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Gallery Grid - Top Section */}
      <div className="mb-6">
        <div className="grid grid-cols-10 gap-2 mb-4">
          {currentImages.map((image) => (
            <div
              key={image.id}
              className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${
                selectedImageId === image.id
                  ? 'border-primary ring-2 ring-primary/50'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleSelectImage(image)}
            >
              <img
                src={image.url}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleRemoveImage(image.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Bar */}
        <div className="flex items-center justify-between bg-card border rounded-lg p-2 gap-2">
          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(400, zoom + 25))}
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
              onClick={handlePrevPage}
              disabled={currentGalleryPage === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrevImage}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">Switch Photos</span>
            <Button variant="outline" size="sm" onClick={handleNextImage}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentGalleryPage === totalGalleryPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleBackToUpload}>
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
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
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
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border rounded"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={format} onValueChange={setFormat} disabled>
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
                  Quality: {quality}%
                </label>
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
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
