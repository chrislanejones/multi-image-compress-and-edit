import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useEditorStore } from "../store/editor-store";
import { PaintStroke } from "../types/types";
import { 
  Undo, 
  Redo 
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

interface PaintCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

const PRESET_COLORS = [
  "#ff0000", "#e51e25", "#a61b29", "#8d4bbb",
  "#ff7f00", "#ff8c00", "#ff4500", "#ffa500",
  "#ffff00", "#ffd700", "#ffc72c", "#fbec5d",
  "#00ff00", "#32cd32", "#008000", "#00a550",
  "#0000ff", "#1e90ff", "#5f9ea0", "#00bfff",
  "#800080", "#9370db", "#8a2be2", "#9b30ff",
  "#ffffff", "#d3d3d3", "#808080", "#000000"
];

export const PaintCanvas: React.FC<PaintCanvasProps> = ({
  imageUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<PaintStroke | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
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
    currentEmoji,
    setCurrentEmoji,
    arrowColor,
    arrowWidth,
  } = useEditorStore();
  
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

  // Redraw strokes
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
        drawArrowhead(
          ctx,
          shape.x1,
          shape.y1,
          shape.x2,
          shape.y2,
          shape.width
        );
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
        const currentPoint = updatedStroke.points[updatedStroke.points.length - 1];
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

  const handleUndo = () => {
    if (strokes.length === 0) return;
    
    // For now, just remove the last stroke
    // TODO: Implement proper undo/redo in the store
    clearPaintStrokes();
    strokes.slice(0, -1).forEach(stroke => {
      addPaintStroke(stroke);
    });
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log("Redo not yet implemented");
  };

  const handleClear = () => {
    setUndoStack(prev => [...prev, strokes]);
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
          <div className="flex space-x-2">
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={undoStack.length === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRedo}
              variant="outline"
              disabled={redoStack.length === 0}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
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

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="block">Color</label>
          <div className="grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded ${
                  selectedColor === color ? "ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 p-0 border-none"
            />
            <span className="ml-2 font-mono text-xs">{selectedColor}</span>
          </div>
        </div>

        {/* Emoji Picker */}
        {selectedTool === "emoji" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block">Current Emoji</label>
              <span className="text-2xl">{currentEmoji}</span>
            </div>
            <Button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              variant="outline"
              className="w-full"
            >
              {showEmojiPicker ? "Hide Emoji Picker" : "Show Emoji Picker"}
            </Button>
            {showEmojiPicker && (
              <div className="mt-2">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setCurrentEmoji(emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  width={300}
                  height={300}
                />
              </div>
            )}
          </div>
        )}

        {/* Clear Button */}
        <div className="mt-4">
          <Button onClick={handleClear} variant="destructive" className="w-full">
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};