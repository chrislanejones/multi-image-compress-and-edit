import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useEditorStore } from "../store/editor-store";
import { PaintStroke } from "../types/types";
import { 
  Paintbrush, 
  Eraser, 
  Smile, 
  MoveUpRight, 
  Undo, 
  Redo 
} from "lucide-react";

interface PaintCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

type PaintTool = "brush" | "eraser" | "emoji" | "arrow" | "double";

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
  imageWidth,
  imageHeight,
  zoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<PaintStroke | null>(null);
  
  // Get paint state from zustand store
  const {
    paintStrokes: strokes,
    paintTool: selectedTool,
    brushSize,
    brushColor: selectedColor,
    addPaintStroke,
    clearPaintStrokes,
    setPaintTool,
    setBrushSize,
    setBrushColor,
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
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [strokes]);

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
    const newStroke: PaintStroke = {
      tool: selectedTool,
      points: [coords],
      color: selectedColor,
      brushSize: brushSize,
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;

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
  };

  const handleMouseUp = () => {
    if (currentStroke && isDrawing) {
      // Save current state for undo
      setUndoStack(prev => [...prev, strokes]);
      setRedoStack([]); // Clear redo stack when new action is performed
      
      // Add completed stroke to store
      addPaintStroke({
        ...currentStroke,
        id: Date.now().toString(), // Simple ID generation
        timestamp: Date.now(),
      });
    }
    
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, strokes]);
    setStrokes(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, strokes]);
    setStrokes(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    clearPaintStrokes();
  };

  const tools = [
    { id: "brush" as PaintTool, icon: Paintbrush, label: "Brush" },
    { id: "eraser" as PaintTool, icon: Eraser, label: "Eraser" },
    { id: "emoji" as PaintTool, icon: Smile, label: "Emoji" },
    { id: "arrow" as PaintTool, icon: MoveUpRight, label: "Arrow" },
    { id: "double" as PaintTool, icon: MoveUpRight, label: "Double", style: { transform: "rotate(180deg)" } },
  ];

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

        {/* Tool Selection */}
        <div className="grid grid-cols-5 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              onClick={() => setPaintTool(tool.id)}
              variant={selectedTool === tool.id ? "default" : "outline"}
              className="h-12 flex items-center justify-center gap-2"
            >
              <tool.icon className="h-4 w-4" style={tool.style} />
              {tool.label}
            </Button>
          ))}
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

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Button onClick={handleClear} variant="destructive">
            Clear
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
};