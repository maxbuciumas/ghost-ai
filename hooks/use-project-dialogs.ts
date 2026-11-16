"use client";

import { useRef, useState, useTransition } from "react";

import { MOCK_PROJECTS, type MockProject } from "@/lib/mock-projects";
import { projectSlug } from "@/lib/project-slug";

type ProjectDialog =
  | { kind: "create" }
  | { kind: "rename" | "delete"; project: MockProject }
  | null;

export function useProjectDialogs() {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<ProjectDialog>(null);
  const [name, setName] = useState("");
  const [isLoading, startTransition] = useTransition();
  const triggerRef = useRef<HTMLElement | null>(null);
  const slug = projectSlug(name);
  const nameError = name.length > 0 && !slug
    ? "Include at least one letter (A–Z) or number (0–9)."
    : null;

  function openDialog(nextDialog: Exclude<ProjectDialog, null>) {
    if (isLoading) return;
    if (nextDialog.kind !== "create" && !nextDialog.project.isOwner) return;

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setName(nextDialog.kind === "rename" ? nextDialog.project.name : "");
    setDialog(nextDialog);
  }

  function closeDialog() {
    if (isLoading) return;
    setDialog(null);
    setName("");
  }

  function submit() {
    if (!dialog || isLoading) return;
    const nextName = name.trim();
    if (dialog.kind !== "delete" && !slug) return;
    if (dialog.kind !== "create" && !dialog.project.isOwner) return;

    // Local mock mutations only. There is deliberately no network or persistence layer.
    startTransition(async () => {
      await Promise.resolve();
      if (dialog.kind === "create") {
        const project: MockProject = {
          id: crypto.randomUUID(),
          name: nextName,
          slug,
          isOwner: true,
        };
        setProjects((current) => [...current, project]);
      } else if (dialog.kind === "rename") {
        setProjects((current) => current.map((project) => project.id === dialog.project.id
          ? { ...project, name: nextName, slug }
          : project));
      } else {
        setProjects((current) => current.filter((project) => project.id !== dialog.project.id));
      }
      setDialog(null);
      setName("");
    });
  }

  return {
    projects,
    dialog,
    name,
    setName,
    slug,
    nameError,
    isLoading,
    triggerRef,
    openCreate: () => openDialog({ kind: "create" }),
    openRename: (project: MockProject) => openDialog({ kind: "rename", project }),
    openDelete: (project: MockProject) => openDialog({ kind: "delete", project }),
    closeDialog,
    submit,
  };
}
