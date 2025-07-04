import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

// Import your existing utils
import {
  addToGlobalImages,
  getGlobalImages,
  formatBytes,
  safeRevokeURL,
  compressImageAggressively,
  getMimeType,
  type GlobalImage,
} from "../utils/image-utils";

// Import the ImageContext you already have
import { useImageContext } from "../context/image-context";

// Install: npm install browser-image-compression
// This provides web worker support for non-blocking compression
import imageCompression from "browser-image-compression";

export default function PhotoUpload() {
  const navigate = useNavigate();

  // Use your existing ImageContext instead of global state
  const { images, addImages } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percent: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimized thumbnail generation - smaller size and better performance
  const createThumbnail = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Use OffscreenCanvas if available for better performance
        const canvas =
          typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(100, 100)
            : document.createElement("canvas");

        const ctx = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false, // Performance optimization
        });

        if (!ctx) {
          resolve(URL.createObjectURL(file));
          return;
        }

        // Reduced thumbnail size for better performance - 100px max
        const MAX_SIZE = 100;
        const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Disable smoothing for speed
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob with lower quality for thumbnails
        if (canvas instanceof OffscreenCanvas) {
          canvas
            .convertToBlob({ type: "image/jpeg", quality: 0.5 })
            .then((blob) => resolve(URL.createObjectURL(blob)))
            .catch(() => resolve(URL.createObjectURL(file)));
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              } else {
                resolve(URL.createObjectURL(file));
              }
            },
            "image/jpeg",
            0.5
          );
        }
      };

      img.onerror = () => resolve(URL.createObjectURL(file));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Optimized web worker compression
  const compressWithWebWorker = useCallback(
    async (
      file: File
    ): Promise<{
      compressed: string;
      compressedSize: number;
    }> => {
      try {
        const options = {
          maxSizeMB: 1, // Target 1MB or less
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true, // Use web worker for non-blocking
          fileType: "image/jpeg",
          quality: 0.8,
          onProgress: (percent: number) => {
            // This runs in web worker, very smooth
            setProgress((prev) => ({ ...prev, percent }));
          },
        };

        const compressedFile = await imageCompression(file, options);
        const compressedUrl = URL.createObjectURL(compressedFile);

        return {
          compressed: compressedUrl,
          compressedSize: compressedFile.size,
        };
      } catch (error) {
        console.warn("Web worker compression failed, falling back:", error);
        // Fallback to your existing compression
        const result = await compressImageAggressively(
          URL.createObjectURL(file)
        );
        return {
          compressed: result.url,
          compressedSize: result.size,
        };
      }
    },
    []
  );

  // Optimized file processing with smaller batches and proper cleanup
  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsProcessing(true);
      setProgress({ current: 0, total: files.length, percent: 0 });

      try {
        const validFiles = Array.from(files).filter((file) => {
          // Quick validation
          if (!file.type.startsWith("image/")) return false;
          if (file.size > 50 * 1024 * 1024) {
            // 50MB limit
            console.warn(
              `File ${file.name} too large: ${formatBytes(file.size)}`
            );
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) {
          setIsProcessing(false);
          return;
        }

        // Smaller batches for better performance
        const BATCH_SIZE = 1; // Process one at a time for smoothest experience
        const BATCH_DELAY = 10; // Small delay between batches
        const allProcessedImages: any[] = [];

        for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
          const batch = validFiles.slice(i, i + BATCH_SIZE);

          const batchPromises = batch.map(async (file, batchIndex) => {
            const currentIndex = i + batchIndex + 1;
            setProgress((prev) => ({ ...prev, current: currentIndex }));

            try {
              // 1. Create thumbnail immediately (very fast)
              const thumbnail = await createThumbnail(file);

              // 2. Get image dimensions
              const img = new Image();
              const dimensions = await new Promise<{
                width: number;
                height: number;
              }>((resolve) => {
                img.onload = () =>
                  resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                img.onerror = () => resolve({ width: 0, height: 0 });
                img.src = URL.createObjectURL(file);
              });

              // 3. Compress in web worker (non-blocking)
              const { compressed, compressedSize } =
                await compressWithWebWorker(file);

              return {
                id: crypto.randomUUID(),
                file,
                url: URL.createObjectURL(file),
                thumbnail,
                compressed,
                originalSize: file.size,
                compressedSize,
                width: dimensions.width,
                height: dimensions.height,
              };
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(
            (result): result is NonNullable<typeof result> => result !== null
          );

          // Add valid results to our collection
          allProcessedImages.push(...validResults);

          // Yield to main thread for smoother UI
          if (i + BATCH_SIZE < validFiles.length) {
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
          }
        }

        // Add all processed images to ImageContext at once
        if (allProcessedImages.length > 0) {
          // Convert to the format expected by ImageContext
          const imageFiles = allProcessedImages.map((result) => ({
            id: result.id,
            file: result.file,
            url: result.url,
            thumbnail: result.thumbnail,
            compressed: result.compressed,
            compressedSize: result.compressedSize,
            originalSize: result.originalSize,
            width: result.width,
            height: result.height,
            metadata: {},
          }));

          // Add to ImageContext - you may need to adjust this based on your context implementation
          // If addImages expects FileList, you might need to handle this differently
          for (const imageFile of imageFiles) {
            // Create a DataTransfer to convert back to FileList format if needed
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(imageFile.file);
            await addImages(dataTransfer.files);
          }
        }

        // Navigate after all processing is complete
        navigate({ to: "/resize-and-optimize" });
      } catch (error) {
        console.error("Error processing images:", error);
      } finally {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0, percent: 0 });
      }
    },
    [navigate, createThumbnail, compressWithWebWorker, addImages]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(e.target.files);
    },
    [handleFileChange]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBackToImages = useCallback(() => {
    navigate({ to: "/resize-and-optimize" });
  }, [navigate]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files);
      }
    },
    [handleFileChange]
  );

  // Use ImageContext instead of global state
  const hasImages = images.length > 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any temporary URLs created during processing
      // The ImageContext will handle main image cleanup
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/50 p-4 rounded-full w-50 h-50 flex items-center justify-center mb-2">
            <img
              alt="Horse Icon"
              width="200"
              height="200"
              className="p-1 m-5"
              src="/Image-Horse-Logo.svg"
            />
          </div>
          <div className="font-semibold tracking-tight text-2xl">
            ImageHorse
          </div>
          <div className="text-sm text-muted-foreground">
            Upload Multiple Images for Editing and Compression
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer ${
              isDragging ? "bg-primary/15 border-primary/40" : ""
            } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
            onClick={!isProcessing ? handleUploadClick : undefined}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Processing images... ({progress.current}/{progress.total})
                </p>
                {progress.percent > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-primary/60 mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  {isDragging
                    ? "Drop your images here!"
                    : "Drag and drop your images here, click to browse, or paste from clipboard"}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Supports JPEG, PNG, WebP, BMP • Max 50MB per image
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            multiple
            accept="image/*"
            className="hidden"
            disabled={isProcessing}
          />
        </CardContent>

        <CardFooter>
          {hasImages ? (
            <div className="flex gap-4 w-full">
              <Button
                onClick={handleUploadClick}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Add More Images"}
              </Button>
              <Button
                onClick={handleBackToImages}
                className="flex-1"
                disabled={isProcessing}
              >
                View Gallery ({images.length})
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleUploadClick}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing
                ? `Processing ${progress.current}/${progress.total}...`
                : "Select Images"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
