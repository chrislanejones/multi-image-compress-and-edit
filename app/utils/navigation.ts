import { useNavigate } from '@tanstack/react-router'

export type EditorState = 
  | "resizeAndOptimize"  // Route 1 - Gallery
  | "editImage"          // Route 2 - Editor
  | "bulkImageEdit"      // Route 2 - Bulk Editor  
  | "aiEditor"           // Route 2 - AI Editor (coming soon)
  | "crop"               // Route 3 - Crop Tool
  | "blur"               // Route 3 - Blur Tool
  | "paint"              // Route 3 - Paint Tool
  | "text"               // Route 3 - Text Tool
  | "bulkCrop"           // Route 3 - Bulk Crop Tool
  | "bulkTextEditor"     // Route 3 - Bulk Text Tool

export type NavigationDirection = "next" | "prev" | "next10" | "prev10"

export function useEditorNavigation() {
  const navigate = useNavigate()

  // Route 0 -> Route 1 (Upload to Gallery)
  const goToGallery = () => {
    navigate({ 
      to: '/gallery', 
      search: { state: 'resizeAndOptimize' } 
    })
  }

  // Route 1 -> Route 0 (Gallery back to Upload)
  const goToUpload = () => {
    navigate({ to: '/' })
  }

  // Route 1 -> Route 2 (Gallery to Editor)
  const goToEditor = (imageId: string, state: EditorState = 'editImage') => {
    // Route 2 states: editImage, bulkImageEdit, aiEditor
    if (['editImage', 'bulkImageEdit', 'aiEditor'].includes(state)) {
      navigate({ 
        to: '/edit/$imageId', 
        params: { imageId },
        search: { state }
      })
    }
    // Route 3 states: crop, blur, paint, text, bulkCrop, bulkTextEditor  
    else if (['crop', 'blur', 'paint', 'text', 'bulkCrop', 'bulkTextEditor'].includes(state)) {
      navigate({
        to: '/edit/$imageId/tool/$toolType',
        params: { imageId, toolType: state }
      })
    }
  }

  // Route 2 -> Route 1 (Editor back to Gallery)
  const goBackToGallery = () => {
    navigate({ 
      to: '/gallery', 
      search: { state: 'resizeAndOptimize' } 
    })
  }

  // Route 2 -> Route 3 (Editor to Tool)
  const goToTool = (imageId: string, toolType: string) => {
    navigate({
      to: '/edit/$imageId/tool/$toolType',
      params: { imageId, toolType }
    })
  }

  // Route 3 -> Route 2 (Tool back to Editor)
  const goBackToEditor = (imageId: string, state: EditorState = 'editImage') => {
    navigate({ 
      to: '/edit/$imageId', 
      params: { imageId },
      search: { state }
    })
  }

  return {
    goToGallery,
    goToUpload, 
    goToEditor,
    goBackToGallery,
    goToTool,
    goBackToEditor
  }
}
