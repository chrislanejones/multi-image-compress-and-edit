import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useImageContext } from "../../context/image-context";
import { Button } from "../../components/ui/button";
import { X, Zap } from "lucide-react";
import type { ImageFile } from "../../types/types";

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
    return (
      <div
        onClick={onClick}
        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${isSelected ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"}`}
      >
        <img
          src={image.url}
          alt={image.file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
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
        {image.metadata && image.metadata.compressionRatio > 0 && (
          <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-white text-xs font-medium">
              {image.metadata.compressionRatio}%
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

// This component ONLY renders the gallery grid. Nothing else.
function GalleryComponent() {
  const { paginatedImages, selectedImage, selectImage, removeImage } =
    useImageContext();
  return (
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
  );
}
