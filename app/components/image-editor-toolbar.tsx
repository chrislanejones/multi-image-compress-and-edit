import React from "react";
import { useAppStateStore } from "../stores";
import { MainToolbar } from "./toolbars/MainToolbar";
import { EditModeToolbar } from "./toolbars/EditModeToolbar";
import { CropToolbar } from "./toolbars/CropToolbar";
import { BlurToolbar } from "./toolbars/BlurToolbar";
import { PaintToolbar } from "./toolbars/PaintToolbar";
import { TextToolbar } from "./toolbars/TextToolbar";
import { Lock, Images } from "lucide-react";
import { EditorState } from "../types/types";
import { useLocation } from "@tanstack/react-router";

const PadlockIndicator: React.FC<{
  editorState: EditorState;
  padlockAnimation?: boolean;
}> = ({ editorState, padlockAnimation }) => {
  if (editorState !== "editImage" && editorState !== "bulkImageEdit") {
    return null;
  }
  return (
    <div
      className={`w-full flex justify-center items-center mb-4 ${
        padlockAnimation ? "animate-pulse" : ""
      }`}
    >
      <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-muted border border-border">
        {editorState === "bulkImageEdit" ? (
          <>
            <Images
              className={`h-4 w-4 ${
                padlockAnimation ? "text-secondary" : "text-muted-foreground"
              }`}
            />
            <span className="font-medium text-muted-foreground">Bulk Edit Mode</span>
          </>
        ) : (
          <>
            <Lock
              className={`h-4 w-4 ${
                padlockAnimation ? "text-secondary" : "text-muted-foreground"
              }`}
            />
            <span className="font-medium text-muted-foreground">Edit Image Mode</span>
          </>
        )}
      </div>
    </div>
  );
};

export const ImageEditorToolbar: React.FC<{ padlockAnimation?: boolean }> = ({
  padlockAnimation,
}) => {
  const editorState = useAppStateStore((state) => state.editorState);
  const location = useLocation();

  // Check if we're on an edit route with a tool query parameter
  const searchParams = new URLSearchParams(location.search);
  const toolParam = searchParams.get("tool");

  // Determine which toolbar to show
  let CurrentToolbar: React.ReactNode = null;

  // Check for specific tool modes first
  if (toolParam === "crop" || editorState === "crop") {
    CurrentToolbar = <CropToolbar />;
  } else if (toolParam === "blur" || editorState === "blur") {
    CurrentToolbar = <BlurToolbar />;
  } else if (toolParam === "paint" || editorState === "paint") {
    CurrentToolbar = <PaintToolbar />;
  } else if (toolParam === "text" || editorState === "text") {
    CurrentToolbar = <TextToolbar />;
  } else {
    // Fallback to regular toolbar mapping
    const toolbarMap: Partial<Record<EditorState, React.ReactNode>> = {
      resizeAndOptimize: <MainToolbar />,
      editImage: <EditModeToolbar />,
      crop: <CropToolbar />,
      blur: <BlurToolbar />,
      paint: <PaintToolbar />,
      text: <TextToolbar />,
    };

    CurrentToolbar = toolbarMap[editorState] ?? <MainToolbar />;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-card border border-border p-2 rounded-lg z-10 relative">
      {CurrentToolbar}
    </div>
  );
};
