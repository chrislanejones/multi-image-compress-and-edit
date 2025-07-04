// app/components/CompressionSidebar.tsx - Fixed version
import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import {
  Archive,
  Download,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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

// Utility function
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

interface CompressionSidebarProps {
  images: ProcessedImage[];
  onImagesUpdate: (images: ProcessedImage[]) => void;
}

// Simple Slider component
const SimpleSlider: React.FC<{
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
}> = ({ value, onValueChange, min, max, step, className = "" }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
  />
);

// Simple Progress component
const SimpleProgress: React.FC<{ value: number; className?: string }> = ({
  value,
  className = "",
}) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

export const CompressionSidebar: React.FC<CompressionSidebarProps> = ({
  images,
  onImagesUpdate,
}) => {
  const [quality, setQuality] = useState([80]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(
    null
  );

  // Compress single image
  const compressSingleImage = useCallback(
    async (imageId: string) => {
      const imageIndex = images.findIndex((img) => img.id === imageId);
      if (imageIndex === -1) return;

      const image = images[imageIndex];
      setCurrentlyProcessing(image.file.name);

      try {
        const compressedFile = await compressImage(
          image.file,
          quality[0] / 100
        );
        const compressionRatio = 1 - compressedFile.size / image.file.size;

        const updatedImage: ProcessedImage = {
          ...image,
          compressed: {
            file: compressedFile,
            url: URL.createObjectURL(compressedFile),
            compressionRatio,
            quality: quality[0],
          },
        };

        const updatedImages = [...images];
        updatedImages[imageIndex] = updatedImage;
        onImagesUpdate(updatedImages);
      } catch (error) {
        console.error("Compression failed for", image.file.name, error);
      } finally {
        setCurrentlyProcessing(null);
      }
    },
    [images, quality, onImagesUpdate]
  );

  // Compress all images
  const compressAllImages = useCallback(async () => {
    setIsCompressing(true);
    setCompressionProgress(0);

    const uncompressedImages = images.filter((img) => !img.compressed);
    if (uncompressedImages.length === 0) {
      setIsCompressing(false);
      return;
    }

    for (let i = 0; i < uncompressedImages.length; i++) {
      const image = uncompressedImages[i];
      setCurrentlyProcessing(image.file.name);

      try {
        const compressedFile = await compressImage(
          image.file,
          quality[0] / 100
        );
        const compressionRatio = 1 - compressedFile.size / image.file.size;

        const imageIndex = images.findIndex((img) => img.id === image.id);
        if (imageIndex !== -1) {
          const updatedImage: ProcessedImage = {
            ...image,
            compressed: {
              file: compressedFile,
              url: URL.createObjectURL(compressedFile),
              compressionRatio,
              quality: quality[0],
            },
          };

          const updatedImages = [...images];
          updatedImages[imageIndex] = updatedImage;
          onImagesUpdate(updatedImages);
        }
      } catch (error) {
        console.error("Compression failed for", image.file.name, error);
      }

      // Add small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
      setCompressionProgress(((i + 1) / uncompressedImages.length) * 100);
    }

    setIsCompressing(false);
    setCurrentlyProcessing(null);
    setCompressionProgress(0);
  }, [images, quality, onImagesUpdate]);

  // Quick compress with preset quality
  const quickCompress = useCallback(
    async (presetQuality: number) => {
      const tempQuality = quality[0];
      setQuality([presetQuality]);

      // Wait for state update then compress
      setTimeout(() => {
        compressAllImages();
        setQuality([tempQuality]); // Restore original quality setting
      }, 100);
    },
    [quality, compressAllImages]
  );

  // Download compressed images
  const downloadCompressed = useCallback(() => {
    const compressedImages = images.filter((img) => img.compressed);

    compressedImages.forEach((image) => {
      if (image.compressed) {
        const link = document.createElement("a");
        link.href = image.compressed.url;
        link.download = `compressed_${image.file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }, [images]);

  // Calculate statistics
  const stats = {
    total: images.length,
    compressed: images.filter((img) => img.compressed).length,
    totalOriginalSize: images.reduce((sum, img) => sum + img.metadata.size, 0),
    totalCompressedSize: images.reduce((sum, img) => {
      return (
        sum + (img.compressed ? img.compressed.file.size : img.metadata.size)
      );
    }, 0),
    avgCompressionRatio:
      images.filter((img) => img.compressed).length > 0
        ? images
            .filter((img) => img.compressed)
            .reduce(
              (sum, img) => sum + (img.compressed?.compressionRatio || 0),
              0
            ) / images.filter((img) => img.compressed).length
        : 0,
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Compression Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Quality: {quality[0]}%
                </label>
                <span className="text-xs text-gray-500">
                  {quality[0] >= 90
                    ? "High"
                    : quality[0] >= 70
                      ? "Medium"
                      : "Low"}
                </span>
              </div>
              <SimpleSlider
                value={quality}
                onValueChange={setQuality}
                min={10}
                max={100}
                step={5}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Compress:</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickCompress(60)}
                  disabled={isCompressing}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Fast (60%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickCompress(80)}
                  disabled={isCompressing}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Balanced (80%)
                </Button>
              </div>
            </div>

            {/* Main Actions */}
            <div className="space-y-2">
              <Button
                onClick={compressAllImages}
                disabled={isCompressing || images.length === 0}
                className="w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {isCompressing ? "Compressing..." : "Compress All Images"}
              </Button>

              <Button
                variant="outline"
                onClick={downloadCompressed}
                disabled={stats.compressed === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Compressed ({stats.compressed})
              </Button>
            </div>

            {/* Progress */}
            {isCompressing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(compressionProgress)}%</span>
                </div>
                <SimpleProgress value={compressionProgress} />
                {currentlyProcessing && (
                  <p className="text-xs text-gray-600 truncate">
                    Processing: {currentlyProcessing}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Images</p>
                <p className="font-medium">
                  {stats.compressed} / {stats.total}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Original Size
                </p>
                <p className="font-medium">
                  {formatBytes(stats.totalOriginalSize)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Compressed Size
                </p>
                <p className="font-medium">
                  {formatBytes(stats.totalCompressedSize)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Savings</p>
                <p className="font-medium text-green-600">
                  {Math.round(
                    (1 - stats.totalCompressedSize / stats.totalOriginalSize) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>

            {stats.avgCompressionRatio > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Average compression ratio:{" "}
                  {Math.round(stats.avgCompressionRatio * 100)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Image Status */}
        {images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Image Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {image.compressed ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{image.file.name}</span>
                    </div>
                    {!image.compressed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => compressSingleImage(image.id)}
                        disabled={isCompressing}
                        className="flex-shrink-0"
                      >
                        Compress
                      </Button>
                    )}
                    {image.compressed && (
                      <span className="text-xs text-green-600 flex-shrink-0">
                        {Math.round(image.compressed.compressionRatio * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
