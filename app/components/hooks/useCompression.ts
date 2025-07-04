import { useState, useCallback, useEffect, useMemo } from "react";
import {
  COMPRESSION_DEFAULTS,
  DIMENSION_LIMITS,
  type CompressionLevel,
  type ImageFormat,
  type CoreWebVitalsScore,
} from "@/constants/compressionConstants";
import {
  calculateCoreWebVitalsScore,
  estimateCompressedSize,
  calculateSavingsPercentage,
  validateDimensions,
  generateCompressedFilename,
  getRecommendedSettings,
  calculateOptimalDimensions,
} from "@/utils/image-utils";
import { compressImageAggressively } from "@/utils/image-utils";

export interface CompressionStats {
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  originalFormat: string;
  currentWidth: number;
  currentHeight: number;
  estimatedSize: number;
  actualSize?: number;
  savingsPercentage: number;
  coreWebVitalsScore: CoreWebVitalsScore;
}

export interface CompressionSettings {
  width: number;
  height: number;
  format: ImageFormat;
  quality: number;
  compressionLevel: CompressionLevel;
  maintainAspectRatio: boolean;
}

export interface UseCompressionOptions {
  imageUrl?: string;
  imageFile?: File;
  onCompressionComplete?: (result: {
    url: string;
    blob: Blob;
    filename: string;
    stats: CompressionStats;
  }) => void;
  onError?: (error: Error) => void;
}

