"use client";

import type { PixelCrop } from "react-image-crop";
import type { Crop } from "react-image-crop";
import { CropArea, ImageFormat } from "../../types/types";

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
 * Simple ZIP file creation using browser APIs
 */
class SimpleZip {
  private files: Array<{ name: string; blob: Blob }> = [];

  addFile(name: string, blob: Blob): void {
    this.files.push({ name, blob });
  }

  async generateZip(): Promise<Blob> {
    // For modern browsers that support the Compression Streams API
    if ("CompressionStream" in window) {
      return this.generateZipWithCompressionAPI();
    }

    // Fallback: create a simple ZIP structure manually
    return this.generateZipManually();
  }

  private async generateZipWithCompressionAPI(): Promise<Blob> {
    const zipData: Uint8Array[] = [];

    for (const file of this.files) {
      const fileData = new Uint8Array(await file.blob.arrayBuffer());

      // Create a simple ZIP entry header
      const fileName = new TextEncoder().encode(file.name);
      const header = new Uint8Array(30 + fileName.length);

      // ZIP local file header signature
      header[0] = 0x50;
      header[1] = 0x4b;
      header[2] = 0x03;
      header[3] = 0x04;

      // Version needed to extract
      header[4] = 20;
      header[5] = 0;

      // General purpose bit flag
      header[6] = 0;
      header[7] = 0;

      // Compression method (0 = no compression)
      header[8] = 0;
      header[9] = 0;

      // File last modification time/date (placeholder)
      header[10] = 0;
      header[11] = 0;
      header[12] = 0;
      header[13] = 0;

      // CRC-32 (we'll use 0 for simplicity)
      header[14] = 0;
      header[15] = 0;
      header[16] = 0;
      header[17] = 0;

      // Compressed size
      const compressedSize = fileData.length;
      header[18] = compressedSize & 0xff;
      header[19] = (compressedSize >> 8) & 0xff;
      header[20] = (compressedSize >> 16) & 0xff;
      header[21] = (compressedSize >> 24) & 0xff;

      // Uncompressed size
      header[22] = compressedSize & 0xff;
      header[23] = (compressedSize >> 8) & 0xff;
      header[24] = (compressedSize >> 16) & 0xff;
      header[25] = (compressedSize >> 24) & 0xff;

      // File name length
      header[26] = fileName.length & 0xff;
      header[27] = (fileName.length >> 8) & 0xff;

      // Extra field length
      header[28] = 0;
      header[29] = 0;

      // File name
      header.set(fileName, 30);

      zipData.push(header);
      zipData.push(fileData);
    }

    // Create central directory end record
    const centralDirEnd = new Uint8Array(22);
    centralDirEnd[0] = 0x50;
    centralDirEnd[1] = 0x4b;
    centralDirEnd[2] = 0x05;
    centralDirEnd[3] = 0x06;

    // Combine all data
    const totalSize =
      zipData.reduce((sum, arr) => sum + arr.length, 0) + centralDirEnd.length;
    const result = new Uint8Array(totalSize);

    let offset = 0;
    for (const arr of zipData) {
      result.set(arr, offset);
      offset += arr.length;
    }
    result.set(centralDirEnd, offset);

    return new Blob([result], { type: "application/zip" });
  }

  private async generateZipManually(): Promise<Blob> {
    // Simplified ZIP creation for browsers without CompressionStream
    const zipParts: BlobPart[] = [];

    for (const file of this.files) {
      // For simplicity, we'll just concatenate files with basic headers
      const header = `--FILE: ${file.name}--\n`;
      zipParts.push(header);
      zipParts.push(file.blob);
      zipParts.push("\n");
    }

    return new Blob(zipParts, { type: "application/octet-stream" });
  }
}

/**
 * Create and download a ZIP file containing multiple images
 */
