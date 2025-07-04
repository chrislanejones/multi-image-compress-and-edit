// app/components/resize-and-optimize.tsx - Step 3: With smart toolbar integration
import React, { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageEditorToolbar } from "./image-editor-toolbar";
import {
  Upload,
  X,
  Eye,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
} from "lucide-react";
import { CompressionSidebar } from "./CompressionSidebar";

// Simple Label component
const Label: React.FC<{
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ htmlFor, className = "", children }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
  >
    {children}
  </label>
);

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Simple compression function
const compressImage = async (
  file: File,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

interface ProcessedImage {
  id: string;
  file: File;
  url: string;
  thumbnail?: string;
  compressed?: {
    file: File;
    url: string;
    compressionRatio: number;
    quality: number;
  };
  metadata: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

export default function ResizeAndOptimize() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<
    "gallery" | "edit" | "crop" | "blur" | "paint" | "text"
  >("gallery");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const imagesPerPage = 12;
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  // Create thumbnail
  const createThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Get image metadata
  const getImageMetadata = useCallback(
    (
      file: File
    ): Promise<{
      width: number;
      height: number;
      size: number;
      type: string;
    }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
            type: file.type,
          });
        };
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      setIsUploading(true);

      try {
        const newImages: ProcessedImage[] = [];

        for (const file of files.slice(0, 5)) {
          // Limit to 5 files
          const [thumbnail, metadata] = await Promise.all([
            createThumbnail(file),
            getImageMetadata(file),
          ]);

          const processedImage: ProcessedImage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file),
            thumbnail,
            metadata,
          };

          newImages.push(processedImage);
        }

        setImages((prev) => [...prev, ...newImages]);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
        // Reset the input
        event.target.value = "";
      }
    },
    [createThumbnail, getImageMetadata]
  );

  // Remove image
  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== id);
        // Reset selection if removed image was selected
        if (selectedImageIndex !== null) {
          const selectedImage = prev[selectedImageIndex];
          if (selectedImage?.id === id) {
            setSelectedImageIndex(null);
            setMode("gallery");
          }
        }
        return updated;
      });
    },
    [selectedImageIndex]
  );

  // Toolbar event handlers
  const handleModeChange = useCallback(
    (newMode: "gallery" | "edit" | "crop" | "blur" | "paint" | "text") => {
      setMode(newMode);
      if (newMode === "gallery") {
        setSelectedImageIndex(null);
        setZoomLevel(1);
      }
    },
    []
  );

  const handleImageNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (selectedImageIndex === null) return;

      const newIndex =
        direction === "prev"
          ? Math.max(0, selectedImageIndex - 1)
          : Math.min(images.length - 1, selectedImageIndex + 1);

      setSelectedImageIndex(newIndex);
    },
    [selectedImageIndex, images.length]
  );

  const handlePageNavigation = useCallback(
    (direction: "prev" | "next") => {
      const newPage =
        direction === "prev"
          ? Math.max(1, currentPage - 1)
          : Math.min(totalPages, currentPage + 1);

      setCurrentPage(newPage);
    },
    [currentPage, totalPages]
  );

  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);

  const handleToolAction = useCallback((action: string) => {
    console.log(`Tool action: ${action}`);
    // TODO: Implement actual tool functionality
  }, []);

  const handleBulkAction = useCallback((action: "compress" | "download") => {
    console.log(`Bulk action: ${action}`);
    // TODO: Implement bulk operations
  }, []);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    // TODO: Implement theme switching
  }, []);

  // Select image for editing
  const selectImageForEdit = useCallback(
    (index: number) => {
      const actualIndex = startIndex + index;
      setSelectedImageIndex(actualIndex);
      setMode("edit");
      setZoomLevel(1);
    },
    [startIndex]
  );

  // Get selected image
  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : null;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Toolbar */}
      <ImageEditorToolbar
        mode={mode}
        currentImageIndex={selectedImageIndex || 0}
        totalImages={images.length}
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        onModeChange={handleModeChange}
        onImageNavigation={handleImageNavigation}
        onPageNavigation={handlePageNavigation}
        onZoomChange={handleZoomChange}
        onToolAction={handleToolAction}
        onBulkAction={handleBulkAction}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />

      <div className="flex h-[calc(100vh-73px)]">
        {" "}
        {/* Adjust for toolbar height */}
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {mode === "gallery" ? (
            // Gallery View
            <div className="space-y-6">
              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Click to upload images
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PNG, JPG up to 10MB (max 5 files)
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Gallery */}
              {images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Image Gallery ({images.length} images)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentImages.map((image, index) => (
                        <div key={image.id} className="group relative">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <img
                              src={image.thumbnail || image.url}
                              alt={`Image ${startIndex + index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => selectImageForEdit(index)}
                              loading="lazy"
                            />
                          </div>

                          {/* Image Info Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => selectImageForEdit(index)}
                                className="bg-white/90 hover:bg-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => removeImage(image.id)}
                                className="bg-red-500/90 hover:bg-red-500 text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Image Details */}
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <p className="font-medium truncate">
                              {image.file.name}
                            </p>
                            <p>
                              {image.metadata.width} × {image.metadata.height}
                            </p>
                            <p>{formatBytes(image.metadata.size)}</p>
                            {image.compressed && (
                              <p className="text-green-600 dark:text-green-400">
                                Compressed (
                                {Math.round(
                                  image.compressed.compressionRatio * 100
                                )}
                                %)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Edit View
            selectedImage && (
              <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div
                  className="relative max-w-full max-h-full overflow-auto"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.file.name}
                    className="max-w-full max-h-full object-contain"
                  />

                  {/* Edit Mode Overlay */}
                  {mode !== "edit" && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded">
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium capitalize">
                        {mode} Mode
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        {/* Compression Sidebar (only in gallery mode) */}
        {mode === "gallery" && images.length > 0 && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700">
            <CompressionSidebar images={images} onImagesUpdate={setImages} />
          </div>
        )}
      </div>
    </div>
  );
}