export function useCompression({
  imageUrl,
  imageFile,
  onCompressionComplete,
  onError,
}: UseCompressionOptions = {}) {
  // Original image stats
  const [originalStats, setOriginalStats] = useState<{
    width: number;
    height: number;
    size: number;
    format: string;
  } | null>(null);

  // Compression settings
  const [settings, setSettings] = useState<CompressionSettings>({
    width: 0,
    height: 0,
    format: COMPRESSION_DEFAULTS.format as ImageFormat,
    quality: COMPRESSION_DEFAULTS.quality,
    compressionLevel: COMPRESSION_DEFAULTS.compressionLevel as CompressionLevel,
    maintainAspectRatio: COMPRESSION_DEFAULTS.maintainAspectRatio,
  });

  // Compression state
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState<{
    url: string;
    blob: Blob;
    actualSize: number;
    width: number;
    height: number;
  } | null>(null);

  // UI state
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load image dimensions and stats when imageUrl or imageFile changes
  useEffect(() => {
    if (!imageUrl && !imageFile) {
      setOriginalStats(null);
      return;
    }

    const loadImageStats = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const stats = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: imageFile?.size || 0,
          format: imageFile?.type || "image/jpeg",
        };

        setOriginalStats(stats);

        // Set initial settings based on loaded image
        setSettings((prev) => ({
          ...prev,
          width: stats.width,
          height: stats.height,
        }));

        setHasChanges(false);
        setCompressionResult(null);
      };

      img.onerror = () => {
        onError?.(new Error("Failed to load image"));
      };

      if (imageUrl) {
        img.src = imageUrl;
      } else if (imageFile) {
        img.src = URL.createObjectURL(imageFile);
      }
    };

    loadImageStats();
  }, [imageUrl, imageFile, onError]);

  // Calculate current compression stats
  const compressionStats = useMemo((): CompressionStats | null => {
    if (!originalStats) return null;

    const estimatedSize = estimateCompressedSize(
      originalStats.width,
      originalStats.height,
      originalStats.size,
      settings.width,
      settings.height,
      settings.format,
      settings.compressionLevel
    );

    const actualSize = compressionResult?.actualSize || estimatedSize;
    const savingsPercentage = calculateSavingsPercentage(
      originalStats.size,
      actualSize
    );
    const coreWebVitalsScore = calculateCoreWebVitalsScore(
      settings.width,
      settings.height,
      actualSize
    );

    return {
      originalWidth: originalStats.width,
      originalHeight: originalStats.height,
      originalSize: originalStats.size,
      originalFormat: originalStats.format,
      currentWidth: settings.width,
      currentHeight: settings.height,
      estimatedSize,
      actualSize: compressionResult?.actualSize,
      savingsPercentage,
      coreWebVitalsScore,
    };
  }, [originalStats, settings, compressionResult]);

  // Get dimension limits based on original image
  const dimensionLimits = useMemo(() => {
    if (!originalStats) return null;

    const minWidth = Math.max(
      DIMENSION_LIMITS.minDimension,
      Math.round(originalStats.width * DIMENSION_LIMITS.minScale)
    );
    const minHeight = Math.max(
      DIMENSION_LIMITS.minDimension,
      Math.round(originalStats.height * DIMENSION_LIMITS.minScale)
    );
    const maxWidth = Math.min(
      DIMENSION_LIMITS.maxDimension,
      Math.round(originalStats.width * DIMENSION_LIMITS.maxScale)
    );
    const maxHeight = Math.min(
      DIMENSION_LIMITS.maxDimension,
      Math.round(originalStats.height * DIMENSION_LIMITS.maxScale)
    );

    return { minWidth, minHeight, maxWidth, maxHeight };
  }, [originalStats]);

  // Update width while maintaining aspect ratio if enabled
  const updateWidth = useCallback(
    (newWidth: number) => {
      if (!originalStats) return;

      setSettings((prev) => {
        const width = Math.round(newWidth);
        let height = prev.height;

        if (prev.maintainAspectRatio) {
          const aspectRatio = originalStats.width / originalStats.height;
          height = Math.round(width / aspectRatio);
        }

        return { ...prev, width, height };
      });

      setHasChanges(true);
      setCompressionResult(null);
    },
    [originalStats]
  );

  // Update height while maintaining aspect ratio if enabled
  const updateHeight = useCallback(
    (newHeight: number) => {
      if (!originalStats) return;

      setSettings((prev) => {
        const height = Math.round(newHeight);
        let width = prev.width;

        if (prev.maintainAspectRatio) {
          const aspectRatio = originalStats.width / originalStats.height;
          width = Math.round(height * aspectRatio);
        }

        return { ...prev, width, height };
      });

      setHasChanges(true);
      setCompressionResult(null);
    },
    [originalStats]
  );

  // Update format
  const updateFormat = useCallback((format: ImageFormat) => {
    setSettings((prev) => ({ ...prev, format }));
    setHasChanges(true);
    setCompressionResult(null);
  }, []);

  // Update compression level
  const updateCompressionLevel = useCallback((level: CompressionLevel) => {
    setSettings((prev) => ({ ...prev, compressionLevel: level }));
    setHasChanges(true);
    setCompressionResult(null);
  }, []);

  // Toggle aspect ratio
  const toggleAspectRatio = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      maintainAspectRatio: !prev.maintainAspectRatio,
    }));
  }, []);

  // Apply recommended settings
  const applyRecommendedSettings = useCallback(() => {
    if (!originalStats) return;

    const recommended = getRecommendedSettings(
      originalStats.width,
      originalStats.height,
      originalStats.size,
      originalStats.format
    );

    setSettings((prev) => ({
      ...prev,
      format: recommended.format,
      compressionLevel: recommended.compressionLevel,
      width: recommended.targetWidth,
      height: recommended.targetHeight,
    }));

    setHasChanges(true);
    setCompressionResult(null);
  }, [originalStats]);

  // Reset to original settings
  const resetSettings = useCallback(() => {
    if (!originalStats) return;

    setSettings((prev) => ({
      ...prev,
      width: originalStats.width,
      height: originalStats.height,
      format: COMPRESSION_DEFAULTS.format as ImageFormat,
      quality: COMPRESSION_DEFAULTS.quality,
      compressionLevel:
        COMPRESSION_DEFAULTS.compressionLevel as CompressionLevel,
      maintainAspectRatio: COMPRESSION_DEFAULTS.maintainAspectRatio,
    }));

    setHasChanges(false);
    setCompressionResult(null);
    setValidationErrors([]);
  }, [originalStats]);

  // Validate current settings
  const validateSettings = useCallback(() => {
    const validation = validateDimensions(settings.width, settings.height);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [settings.width, settings.height]);

  // Helper function to get image dimensions from URL
  const getImageDimensions = useCallback(
    (url: string): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () =>
          reject(new Error("Failed to load image for dimensions"));
        img.src = url;
      });
    },
    []
  );

  // Apply compression - Fixed to match new function signature
  const applyCompression = useCallback(async () => {
    if (!imageUrl || !originalStats || !validateSettings()) {
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setCompressionProgress((prev) => Math.min(95, prev + 10));
    }, 200);

    try {
      // Calculate target size based on compression level
      const targetSizeKB =
        settings.compressionLevel === "high"
          ? 200
          : settings.compressionLevel === "medium"
            ? 500
            : 1000;

      // Call the compression function with correct parameters
      const result = await compressImageAggressively(
        imageUrl,
        targetSizeKB,
        settings.format,
        8 // maxAttempts
      );

      clearInterval(progressInterval);
      setCompressionProgress(100);

      // Get actual dimensions of compressed image
      const dimensions = await getImageDimensions(result.url);

      const compressionResult = {
        url: result.url,
        blob: result.blob,
        actualSize: result.compressedSize, // Use compressedSize from result
        width: dimensions.width,
        height: dimensions.height,
      };

      setCompressionResult(compressionResult);

      // Generate filename
      const filename = generateCompressedFilename(
        imageFile?.name || "image",
        settings.format,
        settings.compressionLevel
      );

      // Update final stats
      const finalStats: CompressionStats = {
        originalWidth: originalStats.width,
        originalHeight: originalStats.height,
        originalSize: originalStats.size,
        originalFormat: originalStats.format,
        currentWidth: dimensions.width,
        currentHeight: dimensions.height,
        estimatedSize: result.compressedSize,
        actualSize: result.compressedSize,
        savingsPercentage: calculateSavingsPercentage(
          originalStats.size,
          result.compressedSize
        ),
        coreWebVitalsScore: calculateCoreWebVitalsScore(
          dimensions.width,
          dimensions.height,
          result.compressedSize
        ),
      };

      // Update settings with actual dimensions
      setSettings((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
      }));

      onCompressionComplete?.({
        url: result.url,
        blob: result.blob,
        filename,
        stats: finalStats,
      });

      // Clear progress after a delay
      setTimeout(() => {
        setIsCompressing(false);
        setCompressionProgress(0);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setIsCompressing(false);
      setCompressionProgress(0);
      onError?.(
        error instanceof Error ? error : new Error("Compression failed")
      );
    }
  }, [
    imageUrl,
    originalStats,
    settings,
    imageFile?.name,
    validateSettings,
    onCompressionComplete,
    onError,
    getImageDimensions,
  ]);

  // Download compressed image
  const downloadCompressed = useCallback(() => {
    if (!compressionResult || !imageFile) return;

    const filename = generateCompressedFilename(
      imageFile.name,
      settings.format,
      settings.compressionLevel
    );

    const link = document.createElement("a");
    link.href = compressionResult.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [
    compressionResult,
    imageFile,
    settings.format,
    settings.compressionLevel,
  ]);

  return {
    // State
    originalStats,
    settings,
    compressionStats,
    dimensionLimits,
    isCompressing,
    compressionProgress,
    compressionResult,
    hasChanges,
    validationErrors,

    // Actions
    updateWidth,
    updateHeight,
    updateFormat,
    updateCompressionLevel,
    toggleAspectRatio,
    applyRecommendedSettings,
    resetSettings,
    validateSettings,
    applyCompression,
    downloadCompressed,
  };
}
