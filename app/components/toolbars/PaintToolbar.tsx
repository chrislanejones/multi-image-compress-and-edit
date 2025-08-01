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
    applyPaint,
    clearPaintStrokes,
  } = useEditorStore();
  const { selectedImage } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleApplyPaint = async () => {
    if (currentImageId) {
      await applyPaint();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit-image` });
    } else {
      console.warn("No currentImageId available for apply paint");
    }
  };

  const handleCancel = () => {
    if (currentImageId) {
      clearPaintStrokes(); // Clear unsaved paint strokes
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit-image` });
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

      {/* Right: Apply / Cancel */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleApplyPaint}
          className="h-9 bg-gray-800 hover:bg-gray-700 text-white"
        >
          <Check className="mr-2 h-4 w-4" /> Apply Paint
        </Button>
        <Button onClick={handleCancel} variant="outline" className="h-9">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
};