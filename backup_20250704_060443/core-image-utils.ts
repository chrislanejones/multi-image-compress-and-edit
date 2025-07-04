"use client";

// Import types from the centralized types file
import type { ImageFormat } from "../types";

// ===== TYPES =====
export interface GlobalImage {
  id: string;
  file: File;
  url: string;
  thumbnail?: string;
  compressed?: string;
  originalSize: number;
  compressedSize?: number;
  width?: number;
  height?: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
}

// ===== OPTIMIZED GLOBAL STATE =====
let globalImages: GlobalImage[] = [];
let imageUrlCache = new Map<string, string>();
let thumbnailCache = new Map<string, string>();
let compressionCache = new Map<
  string,
  { compressed: string; compressedSize: number; timestamp: number }
>();

// Batch processing queues
let processingQueue: (() => Promise<void>)[] = [];
let isProcessing = false;

// Cache management constants
const MAX_CACHE_SIZE = 100;

// State management functions with optimizations
export const addToGlobalImages = (images: GlobalImage[]) => {
  globalImages = [...globalImages, ...images];
};

export const removeFromGlobalImages = (id: string) => {
  const index = globalImages.findIndex((img) => img.id === id);
  if (index !== -1) {
    const imageToRemove = globalImages[index];

    // Clean up URLs and cache
    safeRevokeURL(imageToRemove.url);
    safeRevokeURL(imageToRemove.thumbnail);
    if (imageToRemove.compressed) safeRevokeURL(imageToRemove.compressed);

    imageUrlCache.delete(imageToRemove.id);
    thumbnailCache.delete(imageToRemove.id);

    globalImages.splice(index, 1);
    return imageToRemove;
  }
  return null;
};

export const clearGlobalImages = () => {
  // Clean up all URLs and cache
  globalImages.forEach((img) => {
    safeRevokeURL(img.url);
    safeRevokeURL(img.thumbnail);
    if (img.compressed) safeRevokeURL(img.compressed);
  });

  imageUrlCache.clear();
  thumbnailCache.clear();
  // Keep compression cache for reuse but clean it up
  cleanupCache();
  globalImages.length = 0;
};

export const getGlobalImages = () => globalImages;
export const getGlobalImageById = (id: string) =>
  globalImages.find((img) => img.id === id);

export const updateGlobalImage = (
  id: string,
  updates: Partial<GlobalImage>
) => {
  const index = globalImages.findIndex((img) => img.id === id);
  if (index !== -1) {
    globalImages[index] = { ...globalImages[index], ...updates };

    // Cache compression data for persistence
    if (updates.compressed && updates.compressedSize) {
      const cacheKey = `${globalImages[index].file.name}-${globalImages[index].file.size}`;
      compressionCache.set(cacheKey, {
        compressed: updates.compressed,
        compressedSize: updates.compressedSize,
        timestamp: Date.now(),
      });
    }

    return globalImages[index];
  }
  return null;
};

// ===== UTILITY FUNCTIONS =====

export function getMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    default:
      return "image/jpeg";
  }
}

export function safeRevokeURL(url: string | null | undefined): void {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Failed to revoke object URL:", e);
    }
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export function normalizeQuality(quality: number): number {
  // If quality is already normalized (0-1), return as is
  if (quality <= 1) return Math.max(0, Math.min(1, quality));

  // If quality is in percentage (0-100), convert to 0-1
  return Math.max(0, Math.min(1, quality / 100));
}

// ===== CACHE MANAGEMENT =====

function cleanupCache() {
  if (compressionCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(compressionCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const [key, value] = entries[i];
      safeRevokeURL(value.compressed);
      compressionCache.delete(key);
    }
  }
}

// ===== OPTIMIZED IMAGE PROCESSING =====

/**
 * High-quality thumbnail generation with better resolution
 */
