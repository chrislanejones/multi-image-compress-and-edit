// app/routes/resize-and-optimize/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { useImageContext } from "../../context/image-context";
import { X, Zap, Weight } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { ImageFile } from "../../types/types";


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
  }) => {
    // Check compression status
    const hasCompressionRatio = image.metadata?.compressionRatio !== undefined;
    const isCompressionReset = image.metadata?.isCompressionReset === true;
    const isManuallyResized = image.metadata?.isManuallyResized === true;
    
    // Show lightning bolt for compressed images (default state after upload)
    // Show weight only when: compression has been reset OR user manually resized and applied
    const shouldShowIcon = hasCompressionRatio;
    const showWeight = isCompressionReset || isManuallyResized;
    
    return (
    <div
      onClick={onClick}
      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group transition-all duration-300 ease-in-out ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "hover:scale-100"}`}
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
      {shouldShowIcon && (
        <div 
          className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1"
          title={showWeight ? "Original Size" : "Image Size Reduced"}
        >
          {showWeight ? (
            <Weight className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Zap className="w-3 h-3 text-secondary" />
          )}
          <span className="text-white text-xs font-medium">
            {showWeight ? "100%" : `${image.metadata?.compressionRatio || 0}%`}
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
  const { paginatedImages, selectedImage, onSelect, onRemove, loadingImages } =
    useImageContext();
  const navigate = useNavigate();

  const handleImageClick = (imageId: string) => {
    onSelect(imageId);
    navigate({ to: `/resize-and-optimize/${imageId}` });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 md:grid-cols-10 gap-4 p-2 bg-card border border-border rounded-lg">
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
  );
}
