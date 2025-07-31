// CropToolbar.tsx  (complete replacement)

import React from "react";
import { Check, X, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";

export const CropToolbar = () => {
  const {
    onCropZoomIn,
    onCropZoomOut,
    setEditorState,
    resetCrop,
    history,
    historyIndex,
    pushHistory,
    undo,
    redo,
  } = useEditorStore();
  const { onApplyCrop } = useImageContext();

  const handleUndo = () => undo();
  const handleRedo = () => redo();
  const handleCancel = () => {
    resetCrop();
    setEditorState("resizeAnd-optimize");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-700 rounded-lg z-10 relative">
      {/* Zoom controls */}
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

      {/* Undo / Redo */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleUndo}
          variant="outline"
          className="h-9"
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <RotateCcw className="h-4 w-4" />
          Undo
        </Button>
        <Button
          onClick={handleRedo}
          variant="outline"
          className="h-9"
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <RotateCw className="h-4 w-4" />
          Redo
        </Button>
      </div>

      {/* Apply / Cancel */}
      <div className="flex items-center gap-2">
        <Button onClick={onApplyCrop} variant="default" className="h-9">
          <Check className="mr-2 h-4 w-4" /> Apply Crop
        </Button>
        <Button onClick={handleCancel} variant="outline" className="h-9">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
};
