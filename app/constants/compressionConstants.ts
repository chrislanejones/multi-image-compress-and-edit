// constants/compressionConstants.ts

export const COMPRESSION_LEVELS = [
  {
    value: "low",
    label: "Low (Best Quality)",
    quality: 95,
    description: "Larger file, better quality",
    targetSizeKB: 1000,
  },
  {
    value: "medium",
    label: "Medium (Balanced)",
    quality: 85,
    description: "Balanced size and quality",
    targetSizeKB: 500,
  },
  {
    value: "high",
    label: "High (Smaller File)",
    quality: 75,
    description: "Smaller file, good quality",
    targetSizeKB: 300,
  },
  {
    value: "extremeSmall",
    label: "Extreme (Smallest)",
    quality: 60,
    description: "Smallest file size",
    targetSizeKB: 150,
  },
  {
    value: "extremeBW",
    label: "Extreme B&W",
    quality: 30,
    description: "Black & white, lowest quality",
    targetSizeKB: 100,
  },
] as const;

export const IMAGE_FORMATS = [
  {
    value: "jpeg",
    label: "JPEG",
    description: "Best for photos",
    extension: "jpg",
    mimeType: "image/jpeg",
  },
  {
    value: "png",
    label: "PNG",
    description: "Best for images with transparency",
    extension: "png",
    mimeType: "image/png",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format with best compression",
    extension: "webp",
    mimeType: "image/webp",
  },
] as const;

export const CORE_WEB_VITALS = {
  // Largest Contentful Paint thresholds (in pixels)
  LCP_THRESHOLD_GOOD: 1200 * 900, // ~1MP is good
  LCP_THRESHOLD_POOR: 1800 * 1200, // ~2.2MP is poor
  BUFFER: 20000, // ~20k pixels buffer for scoring

  // File size thresholds (in bytes)
  SIZE_THRESHOLD_GOOD: 100 * 1024, // 100KB
  SIZE_THRESHOLD_POOR: 500 * 1024, // 500KB
} as const;

export const COMPRESSION_DEFAULTS = {
  format: "webp",
  quality: 85,
  compressionLevel: "medium",
  maintainAspectRatio: true,
  maxWidth: 1920,
  maxHeight: 1080,
  targetSizeKB: 500,
} as const;

export const DIMENSION_LIMITS = {
  minScale: 0.1, // 10% of original
  maxScale: 2.0, // 200% of original
  minDimension: 10, // minimum 10px
  maxDimension: 4096, // maximum 4K
} as const;

export type CompressionLevel = (typeof COMPRESSION_LEVELS)[number]["value"];
export type ImageFormat = (typeof IMAGE_FORMATS)[number]["value"];
export type CoreWebVitalsScore =
  | "good"
  | "almost-there"
  | "needs-improvement"
  | "poor";
