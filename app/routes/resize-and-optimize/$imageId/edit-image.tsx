import { createFileRoute } from "@tanstack/react-router";
import { useAppStateStore, useImageStore } from "../../../stores";
import { useImageContext } from "../../../context/image-context";
import { useEffect } from "react";

export const Route = createFileRoute("/resize-and-optimize/$imageId/edit-image")({
  component: EditImageComponent,
});

function EditImageComponent() {
  const { imageId } = Route.useParams();
  const { setEditorState } = useAppStateStore();
  const { selectImage } = useImageStore();
  const { onSelect } = useImageContext();

  // Set the editor state and select the image when this component mounts
  useEffect(() => {
    setEditorState("editImage");
    onSelect(imageId);
    selectImage(imageId); // Also sync with zustand store
  }, [setEditorState, onSelect, selectImage, imageId]);

  // This route renders nothing - the parent handles the full layout
  return null;
}