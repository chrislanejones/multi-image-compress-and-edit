import { createContext, useContext, type ReactNode } from 'react'

const ImageContext = createContext<any>(null)

export function useImageContext() {
  const context = useContext(ImageContext)
  if (!context) {
    throw new Error('useImageContext must be used within ImageProvider')
  }
  return context
}

export function ImageProvider({ children }: { children: ReactNode }) {
  return (
    <ImageContext.Provider value={{}}>
      {children}
    </ImageContext.Provider>
  )
}
