"use client";

import { useRef, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";

import { projectSlug } from "@/lib/project-slug";
import type { ProjectLists, SidebarProject } from "@/lib/project-types";

type ProjectDialog =
  | { kind: "create" }
  | { kind: "rename" | "delete"; project: SidebarProject }
  | null;

export function useProjectActions(lists: ProjectLists) {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const [dialog, setDialog] = useState<ProjectDialog>(null);
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();
  const submitting = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const slug = projectSlug(name);
  const roomId = slug && suffix ? `${slug.slice(0, 191).replace(/-+$/, "")}-${suffix}` : "";
  const nameError = name.length > 0 && !slug
    ? "Include at least one letter (A–Z) or number (0–9)."
    : null;

  function openDialog(next: Exclude<ProjectDialog, null>) {
    if (submitting.current || isLoading) return;
    if (next.kind !== "create" && !next.project.isOwner) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setError(null);
    setName(next.kind === "rename" ? next.project.name : "");
    if (next.kind === "create") setSuffix(crypto.randomUUID().replaceAll("-", "").slice(0, 8));
    setDialog(next);
  }

  function closeDialog() {
    if (submitting.current || isLoading) return;
    setDialog(null);
    setName("");
    setError(null);
  }

  function submit() {
    if (!dialog || submitting.current || isLoading) return;
    if (dialog.kind !== "delete" && !slug) return;
    if (dialog.kind !== "create" && !dialog.project.isOwner) return;
    submitting.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const isCreate = dialog.kind === "create";
        const response = await fetch(isCreate ? "/api/projects" : `/api/projects/${encodeURIComponent(dialog.project.id)}`, {
          method: isCreate ? "POST" : dialog.kind === "rename" ? "PATCH" : "DELETE",
          headers: { "Content-Type": "application/json" },
          ...(dialog.kind !== "delete" ? { body: JSON.stringify({ name: name.trim(), ...(isCreate ? { id: roomId } : {}) }) } : {}),
        });
        if (!response.ok) {
          const body: unknown = await response.json().catch(() => null);
          throw new Error(body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error : "Unable to save project. Please try again.");
        }
        if (isCreate) {
          const body: unknown = await response.json();
          if (!body || typeof body !== "object" || !("project" in body) || !body.project || typeof body.project !== "object" || !("id" in body.project) || body.project.id !== roomId) {
            throw new Error("The server returned an unexpected project ID.");
          }
          router.push(`/editor/${encodeURIComponent(roomId)}`);
        } else if (dialog.kind === "delete" && params.projectId === dialog.project.id) {
          router.replace("/editor");
        } else {
          router.refresh();
        }
        setDialog(null);
        setName("");
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Unable to save project. Please try again.");
      } finally {
        submitting.current = false;
      }
    });
  }

  return {
    ...lists, dialog, name, setName, slug, roomId, nameError, error, isLoading, triggerRef,
    openCreate: () => openDialog({ kind: "create" }),
    openRename: (project: SidebarProject) => openDialog({ kind: "rename", project }),
    openDelete: (project: SidebarProject) => openDialog({ kind: "delete", project }),
    closeDialog, submit,
  };
}
