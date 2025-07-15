// app/utils/image-kit.ts
"use client";

import JSZip from "jszip";
import type { ImageFormat } from "@/types/types";

/* ------------------------------------------------------------------ */
/* 1.  Image helpers (moved from image-processing.ts)                  */
/* ------------------------------------------------------------------ */
export async function compressImageAggressively(
  url: string,
  maxWidth = 1200,
  format: ImageFormat = "webp",
  targetSizeKB = 500,
  level: "low" | "medium" | "high" | "extremeSmall" | "extremeBW" = "medium"
) {
  const img = await loadImage(url);
  let w = img.naturalWidth,
    h = img.naturalHeight;
  let quality =
    level === "low"
      ? 0.95
      : level === "medium"
        ? 0.85
        : level === "high"
          ? 0.75
          : level === "extremeSmall"
            ? 0.6
            : 0.85;

  if (w > maxWidth) {
    const r = maxWidth / w;
    w = maxWidth;
    h = Math.round(h * r);
  }

  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d")!;
  let blob: Blob;
  let attempts = 0;

  do {
    cvs.width = w;
    cvs.height = h;

    if (level === "extremeBW") {
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = "none";
      const d = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < d.data.length; i += 4) {
        const bw = d.data[i] < 128 ? 0 : 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = bw;
      }
      ctx.putImageData(d, 0, 0);
    } else {
      ctx.drawImage(img, 0, 0, w, h);
    }

    blob = await canvasToBlob(cvs, format, quality);
    if (blob.size / 1024 <= targetSizeKB || attempts >= 5) break;
    quality = Math.max(0.1, quality * 0.8);
    attempts++;
  } while (true);

  return {
    url: URL.createObjectURL(blob),
    blob,
    size: blob.size,
    width: w,
    height: h,
  };
}

export async function rotateImage(
  url: string,
  degrees: number,
  format: ImageFormat = "jpeg",
  quality = 0.85
) {
  const img = await loadImage(url);
  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad)),
    cos = Math.abs(Math.cos(rad));
  const w = Math.floor(img.width * cos + img.height * sin);
  const h = Math.floor(img.width * sin + img.height * cos);

  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d")!;
  cvs.width = w;
  cvs.height = h;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return cvs.toDataURL(getMimeType(format), quality);
}

export async function flipImage(
  url: string,
  horizontal = true,
  format: ImageFormat = "jpeg",
  quality = 0.85
) {
  const img = await loadImage(url);
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d")!;
  cvs.width = img.width;
  cvs.height = img.height;

  if (horizontal) {
    ctx.translate(cvs.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, cvs.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(img, 0, 0);
  return cvs.toDataURL(getMimeType(format), quality);
}

/* ------------------------------------------------------------------ */
/* 2.  ZIP helpers (moved from bulk-zip.ts)                             */
/* ------------------------------------------------------------------ */
export async function zipAndDownloadBlobs(
  files: Array<{ name: string; blob: Blob }>,
  zipFileName: string,
  onProgress?: (percent: number) => void
) {
  const zip = new JSZip();
  for (let i = 0; i < files.length; i++) {
    const { name, blob } = files[i];
    zip.file(name, blob);
    onProgress?.(Math.round(((i + 1) / files.length) * 50));
  }
  const zipBlob = await zip.generateAsync({ type: "blob" }, (meta) =>
    onProgress?.(50 + Math.round(meta.percent / 2))
  );
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  onProgress?.(100);
}

export async function bulkProcessAndZip(
  imageUrls: string[],
  pixelCrop: any,
  format: ImageFormat,
  quality: number,
  zipName: string,
  onProgress?: (
    stage: "cropping" | "zipping" | "done",
    percent: number,
    current: number,
    total: number
  ) => void
) {
  const { bulkCropImages } = await import("./image"); // avoid circular
  const blobs = await bulkCropImages(
    imageUrls,
    {
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
      unit: "px",
    },
    format,
    quality,
    (pct, cur, tot) => onProgress?.("cropping", pct, cur, tot)
  );
  const files = blobs.map(({ blob, fileName }) => ({ name: fileName, blob }));
  onProgress?.("zipping", 0, files.length, files.length);
  await zipAndDownloadBlobs(files, zipName, (pct) =>
    onProgress?.("zipping", pct, files.length, files.length)
  );
  onProgress?.("done", 100, files.length, files.length);
}

/* ------------------------------------------------------------------ */
/* 3.  Shared low-level helpers                                       */
/* ------------------------------------------------------------------ */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const t = setTimeout(() => reject(new Error("Image load timeout")), 5000);
    img.onload = () => (clearTimeout(t), resolve(img));
    img.onerror = () => (clearTimeout(t), reject(new Error("Failed to load")));
    img.src = src;
  });
}

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

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat | string = "jpeg",
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas→blob failed"))),
      getMimeType(format),
      quality
    );
  });
}

/* ------------------------------------------------------------------ */
/* 4.  Re-export everything so the rest of the app keeps working      */
/* ------------------------------------------------------------------ */
export * from "./image"; // keeps the old helpers around
export * from "./indexed-db"; // keeps the IndexedDB layer
