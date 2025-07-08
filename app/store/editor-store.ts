// app/store/editor-store.ts
import { create } from "zustand"; // Corrected import
import { EditorState } from "../types";

interface EditorStore {
  editorState: EditorState;
  zoom: number;
  blurAmount: number;
  blurRadius: number;
  setEditorState: (state: EditorState) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setBlurAmount: (value: number) => void;
  setBlurRadius: (value: number) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Initial State
  editorState: "resizeAndOptimize",
  zoom: 100,
  blurAmount: 10,
  blurRadius: 25,

  // Actions
  setEditorState: (newState) => set({ editorState: newState }),
  onZoomIn: () => set((state) => ({ zoom: Math.min(400, state.zoom + 25) })),
  onZoomOut: () => set((state) => ({ zoom: Math.max(25, state.zoom - 25) })),
  setBlurAmount: (value) => set({ blurAmount: value }),
  setBlurRadius: (value) => set({ blurRadius: value }),
}));
