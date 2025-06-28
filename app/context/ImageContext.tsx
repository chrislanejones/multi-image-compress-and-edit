'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ImageFile } from '@/types/types';

interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  setImages: (images: ImageFile[]) => void;
  addImages: (newImages: ImageFile[]) => void;
  removeImage: (id: string) => void;
  selectImage: (image: ImageFile | null) => void;
  updateImage: (id: string, updatedImage: Partial<ImageFile>) => void;
  removeAllImages: () => void;
}

const ImageContext = createContext<ImageContextType | null>(null);

export function useImageContext() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within ImageContextProvider');
  }
  return context;
}

export function ImageContextProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const addImages = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
    setSelectedImage(prev => (prev?.id === id ? null : prev));
  }, []);

  const selectImage = useCallback((image: ImageFile | null) => {
    setSelectedImage(image);
  }, []);

  const updateImage = useCallback((id: string, updatedImage: Partial<ImageFile>) => {
    setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updatedImage } : img)));
    setSelectedImage(prev => (prev?.id === id ? { ...prev, ...updatedImage } : prev));
  }, []);

  const removeAllImages = useCallback(() => {
    images.forEach(image => URL.revokeObjectURL(image.url));
    setImages([]);
    setSelectedImage(null);
  }, [images]);

  return (
    <ImageContext.Provider
      value={{
        images,
        selectedImage,
        setImages,
        addImages,
        removeImage,
        selectImage,
        updateImage,
        removeAllImages,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}
