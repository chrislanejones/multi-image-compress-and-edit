import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useImageContext } from '../context/ImageContext'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ImageFile } from '@/types/types'
import Image from 'next/image'

export function UploadComponent() {
  const navigate = useNavigate()
  const { addImages } = useImageContext()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processFiles(files)
  }

  const processFiles = useCallback((files: FileList) => {
    const newImages: ImageFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        newImages.push({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        })
      }
    }

    if (newImages.length > 0) {
      addImages(newImages)
      navigate({
        to: '/gallery',
        search: { selected: newImages[0].id, page: 1 }
      })
    }
  }, [addImages, navigate])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/50 p-4 rounded-full w-50 h-50 flex items-center justify-center mb-2">
            <Image
              src="/Image-Horse-Logo.svg"
              alt="Horse Icon"
              width={200}
              height={200}
              className="p-1 m-5"
            />
          </div>
          <CardTitle className="text-2xl">ImageHorse</CardTitle>
          <CardDescription>
            Upload Multiple Images for Editing and Compression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 bg-primary/5'
            } rounded-lg hover:bg-primary/10 transition-colors cursor-pointer`}
            onClick={handleUploadClick}
            onDragEnter={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-primary/60 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Drag and drop your images here, click to browse, or paste from clipboard
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
          <Button onClick={handleUploadClick} className="w-full" size="lg">
            Select Images
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
