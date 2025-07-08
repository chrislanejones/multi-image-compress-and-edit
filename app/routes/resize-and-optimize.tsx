import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import { useEditorStore } from "../store/editor-store";
import { Card, CardContent } from "../components/ui/card";
import { ImageEditorToolbar } from "../components/image-editor-toolbar";
import ImageResizer from "../components/ImageResizer";
import ImageStats from "../components/ImageStats";
import { useEffect } from "react";
import { Home, ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/resize-and-optimize")({
  component: ResizeAndOptimizeLayout,
});

function NoImagesComponent() {
    const navigate = useNavigate();
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Images Found</h2>
          <p className="text-muted-foreground mb-4">Upload some images to get started.</p>
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

  useEffect(() => {
    if (images.length === 0) {
      const timer = setTimeout(() => navigate({ to: "/" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [images, navigate]);

  useEffect(() => {
    setEditorState("resizeAndOptimize");
  }, [setEditorState]);

  if (images.length === 0) {
    return <NoImagesComponent />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      <Outlet />
      <div className="mt-4">
        <ImageEditorToolbar />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <section className="md:col-span-3">
          {selectedImage && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden" style={{ minHeight: "400px" }}>
                  <img
                    key={selectedImage.id}
                    src={selectedImage.url}
                    alt={selectedImage.file?.name || "Selected image"}
                    className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </section>
        <aside className="md:col-span-1 space-y-6">
          <ImageResizer />
          <ImageStats selectedImage={selectedImage} />
        </aside>
      </div>
    </div>
  );
}
