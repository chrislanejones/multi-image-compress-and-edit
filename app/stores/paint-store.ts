import { create } from "zustand";
import type { PaintStroke } from "../types/types";

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

interface PaintStore {
  // Paint state
  paintStrokes: PaintStroke[];
  isPainting: boolean;
  paintTool: "brush" | "eraser" | "emoji" | "arrow" | "double";
  brushSize: number;
  brushColor: string;

  // Shape state
  shapes: Shape[];
  currentEmoji: string;
  arrowColor: string;
  arrowWidth: number;

  // Paint actions
  addPaintStroke: (stroke: PaintStroke) => void;
  clearPaintStrokes: () => void;
  undoLastPaintStroke: () => void;
  setIsPainting: (painting: boolean) => void;
  setPaintTool: (tool: "brush" | "eraser" | "emoji" | "arrow" | "double") => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;

  // Shape actions
  addShape: (shape: Shape) => void;
  clearShapes: () => void;
  undoLastShape: () => void;
  setCurrentEmoji: (emoji: string) => void;
  setArrowStyle: (color: string, width: number) => void;

  // Utility actions
  clearAll: () => void;
}

const DEFAULT_VALUES = {
  brushSize: 10,
  brushColor: "#ff0000",
  currentEmoji: "😊",
  arrowColor: "#ff0000",
  arrowWidth: 6,
};

export const usePaintStore = create<PaintStore>((set) => ({
  // Initial state
  paintStrokes: [],
  isPainting: false,
  paintTool: "brush",
  brushSize: DEFAULT_VALUES.brushSize,
  brushColor: DEFAULT_VALUES.brushColor,
  shapes: [],
  currentEmoji: DEFAULT_VALUES.currentEmoji,
  arrowColor: DEFAULT_VALUES.arrowColor,
  arrowWidth: DEFAULT_VALUES.arrowWidth,

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

  setCurrentEmoji: (emoji) => set({ currentEmoji: emoji }),

  setArrowStyle: (color, width) =>
    set({
      arrowColor: color,
      arrowWidth: Math.max(1, Math.min(50, width)),
    }),

  // Utility actions
  clearAll: () =>
    set({
      paintStrokes: [],
      shapes: [],
    }),
}));