import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { usePaintStore } from "../stores";
import { PaintStroke } from "../types/types";
import {
  Paintbrush,
  Eraser,
  Smile,
  ArrowUp,
  ArrowLeftRight,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

interface PaintCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

const PRESET_COLORS = [
  // Essentials
  "#000000", // Black
  "#ffffff", // White
  "#6b7280", // Gray
  
  // Vibrant Reds & Pinks
  "#ef4444", // Red
  "#dc2626", // Dark Red
  "#ec4899", // Pink
  "#f43f5e", // Rose
  
  // Warm Oranges & Yellows
  "#f97316", // Orange
  "#fb923c", // Light Orange
  "#eab308", // Yellow
  "#fbbf24", // Bright Yellow
  
  // Natural Greens
  "#22c55e", // Green
  "#16a34a", // Forest Green
  "#10b981", // Emerald
  "#84cc16", // Lime
  
  // Cool Blues & Purples
  "#3b82f6", // Blue
  "#2563eb", // Dark Blue
  "#06b6d4", // Cyan
  "#0891b2", // Teal
  "#8b5cf6", // Purple
  "#7c3aed", // Violet
  "#a855f7", // Magenta
  "#c084fc", // Light Purple
  
  // Earth Tones
  "#a3a3a3", // Light Gray
  "#525252", // Dark Gray
  "#78716c", // Stone
  "#92400e", // Brown
];

export const PaintCanvas: React.FC<PaintCanvasProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<PaintStroke | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // Get paint state from zustand store
  const {
    paintStrokes: strokes,
    shapes,
    paintTool: selectedTool,
    brushSize,
    brushColor: selectedColor,
    addPaintStroke,
    addShape,
    clearPaintStrokes,
    setBrushSize,
    setBrushColor,
    setPaintTool,
    currentEmoji,
    setCurrentEmoji,
    arrowColor,
    arrowWidth,
  } = usePaintStore();

  // Local undo/redo state (could be moved to store later)
  const [undoStack, setUndoStack] = useState<PaintStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<PaintStroke[][]>([]);

  // Load background image
  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!backgroundCanvas) return;

    const ctx = backgroundCanvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      backgroundCanvas.width = img.naturalWidth;
      backgroundCanvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Set up main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    canvas.width = backgroundCanvas.width;
    canvas.height = backgroundCanvas.height;
  }, [imageUrl]);

  // Helper function for drawing arrowheads
  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number
  ) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = Math.max(10, width * 3);
    const a1 = angle - Math.PI / 7;
    const a2 = angle + Math.PI / 7;

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(a1), y2 - headLen * Math.sin(a1));
    ctx.lineTo(x2 - headLen * Math.cos(a2), y2 - headLen * Math.sin(a2));
    ctx.closePath();
    ctx.fill();
  };

  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paint strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });

    // Draw shapes (emoji + arrows)
    shapes.forEach((shape) => {
      if (shape.type === "emoji") {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.font =
          `${shape.size}px system-ui, apple color emoji, ` +
          `segoe ui emoji, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(shape.text, shape.x, shape.y);
        ctx.restore();
      } else if (shape.type === "arrow") {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // shaft
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        // head(s)
        drawArrowhead(ctx, shape.x1, shape.y1, shape.x2, shape.y2, shape.width);
        if (shape.double) {
          drawArrowhead(
            ctx,
            shape.x2,
            shape.y2,
            shape.x1,
            shape.y1,
            shape.width
          );
        }
        ctx.restore();
      }
    });
  }, [strokes, shapes]);

  useEffect(() => {
    redrawStrokes();
  }, [redrawStrokes]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (selectedTool === "emoji") {
      // Handle emoji placement
      addShape({
        id: Date.now().toString(),
        type: "emoji",
        x: coords.x,
        y: coords.y,
        text: currentEmoji,
        size: brushSize * 2, // Scale emoji size based on brush size
      });
    } else if (selectedTool === "arrow" || selectedTool === "double") {
      // Start arrow drawing
      setArrowStart(coords);
      setIsDrawingArrow(true);
    } else {
      // Handle brush/eraser strokes
      const newStroke: PaintStroke = {
        id: Date.now().toString(),
        tool: selectedTool,
        points: [coords],
        color: selectedColor,
        brushSize: brushSize,
        timestamp: Date.now(),
      };

      setCurrentStroke(newStroke);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && currentStroke) {
      // Handle brush/eraser drawing
      const coords = getCanvasCoordinates(e);
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, coords],
      };

      setCurrentStroke(updatedStroke);

      // Draw current stroke in real-time
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Redraw all strokes plus current stroke
      redrawStrokes();

      // Draw current stroke
      if (updatedStroke.points.length > 1) {
        ctx.strokeStyle = updatedStroke.color;
        ctx.lineWidth = updatedStroke.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (updatedStroke.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        const lastPoint = updatedStroke.points[updatedStroke.points.length - 2];
        const currentPoint =
          updatedStroke.points[updatedStroke.points.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
    }
    // Note: Arrow preview during drawing could be added here if desired
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentStroke && isDrawing) {
      // Handle brush/eraser completion
      addPaintStroke({
        ...currentStroke,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
      setCurrentStroke(null);
      setIsDrawing(false);
    } else if (isDrawingArrow && arrowStart) {
      // Handle arrow completion
      const coords = getCanvasCoordinates(e);
      addShape({
        id: Date.now().toString(),
        type: "arrow",
        x1: arrowStart.x,
        y1: arrowStart.y,
        x2: coords.x,
        y2: coords.y,
        double: selectedTool === "double",
        color: arrowColor,
        width: arrowWidth,
      });
      setArrowStart(null);
      setIsDrawingArrow(false);
    }
  };

  const handleClear = () => {
    setUndoStack((prev) => [...prev, strokes]);
    setRedoStack([]);
    clearPaintStrokes();
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Canvas Section */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="relative">
          <canvas
            ref={backgroundCanvasRef}
            className="absolute inset-0 w-full h-auto"
            style={{ maxHeight: "600px" }}
          />
          <canvas
            ref={canvasRef}
            className="relative w-full cursor-crosshair"
            style={{ maxHeight: "600px" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Tools Section */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-4 text-white">
        <div className="flex justify-between">
          <h3 className="text-lg">Paint Tools</h3>
        </div>

        {/* Brush Size */}
        <div className="space-y-2">
          <label className="block">Size: {brushSize}px</label>
          <Slider
            className="w-full"
            min={1}
            max={50}
            step={1}
            value={[brushSize]}
            onValueChange={(v) => setBrushSize(v[0])}
          />
        </div>

        {/* Color Selection - Only show for non-emoji tools */}
        {selectedTool !== "emoji" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Color
            </label>

            {/* Current Color Display */}
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div
                className="w-8 h-8 rounded-md border-2 border-gray-500 shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Current Color
                </div>
                <div className="text-xs text-gray-400 font-mono uppercase">
                  {selectedColor}
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Color Palette
              </div>
              <div className="grid grid-cols-8 gap-2 p-3 bg-gray-700 rounded-lg">
                {PRESET_COLORS.map((color, index) => (
                  <button
                    key={color}
                    className={`w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                      selectedColor === color
                        ? "border-white shadow-xl ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-700 scale-105"
                        : "border-gray-500 hover:border-gray-300"
                    } ${
                      color === "#ffffff" ? "shadow-inner" : ""
                    }`}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: color === "#ffffff" 
                        ? "inset 0 1px 3px rgba(0,0,0,0.2)" 
                        : selectedColor === color 
                        ? "0 4px 12px rgba(0,0,0,0.3)" 
                        : "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                    onClick={() => setBrushColor(color)}
                    title={`${color} - ${index < 3 ? 'Essential' : 
                           index < 7 ? 'Red/Pink' : 
                           index < 11 ? 'Orange/Yellow' : 
                           index < 15 ? 'Green' : 
                           index < 23 ? 'Blue/Purple' : 'Earth Tone'}`}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Custom
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-12 h-8 rounded border-2 border-gray-500 bg-transparent cursor-pointer"
                />
                <div className="text-sm text-white">Pick any color</div>
              </div>
            </div>
          </div>
        )}

        {/* Emoji Picker - Only show for emoji tool */}
        {selectedTool === "emoji" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white">
                Emoji
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentEmoji}</span>
                <div className="text-xs text-gray-400">Current</div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-2">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setCurrentEmoji(emojiData.emoji);
                }}
                width="100%"
                height={300}
                theme={"dark" as any}
                searchDisabled={false}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis={true}
              />
            </div>
          </div>
        )}

        {/* Clear Button */}
        <div className="mt-4">
          <Button
            onClick={handleClear}
            variant="destructive"
            className="w-full"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};
