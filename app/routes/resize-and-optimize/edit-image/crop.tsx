import { createFileRoute } from "@tanstack/react-router";
import { useEditorStore } from "../../../store/editor-store";
import { useEffect } from "react";
import { NonGalleryHeader } from "../../../components/non-gallery-header";

export const Route = createFileRoute("/resize-and-optimize/edit-image/crop")({
  component: CropImageComponent,
});

function CropImageComponent() {
  const setEditorState = useEditorStore((state) => state.setEditorState);

  // Set the editor state when this component mounts
  useEffect(() => {
    setEditorState("editImage");
  }, [setEditorState]);

  return <NonGalleryHeader mode="crop" />;
}
