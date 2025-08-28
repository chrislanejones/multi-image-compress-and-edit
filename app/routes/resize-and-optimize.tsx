import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import {
  useViewStore,
  useAppStateStore,
  useCropStore,
  useImageStore,
  useBlurStore,
  usePaintStore,
} from "../stores";
import { TextToolRef } from "../types/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import {
  ComputerWindow,
  ComputerWindowHeader,
  ComputerWindowLogo,
  ComputerWindowTitle,
} from "../components/ui/computer-window";
import { ImageEditorToolbar } from "../components/image-editor-toolbar";
import ImageResizer from "../components/ImageResizer";
import ImageStats from "../components/ImageStats";
import ImageZoomView from "../components/ImageZoomView";
import { useEffect, useState, useRef } from "react";
import { Home, ImageIcon, X, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { BlurCanvas } from "../components/BlurCanvas";
import { PaintCanvas } from "../components/PaintCanvas";
import TextTool from "../components/TextTool";
import { NonGalleryHeader } from "../components/non-gallery-header";
import React from "react";
import type { ImageFile } from "../types/types";

export const Route = createFileRoute("/resize-and-optimize")({
  component: ResizeAndOptimizeLayout,
});

// Error Boundary for canvas tools
const CanvasErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: any) => {
      console.error("Canvas tool error:", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">
            Oops! Something went wrong with the editor.
          </p>
          <Button
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Fast thumbnail component for the gallery
const FastThumbnail = React.memo(
  ({
    image,
    isSelected,
    onClick,
    onRemove,
    isLoading,
  }: {
    image: ImageFile;
    isSelected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
    isLoading: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group transition-all duration-300 ease-in-out ${
        isSelected
          ? "ring-4 ring-sky-400 ring-offset-2 ring-offset-gray-800 scale-105"
          : "hover:scale-105"
      }`}
    >
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={image.url}
          alt={image.file.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          style={{
            transform: `rotate(${image.rotation || 0}deg) scaleX(${
              image.flipHorizontal ? -1 : 1
            }) scaleY(${image.flipVertical ? -1 : 1})`,
          }}
        />
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
        <Button
          variant="destructive"
          size="sm"
          className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white shadow-lg"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      {image.metadata?.compressionRatio && (
        <div
          className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1"
          title="Image Size Reduced"
        >
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-white text-xs font-medium">
            {image.metadata.compressionRatio}%
          </span>
        </div>
      )}
    </div>
  )
);
FastThumbnail.displayName = "FastThumbnail";

function NoImagesComponent() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          navigate({ to: "/" });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ComputerWindow size="lg">
        <ComputerWindowHeader>
          <ComputerWindowLogo
            src="/Image-Horse-Logo.svg"
            alt="ImageHorse Logo"
          />
          <ComputerWindowTitle
            title="ImageHorse"
            subtitle="No images found in your gallery"
          />
        </ComputerWindowHeader>

        <div className="text-center space-y-6">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />

          {countdown !== null && (
            <div className="space-y-2">
              <p className="text-gray-300">Redirecting to upload page in...</p>
              <div className="text-4xl font-bold text-sky-400">{countdown}</div>
            </div>
          )}

          <Button
            onClick={() => navigate({ to: "/" })}
            size="lg"
            className="w-full bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100"
          >
            <Home className="mr-2 h-4 w-4" /> Go to Upload
          </Button>
        </div>
      </ComputerWindow>
    </div>
  );
}

function ResizeAndOptimizeLayout() {
  const {
    selectedImage,
    images,
    updateImage,
    paginatedImages,
    onSelect,
    onRemove,
    loadingImages,
  } = useImageContext();
  const textToolRef = useRef<TextToolRef>(null);

  const { globalZoom: zoom, cropZoom } = useViewStore();
  const { editorState, setEditorState, setTextSaveTrigger } =
    useAppStateStore();
  const { crop, setCrop, completedCrop, setCompletedCrop } = useCropStore();
  const { setImages: setStoreImages, selectImage: setStoreSelectedImage } =
    useImageStore();

  // Create a trigger function for text tool save
  const triggerTextSave = () => {
    if (textToolRef.current) {
      textToolRef.current.applyText();
    }
  };

  // Set the trigger function in the store when component mounts
  useEffect(() => {
    setTextSaveTrigger(triggerTextSave);
    return () => setTextSaveTrigger(null); // Clean up on unmount
  }, [setTextSaveTrigger]);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract mode from route path and query params
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const searchParams = new URLSearchParams(location.search);
  const toolParam = searchParams.get("tool");

  // Check if we're in edit mode with a tool
  const isEditRoute = location.pathname.includes("/edit");
  const routeMode = toolParam || pathSegments[pathSegments.length - 1];
  const editModes = ["crop", "blur", "paint", "text"];
  const bulkModes = ["crop", "text"];
  const isBulkRoute = pathSegments.includes("bulk");
  const isEditModeRoute = isEditRoute; // Any edit route, regardless of tool param

  // Determine if we should show the gallery (ONLY for the exact /resize-and-optimize route, nothing else)
  const showGallery = location.pathname === "/resize-and-optimize";

  // Initialize crop when entering crop mode
  useEffect(() => {
    if (isEditModeRoute && routeMode === "crop" && !crop) {
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }
  }, [isEditModeRoute, routeMode, crop, setCrop]);

  // Clear tool states when switching modes
  useEffect(() => {
    const clearToolStates = () => {
      if (!isEditModeRoute) {
        // Clear all tool states when exiting edit mode
        const { resetCrop } = useCropStore.getState();
        const { clearBlurStrokes } = useBlurStore.getState();
        const { clearPaintStrokes, clearShapes } = usePaintStore.getState();

        resetCrop();
        clearBlurStrokes();
        clearPaintStrokes();
        clearShapes();
      }
    };

    clearToolStates();
  }, [isEditModeRoute, routeMode]);

  // Sync image context with zustand store
  useEffect(() => {
    setStoreImages(images);
  }, [images, setStoreImages]);

  // Sync selected image with zustand store
  useEffect(() => {
    if (selectedImage) {
      setStoreSelectedImage(selectedImage.id);
    }
  }, [selectedImage, setStoreSelectedImage]);

  // Set editor state based on route
  useEffect(() => {
    if (isBulkRoute) {
      setEditorState("bulkImageEdit");
    } else if (isEditRoute) {
      // If we have a specific tool, set that state, otherwise generic editImage
      if (toolParam === "crop") {
        setEditorState("crop");
      } else if (toolParam === "blur") {
        setEditorState("blur");
      } else if (toolParam === "paint") {
        setEditorState("paint");
      } else if (toolParam === "text") {
        setEditorState("text");
      } else {
        setEditorState("editImage");
      }
    } else {
      setEditorState("resizeAndOptimize");
    }
  }, [setEditorState, location.pathname, isBulkRoute, isEditRoute, toolParam]);

  // Get current mode for display purposes
  const getCurrentMode = () => {
    if (isBulkRoute) {
      return routeMode === "crop" ? "bulkCrop" : "bulkText";
    }
    if (isEditRoute) {
      // Map the tool param to the correct mode
      if (toolParam === "crop") return "crop";
      if (toolParam === "blur") return "blur";
      if (toolParam === "paint") return "paint";
      if (toolParam === "text") return "text";
      return "edit"; // fallback for generic edit mode
    }
    return "edit"; // default fallback
  };

  const currentMode = getCurrentMode();

  // Debug logging to see what's happening
  console.log("Current path:", location.pathname);
  console.log("Show gallery:", showGallery);
  console.log("Is edit route:", isEditRoute);
  console.log("Editor state:", editorState);
  console.log("Current mode:", currentMode);

  // Handle image selection for gallery - just select, don't navigate
  const handleImageClick = (imageId: string) => {
    onSelect(imageId);
    // Don't navigate - just select the image
  };

  if (images.length === 0) {
    return <NoImagesComponent />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      {/* Show gallery only for main resize-and-optimize route */}
      {showGallery && (
        <div className="mb-6">
          <div className="grid grid-cols-6 md:grid-cols-10 gap-4 p-2 bg-gray-800 rounded-lg">
            {paginatedImages.map((img) => (
              <FastThumbnail
                key={img.id}
                image={img}
                isSelected={selectedImage?.id === img.id}
                onClick={() => handleImageClick(img.id)}
                onRemove={(e) => {
                  e.stopPropagation();
                  onRemove(img.id);
                }}
                isLoading={loadingImages.has(img.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show non-gallery header for edit and bulk modes */}
      {!showGallery && (
        <NonGalleryHeader
          mode={
            currentMode as
              | "edit"
              | "crop"
              | "blur"
              | "paint"
              | "text"
              | "bulkCrop"
              | "bulkText"
          }
        />
      )}

      {/* Toolbar */}
      <div className="mb-4">
        <ImageEditorToolbar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {showGallery ? (
          // Normal mode with sidebar for main resize-and-optimize route
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main image view - takes up 3 columns on large screens */}
            <section className="lg:col-span-3">
              {selectedImage && (
                <Card className="bg-gray-800 border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div
                      className="flex items-center justify-center bg-muted rounded-lg overflow-hidden"
                      style={{ minHeight: "400px" }}
                    >
                      <img
                        key={selectedImage.id}
                        src={selectedImage.url}
                        alt={selectedImage.file?.name || "Selected image"}
                        className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${selectedImage.rotation || 0}deg) scaleX(${selectedImage.flipHorizontal ? -1 : 1}) scaleY(${selectedImage.flipVertical ? -1 : 1})`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Sidebar - takes up 1 column on large screens */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Image Resizer */}
              <ImageResizer />

              {/* Image Zoom View */}
              {selectedImage && (
                <ImageZoomView
                  imageUrl={selectedImage.url}
                  imageTransforms={selectedImage}
                />
              )}

              {/* Image Stats */}
              <ImageStats selectedImage={selectedImage} />
            </aside>
          </div>
        ) : (
          // Full screen mode for editing (no gallery, no sidebar)
          selectedImage && (
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
              {isEditModeRoute && routeMode === "crop" ? (
                // Improved Crop mode with better sizing and interaction
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-4">
                  <div
                    className="relative flex items-center justify-center max-w-full max-h-full"
                    style={{
                      transform: `scale(${cropZoom / 100})`,
                      transformOrigin: "center",
                    }}
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={undefined}
                      minWidth={10}
                      minHeight={10}
                      keepSelection={true}
                      style={{
                        maxWidth: "90vw",
                        maxHeight: "80vh",
                      }}
                    >
                      <img
                        key={selectedImage.id}
                        src={selectedImage.url}
                        alt={selectedImage.file?.name || "Selected image"}
                        className="block max-w-full max-h-full object-contain"
                        style={{
                          transform: `rotate(${selectedImage.rotation || 0}deg) scaleX(${
                            selectedImage.flipHorizontal ? -1 : 1
                          }) scaleY(${selectedImage.flipVertical ? -1 : 1})`,
                          maxHeight: "calc(100vh - 200px)",
                          maxWidth: "calc(100vw - 100px)",
                        }}
                        onLoad={(e) => {
                          // Initialize crop if not set
                          if (!crop && e.currentTarget) {
                            const { naturalWidth, naturalHeight } =
                              e.currentTarget;
                            const initialCrop = {
                              unit: "%" as const,
                              x: 10,
                              y: 10,
                              width: 80,
                              height: 80,
                            };
                            setCrop(initialCrop);
                          }
                        }}
                      />
                    </ReactCrop>
                  </div>

                  {/* Crop info overlay */}
                  {crop && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>X: {Math.round(crop.x)}%</div>
                        <div>Y: {Math.round(crop.y)}%</div>
                        <div>W: {Math.round(crop.width)}%</div>
                        <div>H: {Math.round(crop.height)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : isEditModeRoute && routeMode === "blur" ? (
                // Use the improved BlurCanvas component
                <CanvasErrorBoundary>
                  <BlurCanvas
                    imageUrl={selectedImage.url}
                    imageWidth={selectedImage.width || 800}
                    imageHeight={selectedImage.height || 600}
                    zoom={zoom}
                  />
                </CanvasErrorBoundary>
              ) : isEditModeRoute && routeMode === "paint" ? (
                // Use the improved PaintCanvas component
                <CanvasErrorBoundary>
                  <PaintCanvas
                    imageUrl={selectedImage.url}
                    imageWidth={selectedImage.width || 800}
                    imageHeight={selectedImage.height || 600}
                    zoom={zoom}
                  />
                </CanvasErrorBoundary>
              ) : isEditModeRoute && routeMode === "text" ? (
                // Use the improved TextTool component
                <CanvasErrorBoundary>
                  <TextTool
                    ref={textToolRef}
                    imageUrl={selectedImage.url}
                    onApplyText={async (textedImageUrl) => {
                      try {
                        // Convert data URL to blob
                        const response = await fetch(textedImageUrl);
                        const blob = await response.blob();
                        const newUrl = URL.createObjectURL(blob);

                        // Update the image in the context
                        updateImage(selectedImage.id, {
                          url: newUrl,
                          file: new File([blob], selectedImage.file.name, {
                            type: blob.type,
                          }),
                          size: blob.size,
                        });

                        // Clean up old URL to prevent memory leaks
                        if (selectedImage.url !== selectedImage.compressedUrl) {
                          URL.revokeObjectURL(selectedImage.url);
                        }

                        // Go back to edit mode
                        setEditorState("editImage");
                        navigate({
                          to: `/resize-and-optimize/${selectedImage.id}/edit`,
                        });
                      } catch (error) {
                        console.error("Error applying text:", error);
                      }
                    }}
                    onCancel={() => {
                      setEditorState("editImage");
                      navigate({
                        to: `/resize-and-optimize/${selectedImage.id}/edit`,
                      });
                    }}
                    setEditorState={(state: string) =>
                      setEditorState(state as any)
                    }
                    setBold={() => {}}
                    setItalic={() => {}}
                  />
                </CanvasErrorBoundary>
              ) : (
                // Other editing modes or bulk modes
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {isBulkRoute ? (
                    // Bulk editing placeholder
                    <div className="text-center text-white">
                      <h2 className="text-xl mb-4">Bulk {routeMode} Editor</h2>
                      <p>This feature is coming soon!</p>
                    </div>
                  ) : (
                    // Regular edit image mode
                    <img
                      key={selectedImage.id}
                      src={selectedImage.url}
                      alt={selectedImage.file?.name || "Selected image"}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${selectedImage.rotation || 0}deg) scaleX(${selectedImage.flipHorizontal ? -1 : 1}) scaleY(${selectedImage.flipVertical ? -1 : 1})`,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Only render Outlet for the main route, not for edit routes */}
      {showGallery && <Outlet />}
    </div>
  );
}
