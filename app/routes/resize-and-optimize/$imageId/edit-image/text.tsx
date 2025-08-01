import { createFileRoute } from "@tanstack/react-router";
import { useEditorStore } from "../../../../store/editor-store";
import { useImageContext } from "../../../../context/image-context";
import { useEffect } from "react";

export const Route = createFileRoute("/resize-and-optimize/$imageId/edit-image/text")({
  component: TextComponent,
});

function TextComponent() {
  const { imageId } = Route.useParams();
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const { onSelect } = useImageContext();

  // Set the editor state and select the image when this component mounts
  useEffect(() => {
    setEditorState("text");
    onSelect(imageId);
  }, [setEditorState, onSelect, imageId]);

  // This route renders nothing - the parent handles the full layout
  return null;
}