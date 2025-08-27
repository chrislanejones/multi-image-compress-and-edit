import React from "react";
import {
  Minus,
  Plus,
  Pencil,
  Images,
  Sparkles,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowLeft,
  Trash2,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { useViewStore, useAppStateStore, useImageStore } from "../../stores";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";

export const MainToolbar = () => {
  const { globalZoomIn: onZoomIn, globalZoomOut: onZoomOut } = useViewStore();
  const { setEditorState } = useAppStateStore();
  const { selectedImageId, selectImage, getSelectedImage } = useImageStore();
  const {
    images,
    selectedImage: contextSelectedImage,
    removeAllImages,
    currentPage,
    totalPages,
    onNavigatePage,
    onClose,
  } = useImageContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleEnterEditMode = () => {
    let selectedImage = contextSelectedImage;
    
    if (!selectedImage && images && images.length > 0) {
      selectedImage = images[0];
    }
    
    if (selectedImage) {
      selectImage(selectedImage.id);
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${selectedImage.id}/edit-image` });
    } else {
      console.warn("No image selected and no images available");
    }
  };

  const handleBulkEdit = (mode: 'crop' | 'text') => {
    if (images.length === 0) {
      console.warn("No images available for bulk editing");
      return;
    }
    setEditorState("bulkImageEdit");
    navigate({ to: `/resize-and-optimize/bulk/${mode}` });
  };

  const handleNavigateImage = (direction: "next" | "prev") => {
    if (!images || images.length === 0) return;
    
    const currentSelectedId = contextSelectedImage?.id;
    const currentIndex = images.findIndex((img) => img.id === currentSelectedId);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex;
    if (direction === "next") {
      newIndex = Math.min(currentIndex + 1, images.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }
    
    const newImage = images[newIndex];
    if (newImage) {
      selectImage(newImage.id);
      navigate({ to: `/resize-and-optimize/${newImage.id}` });
    }
  };

  const handleRemoveAll = () => {
    if (images.length === 0) return;
    if (
      confirm(
        `Are you sure you want to remove all ${images.length} images? This action cannot be undone.`
      )
    ) {
      removeAllImages();
    }
  };

  const handleBackToUpload = () => {
    navigate({ to: "/" });
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0">
          <Minus className="h-4 w-4" />
        </Button>
        <Button onClick={handleEnterEditMode} variant="outline" className="h-9">
          <Pencil className="mr-2 h-4 w-4" /> Edit Image
        </Button>
        
        {/* Bulk Edit Dropdown */}
        <div className="relative group">
          <Button
            variant="outline"
            className="h-9"
            disabled={images.length === 0}
          >
            <Images className="mr-2 h-4 w-4" /> Bulk Edit
          </Button>
          <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button
              onClick={() => handleBulkEdit('crop')}
              className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-t-md"
            >
              Bulk Crop
            </button>
            <button
              onClick={() => handleBulkEdit('text')}
              className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-b-md"
            >
              Bulk Text
            </button>
          </div>
        </div>

        <Button
          onClick={() => {}}
          variant="outline"
          className="h-9"
          disabled
          title="AI Editor (Coming Soon)"
        >
          <Sparkles className="mr-2 h-4 w-4" /> AI Editor
        </Button>

        {images.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              className="py-2 h-9 px-3"
              onClick={() => onNavigatePage?.("prev")}
              disabled={!onNavigatePage || currentPage <= 1}
              title="Previous 10 Images"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="py-2 h-9 px-3"
              onClick={() => handleNavigateImage("prev")}
              disabled={!images || images.length <= 1}
              title="Previous Image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2 text-white whitespace-nowrap">
              Switch Photos ({currentPage}/{totalPages})
            </span>
            <Button
              variant="outline"
              className="py-2 h-9 px-3"
              onClick={() => handleNavigateImage("next")}
              disabled={!images || images.length <= 1}
              title="Next Image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="py-2 h-9 px-3"
              onClick={() => onNavigatePage?.("next")}
              disabled={!onNavigatePage || currentPage >= totalPages}
              title="Next 10 Images"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleBackToUpload} variant="outline" className="h-9">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
        </Button>

        {images.length > 0 && (
          <Button
            onClick={handleRemoveAll}
            variant="destructive"
            className="h-9"
            title={`Remove all ${images.length} images`}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove All ({images.length})
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Button variant="outline" size="icon" disabled className="h-9 w-9">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
