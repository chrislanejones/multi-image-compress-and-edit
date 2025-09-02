import React, { useRef, useEffect, useState, useCallback } from "react";
import { useBlurStore } from "../stores";
import type { BlurStroke } from "../types/types";

interface BlurCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

export const BlurCanvas: React.FC<BlurCanvasProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  zoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<
    { x: number; y: number }[]
  >([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 });

  const {
    blurAmount,
    brushSize,
    blurBrushStrokes,
    addBlurStroke,
    setIsBlurBrushing,
  } = useBlurStore();

  // Load image and setup canvas
  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load the image
    image.onload = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      // Set canvas size to natural image size for high resolution
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;

      // Calculate display size that fits the container
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width - 32; // padding
        const containerHeight = containerRect.height - 32;

        const scaleToFit = Math.min(
          containerWidth / naturalWidth,
          containerHeight / naturalHeight,
          1 // Don't scale up
        );

        const displayWidth = naturalWidth * scaleToFit * (zoom / 100);
        const displayHeight = naturalHeight * scaleToFit * (zoom / 100);

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Store scale factors for coordinate conversion
        setCanvasScale({
          x: naturalWidth / displayWidth,
          y: naturalHeight / displayHeight,
        });
      }

      setImageLoaded(true);
      redrawCanvas();
    };

    image.onerror = () => {
      console.error("Failed to load image for blur canvas");
    };

    image.src = imageUrl;
  }, [imageUrl, zoom]);

  // Redraw canvas with all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Apply all blur strokes
    blurBrushStrokes.forEach((stroke) => {
      applyBlurStroke(ctx, stroke);
    });
  }, [blurBrushStrokes, imageLoaded]);

  // Apply a single blur stroke
  const applyBlurStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: BlurStroke) => {
      if (stroke.points.length === 0) return;

      const image = imageRef.current;
      if (!image) return;

      ctx.save();

      // Create temporary canvas for blurred image
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        ctx.restore();
        return;
      }

      tempCanvas.width = ctx.canvas.width;
      tempCanvas.height = ctx.canvas.height;

      // Apply blur filter and draw image
      tempCtx.filter = `blur(${stroke.blurAmount}px)`;
      tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

      // Create clipping path for brush stroke
      ctx.beginPath();

      if (stroke.points.length === 1) {
        // Single point - circle
        const point = stroke.points[0];
        ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2);
      } else {
        // Multiple points - create smooth path
        stroke.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            // Use quadratic curves for smoother lines
            const prevPoint = stroke.points[index - 1];
            const midX = (prevPoint.x + point.x) / 2;
            const midY = (prevPoint.y + point.y) / 2;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
          }
        });

        // Close the path and create brush effect
        ctx.lineWidth = stroke.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "white"; // This will be clipped anyway
        ctx.stroke();
      }

      ctx.clip();

      // Draw blurred image within clipped area
      ctx.drawImage(tempCanvas, 0, 0);

      ctx.restore();
    },
    []
  );

  // Convert screen coordinates to canvas coordinates
  const getCanvasCoordinates = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * canvasScale.x;
      const y = (e.clientY - rect.top) * canvasScale.y;

      return { x, y };
    },
    [canvasScale]
  );

  // Handle drawing start
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!imageLoaded) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const coords = getCanvasCoordinates(e);
      setIsDrawing(true);
      setCurrentStroke([coords]);
      setIsBlurBrushing(true);

      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [imageLoaded, getCanvasCoordinates, setIsBlurBrushing]
  );

  // Handle drawing movement
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !imageLoaded) return;

      const coords = getCanvasCoordinates(e);
      const newStroke = [...currentStroke, coords];
      setCurrentStroke(newStroke);

      // Real-time preview
      const canvas = canvasRef.current;
      if (canvas) {
        redrawCanvas();

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const previewStroke: BlurStroke = {
            id: "preview",
            points: newStroke,
            blurAmount,
            brushSize,
            timestamp: Date.now(),
          };
          applyBlurStroke(ctx, previewStroke);
        }
      }

      e.preventDefault();
    },
    [
      isDrawing,
      imageLoaded,
      currentStroke,
      blurAmount,
      brushSize,
      getCanvasCoordinates,
      redrawCanvas,
      applyBlurStroke,
    ]
  );

  // Handle drawing end
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !imageLoaded) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create final stroke
      const finalStroke: BlurStroke = {
        id: crypto.randomUUID(),
        points: currentStroke,
        blurAmount,
        brushSize,
        timestamp: Date.now(),
      };

      addBlurStroke(finalStroke);

      // Reset state
      setIsDrawing(false);
      setCurrentStroke([]);
      setIsBlurBrushing(false);

      canvas.releasePointerCapture(e.pointerId);
      e.preventDefault();
    },
    [
      isDrawing,
      imageLoaded,
      currentStroke,
      blurAmount,
      brushSize,
      addBlurStroke,
      setIsBlurBrushing,
    ]
  );

  // Redraw when strokes change
  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [imageLoaded, redrawCanvas]);

  if (!imageLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Hidden reference image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Blur canvas reference"
        className="hidden"
      />

      {/* Main blur canvas */}
      <canvas
        ref={canvasRef}
        className="cursor-crosshair shadow-lg border border-border"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          touchAction: "none",
          imageRendering: "auto",
        }}
      />

      {/* Visual brush size indicator */}
      {isDrawing && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: `${brushSize / canvasScale.x}px`,
            height: `${brushSize / canvasScale.y}px`,
            border: "2px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};
