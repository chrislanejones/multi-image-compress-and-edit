import React from "react";
import { Check, X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context"; // Adjust path if needed

const BlurSecondaryToolbar = () => {
  const { blurAmount, blurRadius, setBlurAmount, setBlurRadius } =
    useEditorStore();

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-700 rounded-lg mb-4 w-full">
      <div className="flex-1">
        <label
          htmlFor="blur-amount"
          className="text-sm font-medium block mb-1 text-white"
        >
          Blur Amount: {blurAmount}px
        </label>
        <Slider
          id="blur-amount"
          min={1}
          max={20}
          step={1}
          value={[blurAmount]}
          onValueChange={(v) => setBlurAmount(v[0])}
        />
      </div>
      <div className="flex-1">
        <label
          htmlFor="blur-radius"
          className="text-sm font-medium block mb-1 text-white"
        >
          Brush Size: {blurRadius}px
        </label>
        <Slider
          id="blur-radius"
          min={5}
          max={50}
          step={1}
          value={[blurRadius]}
          onValueChange={(v) => setBlurRadius(v[0])}
        />
      </div>
    </div>
  );
};

export const BlurToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  const { onApplyBlur } = useImageContext(); // Get action from context

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0">
        <Minus className="h-4 w-4" />
      </Button>
      <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0">
        <Plus className="h-4 w-4" />
      </Button>
      <Button onClick={onApplyBlur} variant="default" className="h-9">
        <Check className="mr-2 h-4 w-4" /> Apply Blur
      </Button>
      <Button
        onClick={() => setEditorState("editImage")}
        variant="outline"
        className="h-9"
      >
        <X className="mr-2 h-4 w-4" /> Cancel
      </Button>
    </div>
  );
};

// Attach the secondary toolbar as a static property for clean access
BlurToolbar.Secondary = BlurSecondaryToolbar;
