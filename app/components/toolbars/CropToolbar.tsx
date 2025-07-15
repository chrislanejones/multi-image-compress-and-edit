import React from "react";
import { Check, X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";

export const CropToolbar = () => {
  const { onCropZoomIn, onCropZoomOut, setEditorState, resetCrop } = useEditorStore();
  const { onApplyCrop } = useImageContext();

  const handleCancel = () => {
    resetCrop();
    setEditorState("resizeAndOptimize");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-700 p-2 rounded-lg z-10 relative">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onCropZoomOut} 
          variant="outline" 
          className="h-9 w-9 p-0"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onCropZoomIn} 
          variant="outline" 
          className="h-9 w-9 p-0"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onApplyCrop} 
          variant="default" 
          className="h-9"
        >
          <Check className="mr-2 h-4 w-4" /> Apply Crop
        </Button>
        <Button 
          onClick={handleCancel} 
          variant="outline" 
          className="h-9"
        >
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
};
