import { createFileRoute } from "@tanstack/react-router";
import { useAppStateStore } from "../../../stores";
import { useEffect } from "react";
import { z } from "zod";

const bulkModeSchema = z.enum(['crop', 'text']);

export const Route = createFileRoute("/resize-and-optimize/bulk/$mode")({
  params: {
    mode: bulkModeSchema,
  },
  component: BulkModeComponent,
});

function BulkModeComponent() {
  const { mode } = Route.useParams();
  const { setEditorState } = useAppStateStore();

  useEffect(() => {
    setEditorState("bulkImageEdit");
  }, [setEditorState]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="text-center p-8 bg-card border border-border rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">
          Bulk {mode === 'crop' ? 'Crop' : 'Text'} Editor
        </h1>
        <p className="text-muted-foreground">
          {mode === 'crop' 
            ? 'Apply crop settings to multiple images at once'
            : 'Add text overlays to multiple images'
          }
        </p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-card-foreground">Bulk {mode} editor coming soon...</p>
      </div>
    </div>
  );
}
