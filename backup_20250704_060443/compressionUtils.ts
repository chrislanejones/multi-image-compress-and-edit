import {
  CORE_WEB_VITALS,
  COMPRESSION_LEVELS,
  IMAGE_FORMATS,
  type CoreWebVitalsScore,
  type CompressionLevel,
  type ImageFormat,
} from "@/constants/compressionConstants";

/**
 * Calculate Core Web Vitals score based on image dimensions and file size
 */
export function calculateCoreWebVitalsScore(
  width: number,
  height: number,
  fileSize?: number
): CoreWebVitalsScore {
  const pixelSize = width * height;
  const buffer = CORE_WEB_VITALS.BUFFER;

  // Primary scoring based on pixel dimensions
  let dimensionScore: CoreWebVitalsScore = "poor";
  if (pixelSize <= CORE_WEB_VITALS.LCP_THRESHOLD_GOOD - buffer) {
    dimensionScore = "good";
  } else if (pixelSize <= CORE_WEB_VITALS.LCP_THRESHOLD_GOOD + buffer) {
    dimensionScore = "almost-there";
  } else if (pixelSize <= CORE_WEB_VITALS.LCP_THRESHOLD_POOR - buffer) {
    dimensionScore = "needs-improvement";
  }

  // If file size is provided, factor it into the score
  if (fileSize) {
    let sizeScore: CoreWebVitalsScore = "good";
    if (fileSize > CORE_WEB_VITALS.SIZE_THRESHOLD_POOR) {
      sizeScore = "poor";
    } else if (fileSize > CORE_WEB_VITALS.SIZE_THRESHOLD_GOOD) {
      sizeScore = "needs-improvement";
    }

    // Return the worse of the two scores
    const scores = ["good", "almost-there", "needs-improvement", "poor"];
    const dimensionIndex = scores.indexOf(dimensionScore);
    const sizeIndex = scores.indexOf(sizeScore);
    return scores[Math.max(dimensionIndex, sizeIndex)] as CoreWebVitalsScore;
  }

  return dimensionScore;
}

/**
 * Get the position percentage for the Core Web Vitals indicator
 */
export function getCoreWebVitalsPosition(score: CoreWebVitalsScore): string {
  switch (score) {
    case "good":
      return "3%";
    case "almost-there":
      return "31%";
    case "needs-improvement":
      return "56%";
    case "poor":
      return "95%";
    default:
      return "95%";
  }
}

/**
 * Estimate compressed file size based on dimensions and compression settings
 */
export function estimateCompressedSize(
  originalWidth: number,
  originalHeight: number,
  originalSize: number,
  newWidth: number,
  newHeight: number,
  format: ImageFormat,
  compressionLevel: CompressionLevel
): number {
  // Calculate dimension ratio
  const dimensionRatio =
    (newWidth * newHeight) / (originalWidth * originalHeight);

  // Get compression factor based on level and format
  const compressionConfig = COMPRESSION_LEVELS.find(
    (level) => level.value === compressionLevel
  );
  const baseCompressionFactor = compressionConfig
    ? compressionConfig.quality / 100
    : 0.85;

  // Format-specific compression factors
  const formatFactors = {
    jpeg: 1.0,
    webp: 0.7, // WebP typically 30% smaller than JPEG
    png: 1.2, // PNG typically larger for photos
  };

  const formatFactor = formatFactors[format] || 1.0;

  // Calculate estimated size
  const estimatedSize =
    originalSize * dimensionRatio * baseCompressionFactor * formatFactor;

  return Math.round(estimatedSize);
}

/**
 * Calculate compression savings percentage
 */
export function calculateSavingsPercentage(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize <= 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get compression level configuration by value
 */
export function getCompressionConfig(level: CompressionLevel) {
  return COMPRESSION_LEVELS.find((config) => config.value === level);
}

/**
 * Get image format configuration by value
 */
export function getFormatConfig(format: ImageFormat) {
  return IMAGE_FORMATS.find((config) => config.value === format);
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight),
    };
  }

  const aspectRatio = originalWidth / originalHeight;

  // Calculate scaling factor to fit within max dimensions
  const scaleX = maxWidth / originalWidth;
  const scaleY = maxHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Generate a filename for the compressed image
 */
export function generateCompressedFilename(
  originalName: string,
  format: ImageFormat,
  compressionLevel: CompressionLevel
): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const formatConfig = getFormatConfig(format);
  const extension = formatConfig?.extension || format;

  return `${nameWithoutExt}-compressed-${compressionLevel}.${extension}`;
}

/**
 * Validate dimension values
 */
export function validateDimensions(
  width: number,
  height: number
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (width <= 0) errors.push("Width must be greater than 0");
  if (height <= 0) errors.push("Height must be greater than 0");
  if (width > 10000) errors.push("Width cannot exceed 10,000 pixels");
  if (height > 10000) errors.push("Height cannot exceed 10,000 pixels");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get MIME type for a given format
 */
export function getMimeTypeForFormat(format: ImageFormat): string {
  const formatConfig = getFormatConfig(format);
  return formatConfig?.mimeType || "image/jpeg";
}

/**
 * Calculate compression efficiency rating
 */
export function getCompressionEfficiencyRating(
  originalSize: number,
  compressedSize: number
): "excellent" | "good" | "fair" | "poor" {
  const savingsPercent = calculateSavingsPercentage(
    originalSize,
    compressedSize
  );

  if (savingsPercent >= 70) return "excellent";
  if (savingsPercent >= 50) return "good";
  if (savingsPercent >= 25) return "fair";
  return "poor";
}

/**
 * Get recommended compression settings based on image characteristics
 */
export function getRecommendedSettings(
  width: number,
  height: number,
  fileSize: number,
  originalFormat: string
): {
  format: ImageFormat;
  compressionLevel: CompressionLevel;
  targetWidth: number;
  targetHeight: number;
  reasoning: string;
} {
  const pixelCount = width * height;
  const isLargeImage = pixelCount > 2000000; // > 2MP
  const isLargeFile = fileSize > 1024 * 1024; // > 1MB
  const isPhoto =
    originalFormat.includes("jpeg") || originalFormat.includes("jpg");

  let format: ImageFormat = "webp"; // Default to WebP for best compression
  let compressionLevel: CompressionLevel = "medium";
  let targetWidth = width;
  let targetHeight = height;
  let reasoning = "Balanced settings for general use";

  // Adjust based on image characteristics
  if (isLargeImage && isLargeFile) {
    compressionLevel = "high";
    const optimal = calculateOptimalDimensions(width, height, 1920, 1080);
    targetWidth = optimal.width;
    targetHeight = optimal.height;
    reasoning =
      "Large image detected - using aggressive compression and resizing";
  } else if (isPhoto && fileSize > 500 * 1024) {
    compressionLevel = "medium";
    reasoning = "Photo detected - balanced compression to maintain quality";
  } else if (!isPhoto) {
    format = "png";
    compressionLevel = "low";
    reasoning = "Non-photo image - preserving quality with PNG format";
  }

  return {
    format,
    compressionLevel,
    targetWidth,
    targetHeight,
    reasoning,
  };
}
