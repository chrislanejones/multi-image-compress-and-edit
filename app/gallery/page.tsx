"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useImageContext } from '../context/ImageContext';

const IMAGES_PER_PAGE = 10;

export default function GalleryPage() {
  const router = useRouter();
  const {
    images,
    selectedImage,
    currentPage,
    totalPages,
    removeImage,
    removeAllImages,
    selectImage,
    setCurrentPage,
  } = useImageContext();

  useEffect(() => {
    if (images.length === 0) {
      router.push('/');
    }
  }, [images.length, router]);

  const getCurrentPageImages = () => {
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    return images.slice(startIndex, endIndex);
  };

  const currentImages = getCurrentPageImages();

  const handleImageSelect = (image: typeof images[0]) => {
    selectImage(image);
    router.push(`/edit/${image.id}`);
  };

  const handleUploadMore = () => {
    router.push('/');
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Image Gallery</h1>
        <div className="flex gap-2">
          <Button onClick={handleUploadMore}>
            <Upload className="mr-2 h-4 w-4" />
            Upload More
          </Button>
          <Button variant="destructive" onClick={removeAllImages}>
            <X className="mr-2 h-4 w-4" />
            Remove All
          </Button>
        </div>
      </div>

      {selectedImage && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Selected: {selectedImage.file.name}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentImages.map((image) => (
          <Card
            key={image.id}
            className={`group relative overflow-hidden cursor-pointer transition-all ${
              selectedImage?.id === image.id 
                ? 'ring-2 ring-blue-500' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleImageSelect(image)}
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
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className="h-10 w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
