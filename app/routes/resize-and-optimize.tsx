import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import { useEditorStore } from "../store/editor-store";
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
import { useEffect, useState } from "react";
import { Home, ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { BlurCanvas } from "../components/BlurCanvas";
import { PaintCanvas } from "../components/PaintCanvas";
import { NonGalleryHeader } from "../components/non-gallery-header";

export const Route = createFileRoute("/resize-and-optimize")({
  component: ResizeAndOptimizeLayout,
});

function NoImagesComponent() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown and redirect if no images exist
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
  const { selectedImage, images } = useImageContext();
  const {
    zoom,
    setEditorState,
    editorState,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    cropZoom,
    setImages: setStoreImages,
    selectImage: setStoreSelectedImage,
  } = useEditorStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Define the editing modes that should show full screen canvas
  const fullScreenModes = ["editImage", "crop", "blur", "paint", "text"];
  const isFullScreenMode = fullScreenModes.includes(editorState);

  // Initialize crop when entering crop mode
  useEffect(() => {
    if (editorState === "crop" && !crop) {
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }
  }, [editorState, crop, setCrop]);

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

  // Only set resizeAndOptimize state when we're at the base route
  // Sub-routes will handle their own editor state
  useEffect(() => {
    if (location.pathname === "/resize-and-optimize") {
      setEditorState("resizeAndOptimize");
    }
  }, [setEditorState, location.pathname]);

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
        // Show header for full screen edit modes
        <NonGalleryHeader
          mode={editorState === "editImage" ? "edit" : editorState}
        />
      ) : (
        // Always show child route content (gallery) for non-editing modes
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
              {editorState === "crop" ? (
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
              ) : editorState === "blur" ? (
                // Blur mode with interactive canvas
                <BlurCanvas
                  imageUrl={selectedImage.url}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  zoom={zoom}
                />
              ) : editorState === "paint" ? (
                // Paint mode with interactive canvas
                <PaintCanvas
                  imageUrl={selectedImage.url}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  zoom={zoom}
                />
              ) : (
                // Other editing modes
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    key={selectedImage.id}
                    src={selectedImage.url}
                    alt={selectedImage.file?.name || "Selected image"}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${selectedImage.rotation || 0}deg) scaleX(${selectedImage.flipHorizontal ? -1 : 1}) scaleY(${selectedImage.flipVertical ? -1 : 1})`,
                    }}
                  />
                  {/* Canvas overlay for drawing tools */}
                  {(editorState === "paint" || editorState === "text") && (
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
