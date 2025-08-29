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
import type { ImageFile, ResizeDraft, NavigationDirection, FullImageContextType } from "@/types/types";
import { 
  useAppStateStore,
  useCropStore,
  useBlurStore,
  usePaintStore,
  useCompressionStore
} from "@/stores";
import { compressBestForCWVFromURL, calculateCoreWebVitalsScore } from "@/utils/core-web-vitals";

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

  const updateImage = useCallback((id: string, updates: Partial<ImageFile>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  }, []);

  const onRemove = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedImageId === id) setSelectedImageId(null);
    },
    [selectedImageId]
  );

  const onSelect = useCallback(
    async (id: string | null) => {
      setSelectedImageId(id);
      
      // Trigger Core Web Vitals compression when image is selected
      if (id) {
        const compressionStore = useCompressionStore.getState();
        const image = images.find(img => img.id === id);
        
        if (image && compressionStore.coreWebVitalsEnabled && 
            !compressionStore.compressedImages.has(id) && 
            !compressionStore.isCompressing(id)) {
          
          try {
            // Start compression tracking
            compressionStore.startCompressing(id);
            
            // Store original data before compression
            const originalData = {
              url: image.url,
              size: image.size,
              metadata: image.metadata
            };
            
            // Compress with Core Web Vitals optimization
            const result = await compressBestForCWVFromURL(image.url, 1400);
            const compressedUrl = URL.createObjectURL(result.blob);
            const compressionRatio = Math.round(
              Math.max(0, 1 - result.bytes / image.size) * 100
            );

            // Update image with compressed version
            updateImage(id, {
              compressedUrl,
              compressedSize: result.bytes,
              metadata: {
                ...image.metadata,
                originalSize: image.size,
                compressedSize: result.bytes,
                compressionRatio,
                coreWebVitalsScore: result.coreWebVitalsScore,
                codec: result.codec,
                quality: result.quality,
                bpp: +result.bpp.toFixed(3),
                width: result.width,
                height: result.height,
                boltTier: result.boltTier,
              },
            });

            // Track compressed image
            compressionStore.addCompressedImage(id, originalData);
            
            console.log(
              `✅ CWV Compressed ${image.name}: ${result.coreWebVitalsScore} score, ${Math.round(result.bytes / 1024)}KB`
            );
          } catch (error) {
            console.warn("Core Web Vitals compression failed:", image?.name, error);
          } finally {
            compressionStore.stopCompressing(id);
          }
        }
      }
    },
    [images, updateImage]
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
    const completedCrop = useCropStore.getState().completedCrop;
    const setEditorState = useAppStateStore.getState().setEditorState;
    const resetCrop = useCropStore.getState().resetCrop;
    
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

  const onApplyBlur = useCallback(async () => {
    const blurBrushStrokes = useBlurStore.getState().blurBrushStrokes;
    const clearBlurStrokes = useBlurStore.getState().clearBlurStrokes;
    const setEditorState = useAppStateStore.getState().setEditorState;
    
    if (!selectedImage || blurBrushStrokes.length === 0) {
      console.log("No blur strokes to apply");
      return;
    }

    try {
      // Create a canvas to apply the blur
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

      // Set canvas dimensions to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply each blur stroke
      for (const stroke of blurBrushStrokes) {
        // Create a temporary canvas for the blurred version
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) continue;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Draw the original image with blur filter
        tempCtx.filter = `blur(${stroke.blurAmount}px)`;
        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = "none";

        // Create a mask for the stroke path
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        
        // Draw the brush stroke path
        if (stroke.points.length === 1) {
          // Single point - draw a circle
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.brushSize / 2, 0, Math.PI * 2);
        } else {
          // Multiple points - draw connected strokes
          for (let i = 0; i < stroke.points.length; i++) {
            const point = stroke.points[i];
            ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2);
          }
        }
        
        ctx.clip();
        
        // Draw the blurred image only within the clipped area
        ctx.drawImage(tempCanvas, 0, 0);
        
        ctx.restore();
      }

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const blurredUrl = URL.createObjectURL(blob);
      
      // Update the image with the blurred version
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: blurredUrl,
                width: img.width,
                height: img.height,
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
              }
            : img
        )
      );

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== selectedImage.compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

      // Clear blur strokes and go back to edit mode
      clearBlurStrokes();
      setEditorState("editImage");

    } catch (error) {
      console.error("Error applying blur:", error);
    }
  }, [selectedImage]);

  const onApplyPaint = useCallback(async () => {
    const paintStrokes = usePaintStore.getState().paintStrokes;
    const shapes = usePaintStore.getState().shapes;
    const clearPaintStrokes = usePaintStore.getState().clearPaintStrokes;
    const clearShapes = usePaintStore.getState().clearShapes;
    const setEditorState = useAppStateStore.getState().setEditorState;
    
    const hasStrokes = paintStrokes.length > 0;
    const hasShapes = shapes.length > 0;
    
    if (!selectedImage || (!hasStrokes && !hasShapes)) {
      console.log("Nothing to apply");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Draw freehand strokes (paint + eraser)
      for (const stroke of paintStrokes) {
        if (stroke.points.length === 0) continue;

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }

      // Draw shapes (emoji + arrows)
      for (const shape of shapes) {
        if (shape.type === "emoji") {
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.font =
            `${shape.size}px system-ui, apple color emoji, ` +
            `segoe ui emoji, sans-serif`;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(shape.text, shape.x, shape.y);
          ctx.restore();
        } else if (shape.type === "arrow") {
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = shape.color;
          ctx.fillStyle = shape.color;
          ctx.lineWidth = shape.width;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          // shaft
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();

          // head(s)
          drawArrowhead(
            ctx,
            shape.x1,
            shape.y1,
            shape.x2,
            shape.y2,
            shape.width
          );
          if (shape.double) {
            drawArrowhead(
              ctx,
              shape.x2,
              shape.y2,
              shape.x1,
              shape.y1,
              shape.width
            );
          }
          ctx.restore();
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/png",
          1.0
        );
      });

      const paintedUrl = URL.createObjectURL(blob);

      // Update the image using context method
      updateImage(selectedImage.id, {
        url: paintedUrl,
        file: new File([blob], selectedImage.file.name, { type: blob.type }),
        size: blob.size,
      });

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== selectedImage.compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

      // Clear paint strokes and shapes, go back to edit mode
      clearPaintStrokes();
      clearShapes();
      setEditorState("editImage");

    } catch (error) {
      console.error("Error applying paint:", error);
    }
  }, [selectedImage, updateImage]);

  const onApplyText = useCallback(async () => {
    // For text tool, we don't need to implement the actual text rendering here
    // because the TextTool component handles its own rendering and calls onApplyText
    // from the route with the already-rendered image URL
    const setEditorState = useAppStateStore.getState().setEditorState;
    setEditorState("editImage");
  }, []);

  // Reset Compression function to restore original image
  const resetCompression = useCallback((id: string) => {
    const compressionStore = useCompressionStore.getState();
    const originalData = compressionStore.resetCompression(id);
    
    if (originalData) {
      // Restore original image data
      updateImage(id, {
        compressedUrl: undefined,
        compressedSize: undefined,
        metadata: {
          ...originalData.metadata,
          coreWebVitalsScore: calculateCoreWebVitalsScore(
            originalData.metadata?.width || 0,
            originalData.metadata?.height || 0,
            originalData.size
          ),
        },
      });
      
      console.log(`🔄 Compression reset for image ${id}`);
    }
  }, [updateImage]);

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
      updateImage,
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
      onApplyBlur,
      onApplyPaint,
      onApplyText,
      resetCompression,
      addImages: (newImages: ImageFile[]) => {
        console.log('addImages called with:', newImages.length, 'images');
        console.log('Previous images count:', images.length);
        setImages((prev) => {
          const updated = [...prev, ...newImages];
          console.log('Updated images count:', updated.length);
          return updated;
        });
      },
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
      updateImage,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
      handleApplyResize,
      handleReset,
      onApplyCrop,
      onApplyBlur,
      onApplyPaint,
      onApplyText,
      resetCompression,
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

// Helper function for drawing arrowheads
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = Math.max(10, width * 3);
  const a1 = angle - Math.PI / 7;
  const a2 = angle + Math.PI / 7;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(a1), y2 - headLen * Math.sin(a1));
  ctx.lineTo(x2 - headLen * Math.cos(a2), y2 - headLen * Math.sin(a2));
  ctx.closePath();
  ctx.fill();
}
