"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useImageContext } from './context/ImageContext';

export default function HomePage() {
  const router = useRouter();
  const { addImages } = useImageContext();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    addImages(files);
    router.push('/gallery');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
      router.push('/gallery');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/50 p-4 rounded-full w-50 h-50 flex items-center justify-center mb-2">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-4xl">🐎</span>
            </div>
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
                ? "border-primary bg-primary/10"
                : "border-primary/20 bg-primary/5"
            } rounded-lg hover:bg-primary/10 transition-colors cursor-pointer`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
  );
}