export function createOptimizedThumbnail(file: File): Promise<string> {
  // Check cache first
  const cacheKey = `${file.name}-${file.size}`;
  if (thumbnailCache.has(cacheKey)) {
    return Promise.resolve(thumbnailCache.get(cacheKey)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false,
      });

      if (!ctx) {
        const fallbackUrl = URL.createObjectURL(file);
        thumbnailCache.set(cacheKey, fallbackUrl);
        resolve(fallbackUrl);
        return;
      }

      // Better thumbnail size for crisp display
      const MAX_SIZE = 200; // Increased from 80px
      const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Enable smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            thumbnailCache.set(cacheKey, thumbnailUrl);
            resolve(thumbnailUrl);
          } else {
            const fallbackUrl = URL.createObjectURL(file);
            thumbnailCache.set(cacheKey, fallbackUrl);
            resolve(fallbackUrl);
          }
        },
        "image/jpeg",
        0.85 // Higher quality from 0.3
      );
    };

    img.onerror = () => {
      const fallbackUrl = URL.createObjectURL(file);
      thumbnailCache.set(cacheKey, fallbackUrl);
      resolve(fallbackUrl);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Aggressive compression to target 300KB max file size
 */
export async function aggressiveCompress300KB(file: File): Promise<{
  compressed: string;
  compressedSize: number;
}> {
  try {
    const img = await loadImage(URL.createObjectURL(file));

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    let quality = 0.9;
    let attempts = 0;
    const maxAttempts = 8;
    const targetSizeKB = 300;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2D context");

    let resultBlob: Blob;

    do {
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resultBlob = await canvasToBlob(canvas, "jpeg", quality);
      const currentSizeKB = resultBlob.size / 1024;

      if (currentSizeKB <= targetSizeKB || attempts >= maxAttempts) {
        break;
      }

      // Aggressive reduction strategy
      if (currentSizeKB > targetSizeKB * 2) {
        // If way too big, reduce both dimensions and quality
        const scaleFactor = Math.sqrt(targetSizeKB / currentSizeKB);
        width = Math.floor(width * scaleFactor);
        height = Math.floor(height * scaleFactor);
        quality = Math.max(0.3, quality * 0.8);
      } else {
        // Just reduce quality
        quality = Math.max(0.3, quality * 0.7);
      }

      attempts++;
    } while (true);

    const compressedUrl = URL.createObjectURL(resultBlob);
    return {
      compressed: compressedUrl,
      compressedSize: resultBlob.size,
    };
  } catch (error) {
    console.warn("300KB compression failed:", error);
    return {
      compressed: URL.createObjectURL(file),
      compressedSize: file.size,
    };
  }
}

/**
 * Load image with timeout and error handling
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      reject(new Error("Image load timeout"));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Optimized canvas to blob conversion
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat | string = "jpeg",
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const normalizedQuality = normalizeQuality(quality);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"));
          return;
        }
        resolve(blob);
      },
      getMimeType(format),
      normalizedQuality
    );
  });
}

/**
 * Quick dimension calculation - EXPORTED
 */
export function getDimensionsQuick(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve({ width: 0, height: 0 });
    }, 1000);

    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(img.src); // Clean up
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(img.src); // Clean up
      resolve({ width: 0, height: 0 });
    };

    img.src = URL.createObjectURL(file);
  });
}

// ===== BATCH PROCESSING =====

/**
 * Process images in small batches - Check cache and restore compression data
 */
