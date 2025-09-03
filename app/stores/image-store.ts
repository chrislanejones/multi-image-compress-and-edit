import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ImageFile } from "../types/types";
import { useCompressionStore } from "./compression-store";
import { calculateCoreWebVitalsScore } from "../utils/core-web-vitals";
import { getImageDimensions } from "../utils/image-processing";
import { imageCache } from "../utils/simple-image-cache";
import { v4 as uuidv4 } from "uuid";

interface ImageStore {
  // Image state
  images: ImageFile[];
  selectedImageId: string | null;
  resizeDraft: { width: number; height: number } | null;
  
  // Persistence settings
  enableImageCache: boolean;
  enableOfflineMode: boolean;

  // Image management actions
  setImages: (images: ImageFile[]) => void;
  addImages: (images: ImageFile[]) => void;
  addImagesFromFiles: (files: File[]) => Promise<void>;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (id: string | null) => void;
  getSelectedImage: () => ImageFile | null;
  navigateImage: (direction: "next" | "prev") => void;
  
  // Utility functions
  getImageStats: () => {
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    savingsPercent: number;
    imageCount: number;
  };
  
  // Persistence settings actions
  setEnableImageCache: (enabled: boolean) => void;
  setEnableOfflineMode: (enabled: boolean) => void;
  
  // IndexedDB operations
  loadImagesFromCache: () => Promise<void>;
  clearImageCache: () => Promise<void>;

  // Image transformations
  rotateImage: (id: string, degrees: number) => void;
  flipImageHorizontal: (id: string) => void;
  flipImageVertical: (id: string) => void;
  resetImage: (id: string) => void;
  resetCompression: (id: string) => void;

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) => void;
  applyResize: () => void;
}

