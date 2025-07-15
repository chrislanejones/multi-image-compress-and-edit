import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import { useEditorStore } from "../store/editor-store";
import { Card, CardContent } from "../components/ui/card";
import { ImageEditorToolbar } from "../components/image-editor-toolbar";
import ImageResizer from "../components/ImageResizer";
import ImageStats from "../components/ImageStats";
import ImageZoomView from "../components/ImageZoomView"; // Import the zoom component
import { useEffect, useState } from "react";
import { Home, ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";

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
    <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
      <div className="text-center">
        <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No images found</h2>
        {countdown !== null && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Redirecting to upload page in...
            </p>
            <div className="text-4xl font-bold text-primary mt-2">
              {countdown}
            </div>
          </div>
        )}
        <Button onClick={() => navigate({ to: "/" })} size="lg">
          <Home className="mr-2 h-4 w-4" /> Go to Upload
        </Button>
      </div>
    </div>
  );
}

function ResizeAndOptimizeLayout() {
  const { selectedImage, images } = useImageContext();
  const { zoom, setEditorState } = useEditorStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);

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

  useEffect(() => {
    setEditorState("resizeAndOptimize");
  }, [setEditorState]);

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No images found</h2>
          {countdown !== null && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Redirecting to upload page in...
              </p>
              <div className="text-4xl font-bold text-primary mt-2">
                {countdown}
              </div>
            </div>
          )}
          <Button onClick={() => navigate({ to: "/" })} size="lg">
            <Home className="mr-2 h-4 w-4" /> Go to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      <Outlet />
      <div className="mt-4">
        <ImageEditorToolbar />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Main image view - takes up 3 columns on large screens */}
        <section className="lg:col-span-3">
          {selectedImage && (
            <Card>
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
                      transform: `scale(${zoom / 100}) rotate(${selectedImage.rotation || 0}deg) scaleX(${selectedImage.flipHorizontal ? -1 : 1}) scaleY(${selectedImage.flipVertical ? -1 : 1})` 
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
          {selectedImage && <ImageZoomView imageUrl={selectedImage.url} imageTransforms={selectedImage} />}

          {/* Image Stats */}
          <ImageStats selectedImage={selectedImage} />
        </aside>
      </div>
    </div>
  );
}
