"use client";

import { FolderOpen, Plus, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      id="project-sidebar"
      aria-labelledby="project-sidebar-title"
      aria-hidden={!isOpen}
      inert={!isOpen}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        "absolute inset-y-3 left-3 z-20 flex w-80 max-w-[calc(100%-1.5rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-xl backdrop-blur-xl transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[calc(100%+0.75rem)] opacity-0",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 p-4">
        <h2 id="project-sidebar-title" className="text-sm font-semibold text-copy-primary">
          Projects
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl text-copy-muted"
          aria-label="Close projects sidebar"
          onClick={onClose}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-4 px-4">
        <TabsList className="w-full shrink-0 rounded-xl" aria-label="Project lists">
          <TabsTrigger value="my-projects" className="rounded-xl">My Projects</TabsTrigger>
          <TabsTrigger value="shared" className="rounded-xl">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="min-h-0 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-copy-muted">
            <FolderOpen className="size-8" aria-hidden="true" />
            <p className="text-sm">No projects yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="shared" className="min-h-0 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-copy-muted">
            <Users className="size-8" aria-hidden="true" />
            <p className="text-sm">No shared projects yet.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full rounded-xl" disabled>
          <Plus className="size-5" aria-hidden="true" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
