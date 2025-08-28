// app/context/image-context.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Keep your existing types
export type Codec = "avif" | "webp" | "jpeg";

export type ImageMetadata = {
  originalSize: number; // bytes
  compressedSize?: number; // bytes
  compressionRatio?: number; // percent 0..100 (rounded)
  codec?: Codec;
  quality?: number; // 0..1
  bpp?: number; // bytes per pixel
  absCap?: number; // width-based absolute cap used
  width?: number;
  height?: number;
  boltTier?: 1 | 2 | 3;
  coreWebVitalsScore?: "good" | "almost-there" | "needs-improvement" | "poor";
};

export type ImageFile = {
  id: string;
  name: string;
  file: File;
  url: string; // blob: or remote URL
  width?: number;
  height?: number;
  size?: number; // bytes
  compressedUrl?: string; // blob URL
  compressedSize?: number; // bytes (mirror convenience)
  metadata?: ImageMetadata;
  // transforms (kept for editor compatibility)
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
};

type ImageContextValue = {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  onSelect: (id: string) => void;
  setImages: (next: ImageFile[]) => void;
  updateImage: (id: string, patch: Partial<ImageFile>) => void;
  addFiles: (files: File[]) => Promise<void>;
  removeAll: () => void;
  // Additional methods for compatibility with your existing app
  addImages: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
  removeAllImages: () => void;
  // Pagination and navigation
  currentPage: number;
  totalPages: number;
  paginatedImages: ImageFile[];
  onNavigatePage?: (direction: "prev" | "next") => void;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  // Editor operations
  resizeDraft: { width: number; height: number } | null;
  setResizeDraft: (draft: { width: number; height: number } | null) => void;
  handleApplyResize: () => void;
  handleReset: () => void;
  onApplyCrop: () => void;
  onApplyBlur: () => void;
  onApplyPaint: () => void;
  onApplyText: () => void;
  // Loading states
  loadingImages: Set<string>;
  navigateImage: (direction: "next" | "prev") => void;
  onClose: () => void;
  // Transform operations
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onFlipHorizontal: (id: string) => void;
  onFlipVertical: (id: string) => void;
  onReset: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onCrop: (id: string, crop: any) => void;
  onResize: (id: string, resize?: { width: number; height: number }) => void;
  onCompress: () => void;
  onDownload: () => void;
  onClear: () => void;
};

/* ──────────────────────────────────────────────────────────────────────────
 * ENHANCED Core Web Vitals compression helpers
 * ────────────────────────────────────────────────────────────────────────── */

// More aggressive Core Web Vitals thresholds for better performance
const CORE_WEB_VITALS = {
  LCP_THRESHOLD_GOOD: 1000 * 800, // 800K pixels (more aggressive)
  LCP_THRESHOLD_POOR: 1800 * 1200, // 2.16M pixels
  BUFFER: 15000, // 15KB buffer (tighter)
} as const;

