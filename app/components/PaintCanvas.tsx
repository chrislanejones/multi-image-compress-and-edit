import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePaintStore } from "../stores";
import type { PaintStroke, EmojiShape } from "../types/types";

interface PaintCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

// Define shape types locally to match store
type ArrowShape = {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  double: boolean;
  color: string;
  width: number;
};

type Shape = ArrowShape | EmojiShape;

export const PaintCanvas: React.FC<PaintCanvasProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  zoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<PaintStroke | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 });

  // Get paint state from store
  const {
    paintStrokes: strokes,
    shapes,
    paintTool: selectedTool,
    brushSize,
    brushColor: selectedColor,
    addPaintStroke,
    addShape,
    arrowColor,
    arrowWidth,
    currentEmoji,
  } = usePaintStore();

  // Load background image
  useEffect(() => {
    if (!imageUrl) return;

    const backgroundCanvas = backgroundCanvasRef.current;
    if (!backgroundCanvas) return;

    const ctx = backgroundCanvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Set background canvas to natural image size
      backgroundCanvas.width = naturalWidth;
      backgroundCanvas.height = naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Setup main canvas
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;

        // Calculate display size
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const containerWidth = containerRect.width - 32;
          const containerHeight = containerRect.height - 32;

          const scaleToFit = Math.min(
            containerWidth / naturalWidth,
            containerHeight / naturalHeight,
            1
          );

          const displayWidth = naturalWidth * scaleToFit * (zoom / 100);
          const displayHeight = naturalHeight * scaleToFit * (zoom / 100);

          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;
          backgroundCanvas.style.width = `${displayWidth}px`;
          backgroundCanvas.style.height = `${displayHeight}px`;

          setCanvasScale({
            x: naturalWidth / displayWidth,
            y: naturalHeight / displayHeight,
          });
        }
      }

      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load image for paint canvas");
    };

    img.src = imageUrl;
  }, [imageUrl, zoom]);

  // Helper function for drawing arrowheads
  const drawArrowhead = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      width: number
    ) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = Math.max(15, width * 3);
      const headAngle = Math.PI / 6;

      ctx.save();
      ctx.translate(x2, y2);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-headLen, headLen * Math.tan(headAngle));
      ctx.lineTo(-headLen, -headLen * Math.tan(headAngle));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
    []
  );

  // Redraw all strokes and shapes
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paint strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
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
      if (stroke.points.length === 1) {
        // Single point - draw a circle
        const point = stroke.points[0];
        ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Multiple points - smooth line
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const point = stroke.points[i];
          const prevPoint = stroke.points[i - 1];
          const midX = (prevPoint.x + point.x) / 2;
          const midY = (prevPoint.y + point.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
        }
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw shapes (arrows + emojis)
    shapes.forEach((shape) => {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      if (shape.type === "arrow") {
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Draw arrow shaft
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        // Draw arrowheads
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
      } else if (shape.type === "emoji") {
        // Draw emoji
        ctx.font = `${shape.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shape.emoji, shape.x, shape.y);
      }

      ctx.restore();
    });
  }, [strokes, shapes, imageLoaded, drawArrowhead]);

  // Redraw when strokes change
  useEffect(() => {
    if (imageLoaded) {
      redrawStrokes();
    }
  }, [imageLoaded, redrawStrokes]);

  // Convert screen coordinates to canvas coordinates
  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * canvasScale.x;
      const y = (e.clientY - rect.top) * canvasScale.y;

      return { x, y };
    },
    [canvasScale]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageLoaded) return;

      const coords = getCanvasCoordinates(e);

      if (selectedTool === "arrow" || selectedTool === "double") {
        // Start arrow drawing
        setArrowStart(coords);
        setIsDrawingArrow(true);
      } else if (selectedTool === "emoji") {
        // Place emoji immediately
        addShape({
          id: crypto.randomUUID(),
          type: "emoji",
          x: coords.x,
          y: coords.y,
          emoji: currentEmoji,
          size: brushSize * 2,
        } as EmojiShape);
      } else {
        // Start brush/eraser stroke
        const newStroke: PaintStroke = {
          id: crypto.randomUUID(),
          tool: selectedTool as "brush" | "eraser",
          points: [coords],
          color: selectedColor,
          brushSize: brushSize,
          timestamp: Date.now(),
        };

        setCurrentStroke(newStroke);
        setIsDrawing(true);
      }

      e.preventDefault();
    },
    [
      selectedTool,
      brushSize,
      selectedColor,
      arrowColor,
      arrowWidth,
      addShape,
      getCanvasCoordinates,
      imageLoaded,
      currentEmoji,
    ]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageLoaded) return;

      if (isDrawing && currentStroke) {
        const coords = getCanvasCoordinates(e);
        const updatedStroke = {
          ...currentStroke,
          points: [...currentStroke.points, coords],
        };

        setCurrentStroke(updatedStroke);

        // Real-time drawing preview
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Redraw everything
            redrawStrokes();

            // Draw current stroke preview
            ctx.save();
            ctx.strokeStyle = updatedStroke.color;
            ctx.lineWidth = updatedStroke.brushSize;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            if (updatedStroke.tool === "eraser") {
              ctx.globalCompositeOperation = "destination-out";
            } else {
              ctx.globalCompositeOperation = "source-over";
            }

            if (updatedStroke.points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(updatedStroke.points[0].x, updatedStroke.points[0].y);

              for (let i = 1; i < updatedStroke.points.length; i++) {
                const point = updatedStroke.points[i];
                const prevPoint = updatedStroke.points[i - 1];
                const midX = (prevPoint.x + point.x) / 2;
                const midY = (prevPoint.y + point.y) / 2;
                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
              }

              ctx.stroke();
            }

            ctx.restore();
          }
        }
      }

      e.preventDefault();
    },
    [isDrawing, currentStroke, getCanvasCoordinates, redrawStrokes, imageLoaded]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageLoaded) return;

      if (currentStroke && isDrawing) {
        // Finish brush/eraser stroke
        addPaintStroke(currentStroke);
        setCurrentStroke(null);
        setIsDrawing(false);
      } else if (isDrawingArrow && arrowStart) {
        // Finish arrow
        const coords = getCanvasCoordinates(e);
        addShape({
          id: crypto.randomUUID(),
          type: "arrow",
          x1: arrowStart.x,
          y1: arrowStart.y,
          x2: coords.x,
          y2: coords.y,
          double: selectedTool === "double",
          color: arrowColor,
          width: arrowWidth,
        } as ArrowShape);

        setArrowStart(null);
        setIsDrawingArrow(false);
      }

      e.preventDefault();
    },
    [
      currentStroke,
      isDrawing,
      isDrawingArrow,
      arrowStart,
      selectedTool,
      arrowColor,
      arrowWidth,
      addPaintStroke,
      addShape,
      getCanvasCoordinates,
      imageLoaded,
    ]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-background overflow-hidden relative"
    >
      {/* Loading state overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p>Loading image...</p>
          </div>
        </div>
      )}

      {/* Background image canvas */}
      <canvas
        ref={backgroundCanvasRef}
        className={`absolute shadow-lg border border-border ${!imageLoaded ? "opacity-0" : "opacity-100"}`}
        style={{ pointerEvents: "none" }}
      />

      {/* Paint canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute cursor-crosshair shadow-lg border border-border ${!imageLoaded ? "opacity-0" : "opacity-100"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          touchAction: "none",
          imageRendering: "auto",
        }}
      />

      {/* Visual indicators */}
      {imageLoaded && (isDrawing || isDrawingArrow) && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: `${brushSize / canvasScale.x}px`,
            height: `${brushSize / canvasScale.y}px`,
            border: "2px solid rgba(34, 34, 34, 0.7)", // Adjust color and opacity as needed
            borderRadius: selectedTool === "emoji" ? "0%" : "50%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor:
              selectedTool === "eraser" ? "var(--destructive)" : "transparent",
            opacity: selectedTool === "eraser" ? 0.2 : 1,
          }}
        />
      )}
    </div>
  );
};
