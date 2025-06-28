'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useImageContext } from '../context/ImageContext';
import { ImageFile } from '@/types/types';
import Image from 'next/image';
import { X, ArrowLeft, Edit, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { images, selectedImage, selectImage, removeImage, removeAllImages } = useImageContext();

  const selectedId = searchParams.get('selected');
  const selectedImageFromUrl = images.find(img => img.id === selectedId);
  const currentSelectedImage = selectedImageFromUrl || selectedImage || images[0];

  React.useEffect(() => {
    if (selectedImageFromUrl && selectedImageFromUrl !== selectedImage) {
      selectImage(selectedImageFromUrl);
    }
  }, [selectedImageFromUrl, selectedImage, selectImage]);

  const handleSelectImage = (image: ImageFile) => {
    selectImage(image);
    router.push(`/gallery?selected=${image.id}`);
  };

  if (images.length === 0) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/')} variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Gallery</h1>
              <span className="text-muted-foreground">({images.length} images)</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')} variant="outline">
                Upload More
              </Button>
              <Button onClick={removeAllImages} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Image thumbnails strip */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">All Images</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map(image => (
              <div
                key={image.id}
                className={`relative group flex-shrink-0 w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  currentSelectedImage?.id === image.id
                    ? 'border-primary shadow-md scale-105'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleSelectImage(image)}
              >
                <Image src={image.url} alt="Thumbnail" fill className="object-cover" />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main image display */}
        {currentSelectedImage && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Image display */}
            <div className="lg:col-span-4">
              <div className="relative bg-muted/20 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
                <Image
                  src={currentSelectedImage.url}
                  alt={currentSelectedImage.file.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[600px] object-contain rounded shadow-lg"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Image info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2 truncate">{currentSelectedImage.file.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Type: {currentSelectedImage.file.type}</p>
                  <p>Size: {(currentSelectedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="font-medium">Actions</h4>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/edit/${currentSelectedImage.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Image
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = currentSelectedImage.url;
                    a.download = currentSelectedImage.file.name || 'image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    removeImage(currentSelectedImage.id);
                    if (images.length > 1) {
                      const nextImage = images.find(img => img.id !== currentSelectedImage.id);
                      if (nextImage) {
                        router.push(`/gallery?selected=${nextImage.id}`);
                      }
                    } else {
                      router.push('/');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