export async function processImagesBatch(
  files: FileList,
  onProgress?: (current: number, total: number) => void
): Promise<GlobalImage[]> {
  const validFiles = Array.from(files).filter((file) => {
    if (!file.type.startsWith("image/")) return false;
    if (file.size > 50 * 1024 * 1024) return false; // 50MB limit
    return true;
  });

  if (validFiles.length === 0) return [];

  const results: GlobalImage[] = [];
  const BATCH_SIZE = 3; // Slightly larger batches since no compression

  for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
    const batch = validFiles.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (file) => {
      try {
        // Quick thumbnail only
        const thumbnail = await createOptimizedThumbnail(file);

        // Get dimensions without blocking
        const dimensions = await getDimensionsQuick(file);

        // Check if we have cached compression data for this exact file
        const cacheKey = `${file.name}-${file.size}`;
        const cachedCompression = compressionCache.get(cacheKey);

        console.log(
          `Processing ${file.name}: Cache ${cachedCompression ? "HIT" : "MISS"}`
        );

        const newImage: GlobalImage = {
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          thumbnail,
          compressed: cachedCompression?.compressed, // Restore from cache
          originalSize: file.size,
          compressedSize: cachedCompression?.compressedSize, // Restore from cache
          width: dimensions.width,
          height: dimensions.height,
        };

        // If we have cached data, log it
        if (cachedCompression) {
          console.log(
            `Restored compression for ${file.name}: ${cachedCompression.compressedSize} bytes`
          );
        }

        return newImage;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(
      (result): result is NonNullable<typeof result> => result !== null
    );

    results.push(...validResults);

    if (onProgress) {
      onProgress(
        Math.min(i + BATCH_SIZE, validFiles.length),
        validFiles.length
      );
    }

    // Small delay to prevent UI blocking
    if (i + BATCH_SIZE < validFiles.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // Cleanup cache periodically
  cleanupCache();

  return results;
}

// ===== STATE HELPERS =====

export function getGlobalImageStats() {
  const totalOriginalSize = globalImages.reduce(
    (sum, img) => sum + img.originalSize,
    0
  );
  const totalCompressedSize = globalImages.reduce((sum, img) => {
    return sum + (img.compressedSize || img.originalSize);
  }, 0);
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const savingsPercent =
    totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;

  return {
    totalOriginalSize,
    totalCompressedSize,
    totalSavings,
    savingsPercent,
    imageCount: globalImages.length,
  };
}

export function getPaginatedImages(page: number, itemsPerPage: number = 12) {
  const totalPages = Math.ceil(globalImages.length / itemsPerPage);
  const currentImages = globalImages.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return {
    totalPages,
    currentImages,
    hasNextPage: page < totalPages - 1,
    hasPrevPage: page > 0,
  };
}

export const cleanupGlobalImages = () => {
  clearGlobalImages();
};

// ===== ADDITIONAL UTILITY FUNCTIONS =====

/**
 * Calculate size reduction percentage
 */
export function calculateSizeReduction(
  originalSize: number,
  newSize: number
): number {
  if (originalSize <= 0) return 0;
  return 100 - (newSize / originalSize) * 100;
}

/**
 * Create a safe image URL, falling back to placeholder if needed
 */
export function getSafeImageUrl(url?: string): string {
  if (!url || typeof url !== "string") return "/placeholder.svg";
  return url;
}

/**
 * Extract format from file type
 */
export function getFileFormat(fileType: string | undefined): string {
  if (!fileType || typeof fileType !== "string") return "unknown";
  const parts = fileType.split("/");
  return parts.length > 1 ? parts[1] : "unknown";
}

/**
 * Apply crop to an image and return the result as a blob
 */
export async function cropImageToBlob(
  imageUrl: string,
  crop: any,
  format: ImageFormat | string = "jpeg",
  quality = 0.9
): Promise<{ blob: Blob; fileName: string }> {
  try {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Calculate crop dimensions in pixels
    const cropX = (crop.x / 100) * img.naturalWidth;
    const cropY = (crop.y / 100) * img.naturalHeight;
    const cropWidth = (crop.width / 100) * img.naturalWidth;
    const cropHeight = (crop.height / 100) * img.naturalHeight;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped portion
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const blob = await canvasToBlob(canvas, format, quality);
    const extension = format === "jpeg" ? "jpg" : format;
    const fileName = `cropped-image-${Date.now()}.${extension}`;

    return { blob, fileName };
  } catch (error) {
    console.error("Error cropping image:", error);
    throw error;
  }
}

/**
 * Apply crop to an image and return the result as a URL
 */
export async function cropImage(
  image: HTMLImageElement,
  crop: any,
  format: ImageFormat | string = "jpeg",
  quality = 0.9
): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const blob = await canvasToBlob(canvas, format, quality);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error cropping image:", error);
    throw error;
  }
}

/**
 * Resize an image with high-quality multi-pass algorithm
 */
export async function resizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  format: ImageFormat | string = "jpeg",
  quality = 0.85
): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Multi-pass resizing for better quality when downscaling significantly
    if (image.width > width * 1.5 || image.height > height * 1.5) {
      let currentWidth = image.width;
      let currentHeight = image.height;
      let currentSource: HTMLImageElement | HTMLCanvasElement = image;

      // Use intermediate canvas for multi-step resizing
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        while (currentWidth > width * 1.5 || currentHeight > height * 1.5) {
          currentWidth = Math.max(currentWidth * 0.5, width);
          currentHeight = Math.max(currentHeight * 0.5, height);

          tempCanvas.width = currentWidth;
          tempCanvas.height = currentHeight;

          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = "high";
          tempCtx.drawImage(currentSource, 0, 0, currentWidth, currentHeight);

          currentSource = tempCanvas;
        }
      }

      // Final resize to exact dimensions
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(currentSource, 0, 0, width, height);
    } else {
      // Direct resize for small changes
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, width, height);
    }

    const blob = await canvasToBlob(canvas, format, quality);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
}

/**
 * Rotate an image by degrees and return a data URL
 */
export async function rotateImage(
  imageUrl: string,
  degrees: number,
  format: string = "jpeg",
  quality = 0.85,
  backgroundColor: string = "transparent"
): Promise<string> {
  const img = await loadImage(imageUrl);
  const radians = (degrees * Math.PI) / 180;

  // Calculate the bounding box for the rotated image
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  // Calculate new dimensions that will contain the rotated image
  const newWidth = Math.floor(img.width * cos + img.height * sin);
  const newHeight = Math.floor(img.width * sin + img.height * cos);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context");

  // Set canvas size to accommodate the rotated image
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Fill background if specified (useful for JPEG format)
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, newWidth, newHeight);
  }

  // Move to center of canvas
  ctx.translate(newWidth / 2, newHeight / 2);

  // Rotate around center
  ctx.rotate(radians);

  // Draw image centered at origin
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas.toDataURL(getMimeType(format), normalizeQuality(quality));
}

