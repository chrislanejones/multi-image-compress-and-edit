"use client";

// ===== MAIN EXPORT FILE =====
// This file re-exports everything from the split utility files

// Core utilities - Primary source
export {
  // Types
  type GlobalImage,
  type CropArea,

  // Core functions
  getMimeType,
  safeRevokeURL,
  formatBytes,
  normalizeQuality,
  loadImage,
  canvasToBlob,
  getDimensionsQuick,
  calculateSizeReduction,
  getSafeImageUrl,
  getFileFormat,
  createOptimizedThumbnail,

  // Processing functions
  cropImageToBlob,
  cropImage,
  resizeImage,
  rotateImage,
  compressImage,
  compressImageAggressively,
  createFileFromBlob,
  downloadImage,
  base64ToBlob,
  getImageDetails,
  getBlobFromUrl,
  bulkCropImages,

  // Batch processing (from core-image-utils)

  // State management
  addToGlobalImages,
  removeFromGlobalImages,
  clearGlobalImages,
  getGlobalImages,
  getGlobalImageById,
  updateGlobalImage,
  getGlobalImageStats,
  getPaginatedImages,
  cleanupGlobalImages,

  // Additional utilities (from core-image-utils)
  aggressiveCompress300KB,
} from "./core-image-utils";

// Image compression - Only unique exports
export {
  compressImageWithStrategy,
  batchCompressImages,
} from "./image-compression";

// Image processing - Only unique exports
export { compressImageSmart, transformImage } from "./image-processing";

// Batch processing - Only unique exports
export {
  validateImageFile,
  getProcessingStats,
  processImagesBatch, // Added this export
  processImagesBatchAdvanced,
  processImagesBatchMemoryOptimized,
} from "./image-batch-processor";

// Legacy global state management for backward compatibility
// Note: These are now just aliases to the core functions above
import {
  type GlobalImage as CoreGlobalImage,
  safeRevokeURL as coreSafeRevokeURL,
  addToGlobalImages as coreAddToGlobalImages,
  removeFromGlobalImages as coreRemoveFromGlobalImages,
  clearGlobalImages as coreClearGlobalImages,
  getGlobalImages as coreGetGlobalImages,
  getGlobalImageById as coreGetGlobalImageById,
  updateGlobalImage as coreUpdateGlobalImage,
  getGlobalImageStats as coreGetGlobalImageStats,
  getPaginatedImages as coreGetPaginatedImages,
  cleanupGlobalImages as coreCleanupGlobalImages,
} from "./core-image-utils";

// Legacy compatibility - these are just aliases now
export const legacyAddToGlobalImages = coreAddToGlobalImages;
export const legacyRemoveFromGlobalImages = coreRemoveFromGlobalImages;
export const legacyClearGlobalImages = coreClearGlobalImages;
export const legacyGetGlobalImages = coreGetGlobalImages;
export const legacyGetGlobalImageById = coreGetGlobalImageById;
export const legacyUpdateGlobalImage = coreUpdateGlobalImage;
export const legacyGetGlobalImageStats = coreGetGlobalImageStats;
export const legacyGetPaginatedImages = coreGetPaginatedImages;
export const legacyCleanupGlobalImages = coreCleanupGlobalImages;
