import { create } from "zustand";
import type { Crop } from "react-image-crop";
import type {
  EditorState,
  ImageFormat,
  CompressionLevel,
  BlurStroke,
  PaintStroke,
  ImageFile,
  HistorySnapshot,
} from "../types/types";

/* ------------------------------------------------------------------ */
/* 1. Store interface                                                  */
/* ------------------------------------------------------------------ */

type ArrowShape = {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  double: boolean;
  color: string;
  width: number;
};

type EmojiShape = {
  id: string;
  type: "emoji";
  x: number;
  y: number;
  text: string;
  size: number;
};

type Shape = ArrowShape | EmojiShape;

interface EditorStore {
  /* --- existing fields --- */
  editorState: EditorState;
  zoom: number;
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;
  blurAmount: number;
  brushSize: number;
  brushColor: string;
  blurBrushStrokes: BlurStroke[];
  isBlurBrushing: boolean;
  paintStrokes: PaintStroke[];
  isPainting: boolean;
  paintTool: "brush" | "eraser" | "emoji" | "arrow" | "double";
  crop: Crop | undefined;
  completedCrop: Crop | undefined;
  cropZoom: number;
  isProcessing: boolean;
  hasUnsavedChanges: boolean;

  /* --- text tool trigger --- */
  textSaveTrigger: (() => void) | null;

  /* --- image management --- */
  images: ImageFile[];
  selectedImageId: string | null;
  resizeDraft: { width: number; height: number } | null;

  /* --- shapes for non-freehand tools --- */
  shapes: Shape[];
  currentEmoji: string; // selected emoji character
  arrowColor: string; // optional separate color
  arrowWidth: number; // optional separate width

  /* --- history --- */
  history: HistorySnapshot[];
  historyIndex: number;

  /* --- actions --- */
  setEditorState: (state: EditorState) => void;
  setZoom: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;

  setQuality: (quality: number) => void;
  setFormat: (format: ImageFormat) => void;
  setCompressionLevel: (level: CompressionLevel) => void;

  setBlurAmount: (amount: number) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;

  // Blur brush actions
  addBlurStroke: (stroke: BlurStroke) => void;
  clearBlurStrokes: () => void;
  undoLastBlurStroke: () => void;
  setIsBlurBrushing: (brushing: boolean) => void;

  // Paint actions (freehand)
  addPaintStroke: (stroke: PaintStroke) => void;
  clearPaintStrokes: () => void;
  undoLastPaintStroke: () => void;
  setIsPainting: (painting: boolean) => void;
  setPaintTool: (
    tool: "brush" | "eraser" | "emoji" | "arrow" | "double"
  ) => void;

  // Shape actions (emoji/arrows)
  addShape: (shape: Shape) => void;
  clearShapes: () => void;
  undoLastShape: () => void;
  setCurrentEmoji: (emoji: string) => void;
  setArrowStyle: (color: string, width: number) => void;

  setCrop: (crop: Crop | undefined) => void;
  setCompletedCrop: (crop: Crop | undefined) => void;
  setCropZoom: (zoom: number) => void;
  onCropZoomIn: () => void;
  onCropZoomOut: () => void;
  resetCrop: () => void;

  setIsProcessing: (processing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  /* --- text tool actions --- */
  setTextSaveTrigger: (trigger: (() => void) | null) => void;
  triggerTextSave: () => void;

  handleReset: () => void;
  resetToDefaults: () => void;

  /* --- image management actions --- */
  setImages: (images: ImageFile[]) => void;
  addImages: (images: ImageFile[]) => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  selectImage: (id: string | null) => void;
  getSelectedImage: () => ImageFile | null;
  navigateImage: (direction: "next" | "prev") => void;

  // Image transformations
  rotateImage: (id: string, degrees: number) => void;
  flipImageHorizontal: (id: string) => void;
  flipImageVertical: (id: string) => void;
  resetImage: (id: string) => void;

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) => void;
  applyResize: () => void;

