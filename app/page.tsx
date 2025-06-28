'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useImageContext } from './context/ImageContext';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ImageFile } from '@/types/types';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { addImages } = useImageContext();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList) => {
      const newImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          newImages.push({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
          });
        }
      }

      if (newImages.length > 0) {
        addImages(newImages);
        router.push(`/gallery?selected=${newImages[0].id}`);
      }
    },
    [addImages, router]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
            <Image src="/Image-Horse-Logo.svg" alt="ImageHorse Logo" width={48} height={48} />
          </div>
          <CardTitle className="text-3xl">ImageHorse</CardTitle>
          <CardDescription className="text-base">
            Upload Multiple Images for Editing and Compression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all ${
              isDragging
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            } rounded-lg cursor-pointer`}
            onClick={handleUploadClick}
            onDragEnter={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
          >
            <Upload
              className={`w-12 h-12 mb-4 transition-colors ${
                isDragging ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <p className="text-center text-muted-foreground">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB each</p>
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
