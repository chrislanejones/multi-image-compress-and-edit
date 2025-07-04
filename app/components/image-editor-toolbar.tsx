// app/components/ImageEditorToolbar.tsx - Step 3: Smart toolbar system
import React, { useState } from "react";
import {
  X,
  Minus,
  Plus,
  Crop,
  Droplets,
  Paintbrush,
  Check,
  RefreshCw,
  Trash2,
  Type,
  Images,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  FlipHorizontal,
  Download,
  Archive,
} from "lucide-react";
import { Button } from "./ui/button";

// Simple Separator component
const Separator: React.FC<{
  orientation: "vertical" | "horizontal";
  className?: string;
}> = ({ orientation, className = "" }) => (
  <div
    className={`bg-gray-300 dark:bg-gray-600 ${
      orientation === "vertical" ? "w-px" : "h-px"
    } ${className}`}
  />
);

interface ImageEditorToolbarProps {
  mode: "gallery" | "edit" | "crop" | "blur" | "paint" | "text";
  currentImageIndex: number;
  totalImages: number;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  onModeChange: (
    mode: "gallery" | "edit" | "crop" | "blur" | "paint" | "text"
  ) => void;
  onImageNavigation: (direction: "prev" | "next") => void;
  onPageNavigation: (direction: "prev" | "next") => void;
  onZoomChange: (zoom: number) => void;
  onToolAction: (action: string) => void;
  onBulkAction: (action: "compress" | "download") => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export const ImageEditorToolbar: React.FC<ImageEditorToolbarProps> = ({
  mode,
  currentImageIndex,
  totalImages,
  currentPage,
  totalPages,
  zoomLevel,
  onModeChange,
  onImageNavigation,
  onPageNavigation,
  onZoomChange,
  onToolAction,
  onBulkAction,
  onThemeToggle,
  isDarkMode,
}) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    onToolAction(tool);
  };

  // Gallery Mode Toolbar
  if (mode === "gallery") {
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Left: Gallery Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Images className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gallery Mode
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages} • {totalImages} images
          </span>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageNavigation("prev")}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageNavigation("next")}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Bulk Actions & Theme */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction("compress")}
          >
            <Archive className="h-4 w-4 mr-2" />
            Compress All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction("download")}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={onThemeToggle}>
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Edit Mode Toolbar
  if (mode === "edit") {
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Left: Back to Gallery */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeChange("gallery")}
          >
            <X className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Edit Mode
          </span>
        </div>

        {/* Center: Image Navigation & Zoom */}
        <div className="flex items-center space-x-4">
          {/* Image Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageNavigation("prev")}
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">
              {currentImageIndex + 1} / {totalImages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageNavigation("next")}
              disabled={currentImageIndex === totalImages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.max(0.25, zoomLevel - 0.25))}
              disabled={zoomLevel <= 0.25}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2 min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.min(4, zoomLevel + 0.25))}
              disabled={zoomLevel >= 4}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Edit Tools - coming soon */}
      </div>
    );
  }

  // Tool-Specific Toolbars (Crop, Blur, Paint, Text)
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left: Back to Edit */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModeChange("edit")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {mode} Tool
        </span>
      </div>

      {/* Center: Tool-Specific Controls */}
      <div className="flex items-center space-x-2">
        {mode === "crop" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("crop-square")}
            >
              Square
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("crop-16-9")}
            >
              16:9
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("crop-4-3")}
            >
              4:3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("crop-free")}
            >
              Free
            </Button>
          </>
        )}

        {mode === "blur" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("blur-light")}
            >
              Light
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("blur-medium")}
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("blur-heavy")}
            >
              Heavy
            </Button>
          </>
        )}

        {mode === "paint" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("brush-small")}
            >
              Small
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("brush-medium")}
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("brush-large")}
            >
              Large
            </Button>
          </>
        )}

        {mode === "text" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("text-small")}
            >
              Small
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("text-medium")}
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolSelect("text-large")}
            >
              Large
            </Button>
          </>
        )}
      </div>

      {/* Right: Tool Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToolSelect("reset")}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleToolSelect("apply")}
        >
          <Check className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
};
