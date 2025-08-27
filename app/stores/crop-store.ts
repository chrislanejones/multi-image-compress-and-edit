import { create } from "zustand";
import type { Crop } from "react-image-crop";

interface CropStore {
  // Crop state
  crop: Crop | undefined;
  completedCrop: Crop | undefined;

  // Crop actions
  setCrop: (crop: Crop | undefined) => void;
  setCompletedCrop: (crop: Crop | undefined) => void;
  resetCrop: () => void;
}

export const useCropStore = create<CropStore>((set) => ({
  // Initial state
  crop: undefined,
  completedCrop: undefined,

  // Crop actions
  setCrop: (crop) => set({ crop }),

  setCompletedCrop: (crop) => set({ completedCrop: crop }),

  resetCrop: () =>
    set({
      crop: undefined,
      completedCrop: undefined,
    }),
}));