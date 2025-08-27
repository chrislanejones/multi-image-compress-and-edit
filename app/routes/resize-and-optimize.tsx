import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import { useViewStore, useAppStateStore, useCropStore, useImageStore } from "../stores";
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
import { Home, ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { BlurCanvas } from "../components/BlurCanvas";
import { PaintCanvas } from "../components/PaintCanvas";
import TextTool from "../components/TextTool";
import { NonGalleryHeader } from "../components/non-gallery-header";

export const Route = createFileRoute("/resize-and-optimize")({
  component: ResizeAndOptimizeLayout,
});

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
  const { selectedImage, images, updateImage } = useImageContext();
  const textToolRef = useRef<TextToolRef>(null);
  
  const { globalZoom: zoom, cropZoom } = useViewStore();
  const { editorState, setEditorState, setTextSaveTrigger } = useAppStateStore();
  const { crop, setCrop, completedCrop, setCompletedCrop } = useCropStore();
  const { setImages: setStoreImages, selectImage: setStoreSelectedImage } = useImageStore();
  
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
  const [countdown, setCountdown] = useState<number | null>(null);

  // Extract mode from route path and query params
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(location.search);
  const toolParam = searchParams.get('tool');
  
  // Check if we're in edit mode with a tool
  const isEditRoute = location.pathname.includes('/edit');
  const routeMode = toolParam || pathSegments[pathSegments.length - 1];
  const editModes = ['crop', 'blur', 'paint', 'text'];
  const bulkModes = ['crop', 'text'];
  const isBulkRoute = pathSegments.includes('bulk');
  const isEditModeRoute = isEditRoute && toolParam && editModes.includes(toolParam);

  // Determine which editing modes should show full screen
  const fullScreenModes = ["editImage", "bulkImageEdit"];
  const isFullScreenMode = fullScreenModes.includes(editorState) || isEditModeRoute || isBulkRoute;

  // Initialize crop when entering crop mode
  useEffect(() => {
    if (isEditModeRoute && routeMode === 'crop' && !crop) {
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }
  }, [isEditModeRoute, routeMode, crop, setCrop]);

  // Countdown and redirect if no images exist
  useEffect(() => {
    if (images.length === 0) {
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
    } else {
      setCountdown(null);
    }
  }, [images.length, navigate]);

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
    if (location.pathname === "/resize-and-optimize") {
      setEditorState("resizeAndOptimize");
    } else if (isBulkRoute) {
      setEditorState("bulkImageEdit");
    } else if (isEditRoute) {
      if (toolParam === 'crop') {
        setEditorState("crop");
      } else if (toolParam === 'blur') {
        setEditorState("blur");
      } else if (toolParam === 'paint') {
        setEditorState("paint");
      } else if (toolParam === 'text') {
        setEditorState("text");
      } else {
        setEditorState("editImage");
      }
    }
  }, [setEditorState, location.pathname, isBulkRoute, isEditRoute, toolParam]);

  // Get current mode for display purposes
  const getCurrentMode = () => {
    if (isBulkRoute) {
      return routeMode === 'crop' ? 'bulkCrop' : 'bulkText';
    }
    if (isEditModeRoute) return routeMode;
    if (editorState === "editImage") return "edit";
    return editorState;
  };

  const currentMode = getCurrentMode();

  if (images.length === 0) {
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
                <p className="text-gray-300">
                  Redirecting to upload page in...
                </p>
                <div className="text-4xl font-bold text-sky-400">
                  {countdown}
                </div>
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

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${isFullScreenMode ? "p-2" : "p-4"} flex flex-col`}
    >
      {isFullScreenMode ? (
        <NonGalleryHeader mode={currentMode as any} />
      ) : (
        <Outlet />
      )}
      
      <div className={isFullScreenMode ? "mt-2" : "mt-4"}>
        <ImageEditorToolbar />
      </div>

      {isFullScreenMode ? (
        // Full screen mode for editing
        <div className="flex-1 flex flex-col mt-6">
          {selectedImage && (
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
              {isEditModeRoute && routeMode === "crop" ? (
                // Crop mode
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      transform: `scale(${cropZoom / 100})`,
                      transformOrigin: "center",
                      maxWidth: "calc(100% - 64px)",
                      maxHeight: "calc(100% - 64px)",
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
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    >
                      <img
                        key={selectedImage.id}
                        src={selectedImage.url}
                        alt={selectedImage.file?.name || "Selected image"}
                        className="block max-w-full max-h-full object-contain"
                        style={{
                          transform: `rotate(${selectedImage.rotation || 0}deg) scaleX(${selectedImage.flipHorizontal ? -1 : 1}) scaleY(${selectedImage.flipVertical ? -1 : 1})`,
                          maxHeight: "calc(100vh - 200px)",
                          maxWidth: "100%",
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
              ) : isEditModeRoute && routeMode === "blur" ? (
                // Blur mode with interactive canvas
                <BlurCanvas
                  imageUrl={selectedImage.url}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  zoom={zoom}
                />
              ) : isEditModeRoute && routeMode === "paint" ? (
                // Paint mode with interactive canvas
                <PaintCanvas
                  imageUrl={selectedImage.url}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  zoom={zoom}
                />
              ) : isEditModeRoute && routeMode === "text" ? (
                // Text mode with text tool
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
                        file: new File([blob], selectedImage.file.name, { type: blob.type }),
                        size: blob.size,
                      });
                      
                      // Clean up old URL to prevent memory leaks
                      if (selectedImage.url !== selectedImage.compressedUrl) {
                        URL.revokeObjectURL(selectedImage.url);
                      }
                      
                      // Go back to edit mode
                      setEditorState("editImage");
                      navigate({ to: `/resize-and-optimize/${selectedImage.id}/edit` });
                    } catch (error) {
                      console.error("Error applying text:", error);
                    }
                  }}
                  onCancel={() => {
                    setEditorState("editImage");
                    navigate({ to: `/resize-and-optimize/${selectedImage.id}/edit` });
                  }}
                  setEditorState={setEditorState}
                  setBold={() => {}}
                  setItalic={() => {}}
                />
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
                  {/* Canvas overlay for drawing tools */}
                  {isEditModeRoute && routeMode === "paint" && (
                    <canvas
                      className="absolute inset-0 cursor-crosshair"
                      style={{ pointerEvents: "auto" }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Normal mode with sidebar
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
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
      )}
    </div>
  );
}
