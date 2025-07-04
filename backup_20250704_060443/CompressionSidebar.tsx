import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Download,
  Zap,
  FileImage,
  Settings,
  Info,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { formatBytes } from "../utils/core-image-utils";

// Define types locally to avoid import issues
type ImageFormat = "jpeg" | "png" | "webp";
type CompressionLevel =
  | "low"
  | "medium"
  | "high"
  | "extremeSmall"
  | "extremeBW";

interface CompressionSidebarProps {
  selectedImage: any | null;
  onImageChange?: (newUrl: string) => void;
  onCompressionComplete?: (result: {
    url: string;
    blob: Blob;
    filename: string;
  }) => void;
}

// Compression levels config
const COMPRESSION_LEVELS = [
  {
    value: "low",
    label: "Low (Best Quality)",
    quality: 95,
    description: "Larger file, better quality",
  },
  {
    value: "medium",
    label: "Medium (Balanced)",
    quality: 85,
    description: "Balanced size and quality",
  },
  {
    value: "high",
    label: "High (Smaller File)",
    quality: 75,
    description: "Smaller file, good quality",
  },
  {
    value: "extremeSmall",
    label: "Extreme (Smallest)",
    quality: 60,
    description: "Smallest file size",
  },
  {
    value: "extremeBW",
    label: "Extreme B&W",
    quality: 30,
    description: "Black & white, lowest quality",
  },
] as const;

// Image formats config
const IMAGE_FORMATS = [
  { value: "jpeg", label: "JPEG", description: "Best for photos" },
  {
    value: "png",
    label: "PNG",
    description: "Best for graphics with transparency",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format, best quality/size ratio",
  },
] as const;

