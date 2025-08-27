import React from "react";
import { Check, X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useViewStore, useCropStore, useAppStateStore } from "../../stores";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const CropToolbar = () => {
  const { onCropZoomIn, onCropZoomOut } = useViewStore();
  const { resetCrop } = useCropStore();
  const { setEditorState } = useAppStateStore();
  const { selectedImage, onApplyCrop } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleSaveAndExit = async () => {
    if (currentImageId) {
      await onApplyCrop();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for save and exit crop");
    }
  };

  const handleCancel = () => {
    if (currentImageId) {
      resetCrop();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for cancel crop");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-700 rounded-lg z-10 relative">
      {/* Left: Zoom controls */}
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
      </div>

      {/* Right: Cancel / Save & Exit */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleCancel} 
          variant="outline" 
          className="h-9"
        >
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button 
          onClick={handleSaveAndExit}
          className="h-9 bg-green-700 hover:bg-green-600 text-white"
        >
          <Check className="mr-2 h-4 w-4" /> Save & Exit Crop
        </Button>
      </div>
    </div>
  );
};
