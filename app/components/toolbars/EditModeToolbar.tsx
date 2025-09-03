// app/components/toolbars/EditModeToolbar.tsx
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCcw,
  Crop,
  Droplets,
  Paintbrush,
  Type,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { useViewStore, useImageStore, useAppStateStore } from "../../stores";
import { useImageContext } from "../../context/image-context";

export const EditModeToolbar = () => {
  const { globalZoomIn, globalZoomOut } = useViewStore();
  const { rotateImage, flipImageHorizontal, flipImageVertical, resetImage } =
    useImageStore();
  const { setEditorState, showShortcutHints, setShowShortcutHints } =
    useAppStateStore();
  const { selectedImage } = useImageContext();
  const navigate = useNavigate();
  const location = useLocation();
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentImageId = selectedImage?.id;

  // Get current tool from URL
  const searchParams = new URLSearchParams(location.search);
  const currentTool = searchParams.get("tool");

  const handleToolClick = useCallback(
    (mode: "crop" | "blur" | "paint" | "text") => {
      if (currentImageId) {
        // Update the editor state immediately
        setEditorState(mode);

        // Navigate to the tool route
        navigate({
          to: `/resize-and-optimize/${currentImageId}/edit`,
          search: { tool: mode },
          replace: true, // Replace current history entry
        });
      } else {
        console.warn("No currentImageId available for tool navigation");
      }
    },
    [currentImageId, navigate, setEditorState]
  );

  const handleExitEditMode = useCallback(() => {
    setEditorState("resizeAndOptimize");
    navigate({ to: "/resize-and-optimize", replace: true });
  }, [setEditorState, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Toggle shortcut hints with 'i'
      if (key === "i") {
        event.preventDefault();
        
        // Clear any existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        
        // Show shortcuts
        setShowShortcutHints(true);
        
        // Auto-hide after 3 seconds
        hideTimeoutRef.current = setTimeout(() => {
          setShowShortcutHints(false);
        }, 3000);
        
        return;
      }

      // Handle tool shortcuts (no Alt required)
      if (currentImageId && !event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (key) {
          case "c":
            event.preventDefault();
            handleToolClick("crop");
            break;
          case "b":
            event.preventDefault();
            handleToolClick("blur");
            break;
          case "p":
            event.preventDefault();
            handleToolClick("paint");
            break;
          case "t":
            event.preventDefault();
            handleToolClick("text");
            break;
          case "x":
            event.preventDefault();
            handleExitEditMode();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Ensure hints are hidden when component unmounts
      setShowShortcutHints(false);
      // Clear any pending timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [
    currentImageId,
    setShowShortcutHints,
    handleToolClick,
    handleExitEditMode,
  ]);

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-3 items-center">
        {/* Left: zoom + rotate + flip + reset */}
        <div className="flex items-center gap-2 justify-self-start">
          <Button
            onClick={globalZoomIn}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            onClick={globalZoomOut}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => selectedImage && rotateImage(selectedImage.id, -90)}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => selectedImage && rotateImage(selectedImage.id, 90)}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() =>
              selectedImage && flipImageHorizontal(selectedImage.id)
            }
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => selectedImage && flipImageVertical(selectedImage.id)}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <FlipVertical className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => selectedImage && resetImage(selectedImage.id)}
            variant="outline"
            className="h-9 w-9 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: tools */}
        <div className="flex items-center gap-2 justify-self-center">
          <Button
            onClick={() => handleToolClick("crop")}
            variant={currentTool === "crop" ? "default" : "outline"}
            className="h-9"
            disabled={!currentImageId}
          >
            <Crop className="mr-2 h-4 w-4" />
            {showShortcutHints ? "Crop (C)" : "Crop"}
          </Button>
          <Button
            onClick={() => handleToolClick("blur")}
            variant={currentTool === "blur" ? "default" : "outline"}
            className="h-9"
            disabled={!currentImageId}
          >
            <Droplets className="mr-2 h-4 w-4" />
            {showShortcutHints ? "Blur (B)" : "Blur"}
          </Button>
          <Button
            onClick={() => handleToolClick("paint")}
            variant={currentTool === "paint" ? "default" : "outline"}
            className="h-9"
            disabled={!currentImageId}
          >
            <Paintbrush className="mr-2 h-4 w-4" />
            {showShortcutHints ? "Paint (P)" : "Paint"}
          </Button>
          <Button
            onClick={() => handleToolClick("text")}
            variant={currentTool === "text" ? "default" : "outline"}
            className="h-9"
            disabled={!currentImageId}
          >
            <Type className="mr-2 h-4 w-4" />
            {showShortcutHints ? "Text (T)" : "Text"}
          </Button>
        </div>

        {/* Right: keyboard hint + exit */}
        <div className="flex items-center gap-4 justify-self-end">
          <span className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">I</kbd> to show keyboard shortcuts
          </span>
          <Button
            onClick={handleExitEditMode}
            variant="outline"
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Exit Edit Mode
          </Button>
        </div>
      </div>
    </div>
  );
};
