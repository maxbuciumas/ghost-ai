"use client";

import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SidebarProject } from "@/lib/project-types";
import { useProjectDialogContext } from "@/components/editor/project-dialogs-provider";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { ownedProjects, sharedProjects, openCreate, openRename, openDelete } = useProjectDialogContext();

  return (
    <>
    {isOpen && (
      <button
        type="button"
        aria-label="Close projects sidebar backdrop"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 z-10 bg-base/70 backdrop-blur-sm md:hidden"
      />
    )}
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
          {ownedProjects.length ? (
            <ProjectList projects={ownedProjects} onRename={openRename} onDelete={openDelete} />
          ) : (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-copy-muted">
            <FolderOpen className="size-8" aria-hidden="true" />
            <p className="text-sm">No projects yet.</p>
          </div>
          )}
        </TabsContent>
        <TabsContent value="shared" className="min-h-0 overflow-y-auto">
          {sharedProjects.length ? (
            <ProjectList projects={sharedProjects} onRename={openRename} onDelete={openDelete} />
          ) : (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-copy-muted">
            <Users className="size-8" aria-hidden="true" />
            <p className="text-sm">No shared projects yet.</p>
          </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full rounded-xl" onClick={openCreate}>
          <Plus className="size-5" aria-hidden="true" />
          New Project
        </Button>
      </div>
    </aside>
    </>
  );
}

interface ProjectListProps {
  projects: SidebarProject[];
  onRename: (project: SidebarProject) => void;
  onDelete: (project: SidebarProject) => void;
}

function ProjectList({ projects, onRename, onDelete }: ProjectListProps) {
  return (
    <ul className="space-y-2 pb-4">
      {projects.map((project) => (
        <li key={project.id} className="flex items-center gap-2 rounded-xl bg-elevated p-3">
          <Link href={`/editor/${encodeURIComponent(project.id)}`} className="min-w-0 flex-1 rounded-xl focus-visible:outline-2 focus-visible:outline-brand">
            <p className="truncate text-sm font-medium text-copy-primary" title={project.name}>{project.name}</p>
            <p className="truncate font-mono text-xs text-copy-muted" title={project.id}>{project.id}</p>
          </Link>
          {project.isOwner && (
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" className="rounded-xl text-copy-muted" aria-label={`Rename ${project.name}`} onClick={() => onRename(project)}>
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="rounded-xl text-error hover:text-error" aria-label={`Delete ${project.name}`} onClick={() => onDelete(project)}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
