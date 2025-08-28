// app/components/photo-upload.tsx - Updated version with drag, drop, and paste
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, Zap, ArrowRight, Clipboard } from "lucide-react";
import {
  ComputerWindow,
  ComputerWindowHeader,
  ComputerWindowLogo,
  ComputerWindowTitle,
} from "./ui/computer-window";
import { Button } from "./ui/button";
import { useImageContext } from "../context/image-context";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addFiles, images } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert clipboard items to files
  const clipboardItemsToFiles = useCallback(
    async (clipboardItems: ClipboardItem[]): Promise<File[]> => {
      const files: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            try {
              const blob = await item.getType(type);
              // Generate a filename based on the current timestamp and type
              const extension = type.split("/")[1] || "png";
              const filename = `pasted-image-${Date.now()}.${extension}`;
              const file = new File([blob], filename, { type });
              files.push(file);
            } catch (error) {
              console.error("Error processing clipboard image:", error);
            }
          }
        }
      }

      return files;
    },
    []
  );

  // Handle paste events
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      e.preventDefault();

      if (!e.clipboardData) return;

      setIsPasting(true);

      try {
        // Try to get files from clipboard items (modern approach)
        if (e.clipboardData.items) {
          const items = Array.from(e.clipboardData.items);
          const imageFiles: File[] = [];

          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                // Generate a better filename
                const extension = file.type.split("/")[1] || "png";
                const filename = `pasted-image-${Date.now()}.${extension}`;
                const renamedFile = new File([file], filename, {
                  type: file.type,
                });
                imageFiles.push(renamedFile);
              }
            }
          }

          if (imageFiles.length > 0) {
            await addFiles(imageFiles);
            navigate({ to: "/processing" });
            return;
          }
        }

        // Fallback: try to get files from clipboard files
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
          const files = Array.from(e.clipboardData.files).filter((file) =>
            file.type.startsWith("image/")
          );

          if (files.length > 0) {
            await addFiles(files);
            navigate({ to: "/processing" });
            return;
          }
        }

        console.log("No image data found in clipboard");
      } catch (error) {
        console.error("Paste error:", error);
      } finally {
        setIsPasting(false);
      }
    },
    [addFiles, navigate]
  );

  // Set up global paste event listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only handle paste if we're not in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      handlePaste(e);
    };

    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [handlePaste]);

  // Show paste visual feedback
  useEffect(() => {
    if (isPasting) {
      const timer = setTimeout(() => setIsPasting(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPasting]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files || files.length === 0) return;

      try {
        // Convert FileList to File array and add to context
        const fileArray = Array.from(files);
        await addFiles(fileArray);

        // Navigate to processing page immediately after adding files
        navigate({ to: "/processing" });
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [addFiles, navigate]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleUploadClick = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleBackToImages = useCallback(
    () => navigate({ to: "/resize-and-optimize" }),
    [navigate]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
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
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const hasImages = images.length > 0;

  // Has images view - show option to add more or proceed
  if (hasImages) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ComputerWindow>
          <ComputerWindowHeader>
            <ComputerWindowLogo
              src="/Image-Horse-Logo.svg"
              alt="ImageHorse Logo"
            />
            <ComputerWindowTitle
              title="ImageHorse"
              subtitle="Ultra Core Web Vitals Image Optimizer"
            />
          </ComputerWindowHeader>

          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              You have {images.length} image{images.length !== 1 ? "s" : ""}{" "}
              ready for optimization
            </p>
            <p className="text-xs text-gray-400">
              Add more images or proceed to ultra-aggressive Core Web Vitals
              optimization
            </p>
          </div>

          {/* Upload Area with Drag, Drop and Paste */}
          <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? "border-sky-400 bg-sky-400/20 scale-105"
                : isPasting
                  ? "border-purple-400 bg-purple-400/20 scale-105"
                  : "border-gray-600 bg-gray-800/50"
            } rounded-lg hover:bg-gray-800/70 cursor-pointer mb-6`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isPasting ? (
              <Clipboard className="h-8 w-8 mb-2 text-purple-300 animate-pulse" />
            ) : (
              <Upload
                className={`h-8 w-8 mb-2 transition-colors ${isDragging ? "text-sky-300" : "text-sky-400"}`}
              />
            )}

            <p className="text-sm text-gray-300 text-center">
              {isPasting
                ? "Processing pasted image..."
                : isDragging
                  ? "Drop your images here!"
                  : "Add more images, drag & drop, or paste (Ctrl+V)"}
            </p>

            {isDragging && (
              <p className="text-xs text-sky-400 mt-1 animate-pulse">
                Release to add files
              </p>
            )}

            {isPasting && (
              <p className="text-xs text-purple-400 mt-1 animate-pulse">
                Processing clipboard image...
              </p>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Buttons using shadcn/ui styling */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="flex-1 h-12"
            >
              <Upload className="mr-2 h-4 w-4" />
              Add More
            </Button>

            <Button
              onClick={() => navigate({ to: "/processing" })}
              className="flex-2 h-12"
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="mr-2">Start ImageHorse Processing</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current images preview */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400 text-center">
              {images.length} image{images.length !== 1 ? "s" : ""} loaded •
              Ultra-aggressive compression ready
            </div>
          </div>
        </ComputerWindow>
      </div>
    );
  }

  // Initial upload view - no images yet
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ComputerWindow>
        <ComputerWindowHeader>
          <ComputerWindowLogo
            src="/Image-Horse-Logo.svg"
            alt="ImageHorse Logo"
          />
          <ComputerWindowTitle
            title="ImageHorse"
            subtitle="Ultra Core Web Vitals Image Optimizer"
          />
        </ComputerWindowHeader>

        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">
            Upload images for ultra-aggressive Core Web Vitals optimization
          </p>
          <p className="text-xs text-gray-400">
            Automatically compressed to achieve excellent performance scores
          </p>
        </div>

        {/* Main Upload Area with Enhanced Drag, Drop, and Paste */}
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-sky-400 bg-sky-400/20 scale-105 shadow-lg shadow-sky-400/25"
              : isPasting
                ? "border-purple-400 bg-purple-400/20 scale-105 shadow-lg shadow-purple-400/25"
                : "border-gray-600 bg-gray-800/50"
          } rounded-lg hover:bg-gray-800/70 hover:border-gray-500 cursor-pointer mb-6`}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isPasting ? (
            <Clipboard className="h-12 w-12 mb-4 text-purple-300 animate-bounce" />
          ) : (
            <Upload
              className={`h-12 w-12 mb-4 transition-all duration-300 ${
                isDragging ? "text-sky-300 scale-110" : "text-sky-400"
              }`}
            />
          )}

          <p
            className={`text-lg font-medium mb-2 transition-colors ${
              isPasting
                ? "text-purple-300"
                : isDragging
                  ? "text-sky-300"
                  : "text-white"
            }`}
          >
            {isPasting
              ? "Processing pasted image!"
              : isDragging
                ? "Drop your images here!"
                : "Drop your images here"}
          </p>

          <p className="text-sm text-gray-300 text-center mb-4">
            {isPasting
              ? "Image from clipboard is being processed..."
              : isDragging
                ? "Release to start processing"
                : "Drag and drop, click to browse, or paste images (Ctrl+V)"}
          </p>

          {isDragging && (
            <div className="text-xs text-sky-400 animate-pulse">
              🚀 Ready for ultra-aggressive optimization
            </div>
          )}

          {isPasting && (
            <div className="text-xs text-purple-400 animate-pulse">
              📋 Processing clipboard image...
            </div>
          )}

          {!isDragging && !isPasting && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>
                AVIF, WebP & JPEG • Ultra Core Web Vitals optimization
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* Button using shadcn/ui styling */}
        <Button onClick={handleUploadClick} className="w-full h-12">
          <Upload className="mr-2 h-4 w-4" />
          Select Images for Ultra Optimization
        </Button>

        {/* Features highlight */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 text-center mb-3">
            <strong className="text-white">ImageHorse Ultra Features:</strong>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Ultra-aggressive compression</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Core Web Vitals optimized</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>AVIF/WebP conversion</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Paste from clipboard (Ctrl+V)</span>
            </div>
          </div>
        </div>
      </ComputerWindow>
    </div>
  );
}
