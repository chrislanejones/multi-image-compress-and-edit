import { create } from "zustand";
import type {
  EditorState,
  ImageFormat,
  CompressionLevel,
} from "../types/types";
import type { Crop } from "react-image-crop";

interface EditorStore {
  // Core editor state
  editorState: EditorState;
  zoom: number;

  // Image processing settings
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;

  // Tool-specific settings
  blurAmount: number;
  blurRadius: number;
  brushSize: number;
  brushColor: string;
  
  // Crop state
  crop: Crop | undefined;
  completedCrop: Crop | undefined;
  cropZoom: number;

  // UI state
  isProcessing: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setEditorState: (state: EditorState) => void;
  setZoom: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;

  // Settings actions
  setQuality: (quality: number) => void;
  setFormat: (format: ImageFormat) => void;
  setCompressionLevel: (level: CompressionLevel) => void;

  // Tool actions
  setBlurAmount: (amount: number) => void;
  setBlurRadius: (radius: number) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  
  // Crop actions
  setCrop: (crop: Crop | undefined) => void;
  setCompletedCrop: (crop: Crop | undefined) => void;
  setCropZoom: (zoom: number) => void;
  onCropZoomIn: () => void;
  onCropZoomOut: () => void;
  resetCrop: () => void;

  // Processing state
  setIsProcessing: (processing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Reset functions
  handleReset: () => void;
  resetToDefaults: () => void;
}

// Default values
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

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
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

  // Basic actions
  setEditorState: (newState) => set({ editorState: newState }),

  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),

  onZoomIn: () =>
    set((state) => ({
      zoom: Math.min(400, state.zoom + 25),
    })),

  onZoomOut: () =>
    set((state) => ({
      zoom: Math.max(25, state.zoom - 25),
    })),

  // Settings actions
  setQuality: (quality) =>
    set({
      quality: Math.max(1, Math.min(100, quality)),
      hasUnsavedChanges: true,
    }),

  setFormat: (format) =>
    set({
      format,
      hasUnsavedChanges: true,
    }),

  setCompressionLevel: (level) => {
    // Auto-update quality based on compression level
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

  // Tool actions
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

  setBrushColor: (color) =>
    set({
      brushColor: color,
      hasUnsavedChanges: true,
    }),

  // Crop actions
  setCrop: (crop) => set({ crop }),
  
  setCompletedCrop: (crop) => set({ completedCrop: crop }),
  
  setCropZoom: (zoom) => set({ cropZoom: Math.max(50, Math.min(300, zoom)) }),
  
  onCropZoomIn: () =>
    set((state) => ({
      cropZoom: Math.min(300, state.cropZoom + 10),
    })),
    
  onCropZoomOut: () =>
    set((state) => ({
      cropZoom: Math.max(50, state.cropZoom - 10),
    })),
    
  resetCrop: () =>
    set({
      crop: undefined,
      completedCrop: undefined,
      cropZoom: DEFAULT_VALUES.cropZoom,
    }),

  // Processing state
  setIsProcessing: (processing) => set({ isProcessing: processing }),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  // Reset functions
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
}));
