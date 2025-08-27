import { create } from "zustand";
import type { EditorState } from "../types/types";

interface AppStateStore {
  // App state
  editorState: EditorState;
  isProcessing: boolean;
  hasUnsavedChanges: boolean;
  textSaveTrigger: (() => void) | null;

  // App state actions
  setEditorState: (state: EditorState) => void;
  setIsProcessing: (processing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setTextSaveTrigger: (trigger: (() => void) | null) => void;
  triggerTextSave: () => void;
}

export const useAppStateStore = create<AppStateStore>((set, get) => ({
  // Initial state
  editorState: "resizeAndOptimize",
  isProcessing: false,
  hasUnsavedChanges: false,
  textSaveTrigger: null,

  // App state actions
  setEditorState: (newState) => set({ editorState: newState }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  setTextSaveTrigger: (trigger) => set({ textSaveTrigger: trigger }),

  triggerTextSave: () => {
    const state = get();
    if (state.textSaveTrigger) {
      state.textSaveTrigger();
    }
  },
}));