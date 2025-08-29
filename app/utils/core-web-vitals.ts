import type { CoreWebVitalsScore } from "../types/types";

export type Codec = "avif" | "webp" | "jpeg";

// Core Web Vitals compression thresholds for optimal performance
const CORE_WEB_VITALS = {
  LCP_THRESHOLD_GOOD: 1000 * 800, // 800K pixels (more aggressive)
  LCP_THRESHOLD_POOR: 1800 * 1200, // 2.16M pixels  
  BUFFER: 15000, // 15KB buffer (tighter)
} as const;

// Aggressive bytes per pixel caps for Core Web Vitals
const BYTES_PER_PX_CAP: Record<Codec, number> = {
  avif: 0.08, // More aggressive
  webp: 0.12, // More aggressive
  jpeg: 0.18, // More aggressive
};

// Tighter absolute caps for better performance
const ABS_CAP: Record<number, number> = {
  400: 30_000, // 30KB for small images
  800: 60_000, // 60KB for medium images
  1200: 150_000, // 150KB for large images (more aggressive)
  1920: 280_000, // 280KB for XL images (more aggressive)
};

const CODEC_ORDER: Codec[] = ["avif", "webp", "jpeg"];

const mimeFor = (c: Codec) =>
  c === "avif" ? "image/avif" : c === "webp" ? "image/webp" : "image/jpeg";

const absCapFor = (w: number) => {
  const keys = Object.keys(ABS_CAP)
    .map(Number)
    .sort((a, b) => a - b);
  let cap = ABS_CAP[keys[0]];
  for (const k of keys) if (w >= k) cap = ABS_CAP[k];
  return cap;
};

const browserSupportsType = (type: string) => {
  try {
    const c = document.createElement("canvas");
    return !!c.toDataURL(type).startsWith(`data:${type}`);
  } catch {
    return false;
  }
};

const supportedCodecs = (() => {
  const list: Codec[] = [];
  if (browserSupportsType("image/avif")) list.push("avif");
  if (browserSupportsType("image/webp")) list.push("webp");
  list.push("jpeg");
  return list as Codec[];
})();

// Calculate Core Web Vitals score with enhanced logic
export function calculateCoreWebVitalsScore(
  width: number,
  height: number,
  fileSize: number
): CoreWebVitalsScore {
  const pixelCount = width * height;
  const buffer = CORE_WEB_VITALS.BUFFER;

  // Excellent performance targets
  if (fileSize <= 150_000 && pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_GOOD) {
    return "good";
  }

  // Good performance
  if (
    fileSize <= 250_000 &&
    pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_GOOD + buffer
  ) {
    return "almost-there";
  }

  // Needs improvement
  if (
    fileSize <= 400_000 &&
    pixelCount <= CORE_WEB_VITALS.LCP_THRESHOLD_POOR - buffer
  ) {
    return "needs-improvement";
  }

  return "poor";
}

function boltTierFor(bpp: number, codec: Codec): 1 | 2 | 3 {
  const good = BYTES_PER_PX_CAP[codec];
  if (bpp <= good * 0.5) return 3; // excellent (more aggressive)
  if (bpp <= good) return 2; // good
  return 1; // ok
}

async function blobFromURL(u: string) {
  const r = await fetch(u);
  return await r.blob();
}

async function bitmapFromURL(url: string) {
  const blob = await blobFromURL(url);
  return await createImageBitmap(blob);
}

function drawScaled(src: ImageBitmap, targetWidth: number) {
  // More aggressive dimension reduction for better Core Web Vitals
  const maxWidth = Math.min(targetWidth, src.width);
  const ratio = maxWidth / src.width;
  const w = Math.max(400, Math.round(src.width * ratio)); // Minimum 400px width
  const h = Math.max(300, Math.round(src.height * ratio)); // Minimum 300px height

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return canvas;
}

async function canvasToBlob(c: OffscreenCanvas, type: string, quality: number) {
  return await c.convertToBlob({ type, quality });
}

// Enhanced binary search with more aggressive compression for Core Web Vitals
async function compressCanvasCWV(canvas: OffscreenCanvas, codec: Codec) {
  const pixels = canvas.width * canvas.height;
  const bppCap = BYTES_PER_PX_CAP[codec];
  const cap = absCapFor(canvas.width);

  // Start with lower quality for more aggressive compression
  let lo = codec === "jpeg" ? 0.3 : 0.15; // More aggressive starting point
  let hi = 0.85; // Lower max quality
  let best: { blob: Blob; q: number; bytes: number } | null = null;

  // More iterations for better optimization
  for (let i = 0; i < 12; i++) {
    const q = +((lo + hi) / 2).toFixed(3);
    const blob = await canvasToBlob(canvas, mimeFor(codec), q);
    const bytes = blob.size;
    const bpp = bytes / pixels;
    const pass = bytes <= cap && bpp <= bppCap;

    if (pass) {
      best = { blob, q, bytes };
      hi = q; // try even lower quality
    } else {
      lo = q; // need more quality
    }
  }

  if (best) return best;

  // Fallback with very aggressive compression
  const fb = await canvasToBlob(
    canvas,
    mimeFor(codec),
    codec === "jpeg" ? 0.6 : 0.4
  );
  return { blob: fb, q: codec === "jpeg" ? 0.6 : 0.4, bytes: fb.size };
}

// Enhanced compression with better Core Web Vitals targeting
export async function compressBestForCWVFromURL(url: string, clampTo = 1600) {
  // Reduced default clamp
  const bmp = await bitmapFromURL(url);

  // More aggressive dimension reduction
  let targetW = Math.min(clampTo, bmp.width);

  // Additional size reduction for very large images
  if (bmp.width > 2000 || bmp.height > 2000) {
    targetW = Math.min(1200, targetW); // Cap very large images
  }

  const canvas = drawScaled(bmp, targetW);
  const order = supportedCodecs.length ? supportedCodecs : CODEC_ORDER;

  // Try codecs in order of efficiency
  for (const codec of order) {
    const out = await compressCanvasCWV(canvas, codec);
    const bpp = out.bytes / (canvas.width * canvas.height);
    const bolt = boltTierFor(bpp, codec);

    // Calculate Core Web Vitals score
    const coreWebVitalsScore = calculateCoreWebVitalsScore(
      canvas.width,
      canvas.height,
      out.bytes
    );

    return {
      codec,
      quality: out.q,
      bytes: out.bytes,
      width: canvas.width,
      height: canvas.height,
      bpp,
      boltTier: bolt as 1 | 2 | 3,
      blob: out.blob,
      coreWebVitalsScore,
    };
  }
  throw new Error("No codec worked");
}