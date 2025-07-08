import { createFileRoute } from "@tanstack/react-router";
import { useEditorStore } from "../../store/editor-store";
import { useEffect } from "react";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/resize-and-optimize/edit-image")({
  component: EditImageComponent,
});

function EditImageComponent() {
  const setEditorState = useEditorStore((state) => state.setEditorState);

  // Set the editor state when this component mounts
  useEffect(() => {
    setEditorState("editImage");
  }, [setEditorState]);

  return (
    <div className="text-center p-8 bg-gray-800 rounded-lg mb-6 flex flex-col items-center justify-center min-h-[124px]">
      <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-gray-600 border border-gray-500">
        <Lock className="h-4 w-4 text-white" />
        <span className="font-medium text-white">Edit Image Mode</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        The gallery is hidden. Use the toolbar below to edit your image.
      </p>
    </div>
  );
}
