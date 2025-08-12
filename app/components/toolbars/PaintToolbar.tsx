import React from "react";
import { Check, X, Minus, Plus, Undo, Redo } from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const PaintToolbar = () => {
  const {
    onZoomIn,
    onZoomOut,
    setEditorState,
    clearPaintStrokes,
  } = useEditorStore();
  const { selectedImage, onApplyPaint } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleSaveAndExit = async () => {
    if (currentImageId) {
      await onApplyPaint();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for save and exit paint");
    }
  };

  const handleCancel = () => {
    if (currentImageId) {
      clearPaintStrokes();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for cancel paint");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      {/* Left: Zoom controls and Undo/Redo */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onZoomOut}
          variant="outline"
          className="h-9 w-9 p-0"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          onClick={onZoomIn}
          variant="outline"
          className="h-9 w-9 p-0"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {/* TODO: Implement undo */}}
          variant="outline"
          className="h-9 w-9 p-0"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {/* TODO: Implement redo */}}
          variant="outline"
          className="h-9 w-9 p-0"
          disabled={true}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
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
          <Check className="mr-2 h-4 w-4" /> Save & Exit Paint
        </Button>
      </div>
    </div>
  );
};
