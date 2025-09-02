"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useImageContext } from "../context/image-context";
import { useCompressionStore, useImageStore } from "../stores";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Maximize2,
  Download,
  Image as ImgIcon,
  RefreshCw,
  RotateCcw,
  Archive,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { COMPRESSION_LEVELS } from "../constants/editorConstants";
import type { ImageFormat, CoreWebVitalsScore } from "../types/types";
import { calculateCoreWebVitalsScore } from "../utils/core-web-vitals";

// Note: Using Core Web Vitals thresholds from utils/core-web-vitals.ts

export default function ImageResizer() {
  const {
    selectedImage,
    resizeDraft,
    setResizeDraft,
    handleApplyResize,
    handleReset,
    resetCompression,
  } = useImageContext();
  const {
    quality,
    format,
    compressionLevel,
    setQuality,
    setFormat,
    setCompressionLevel,
    resetToDefaults: resetEditorUI,
  } = useCompressionStore();
  const { images, resetImage: resetSingleImage } = useImageStore();

  // Local state for sliders and image dimensions
  const [localWidth, setLocalWidth] = useState(0);
  const [localHeight, setLocalHeight] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [aspectRatio, setAspectRatio] = useState(true);
  const [coreWebVitalsScore, setCoreWebVitalsScore] =
    useState<CoreWebVitalsScore>("good");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);

  // Get image dimensions by loading the image
  const loadImageDimensions = useCallback(
    async (imageUrl: string) => {
      setIsLoadingDimensions(true);
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageUrl;
        });

        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        setImageDimensions(dimensions);

        // Initialize local state with actual dimensions
        setLocalWidth(dimensions.width);
        setLocalHeight(dimensions.height);

        // Update the resize draft
        setResizeDraft(dimensions);

        return dimensions;
      } catch (error) {
        console.error("Error loading image dimensions:", error);
        // Fallback dimensions
        const fallback = { width: 800, height: 600 };
        setImageDimensions(fallback);
        setLocalWidth(fallback.width);
        setLocalHeight(fallback.height);
        setResizeDraft(fallback);
        return fallback;
      } finally {
        setIsLoadingDimensions(false);
      }
    },
    [setResizeDraft]
  );

  // Load dimensions when image changes
  useEffect(() => {
    if (selectedImage?.url) {
      loadImageDimensions(selectedImage.url);
    }
  }, [selectedImage?.url, loadImageDimensions]);

  // Initialize from resize draft if available
  useEffect(() => {
    if (resizeDraft && resizeDraft.width > 0 && resizeDraft.height > 0) {
      setLocalWidth(resizeDraft.width);
      setLocalHeight(resizeDraft.height);
    }
  }, [resizeDraft]);

  // Calculate Core Web Vitals score using proper utility function with file size
  const updateCoreWebVitalsScore = useCallback(
    (width: number, height: number, fileSize?: number) => {
      // If no file size provided, estimate based on dimensions for uncompressed image
      const estimatedFileSize = fileSize || width * height * 3; // Rough estimate for uncompressed RGB
      
      const score = calculateCoreWebVitalsScore(width, height, estimatedFileSize);
      setCoreWebVitalsScore(score);
    },
    []
  );

  // Update Core Web Vitals score from image metadata or calculate it
  useEffect(() => {
    // Always prioritize metadata score from Core Web Vitals compression
    if (selectedImage?.metadata?.coreWebVitalsScore) {
      setCoreWebVitalsScore(selectedImage.metadata.coreWebVitalsScore);
    } else if (localWidth > 0 && localHeight > 0) {
      // For images without Core Web Vitals compression, calculate based on current dimensions
      // Use file size if available, otherwise estimate for uncompressed
      const fileSize = selectedImage?.file?.size;
      updateCoreWebVitalsScore(localWidth, localHeight, fileSize);
    }

    // Update has changes state
    setHasChanges(
      localWidth !== imageDimensions.width ||
        localHeight !== imageDimensions.height
    );
  }, [
    localWidth,
    localHeight,
    imageDimensions.width,
    imageDimensions.height,
    updateCoreWebVitalsScore,
    selectedImage?.metadata?.coreWebVitalsScore,
    selectedImage?.file?.size,
  ]);

  // Width slider change handler
  const handleWidthChange = useCallback(
    (values: number[]) => {
      const newWidth = values[0];
      let newHeight = localHeight;

      if (aspectRatio && imageDimensions.width && imageDimensions.height) {
        const ratio = imageDimensions.width / imageDimensions.height;
        newHeight = Math.round(newWidth / ratio);
      }

      setLocalWidth(newWidth);
      setLocalHeight(newHeight);

      // Update the context
      setResizeDraft({ width: newWidth, height: newHeight });
    },
    [localHeight, aspectRatio, imageDimensions, setResizeDraft]
  );

  // Height slider change handler
  const handleHeightChange = useCallback(
    (values: number[]) => {
      const newHeight = values[0];
      let newWidth = localWidth;

      if (aspectRatio && imageDimensions.width && imageDimensions.height) {
        const ratio = imageDimensions.width / imageDimensions.height;
        newWidth = Math.round(newHeight * ratio);
      }

      setLocalWidth(newWidth);
      setLocalHeight(newHeight);

      // Update the context
      setResizeDraft({ width: newWidth, height: newHeight });
    },
    [localWidth, aspectRatio, imageDimensions, setResizeDraft]
  );

  const handleLevelChange = (levelValue: string) => {
    setCompressionLevel(levelValue as any);
    const level = COMPRESSION_LEVELS.find((l) => l.value === levelValue);
    if (level) {
      setQuality(level.quality);
    }
  };

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat as ImageFormat);
  };

  const handleFullReset = () => {
    // Reset compression settings globally
    resetEditorUI();

    // Reset all images in the store to original state
    images.forEach((image) => {
      resetSingleImage(image.id);
    });

    // Reset current image context
    handleReset();
    setAspectRatio(true);

    // Reset to original dimensions for current image
    setLocalWidth(imageDimensions.width);
    setLocalHeight(imageDimensions.height);
    setResizeDraft({
      width: imageDimensions.width,
      height: imageDimensions.height,
    });
  };

  const handleResetCompressionSelectedImage = () => {
    // Reset Core Web Vitals compression for selected image
    if (selectedImage) {
      resetCompression(selectedImage.id);
      
      // Force recalculation of Core Web Vitals score for original dimensions
      // Use original file size for more accurate score calculation
      const originalFileSize = selectedImage.file?.size;
      updateCoreWebVitalsScore(imageDimensions.width, imageDimensions.height, originalFileSize);
    }

    // Reset compression settings UI
    resetEditorUI();

    // Reset resize draft for selected image - this will trigger slider updates
    setResizeDraft({
      width: imageDimensions.width,
      height: imageDimensions.height,
    });
    setLocalWidth(imageDimensions.width);
    setLocalHeight(imageDimensions.height);
  };

  const handleDownload = () => {
    if (!selectedImage) return;

    const link = document.createElement("a");
    link.href = selectedImage.url;
    link.download = `${selectedImage.file.name.split(".")[0]}-edited.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = async () => {
    if (images.length === 0) return;

    // Import JSZip dynamically to avoid bundle bloat
    const JSZip = await import("jszip").then((module) => module.default);
    const zip = new JSZip();

    // Add each image to the zip
    for (const image of images) {
      try {
        // Fetch the image as blob
        const response = await fetch(image.url);
        const blob = await response.blob();

        // Get the original filename or create one
        const filename = image.file?.name || `image-${image.id}.${format}`;
        const nameWithoutExt = filename.split(".")[0];
        const finalFilename = `${nameWithoutExt}-compressed.${format}`;

        zip.file(finalFilename, blob);
      } catch (error) {
        console.error(`Failed to add ${image.name} to zip:`, error);
      }
    }

    try {
      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `imagehorse-compressed-images-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to create zip file:", error);
    }
  };

  // Core Web Vitals indicator position
  const getIndicatorPosition = () => {
    switch (coreWebVitalsScore) {
      case "good":
        return "3%";
      case "almost-there":
        return "31%";
      case "needs-improvement":
        return "56%";
      case "poor":
        return "95%";
      default:
        return "3%";
    }
  };

  if (!selectedImage) {
    return (
      <Card className="rounded-lg bg-card text-card-foreground shadow-lg flex items-center justify-center p-6 min-h-[400px]">
        <p className="text-muted-foreground text-center">
          Select an image to see resize options.
        </p>
      </Card>
    );
  }

  if (isLoadingDimensions || imageDimensions.width === 0) {
    return (
      <Card className="rounded-lg bg-card text-card-foreground shadow-lg flex items-center justify-center p-6 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading image dimensions...</p>
        </div>
      </Card>
    );
  }

  // Calculate reasonable min/max values for sliders
  const minWidth = Math.max(10, Math.round(imageDimensions.width * 0.1));
  const maxWidth = Math.round(imageDimensions.width * 3);
  const minHeight = Math.max(10, Math.round(imageDimensions.height * 0.1));
  const maxHeight = Math.round(imageDimensions.height * 3);

  return (
    <Card className="rounded-lg bg-card text-card-foreground shadow-lg">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center text-base font-semibold">
          <ImgIcon className="h-4 w-4 mr-2" /> Resize & Optimize
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Width Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Width</label>
            <span className="text-sm text-muted-foreground">{localWidth}px</span>
          </div>
          <Slider
            value={[localWidth]}
            min={minWidth}
            max={maxWidth}
            step={1}
            onValueChange={handleWidthChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minWidth}px</span>
            <span>{maxWidth}px</span>
          </div>
        </div>

        {/* Height Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Height</label>
            <span className="text-sm text-muted-foreground">{localHeight}px</span>
          </div>
          <Slider
            value={[localHeight]}
            min={minHeight}
            max={maxHeight}
            step={1}
            onValueChange={handleHeightChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minHeight}px</span>
            <span>{maxHeight}px</span>
          </div>
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm">Maintain aspect ratio</label>
          <button
            onClick={() => setAspectRatio((p) => !p)}
            className={`w-10 h-6 p-1 rounded-full flex items-center transition-colors ${
              aspectRatio
                ? "bg-primary justify-end"
                : "bg-muted justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-background transition-transform" />
          </button>
        </div>

        {/* Compression Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Compression Level</label>
          <Select value={compressionLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPRESSION_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Core Web Vitals Indicator */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Core Web Vitals Score:</span>
          <div className="relative w-full h-5 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-400 to-red-500">
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
              style={{ left: getIndicatorPosition() }}
            >
              <div className="w-3 h-3 rounded-full bg-background shadow-lg border border-border" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground px-1">
            <span>Good</span>
            <span>Almost There</span>
            <span>Needs Work</span>
            <span>Poor</span>
          </div>
          <div className="text-center">
            <span
              className={`text-xs font-medium ${
                coreWebVitalsScore === "good"
                  ? "text-accent"
                  : coreWebVitalsScore === "almost-there"
                    ? "text-secondary"
                    : coreWebVitalsScore === "needs-improvement"
                      ? "text-chart-3"
                      : "text-destructive"
              }`}
            >
              {coreWebVitalsScore === "good"
                ? "Excellent Performance"
                : coreWebVitalsScore === "almost-there"
                  ? "Good Performance"
                  : coreWebVitalsScore === "needs-improvement"
                    ? "Needs Improvement"
                    : "Poor Performance"}
            </span>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Output Format</label>
          <Select value={format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpeg">JPEG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Changes Button */}
        <Button
          onClick={handleApplyResize}
          className={`w-full mb-4 ${
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          disabled={!hasChanges}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          {hasChanges ? "Apply Changes" : "No Changes to Apply"}
        </Button>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="flex gap-2">
            <Button
              onClick={handleFullReset}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset All
            </Button>
            <Button
              onClick={handleResetCompressionSelectedImage}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Compression
            </Button>
          </div>

          {/* Row 2 */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button
              onClick={() => handleBulkDownload()}
              variant="outline"
              className="flex-1"
            >
              <Archive className="h-4 w-4 mr-2" /> Bulk Download Zip (
              {images.length})
            </Button>
          </div>
        </div>

        {/* Current Status */}
        {hasChanges && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs text-white-300">
              <p>
                Original: {imageDimensions.width} × {imageDimensions.height}px
              </p>
              <p>
                New: {localWidth} × {localHeight}px
              </p>
              <p>Format: {format.toUpperCase()}</p>
              <p>Quality: {quality}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
