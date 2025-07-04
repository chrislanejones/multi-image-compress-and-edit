"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { ImageFile } from "@/types";

interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  selectedImageId: string | null;
  addImages: (files: ImageFile[]) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  updateImageUrl: (id: string, newUrl: string) => void;
}

const ImageContext = createContext<ImageContextType | null>(null);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Use refs to track cleanup URLs to prevent memory leaks
  const urlsToCleanup = useRef<Set<string>>(new Set());

  // Memoize selected image to prevent unnecessary re-renders
  const selectedImage = useMemo(() => {
    return images.find((img) => img.id === selectedImageId) || null;
  }, [images, selectedImageId]);

  const addImages = useCallback(
    (newImages: ImageFile[]) => {
      setImages((prev) => {
        const combined = [...prev, ...newImages];

        // Track URLs for cleanup
        newImages.forEach((img) => {
          urlsToCleanup.current.add(img.url);
        });

        // Set first image as selected if none is currently selected
        if (!selectedImageId && newImages.length > 0) {
          setSelectedImageId(newImages[0].id);
        }

        return combined;
      });
    },
    [selectedImageId]
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const imageIndex = prev.findIndex((img) => img.id === id);
        if (imageIndex === -1) return prev;

        const imageToRemove = prev[imageIndex];

        // Clean up URL
        if (urlsToCleanup.current.has(imageToRemove.url)) {
          URL.revokeObjectURL(imageToRemove.url);
          urlsToCleanup.current.delete(imageToRemove.url);
        }

        const updatedImages = prev.filter((image) => image.id !== id);

        // Update selected image if the removed one was selected
        if (selectedImageId === id && updatedImages.length > 0) {
          const nextIndex = Math.min(imageIndex, updatedImages.length - 1);
          const nextImage = updatedImages[nextIndex];
          setSelectedImageId(nextImage.id);
        } else if (updatedImages.length === 0) {
          setSelectedImageId(null);
        }

        return updatedImages;
      });
    },
    [selectedImageId]
  );

  const removeAllImages = useCallback(() => {
    // Clean up all URLs
    urlsToCleanup.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    urlsToCleanup.current.clear();

    setImages([]);
    setSelectedImageId(null);
  }, []);

  const selectImage = useCallback((image: ImageFile) => {
    setSelectedImageId(image.id);
  }, []);

  const updateImageUrl = useCallback((id: string, newUrl: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          // Clean up old URL if we're tracking it
          if (urlsToCleanup.current.has(img.url)) {
            URL.revokeObjectURL(img.url);
            urlsToCleanup.current.delete(img.url);
          }

          // Track new URL
          urlsToCleanup.current.add(newUrl);

          return { ...img, url: newUrl };
        }
        return img;
      })
    );
  }, []);

  // Cleanup URLs when component unmounts
  React.useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const value: ImageContextType = useMemo(
    () => ({
      images,
      selectedImage,
      selectedImageId,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      updateImageUrl,
    }),
    [
      images,
      selectedImage,
      selectedImageId,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      updateImageUrl,
    ]
  );

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
};
