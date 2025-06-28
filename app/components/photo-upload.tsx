import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'

export function PhotoUpload() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    // Add images to context here
    navigate({ to: '/gallery', search: { state: 'resizeAndOptimize' } })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Add images to context here
      navigate({ to: '/gallery', search: { state: 'resizeAndOptimize' } })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md shadow-lg border rounded-lg">
        <div className="text-center p-6">
          <div className="mx-auto bg-blue-500 p-4 rounded-full w-32 h-32 flex items-center justify-center mb-4">
            <span className="text-4xl">🐎</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">ImageHorse</h1>
          <p className="text-gray-600 mb-6">Upload Multiple Images for Editing and Compression</p>
          
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            } rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mb-4`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 text-center">
              Drag and drop your images here, click to browse, or paste from clipboard
            </p>
          </div>
          
          <button 
            onClick={handleUploadClick}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Select Images
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
