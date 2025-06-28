"use client";

import { useCallback } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import type { EditorState } from '../types';

export function useEditorState() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });

  const getCurrentState = useCallback((): EditorState => {
    const pathname = window.location.pathname;
    
    if (pathname === '/') return 'resizeAndOptimize';

    if (pathname.startsWith('/gallery')) {
      return (search as any)?.state || 'resizeAndOptimize';
    }

    if (pathname.startsWith('/edit/')) {
      if (pathname.includes('/tool/')) {
        const toolTypeMatch = pathname.match(/\/tool\/([^/]+)/);
        if (toolTypeMatch && toolTypeMatch[1]) {
          const tool = toolTypeMatch[1] as EditorState;
          if (['crop', 'blur', 'paint', 'text', 'bulkCrop', 'bulkTextEditor', 'aiEditor'].includes(tool)) {
            return tool;
          }
        }
        return 'editImage';
      } else {
        return (search as any)?.state || 'editImage';
      }
    }
    
    return 'resizeAndOptimize'; 
  }, [search, params]);

  const navigateToState = useCallback((state: EditorState, imageId?: string) => {
    const currentImageId = imageId || (params as any)?.imageId; 

    switch (state) {
      case 'resizeAndOptimize':
        navigate({
          to: '/gallery',
          search: { state: 'resizeAndOptimize' },
        });
        break;
        
      case 'editImage':
      case 'bulkImageEdit':
      case 'aiEditor':
        if (currentImageId) {
          navigate({ 
            to: '/edit/$imageId', 
            params: { imageId: currentImageId },
            search: { state },
          });
        }
        break;
        
      default:
        console.warn(`Navigating to unknown editor state: ${state}`);
        navigate({ to: '/gallery' });
        break;
    }
  }, [navigate, params]);

  return {
    getCurrentState,
    navigateToState,
    currentState: (search as any)?.state || 'resizeAndOptimize'
  };
}
