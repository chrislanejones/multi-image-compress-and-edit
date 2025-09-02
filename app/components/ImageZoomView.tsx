"use client";

import { useState, useRef, useCallback } from "react";
import { Minus, Plus, MousePointer } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import type { MousePosition } from "../types/types";

export interface ImageZoomViewProps {
  imageUrl: string;
  imageTransforms?: {
    rotation?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
  };
}

export default function ImageZoomView({ imageUrl, imageTransforms }: ImageZoomViewProps) {
  const [magnifierZoom, setMagnifierZoom] = useState<number>(3);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0.5,
    y: 0.5,
  });
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    },
    []
  );

  const handleMouseEnter = useCallback((): void => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsHovering(false);
  }, []);

  const getBackgroundPosition = useCallback((): string => {
    if (isHovering) {
      return `${mousePosition.x * 100}% ${mousePosition.y * 100}%`;
    }
    return "50% 50%";
  }, [isHovering, mousePosition]);

  const handleZoomOut = useCallback((): void => {
    setMagnifierZoom(Math.max(magnifierZoom - 0.5, 1.5));
  }, [magnifierZoom]);

  const handleZoomIn = useCallback((): void => {
    setMagnifierZoom(Math.min(magnifierZoom + 0.5, 6));
  }, [magnifierZoom]);

  const handleZoomChange = useCallback((values: number[]): void => {
    setMagnifierZoom(values[0]);
  }, []);

  return (
    <Card className="bg-card text-card-foreground shadow-lg">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Zoom Preview</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">
              {magnifierZoom.toFixed(1)}x
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Zoom slider */}
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Slider
              value={[magnifierZoom]}
              min={1.5}
              max={6}
              step={0.5}
              onValueChange={handleZoomChange}
              className="w-full"
            />

            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Magnifier preview */}
          <div
            className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md cursor-crosshair"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="w-full h-full transition-all duration-100"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: getBackgroundPosition(),
                backgroundSize: `${magnifierZoom * 100}%`,
                backgroundRepeat: "no-repeat",
                transform: `rotate(${imageTransforms?.rotation || 0}deg) scaleX(${imageTransforms?.flipHorizontal ? -1 : 1}) scaleY(${imageTransforms?.flipVertical ? -1 : 1})`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Crosshair */}
                  <div className="absolute w-[1px] h-12 bg-red-500 left-1/2 -translate-x-1/2"></div>
                  <div className="absolute h-[1px] w-12 bg-red-500 top-1/2 -translate-y-1/2"></div>
                  <div className="w-12 h-12 rounded-full border border-red-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  </div>
                </div>
              </div>

              {!isHovering && (
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <p className="text-xs text-white bg-black bg-opacity-50 py-1 px-2 rounded-md inline-block">
                    <MousePointer className="h-3 w-3 inline mr-1" />
                    Hover to zoom
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
