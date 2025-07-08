"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useEditorStore } from "../store/editor-store";
import { compressImageAggressively } from "../utils/image-processing";
import { toast } from "sonner";
import type { ImageFile } from "../types";
import { IMAGES_PER_PAGE } from "../types";

interface ResizeDraft {
  width: number;
  height: number;
}

export interface FullImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  paginatedImages: ImageFile[];
  currentPage: number;
  totalPages: number;
  resizeDraft: ResizeDraft | null;
  setResizeDraft: (draft: ResizeDraft) => void;
  addImages: (files: ImageFile[]) => void;
  removeImage: (id: string) => void;
  selectImage: (image: ImageFile) => void;
  navigateImage: (direction: "prev" | "next") => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  handleApplyResize: () => Promise<void>;
  handleReset: () => void;
  [key: string]: any;
}

const ImageContext = createContext<FullImageContextType | null>(null);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error("useImageContext must be used within an ImageProvider");
  return context;
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<Map<string, string>>(new Map());
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft | null>(null);

  const { format, compressionLevel } = useEditorStore.getState();

  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId) || null, [images, selectedImageId]);
  
  const { totalPages, paginatedImages } = useMemo(() => {
    const total = Math.ceil(images.length / IMAGES_PER_PAGE);
    const startIndex = currentPage * IMAGES_PER_PAGE;
    return { totalPages: total, paginatedImages: images.slice(startIndex, startIndex + IMAGES_PER_PAGE) };
  }, [images, currentPage]);

  useEffect(() => {
    if (selectedImage) {
      setResizeDraft({ width: selectedImage.width || 0, height: selectedImage.height || 0 });
    } else {
      setResizeDraft(null);
    }
  }, [selectedImage]);

  const addImages = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    const newOriginals = new Map(originalImageUrls);
    newImages.forEach((img) => {
      newOriginals.set(img.id, img.url);
    });
    setOriginalImageUrls(newOriginals);
    if (!selectedImageId && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }
  }, [selectedImageId, originalImageUrls]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      const updatedImages = prev.filter((image) => image.id !== id);
      
      if (selectedImageId === id) {
        if (updatedImages.length > 0) {
          const oldIndex = prev.findIndex(img => img.id === id);
          const newIndex = Math.max(0, oldIndex - 1);
          setSelectedImageId(updatedImages[newIndex].id);
        } else {
          setSelectedImageId(null);
        }
      }
      return updatedImages;
    });
  }, [selectedImageId]);

  const updateImageUrl = useCallback((id: string, newUrl: string, newMetadata: Partial<ImageFile['metadata']>) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        return { ...img, url: newUrl, metadata: { ...img.metadata, ...newMetadata } as ImageFile['metadata'] };
      }
      return img;
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (!selectedImage) return;
    const originalUrl = originalImageUrls.get(selectedImage.id);
    if (originalUrl && originalUrl !== selectedImage.url) {
      updateImageUrl(selectedImage.id, originalUrl, {
        compressedSize: selectedImage.metadata?.originalSize,
        compressionRatio: 0,
      });
      setResizeDraft({ width: selectedImage.width || 0, height: selectedImage.height || 0 });
    }
  }, [selectedImage, originalImageUrls, updateImageUrl]);

  const handleApplyResize = useCallback(async () => {
    if (!selectedImage || !resizeDraft) return;
    const originalUrl = originalImageUrls.get(selectedImage.id) || selectedImage.url;
    toast("Compressing...", { description: "Please wait." });
    try {
      const result = await compressImageAggressively(originalUrl, resizeDraft.width, format, 500, compressionLevel);
      const savings = 100 - (result.size / (selectedImage.metadata?.originalSize || result.size)) * 100;
      updateImageUrl(selectedImage.id, result.url, {
        compressedSize: result.size,
        compressionRatio: Math.round(savings),
      });
      toast.success("Compression Complete!", { description: `Saved ${Math.round(savings)}%` });
    } catch (error) {
      toast.error("Compression Failed", { description: String(error) });
    }
  }, [selectedImage, resizeDraft, format, compressionLevel, updateImageUrl, originalImageUrls]);
  
  const selectImage = useCallback((image: ImageFile) => setSelectedImageId(image.id), []);

  const navigateImage = useCallback((direction: "prev" | "next") => {
    if (images.length === 0) return;
    const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % images.length 
      : (currentIndex - 1 + images.length) % images.length;
    setSelectedImageId(images[nextIndex].id);
  }, [images, selectedImage]);

  const onNavigatePage = useCallback((direction: "prev" | "next") => {
    setCurrentPage(current => {
      const newPage = direction === 'next' ? current + 1 : current - 1;
      if (newPage >= 0 && newPage < totalPages) {
        const newImageIndex = newPage * IMAGES_PER_PAGE;
        if (images[newImageIndex]) setSelectedImageId(images[newImageIndex].id);
        return newPage;
      }
      return current;
    });
  }, [totalPages, images]);

  const value = useMemo(() => ({
    images, selectedImage, paginatedImages, currentPage: currentPage + 1, totalPages,
    resizeDraft, setResizeDraft, addImages, removeImage, selectImage,
    navigateImage, onNavigatePage, handleApplyResize, handleReset,
  }), [
    images, selectedImage, paginatedImages, currentPage, totalPages,
    resizeDraft, addImages, removeImage, selectImage, navigateImage, onNavigatePage,
    handleApplyResize, handleReset
  ]);

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};
