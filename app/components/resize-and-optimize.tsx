import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { ThemeToggle } from "./ui/theme-toggle";
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
  Home,
} from "lucide-react";

import { useImageContext } from "../context/image-context";
import { formatBytes } from "../utils/image-utils";
import { ImageEditorToolbar } from "./image-editor-toolbar";

// Gallery thumbnail with popup effect and clean compression indicator
const FastThumbnail = React.memo(
  ({
    image,
    isSelected,
    onClick,
    onRemove,
    forceUpdate,
  }: {
    image: any; // Using any for compatibility with both ImageFile and GlobalImage
    isSelected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
    forceUpdate: (obj: {}) => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [hasAppeared, setHasAppeared] = useState(false);
    const [compressionAttempted, setCompressionAttempted] = useState(false);

    // Reset compression state if image already has compressed data
    useEffect(() => {
      const compressedSize =
        image.metadata?.compressedSize || image.compressedSize;
      if (compressedSize) {
        console.log(
          `Image ${image.file?.name} already has compression data: ${compressedSize} bytes`
        );
        setIsCompressing(false);
        setCompressionAttempted(true);
      }
    }, [
      image.metadata?.compressedSize,
      image.compressedSize,
      image.file?.name,
    ]);

    // Compress image when component mounts if not already compressed
    useEffect(() => {
      const compressedSize =
        image.metadata?.compressedSize || image.compressedSize;
      const fileName = image.file?.name || "unknown";

      // Always log current state
      console.log(
        `Image ${fileName}: compressedSize=${compressedSize}, isCompressing=${isCompressing}, attempted=${compressionAttempted}`
      );

      if (
        !compressedSize &&
        !isCompressing &&
        !compressionAttempted &&
        image.file
      ) {
        console.log(`Starting compression for ${fileName}`);
        setIsCompressing(true);
        setCompressionAttempted(true);

        // Import the compression function dynamically
        import("../utils/image-utils").then(({ aggressiveCompress300KB }) => {
          aggressiveCompress300KB(image.file)
            .then(({ compressed, compressedSize: newCompressedSize }) => {
              console.log(
                "✅ Compression complete for",
                fileName,
                "->",
                newCompressedSize,
                "bytes"
              );

              // Update the image metadata (this would need to be handled by context)
              if (image.metadata) {
                image.metadata.compressedSize = newCompressedSize;
                image.metadata.compressionRatio = Math.round(
                  ((image.metadata.originalSize - newCompressedSize) /
                    image.metadata.originalSize) *
                    100
                );
              }

              setIsCompressing(false);
              // Force a re-render by updating the forceUpdate in parent
              forceUpdate({});
            })
            .catch((error) => {
              console.error("❌ Compression failed:", error);
              setIsCompressing(false);
            });
        });
      } else if (compressedSize) {
        console.log(
          `⚡ Image ${fileName} already compressed: ${compressedSize} bytes`
        );
      }
    }, [
      image.id,
      image.metadata?.compressedSize,
      image.compressedSize,
      isCompressing,
      compressionAttempted,
      image.file?.name,
      image.file,
      forceUpdate,
    ]);

    // Popup effect when component mounts
    useEffect(() => {
      const timer = setTimeout(() => {
        setHasAppeared(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Force clear blur after timeout as fallback
    useEffect(() => {
      if (isCompressing) {
        const fallbackTimer = setTimeout(() => {
          console.log("Fallback: Clearing blur for", image.file?.name);
          setIsCompressing(false);
        }, 10000); // 10 second fallback

        return () => clearTimeout(fallbackTimer);
      }
    }, [isCompressing, image.file?.name]);

    // Use thumbnail if available, otherwise use compressed, otherwise original
    const imageUrl = image.thumbnail || image.compressed || image.url;

    // Determine if we should show blur (only if actively compressing)
    const shouldBlur =
      isCompressing &&
      !(image.metadata?.compressedSize || image.compressedSize);

    return (
      <div
        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all duration-500 transform ${
          hasAppeared ? "scale-100 opacity-100" : "scale-75 opacity-0"
        } ${
          isSelected
            ? "border-primary ring-2 ring-primary/50"
            : "border-border hover:border-primary/50"
        }`}
        onClick={onClick}
      >
        {/* Image with conditional blur effect */}
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={image.file?.name || "Uploaded image"}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${shouldBlur ? "blur-md scale-105" : "blur-0 scale-100"}`}
            style={{
              imageRendering: "auto",
            }}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

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

        {/* Clean compression indicator - show if we have compression data */}
        {(() => {
          const originalSize =
            image.metadata?.originalSize || image.originalSize;
          const compressedSize =
            image.metadata?.compressedSize || image.compressedSize;
          const hasCompressedSize = !!compressedSize;
          const isDifferentSize =
            compressedSize && compressedSize !== originalSize;
          const shouldShow = hasCompressedSize && isDifferentSize;

          // Debug logging
          console.log(
            `Pill for ${image.file?.name}: compressedSize=${compressedSize}, originalSize=${originalSize}, shouldShow=${shouldShow}`
          );

          return shouldShow && compressedSize && originalSize ? (
            <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-white text-xs font-medium">
                {Math.round(
                  ((originalSize - compressedSize) / originalSize) * 100
                )}
                %
              </span>
            </div>
          ) : null;
        })()}
      </div>
    );
  }
);

FastThumbnail.displayName = "FastThumbnail";

export default function ResizeAndOptimize() {
  const navigate = useNavigate();
  const { images, selectedImage, selectImage, removeImage, removeAllImages } =
    useImageContext();

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [editorState, setEditorState] = useState<
    "resizeAndOptimize" | "editImage" | "bulkImageEdit"
  >("resizeAndOptimize");
  const [, forceUpdate] = useState({}); // For forcing re-renders

  const imagesPerPage = 10;

  // Pagination logic
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(images.length / imagesPerPage);
    const startIndex = currentPage * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const currentImages = images.slice(startIndex, endIndex);

    return {
      currentImages,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0,
    };
  }, [images, currentPage, imagesPerPage]);

  const handleSelectImage = useCallback(
    (image: any) => {
      selectImage(image);
    },
    [selectImage]
  );

  const handleRemoveImage = useCallback(
    (imageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      removeImage(imageId);
    },
    [removeImage]
  );

  const handleNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedImage || images.length === 0) return;

      const currentIndex = images.findIndex(
        (img) => img.id === selectedImage.id
      );
      let newIndex;

      switch (direction) {
        case "prev":
          newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          break;
        case "next":
          newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          break;
        default:
          return;
      }

      selectImage(images[newIndex]);

      // Update page if needed
      const newPage = Math.floor(newIndex / imagesPerPage);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    },
    [selectedImage, images, selectImage, currentPage, imagesPerPage]
  );

  const handlePageNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev" && paginatedData.hasPrevPage) {
        setCurrentPage((prev) => prev - 1);
      } else if (direction === "next" && paginatedData.hasNextPage) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    [paginatedData.hasPrevPage, paginatedData.hasNextPage]
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

  // Toolbar handlers
  const handleZoomIn = useCallback(() => handleZoom("in"), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom("out"), [handleZoom]);

  const handleStateChange = useCallback(
    (newState: "resizeAndOptimize" | "editImage" | "bulkImageEdit") => {
      setEditorState(newState);
    },
    []
  );

  const handleClose = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const handleNavigateImage = useCallback(
    (direction: "prev" | "next") => {
      handleNavigation(direction);
    },
    [handleNavigation]
  );

  // Set up countdown for no images
  useEffect(() => {
    if (images.length === 0) {
      // Start 3-second countdown
      setCountdown(3);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            navigate({ to: "/" });
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(null); // Reset countdown if images are found
    }
  }, [images.length, navigate]);

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No images uploaded yet
          </h2>
          <p className="text-gray-500 mb-6">
            You need to upload some images first before you can edit them.
          </p>

          {countdown !== null && (
            <div className="mb-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {countdown}
              </div>
              <p className="text-sm text-gray-500">
                Redirecting to upload page in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={() => navigate({ to: "/" })} size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to Upload Now
            </Button>
            <div>
              <Button
                variant="outline"
                onClick={() => setCountdown(null)}
                className="text-sm"
              >
                Cancel Auto-redirect
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No images uploaded yet
          </h2>
          <p className="text-gray-500 mb-6">
            You need to upload some images first before you can edit them.
          </p>
          <Button onClick={() => navigate({ to: "/" })} size="lg">
            <Home className="mr-2 h-4 w-4" />
            Go to Upload Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Gallery Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg mb-6">
          {paginatedData.currentImages.map((img, index) => (
            <FastThumbnail
              key={img.id}
              image={img}
              isSelected={selectedImage?.id === img.id}
              onClick={() => handleSelectImage(img)}
              onRemove={(e) => {
                e.stopPropagation();
                handleRemoveImage(img.id, e);
              }}
              forceUpdate={forceUpdate}
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

            <Button
              variant="outline"
              className="px-4 py-2 h-9"
              disabled
              title="AI-powered editing features coming soon"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Editor
            </Button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handlePageNavigation("prev")}
                disabled={!paginatedData.hasPrevPage}
                title="Show previous 10 images"
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
                Switch Photos ({currentPage + 1}/{paginatedData.totalPages})
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
                onClick={() => handlePageNavigation("next")}
                disabled={!paginatedData.hasNextPage}
                title="Show next 10 images"
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
              onClick={removeAllImages}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove All
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

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
                src={selectedImage.url}
                alt={selectedImage.file?.name || "Selected image"}
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
                <p className="font-mono text-xs">
                  {selectedImage.file?.name || "Unknown"}
                </p>
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
                <p>
                  {formatBytes(
                    selectedImage.metadata?.originalSize ||
                      selectedImage.file?.size ||
                      0
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Compressed:
                </span>
                <p>
                  {formatBytes(
                    selectedImage.metadata?.compressedSize ||
                      selectedImage.file?.size ||
                      0
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Savings:
                </span>
                <p className="text-green-600">
                  {selectedImage.metadata?.compressionRatio || 0}%
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Format:
                </span>
                <p>{selectedImage.file?.type || "Unknown"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
