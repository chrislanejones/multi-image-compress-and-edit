import { create } from "zustand";
import type { ImageFormat, CompressionLevel } from "../types/types";

interface CompressionStore {
  // Compression state
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;

  // Compression actions
  setQuality: (quality: number) => void;
  setFormat: (format: ImageFormat) => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  resetToDefaults: () => void;
}

const DEFAULT_VALUES = {
  quality: 85,
  format: "webp" as ImageFormat,
  compressionLevel: "medium" as CompressionLevel,
};

export const useCompressionStore = create<CompressionStore>((set) => ({
  // Initial state
  quality: DEFAULT_VALUES.quality,
  format: DEFAULT_VALUES.format,
  compressionLevel: DEFAULT_VALUES.compressionLevel,

  // Compression actions
  setQuality: (quality) =>
    set({
      quality: Math.max(1, Math.min(100, quality)),
    }),

  setFormat: (format) => set({ format }),

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
    });
  },

  resetToDefaults: () =>
    set({
      quality: DEFAULT_VALUES.quality,
      format: DEFAULT_VALUES.format,
      compressionLevel: DEFAULT_VALUES.compressionLevel,
    }),
}));