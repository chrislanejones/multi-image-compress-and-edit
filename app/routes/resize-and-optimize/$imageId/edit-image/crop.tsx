import { createFileRoute } from "@tanstack/react-router";
import { useEditorStore } from "../../../../store/editor-store";
import { useImageContext } from "../../../../context/image-context";
import { useEffect } from "react";

export const Route = createFileRoute("/resize-and-optimize/$imageId/edit-image/crop")({
  component: CropComponent,
});

function CropComponent() {
  const { imageId } = Route.useParams();
  const { setEditorState, selectImage } = useEditorStore();
  const { onSelect } = useImageContext();

  // Set the editor state and select the image when this component mounts
  useEffect(() => {
    setEditorState("crop");
    onSelect(imageId);
    selectImage(imageId); // Also sync with zustand store
  }, [setEditorState, onSelect, selectImage, imageId]);

  // This route renders nothing - the parent handles the full layout
  return null;
}