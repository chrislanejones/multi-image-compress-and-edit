import React from "react";
import { Check, X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useViewStore, useAppStateStore } from "../../stores";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const TextToolbar = () => {
  const { globalZoomIn, globalZoomOut } = useViewStore();
  const { setEditorState, triggerTextSave } = useAppStateStore();
  const { selectedImage, onApplyText } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleSaveAndExit = async () => {
    if (currentImageId) {
      // Trigger text save through the store trigger
      triggerTextSave();
      // Navigation will be handled by the onApplyText callback in the route
    } else {
      console.warn("No currentImageId available for save and exit text");
    }
  };

  const handleCancel = () => {
    if (currentImageId) {
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for cancel text");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={globalZoomOut}
          variant="outline"
          className="h-9 w-9 p-0"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          onClick={globalZoomIn}
          variant="outline"
          className="h-9 w-9 p-0"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Text editing info */}
      <div className="flex-1 text-center text-white">
        <span className="text-sm">Edit text properties in the sidebar</span>
      </div>

      {/* Right: Cancel / Save & Exit */}
      <div className="flex items-center gap-2">
        <Button onClick={handleCancel} variant="outline" className="h-9">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button
          onClick={handleSaveAndExit}
          className="h-9 bg-green-700 hover:bg-green-600 text-white"
        >
          <Check className="mr-2 h-4 w-4" /> Save & Exit Text
        </Button>
      </div>
    </div>
  );
};