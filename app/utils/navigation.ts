import { useNavigate } from '@tanstack/react-router';

export type EditorState = 
  | "resizeAndOptimize"
  | "editImage"
  | "bulkImageEdit"
  | "aiEditor"
  | "crop"
  | "blur"
  | "paint"
  | "text"
  | "bulkCrop"
  | "bulkTextEditor";

export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

export function useEditorNavigation() {
  const navigate = useNavigate();

  const goToGallery = () => {
    navigate({ 
      to: '/gallery', 
      search: { state: 'resizeAndOptimize' },
    });
  }

  const goToUpload = () => {
    navigate({ to: '/' });
  }

  const goToEditor = (imageId: string, state: EditorState) => {
    if (['editImage', 'bulkImageEdit', 'aiEditor'].includes(state)) {
      navigate({ 
        to: '/edit/$imageId', 
        params: { imageId },
        search: { state }, 
      });
    }
  }

  const goBackToGallery = () => {
    navigate({ 
      to: '/gallery', 
      search: { state: 'resizeAndOptimize' },
    });
  }

  return {
    goToGallery,
    goToUpload, 
    goToEditor,
    goBackToGallery,
  }
}
