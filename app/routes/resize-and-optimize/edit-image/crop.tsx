import { createFileRoute } from "@tanstack/react-router";
import { useAppStateStore } from "../../../stores";
import { useEffect } from "react";
import { NonGalleryHeader } from "../../../components/non-gallery-header";

export const Route = createFileRoute("/resize-and-optimize/edit-image/crop")({
  component: CropImageComponent,
});

function CropImageComponent() {
  const setEditorState = useAppStateStore((state) => state.setEditorState);

  // Set the editor state when this component mounts
  useEffect(() => {
    setEditorState("editImage");
  }, [setEditorState]);

  return <NonGalleryHeader mode="crop" />;
}
