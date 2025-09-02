// app/components/photo-upload.tsx
// DEPRECATED: This component has been migrated to /routes/upload.tsx
// This file is kept for reference and will be removed in future versions
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useImageContext } from "../context/image-context";

/**
 * @deprecated This component has been migrated to /routes/upload.tsx
 * Use the /upload route instead
 */
export default function PhotoUpload() {
  console.warn(
    "PhotoUpload component is deprecated. Use /upload route instead."
  );
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files || files.length === 0) return;

    try {
      const imageDataArray = await Promise.all(
        Array.from(files).map(async (file) => {
          const url = URL.createObjectURL(file);
          const imageData = {
            id: crypto.randomUUID(),
            file: file,
            url,
            name: file.name,
            size: file.size,
            width: 0,
            height: 0,
            compressedSize: 0,
            compressedUrl: "",
            metadata: {
              originalSize: file.size,
              compressedSize: 0,
              compressionRatio: 0,
            },
          };
          return imageData;
        })
      );

      addImages(imageDataArray);
      navigate({ to: "/upload" });
    } catch (error) {
      console.error("Error processing images:", error);
    }
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    []
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
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    []
  );
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, []);

  const hasImages = images.length > 0;

  if (hasImages) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Computer Window Design */}
        <div className="w-full max-w-2xl rounded-xl p-1 text-sm bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
          <div className="flex gap-2 p-2">
            <span className="size-3 rounded-full bg-red-500"></span>
            <span className="size-3 rounded-full bg-yellow-500"></span>
            <span className="size-3 rounded-full bg-green-500"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Computer Window Design */}
      <div className="w-full max-w-2xl rounded-xl p-1 text-sm bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
        <div className="flex gap-2 p-2">
          <span className="size-3 rounded-full bg-red-500"></span>
          <span className="size-3 rounded-full bg-yellow-500"></span>
          <span className="size-3 rounded-full bg-green-500"></span>
        </div>
        <div className="bg-slate-900 dark:bg-black rounded-lg p-8">
          {/* Header Section */}
          <div className="flex flex-col items-center p-7 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-8">
            <div>
              <img
                className="size-32"
                alt="ImageHorse Logo"
                src="/Image-Horse-Logo.svg"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <span className="text-2xl font-medium text-white">
                ImageHorse
              </span>
              <span className="font-medium text-sky-400">
                Compress and Edit Multiple Images
              </span>
              <span className="flex gap-2 font-medium text-gray-400 mt-2">
                <span>v2.0</span>
                <span>·</span>
                <span>2025</span>
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-300">
              Upload Multiple Images for Editing and Compression
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50"
            } rounded-lg hover:bg-muted/70 transition-colors cursor-pointer mb-6`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-sky-400 mb-4" />
            <p className="text-sm text-gray-300 text-center">
              Drag and drop your images here, click to browse, or paste from
              clipboard
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Button */}
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 px-8 w-full"
          >
            Select Images
          </button>
        </div>
      </div>
    </div>
  );
}
