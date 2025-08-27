import { createFileRoute } from "@tanstack/react-router";
import { useAppStateStore, useImageStore } from "../../../stores";
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
  const { setEditorState } = useAppStateStore();
  const { selectImage } = useImageStore();
  const { onSelect } = useImageContext();

  useEffect(() => {
    setEditorState("editImage");
    onSelect(imageId);
    selectImage(imageId);
  }, [setEditorState, onSelect, selectImage, imageId]);

  return null;
}