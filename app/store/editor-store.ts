// editor-store.ts  (complete replacement)

import { create } from "zustand";
import type {
  EditorState,
  ImageFormat,
  CompressionLevel,
} from "../types/types";
import type { Crop } from "react-image-crop";

/* ------------------------------------------------------------------ */
/* 1.  History snapshot type                                           */
/* ------------------------------------------------------------------ */
interface HistorySnapshot {
  url: string;
  width: number;
  height: number;
  crop?: Crop;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;
}

/* ------------------------------------------------------------------ */
/* 2.  Store interface                                                 */
/* ------------------------------------------------------------------ */
interface EditorStore {
  /* --- existing fields --- */
  editorState: EditorState;
  zoom: number;
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;
  blurAmount: number;
  blurRadius: number;
  brushSize: number;
  brushColor: string;
  crop: Crop | undefined;
  completedCrop: Crop | undefined;
  cropZoom: number;
  isProcessing: boolean;
  hasUnsavedChanges: boolean;

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
  setBlurRadius: (radius: number) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;

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
  blurRadius: 10,
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
  blurRadius: DEFAULT_VALUES.blurRadius,
  brushSize: DEFAULT_VALUES.brushSize,
  brushColor: DEFAULT_VALUES.brushColor,
  crop: undefined,
  completedCrop: undefined,
  cropZoom: DEFAULT_VALUES.cropZoom,
  isProcessing: false,
  hasUnsavedChanges: false,

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
  setBlurRadius: (radius) =>
    set({
      blurRadius: Math.max(5, Math.min(50, radius)),
      hasUnsavedChanges: true,
    }),
  setBrushSize: (size) =>
    set({
      brushSize: Math.max(1, Math.min(50, size)),
      hasUnsavedChanges: true,
    }),
  setBrushColor: (color) => set({ brushColor: color, hasUnsavedChanges: true }),

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
      blurRadius: DEFAULT_VALUES.blurRadius,
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

  /* --- convenience selectors --- */
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
