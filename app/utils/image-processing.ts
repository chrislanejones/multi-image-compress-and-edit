import type { ImageFormat } from "../types/types";
import { getMimeType } from "./format";

export function safeRevokeURL(url: string | null | undefined): void {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Failed to revoke object URL:", e);
    }
  }
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
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

export async function getImageDimensions(
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

export async function createThumbnail(file: File): Promise<string> {
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
        resolve(fallbackUrl);
        return;
      }

      // Thumbnail size for crisp display
      const MAX_SIZE = 200;
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
            resolve(thumbnailUrl);
          } else {
            const fallbackUrl = URL.createObjectURL(file);
            resolve(fallbackUrl);
          }
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      const fallbackUrl = URL.createObjectURL(file);
      resolve(fallbackUrl);
    };

    img.src = URL.createObjectURL(file);
  });
}

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

  const normalizedQuality = quality > 1 ? quality / 100 : Math.max(0, Math.min(1, quality));
  return canvas.toDataURL(getMimeType(format), normalizedQuality);
}

export async function cropImage(
  imageUrl: string,
  crop: { x: number; y: number; width: number; height: number },
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