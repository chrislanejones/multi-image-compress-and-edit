import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import imageCompression from "browser-image-compression";

// Import your context (you'll need to create this)
import { useImageContext } from "../context/image-context";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    try {
      const processed = await Promise.all(
        Array.from(files).map(async (file, index) => {
          // Update progress
          setProgress((prev) => ({ ...prev, current: index + 1 }));

          const originalSize = file.size;

          // set your compression options as needed
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);
          const compressedSize = compressedFile.size;
          const compressionRatio = Math.round(
            ((originalSize - compressedSize) / originalSize) * 100
          );

          const url = URL.createObjectURL(compressedFile);

          return {
            id: crypto.randomUUID(),
            file: compressedFile,
            url,
            metadata: {
              originalSize,
              compressedSize,
              compressionRatio,
            },
          };
        })
      );

      addImages(processed);

      // Navigate to gallery after processing
      navigate({ to: "/resize-and-optimize" });
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    []
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBackToImages = useCallback(() => {
    navigate({ to: "/resize-and-optimize" });
  }, [navigate]);

  // Drag and drop handlers
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const hasImages = images.length > 0;
  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

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
            Upload Multiple Images for Smart Compression and Editing
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
              <div className="flex flex-col items-center w-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Processing images... ({progress.current}/{progress.total})
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-primary/60 mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  {isDragging
                    ? "Drop your images here!"
                    : "Drag and drop your images here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Supports JPEG, PNG, WebP • Max 50MB per image
                </p>
                <p className="text-xs text-primary/80 text-center mt-1 font-medium">
                  ✨ Auto-compression enabled
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleInputChange}
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
