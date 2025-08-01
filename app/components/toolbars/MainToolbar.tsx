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
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";

export const MainToolbar = () => {
  const { 
    onZoomIn, 
    onZoomOut, 
    setEditorState, 
    getSelectedImage, 
    selectedImageId,
    selectImage 
  } = useEditorStore();
  const {
    images,
    selectedImage: contextSelectedImage,
    removeAllImages,
    currentPage,
    totalPages,
    onNavigatePage,
    onClose,
  } = useImageContext();
  const { theme, setTheme } = useTheme(); // ✅ local theme context
  const navigate = useNavigate();

  const handleEnterEditMode = () => {
    // Use context selected image as the primary source
    let selectedImage = contextSelectedImage;
    
    // If no image is selected in context, use the first available image
    if (!selectedImage && images && images.length > 0) {
      selectedImage = images[0];
    }
    
    if (selectedImage) {
      // Sync the selection to the store
      selectImage(selectedImage.id);
      setEditorState("editImage");
      navigate({ to: `/resize-and-optimize/${selectedImage.id}/edit-image` });
    } else {
      console.warn("No image selected and no images available");
    }
  };

  const handleNavigateImage = (direction: "next" | "prev") => {
    // Use images from context as the source of truth for navigation
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
        <Button
          onClick={() => {}}
          variant="outline"
          className="h-9"
          disabled
          title="Bulk Image Editor (Coming Soon)"
        >
          <Images className="mr-2 h-4 w-4" /> Bulk Edit
        </Button>
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
