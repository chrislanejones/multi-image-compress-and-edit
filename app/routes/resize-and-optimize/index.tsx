import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useImageContext } from "../../context/image-context";
import { useEditorStore } from "../../store/editor-store";
import { Button } from "../../components/ui/button";
import { X, Zap, ImageIcon, Home } from "lucide-react";
import type { ImageFile } from "@/types";

// The FastThumbnail component is self-contained here.
const FastThumbnail = React.memo(
  ({
    image,
    isSelected,
    onClick,
    onRemove,
  }: {
    image: ImageFile;
    isSelected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasAppeared, setHasAppeared] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setHasAppeared(true), 100);
      return () => clearTimeout(timer);
    }, []);

    const imageUrl = image.thumbnail || image.url;
    const metadata = image.metadata;

    return (
      <div
        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all duration-500 transform ${
          hasAppeared ? "scale-100 opacity-100" : "scale-75 opacity-0"
        } ${
          isSelected
            ? "border-primary ring-2 ring-primary/50"
            : "border-border hover:border-primary/50"
        }`}
        onClick={onClick}
      >
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={image.file?.name || "Uploaded image"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {metadata && metadata.compressionRatio > 0 && (
          <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-white text-xs font-medium">
              {metadata.compressionRatio}%
            </span>
          </div>
        )}
      </div>
    );
  }
);
FastThumbnail.displayName = "FastThumbnail";

export const Route = createFileRoute("/resize-and-optimize/")({
  component: GalleryComponent,
});

function GalleryComponent() {
  const { paginatedImages, selectedImage, selectImage, removeImage, images } =
    useImageContext();
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Ensure the correct editor state is set for this view
  useEffect(() => {
    setEditorState("resizeAndOptimize");
  }, [setEditorState]);

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

  // This is the ONLY thing this component should render.
  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg">
        {paginatedImages.map((img) => (
          <FastThumbnail
            key={img.id}
            image={img}
            isSelected={selectedImage?.id === img.id}
            onClick={() => selectImage(img)}
            onRemove={(e) => {
              e.stopPropagation();
              removeImage(img.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
