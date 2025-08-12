import { createFileRoute } from "@tanstack/react-router";
import { useEditorStore } from "../../../store/editor-store";
import { useImageContext } from "../../../context/image-context";
import { useEffect } from "react";
import { z } from "zod";

const searchSchema = z.object({
  tool: z.enum(['crop', 'blur', 'paint', 'text']).optional(),
});

export const Route = createFileRoute("/resize-and-optimize/$imageId/edit")({
  validateSearch: searchSchema,
  component: EditComponent,
});

function EditComponent() {
  const { imageId } = Route.useParams();
  const { tool } = Route.useSearch();
  const { setEditorState, selectImage } = useEditorStore();
  const { onSelect } = useImageContext();

  useEffect(() => {
    setEditorState("editImage");
    onSelect(imageId);
    selectImage(imageId);
  }, [setEditorState, onSelect, selectImage, imageId]);

  return null;
}