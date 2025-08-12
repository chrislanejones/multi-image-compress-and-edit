// app/components/toolbars/EditModeToolbar.tsx
import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCcw,
  Crop,
  Droplets,
  Paintbrush,
  Type,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";

export const EditModeToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  const {
    rotateImage,
    flipImageHorizontal,
    flipImageVertical,
    resetImage,
  } = useEditorStore();
  const { selectedImage } = useImageContext();
  const navigate = useNavigate();
  
  const currentImageId = selectedImage?.id;

  const handleToolClick = (mode: 'crop' | 'blur' | 'paint' | 'text') => {
    if (currentImageId) {
      navigate({ 
        to: `/resize-and-optimize/${currentImageId}/edit`,
        search: { tool: mode }
      });
    } else {
      console.warn("No currentImageId available for tool navigation");
    }
  };

  const handleExitEditMode = () => {
    setEditorState("resizeAndOptimize");
    navigate({ to: "/resize-and-optimize" });
  };

  return (
    <div className="w-full grid grid-cols-3 items-center">
      {/* Left: zoom + rotate + flip + reset */}
      <div className="flex items-center gap-2 justify-self-start">
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0">
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedImage && rotateImage(selectedImage.id, -90)}
          variant="outline"
          className="h-9 w-9 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedImage && rotateImage(selectedImage.id, 90)}
          variant="outline"
          className="h-9 w-9 p-0"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedImage && flipImageHorizontal(selectedImage.id)}
          variant="outline"
          className="h-9 w-9 p-0"
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedImage && flipImageVertical(selectedImage.id)}
          variant="outline"
          className="h-9 w-9 p-0"
        >
          <FlipVertical className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedImage && resetImage(selectedImage.id)}
          variant="outline"
          className="h-9 w-9 p-0"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: tools */}
      <div className="flex items-center gap-2 justify-self-center">
        <Button
          onClick={() => handleToolClick('crop')}
          variant="outline"
          className="h-9"
          disabled={!currentImageId}
        >
          <Crop className="mr-2 h-4 w-4" /> Crop
        </Button>
        <Button
          onClick={() => handleToolClick('blur')}
          variant="outline"
          className="h-9"
          disabled={!currentImageId}
        >
          <Droplets className="mr-2 h-4 w-4" /> Blur
        </Button>
        <Button
          onClick={() => handleToolClick('paint')}
          variant="outline"
          className="h-9"
          disabled={!currentImageId}
        >
          <Paintbrush className="mr-2 h-4 w-4" /> Paint
        </Button>
        <Button
          onClick={() => handleToolClick('text')}
          variant="outline"
          className="h-9"
          disabled={!currentImageId}
        >
          <Type className="mr-2 h-4 w-4" /> Text
        </Button>
      </div>

      {/* Right: exit */}
      <div className="flex items-center gap-2 justify-self-end">
        <Button onClick={handleExitEditMode} variant="outline" className="h-9">
          <X className="mr-2 h-4 w-4" /> Exit Edit Mode
        </Button>
      </div>
    </div>
  );
};
