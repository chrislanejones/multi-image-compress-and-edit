"use client";

import type { PixelCrop } from "react-image-crop";
import type { Crop } from "react-image-crop";

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

export type ImageFormat = "jpeg" | "png" | "webp";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
}

// ===== GLOBAL STATE =====
export let globalImages: GlobalImage[] = [];

// State management functions
export const addToGlobalImages = (images: GlobalImage[]) => {
  globalImages = [...globalImages, ...images];
};

export const removeFromGlobalImages = (id: string) => {
  const index = globalImages.findIndex((img) => img.id === id);
  if (index !== -1) {
    const imageToRemove = globalImages[index];
    // Clean up URLs
    safeRevokeURL(imageToRemove.url);
    safeRevokeURL(imageToRemove.thumbnail);
    if (imageToRemove.compressed) safeRevokeURL(imageToRemove.compressed);

    globalImages.splice(index, 1);
    return imageToRemove;
  }
  return null;
};

export const clearGlobalImages = () => {
  // Clean up all URLs first
  globalImages.forEach((img) => {
    safeRevokeURL(img.url);
    safeRevokeURL(img.thumbnail);
    if (img.compressed) safeRevokeURL(img.compressed);
  });
  globalImages.length = 0;
};

export const getGlobalImages = () => globalImages;

export const getGlobalImageById = (id: string) => {
  return globalImages.find((img) => img.id === id);
};

export const updateGlobalImage = (
  id: string,
  updates: Partial<GlobalImage>
) => {
  const index = globalImages.findIndex((img) => img.id === id);
  if (index !== -1) {
    globalImages[index] = { ...globalImages[index], ...updates };
    return globalImages[index];
  }
  return null;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Convert a format string to its MIME type
 */
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

/**
 * Extract format from file type
 */
export function getFileFormat(fileType: string | undefined): string {
  if (!fileType || typeof fileType !== "string") return "unknown";
  const parts = fileType.split("/");
  return parts.length > 1 ? parts[1] : "unknown";
}

/**
 * Safely revoke an object URL to prevent memory leaks
 */
export function safeRevokeURL(url: string | null | undefined): void {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Failed to revoke object URL:", e);
    }
  }
}

/**
 * Format bytes to a human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

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
 * Normalize quality value to ensure it's in 0-1 range
 */
export function normalizeQuality(quality: number): number {
  if (quality > 1) {
    return quality / 100;
  }
  return Math.max(0, Math.min(1, quality));
}

/**
 * Load an image from a URL into an HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Convert a canvas to a blob with proper quality handling
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

        // If blob is too large (over 2MB) and not PNG, try stronger compression
        if (blob.size > 2 * 1024 * 1024 && format !== "png") {
          const lowerQuality = Math.max(0.5, normalizedQuality * 0.7);
          console.log(
            `Blob too large (${(blob.size / 1024 / 1024).toFixed(
              2
            )}MB), retrying with quality ${lowerQuality}`
          );

          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error("Secondary compression failed"));
                return;
              }
              console.log(
                `Compressed to ${(compressedBlob.size / 1024 / 1024).toFixed(
                  2
                )}MB`
              );
              resolve(compressedBlob);
            },
            getMimeType(format),
            lowerQuality
          );
        } else {
          resolve(blob);
        }
      },
      getMimeType(format),
      normalizedQuality
    );
  });
}

/**
 * Apply crop to an image and return the result as a blob
 */
export async function cropImageToBlob(
  imageUrl: string,
  crop: Crop,
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
  crop: PixelCrop,
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

    const blob = await canvasToBlob(canvas, format, quality);
    const url = URL.createObjectURL(blob);

    return { url, blob, width, height };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

/**
 * Aggressive compression for when file size is critical
 */
export async function compressImageAggressively(
  url: string,
  maxWidth = 1200,
  format: ImageFormat | string = "webp",
  targetSizeKB = 500
): Promise<{
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
}> {
  const img = await loadImage(url);

  let width = img.naturalWidth;
  let height = img.naturalHeight;
  let quality = format === "webp" ? 80 : 85;
  let attempts = 0;
  const maxAttempts = 5;

  // Scale down if needed
  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  let resultBlob: Blob;

  do {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    resultBlob = await canvasToBlob(canvas, format, quality);
    const currentSizeKB = resultBlob.size / 1024;

    if (
      currentSizeKB <= targetSizeKB ||
      quality <= 30 ||
      attempts >= maxAttempts
    ) {
      break;
    }

    // Reduce quality and dimensions for next attempt
    quality = Math.max(30, quality - 15);

    if (attempts >= 2 && currentSizeKB > targetSizeKB * 1.5) {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }

    attempts++;
  } while (true);

  const resultUrl = URL.createObjectURL(resultBlob);
  return {
    url: resultUrl,
    blob: resultBlob,
    size: resultBlob.size,
    width,
    height,
  };
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

// ===== GLOBAL STATE HELPER FUNCTIONS =====

/**
 * Calculate total size statistics for all global images
 */
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

/**
 * Get paginated images
 */
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

/**
 * Cleanup function for when app unmounts
 */
export const cleanupGlobalImages = () => {
  clearGlobalImages();
};
