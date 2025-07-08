import React from "react";
import {
  Minus, Plus, Pencil, Images, Sparkles, ChevronsLeft,
  ChevronLeft, ChevronRight, ChevronsRight, ArrowLeft, Trash2, Sun, Moon, User
} from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useEditorStore } from "../../store/editor-store";
import { useImageContext } from "../../context/image-context"; // Adjust path if needed

export const MainToolbar = () => {
  const { onZoomIn, onZoomOut, setEditorState } = useEditorStore();
  // NOTE: Assumes your ImageContext provides these values and functions.
  const { images, removeAllImages, currentPage, totalPages, onNavigateImage, onNavigatePage, onClose } = useImageContext();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onZoomOut} variant="outline" className="h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
        <Button onClick={onZoomIn} variant="outline" className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
        <Button onClick={() => setEditorState("editImage")} variant="outline" className="h-9"><Pencil className="mr-2 h-4 w-4" /> Edit Image</Button>
        <Button onClick={() => setEditorState("bulkImageEdit")} variant="outline" className="h-9" disabled={!images || images.length <= 1}><Images className="mr-2 h-4 w-4" /> Bulk Edit ({images?.length || 0})</Button>
        <Button onClick={() => setEditorState("aiEditor")} disabled variant="outline" className="h-9" title="AI features coming soon"><Sparkles className="mr-2 h-4 w-4" /> AI Editor</Button>
        
        <div className="flex items-center gap-1 ml-2">
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigatePage?.("prev")} disabled={!onNavigatePage || currentPage <= 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigateImage?.("prev")} disabled={!onNavigateImage}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm px-2 text-white whitespace-nowrap">Switch Photos ({currentPage}/{totalPages})</span>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigateImage?.("next")} disabled={!onNavigateImage}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" className="py-2 h-9 px-3" onClick={() => onNavigatePage?.("next")} disabled={!onNavigatePage || currentPage >= totalPages}><ChevronsRight className="h-4 w-4" /></Button>
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