  // Apply operations
  applyBlur: () => Promise<void>;
  applyCrop: () => Promise<void>;
  applyPaint: () => Promise<void>;

  /* --- history actions --- */
  pushHistory: (snapshot: HistorySnapshot) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  /* --- convenience selectors --- */
  canUndo: () => boolean;
  canRedo: () => boolean;
}

/* ------------------------------------------------------------------ */
/* 3. Default values                                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_VALUES = {
  zoom: 100,
  quality: 85,
  format: "webp" as ImageFormat,
  compressionLevel: "medium" as CompressionLevel,
  blurAmount: 5,
  brushSize: 10,
  brushColor: "#ff0000",
  cropZoom: 100,
  currentEmoji: "😊",
  arrowColor: "#ff0000",
  arrowWidth: 6,
};

/* ------------------------------------------------------------------ */
/* 4. Store creator                                                    */
/* ------------------------------------------------------------------ */

export const useEditorStore = create<EditorStore>((set, get) => ({
  /* --- existing initial state --- */
  editorState: "resizeAndOptimize",
  zoom: DEFAULT_VALUES.zoom,
  quality: DEFAULT_VALUES.quality,
  format: DEFAULT_VALUES.format,
  compressionLevel: DEFAULT_VALUES.compressionLevel,
  blurAmount: DEFAULT_VALUES.blurAmount,
  brushSize: DEFAULT_VALUES.brushSize,
  brushColor: DEFAULT_VALUES.brushColor,
  blurBrushStrokes: [],
  isBlurBrushing: false,
  paintStrokes: [],
  isPainting: false,
  paintTool: "brush",
  crop: undefined,
  completedCrop: undefined,
  cropZoom: DEFAULT_VALUES.cropZoom,
  isProcessing: false,
  hasUnsavedChanges: false,

  /* --- text tool trigger --- */
  textSaveTrigger: null,

  /* --- image management initial state --- */
  images: [],
  selectedImageId: null,
  resizeDraft: null,

  /* --- shapes --- */
  shapes: [],
  currentEmoji: DEFAULT_VALUES.currentEmoji,
  arrowColor: DEFAULT_VALUES.arrowColor,
  arrowWidth: DEFAULT_VALUES.arrowWidth,

  /* --- history --- */
  history: [],
  historyIndex: -1,

  /* --- basic actions --- */
  setEditorState: (newState) => set({ editorState: newState }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),
  onZoomIn: () => set((s) => ({ zoom: Math.min(400, s.zoom + 25) })),
  onZoomOut: () => set((s) => ({ zoom: Math.max(25, s.zoom - 25) })),

  setQuality: (quality) =>
    set({
      quality: Math.max(1, Math.min(100, quality)),
      hasUnsavedChanges: true,
    }),
  setFormat: (format) => set({ format, hasUnsavedChanges: true }),
  setCompressionLevel: (level) => {
    const qualityMap: Record<CompressionLevel, number> = {
      low: 95,
      medium: 85,
      high: 75,
      extremeSmall: 60,
      extremeBW: 30,
    };
    set({
      compressionLevel: level,
      quality: qualityMap[level],
      hasUnsavedChanges: true,
    });
  },

  setBlurAmount: (amount) =>
    set({
      blurAmount: Math.max(1, Math.min(20, amount)),
      hasUnsavedChanges: true,
    }),
  setBrushSize: (size) =>
    set({
      brushSize: Math.max(1, Math.min(50, size)),
      hasUnsavedChanges: true,
    }),
  setBrushColor: (color) => set({ brushColor: color, hasUnsavedChanges: true }),

  // Blur brush actions
  addBlurStroke: (stroke) =>
    set((state) => ({
      blurBrushStrokes: [...state.blurBrushStrokes, stroke],
      hasUnsavedChanges: true,
    })),
  clearBlurStrokes: () =>
    set({
      blurBrushStrokes: [],
      hasUnsavedChanges: true,
    }),
  undoLastBlurStroke: () =>
    set((state) => ({
      blurBrushStrokes: state.blurBrushStrokes.slice(0, -1),
      hasUnsavedChanges: true,
    })),
  setIsBlurBrushing: (brushing) => set({ isBlurBrushing: brushing }),

  // Paint actions
  addPaintStroke: (stroke) =>
    set((state) => ({
      paintStrokes: [...state.paintStrokes, stroke],
      hasUnsavedChanges: true,
    })),
  clearPaintStrokes: () =>
    set({
      paintStrokes: [],
      hasUnsavedChanges: true,
    }),
  undoLastPaintStroke: () =>
    set((state) => ({
      paintStrokes: state.paintStrokes.slice(0, -1),
      hasUnsavedChanges: true,
    })),
  setIsPainting: (painting) => set({ isPainting: painting }),
  setPaintTool: (tool) => set({ paintTool: tool }),

  // Shapes
  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
      hasUnsavedChanges: true,
    })),
  clearShapes: () =>
    set({
      shapes: [],
      hasUnsavedChanges: true,
    }),
  undoLastShape: () =>
    set((state) => ({
      shapes: state.shapes.slice(0, -1),
      hasUnsavedChanges: true,
    })),
  setCurrentEmoji: (emoji) =>
    set({ currentEmoji: emoji, hasUnsavedChanges: true }),
  setArrowStyle: (color, width) =>
    set({
      arrowColor: color,
      arrowWidth: Math.max(1, Math.min(50, width)),
      hasUnsavedChanges: true,
    }),

  setCrop: (crop) => set({ crop }),
  setCompletedCrop: (crop) => set({ completedCrop: crop }),
  setCropZoom: (zoom) => set({ cropZoom: Math.max(50, Math.min(300, zoom)) }),
  onCropZoomIn: () =>
    set((s) => ({ cropZoom: Math.min(300, s.cropZoom + 10) })),
  onCropZoomOut: () =>
    set((s) => ({ cropZoom: Math.max(50, s.cropZoom - 10) })),
  resetCrop: () =>
    set({
      crop: undefined,
      completedCrop: undefined,
      cropZoom: DEFAULT_VALUES.cropZoom,
    }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  /* --- text tool actions --- */
  setTextSaveTrigger: (trigger) => set({ textSaveTrigger: trigger }),
  triggerTextSave: () => {
    const state = get();
    if (state.textSaveTrigger) {
      state.textSaveTrigger();
    }
  },

  handleReset: () =>
    set({
      quality: DEFAULT_VALUES.quality,
      format: DEFAULT_VALUES.format,
      compressionLevel: DEFAULT_VALUES.compressionLevel,
      hasUnsavedChanges: false,
    }),

  resetToDefaults: () =>
    set({
      editorState: "resizeAndOptimize",
      zoom: DEFAULT_VALUES.zoom,
      quality: DEFAULT_VALUES.quality,
      format: DEFAULT_VALUES.format,
      compressionLevel: DEFAULT_VALUES.compressionLevel,
      blurAmount: DEFAULT_VALUES.blurAmount,
      brushSize: DEFAULT_VALUES.brushSize,
      brushColor: DEFAULT_VALUES.brushColor,
      isProcessing: false,
      hasUnsavedChanges: false,
    }),

  /* --- history actions --- */
  pushHistory: (snapshot: HistorySnapshot) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const idx = state.historyIndex - 1;
        const snap = state.history[idx];
        return {
          historyIndex: idx,
          url: snap.url,
          width: snap.width,
          height: snap.height,
          crop: snap.crop,
          rotation: snap.rotation,
          flipHorizontal: snap.flipHorizontal,
          flipVertical: snap.flipVertical,
          quality: snap.quality,
          format: snap.format,
          compressionLevel: snap.compressionLevel,
          hasUnsavedChanges: true,
        };
      }
      return {};
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const idx = state.historyIndex + 1;
        const snap = state.history[idx];
        return {
          historyIndex: idx,
          url: snap.url,
          width: snap.width,
          height: snap.height,
          crop: snap.crop,
          rotation: snap.rotation,
          flipHorizontal: snap.flipHorizontal,
          flipVertical: snap.flipVertical,
          quality: snap.quality,
          format: snap.format,
          compressionLevel: snap.compressionLevel,
          hasUnsavedChanges: true,
        };
      }
      return {};
    }),

  clearHistory: () =>
    set({
      history: [],
      historyIndex: -1,
    }),

  /* --- image management actions --- */
  setImages: (images: ImageFile[]) => set({ images }),

  addImages: (newImages: ImageFile[]) =>
    set((state) => ({ images: [...state.images, ...newImages] })),

  updateImage: (id: string, updates: Partial<ImageFile>) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    })),

  selectImage: (id: string | null) => set({ selectedImageId: id }),

  getSelectedImage: () => {
    const state = get();
    return state.images.find((img) => img.id === state.selectedImageId) || null;
  },

  navigateImage: (direction: "next" | "prev") => {
    const state = get();
    const currentIndex = state.images.findIndex(
      (img) => img.id === state.selectedImageId
    );
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "next") {
      newIndex = Math.min(currentIndex + 1, state.images.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    set({ selectedImageId: state.images[newIndex]?.id || null });
  },

  // Image transformations
  rotateImage: (id: string, degrees: number) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? {
              ...img,
              rotation: ((img.rotation || 0) + degrees) % 360,
            }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  flipImageHorizontal: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, flipHorizontal: !img.flipHorizontal } : img
      ),
      hasUnsavedChanges: true,
    })),

  flipImageVertical: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, flipVertical: !img.flipVertical } : img
      ),
      hasUnsavedChanges: true,
    })),

  resetImage: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? {
              ...img,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
            }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) =>
    set({ resizeDraft: draft }),

  applyResize: () => {
    const state = get();
    const selectedImage = state.images.find(
      (img) => img.id === state.selectedImageId
    );
    if (!selectedImage || !state.resizeDraft) return;

    set((currentState) => ({
      images: currentState.images.map((img) =>
        img.id === selectedImage.id
          ? {
              ...img,
              width: state.resizeDraft!.width,
              height: state.resizeDraft!.height,
            }
          : img
      ),
      resizeDraft: null,
      hasUnsavedChanges: true,
    }));
  },

  /* ------------------------- applyBlur ---------------------------- */
  applyBlur: async () => {
    const state = get();
    const selectedImage = state.images.find(
      (img) => img.id === state.selectedImageId
    );
    if (!selectedImage || state.blurBrushStrokes.length === 0) {
      console.log("No blur strokes to apply");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);

      for (const stroke of state.blurBrushStrokes) {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) continue;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        tempCtx.filter = `blur(${stroke.blurAmount}px)`;
        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = "none";

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();

        if (stroke.points.length === 1) {
          ctx.arc(
            stroke.points[0].x,
            stroke.points[0].y,
            stroke.brushSize / 2,
            0,
            Math.PI * 2
          );
        } else {
          for (let i = 0; i < stroke.points.length; i++) {
            const p = stroke.points[i];
            ctx.arc(p.x, p.y, stroke.brushSize / 2, 0, Math.PI * 2);
          }
        }

        ctx.clip();
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/png",
          1.0
        );
      });

      const blurredUrl = URL.createObjectURL(blob);

      set((currentState) => ({
        images: currentState.images.map((i) =>
          i.id === selectedImage.id
            ? {
                ...i,
                url: blurredUrl,
                file: new File([blob], i.file.name, { type: blob.type }),
                size: blob.size,
              }
            : i
        ),
        blurBrushStrokes: [],
        hasUnsavedChanges: true,
      }));

      if (selectedImage.url !== (selectedImage as any).compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }
    } catch (error) {
      console.error("Error applying blur:", error);
    }
  },

  /* ------------------------- applyCrop ---------------------------- */
  applyCrop: async () => {
    const state = get();
    const selectedImage = state.images.find(
      (img) => img.id === state.selectedImageId
    );

    if (
      !selectedImage ||
      !state.completedCrop ||
      !state.completedCrop.width ||
      !state.completedCrop.height
    ) {
      console.log("No crop data available");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      let cropX, cropY, cropWidth, cropHeight;

      if (state.completedCrop.unit === "%") {
        cropX = (state.completedCrop.x / 100) * img.naturalWidth;
        cropY = (state.completedCrop.y / 100) * img.naturalHeight;
        cropWidth = (state.completedCrop.width / 100) * img.naturalWidth;
        cropHeight = (state.completedCrop.height / 100) * img.naturalHeight;
      } else {
        cropX = state.completedCrop.x;
        cropY = state.completedCrop.y;
        cropWidth = state.completedCrop.width;
        cropHeight = state.completedCrop.height;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

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

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/png",
          1.0
        );
      });

      const croppedUrl = URL.createObjectURL(blob);

      set((currentState) => ({
        images: currentState.images.map((i) =>
          i.id === selectedImage.id
            ? {
                ...i,
                url: croppedUrl,
                width: Math.round(cropWidth),
                height: Math.round(cropHeight),
                file: new File([blob], i.file.name, { type: blob.type }),
                size: blob.size,
                crop: {
                  x: state.completedCrop!.x,
                  y: state.completedCrop!.y,
                  width: state.completedCrop!.width,
                  height: state.completedCrop!.height,
                },
              }
            : i
        ),
        crop: undefined,
        completedCrop: undefined,
        hasUnsavedChanges: true,
      }));

      if (selectedImage.url !== (selectedImage as any).compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  },

  /* ------------------------- applyPaint --------------------------- */
  applyPaint: async () => {
    const state = get();
    const selectedImage = state.images.find(
      (img) => img.id === state.selectedImageId
    );
    const hasStrokes = state.paintStrokes.length > 0;
    const hasShapes = state.shapes.length > 0;

    if (!selectedImage || (!hasStrokes && !hasShapes)) {
      console.log("Nothing to apply");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Draw freehand strokes (paint + eraser)
      for (const stroke of state.paintStrokes) {
        if (stroke.points.length === 0) continue;

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }

      // Draw shapes (emoji + arrows)
      for (const shape of state.shapes) {
        if (shape.type === "emoji") {
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.font =
            `${shape.size}px system-ui, apple color emoji, ` +
            `segoe ui emoji, sans-serif`;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(shape.text, shape.x, shape.y);
          ctx.restore();
        } else if (shape.type === "arrow") {
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = shape.color;
          ctx.fillStyle = shape.color;
          ctx.lineWidth = shape.width;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          // shaft
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();

          // head(s)
          drawArrowhead(
            ctx,
            shape.x1,
            shape.y1,
            shape.x2,
            shape.y2,
            shape.width
          );
          if (shape.double) {
            drawArrowhead(
              ctx,
              shape.x2,
              shape.y2,
              shape.x1,
              shape.y1,
              shape.width
            );
          }
          ctx.restore();
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/png",
          1.0
        );
      });

      const paintedUrl = URL.createObjectURL(blob);

      set((currentState) => ({
        images: currentState.images.map((i) =>
          i.id === selectedImage.id
            ? {
                ...i,
                url: paintedUrl,
                file: new File([blob], i.file.name, { type: blob.type }),
                size: blob.size,
              }
            : i
        ),
        paintStrokes: [],
        shapes: [],
        hasUnsavedChanges: true,
      }));

      if (selectedImage.url !== (selectedImage as any).compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }
    } catch (error) {
      console.error("Error applying paint:", error);
    }
  },

  /* --- convenience selectors --- */
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = Math.max(10, width * 3);
  const a1 = angle - Math.PI / 7;
  const a2 = angle + Math.PI / 7;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(a1), y2 - headLen * Math.sin(a1));
  ctx.lineTo(x2 - headLen * Math.cos(a2), y2 - headLen * Math.sin(a2));
  ctx.closePath();
  ctx.fill();
}