// More aggressive bytes per pixel caps
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
function calculateCoreWebVitalsScore(
  width: number,
  height: number,
  fileSize: number
): "good" | "almost-there" | "needs-improvement" | "poor" {
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

async function bitmapFromFile(file: File) {
  // @ts-ignore
  return await createImageBitmap(file);
}

async function bitmapFromURL(url: string) {
  const blob = await blobFromURL(url);
  // @ts-ignore
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
async function compressBestForCWVFromURL(url: string, clampTo = 1600) {
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

/* ──────────────────────────────────────────────────────────────────────────
 * Context
 * ────────────────────────────────────────────────────────────────────────── */
const ImageContext = createContext<ImageContextValue | null>(null);

export const useImageContext = (): ImageContextValue => {
  const ctx = useContext(ImageContext);
  if (!ctx)
    throw new Error("useImageContext must be used inside <ImageProvider>");
  return ctx;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Provider with enhanced compression and compatibility
 * ────────────────────────────────────────────────────────────────────────── */
export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [resizeDraft, setResizeDraft] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Track which images are actively compressing (avoid duplicate work)
  const compressing = useRef<Set<string>>(new Set());

  const selectedImage = useMemo(
    () => images.find((i) => i.id === selectedId) ?? null,
    [images, selectedId]
  );

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(images.length / itemsPerPage),
    [images.length, itemsPerPage]
  );

  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return images.slice(start, end);
  }, [images, currentPage, itemsPerPage]);

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  const updateImage = useCallback((id: string, patch: Partial<ImageFile>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...patch } : img))
    );
  }, []);

  const removeAll = useCallback(() => {
    images.forEach((i) => {
      if (i.url?.startsWith("blob:")) URL.revokeObjectURL(i.url);
      if (i.compressedUrl?.startsWith("blob:"))
        URL.revokeObjectURL(i.compressedUrl);
    });
    setImages([]);
    setSelectedId(null);
  }, [images]);

  // Enhanced file processing with aggressive Core Web Vitals compression
  const addFiles = useCallback(
    async (files: File[]) => {
      const entries: ImageFile[] = files.map((file) => {
        const url = URL.createObjectURL(file);
        const id = crypto.randomUUID();

        // Add to loading state immediately
        setLoadingImages((prev) => new Set([...prev, id]));

        return {
          id,
          name: file.name,
          file,
          url,
          size: file.size,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
          metadata: {
            originalSize: file.size,
          },
        };
      });

      setImages((prev) => [...entries, ...prev]);

      // Process each image with enhanced compression
      for (const img of entries) {
        try {
          // Get dimensions first
          const bmp = await bitmapFromFile(img.file);
          updateImage(img.id, { width: bmp.width, height: bmp.height });

          // Compress with enhanced Core Web Vitals optimization
          if (!compressing.current.has(img.id)) {
            compressing.current.add(img.id);

            try {
              // More aggressive compression settings
              const result = await compressBestForCWVFromURL(img.url, 1400); // Reduced max width
              const compressedUrl = URL.createObjectURL(result.blob);
              const compressionRatio = Math.round(
                Math.max(0, 1 - result.bytes / (img.size ?? result.bytes)) * 100
              );

              updateImage(img.id, {
                compressedUrl,
                compressedSize: result.bytes,
                metadata: {
                  originalSize: img.size ?? result.bytes,
                  compressedSize: result.bytes,
                  compressionRatio,
                  codec: result.codec,
                  quality: result.quality,
                  bpp: +result.bpp.toFixed(3),
                  absCap: absCapFor(result.width),
                  width: result.width,
                  height: result.height,
                  boltTier: result.boltTier,
                  coreWebVitalsScore: result.coreWebVitalsScore,
                },
              });

              console.log(
                `✅ ${img.name}: ${result.coreWebVitalsScore} score, ${Math.round(result.bytes / 1024)}KB`
              );
            } catch (e) {
              console.warn("Enhanced compression failed:", img.name, e);
            } finally {
              compressing.current.delete(img.id);
              // Remove from loading state
              setLoadingImages((prev) => {
                const newSet = new Set(prev);
                newSet.delete(img.id);
                return newSet;
              });
            }
          }
        } catch (error) {
          console.error(`Failed to process ${img.name}:`, error);
          // Remove from loading state even on error
          setLoadingImages((prev) => {
            const newSet = new Set(prev);
            newSet.delete(img.id);
            return newSet;
          });
        }
      }
    },
    [updateImage]
  );

  // Compatibility methods for your existing app
  const addImages = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onRemove = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const removeAllImages = useCallback(() => {
    removeAll();
  }, [removeAll]);

  // Navigation methods
  const navigateImage = useCallback(
    (direction: "next" | "prev") => {
      if (!selectedId) return;
      const currentIndex = images.findIndex((img) => img.id === selectedId);
      if (currentIndex === -1) return;

      const newIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, images.length - 1)
          : Math.max(currentIndex - 1, 0);

      setSelectedId(images[newIndex]?.id || null);
    },
    [selectedId, images]
  );

  const onNavigatePage = useCallback(
    (direction: "prev" | "next") => {
      setCurrentPage((prev) => {
        if (direction === "next" && prev < totalPages) return prev + 1;
        if (direction === "prev" && prev > 1) return prev - 1;
        return prev;
      });
    },
    [totalPages]
  );

  // Transform operations
  const onRotateLeft = useCallback(
    (id: string) => {
      updateImage(id, {
        rotation: ((images.find((i) => i.id === id)?.rotation || 0) - 90) % 360,
      });
    },
    [images, updateImage]
  );

  const onRotateRight = useCallback(
    (id: string) => {
      updateImage(id, {
        rotation: ((images.find((i) => i.id === id)?.rotation || 0) + 90) % 360,
      });
    },
    [images, updateImage]
  );

  const onRotate = useCallback(
    (id: string, degrees: number) => {
      updateImage(id, {
        rotation:
          ((images.find((i) => i.id === id)?.rotation || 0) + degrees) % 360,
      });
    },
    [images, updateImage]
  );

  const onFlipHorizontal = useCallback(
    (id: string) => {
      const img = images.find((i) => i.id === id);
      updateImage(id, { flipHorizontal: !img?.flipHorizontal });
    },
    [images, updateImage]
  );

  const onFlipVertical = useCallback(
    (id: string) => {
      const img = images.find((i) => i.id === id);
      updateImage(id, { flipVertical: !img?.flipVertical });
    },
    [images, updateImage]
  );

  const onReset = useCallback(
    (id: string) => {
      updateImage(id, {
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
      });
    },
    [updateImage]
  );

  // Editor operations (stubs for compatibility)
  const handleApplyResize = useCallback(async () => {
    if (!selectedImage || !resizeDraft) return;
    // Your existing resize logic here
    console.log("Apply resize:", resizeDraft);
  }, [selectedImage, resizeDraft]);

  const handleReset = useCallback(() => {
    if (selectedImage) {
      onReset(selectedImage.id);
    }
    setResizeDraft(null);
  }, [selectedImage, onReset]);

  // Stub methods for editor compatibility
  const onApplyCrop = useCallback(async () => {
    console.log("Apply crop");
  }, []);
  const onApplyBlur = useCallback(async () => {
    console.log("Apply blur");
  }, []);
  const onApplyPaint = useCallback(async () => {
    console.log("Apply paint");
  }, []);
  const onApplyText = useCallback(async () => {
    console.log("Apply text");
  }, []);
  const onCrop = useCallback((id: string, crop: any) => {
    console.log("Crop:", id, crop);
  }, []);
  const onResize = useCallback(
    (id: string, resize?: { width: number; height: number }) => {
      console.log("Resize:", id, resize);
    },
    []
  );
  const onCompress = useCallback(() => {
    console.log("Compress");
  }, []);
  const onDownload = useCallback(() => {
    console.log("Download");
  }, []);
  const onClear = useCallback(() => {
    removeAll();
  }, [removeAll]);
  const onClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const value = useMemo<ImageContextValue>(
    () => ({
      images,
      selectedImage,
      onSelect,
      setImages,
      updateImage,
      addFiles,
      removeAll,
      // Compatibility methods
      addImages,
      onRemove,
      removeAllImages,
      // Pagination
      currentPage,
      totalPages,
      paginatedImages,
      onNavigatePage,
      setCurrentPage,
      itemsPerPage,
      setItemsPerPage,
      // Editor operations
      resizeDraft,
      setResizeDraft,
      handleApplyResize,
      handleReset,
      onApplyCrop,
      onApplyBlur,
      onApplyPaint,
      onApplyText,
      // Loading states
      loadingImages,
      navigateImage,
      onClose,
      // Transform operations
      onRotateLeft,
      onRotateRight,
      onFlipHorizontal,
      onFlipVertical,
      onReset,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
    }),
    [
      images,
      selectedImage,
      onSelect,
      updateImage,
      addFiles,
      removeAll,
      addImages,
      onRemove,
      removeAllImages,
      currentPage,
      totalPages,
      paginatedImages,
      onNavigatePage,
      itemsPerPage,
      resizeDraft,
      handleApplyResize,
      handleReset,
      onApplyCrop,
      onApplyBlur,
      onApplyPaint,
      onApplyText,
      loadingImages,
      navigateImage,
      onClose,
      onRotateLeft,
      onRotateRight,
      onFlipHorizontal,
      onFlipVertical,
      onReset,
      onRotate,
      onCrop,
      onResize,
      onCompress,
      onDownload,
      onClear,
    ]
  );

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
}
