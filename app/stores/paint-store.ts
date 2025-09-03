import { create } from "zustand";
import type { PaintStroke, ArrowShape, Shape, EmojiShape } from "../types/types";

interface PaintStore {
  // Paint state
  paintStrokes: PaintStroke[];
  isPainting: boolean;
  paintTool: "brush" | "eraser" | "arrow" | "double" | "emoji";
  brushSize: number;
  brushColor: string;

  // Shape state
  shapes: Shape[];
  arrowColor: string;
  arrowWidth: number;
  currentEmoji: string;

  // Paint actions
  addPaintStroke: (stroke: PaintStroke) => void;
  clearPaintStrokes: () => void;
  undoLastPaintStroke: () => void;
  setIsPainting: (painting: boolean) => void;
  setPaintTool: (tool: "brush" | "eraser" | "arrow" | "double" | "emoji") => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;

  // Shape actions
  addShape: (shape: Shape) => void;
  clearShapes: () => void;
  undoLastShape: () => void;
  setArrowStyle: (color: string, width: number) => void;
  setCurrentEmoji: (emoji: string) => void;

  // Utility actions
  clearAll: () => void;
}

const DEFAULT_VALUES = {
  brushSize: 10,
  brushColor: "#ff0000",
  arrowColor: "#ff0000",
  arrowWidth: 6,
  currentEmoji: "😊",
};

export const usePaintStore = create<PaintStore>((set) => ({
  // Initial state
  paintStrokes: [],
  isPainting: false,
  paintTool: "brush",
  brushSize: DEFAULT_VALUES.brushSize,
  brushColor: DEFAULT_VALUES.brushColor,
  shapes: [],
  arrowColor: DEFAULT_VALUES.arrowColor,
  arrowWidth: DEFAULT_VALUES.arrowWidth,
  currentEmoji: DEFAULT_VALUES.currentEmoji,

  // Paint actions
  addPaintStroke: (stroke) =>
    set((state) => ({
      paintStrokes: [...state.paintStrokes, stroke],
    })),

  clearPaintStrokes: () =>
    set({
      paintStrokes: [],
    }),

  undoLastPaintStroke: () =>
    set((state) => ({
      paintStrokes: state.paintStrokes.slice(0, -1),
    })),

  setIsPainting: (painting) => set({ isPainting: painting }),

  setPaintTool: (tool) => set({ paintTool: tool }),

  setBrushSize: (size) =>
    set({
      brushSize: Math.max(1, Math.min(50, size)),
    }),

  setBrushColor: (color) => set({ brushColor: color }),

  // Shape actions
  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
    })),

  clearShapes: () =>
    set({
      shapes: [],
    }),

  undoLastShape: () =>
    set((state) => ({
      shapes: state.shapes.slice(0, -1),
    })),

  setArrowStyle: (color, width) =>
    set({
      arrowColor: color,
      arrowWidth: Math.max(1, Math.min(50, width)),
    }),

  setCurrentEmoji: (emoji) => set({ currentEmoji: emoji }),

  // Utility actions
  clearAll: () =>
    set({
      paintStrokes: [],
      shapes: [],
    }),
}));