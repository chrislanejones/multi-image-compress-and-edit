// context/image-context.tsx - Clean, working image context
import React, { createContext, useContext, useState, useCallback } from "react";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  thumbnail?: string;
  compressed?: string;
  originalSize: number;
  compressedSize?: number;
  width?: number;
  height?: number;
  metadata?: {
    originalSize: number;
    compressedSize?: number;
    compressionRatio?: number;
  };
}

interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  addImages: (newImages: ImageFile[]) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile | null) => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  clearImages: () => void;
  totalSize: number;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const addImages = useCallback(
    (newImages: ImageFile[]) => {
      console.log(`📦 Adding ${newImages.length} images to context`);
      setImages((prev) => {
        const updated = [...prev, ...newImages];
        console.log(`📊 Context now has ${updated.length} total images`);

        // Auto-select first image if none selected
        if (!selectedImage && newImages.length > 0) {
          setSelectedImage(newImages[0]);
        }

        return updated;
      });
    },
    [selectedImage]
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== id);

        // Clean up object URLs
        const removed = prev.find((img) => img.id === id);
        if (removed) {
          URL.revokeObjectURL(removed.url);
          if (removed.thumbnail) URL.revokeObjectURL(removed.thumbnail);
          if (removed.compressed) URL.revokeObjectURL(removed.compressed);

          // Update selected image if it was removed
          if (selectedImage?.id === id) {
            setSelectedImage(updated.length > 0 ? updated[0] : null);
          }
        }

        return updated;
      });
    },
    [selectedImage]
  );

  const removeAllImages = useCallback(() => {
    // Clean up all object URLs
    images.forEach((img) => {
      URL.revokeObjectURL(img.url);
      if (img.thumbnail) URL.revokeObjectURL(img.thumbnail);
      if (img.compressed) URL.revokeObjectURL(img.compressed);
    });

    setImages([]);
    setSelectedImage(null);
  }, [images]);

  const selectImage = useCallback((image: ImageFile | null) => {
    setSelectedImage(image);
  }, []);

  const updateImage = useCallback(
    (id: string, updates: Partial<ImageFile>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );

      // Update selected image if it's the one being updated
      if (selectedImage?.id === id) {
        setSelectedImage((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedImage]
  );

  const clearImages = useCallback(() => {
    removeAllImages();
  }, [removeAllImages]);

  const totalSize = images.reduce((sum, img) => sum + img.originalSize, 0);

  const value = {
    images,
    selectedImage,
    addImages,
    removeImage,
    removeAllImages,
    selectImage,
    updateImage,
    clearImages,
    totalSize,
  };

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
}

export function useImageContext() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
}

// Legacy export for backward compatibility
export { useImageContext as useImages };
