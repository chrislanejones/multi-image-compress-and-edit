import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useImageContext } from "../context/image-context";
import { useEditorStore } from "../store/editor-store";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatBytes } from "../utils/image";
import { ImageEditorToolbar } from "../components/image-editor-toolbar";

export const Route = createFileRoute("/resize-and-optimize")({
  component: ResizeAndOptimizeLayout,
});

function ResizeAndOptimizeLayout() {
  // Get images array to determine if we should show the main UI
  const { selectedImage, images } = useImageContext();
  const { zoom } = useEditorStore();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      {/* The Outlet always renders first. It will contain either the
          gallery grid or the "No Images" countdown page. */}
      <Outlet />

      {/* --- CONDITIONAL UI WRAPPER --- */}
      {/* Only show the toolbar, canvas, and info panel if there are images. */}
      {images.length > 0 && (
        <>
          <div className="mt-4">
            <ImageEditorToolbar />
          </div>

          {/* Main Image Display */}
          {selectedImage && (
            <Card className="mb-6">
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
                    style={{ transform: `scale(${zoom / 100})` }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Info */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Image Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Filename:</span>
                    <p className="font-mono text-xs truncate" title={selectedImage.file?.name}>{selectedImage.file?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Dimensions:</span>
                    <p>{selectedImage.width || "N/A"} × {selectedImage.height || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Original Size:</span>
                    <p>{formatBytes(selectedImage.metadata?.originalSize || 0)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Compressed:</span>
                    <p className="text-green-400">{formatBytes(selectedImage.metadata?.compressedSize || 0)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Savings:</span>
                    <p className="text-green-400 font-semibold">{selectedImage.metadata?.compressionRatio || 0}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Format:</span>
                    <p className="uppercase">{selectedImage.file?.type.split('/')[1] || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
