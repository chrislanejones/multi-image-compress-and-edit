import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { SimpleThemeToggle } from "./ui/theme-toggle";
import {
  X,
  Upload,
  ArrowLeft,
  Minus,
  Plus,
  Download,
  Settings,
  Trash2,
  Image as ImageIcon,
  Zap,
  Edit,
  Image,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
} from "lucide-react";

import {
  getGlobalImages,
  removeFromGlobalImages,
  clearGlobalImages,
  getGlobalImageById,
  getGlobalImageStats,
  getPaginatedImages,
  formatBytes,
  safeRevokeURL,
  type GlobalImage,
} from "../utils/image-utils";

// Highly optimized thumbnail component
const FastThumbnail = React.memo(
  ({
    image,
    isSelected,
    onClick,
    onRemove,
  }: {
    image: GlobalImage;
    isSelected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Use thumbnail if available, otherwise use compressed, otherwise original
    const imageUrl = image.thumbnail || image.compressed || image.url;

    return (
      <div
        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${
          isSelected
            ? "border-primary ring-2 ring-primary/50"
            : "border-border hover:border-primary/50"
        }`}
        onClick={onClick}
      >
        {/* Loading state */}
        {!isLoaded && !hasError && (
          <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* Image */}
        <img
          src={imageUrl}
          alt={image.file.name}
          className={`w-full h-full object-cover transition-opacity ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />

        {/* Compression indicator */}
        {image.compressed && (
          <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 text-xs rounded">
            <Zap className="w-3 h-3 inline" />
          </div>
        )}

        {/* Remove button */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Size reduction indicator */}
        {image.compressed && image.compressedSize && (
          <div className="absolute bottom-1 left-1 bg-black/75 text-white px-1 py-0.5 text-xs rounded">
            -
            {Math.round(
              ((image.originalSize - image.compressedSize) /
                image.originalSize) *
                100
            )}
            %
          </div>
        )}
      </div>
    );
  }
);

FastThumbnail.displayName = "FastThumbnail";

export default function ResizeAndOptimize() {
  const navigate = useNavigate();

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [, forceUpdate] = useState({}); // For forcing re-renders

  const imagesPerPage = 12;

  // Memoize expensive calculations
  const images = useMemo(() => getGlobalImages(), [forceUpdate]);
  const pageData = useMemo(
    () => getPaginatedImages(currentPage, imagesPerPage),
    [currentPage, images.length]
  );
  const stats = useMemo(() => getGlobalImageStats(), [images.length]);
  const selectedImage = useMemo(
    () => (selectedImageId ? getGlobalImageById(selectedImageId) : null),
    [selectedImageId, images.length]
  );

  // Set initial selection
  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id);
    }
  }, [images.length, selectedImageId]);

  const handleSelectImage = useCallback((image: GlobalImage) => {
    setSelectedImageId(image.id);
  }, []);

  const handleRemoveImage = useCallback(
    (imageId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const removedImage = removeFromGlobalImages(imageId);

      if (removedImage) {
        // Update selection if the removed image was selected
        if (selectedImageId === imageId) {
          const remainingImages = getGlobalImages();
          if (remainingImages.length > 0) {
            setSelectedImageId(remainingImages[0].id);
          } else {
            setSelectedImageId(null);
          }
        }

        // Force re-render
        forceUpdate({});
      }
    },
    [selectedImageId]
  );

  const handleRemoveAll = useCallback(() => {
    clearGlobalImages();
    setSelectedImageId(null);
    setCurrentPage(0);
    forceUpdate({});
  }, []);

  const handleNavigation = useCallback(
    (direction: "prev" | "next" | "prev10" | "next10") => {
      const images = getGlobalImages();
      if (images.length === 0 || !selectedImageId) return;

      const currentIndex = images.findIndex(
        (img: GlobalImage) => img.id === selectedImageId
      );
      let newIndex;

      switch (direction) {
        case "prev":
          newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          break;
        case "next":
          newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          break;
        case "prev10":
          newIndex = Math.max(0, currentIndex - 10);
          break;
        case "next10":
          newIndex = Math.min(images.length - 1, currentIndex + 10);
          break;
        default:
          return;
      }

      setSelectedImageId(images[newIndex].id);

      // Update page if needed
      const newPage = Math.floor(newIndex / imagesPerPage);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    },
    [selectedImageId, currentPage, imagesPerPage]
  );

  const handleZoom = useCallback((direction: "in" | "out") => {
    setZoom((prev) => {
      if (direction === "in") {
        return Math.min(400, prev + 25);
      } else {
        return Math.max(25, prev - 25);
      }
    });
  }, []);

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-20">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No images uploaded yet.</p>
          <Button onClick={() => navigate({ to: "/" })}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Gallery Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-4">
          {pageData.currentImages.map((image: GlobalImage) => (
            <FastThumbnail
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onClick={() => handleSelectImage(image)}
              onRemove={(e) => handleRemoveImage(image.id, e)}
            />
          ))}
        </div>

        {/* Streamlined Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-700 p-2 rounded-lg z-10 relative">
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => handleZoom("out")}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => handleZoom("in")}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Editor Mode Buttons */}
            <Button
              variant="outline"
              className="px-4 py-2 h-9"
              disabled
              data-testid="edit-image-button"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Image
            </Button>

            <Button
              variant="outline"
              className="px-4 py-2 h-9"
              disabled={images.length <= 1}
              title={
                images.length <= 1
                  ? `Bulk edit requires multiple images (currently ${images.length} image${images.length === 1 ? "" : "s"})`
                  : `Edit ${images.length} images at once`
              }
            >
              <Image className="mr-2 h-4 w-4" />
              Bulk Edit ({images.length})
            </Button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation("prev10")}
                disabled={images.length === 0}
                title="Back 10 images"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation("prev")}
                disabled={images.length === 0}
                title="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 text-white whitespace-nowrap">
                Switch Photos
              </span>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation("next")}
                disabled={images.length === 0}
                title="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation("next10")}
                disabled={images.length === 0}
                title="Forward 10 images"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="px-4 py-2 h-9"
              onClick={() => navigate({ to: "/" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
            <Button
              variant="destructive"
              className="px-4 py-2 h-9"
              onClick={handleRemoveAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove All
            </Button>

            {/* Theme Toggle */}
            <SimpleThemeToggle />

            {/* User Button */}
            <Button variant="outline" className="h-9 w-9" disabled>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      {selectedImage && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-center bg-muted rounded-lg"
              style={{ minHeight: "400px" }}
            >
              <img
                src={selectedImage.compressed || selectedImage.url}
                alt={selectedImage.file.name}
                className="max-w-full max-h-full object-contain rounded"
                style={{ transform: `scale(${zoom / 100})` }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Info */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Image Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Filename:
                </span>
                <p className="font-mono text-xs">{selectedImage.file.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Dimensions:
                </span>
                <p>
                  {selectedImage.width || "Unknown"} ×{" "}
                  {selectedImage.height || "Unknown"}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Original Size:
                </span>
                <p>{formatBytes(selectedImage.originalSize)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Compressed:
                </span>
                <p>
                  {formatBytes(
                    selectedImage.compressedSize || selectedImage.originalSize
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Savings:
                </span>
                <p className="text-green-600">
                  {selectedImage.compressedSize
                    ? `${Math.round(((selectedImage.originalSize - selectedImage.compressedSize) / selectedImage.originalSize) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Format:
                </span>
                <p>{selectedImage.file.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
