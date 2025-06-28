"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload } from 'lucide-react';
import { useImageContext } from '../context/ImageContext';

export default function PhotoUpload() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addImages } = useImageContext()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    addImages(files)
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
      navigate({ to: '/gallery', search: { state: 'resizeAndOptimize' } })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center px-6">
        <div className="mx-auto bg-blue-500 p-4 rounded-full w-32 h-32 flex items-center justify-center mb-4">
          <Upload className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Image Horse</h1>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop your images here, click to browse, or paste from clipboard
        </p>
        
        <div
          className={`w-full bg-blue-500 text-white py-8 px-4 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer border-2 border-dashed ${
            isDragging
              ? "border-blue-300 bg-blue-400"
              : "border-blue-500"
          }`}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-white mb-4 mx-auto" />
          <p className="text-sm text-white">
            {isDragging 
              ? "Drop your images here!" 
              : "Click to browse or drag and drop images"
            }
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
      </div>
    </div>
  )
}
