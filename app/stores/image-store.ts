import { create } from "zustand";
import type { ImageFile } from "../types/types";

interface ImageStore {
  // Image state
  images: ImageFile[];
  selectedImageId: string | null;
  resizeDraft: { width: number; height: number } | null;

  // Image management actions
  setImages: (images: ImageFile[]) => void;
  addImages: (images: ImageFile[]) => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  selectImage: (id: string | null) => void;
  getSelectedImage: () => ImageFile | null;
  navigateImage: (direction: "next" | "prev") => void;

  // Image transformations
  rotateImage: (id: string, degrees: number) => void;
  flipImageHorizontal: (id: string) => void;
  flipImageVertical: (id: string) => void;
  resetImage: (id: string) => void;

  // Resize operations
  setResizeDraft: (draft: { width: number; height: number } | null) => void;
  applyResize: () => void;
}

export const useImageStore = create<ImageStore>((set, get) => ({
  // Initial state
  images: [],
  selectedImageId: null,
  resizeDraft: null,

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
    set((state) => ({
      images: [...state.images, ...newImages],
      selectedImageId:
        state.images.length === 0 &&
        newImages.length > 0 &&
        !state.selectedImageId
          ? newImages[0].id
          : state.selectedImageId,
    })),

  updateImage: (id: string, updates: Partial<ImageFile>) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    })),

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
}));