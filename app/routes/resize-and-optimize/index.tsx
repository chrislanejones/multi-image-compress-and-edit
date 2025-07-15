// app/routes/resize-and-optimize/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useImageContext } from "../../context/image-context";
import { X, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { ImageFile } from "../../types/types";

const ITEMS_PER_PAGE = 10;

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
      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all duration-300 ease-in-out ${isSelected ? "border-primary ring-2 ring-primary/50 scale-105" : "border-border hover:border-primary/50"}`}
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
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
          style={{
            transform: `rotate(${image.rotation || 0}deg) scaleX(${image.flipHorizontal ? -1 : 1}) scaleY(${image.flipVertical ? -1 : 1})`,
          }}
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
      {image.metadata?.compressionRatio && (
        <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
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

export const Route = createFileRoute("/resize-and-optimize/")({
  component: GalleryComponent,
});

function GalleryComponent() {
  const { 
    paginatedImages, 
    selectedImage, 
    onSelect, 
    onRemove,
    loadingImages
  } = useImageContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg">
        {paginatedImages.map((img) => (
          <FastThumbnail
            key={img.id}
            image={img}
            isSelected={selectedImage?.id === img.id}
            onClick={() => onSelect(img.id)}
            onRemove={(e) => {
              e.stopPropagation();
              onRemove(img.id);
            }}
            isLoading={loadingImages.has(img.id)}
          />
        ))}
      </div>
    </div>
  );
}
