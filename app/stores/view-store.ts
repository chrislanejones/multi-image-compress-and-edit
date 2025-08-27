import { create } from "zustand";

interface ViewStore {
  // Zoom state
  globalZoom: number;
  cropZoom: number;

  // Zoom actions
  setGlobalZoom: (zoom: number) => void;
  globalZoomIn: () => void;
  globalZoomOut: () => void;
  resetZoom: () => void;

  // Crop zoom actions
  setCropZoom: (zoom: number) => void;
  onCropZoomIn: () => void;
  onCropZoomOut: () => void;
  resetCropZoom: () => void;
}

const DEFAULT_VALUES = {
  globalZoom: 100,
  cropZoom: 100,
};

export const useViewStore = create<ViewStore>((set) => ({
  // Initial state
  globalZoom: DEFAULT_VALUES.globalZoom,
  cropZoom: DEFAULT_VALUES.cropZoom,

  // Global zoom actions
  setGlobalZoom: (zoom) =>
    set({
      globalZoom: Math.max(25, Math.min(400, zoom)),
    }),
  globalZoomIn: () =>
    set((state) => ({
      globalZoom: Math.min(400, state.globalZoom + 25),
    })),
  globalZoomOut: () =>
    set((state) => ({
      globalZoom: Math.max(25, state.globalZoom - 25),
    })),
  resetZoom: () =>
    set({
      globalZoom: DEFAULT_VALUES.globalZoom,
    }),

  // Crop zoom actions
  setCropZoom: (zoom) => set({ cropZoom: Math.max(50, Math.min(300, zoom)) }),
  onCropZoomIn: () =>
    set((state) => ({ cropZoom: Math.min(300, state.cropZoom + 10) })),
  onCropZoomOut: () =>
    set((state) => ({ cropZoom: Math.max(50, state.cropZoom - 10) })),
  resetCropZoom: () =>
    set({
      cropZoom: DEFAULT_VALUES.cropZoom,
    }),
}));