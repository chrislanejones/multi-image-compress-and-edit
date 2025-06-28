import { useState, useCallback } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import type { EditorState } from '../utils/navigation';

export function useEditorState() {
  const navigate = useNavigate();
  const params = useParams();
  const search = useSearch();

  // Get current state from URL
  const getCurrentState = useCallback((): EditorState => {
    const pathname = window.location.pathname;
    
    if (pathname === '/') return 'resizeAndOptimize';
    if (pathname === '/gallery') return search.state || 'resizeAndOptimize';
    if (pathname.includes('/edit/') && pathname.includes('/tool/')) {
      const toolType = pathname.split('/tool/')[1];
      return toolType as EditorState;
    }
    if (pathname.includes('/edit/')) {
      return search.state || 'editImage';
    }
    
    return 'resizeAndOptimize';
  }, [search]);

  // Navigate to state
  const navigateToState = useCallback((state: EditorState, imageId?: string) => {
    const currentImageId = imageId || params.imageId;
    
    switch (state) {
      case 'resizeAndOptimize':
        navigate({ to: '/gallery', search: { state } });
        break;
        
      case 'editImage':
      case 'bulkImageEdit':
      case 'aiEditor':
        if (currentImageId) {
          navigate({ 
            to: '/edit/$imageId', 
            params: { imageId: currentImageId },
            search: { state }
          });
        }
        break;
        
      case 'crop':
      case 'blur':
      case 'paint':
      case 'text':
      case 'bulkCrop':
      case 'bulkTextEditor':
        if (currentImageId) {
          navigate({
            to: '/edit/$imageId/tool/$toolType',
            params: { imageId: currentImageId, toolType: state }
          });
        }
        break;
    }
  }, [navigate, params]);

  return {
    getCurrentState,
    navigateToState,
    currentState: getCurrentState()
  };
}
