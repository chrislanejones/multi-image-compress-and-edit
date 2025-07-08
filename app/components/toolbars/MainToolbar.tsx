import React from "react";
import {
  Minus, Plus, Pencil, Images, Sparkles, ChevronsLeft,
  ChevronLeft, ChevronRight, ChevronsRight, ArrowLeft, Trash2, Sun, Moon, User
} from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context";
import { useNavigate } from "@tanstack/react-router";

export const MainToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  const { images, removeAllImages, currentPage, totalPages, navigateImage, onNavigatePage, onClose } = useImageContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleEnterEditMode = () => {
    setEditorState("editImage");
    // @ts-ignore - This will be fixed by running 'bun run generate-routes'
    navigate({ to: "/resize-and-optimize/edit-image" });
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
        <Button onClick={handleEnterEditMode} variant="outline" className="h-9"><Pencil className="mr-2 h-4 w-4" /> Edit Image</Button>
        {/* Other buttons... */}
        <div className="flex items-center gap-1 ml-2">
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigatePage("prev")} disabled={!onNavigatePage || currentPage <= 1} title="Previous 10 Images"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => navigateImage("prev")} disabled={!navigateImage} title="Previous Image"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm px-2 text-white whitespace-nowrap">Switch Photos ({currentPage}/{totalPages})</span>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => navigateImage("next")} disabled={!navigateImage} title="Next Image"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigatePage("next")} disabled={!onNavigatePage || currentPage >= totalPages} title="Next 10 Images"><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onClose && <Button onClick={onClose} variant="outline" className="h-9"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload</Button>}
        {removeAllImages && <Button onClick={removeAllImages} variant="destructive" className="h-9"><Trash2 className="mr-2 h-4 w-4" /> Remove All</Button>}
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-9 w-9">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
        <Button variant="outline" size="icon" disabled className="h-9 w-9"><User className="h-4 w-4" /></Button>
      </div>
    </>
  );
};
