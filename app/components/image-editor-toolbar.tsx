// app/components/image-editor-toolbar.tsx
import React from "react";
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
  Eraser,
  Type,
  Images,
  Moon,
  Sun,
  User,
  Undo,
  Redo,
  RotateCw,
  RotateCcw,
  ArrowLeft,
  Pencil,
  Lock,
  Download,
  ZoomIn,
  ZoomOut,
  Brush,
  FlipHorizontal,
  FlipVertical,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useTheme } from "next-themes";

// Types for the toolbar props
export interface ImageEditorToolbarProps {
  editorState:
    | "resizeAndOptimize"
    | "editImage"
    | "bulkImageEdit"
    | "crop"
    | "blur"
    | "paint"
    | "text";
  isCompressing?: boolean;
  zoom: number;
  historyIndex?: number;
  historyLength?: number;
  currentPage: number;
  totalPages: number;
  padlockAnimation?: boolean;
  bulkCropData?: any;
  blurAmount: number;
  blurRadius: number;
  allImages?: any[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClose?: () => void;
  onRemoveAll?: () => void;
  onUploadNew?: () => void;
  onNavigateImage?: (direction: "prev" | "next") => void;
  onNavigatePage?: (direction: "prev" | "next") => void;
  onStateChange: (
    state:
      | "resizeAndOptimize"
      | "editImage"
      | "bulkImageEdit"
      | "crop"
      | "blur"
      | "paint"
      | "text"
  ) => void;
  onApplyCrop?: () => void;
  onApplyBlur?: () => void;
  onApplyPaint?: () => void;
  onApplyText?: () => void;
  onBlurAmountChange?: (value: number) => void;
  onBlurRadiusChange?: (value: number) => void;
  onBulkCropApply?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onReset?: () => void;
}

// Simple pagination component
const SimplePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: "prev" | "next") => void;
  className?: string;
}> = ({ currentPage, totalPages, onNavigate, className }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="outline"
        className="py-2 h-9 px-3"
        onClick={() => onNavigate("prev")}
        disabled={currentPage <= 1}
        title="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm px-2 text-white whitespace-nowrap">
        {currentPage}/{totalPages}
      </span>
      <Button
        variant="outline"
        className="py-2 h-9 px-3"
        onClick={() => onNavigate("next")}
        disabled={currentPage >= totalPages}
        title="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const ImageEditorToolbar: React.FC<ImageEditorToolbarProps> = ({
  editorState,
  isCompressing,
  zoom,
  historyIndex,
  historyLength,
  currentPage,
  totalPages,
  padlockAnimation,
  bulkCropData,
  blurAmount,
  blurRadius,
  allImages,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onClose,
  onRemoveAll,
  onUploadNew,
  onNavigateImage,
  onNavigatePage,
  onStateChange,
  onApplyCrop,
  onApplyBlur,
  onApplyPaint,
  onApplyText,
  onBlurAmountChange,
  onBlurRadiusChange,
  onBulkCropApply,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  onReset,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleThemeChange = React.useCallback(
    (newTheme: string) => {
      setTimeout(() => {
        setTheme(newTheme);
      }, 0);
    },
    [setTheme]
  );

  // Render padlock for edit modes
  const renderPadlock = () => {
    if (editorState === "editImage" || editorState === "bulkImageEdit") {
      return (
        <div
          className={`w-full flex justify-center items-center mb-4 ${
            padlockAnimation ? "animate-pulse" : ""
          }`}
        >
          <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-gray-600 border border-gray-500">
            {editorState === "bulkImageEdit" ? (
              <>
                <Images
                  className={`h-4 w-4 ${
                    padlockAnimation ? "text-yellow-300" : "text-white"
                  }`}
                />
                <span className="font-medium">Bulk Edit Mode</span>
              </>
            ) : (
              <>
                <Lock
                  className={`h-4 w-4 ${
                    padlockAnimation ? "text-yellow-300" : "text-white"
                  }`}
                />
                <span className="font-medium">Edit Image Mode</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render toolbar based on state
  const renderToolbar = () => {
    switch (editorState) {
      case "resizeAndOptimize":
        return (
          <>
            <div className="flex items-center gap-2">
              <Button
                onClick={onZoomOut}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={onZoomIn}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onStateChange("editImage")}
                variant="outline"
                className="h-9"
                data-testid="edit-image-button"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Image
              </Button>
              <Button
                onClick={() => onStateChange("bulkImageEdit")}
                variant="outline"
                className="h-9"
                disabled={!allImages || allImages.length <= 1}
                title={
                  !allImages
                    ? "No images available"
                    : allImages.length <= 1
                      ? `Bulk edit requires multiple images (currently ${
                          allImages.length
                        } image${allImages.length === 1 ? "" : "s"})`
                      : `Edit ${allImages.length} images at once`
                }
              >
                <Images className="mr-2 h-4 w-4" />
                Bulk Edit ({allImages?.length || 0})
              </Button>

              <Button
                disabled
                variant="outline"
                className="h-9"
                title="AI-powered editing features coming soon"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Editor
              </Button>

              {/* Navigation Controls with << >> for pages, < > for images */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  className="py-2 h-9 px-3"
                  onClick={() => onNavigatePage && onNavigatePage("prev")}
                  disabled={!onNavigatePage || currentPage <= 1}
                  title="Previous page (show previous 10 images)"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="py-2 h-9 px-3"
                  onClick={() => onNavigateImage && onNavigateImage("prev")}
                  disabled={!onNavigateImage}
                  title="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 text-white whitespace-nowrap">
                  Switch Photos ({currentPage}/{totalPages})
                </span>
                <Button
                  variant="outline"
                  className="py-2 h-9 px-3"
                  onClick={() => onNavigateImage && onNavigateImage("next")}
                  disabled={!onNavigateImage}
                  title="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="py-2 h-9 px-3"
                  onClick={() => onNavigatePage && onNavigatePage("next")}
                  disabled={!onNavigatePage || currentPage >= totalPages}
                  title="Next page (show next 10 images)"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClose && (
                <Button onClick={onClose} variant="outline" className="h-9">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Button>
              )}
              {onRemoveAll && (
                <Button
                  onClick={onRemoveAll}
                  variant="destructive"
                  className="h-9"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove All
                </Button>
              )}
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleThemeChange(theme === "dark" ? "light" : "dark")
                  }
                  className="h-9 w-9"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                disabled
                className="h-9 w-9"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </>
        );

      case "editImage":
        return (
          <div className="w-full grid grid-cols-3 items-center">
            <div className="flex items-center gap-2 justify-self-start">
              <Button
                onClick={onZoomOut}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={onZoomIn}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={onRotateLeft}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={onRotateRight}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={onFlipHorizontal}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                onClick={onFlipVertical}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 justify-self-center">
              <Button
                onClick={() => onStateChange("crop")}
                variant="outline"
                className="h-9"
              >
                <Crop className="mr-2 h-4 w-4" />
                Crop
              </Button>
              <Button
                onClick={() => onStateChange("blur")}
                variant="outline"
                className="h-9"
              >
                <Droplets className="mr-2 h-4 w-4" />
                Blur
              </Button>
              <Button
                onClick={() => onStateChange("paint")}
                variant="outline"
                className="h-9"
              >
                <Paintbrush className="mr-2 h-4 w-4" />
                Paint
              </Button>
              <Button
                onClick={() => onStateChange("text")}
                variant="outline"
                className="h-9"
              >
                <Type className="mr-2 h-4 w-4" />
                Text
              </Button>
            </div>

            <div className="flex items-center gap-2 justify-self-end">
              <Button
                onClick={() => onStateChange("resizeAndOptimize")}
                variant="outline"
                className="h-9"
              >
                <X className="mr-2 h-4 w-4" />
                Exit Edit
              </Button>
            </div>
          </div>
        );

      case "bulkImageEdit":
        return null; // Handled by separate component

      case "crop":
      case "blur":
      case "paint":
      case "text":
        return (
          <>
            <div className="flex items-center gap-2">
              <Button
                onClick={onZoomOut}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={onZoomIn}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {editorState === "crop" && onApplyCrop && (
                <>
                  <Button
                    onClick={onApplyCrop}
                    variant="default"
                    className="h-9"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply Crop
                  </Button>
                  <Button
                    onClick={() => onStateChange("editImage")}
                    variant="outline"
                    className="h-9"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}

              {editorState === "blur" && onApplyBlur && (
                <>
                  <Button
                    onClick={onApplyBlur}
                    variant="default"
                    className="h-9"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply Blur
                  </Button>
                  <Button
                    onClick={() => onStateChange("editImage")}
                    variant="outline"
                    className="h-9"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}

              {editorState === "paint" && onApplyPaint && (
                <>
                  <Button
                    onClick={onApplyPaint}
                    variant="default"
                    className="h-9"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply Paint
                  </Button>
                  <Button
                    onClick={() => onStateChange("editImage")}
                    variant="outline"
                    className="h-9"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}

              {editorState === "text" && onApplyText && (
                <>
                  <Button
                    onClick={onApplyText}
                    variant="default"
                    className="h-9"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply Text
                  </Button>
                  <Button
                    onClick={() => onStateChange("editImage")}
                    variant="outline"
                    className="h-9"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderPadlock()}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-700 p-2 rounded-lg z-10 relative">
        {renderToolbar()}
      </div>

      {/* Tool-specific secondary toolbars */}
      {editorState === "blur" && onBlurAmountChange && onBlurRadiusChange && (
        <div className="flex items-center gap-4 p-2 bg-gray-700 rounded-lg mb-4">
          <div className="flex-1">
            <label
              htmlFor="blur-amount"
              className="text-sm font-medium block mb-1 text-white"
            >
              Blur Amount: {blurAmount}px
            </label>
            <Slider
              id="blur-amount"
              min={1}
              max={20}
              step={1}
              value={[blurAmount]}
              onValueChange={(values) => onBlurAmountChange(values[0])}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="blur-radius"
              className="text-sm font-medium block mb-1 text-white"
            >
              Brush Size: {blurRadius}px
            </label>
            <Slider
              id="blur-radius"
              min={5}
              max={50}
              step={1}
              value={[blurRadius]}
              onValueChange={(values) => onBlurRadiusChange(values[0])}
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
};
