import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

// Import from the combined utils module
import {
  addToGlobalImages,
  getGlobalImages,
  formatBytes,
  safeRevokeURL,
  compressImageAggressively,
  getMimeType,
  type GlobalImage,
} from "../utils/image-utils";

// Install: npm install browser-image-compression
// This provides web worker support for non-blocking compression
import imageCompression from "browser-image-compression";

export default function PhotoUpload() {
  const navigate = useNavigate();

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
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false,
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
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/jpeg",
          quality: 0.8,
          onProgress: (percent: number) => {
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

  // Optimized file processing
  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsProcessing(true);
      setProgress({ current: 0, total: files.length, percent: 0 });

      try {
        const validFiles = Array.from(files).filter((file) => {
          if (!file.type.startsWith("image/")) return false;
          if (file.size > 50 * 1024 * 1024) {
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

        const BATCH_SIZE = 1;
        const BATCH_DELAY = 10;
        const allProcessedImages: GlobalImage[] = [];

        for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
          const batch = validFiles.slice(i, i + BATCH_SIZE);

          const batchPromises = batch.map(async (file, batchIndex) => {
            const currentIndex = i + batchIndex + 1;
            setProgress((prev) => ({ ...prev, current: currentIndex }));

            try {
              const thumbnail = await createThumbnail(file);

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

          allProcessedImages.push(...validResults);

          if (i + BATCH_SIZE < validFiles.length) {
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
          }
        }

        // Add to global store using the utility function
        if (allProcessedImages.length > 0) {
          addToGlobalImages(allProcessedImages);
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
    [navigate, createThumbnail, compressWithWebWorker]
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

  // Use the utility function to check if images exist
  const hasImages = getGlobalImages().length > 0;

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
                View Gallery ({getGlobalImages().length})
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
