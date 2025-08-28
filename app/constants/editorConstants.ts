// app/constants/editorConstants.ts - Enhanced version
import type { CoreWebVitalsScore } from "@/types/types";

// Ultra-aggressive compression levels for excellent Core Web Vitals
export const COMPRESSION_LEVELS = [
  { value: "ultraLight", label: "Ultra Light (Best Quality)", quality: 90 },
  { value: "light", label: "Light (High Quality)", quality: 80 },
  { value: "balanced", label: "Balanced (Good Quality)", quality: 65 },
  { value: "aggressive", label: "Aggressive (Small File)", quality: 50 },
  {
    value: "ultraAggressive",
    label: "Ultra Aggressive (Tiny File)",
    quality: 35,
  },
  { value: "extremeWeb", label: "Extreme Web (Core Web Vitals)", quality: 25 },
] as const;

// Enhanced Core Web Vitals thresholds for stricter performance standards
export const CORE_WEB_VITALS = {
  // Pixel count thresholds (width × height)
  LCP_THRESHOLD_EXCELLENT: 600 * 400, // 240K pixels - ultra excellent
  LCP_THRESHOLD_GOOD: 1000 * 800, // 800K pixels - excellent
  LCP_THRESHOLD_DECENT: 1200 * 900, // 1.08M pixels - good (old "good")
  LCP_THRESHOLD_POOR: 1800 * 1200, // 2.16M pixels - needs improvement

  // File size thresholds (bytes)
  FILE_SIZE_EXCELLENT: 50_000, // 50KB - ultra excellent
  FILE_SIZE_GOOD: 100_000, // 100KB - excellent
  FILE_SIZE_DECENT: 200_000, // 200KB - good
  FILE_SIZE_POOR: 400_000, // 400KB - needs improvement

  // Buffer for calculations
  BUFFER: 10_000, // 10KB buffer (tighter than before)
} as const;

// Bytes per pixel caps for different formats (ultra-aggressive)
export const BYTES_PER_PX_CAP = {
  avif: 0.04, // Ultra aggressive - AVIF is most efficient
  webp: 0.08, // Very aggressive - WebP is quite efficient
  jpeg: 0.12, // Aggressive - JPEG baseline
  png: 0.25, // PNG can't compress as well, but still aggressive
} as const;

// Absolute file size caps based on image width (ultra-tight)
export const ABS_FILE_SIZE_CAPS = {
  400: 20_000, // 20KB for small images (400px wide)
  600: 35_000, // 35KB for medium-small images (600px wide)
  800: 50_000, // 50KB for medium images (800px wide)
  1200: 100_000, // 100KB for large images (1200px wide)
  1600: 200_000, // 200KB for extra large images (1600px wide)
  1920: 250_000, // 250KB for full HD images (1920px wide)
} as const;

// Recommended formats in order of efficiency for Core Web Vitals
export const FORMAT_PRIORITY = ["avif", "webp", "jpeg", "png"] as const;

// Quality recommendations for different use cases
export const QUALITY_PRESETS = {
  // For hero images that need to look perfect
  hero: { avif: 65, webp: 75, jpeg: 85, png: 100 },

  // For content images that need good quality
  content: { avif: 45, webp: 60, jpeg: 75, png: 100 },

  // For thumbnails and small images
  thumbnail: { avif: 35, webp: 45, jpeg: 65, png: 90 },

  // For maximum Core Web Vitals performance
  webVitals: { avif: 25, webp: 35, jpeg: 50, png: 80 },

  // For ultra-small file sizes
  minimal: { avif: 15, webp: 25, jpeg: 35, png: 70 },
} as const;

// Dimension reduction strategies based on original size
export const DIMENSION_STRATEGIES = {
  // For images over 4000px in any dimension
  huge: { maxScale: 0.4, targetWidth: 1000 },

  // For images over 2500px in any dimension
  veryLarge: { maxScale: 0.6, targetWidth: 1200 },

  // For images over 1800px in any dimension
  large: { maxScale: 0.8, targetWidth: 1400 },

  // For images under 1800px
  normal: { maxScale: 1.0, targetWidth: 1600 },
} as const;

// Performance scoring weights
export const PERFORMANCE_WEIGHTS = {
  fileSize: 0.6, // File size is more important (60%)
  dimensions: 0.4, // Dimensions matter less (40%)
} as const;

// Core Web Vitals score calculation helpers
export const calculateCoreWebVitalsScore = (
  width: number,
  height: number,
  fileSize: number
): CoreWebVitalsScore => {
  const pixelCount = width * height;

  // Check for excellent performance (new highest tier)
  if (
    fileSize <= CORE_WEB_VITALS.FILE_SIZE_EXCELLENT &&
    pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_EXCELLENT
  ) {
    return "good"; // Maps to "excellent" in UI
  }

  // Check for good performance
  if (
    fileSize <= CORE_WEB_VITALS.FILE_SIZE_GOOD &&
    pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_GOOD
  ) {
    return "almost-there"; // Maps to "good" in UI
  }

  // Check for decent performance
  if (
    fileSize <= CORE_WEB_VITALS.FILE_SIZE_DECENT &&
    pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_DECENT
  ) {
    return "needs-improvement"; // Maps to "needs improvement" in UI
  }

  // Everything else is poor
  return "poor";
};

// Get optimal dimensions for a target performance level
export const getOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  targetPerformance: "excellent" | "good" | "decent" = "excellent"
) => {
  const currentPixels = originalWidth * originalHeight;
  let targetPixels: number;

  switch (targetPerformance) {
    case "excellent":
      targetPixels = CORE_WEB_VITALS.LCP_THRESHOLD_EXCELLENT;
      break;
    case "good":
      targetPixels = CORE_WEB_VITALS.LCP_THRESHOLD_GOOD;
      break;
    case "decent":
      targetPixels = CORE_WEB_VITALS.LCP_THRESHOLD_DECENT;
      break;
  }

  if (currentPixels <= targetPixels) {
    return { width: originalWidth, height: originalHeight };
  }

  const scaleFactor = Math.sqrt(targetPixels / currentPixels);
  return {
    width: Math.round(originalWidth * scaleFactor),
    height: Math.round(originalHeight * scaleFactor),
  };
};

// Get recommended quality for format and performance target
export const getRecommendedQuality = (
  format: string,
  performance:
    | "hero"
    | "content"
    | "thumbnail"
    | "webVitals"
    | "minimal" = "webVitals"
) => {
  const formatKey = format.toLowerCase() as keyof typeof QUALITY_PRESETS.hero;
  return (
    QUALITY_PRESETS[performance][formatKey] || QUALITY_PRESETS[performance].jpeg
  );
};

// Estimate file size based on dimensions, format, and quality
export const estimateFileSize = (
  width: number,
  height: number,
  format: string,
  quality: number
): number => {
  const pixelCount = width * height;
  const baseSize = pixelCount * 3; // Base RGB size
  const normalizedQuality = quality > 1 ? quality / 100 : quality;

  switch (format.toLowerCase()) {
    case "avif":
      return baseSize * normalizedQuality * 0.2; // AVIF is ~80% smaller than JPEG
    case "webp":
      return baseSize * normalizedQuality * 0.4; // WebP is ~60% smaller than JPEG
    case "jpeg":
      return baseSize * normalizedQuality * 0.7; // JPEG baseline
    case "png":
      return baseSize * 1.2; // PNG is larger, quality doesn't matter much
    default:
      return baseSize * normalizedQuality * 0.7;
  }
};

export type CompressionLevel = (typeof COMPRESSION_LEVELS)[number]["value"];
