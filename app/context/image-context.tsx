// app/context/image-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import { imageDB } from "@/utils/indexed-db";
import type { ImageFile } from "@/types/types";

interface ResizeDraft {
  width: number;
  height: number;
}

export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

interface FullImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  paginatedImages: ImageFile[];
  currentPage: number;
  totalPages: number;
  resizeDraft: ResizeDraft | null;
  isCompressing: boolean;
  compressionProgress: number;
  itemsPerPage: number;
  onDrop: (acceptedFiles: File[], fileRejections: any[], event: any) => void;
  addImages: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string | null) => void;
  onRotate: (id: string, degrees: number) => void;
  onCrop: (id: string, crop: ImageFile["crop"]) => void;
  onResize: (id: string, resize?: { width: number; height: number }) => void;
  onCompress: () => void;
  onDownload: () => void;
  onClear: () => void;
  setResizeDraft: (draft: ResizeDraft | null) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  removeAllImages: () => void;
  navigateImage: (direction: NavigationDirection) => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  onClose: () => void;
}

const ImageContext = createContext<FullImageContextType | null>(null);

const ITEMS_PER_PAGE_DEFAULT = 10;

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) ?? null,
    [images, selectedImageId]
  );

  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return images.slice(start, end);
  }, [images, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(images.length / itemsPerPage),
    [images.length, itemsPerPage]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[], event: any) => {
      const newImages = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        width: 0,
        height: 0,
      }));
      setImages((prev) => [...prev, ...newImages]);
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const onRemove = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedImageId === id) setSelectedImageId(null);
    },
    [selectedImageId]
  );

  const onSelect = useCallback(
    (id: string | null) => setSelectedImageId(id),
    []
  );

  const onRotate = useCallback((id: string, degrees: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, rotation: ((img.rotation || 0) + degrees) % 360 }
          : img
      )
    );
  }, []);

  const onCrop = useCallback((id: string, crop: ImageFile["crop"]) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, crop } : img))
    );
  }, []);

  const onResize = useCallback(
    (id: string, resize?: { width: number; height: number }) => {
      if (!resize) return;
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, resize } : img))
      );
    },
    []
  );

  const onClear = useCallback(() => {
    setImages([]);
    setSelectedImageId(null);
    setCurrentPage(1);
  }, []);

  const onCompress = useCallback(async () => {
    if (!selectedImage?.file) return;

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (p: number) => setCompressionProgress(p),
      };

      const compressedFile = await imageCompression(
        selectedImage.file,
        options
      );
      const compressedUrl = URL.createObjectURL(compressedFile);

      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? { ...img, compressedUrl, compressedSize: compressedFile.size }
            : img
        )
      );
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  }, [selectedImage]);

  const onDownload = useCallback(() => {
    if (!selectedImage?.file || !selectedImage?.compressedUrl) return;
    const link = document.createElement("a");
    link.href = selectedImage.compressedUrl;
    link.download = `compressed-${selectedImage.file.name}`;
    link.click();
  }, [selectedImage]);

  useEffect(() => {
    images.forEach((img) => {
      if (img.width === 0) {
        const image = new Image();
        image.onload = () => {
          setImages((prev) =>
            prev.map((p) =>
              p.id === img.id
                ? {
                    ...p,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  }
                : p
            )
          );
        };
        image.src = img.url;
      }
    });
  }, [images]);

  const onNavigatePage = useCallback(
    (direction: "prev" | "next") => {
      const idx = images.findIndex((i) => i.id === selectedImageId);
      if (idx === -1) return;

      let next = idx;
      if (direction === "next") next = Math.min(idx + 10, images.length - 1);
      if (direction === "prev") next = Math.max(idx - 10, 0);

      const img = images[next];
      setSelectedImageId(img?.id ?? null);
    },
    [images, selectedImageId]
  );

  const value = useMemo(
    () => ({
      images,
      selectedImage,
      paginatedImages,
      currentPage,
      totalPages,
      resizeDraft,
      isCompressing,
      compressionProgress,
      itemsPerPage,
      onDrop,
      onRemove,
      onSelect,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
      setResizeDraft,
      setCurrentPage,
      setItemsPerPage,
      addImages: (newImages: ImageFile[]) =>
        setImages((prev) => [...prev, ...newImages]),
      removeAllImages: () => setImages([]),
      navigateImage: (direction: NavigationDirection) => {
        const idx = images.findIndex((i) => i.id === selectedImageId);
        if (idx === -1) return;
        let next = idx;
        if (direction === "next") next = Math.min(idx + 1, images.length - 1);
        if (direction === "prev") next = Math.max(idx - 1, 0);
        if (direction === "next10")
          next = Math.min(idx + 10, images.length - 1);
        if (direction === "prev10") next = Math.max(idx - 10, 0);
        setSelectedImageId(images[next]?.id ?? null);
      },
      onNavigatePage,
      onClose: () => setSelectedImageId(null),
    }),
    [
      images,
      selectedImage,
      paginatedImages,
      currentPage,
      totalPages,
      resizeDraft,
      isCompressing,
      compressionProgress,
      itemsPerPage,
      onRemove,
      onSelect,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
    ]
  );

  return (
    <ImageContext.Provider value={value}>
      <input {...getInputProps()} />
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const ctx = useContext(ImageContext);
  if (!ctx) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return ctx;
};
