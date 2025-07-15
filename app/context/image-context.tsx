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
import { useEditorStore } from "@/store/editor-store";

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
  loadingImages: Set<string>;
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
  handleApplyResize: () => void;
  handleReset: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  removeAllImages: () => void;
  navigateImage: (direction: NavigationDirection) => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  onClose: () => void;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onFlipHorizontal: (id: string) => void;
  onFlipVertical: (id: string) => void;
  onReset: (id: string) => void;
  onApplyCrop: () => void;
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
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

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

      // Add new image IDs to loading state
      setLoadingImages((prev) => {
        const newSet = new Set(prev);
        newImages.forEach((img) => newSet.add(img.id));
        return newSet;
      });

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

  const onFlipHorizontal = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, flipHorizontal: !img.flipHorizontal }
          : img
      )
    );
  }, []);

  const onFlipVertical = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, flipVertical: !img.flipVertical }
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

  const handleApplyResize = useCallback(async () => {
    if (!selectedImage || !resizeDraft) return;

    try {
      // Create a canvas to apply the resize
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Get device pixel ratio for high DPI support
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Set canvas dimensions considering pixel density
      const displayWidth = resizeDraft.width;
      const displayHeight = resizeDraft.height;
      
      // Scale canvas for high DPI
      canvas.width = displayWidth * pixelRatio;
      canvas.height = displayHeight * pixelRatio;
      
      // Scale the canvas back down using CSS
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(pixelRatio, pixelRatio);

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Use advanced resizing algorithm for better quality
      if (displayWidth < img.naturalWidth || displayHeight < img.naturalHeight) {
        // Downscaling - use multiple passes for better quality
        const steps = Math.ceil(Math.log2(Math.max(
          img.naturalWidth / displayWidth,
          img.naturalHeight / displayHeight
        )));
        
        let currentCanvas = document.createElement("canvas");
        let currentCtx = currentCanvas.getContext("2d");
        let currentWidth = img.naturalWidth;
        let currentHeight = img.naturalHeight;
        
        // Initial setup
        currentCanvas.width = currentWidth;
        currentCanvas.height = currentHeight;
        currentCtx!.drawImage(img, 0, 0);
        
        // Progressive downscaling
        for (let i = 0; i < steps; i++) {
          const newWidth = Math.max(displayWidth, Math.ceil(currentWidth / 2));
          const newHeight = Math.max(displayHeight, Math.ceil(currentHeight / 2));
          
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = newWidth;
          tempCanvas.height = newHeight;
          
          tempCtx!.imageSmoothingEnabled = true;
          tempCtx!.imageSmoothingQuality = "high";
          tempCtx!.drawImage(currentCanvas, 0, 0, newWidth, newHeight);
          
          currentCanvas = tempCanvas;
          currentCtx = tempCtx;
          currentWidth = newWidth;
          currentHeight = newHeight;
          
          if (currentWidth === displayWidth && currentHeight === displayHeight) {
            break;
          }
        }
        
        // Final draw to target canvas
        ctx.drawImage(currentCanvas, 0, 0, displayWidth, displayHeight);
      } else {
        // Upscaling - direct draw with high quality
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      }

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const resizedUrl = URL.createObjectURL(blob);
      
      // Update the image with the new resized version
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: resizedUrl,
                width: resizeDraft.width,
                height: resizeDraft.height,
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
                resize: {
                  width: resizeDraft.width,
                  height: resizeDraft.height,
                },
              }
            : img
        )
      );

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== selectedImage.compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

    } catch (error) {
      console.error("Error applying resize:", error);
    }
  }, [selectedImage, resizeDraft]);

  const handleReset = useCallback(() => {
    if (!selectedImage) return;
    
    // Reset to original dimensions
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImage.id
          ? {
              ...img,
              resize: undefined,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
              crop: undefined,
            }
          : img
      )
    );
    
    setResizeDraft(null);
  }, [selectedImage]);

  const onResetImage = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              resize: undefined,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
              crop: undefined,
            }
          : img
      )
    );
  }, []);

  const onApplyCrop = useCallback(async () => {
    const completedCrop = useEditorStore.getState().completedCrop;
    const setEditorState = useEditorStore.getState().setEditorState;
    const resetCrop = useEditorStore.getState().resetCrop;
    
    if (!selectedImage || !completedCrop || !completedCrop.width || !completedCrop.height) {
      console.log("No crop data available");
      return;
    }

    try {
      // Create a canvas to apply the crop
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      // Calculate crop dimensions based on the unit
      let cropX, cropY, cropWidth, cropHeight;
      
      if (completedCrop.unit === '%') {
        // Convert percentage to pixels
        cropX = (completedCrop.x / 100) * img.naturalWidth;
        cropY = (completedCrop.y / 100) * img.naturalHeight;
        cropWidth = (completedCrop.width / 100) * img.naturalWidth;
        cropHeight = (completedCrop.height / 100) * img.naturalHeight;
      } else {
        // Already in pixels
        cropX = completedCrop.x;
        cropY = completedCrop.y;
        cropWidth = completedCrop.width;
        cropHeight = completedCrop.height;
      }
      
      // Set canvas dimensions to the crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const croppedUrl = URL.createObjectURL(blob);
      
      // Update the image with the cropped version
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: croppedUrl,
                width: Math.round(cropWidth),
                height: Math.round(cropHeight),
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
                crop: {
                  x: completedCrop.x,
                  y: completedCrop.y,
                  width: completedCrop.width,
                  height: completedCrop.height,
                },
              }
            : img
        )
      );

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== selectedImage.compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

      // Reset crop state and go back to resize mode
      resetCrop();
      setEditorState("resizeAndOptimize");

    } catch (error) {
      console.error("Error applying crop:", error);
    }
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

          // Remove from loading state once image is loaded
          setLoadingImages((prev) => {
            const newSet = new Set(prev);
            newSet.delete(img.id);
            return newSet;
          });
        };
        image.src = img.url;
      }
    });
  }, [images]);

  const onNavigatePage = useCallback(
    (direction: "prev" | "next") => {
      let newPage = currentPage;

      if (direction === "next" && currentPage < totalPages) {
        newPage = currentPage + 1;
      } else if (direction === "prev" && currentPage > 1) {
        newPage = currentPage - 1;
      }

      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        // Select the first image on the new page
        const start = (newPage - 1) * itemsPerPage;
        const firstImageOnPage = images[start];
        if (firstImageOnPage) {
          setSelectedImageId(firstImageOnPage.id);
        }
      }
    },
    [currentPage, totalPages, images, itemsPerPage]
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
      loadingImages,
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
      handleApplyResize,
      handleReset,
      setCurrentPage,
      setItemsPerPage,
      onRotateLeft: (id: string) => onRotate(id, -90),
      onRotateRight: (id: string) => onRotate(id, 90),
      onFlipHorizontal: (id: string) => onFlipHorizontal(id),
      onFlipVertical: (id: string) => onFlipVertical(id),
      onReset: (id: string) => onResetImage(id),
      onApplyCrop,
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
      loadingImages,
      onRemove,
      onSelect,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
      handleApplyResize,
      handleReset,
      onApplyCrop,
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
