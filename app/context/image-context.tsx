"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useEditorStore } from "../store/editor-store";
import { compressImageAggressively } from "../utils/image-processing";
import { toast } from "sonner";
import { ImageFile, IMAGES_PER_PAGE, ImageMetadata } from "../types/types";

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
  addImages: (files: ImageFile[]) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  navigateImage: (direction: "prev" | "next") => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  handleApplyResize: () => Promise<void>;
  handleReset: () => void;
  onClose: () => void;
  onApplyCrop?: () => void;
  onApplyBlur?: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onDownload?: () => void;
  [key: string]: any;
}

const ImageContext = createContext<FullImageContextType | null>(null);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context)
    throw new Error("useImageContext must be used within an ImageProvider");
  return context;
};

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

// Helper function for image transformations
const transformImage = async (
  imageUrl: string,
  transformation: {
    rotate?: 90 | -90;
    flipH?: boolean;
    flipV?: boolean;
  }
): Promise<{ url: string; width: number; height: number; size: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      const { width, height } = img;
      const { rotate = 0, flipH = false, flipV = false } = transformation;

      // Set canvas dimensions based on rotation
      if (rotate === 90 || rotate === -90) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // Translate to center, scale for flips, rotate, and draw the image
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.drawImage(img, -width / 2, -height / 2);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to create blob"));
          const newUrl = URL.createObjectURL(blob);
          resolve({
            url: newUrl,
            width: canvas.width,
            height: canvas.height,
            size: blob.size,
          });
        },
        "image/png",
        1 // Use PNG for lossless transformations
      );
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [originalImages, setOriginalImages] = useState<Map<string, ImageFile>>(
    new Map()
  );
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { format, compressionLevel, setHasUnsavedChanges } = useEditorStore(
    (state) => ({
      format: state.format,
      compressionLevel: state.compressionLevel,
      setHasUnsavedChanges: state.setHasUnsavedChanges,
    })
  );

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) || null,
    [images, selectedImageId]
  );

  const { totalPages, paginatedImages } = useMemo(() => {
    const total = Math.ceil(images.length / IMAGES_PER_PAGE);
    const startIndex = currentPage * IMAGES_PER_PAGE;
    return {
      totalPages: total,
      paginatedImages: images.slice(startIndex, startIndex + IMAGES_PER_PAGE),
    };
  }, [images, currentPage]);

  // ✅ Derived resizeDraft — no useState or useEffect
  const resizeDraft = useMemo(() => {
    if (!selectedImage) return null;
    return {
      width: selectedImage.width || 0,
      height: selectedImage.height || 0,
    };
  }, [selectedImage?.width, selectedImage?.height]);

  const addImages = useCallback(
    (newImages: ImageFile[]) => {
      setImages((prev) => [...prev, ...newImages]);
      const newOriginals = new Map(originalImages);
      newImages.forEach((img) => {
        newOriginals.set(img.id, { ...img });
      });
      setOriginalImages(newOriginals);
      if (!selectedImageId && newImages.length > 0) {
        setSelectedImageId(newImages[0].id);
      }
    },
    [selectedImageId, originalImages]
  );

  const updateImage = useCallback((id: string, updates: Partial<ImageFile>) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          if (updates.url && img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url);
          }
          const newMetadata = {
            ...img.metadata,
            ...updates.metadata,
          } as ImageMetadata;
          return { ...img, ...updates, metadata: newMetadata };
        }
        return img;
      })
    );
  }, []);

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === id);
        const updatedImages = prev.filter((image) => image.id !== id);

        if (imageToRemove?.url) URL.revokeObjectURL(imageToRemove.url);

        setOriginalImages((prevOriginals) => {
          const newOriginals = new Map(prevOriginals);
          const original = newOriginals.get(id);
          if (original?.url) URL.revokeObjectURL(original.url);
          newOriginals.delete(id);
          return newOriginals;
        });

        if (selectedImageId === id) {
          if (updatedImages.length > 0) {
            const oldIndex = prev.findIndex((img) => img.id === id);
            const newIndex = Math.max(0, oldIndex - 1);
            setSelectedImageId(updatedImages[newIndex].id);
          } else {
            setSelectedImageId(null);
          }
        }
        return updatedImages;
      });

      toast.success("Image removed", {
        description: "Image has been removed from the gallery.",
        duration: 2000,
      });
    },
    [selectedImageId]
  );

  const removeAllImages = useCallback(() => {
    const imageCount = images.length;
    images.forEach((img) => URL.revokeObjectURL(img.url));
    originalImages.forEach((img) => URL.revokeObjectURL(img.url));

    setImages([]);
    setOriginalImages(new Map());
    setSelectedImageId(null);
    setCurrentPage(0);

    toast.success("All images removed", {
      description: `Successfully removed ${imageCount} images from the gallery.`,
      duration: 3000,
    });
  }, [images, originalImages]);

  const handleReset = useCallback(() => {
    if (!selectedImage) return;
    const originalImage = originalImages.get(selectedImage.id);
    if (originalImage) {
      updateImage(selectedImage.id, { ...originalImage });
      setHasUnsavedChanges(false);
      toast.success("Image reset", {
        description: "Image has been restored to its original state.",
        duration: 2000,
      });
    }
  }, [selectedImage, originalImages, updateImage, setHasUnsavedChanges]);

  const handleApplyResize = useCallback(async () => {
    if (!selectedImage || !resizeDraft) return;
    const originalUrl =
      originalImages.get(selectedImage.id)?.url || selectedImage.url;

    const loadingToast = toast.loading("Compressing image...", {
      description: "Please wait while we optimize your image.",
      duration: Infinity,
    });

    try {
      const result = await compressImageAggressively(
        originalUrl,
        resizeDraft.width,
        format,
        500,
        compressionLevel
      );
      const originalSize =
        selectedImage.metadata?.originalSize || selectedImage.file.size;
      const savings = 100 - (result.size / originalSize) * 100;

      updateImage(selectedImage.id, {
        url: result.url,
        metadata: {
          originalSize: originalSize,
          compressedSize: result.size,
          compressionRatio: Math.round(savings),
        },
      });
      setHasUnsavedChanges(true);

      toast.dismiss(loadingToast);
      toast.success("Compression Complete!", {
        description: `Saved ${Math.round(savings)}% • ${formatBytes(result.size)} total`,
        duration: 4000,
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Compression Failed", {
        description:
          "There was an error processing your image. Please try again.",
        duration: 5000,
      });
    }
  }, [
    selectedImage,
    resizeDraft,
    format,
    compressionLevel,
    updateImage,
    originalImages,
    setHasUnsavedChanges,
  ]);

  const selectImage = useCallback(
    (image: ImageFile) => setSelectedImageId(image.id),
    []
  );

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (images.length === 0) return;
      const currentIndex = selectedImage
        ? images.findIndex((img) => img.id === selectedImage.id)
        : -1;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % images.length
          : (currentIndex - 1 + images.length) % images.length;
      setSelectedImageId(images[nextIndex].id);
    },
    [images, selectedImage]
  );

  const onNavigatePage = useCallback(
    (direction: "prev" | "next") => {
      setCurrentPage((current) => {
        const newPage = direction === "next" ? current + 1 : current - 1;
        if (newPage >= 0 && newPage < totalPages) {
          const newImageIndex = newPage * IMAGES_PER_PAGE;
          if (images[newImageIndex])
            setSelectedImageId(images[newImageIndex].id);
          return newPage;
        }
        return current;
      });
    },
    [totalPages, images]
  );

  const onClose = useCallback(() => {}, []);

  const onApplyCrop = useCallback(() => {
    toast.info("Crop feature", {
      description: "Crop functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

  const onApplyBlur = useCallback(() => {
    toast.info("Blur feature", {
      description: "Blur functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

  const handleTransformation = useCallback(
    async (
      transformation: Parameters<typeof transformImage>[1],
      toastMessages: { loading: string; success: string; error: string }
    ) => {
      if (!selectedImage) return;
      const loadingToast = toast.loading(toastMessages.loading);
      try {
        const result = await transformImage(selectedImage.url, transformation);
        const originalSize =
          selectedImage.metadata?.originalSize || selectedImage.file.size;
        const savings = 100 - (result.size / originalSize) * 100;

        updateImage(selectedImage.id, {
          url: result.url,
          width: result.width,
          height: result.height,
          metadata: {
            originalSize: originalSize,
            compressedSize: result.size,
            compressionRatio: Math.round(savings),
          },
        });
        setHasUnsavedChanges(true);
        toast.dismiss(loadingToast);
        toast.success(toastMessages.success);
      } catch (error) {
        console.error(error);
        toast.dismiss(loadingToast);
        toast.error(toastMessages.error);
      }
    },
    [selectedImage, updateImage, setHasUnsavedChanges]
  );

  const onRotateLeft = useCallback(
    () =>
      handleTransformation(
        { rotate: -90 },
        {
          loading: "Rotating image left...",
          success: "Image rotated",
          error: "Failed to rotate image",
        }
      ),
    [handleTransformation]
  );

  const onRotateRight = useCallback(
    () =>
      handleTransformation(
        { rotate: 90 },
        {
          loading: "Rotating image right...",
          success: "Image rotated",
          error: "Failed to rotate image",
        }
      ),
    [handleTransformation]
  );

  const onFlipHorizontal = useCallback(
    () =>
      handleTransformation(
        { flipH: true },
        {
          loading: "Flipping image...",
          success: "Image flipped horizontally",
          error: "Failed to flip image",
        }
      ),
    [handleTransformation]
  );

  const onFlipVertical = useCallback(
    () =>
      handleTransformation(
        { flipV: true },
        {
          loading: "Flipping image...",
          success: "Image flipped vertically",
          error: "Failed to flip image",
        }
      ),
    [handleTransformation]
  );

  const onDownload = useCallback(() => {
    if (!selectedImage) return;

    const link = document.createElement("a");
    link.href = selectedImage.url;
    link.download = `${selectedImage.file.name.split(".")[0]}-edited.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started", {
      description: `Downloading ${selectedImage.file.name}`,
      duration: 2000,
    });
  }, [selectedImage, format]);

  const value = useMemo(
    () => ({
      images,
      selectedImage,
      paginatedImages,
      currentPage: currentPage + 1,
      totalPages,
      resizeDraft,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      navigateImage,
      onNavigatePage,
      handleApplyResize,
      handleReset,
      onClose,
      onApplyCrop,
      onApplyBlur,
      onRotateLeft,
      onRotateRight,
      onFlipHorizontal,
      onFlipVertical,
      onDownload,
    }),
    [
      images,
      selectedImage,
      paginatedImages,
      currentPage,
      totalPages,
      resizeDraft,
      addImages,
      removeImage,
      removeAllImages,
      selectImage,
      navigateImage,
      onNavigatePage,
      handleApplyResize,
      handleReset,
      onClose,
      onApplyCrop,
      onApplyBlur,
      onRotateLeft,
      onRotateRight,
      onFlipHorizontal,
      onFlipVertical,
      onDownload,
    ]
  );

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
};
