"use client";

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

// ===== OPTIMIZED GLOBAL STATE =====
let globalImages: GlobalImage[] = [];
let imageUrlCache = new Map<string, string>();
let thumbnailCache = new Map<string, string>();

// Batch processing queues
let processingQueue: (() => Promise<void>)[] = [];
let isProcessing = false;

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
  globalImages.length = 0;
};

export const getGlobalImages = () => globalImages;
export const getGlobalImageById = (id: string) =>
  globalImages.find((img) => img.id === id);

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

// ===== OPTIMIZED IMAGE PROCESSING =====

/**
 * Fast thumbnail generation with caching and reduced quality
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

      // Much smaller thumbnail for speed
      const MAX_SIZE = 80;
      const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Disable smoothing for speed
      ctx.imageSmoothingEnabled = false;
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
        0.3 // Very low quality for speed
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
 * Lightweight compression without web workers
 */
export async function lightweightCompress(file: File): Promise<{
  compressed: string;
  compressedSize: number;
}> {
  try {
    const img = await loadImage(URL.createObjectURL(file));

    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // Scale down large images
    const MAX_WIDTH = 1200;
    if (width > MAX_WIDTH) {
      const ratio = MAX_WIDTH / width;
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2D context");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "jpeg", 0.8);
    const compressedUrl = URL.createObjectURL(blob);

    return {
      compressed: compressedUrl,
      compressedSize: blob.size,
    };
  } catch (error) {
    console.warn("Compression failed:", error);
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
    const normalizedQuality =
      quality > 1 ? quality / 100 : Math.max(0, Math.min(1, quality));

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

// ===== BATCH PROCESSING =====

/**
 * Process images in small batches to prevent UI blocking
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
  const BATCH_SIZE = 2; // Smaller batches

  for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
    const batch = validFiles.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (file) => {
      try {
        // Quick thumbnail
        const thumbnail = await createOptimizedThumbnail(file);

        // Get dimensions without blocking
        const dimensions = await getDimensionsQuick(file);

        // Lightweight compression
        const { compressed, compressedSize } = await lightweightCompress(file);

        return {
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          thumbnail,
          compressed,
          originalSize: file.size,
          compressedSize,
          width: dimensions.width,
          height: dimensions.height,
        };
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
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}

/**
 * Quick dimension calculation
 */
function getDimensionsQuick(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve({ width: 0, height: 0 });
    }, 1000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ width: 0, height: 0 });
    };

    img.src = URL.createObjectURL(file);
  });
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
