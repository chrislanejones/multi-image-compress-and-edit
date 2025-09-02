import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Type, Plus, Minus } from "lucide-react";
import { Slider } from "./ui/slider";
import { TextToolRef, TextToolProps } from "../types/types";

const TextTool = forwardRef<TextToolRef, TextToolProps>(
  (
    { imageUrl, onApplyText, onCancel, setEditorState, setBold, setItalic },
    ref
  ) => {
    // State for text properties
    const [text, setText] = useState<string>("");
    const [font, setFont] = useState<string>("Arial");
    const [size, setSize] = useState<number>(24);
    const [color, setColor] = useState<string>("#ffffff");
    const [position, setPosition] = useState<{ x: number; y: number }>({
      x: 50,
      y: 50,
    });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isBold, setIsBold] = useState<boolean>(false);
    const [isItalic, setIsItalic] = useState<boolean>(false);
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
      "center"
    );
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 });

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Initialize canvas with image
    useEffect(() => {
      if (!canvasRef.current || !imageUrl) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Calculate display size
        if (imageContainerRef.current) {
          const containerRect =
            imageContainerRef.current.getBoundingClientRect();
          const containerWidth = containerRect.width - 32;
          const containerHeight = containerRect.height - 32;

          const scaleToFit = Math.min(
            containerWidth / naturalWidth,
            containerHeight / naturalHeight,
            1
          );

          const displayWidth = naturalWidth * scaleToFit;
          const displayHeight = naturalHeight * scaleToFit;

          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;

          setCanvasScale({
            x: naturalWidth / displayWidth,
            y: naturalHeight / displayHeight,
          });
        }

        setImageLoaded(true);

        if (imageRef.current) {
          imageRef.current.src = img.src;
        }
      };

      img.onerror = () => {
        console.error("Failed to load image for text tool");
      };

      img.src = imageUrl;
    }, [imageUrl]);

    // Handle text input changes
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    };

    // Handle font selection
    const handleFontChange = (value: string) => {
      setFont(value);
    };

    // Handle size changes
    const handleSizeChange = (value: number[]) => {
      setSize(value[0]);
    };

    // Handle color changes
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
    };

    // Convert screen coordinates to percentage
    const getPositionFromEvent = useCallback(
      (e: React.MouseEvent) => {
        if (!imageContainerRef.current) return position;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        if (!canvas) return position;

        const canvasRect = canvas.getBoundingClientRect();
        const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
        const y = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

        return {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        };
      },
      [position]
    );

    // Handle canvas click to position text
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) return;

      const newPosition = getPositionFromEvent(e);
      setPosition(newPosition);
    };

    // Handle text dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("text-preview")) {
        setIsDragging(true);
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newPosition = getPositionFromEvent(e);
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Toggle styles
    const toggleBold = () => {
      setIsBold(!isBold);
      setBold(!isBold);
    };

    const toggleItalic = () => {
      setIsItalic(!isItalic);
      setItalic(!isItalic);
    };

    // Apply text to image
    const applyText = useCallback(() => {
      if (!canvasRef.current || !text.trim() || !imageRef.current) {
        console.warn("Cannot apply text: missing canvas, text, or image");
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Redraw the original image first
      const img = imageRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Set font properties
      const fontWeight = isBold ? "bold " : "";
      const fontStyle = isItalic ? "italic " : "";
      const fontString = `${fontStyle}${fontWeight}${size}px ${font}`;

      ctx.font = fontString;
      ctx.fillStyle = color;
      ctx.textAlign = alignment;
      ctx.textBaseline = "middle";

      // Add text outline for better visibility
      ctx.strokeStyle = color === "#ffffff" ? "#000000" : "#ffffff";
      ctx.lineWidth = Math.max(1, size / 20);

      // Calculate position in canvas coordinates
      const x = (position.x / 100) * canvas.width;
      const y = (position.y / 100) * canvas.height;

      // Draw text with outline
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      // Restore context state
      ctx.restore();

      // Generate image URL and pass to parent
      const textedImageUrl = canvas.toDataURL("image/png", 1.0);
      onApplyText(textedImageUrl);

      // Update editor state
      setEditorState("editImage");
    }, [
      text,
      font,
      size,
      color,
      position,
      isBold,
      isItalic,
      alignment,
      onApplyText,
      setEditorState,
    ]);

    // Get canvas data URL
    const getCanvasDataUrl = useCallback(() => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL("image/png", 1.0);
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      applyText,
      getCanvasDataUrl,
    }));

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
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Canvas Column */}
        <div
          ref={imageContainerRef}
          className="bg-card rounded-lg p-4 overflow-hidden flex items-center justify-center border border-border"
        >
          <div className="relative">
            {/* Hidden reference image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Text tool reference"
              className="hidden"
            />

            {/* Main canvas */}
            <canvas
              ref={canvasRef}
              className="block cursor-crosshair shadow-lg border border-border"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                touchAction: "none",
                imageRendering: "auto",
              }}
            />

            {/* Text position crosshair */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Crosshair lines */}
              <div className="absolute w-6 h-0.5 bg-red-500 opacity-75 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-0.5 h-6 bg-red-500 opacity-75 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Text preview overlay */}
            {text.trim() && (
              <div
                className={`text-preview absolute cursor-move select-none pointer-events-auto ${
                  isDragging ? "opacity-70" : ""
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontFamily: font,
                  fontSize: `${Math.min(size, 48)}px`, // Limit preview size
                  fontWeight: isBold ? "bold" : "normal",
                  fontStyle: isItalic ? "italic" : "normal",
                  color: color,
                  textAlign: alignment,
                  textShadow: `1px 1px 2px ${color === "#ffffff" ? "#000000" : "#ffffff"}`,
                  whiteSpace: "nowrap",
                  maxWidth: "90%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseDown={handleMouseDown}
              >
                {text}
              </div>
            )}
          </div>
        </div>

        {/* Controls Column */}
        <div className="bg-card rounded-lg p-4 space-y-4 text-card-foreground overflow-y-auto max-h-[600px] border border-border">
          <h3 className="text-lg font-medium flex items-center">
            <Type className="mr-2 h-5 w-5" />
            Text Tools
          </h3>

          {/* Text input and style buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Text Content</label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Enter your text..."
                value={text}
                onChange={handleTextChange}
                className="flex-1 bg-input border border-input"
              />

              <Button
                onClick={toggleBold}
                variant={isBold ? "default" : "outline"}
                size="sm"
                className="h-10 w-10 p-0 font-bold text-lg"
              >
                B
              </Button>

              <Button
                onClick={toggleItalic}
                variant={isItalic ? "default" : "outline"}
                size="sm"
                className="h-10 w-10 p-0 italic text-lg"
              >
                I
              </Button>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Text Alignment</label>
            <Select
              value={alignment}
              onValueChange={(value: any) => setAlignment(value)}
            >
              <SelectTrigger className="bg-input border border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Font Family</label>
            <Select value={font} onValueChange={handleFontChange}>
              <SelectTrigger className="bg-input border border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                <SelectItem value="Impact">Impact</SelectItem>
                <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Font Size: {size}px
            </label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSize(Math.max(8, size - 2))}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[size]}
                min={8}
                max={120}
                step={2}
                onValueChange={handleSizeChange}
                className="flex-1"
              />
              <Button
                onClick={() => setSize(Math.min(120, size + 2))}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Text Color</label>
            <div className="flex gap-3 items-center p-3 bg-muted rounded-lg">
              <div
                className="w-12 h-12 rounded-md border-2 border-border shadow-sm"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                  className="w-full h-8 cursor-pointer bg-transparent"
                />
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {color}
                </div>
              </div>
            </div>
          </div>

          {/* Position Info */}
          <div className="bg-muted p-3 rounded-md space-y-2">
            <p className="text-sm font-medium">Position & Instructions</p>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the image to position your text
            </p>
            <p className="text-xs text-muted-foreground">
              Drag the preview text to fine-tune position
            </p>
            <div className="text-xs text-muted-foreground font-mono">
              X: {Math.round(position.x)}% • Y: {Math.round(position.y)}%
            </div>
          </div>

          {/* Text Preview */}
          {text.trim() && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div
                className="text-center p-2 border border-border rounded bg-card"
                style={{
                  fontFamily: font,
                  fontSize: `${Math.min(size, 32)}px`, // Limit preview size
                  fontWeight: isBold ? "bold" : "normal",
                  fontStyle: isItalic ? "italic" : "normal",
                  color: color,
                  textAlign: alignment,
                }}
              >
                {text}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={applyText}
              disabled={!text.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Apply Text to Image
            </Button>

            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TextTool.displayName = "TextTool";

export default TextTool;
