import { create } from "zustand";
import type { EditorState, ImageFormat, CompressionLevel } from "../types";

interface EditorStore {
  editorState: EditorState;
  zoom: number;
  // Dimensions are now managed in ImageContext
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;

  setEditorState: (state: EditorState) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setQuality: (q: number) => void;
  setFormat: (f: ImageFormat) => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  handleReset: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  editorState: "resizeAndOptimize",
  zoom: 100,
  quality: 85,
  format: "webp",
  compressionLevel: "medium",
  setEditorState: (newState) => set({ editorState: newState }),
  onZoomIn: () => set((state) => ({ zoom: Math.min(400, state.zoom + 25) })),
  onZoomOut: () => set((state) => ({ zoom: Math.max(25, state.zoom - 25) })),
  setQuality: (q) => set({ quality: q }),
  setFormat: (f) => set({ format: f }),
  setCompressionLevel: (level) => set({ compressionLevel: level }),
  handleReset: () => set({ quality: 85, format: "webp", compressionLevel: "medium" }),
}));
