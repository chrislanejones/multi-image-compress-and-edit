import React from "react";
import {
  Check,
  X,
  Minus,
  Plus,
  Undo,
  Redo,
  ArrowUp,
  ArrowLeftRight,
  Paintbrush,
  Eraser,
  Smile,
} from "lucide-react";
import { Button } from "../ui/button";
import { useViewStore, usePaintStore, useAppStateStore } from "../../stores";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const PaintToolbar = () => {
  const { globalZoomIn, globalZoomOut } = useViewStore();
  const {
    clearPaintStrokes,
    clearShapes,
    undoLastPaintStroke,
    undoLastShape,
    paintStrokes,
    shapes,
    paintTool,
    setPaintTool,
    currentEmoji,
    setCurrentEmoji,
  } = usePaintStore();
  const { setEditorState } = useAppStateStore();
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
      clearShapes();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for cancel paint");
    }
  };

  const handleUndo = () => {
    // Undo shapes first (they're drawn on top), then strokes
    if (shapes.length > 0) {
      undoLastShape();
    } else if (paintStrokes.length > 0) {
      undoLastPaintStroke();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      {/* Left: Zoom controls and Undo/Redo */}
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
        <Button
          onClick={handleUndo}
          variant="outline"
          className="h-9 w-9 p-0"
          disabled={paintStrokes.length === 0 && shapes.length === 0}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            /* TODO: Implement redo */
          }}
          variant="outline"
          className="h-9 w-9 p-0"
          disabled={true}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Paint Tools */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setPaintTool("brush")}
          variant={paintTool === "brush" ? "default" : "outline"}
          className="h-9"
          title="Paint Brush"
        >
          <Paintbrush className="h-4 w-4 mr-2" />
          Paint
        </Button>
        <Button
          onClick={() => setPaintTool("eraser")}
          variant={paintTool === "eraser" ? "default" : "outline"}
          className="h-9"
          title="Eraser"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Eraser
        </Button>
        <Button
          onClick={() => setPaintTool("emoji")}
          variant={paintTool === "emoji" ? "default" : "outline"}
          className="h-9"
          title={`Emoji (${currentEmoji})`}
        >
          <Smile className="h-4 w-4 mr-2" />
          Emojis
        </Button>
        <Button
          onClick={() => setPaintTool("arrow")}
          variant={paintTool === "arrow" ? "default" : "outline"}
          className="h-9"
          title="Single Arrow"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Arrow
        </Button>
        <Button
          onClick={() => setPaintTool("double")}
          variant={paintTool === "double" ? "default" : "outline"}
          className="h-9"
          title="Double Arrow"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Double Arrow
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
