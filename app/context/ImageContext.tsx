"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ImageFile, EditorState, NavigationDirection } from '@/types';

interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  selectedImageId: string | null;
  editorState: EditorState;
  isEditMode: boolean;
  currentPage: number;
  totalPages: number;
  addImages: (files: FileList) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  updateImageUrl: (id: string, newUrl: string) => void;
  navigateImage: (direction: NavigationDirection) => void;
  setCurrentPage: (page: number) => void;
  setEditorState: (state: EditorState) => void;
  setEditMode: (isEditMode: boolean) => void;
}

const ImageContext = createContext<ImageContextType | null>(null);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};

const IMAGES_PER_PAGE = 10;

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>("resizeAndOptimize");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);

  const addImages = useCallback((files: FileList) => {
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
    
    setImages(prev => [...prev, ...newImages]);
    
    if (newImages.length > 0 && !selectedImage) {
      setSelectedImage(newImages[0]);
      setSelectedImageId(newImages[0].id);
      setCurrentPage(1);
    }
  }, [selectedImage]);

  const removeImage = useCallback((id: string) => {
    const imageIndex = images.findIndex(img => img.id === id);
    if (imageIndex === -1) return;

    const imageToRemove = images[imageIndex];
    URL.revokeObjectURL(imageToRemove.url);

    const updatedImages = images.filter(image => image.id !== id);
    setImages(updatedImages);

    if (selectedImageId === id) {
      if (updatedImages.length > 0) {
        const nextIndex = Math.min(imageIndex, updatedImages.length - 1);
        const nextImage = updatedImages[nextIndex];
        setSelectedImage(nextImage);
        setSelectedImageId(nextImage.id);
        const newPage = Math.floor(nextIndex / IMAGES_PER_PAGE) + 1;
        setCurrentPage(newPage);
      } else {
        setSelectedImage(null);
        setSelectedImageId(null);
      }
    }
  }, [images, selectedImageId]);

  const removeAllImages = useCallback(() => {
    images.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
    
    setImages([]);
    setSelectedImage(null);
    setSelectedImageId(null);
    setCurrentPage(1);
    setEditorState("resizeAndOptimize");
    setIsEditMode(false);
  }, [images]);

  const selectImage = useCallback((image: ImageFile) => {
    setSelectedImage(image);
    setSelectedImageId(image.id);
    
    const imageIndex = images.findIndex(img => img.id === image.id);
    if (imageIndex !== -1) {
      const newPage = Math.floor(imageIndex / IMAGES_PER_PAGE) + 1;
      setCurrentPage(newPage);
    }
  }, [images]);

  const updateImageUrl = useCallback((id: string, newUrl: string) => {
    setImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, url: newUrl } : img
      )
    );
    
    if (selectedImageId === id) {
      setSelectedImage(prev => 
        prev ? { ...prev, url: newUrl } : null
      );
    }
  }, [selectedImageId]);

  const navigateImage = useCallback((direction: NavigationDirection) => {
    if (images.length === 0 || !selectedImage) return;

    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;

    let newIndex;
    switch (direction) {
      case "next":
        newIndex = (currentIndex + 1) % images.length;
        break;
      case "prev":
        newIndex = (currentIndex - 1 + images.length) % images.length;
        break;
      case "next10":
        newIndex = Math.min(currentIndex + 10, images.length - 1);
        break;
      case "prev10":
        newIndex = Math.max(currentIndex - 10, 0);
        break;
      default:
        return;
    }

    const newImage = images[newIndex];
    setSelectedImage(newImage);
    setSelectedImageId(newImage.id);
    
    const newPage = Math.floor(newIndex / IMAGES_PER_PAGE) + 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [images, selectedImage, currentPage]);

  const setEditModeHandler = useCallback((editMode: boolean) => {
    setIsEditMode(editMode);
    if (!editMode) {
      setEditorState("resizeAndOptimize");
    }
  }, []);

  const value: ImageContextType = {
    images,
    selectedImage,
    selectedImageId,
    editorState,
    isEditMode,
    currentPage,
    totalPages,
    addImages,
    removeImage,
    removeAllImages,
    selectImage,
    updateImageUrl,
    navigateImage,
    setCurrentPage,
    setEditorState,
    setEditMode: setEditModeHandler,
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};
