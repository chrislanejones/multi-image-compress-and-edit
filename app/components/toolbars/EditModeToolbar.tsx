import React from "react";
import {
  Minus, Plus, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCcw,
  Crop, Droplets, Paintbrush, Type, X
} from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const EditModeToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  const { onRotateLeft, onRotateRight, onFlipHorizontal, onFlipVertical, onReset } = useImageContext();
  const navigate = useNavigate();

  const handleExitEditMode = () => {
    setEditorState("resizeAndOptimize");
    navigate({ to: "/resize-and-optimize" });
  };

  return (
    <div className="w-full grid grid-cols-3 items-center">
      <div className="flex items-center gap-2 justify-self-start">
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
        <Button onClick={onRotateLeft} variant="outline" className="h-9 w-9 p-0"><RotateCcw className="h-4 w-4" /></Button>
        {/* ... other edit buttons ... */}
      </div>
      <div className="flex items-center gap-2 justify-self-center">
        <Button onClick={() => setEditorState("crop")} variant="outline" className="h-9"><Crop className="mr-2 h-4 w-4" /> Crop</Button>
        <Button onClick={() => setEditorState("blur")} variant="outline" className="h-9"><Droplets className="mr-2 h-4 w-4" /> Blur</Button>
        {/* ... other tool buttons ... */}
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <Button onClick={handleExitEditMode} variant="outline" className="h-9"><X className="mr-2 h-4 w-4" /> Exit Edit</Button>
      </div>
    </div>
  );
};
