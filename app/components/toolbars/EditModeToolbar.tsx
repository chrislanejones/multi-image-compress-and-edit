import React from "react";
import {
  Minus, Plus, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCcw,
  Crop, Droplets, Paintbrush, Type, X
} from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context"; // Adjust path if needed

export const EditModeToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  // NOTE: Assumes your ImageContext provides these actions.
  const { onRotateLeft, onRotateRight, onFlipHorizontal, onFlipVertical, onReset } = useImageContext();

  return (
    <div className="w-full grid grid-cols-3 items-center">
      <div className="flex items-center gap-2 justify-self-start">
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
        <Button onClick={onRotateLeft} variant="outline" className="h-9 w-9 p-0"><RotateCcw className="h-4 w-4" /></Button>
        <Button onClick={onRotateRight} variant="outline" className="h-9 w-9 p-0"><RotateCw className="h-4 w-4" /></Button>
        <Button onClick={onFlipHorizontal} variant="outline" className="h-9 w-9 p-0"><FlipHorizontal className="h-4 w-4" /></Button>
        <Button onClick={onFlipVertical} variant="outline" className="h-9 w-9 p-0"><FlipVertical className="h-4 w-4" /></Button>
        <Button onClick={onReset} variant="outline" className="h-9 w-9 p-0"><RefreshCcw className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2 justify-self-center">
        <Button onClick={() => setEditorState("crop")} variant="outline" className="h-9"><Crop className="mr-2 h-4 w-4" /> Crop</Button>
        <Button onClick={() => setEditorState("blur")} variant="outline" className="h-9"><Droplets className="mr-2 h-4 w-4" /> Blur</Button>
        <Button onClick={() => setEditorState("paint")} variant="outline" className="h-9"><Paintbrush className="mr-2 h-4 w-4" /> Paint</Button>
        <Button onClick={() => setEditorState("text")} variant="outline" className="h-9"><Type className="mr-2 h-4 w-4" /> Text</Button>
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        <Button onClick={() => setEditorState("resizeAndOptimize")} variant="outline" className="h-9"><X className="mr-2 h-4 w-4" /> Exit Edit</Button>
      </div>
    </div>
  );
};
