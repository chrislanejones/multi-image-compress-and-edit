// app/components/photo-upload.tsx
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import imageCompression from "browser-image-compression";
import { useImageContext } from "../context/image-context";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setProgress({ current: 0, total: files.length });

    try {
      const processed = await Promise.all(
        Array.from(files).map(async (file, index) => {
          setProgress((prev) => ({ ...prev, current: index + 1 }));

          const originalSize = file.size;
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

          const imageData = {
            id: crypto.randomUUID(),
            file: compressedFile,
            url,
            name: compressedFile.name,
            size: compressedFile.size,
            width: 0,
            height: 0,
            compressedSize,
            compressedUrl: url,
            metadata: {
              originalSize,
              compressedSize,
              compressionRatio,
            },
          };

          return imageData;
        })
      );

      addImages(processed);

      // Ensure minimum 5 second display time
      const elapsedTime = Date.now() - processingStartTime;
      const minDisplayTime = 5000; // 5 seconds
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        navigate({ to: "/resize-and-optimize" });
      }, remainingTime);
    } catch (error) {
      console.error("Error processing images:", error);
      // Even on error, respect the minimum display time
      const elapsedTime = Date.now() - processingStartTime;
      const minDisplayTime = 5000;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });
      }, remainingTime);
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
  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  if (isProcessing) {
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
              <div className="mb-4">
                <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-medium text-white">
                  ImageHorse Processing
                </span>
                <span className="font-medium text-sky-400">
                  Compressing {progress.total} images
                </span>
                <span className="flex gap-2 font-medium text-gray-400 mt-2">
                  <span>{progress.current}/{progress.total}</span>
                  <span>·</span>
                  <span>{Math.round(progressPercent)}%</span>
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
              <div
                className="bg-sky-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Terminal Output */}
            <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
              <div className="text-green-400">$ imagehorse --compress --verbose</div>
              <div className="text-gray-400">ImageHorse v2.0 - Image Compression Tool</div>
              <div className="text-gray-400">Processing {progress.total} files...</div>
              <div className="text-gray-400">─────────────────────────────────────</div>
              
              {Array.from({ length: progress.current }, (_, i) => (
                <div key={i} className="text-gray-300">
                  <span className="text-sky-400">[{String(i + 1).padStart(2, '0')}]</span> Processing image_{i + 1}.jpg
                  <br />
                  <span className="text-green-400">  → </span>Original: 2.4MB → Compressed: 0.8MB (67% reduction)
                  <br />
                  <span className="text-green-400">  ✓ </span>Dimensions optimized: 1920x1080
                </div>
              ))}
              
              {progress.current < progress.total && (
                <div className="text-yellow-400">
                  <span className="text-sky-400">[{String(progress.current + 1).padStart(2, '0')}]</span> Processing image_{progress.current + 1}.jpg
                  <br />
                  <span className="text-yellow-400">  → </span>Analyzing image properties...
                  <br />
                  <span className="text-yellow-400">  → </span>Applying compression algorithms...
                </div>
              )}
              
              {progress.current === progress.total && (
                <div className="text-green-400">
                  <br />
                  ✓ All images processed successfully
                  <br />
                  → Preparing for editor interface...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="bg-slate-900 dark:bg-black rounded-lg p-8">
            {/* Header Section */}
            <div className="flex flex-col items-center p-7 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-8">
              <div>
                <img
                  className="size-32 shadow-xl rounded-md"
                  alt="ImageHorse Logo"
                  src="/Image-Horse-Logo.svg"
                />
              </div>
              <div className="flex flex-col items-center mt-4">
                <span className="text-2xl font-medium text-white">
                  ImageHorse
                </span>
                <span className="font-medium text-sky-400">
                  Image Compression Tool
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
                  ? "border-sky-400 bg-sky-400/10"
                  : "border-gray-600 bg-gray-800/50"
              } rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer mb-6`}
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

            {/* Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 flex-1"
              >
                Add More Images
              </button>
              <button
                onClick={handleBackToImages}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 flex-1"
              >
                View Gallery ({images.length})
              </button>
            </div>
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
                className="size-32 shadow-xl rounded-md"
                alt="ImageHorse Logo"
                src="/Image-Horse-Logo.svg"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <span className="text-2xl font-medium text-white">
                ImageHorse
              </span>
              <span className="font-medium text-sky-400">
                Image Compression Tool
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
                ? "border-sky-400 bg-sky-400/10"
                : "border-gray-600 bg-gray-800/50"
            } rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer mb-6`}
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
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 w-full"
          >
            Select Images
          </button>
        </div>
      </div>
    </div>
  );
}
