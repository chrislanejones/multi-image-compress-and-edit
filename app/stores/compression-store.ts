import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ImageFormat, CompressionLevel, CoreWebVitalsScore } from "../types/types";

interface CompressionStore {
  // Compression state
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;
  compressingIds: Set<string>;
  
  // Core Web Vitals compression state
  coreWebVitalsEnabled: boolean;
  compressedImages: Set<string>; // Track which images have been CWV compressed
  originalImages: Map<string, { url: string; size: number; metadata?: any }>; // Store originals for reset

  // Compression actions
  setQuality: (quality: number) => void;
  setFormat: (format: ImageFormat) => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  resetToDefaults: () => void;
  
  // Core Web Vitals actions
  setCoreWebVitalsEnabled: (enabled: boolean) => void;
  addCompressedImage: (id: string, originalData: { url: string; size: number; metadata?: any }) => void;
  removeCompressedImage: (id: string) => void;
  resetCompression: (id: string) => { url: string; size: number; metadata?: any } | null;
  
  // Processing tracking
  startCompressing: (id: string) => void;
  stopCompressing: (id: string) => void;
  isCompressing: (id: string) => boolean;
}

const DEFAULT_VALUES = {
  quality: 85,
  format: "webp" as ImageFormat,
  compressionLevel: "medium" as CompressionLevel,
  coreWebVitalsEnabled: true,
};

export const useCompressionStore = create<CompressionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      quality: DEFAULT_VALUES.quality,
      format: DEFAULT_VALUES.format,
      compressionLevel: DEFAULT_VALUES.compressionLevel,
      compressingIds: new Set<string>(),
      coreWebVitalsEnabled: DEFAULT_VALUES.coreWebVitalsEnabled,
      compressedImages: new Set<string>(),
      originalImages: new Map(),

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

      // Core Web Vitals actions
      setCoreWebVitalsEnabled: (enabled) => set({ coreWebVitalsEnabled: enabled }),

      addCompressedImage: (id, originalData) =>
        set((state) => ({
          compressedImages: new Set([...state.compressedImages, id]),
          originalImages: new Map([...state.originalImages, [id, originalData]]),
        })),

      removeCompressedImage: (id) =>
        set((state) => {
          const newCompressed = new Set(state.compressedImages);
          const newOriginals = new Map(state.originalImages);
          newCompressed.delete(id);
          newOriginals.delete(id);
          return {
            compressedImages: newCompressed,
            originalImages: newOriginals,
          };
        }),

      resetCompression: (id) => {
        const originalData = get().originalImages.get(id);
        if (originalData) {
          set((state) => {
            const newCompressed = new Set(state.compressedImages);
            const newOriginals = new Map(state.originalImages);
            newCompressed.delete(id);
            newOriginals.delete(id);
            return {
              compressedImages: newCompressed,
              originalImages: newOriginals,
            };
          });
          return originalData;
        }
        return null;
      },

      // Processing tracking
      startCompressing: (id) =>
        set((state) => ({
          compressingIds: new Set([...state.compressingIds, id]),
        })),

      stopCompressing: (id) =>
        set((state) => {
          const newSet = new Set(state.compressingIds);
          newSet.delete(id);
          return { compressingIds: newSet };
        }),

      isCompressing: (id) => get().compressingIds.has(id),
    }),
    {
      name: "imagehorse-compression-store",
      partialize: (state) => ({
        coreWebVitalsEnabled: state.coreWebVitalsEnabled,
        compressedImages: Array.from(state.compressedImages),
        originalImages: Array.from(state.originalImages.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Sets and Maps
          state.compressedImages = new Set(state.compressedImages || []);
          state.originalImages = new Map(state.originalImages || []);
        }
      },
    }
  )
);
