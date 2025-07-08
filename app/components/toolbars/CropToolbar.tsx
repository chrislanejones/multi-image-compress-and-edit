import React from "react";
import { Check, X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context"; // Adjust path if needed

export const CropToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  const { onApplyCrop } = useImageContext(); // Get action from context

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
      <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
      <Button onClick={onApplyCrop} variant="default" className="h-9"><Check className="mr-2 h-4 w-4" /> Apply Crop</Button>
      <Button onClick={() => setEditorState("editImage")} variant="outline" className="h-9"><X className="mr-2 h-4 w-4" /> Cancel</Button>
    </div>
  );
};
