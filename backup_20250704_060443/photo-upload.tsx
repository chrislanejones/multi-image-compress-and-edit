// Ultra simple photo-upload.tsx - No complex dependencies!

import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useImageContext } from "../context/image-context";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files?.length) return;

    console.log(`📁 Processing ${files.length} files`);
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    const processedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Basic validation
      if (!file.type.startsWith("image/") || file.size > 50 * 1024 * 1024) {
        console.warn(`Skipping ${file.name}`);
        continue;
      }

      setProgress({ current: i + 1, total: files.length });

      try {
        // Create image object - SIMPLE!
        const imageObject = {
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file),
          originalSize: file.size,
          width: 0, // We'll get this later if needed
          height: 0,
          metadata: { originalSize: file.size },
        };

        processedImages.push(imageObject);
        console.log(`✅ Processed ${file.name}`);
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
      }
    }

    // Add to context
    if (processedImages.length > 0) {
      console.log(`🔄 Adding ${processedImages.length} images to context`);
      addImages(processedImages);

      // Wait a moment for state to update
      setTimeout(() => {
        console.log(`📊 Context now has ${images.length} images`);
        if (images.length > 0 || processedImages.length > 0) {
          console.log(`🧭 Navigating to gallery`);
          navigate({ to: "/resize-and-optimize" });
        }
      }, 100);
    }

    setIsProcessing(false);
    setTimeout(() => setProgress({ current: 0, total: 0 }), 1000);
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    []
  );

  const handleUploadClick = useCallback(() => {
    if (!isProcessing) fileInputRef.current?.click();
  }, [isProcessing]);

  const handleBackToImages = useCallback(() => {
    navigate({ to: "/resize-and-optimize" });
  }, [navigate]);

  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const isComplete = progress.current === progress.total && progress.total > 0;

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
          {/* Simple debug info */}
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            Context: {images.length} images
          </div>

          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all duration-300 rounded-lg border-primary/20 bg-primary/5 hover:bg-primary/10 ${
              isProcessing ? "opacity-75 pointer-events-none" : "cursor-pointer"
            }`}
            onClick={!isProcessing ? handleUploadClick : undefined}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-2">
                  {isComplete
                    ? "Complete!"
                    : `Processing... (${progress.current}/${progress.total})`}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${isComplete ? "bg-green-500" : "bg-primary"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(progressPercent)}% complete
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-primary/60 mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  Drag and drop your images here or click to browse
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Supports JPEG, PNG, WebP • Max 50MB per image
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
          {images.length > 0 ? (
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
                variant="outline"
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