export const useImageStore = create<ImageStore>()(persist((set, get) => ({
  // Initial state
  images: [],
  selectedImageId: null,
  resizeDraft: null,
  enableImageCache: false, // Default disabled for performance
  enableOfflineMode: false,

  // Image management actions
  setImages: (images: ImageFile[]) =>
    set((state) => ({
      images,
      selectedImageId:
        images.length > 0 && !state.selectedImageId
          ? images[0].id
          : state.selectedImageId,
    })),

  addImages: (newImages: ImageFile[]) =>
    set((state) => {
      const updatedState = {
        images: [...state.images, ...newImages],
        selectedImageId:
          state.images.length === 0 &&
          newImages.length > 0 &&
          !state.selectedImageId
            ? newImages[0].id
            : state.selectedImageId,
      };
      
      // Cache images if enabled
      if (state.enableImageCache) {
        newImages.forEach(image => {
          imageCache.saveImage(image).catch(err => 
            console.warn('Failed to cache image:', err)
          );
        });
      }
      
      return updatedState;
    }),

  updateImage: (id: string, updates: Partial<ImageFile>) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    })),

  removeImage: (id: string) =>
    set((state) => {
      // Remove from IndexedDB cache if enabled
      if (state.enableImageCache) {
        imageCache.deleteImage(id).catch(err => 
          console.warn('Failed to remove image from cache:', err)
        );
      }
      
      return {
        images: state.images.filter((img) => img.id !== id),
        selectedImageId:
          state.selectedImageId === id ? null : state.selectedImageId,
      };
    }),

  removeAllImages: () =>
    set((state) => {
      // Clear IndexedDB cache if enabled
      if (state.enableImageCache) {
        imageCache.clear().catch(err => 
          console.warn('Failed to clear image cache:', err)
        );
      }
      
      return {
        images: [],
        selectedImageId: null,
        resizeDraft: null,
      };
    }),

  selectImage: (id: string | null) => set({ selectedImageId: id }),

  getSelectedImage: () => {
    const state = get();
    return state.images.find((img) => img.id === state.selectedImageId) || null;
  },

  navigateImage: (direction: "next" | "prev") => {
    const state = get();
    const currentIndex = state.images.findIndex(
      (img) => img.id === state.selectedImageId
    );
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "next") {
      newIndex = Math.min(currentIndex + 1, state.images.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    set({ selectedImageId: state.images[newIndex]?.id || null });
  },

  // Image transformations
  rotateImage: (id: string, degrees: number) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? {
              ...img,
              rotation: ((img.rotation || 0) + degrees) % 360,
            }
          : img
      ),
    })),

  flipImageHorizontal: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, flipHorizontal: !img.flipHorizontal } : img
      ),
    })),

  flipImageVertical: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, flipVertical: !img.flipVertical } : img
      ),
    })),

  resetImage: (id: string) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? {
              ...img,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
            }
          : img
      ),
    })),

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) =>
    set({ resizeDraft: draft }),

  applyResize: () => {
    const state = get();
    const selectedImage = state.images.find(
      (img) => img.id === state.selectedImageId
    );
    if (!selectedImage || !state.resizeDraft) return;

    set((currentState) => ({
      images: currentState.images.map((img) =>
        img.id === selectedImage.id
          ? {
              ...img,
              width: state.resizeDraft!.width,
              height: state.resizeDraft!.height,
            }
          : img
      ),
      resizeDraft: null,
    }));
  },
  
  // Compression operations
  resetCompression: (id: string) => {
    const compressionStore = useCompressionStore.getState();
    const originalData = compressionStore.resetCompression(id);
    
    if (originalData) {
      const originalWidth = originalData.metadata?.width || 0;
      const originalHeight = originalData.metadata?.height || 0;
      
      // Update the image with original data
      get().updateImage(id, {
        url: originalData.url,
        size: originalData.size,
        width: originalWidth,
        height: originalHeight,
        compressedUrl: undefined,
        compressedSize: undefined,
        metadata: {
          ...originalData.metadata,
          isCompressionReset: true,
          originalSize: originalData.size,
          width: originalWidth,
          height: originalHeight,
          coreWebVitalsScore: calculateCoreWebVitalsScore(
            originalWidth,
            originalHeight,
            originalData.size
          ),
        },
      });
      
      console.log(`🔄 Compression reset for image ${id}`);
    } else {
      console.warn(`No original data found for image ${id}`);
    }
  },
  
  // Utility function to add images from file objects
  addImagesFromFiles: async (files: File[]) => {
    const newImages: ImageFile[] = [];
    
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      
      try {
        const dimensions = await getImageDimensions(file);
        
        const newImage: ImageFile = {
          id: uuidv4(),
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
        };
        
        newImages.push(newImage);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    if (newImages.length > 0) {
      get().addImages(newImages);
    }
  },
  
  // Get statistics about all images
  getImageStats: () => {
    const state = get();
    const totalOriginalSize = state.images.reduce(
      (sum, img) => sum + img.size,
      0
    );
    const totalCompressedSize = state.images.reduce((sum, img) => {
      return sum + (img.compressedSize || img.size);
    }, 0);
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const savingsPercent =
      totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;

    return {
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      savingsPercent,
      imageCount: state.images.length,
    };
  },
  
  // Persistence settings
  setEnableImageCache: (enabled: boolean) =>
    set((state) => {
      if (!enabled && state.enableImageCache) {
        // Clear cache when disabled
        imageCache.clear().catch(err => 
          console.warn('Failed to clear cache:', err)
        );
      }
      return { enableImageCache: enabled };
    }),
    
  setEnableOfflineMode: (enabled: boolean) =>
    set({ enableOfflineMode: enabled }),
  
  // IndexedDB operations
  loadImagesFromCache: async () => {
    const state = get();
    if (!state.enableImageCache) return;
    
    try {
      const cachedImages = await imageCache.getAllImages();
      if (cachedImages.length > 0) {
        console.log(`Loaded ${cachedImages.length} images from cache`);
        set((state) => ({
          images: [...state.images, ...cachedImages],
          selectedImageId: state.selectedImageId || cachedImages[0]?.id || null,
        }));
      }
    } catch (error) {
      console.warn('Failed to load images from cache:', error);
    }
  },
  
  clearImageCache: async () => {
    try {
      await imageCache.clear();
      console.log('Image cache cleared');
    } catch (error) {
      console.warn('Failed to clear image cache:', error);
    }
  },
}), {
  name: 'imagehorse-image-store',
  partialize: (state) => ({
    enableImageCache: state.enableImageCache,
    enableOfflineMode: state.enableOfflineMode,
    // Don't persist selectedImageId or images - they're session-based
  }),
  onRehydrateStorage: () => (state) => {
    if (state && state.enableImageCache) {
      // Load cached images when store rehydrates
      setTimeout(() => state.loadImagesFromCache(), 100);
    }
  },
}));