export const CompressionSidebar: React.FC<CompressionSidebarProps> = ({
  selectedImage,
  onImageChange,
  onCompressionComplete,
}) => {
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [maxWidth, setMaxWidth] = useState(1920);
  const [compressionLevel, setCompressionLevel] =
    useState<CompressionLevel>("medium");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<{
    url: string;
    blob: Blob;
    size: number;
    savings: number;
  } | null>(null);

  // Reset compression result when image changes
  useEffect(() => {
    setCompressionResult(null);
  }, [selectedImage?.id]);

  // Get quality from compression level
  const getQualityFromLevel = (level: CompressionLevel): number => {
    const config = COMPRESSION_LEVELS.find((l) => l.value === level);
    return config ? config.quality : 85;
  };

  const handleCompress = useCallback(async () => {
    if (!selectedImage) return;

    setIsCompressing(true);
    try {
      // Dynamic import to avoid loading issues
      const { compressImage } = await import("../utils/core-image-utils");

      const actualQuality = getQualityFromLevel(compressionLevel);

      const result = await compressImage(
        selectedImage.url,
        format,
        actualQuality,
        maxWidth
      );

      const originalSize =
        selectedImage.metadata?.originalSize || selectedImage.file?.size || 0;
      const savings =
        originalSize > 0
          ? ((originalSize - result.blob.size) / originalSize) * 100
          : 0;

      const compressionData = {
        url: result.url,
        blob: result.blob,
        size: result.blob.size,
        savings: Math.round(savings),
      };

      setCompressionResult(compressionData);

      // Notify parent components
      onImageChange?.(result.url);
      onCompressionComplete?.({
        url: result.url,
        blob: result.blob,
        filename: `compressed-${selectedImage.file?.name || "image"}.${format === "jpeg" ? "jpg" : format}`,
      });
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  }, [
    selectedImage,
    format,
    compressionLevel,
    maxWidth,
    onImageChange,
    onCompressionComplete,
  ]);

  const handleDownload = useCallback(() => {
    if (!compressionResult || !selectedImage) return;

    const link = document.createElement("a");
    link.href = compressionResult.url;
    link.download = `compressed-${selectedImage.file?.name || "image"}.${format === "jpeg" ? "jpg" : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [compressionResult, selectedImage, format]);

  const handleQuickCompress = useCallback(
    async (targetKB: number) => {
      if (!selectedImage) return;

      setIsCompressing(true);
      try {
        // Dynamic import
        const { aggressiveCompress300KB } = await import(
          "../utils/core-image-utils"
        );

        // Use the existing compression function for quick compress
        const result = await aggressiveCompress300KB(selectedImage.file);

        const originalSize =
          selectedImage.metadata?.originalSize || selectedImage.file?.size || 0;
        const savings =
          originalSize > 0
            ? ((originalSize - result.compressedSize) / originalSize) * 100
            : 0;

        const compressionData = {
          url: result.compressed,
          blob: await fetch(result.compressed).then((r) => r.blob()),
          size: result.compressedSize,
          savings: Math.round(savings),
        };

        setCompressionResult(compressionData);

        // Notify parent components
        onImageChange?.(result.compressed);
        onCompressionComplete?.({
          url: result.compressed,
          blob: compressionData.blob,
          filename: `compressed-${selectedImage.file?.name || "image"}.jpg`,
        });
      } catch (error) {
        console.error("Quick compression failed:", error);
      } finally {
        setIsCompressing(false);
      }
    },
    [selectedImage, onImageChange, onCompressionComplete]
  );

  const handleApplyRecommended = useCallback(() => {
    if (!selectedImage) return;

    const originalSize =
      selectedImage.metadata?.originalSize || selectedImage.file?.size || 0;
    const isLargeFile = originalSize > 1024 * 1024; // > 1MB

    if (isLargeFile) {
      setCompressionLevel("high");
      setFormat("webp");
      setMaxWidth(1920);
    } else {
      setCompressionLevel("medium");
      setFormat("webp");
      setMaxWidth(selectedImage.width || 1920);
    }
  }, [selectedImage]);

  const handleReset = useCallback(() => {
    setQuality(85);
    setFormat("jpeg");
    setMaxWidth(1920);
    setCompressionLevel("medium");
    setCompressionResult(null);
  }, []);

  if (!selectedImage) {
    return (
      <div className="w-80 p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select an image to compress</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const originalSize =
    selectedImage.metadata?.originalSize || selectedImage.file?.size || 0;
  const currentCompressed = selectedImage.metadata?.compressedSize || 0;
  const hasExistingCompression =
    currentCompressed > 0 && currentCompressed !== originalSize;

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Current Image Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileImage className="h-5 w-5" />
            Image Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Original:</span>
              <p className="font-mono">{formatBytes(originalSize)}</p>
            </div>
            {hasExistingCompression && (
              <div>
                <span className="text-muted-foreground">Current:</span>
                <p className="font-mono text-green-600">
                  {formatBytes(currentCompressed)}
                </p>
              </div>
            )}
          </div>

          {hasExistingCompression && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {selectedImage.metadata?.compressionRatio || 0}% savings
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={handleApplyRecommended}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Lightbulb className="mr-2 h-3 w-3" />
              Auto
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Reset
            </Button>
          </div>

          <Button
            onClick={() => handleQuickCompress(300)}
            disabled={isCompressing}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isCompressing ? "Compressing..." : "Quick Compress (300KB)"}
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ImageFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_FORMATS.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    <div className="flex flex-col">
                      <span>{fmt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {fmt.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compression Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality Level</label>
            <Select
              value={compressionLevel}
              onValueChange={(value) =>
                setCompressionLevel(value as CompressionLevel)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPRESSION_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col">
                      <span>{level.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {level.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Width */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Width</label>
              <span className="text-sm text-muted-foreground">
                {maxWidth}px
              </span>
            </div>
            <Slider
              value={[maxWidth]}
              onValueChange={(values) => setMaxWidth(values[0])}
              min={480}
              max={3840}
              step={240}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full"
            variant="outline"
          >
            {isCompressing ? "Compressing..." : "Apply Custom Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Compression Result */}
      {compressionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Zap className="h-5 w-5" />
              Compression Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">New Size:</span>
                <p className="font-mono">
                  {formatBytes(compressionResult.size)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Savings:</span>
                <p className="font-mono text-green-600">
                  {compressionResult.savings}%
                </p>
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>• JPEG: Best for photos, smaller files</p>
          <p>• PNG: Best for graphics with transparency</p>
          <p>• WebP: Modern format, best quality/size ratio</p>
          <p>• Lower quality = smaller file size</p>
          <p>• Reducing max width helps reduce file size</p>
        </CardContent>
      </Card>
    </div>
  );
};
