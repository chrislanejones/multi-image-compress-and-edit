import React from "react";
import { useEditorStore } from "../store/editor-store";
import { MainToolbar } from "./toolbars/MainToolbar";
import { EditModeToolbar } from "./toolbars/EditModeToolbar";
import { CropToolbar } from "./toolbars/CropToolbar";
import { BlurToolbar } from "./toolbars/BlurToolbar";
import { Lock, Images } from "lucide-react";
import { EditorState } from "../types/types";

const toolbarMap: Partial<Record<EditorState, React.ReactNode>> = {
  resizeAndOptimize: <MainToolbar />,
  editImage: <EditModeToolbar />,
  crop: <CropToolbar />,
  blur: <BlurToolbar />,
};

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
      <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-gray-600 border border-gray-500">
        {editorState === "bulkImageEdit" ? (
          <>
            <Images
              className={`h-4 w-4 ${
                padlockAnimation ? "text-yellow-300" : "text-white"
              }`}
            />
            <span className="font-medium">Bulk Edit Mode</span>
          </>
        ) : (
          <>
            <Lock
              className={`h-4 w-4 ${
                padlockAnimation ? "text-yellow-300" : "text-white"
              }`}
            />
            <span className="font-medium">Edit Image Mode</span>
          </>
        )}
      </div>
    </div>
  );
};

export const ImageEditorToolbar: React.FC<{ padlockAnimation?: boolean }> = ({
  padlockAnimation,
}) => {
  const editorState = useEditorStore((state) => state.editorState);

  const CurrentToolbar = toolbarMap[editorState] ?? null;
  const CurrentSecondaryToolbar =
    editorState === "blur" ? <BlurToolbar.Secondary /> : null;

  return (
    <>
      <PadlockIndicator
        editorState={editorState}
        padlockAnimation={padlockAnimation}
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-700 p-2 rounded-lg z-10 relative">
        {CurrentToolbar}
      </div>
      {CurrentSecondaryToolbar}
    </>
  );
};
