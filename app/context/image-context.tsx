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
import { useEditorStore } from "../store/editor-store";
import { compressImageAggressively } from "../utils/image-processing";
import { toast } from "sonner";
import { ImageFile, IMAGES_PER_PAGE } from "../types/types";

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
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  navigateImage: (direction: "prev" | "next") => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  handleApplyResize: () => Promise<void>;
  handleReset: () => void;
  onClose: () => void;
  onApplyCrop?: () => void;
  onApplyBlur?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
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

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<
    Map<string, string>
  >(new Map());
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft | null>(null);

  const { format, compressionLevel } = useEditorStore.getState();

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

  useEffect(() => {
    if (selectedImage) {
      setResizeDraft({
        width: selectedImage.width || 0,
        height: selectedImage.height || 0,
      });
    } else {
      setResizeDraft(null);
    }
  }, [selectedImage]);

  const addImages = useCallback(
    (newImages: ImageFile[]) => {
      setImages((prev) => [...prev, ...newImages]);
      const newOriginals = new Map(originalImageUrls);
      newImages.forEach((img) => {
        newOriginals.set(img.id, img.url);
      });
      setOriginalImageUrls(newOriginals);
      if (!selectedImageId && newImages.length > 0) {
        setSelectedImageId(newImages[0].id);
      }
    },
    [selectedImageId, originalImageUrls]
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === id);
        const updatedImages = prev.filter((image) => image.id !== id);

        // Clean up the URL to prevent memory leaks
        if (imageToRemove?.url) {
          URL.revokeObjectURL(imageToRemove.url);
        }

        // Remove from original URLs map
        setOriginalImageUrls((prevUrls) => {
          const newUrls = new Map(prevUrls);
          newUrls.delete(id);
          return newUrls;
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

      // Show removal confirmation toast
      toast.success("Image removed", {
        description: "Image has been removed from the gallery.",
        duration: 2000,
      });
    },
    [selectedImageId]
  );

  // Add the removeAllImages function
  const removeAllImages = useCallback(() => {
    const imageCount = images.length;

    // Clean up all URLs to prevent memory leaks
    images.forEach((img) => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });

    // Clean up original URLs
    originalImageUrls.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

    // Reset all state
    setImages([]);
    setOriginalImageUrls(new Map());
    setSelectedImageId(null);
    setCurrentPage(0);
    setResizeDraft(null);

    // Show success message with better styling
    toast.success("All images removed", {
      description: `Successfully removed ${imageCount} images from the gallery.`,
      duration: 3000,
    });
  }, [images, originalImageUrls]);

  const updateImageUrl = useCallback(
    (
      id: string,
      newUrl: string,
      newMetadata: Partial<ImageFile["metadata"]>
    ) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) {
            return {
              ...img,
              url: newUrl,
              metadata: {
                ...img.metadata,
                ...newMetadata,
              } as ImageFile["metadata"],
            };
          }
          return img;
        })
      );
    },
    []
  );

  const handleReset = useCallback(() => {
    if (!selectedImage) return;
    const originalUrl = originalImageUrls.get(selectedImage.id);
    if (originalUrl && originalUrl !== selectedImage.url) {
      updateImageUrl(selectedImage.id, originalUrl, {
        compressedSize: selectedImage.metadata?.originalSize,
        compressionRatio: 0,
      });
      setResizeDraft({
        width: selectedImage.width || 0,
        height: selectedImage.height || 0,
      });

      toast.success("Image reset", {
        description: "Image has been restored to its original state.",
        duration: 2000,
      });
    }
  }, [selectedImage, originalImageUrls, updateImageUrl]);

  const handleApplyResize = useCallback(async () => {
    if (!selectedImage || !resizeDraft) return;
    const originalUrl =
      originalImageUrls.get(selectedImage.id) || selectedImage.url;

    // Show processing toast with better styling
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
      const savings =
        100 -
        (result.size / (selectedImage.metadata?.originalSize || result.size)) *
          100;

      updateImageUrl(selectedImage.id, result.url, {
        compressedSize: result.size,
        compressionRatio: Math.round(savings),
      });

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Compression Complete!", {
        description: `Saved ${Math.round(savings)}% • ${formatBytes(result.size)} total`,
        duration: 4000,
      });
    } catch (error) {
      // Dismiss loading toast and show error
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
    updateImageUrl,
    originalImageUrls,
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

  // Add navigation function to go back to upload
  const onClose = useCallback(() => {
    // This will be handled by the router navigation in the MainToolbar
    // but we can add any cleanup logic here if needed
  }, []);

  // Placeholder editing functions (these would be implemented for actual editing features)
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

  const onRotateLeft = useCallback(() => {
    toast.info("Rotate left", {
      description: "Rotation functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

  const onRotateRight = useCallback(() => {
    toast.info("Rotate right", {
      description: "Rotation functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

  const onFlipHorizontal = useCallback(() => {
    toast.info("Flip horizontal", {
      description: "Flip functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

  const onFlipVertical = useCallback(() => {
    toast.info("Flip vertical", {
      description: "Flip functionality will be implemented soon.",
      duration: 3000,
    });
  }, []);

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
      setResizeDraft,
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
