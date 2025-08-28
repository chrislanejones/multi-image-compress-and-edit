import { create } from "zustand";
import type { BlurStroke } from "../types/types";

interface BlurStore {
  // Blur state
  blurAmount: number;
  brushSize: number;
  blurBrushStrokes: BlurStroke[];
  isBlurBrushing: boolean;

  // Blur actions
  setBlurAmount: (amount: number) => void;
  setBrushSize: (size: number) => void;
  addBlurStroke: (stroke: BlurStroke) => void;
  clearBlurStrokes: () => void;
  undoLastBlurStroke: () => void;
  setIsBlurBrushing: (brushing: boolean) => void;
}

const DEFAULT_VALUES = {
  blurAmount: 5,
  brushSize: 10,
};

export const useBlurStore = create<BlurStore>((set) => ({
  // Initial state
  blurAmount: DEFAULT_VALUES.blurAmount,
  brushSize: DEFAULT_VALUES.brushSize,
  blurBrushStrokes: [],
  isBlurBrushing: false,

  // Blur actions
  setBlurAmount: (amount) =>
    set({
      blurAmount: Math.max(1, Math.min(20, amount)),
    }),

  setBrushSize: (size) =>
    set({
      brushSize: Math.max(1, Math.min(50, size)),
    }),

  addBlurStroke: (stroke) =>
    set((state) => ({
      blurBrushStrokes: [...state.blurBrushStrokes, stroke],
    })),

  clearBlurStrokes: () =>
    set({
      blurBrushStrokes: [],
    }),

  undoLastBlurStroke: () =>
    set((state) => ({
      blurBrushStrokes: state.blurBrushStrokes.slice(0, -1),
    })),

  setIsBlurBrushing: (brushing) => set({ isBlurBrushing: brushing }),
}));
