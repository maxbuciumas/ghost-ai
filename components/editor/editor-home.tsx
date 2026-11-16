"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectDialogContext } from "@/components/editor/project-dialogs-provider";

export function EditorHome() {
  const { openCreate } = useProjectDialogContext();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">Create a project or open an existing one</h1>
      <p className="max-w-lg text-sm leading-6 text-copy-muted">Start a new architecture workspace, or choose a project from the sidebar.</p>
      <Button type="button" onClick={openCreate} className="mt-2 rounded-xl">
        <Plus className="size-5" aria-hidden="true" />
        New Project
      </Button>
    </div>
  );
}
