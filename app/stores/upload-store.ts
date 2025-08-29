import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TerminalEntry {
  text: string;
  type?: 'command' | 'info' | 'success' | 'error' | 'progress';
}

interface UploadStore {
  // Terminal output
  terminalOutput: TerminalEntry[];
  hasProcessedImages: boolean;
  
  // Actions
  addTerminalLine: (text: string, type?: TerminalEntry['type']) => void;
  setTerminalOutput: (output: TerminalEntry[]) => void;
  clearTerminal: () => void;
  setHasProcessedImages: (hasProcessed: boolean) => void;
}

export const useUploadStore = create<UploadStore>()(
  persist(
    (set) => ({
      // Initial state
      terminalOutput: [],
      hasProcessedImages: false,

      // Actions
      addTerminalLine: (text, type = 'info') =>
        set((state) => ({
          terminalOutput: [...state.terminalOutput, { text, type }],
        })),

      setTerminalOutput: (output) => set({ terminalOutput: output }),

      clearTerminal: () => set({ terminalOutput: [], hasProcessedImages: false }),

      setHasProcessedImages: (hasProcessed) => set({ hasProcessedImages: hasProcessed }),
    }),
    {
      name: "imagehorse-upload-store",
      partialize: (state) => ({ 
        terminalOutput: state.terminalOutput,
        hasProcessedImages: state.hasProcessedImages 
      }),
    }
  )
);