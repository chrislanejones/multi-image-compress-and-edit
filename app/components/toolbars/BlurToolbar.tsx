import React from "react";
import { Check, X, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useViewStore, useBlurStore, useAppStateStore } from "../../stores";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const BlurToolbar = () => {
  const { globalZoomIn, globalZoomOut } = useViewStore();
  const {
    blurAmount,
    brushSize,
    setBlurAmount,
    setBrushSize,
    blurBrushStrokes,
    clearBlurStrokes,
    undoLastBlurStroke,
  } = useBlurStore();
  const { setEditorState } = useAppStateStore();
  const { selectedImage, onApplyBlur } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleSaveAndExit = async () => {
    if (currentImageId) {
      await onApplyBlur();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for save and exit blur");
    }
  };

  const handleCancel = () => {
    if (currentImageId) {
      clearBlurStrokes();
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${currentImageId}/edit` });
    } else {
      console.warn("No currentImageId available for cancel blur");
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
          onClick={undoLastBlurStroke}
          variant="outline"
          className="h-9 w-9 p-0"
          disabled={blurBrushStrokes.length === 0}
          title="Undo Last Stroke"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={clearBlurStrokes}
          variant="outline"
          className="h-9 w-9 p-0"
          disabled={blurBrushStrokes.length === 0}
          title="Clear All Strokes"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Blur controls */}
      <div className="flex-1 flex items-center gap-6 px-8">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm font-medium text-card-foreground">
            Blur Intensity: {blurAmount}px
          </label>
          <div className="bg-muted p-2 rounded">
            <Slider
              className="w-full"
              min={1}
              max={20}
              step={1}
              value={[blurAmount]}
              onValueChange={(v) => setBlurAmount(v[0])}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm font-medium text-card-foreground">
            Brush Size: {brushSize}px
          </label>
          <div className="bg-muted p-2 rounded">
            <Slider
              className="w-full"
              min={10}
              max={100}
              step={5}
              value={[brushSize]}
              onValueChange={(v) => setBrushSize(v[0])}
            />
          </div>
        </div>
      </div>

      {/* Right: Cancel / Save & Exit */}
      <div className="flex items-center gap-2">
        <Button onClick={handleCancel} variant="outline" className="h-9">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button
          onClick={handleSaveAndExit}
          className="h-9 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Check className="mr-2 h-4 w-4" /> Save & Exit Blur
        </Button>
      </div>
    </div>
  );
};
