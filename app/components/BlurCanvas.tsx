import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBlurStore } from '../stores';
import type { BlurStroke } from '../types/types';

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
  zoom
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const {
    blurAmount,
    brushSize,
    blurBrushStrokes,
    addBlurStroke,
    setIsBlurBrushing
  } = useBlurStore();

  // Initialize canvas and image
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the image
    image.onload = () => {
      // Set canvas size to match image display size
      const displayWidth = image.naturalWidth * (zoom / 100);
      const displayHeight = image.naturalHeight * (zoom / 100);
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Clear and redraw
      redrawCanvas();
    };
    image.src = imageUrl;
  }, [imageUrl, zoom]);

  // Redraw canvas with all blur strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always start with the original, unblurred image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Apply blur strokes on top of the original image
    blurBrushStrokes.forEach(stroke => {
      applyBlurStroke(ctx, stroke);
    });
  }, [blurBrushStrokes]);

  // Apply a single blur stroke to the canvas
  const applyBlurStroke = (ctx: CanvasRenderingContext2D, stroke: BlurStroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    
    // Create a temporary canvas for the blurred image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = ctx.canvas.width;
    tempCanvas.height = ctx.canvas.height;

    // Draw the original image to temp canvas and apply blur
    const image = imageRef.current;
    if (image) {
      tempCtx.filter = `blur(${stroke.blurAmount}px)`;
      tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Create a clipping mask for the brush stroke
    ctx.save();
    ctx.beginPath();
    
    // Draw the brush stroke path
    if (stroke.points.length === 1) {
      // Single point - draw a circle
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.brushSize / 2, 0, Math.PI * 2);
    } else {
      // Multiple points - draw connected strokes
      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2);
      }
    }
    
    ctx.clip();
    
    // Draw the blurred image only within the clipped area
    ctx.drawImage(tempCanvas, 0, 0);
    
    ctx.restore();
    ctx.restore();
  };

  // Handle mouse/touch start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
    setIsBlurBrushing(true);
    
    canvas.setPointerCapture(e.pointerId);
  }, [setIsBlurBrushing]);

  // Handle mouse/touch move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const newStroke = [...currentStroke, { x, y }];
    setCurrentStroke(newStroke);

    // Draw preview of current stroke
    const ctx = canvas.getContext('2d');
    if (ctx) {
      redrawCanvas();
      
      // Draw current stroke preview
      const previewStroke: BlurStroke = {
        id: 'preview',
        points: newStroke,
        blurAmount,
        brushSize,
        timestamp: Date.now()
      };
      applyBlurStroke(ctx, previewStroke);
    }
  }, [isDrawing, currentStroke, blurAmount, brushSize, redrawCanvas]);

  // Handle mouse/touch end
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create final blur stroke
    const finalStroke: BlurStroke = {
      id: crypto.randomUUID(),
      points: currentStroke,
      blurAmount,
      brushSize,
      timestamp: Date.now()
    };

    // Add to store
    addBlurStroke(finalStroke);

    // Reset drawing state
    setIsDrawing(false);
    setCurrentStroke([]);
    setIsBlurBrushing(false);
    
    canvas.releasePointerCapture(e.pointerId);
  }, [isDrawing, currentStroke, blurAmount, brushSize, addBlurStroke, setIsBlurBrushing]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Blur canvas reference"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          touchAction: 'none',
          transform: `scale(${zoom / 100})`
        }}
      />
    </div>
  );
};