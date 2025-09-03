import React from "react";
import { Paintbrush } from "lucide-react";
import { Slider } from "./ui/slider";
import { usePaintStore } from "../stores";

export const PaintSettings = () => {
  const {
    paintTool,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    arrowColor,
    setArrowStyle,
    arrowWidth,
    currentEmoji,
    setCurrentEmoji,
  } = usePaintStore();

  // Predefined color palette
  const colorPalette = [
    "#ff0000", // Red
    "#ff7f00", // Orange  
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#0000ff", // Blue
    "#4b0082", // Indigo
    "#9400d3", // Violet
    "#ff1493", // Deep Pink
    "#00ffff", // Cyan
    "#ff69b4", // Hot Pink
    "#000000", // Black
    "#ffffff", // White
    "#808080", // Gray
    "#8b4513", // Brown
    "#ffc0cb", // Light Pink
    "#90ee90", // Light Green
  ];

  const currentColor = paintTool === "arrow" || paintTool === "double" ? arrowColor : brushColor;
  const setCurrentColor = (color: string) => {
    if (paintTool === "arrow" || paintTool === "double") {
      setArrowStyle(color, arrowWidth);
    } else {
      setBrushColor(color);
    }
  };

  const currentSize = paintTool === "arrow" || paintTool === "double" ? arrowWidth : brushSize;
  const setCurrentSize = (size: number) => {
    if (paintTool === "arrow" || paintTool === "double") {
      setArrowStyle(arrowColor, size);
    } else {
      setBrushSize(size);
    }
  };

  // Emoji options
  const emojiOptions = ["😊", "😂", "❤️", "👍", "🔥", "⭐", "✨", "🎉", "💯", "🚀", "❗", "❓", "✅", "❌", "⚠️", "💡"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Paint Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Current tool: <span className="font-medium capitalize">{paintTool}</span>
        </p>
      </div>

      {/* Emoji Selection */}
      {paintTool === "emoji" && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Select Emoji</h4>
          <div className="grid grid-cols-4 gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setCurrentEmoji(emoji)}
                className={`w-10 h-10 rounded-lg border transition-all hover:scale-110 flex items-center justify-center text-lg ${
                  currentEmoji === emoji
                    ? 'border-2 border-primary bg-primary/10'
                    : 'border border-border hover:border-primary'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Picker */}
      {(paintTool === "brush" || paintTool === "arrow" || paintTool === "double") && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Color</h4>
          
          {/* Current Color Display */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: currentColor }}
              title={`Current color: ${currentColor}`}
            />
            <div className="text-sm">
              <div className="font-medium">Current</div>
              <div className="text-muted-foreground font-mono text-xs">{currentColor}</div>
            </div>
          </div>
          
          {/* Color Palette */}
          <div className="grid grid-cols-4 gap-2">
            {colorPalette.map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border transition-all hover:scale-105 ${
                  currentColor === color
                    ? 'border-2 border-foreground shadow-md'
                    : 'border border-border hover:border-foreground'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Control */}
      {(paintTool === "brush" || paintTool === "eraser" || paintTool === "arrow" || paintTool === "double" || paintTool === "emoji") && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {paintTool === "arrow" || paintTool === "double" ? "Arrow Width" : 
             paintTool === "emoji" ? "Emoji Size" : "Brush Size"}
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Size</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {currentSize}px
              </span>
            </div>
            
            <Slider
              value={[currentSize]}
              onValueChange={(values) => setCurrentSize(values[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};