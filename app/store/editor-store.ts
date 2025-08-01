// editor-store.ts  (complete replacement)

import { create } from "zustand";
import type {
  EditorState,
  ImageFormat,
  CompressionLevel,
  BlurStroke,
  PaintStroke,
  ImageFile,
  HistorySnapshot,
} from "../types/types";
import type { Crop } from "react-image-crop";

/* ------------------------------------------------------------------ */
/* 1.  Store interface                                                 */
/* ------------------------------------------------------------------ */
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

  /* --- image management --- */
  images: ImageFile[];
  selectedImageId: string | null;
  resizeDraft: { width: number; height: number } | null;

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

  // Paint actions
  addPaintStroke: (stroke: PaintStroke) => void;
  clearPaintStrokes: () => void;
  undoLastPaintStroke: () => void;
  setIsPainting: (painting: boolean) => void;
  setPaintTool: (tool: "brush" | "eraser" | "emoji" | "arrow" | "double") => void;

  setCrop: (crop: Crop | undefined) => void;
  setCompletedCrop: (crop: Crop | undefined) => void;
  setCropZoom: (zoom: number) => void;
  onCropZoomIn: () => void;
  onCropZoomOut: () => void;
  resetCrop: () => void;

  setIsProcessing: (processing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

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
/* 3.  Default values                                                  */
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
};

/* ------------------------------------------------------------------ */
/* 4.  Store creator                                                   */
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

  /* --- image management initial state --- */
  images: [],
  selectedImageId: null,
  resizeDraft: null,

  /* --- history --- */
  history: [],
  historyIndex: -1,

  /* --- basic actions (unchanged) --- */
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
    const currentIndex = state.images.findIndex((img) => img.id === state.selectedImageId);
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
          ? { ...img, rotation: ((img.rotation || 0) + degrees) % 360 }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  flipImageHorizontal: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, flipHorizontal: !img.flipHorizontal }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  flipImageVertical: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, flipVertical: !img.flipVertical }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  resetImage: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, rotation: 0, flipHorizontal: false, flipVertical: false }
          : img
      ),
      hasUnsavedChanges: true,
    })),

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) =>
    set({ resizeDraft: draft }),

  applyResize: () => {
    const state = get();
    const selectedImage = state.images.find((img) => img.id === state.selectedImageId);
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

  // Apply operations (placeholder implementations - will need full canvas logic)
  applyBlur: async () => {
    const state = get();
    const selectedImage = state.images.find((img) => img.id === state.selectedImageId);
    if (!selectedImage || state.blurBrushStrokes.length === 0) {
      console.log("No blur strokes to apply");
      return;
    }

    try {
      // Create a canvas to apply the blur
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      // Set canvas dimensions to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply each blur stroke
      for (const stroke of state.blurBrushStrokes) {
        // Create a temporary canvas for the blurred version
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) continue;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Draw the original image with blur filter
        tempCtx.filter = `blur(${stroke.blurAmount}px)`;
        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = "none";

        // Create a mask for the stroke path
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        
        // Draw the brush stroke path
        if (stroke.points.length === 1) {
          // Single point - draw a circle
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.brushSize / 2, 0, Math.PI * 2);
        } else {
          // Multiple points - draw connected strokes
          for (let i = 0; i < stroke.points.length; i++) {
            const point = stroke.points[i];
            ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2);
          }
        }
        
        ctx.clip();
        
        // Draw the blurred image only within the clipped area
        ctx.drawImage(tempCanvas, 0, 0);
        
        ctx.restore();
      }

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const blurredUrl = URL.createObjectURL(blob);
      
      // Update the image with the blurred version
      set((currentState) => ({
        images: currentState.images.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: blurredUrl,
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
              }
            : img
        ),
        blurBrushStrokes: [], // Clear strokes after applying
        hasUnsavedChanges: true,
      }));

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== (selectedImage as any).compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

    } catch (error) {
      console.error("Error applying blur:", error);
    }
  },

  applyCrop: async () => {
    const state = get();
    const selectedImage = state.images.find((img) => img.id === state.selectedImageId);
    
    if (!selectedImage || !state.completedCrop || !state.completedCrop.width || !state.completedCrop.height) {
      console.log("No crop data available");
      return;
    }

    try {
      // Create a canvas to apply the crop
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      // Calculate crop dimensions based on the unit
      let cropX, cropY, cropWidth, cropHeight;
      
      if (state.completedCrop.unit === '%') {
        // Convert percentage to pixels
        cropX = (state.completedCrop.x / 100) * img.naturalWidth;
        cropY = (state.completedCrop.y / 100) * img.naturalHeight;
        cropWidth = (state.completedCrop.width / 100) * img.naturalWidth;
        cropHeight = (state.completedCrop.height / 100) * img.naturalHeight;
      } else {
        // Already in pixels
        cropX = state.completedCrop.x;
        cropY = state.completedCrop.y;
        cropWidth = state.completedCrop.width;
        cropHeight = state.completedCrop.height;
      }
      
      // Set canvas dimensions to the crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the cropped portion of the image
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

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const croppedUrl = URL.createObjectURL(blob);
      
      // Update the image with the cropped version
      set((currentState) => ({
        images: currentState.images.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: croppedUrl,
                width: Math.round(cropWidth),
                height: Math.round(cropHeight),
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
                crop: {
                  x: state.completedCrop!.x,
                  y: state.completedCrop!.y,
                  width: state.completedCrop!.width,
                  height: state.completedCrop!.height,
                },
              }
            : img
        ),
        crop: undefined,
        completedCrop: undefined,
        hasUnsavedChanges: true,
      }));

      // Clean up the old URL to prevent memory leaks
      if (selectedImage.url !== (selectedImage as any).compressedUrl) {
        URL.revokeObjectURL(selectedImage.url);
      }

    } catch (error) {
      console.error("Error applying crop:", error);
    }
  },

  applyPaint: async () => {
    const state = get();
    const selectedImage = state.images.find((img) => img.id === state.selectedImageId);
    if (!selectedImage || state.paintStrokes.length === 0) {
      console.log("No paint strokes to apply");
      return;
    }

    try {
      // Create a canvas to apply the paint
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = selectedImage.url;
      });

      // Set canvas dimensions to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply each paint stroke
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

      // Convert canvas to blob and create new URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png", 1.0);
      });

      const paintedUrl = URL.createObjectURL(blob);
      
      // Update the image with the painted version
      set((currentState) => ({
        images: currentState.images.map((img) =>
          img.id === selectedImage.id
            ? {
                ...img,
                url: paintedUrl,
                file: new File([blob], img.file.name, { type: blob.type }),
                size: blob.size,
              }
            : img
        ),
        paintStrokes: [], // Clear strokes after applying
        hasUnsavedChanges: true,
      }));

      // Clean up the old URL to prevent memory leaks
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