/**
 * Compress an image with optional resizing
 */
export async function compressImage(
  imgSrc: string,
  format: string = "webp",
  quality = 85,
  maxWidth?: number
): Promise<{ url: string; blob: Blob; width: number; height: number }> {
  try {
    const img = await loadImage(imgSrc);

    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (maxWidth && width > maxWidth) {
      const ratio = maxWidth / width;
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const normalizedQuality = normalizeQuality(quality);
    const blob = await canvasToBlob(canvas, format, normalizedQuality);
    const url = URL.createObjectURL(blob);

    return { url, blob, width, height };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

/**
 * Aggressive compression function that was missing
 */
export async function compressImageAggressively(
  imageUrl: string,
  targetSizeKB: number = 300,
  format: ImageFormat = "jpeg",
  maxAttempts: number = 8
): Promise<{ url: string; blob: Blob; compressionRatio: number }> {
  try {
    const img = await loadImage(imageUrl);

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    let quality = 0.9;
    let attempts = 0;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2D context");

    let resultBlob: Blob;
    const originalSize = await getBlobSize(imageUrl);

    do {
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resultBlob = await canvasToBlob(canvas, format, quality);
      const currentSizeKB = resultBlob.size / 1024;

      if (currentSizeKB <= targetSizeKB || attempts >= maxAttempts) {
        break;
      }

      // Aggressive reduction strategy
      if (currentSizeKB > targetSizeKB * 2) {
        // If way too big, reduce both dimensions and quality
        const scaleFactor = Math.sqrt(targetSizeKB / currentSizeKB);
        width = Math.floor(width * scaleFactor);
        height = Math.floor(height * scaleFactor);
        quality = Math.max(0.1, quality * 0.7);
      } else {
        // Just reduce quality
        quality = Math.max(0.1, quality * 0.8);
      }

      attempts++;
    } while (true);

    const compressedUrl = URL.createObjectURL(resultBlob);
    const compressionRatio =
      originalSize > 0 ? resultBlob.size / originalSize : 1;

    return {
      url: compressedUrl,
      blob: resultBlob,
      compressionRatio,
    };
  } catch (error) {
    console.error("Aggressive compression failed:", error);
    throw error;
  }
}

/**
 * Helper function to get blob size from URL
 */
async function getBlobSize(url: string): Promise<number> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob.size;
  } catch {
    return 0;
  }
}

/**
 * Create a file from a blob
 */
export function createFileFromBlob(
  blob: Blob,
  fileName: string,
  format: ImageFormat | string = "jpeg"
): File {
  const extension = format === "jpeg" ? "jpg" : format;
  const name = fileName.includes(".")
    ? fileName.substring(0, fileName.lastIndexOf(".")) + "." + extension
    : fileName + "." + extension;

  return new File([blob], name, { type: getMimeType(format) });
}

/**
 * Download an image
 */
export function downloadImage(
  imageUrl: string,
  fileName: string,
  format: ImageFormat | string = "jpeg"
): void {
  const extension = format === "jpeg" ? "jpg" : format;
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `${fileName.split(".")[0] || "image"}-edited.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert base64 data to a blob
 */
export function base64ToBlob(
  base64Data: string,
  contentType = "image/jpeg"
): Blob {
  const base64 = base64Data.includes("base64,")
    ? base64Data.split("base64,")[1]
    : base64Data;

  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

/**
 * Get image details from a URL
 */
export async function getImageDetails(url: string): Promise<{
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}> {
  const img = await loadImage(url);
  return {
    width: img.width,
    height: img.height,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  };
}

/**
 * Get a blob from a URL (dataURL or objectURL)
 */
export async function getBlobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  return await response.blob();
}

/**
 * Bulk crop multiple images and return as blobs for ZIP download
 */
export async function bulkCropImages(
  imageUrls: string[],
  crop: any,
  format: ImageFormat | string = "jpeg",
  quality = 0.9,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<Array<{ blob: Blob; fileName: string }>> {
  const results: Array<{ blob: Blob; fileName: string }> = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];

    // Update progress
    if (onProgress) {
      onProgress(
        Math.round((i / imageUrls.length) * 100),
        i + 1,
        imageUrls.length
      );
    }

    try {
      const result = await cropImageToBlob(imageUrl, crop, format, quality);
      results.push({
        ...result,
        fileName: `cropped-image-${i + 1}.${
          format === "jpeg" ? "jpg" : format
        }`,
      });
    } catch (error) {
      console.error(`Error cropping image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }

  return results;
}