export async function downloadImagesAsZip(
  images: Array<{ url: string; name: string }>,
  zipFileName: string = "bulk-images.zip",
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<void> {
  try {
    const zip = new SimpleZip();

    for (let i = 0; i < images.length; i++) {
      const { url, name } = images[i];

      // Update progress
      if (onProgress) {
        onProgress(Math.round((i / images.length) * 50), i + 1, images.length);
      }

      // Fetch the image as blob
      const response = await fetch(url);
      const blob = await response.blob();

      // Add to ZIP with proper file extension
      const fileName = name.includes(".") ? name : `${name}.jpg`;
      zip.addFile(fileName, blob);
    }

    // Update progress for ZIP generation
    if (onProgress) {
      onProgress(75, images.length, images.length);
    }

    // Generate ZIP
    const zipBlob = await zip.generateZip();

    // Update progress
    if (onProgress) {
      onProgress(100, images.length, images.length);
    }

    // Download the ZIP
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error creating ZIP download:", error);
    throw error;
  }
}

/**
 * Bulk crop multiple images and return as blobs for ZIP download
 */
export async function bulkCropImages(
  imageUrls: string[],
  crop: Crop,
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

/**
 * Download bulk cropped images as ZIP
 */
export async function downloadBulkCroppedImages(
  imageUrls: string[],
  crop: Crop,
  format: ImageFormat | string = "jpeg",
  quality = 0.9,
  zipFileName: string = "bulk-cropped-images.zip",
  onProgress?: (
    progress: number,
    current: number,
    total: number,
    stage: string
  ) => void
): Promise<void> {
  try {
    // Stage 1: Crop all images
    if (onProgress) {
      onProgress(0, 0, imageUrls.length, "Cropping images...");
    }

    const croppedImages = await bulkCropImages(
      imageUrls,
      crop,
      format,
      quality,
      (progress, current, total) => {
        if (onProgress) {
          onProgress(
            Math.round(progress * 0.7),
            current,
            total,
            "Cropping images..."
          );
        }
      }
    );

    // Stage 2: Create ZIP
    if (onProgress) {
      onProgress(
        70,
        imageUrls.length,
        imageUrls.length,
        "Creating ZIP file..."
      );
    }

    const zip = new SimpleZip();

    for (const { blob, fileName } of croppedImages) {
      zip.addFile(fileName, blob);
    }

    // Stage 3: Generate and download
    if (onProgress) {
      onProgress(
        90,
        imageUrls.length,
        imageUrls.length,
        "Preparing download..."
      );
    }

    const zipBlob = await zip.generateZip();

    // Download
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    if (onProgress) {
      onProgress(100, imageUrls.length, imageUrls.length, "Download complete!");
    }
  } catch (error) {
    console.error("Error in bulk crop download:", error);
    throw error;
  }
}

// ... rest of the existing functions remain the same ...

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
 * Supports arbitrary rotation angles, not just 90-degree increments
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
 * Rotate an image by a specific preset angle (90, 180, 270 degrees)
 * Optimized version for common rotations
 */
export async function rotateImageQuick(
  imageUrl: string,
  angle: 90 | 180 | 270 | -90 | -180 | -270,
  format: string = "jpeg",
  quality = 0.85
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context");

  // Normalize angle to positive values
  const normalizedAngle = ((angle % 360) + 360) % 360;

  switch (normalizedAngle) {
    case 90:
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.translate(canvas.width, 0);
      ctx.rotate(Math.PI / 2);
      break;
    case 180:
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      break;
    case 270:
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2);
      break;
    default: // 0 degrees
      canvas.width = img.width;
      canvas.height = img.height;
      break;
  }

  ctx.drawImage(img, 0, 0);
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

    const blob = await canvasToBlob(canvas, format, quality);
    const url = URL.createObjectURL(blob);

    return { url, blob, width, height };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

/**
 * Get a blob from a URL (dataURL or objectURL)
 */
export async function getBlobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  return await response.blob();
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

export const getCroppedImg = async (
  imageSrc: string,
  crop: CropArea,
  rotation = 0,
  zoom = 1,
  aspect = 1
): Promise<string> => {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous"); // Handle CORS
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.putImageData(data, Math.round(-crop.x), Math.round(-crop.y));

  return canvas.toDataURL("image/jpeg");
};
