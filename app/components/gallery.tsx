import { useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { X, Upload } from 'lucide-react'

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

  const handleBackToUpload = () => {
    navigate({ to: '/' })
  }

  const handleSelectImage = (image: any) => {
    selectImage(image)
    navigate({ 
      to: '/edit/$imageId', 
      params: { imageId: image.id },
      search: { state: 'editImage' }
    })
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
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <div className="flex gap-2">
          <Button onClick={handleBackToUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload More
          </Button>
          <Button variant="destructive" onClick={removeAllImages}>
            <X className="mr-2 h-4 w-4" />
            Remove All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image: any) => (
          <Card
            key={image.id}
            className={`group relative overflow-hidden cursor-pointer transition-all ${
              selectedImage?.id === image.id 
                ? 'ring-2 ring-blue-500' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleSelectImage(image)}
          >
            <div className="relative aspect-square w-full">
              <img
                src={image.url}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2 text-center text-sm text-gray-600 dark:text-gray-400 truncate">
              {image.file.name}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(image.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
