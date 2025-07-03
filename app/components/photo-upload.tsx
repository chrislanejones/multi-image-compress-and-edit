'use client'

import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'
import { useImageContext } from '../context/ImageContext'
import { Card, CardHeader, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'

export default function PhotoUpload() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [showBackOption, setShowBackOption] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addImages, images } = useImageContext()

  useEffect(() => {
    // Check if user has previously uploaded images
    setShowBackOption(images.length > 0)
  }, [images])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    addImages(files)
    navigate({ to: '/gallery' })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleBackToImages = () => {
    navigate({ to: '/gallery' })
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files)
      navigate({ to: '/gallery' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/50 p-4 rounded-full w-50 h-50 flex items-center justify-center mb-2">
            <img
              alt="Horse Icon"
              width="200"
              height="200"
              className="p-1 m-5"
              src="/Image-Horse-Logo.svg"
            />
          </div>
          <div className="font-semibold tracking-tight text-2xl">
            ImageHorse
          </div>
          <div className="text-sm text-muted-foreground">
            Upload Multiple Images for Editing and Compression
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer ${
              isDragging ? 'bg-primary/15 border-primary/40' : ''
            }`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-primary/60 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              {isDragging
                ? 'Drop your images here!'
                : 'Drag and drop your images here, click to browse, or paste from clipboard'}
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </CardContent>

        <CardFooter>
          {showBackOption ? (
            <div className="flex gap-4 w-full">
              <Button onClick={handleUploadClick} className="flex-1">
                Select Images
              </Button>
              <Button onClick={handleBackToImages} className="flex-1">
                Back To Images
              </Button>
            </div>
          ) : (
            <Button onClick={handleUploadClick} className="w-full">
              Select Images
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
