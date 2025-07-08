"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ImageFile } from "@/types";
import { IMAGES_PER_PAGE } from "@/types";

// Define the full context type here for clarity
export interface FullImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  selectedImageId: string | null;
  currentPage: number; // 1-based for display
  totalPages: number;
  paginatedImages: ImageFile[];
  addImages: (files: ImageFile[]) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  updateImageUrl: (id: string, newUrl: string) => void;
  navigateImage: (direction: "prev" | "next") => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  onClose: () => void;
  onApplyCrop: () => void;
  onApplyBlur: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onReset: () => void;
}

const ImageContext = createContext<FullImageContextType | null>(null);

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
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for logic

  const urlsToCleanup = useRef<Set<string>>(new Set());

  const selectedImage = useMemo(() => {
    return images.find((img) => img.id === selectedImageId) || null;
  }, [images, selectedImageId]);

  const { totalPages, paginatedImages } = useMemo(() => {
    const total = Math.ceil(images.length / IMAGES_PER_PAGE);
    const startIndex = currentPage * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const current = images.slice(startIndex, endIndex);
    return { totalPages: total, paginatedImages: current };
  }, [images, currentPage]);

  const addImages = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    newImages.forEach((img) => urlsToCleanup.current.add(img.url));
    if (!selectedImageId && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }
  }, [selectedImageId]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageIndex = prev.findIndex((img) => img.id === id);
      if (imageIndex === -1) return prev;
      const imageToRemove = prev[imageIndex];
      if (urlsToCleanup.current.has(imageToRemove.url)) {
        URL.revokeObjectURL(imageToRemove.url);
        urlsToCleanup.current.delete(imageToRemove.url);
      }
      const updatedImages = prev.filter((image) => image.id !== id);
      if (selectedImageId === id && updatedImages.length > 0) {
        const nextIndex = Math.min(imageIndex, updatedImages.length - 1);
        setSelectedImageId(updatedImages[nextIndex].id);
      } else if (updatedImages.length === 0) {
        setSelectedImageId(null);
      }
      return updatedImages;
    });
  }, [selectedImageId]);

  const removeAllImages = useCallback(() => {
    urlsToCleanup.current.forEach(URL.revokeObjectURL);
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
          if (urlsToCleanup.current.has(img.url)) {
            URL.revokeObjectURL(img.url);
            urlsToCleanup.current.delete(img.url);
          }
          urlsToCleanup.current.add(newUrl);
          return { ...img, url: newUrl };
        }
        return img;
      })
    );
  }, []);

  const navigateImage = useCallback((direction: "prev" | "next") => {
    if (images.length === 0) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImageId);
    if (currentIndex === -1) return;
    const nextIndex = direction === "next" ? (currentIndex + 1) % images.length : (currentIndex - 1 + images.length) % images.length;
    const newPage = Math.floor(nextIndex / IMAGES_PER_PAGE);
    if (newPage !== currentPage) setCurrentPage(newPage);
    setSelectedImageId(images[nextIndex].id);
  }, [images, selectedImageId, currentPage]);

  const onNavigatePage = useCallback((direction: "prev" | "next") => {
    setCurrentPage((current) => {
      const newPage = direction === "next" ? current + 1 : current - 1;
      if (newPage >= 0 && newPage < totalPages) {
        const newImageIndex = newPage * IMAGES_PER_PAGE;
        if (images[newImageIndex]) setSelectedImageId(images[newImageIndex].id);
        return newPage;
      }
      return current;
    });
  }, [totalPages, images]);

  const onClose = useCallback(() => navigate({ to: "/" }), [navigate]);

  const onApplyCrop = () => console.log("Apply Crop clicked");
  const onApplyBlur = () => console.log("Apply Blur clicked");
  const onRotateLeft = () => console.log("Rotate Left clicked");
  const onRotateRight = () => console.log("Rotate Right clicked");
  const onFlipHorizontal = () => console.log("Flip Horizontal clicked");
  const onFlipVertical = () => console.log("Flip Vertical clicked");
  const onReset = () => console.log("Reset clicked");

  useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const value: FullImageContextType = useMemo(
    () => ({
      images, selectedImage, selectedImageId, currentPage: currentPage + 1, totalPages, paginatedImages,
      addImages, removeImage, removeAllImages, selectImage, updateImageUrl,
      navigateImage, onNavigatePage, onClose, onApplyCrop, onApplyBlur, onRotateLeft,
      onRotateRight, onFlipHorizontal, onFlipVertical, onReset,
    }),
    [
      images, selectedImage, selectedImageId, currentPage, totalPages, paginatedImages,
      addImages, removeImage, removeAllImages, selectImage, updateImageUrl,
      navigateImage, onNavigatePage, onClose
    ]
  );

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};
