// app/routes/resize-and-optimize/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useImageContext } from "../../context/image-context";
import { X, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { ImageFile } from "../../types/types";

const ITEMS_PER_PAGE = 10;

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
  }) => (
    <div
      onClick={onClick}
      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all duration-300 ease-in-out ${isSelected ? "border-primary ring-2 ring-primary/50 scale-105" : "border-border hover:border-primary/50"}`}
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
  const { images, selectedImage, onSelect, onRemove } = useImageContext();
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleImages = images.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg">
        {visibleImages.map((img) => (
          <FastThumbnail
            key={img.id}
            image={img}
            isSelected={selectedImage?.id === img.id}
            onClick={() => onSelect(img.id)}
            onRemove={(e) => {
              e.stopPropagation();
              onRemove(img.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
