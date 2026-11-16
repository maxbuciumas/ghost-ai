"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

const ProjectDialogsContext = createContext<ReturnType<typeof useProjectDialogs> | null>(null);

export function useProjectDialogContext() {
  const context = useContext(ProjectDialogsContext);
  if (!context) throw new Error("Project dialogs require ProjectDialogsProvider.");
  return context;
}

interface ProjectDialogsProviderProps {
  children: ReactNode;
}

export function ProjectDialogsProvider({ children }: ProjectDialogsProviderProps) {
  const state = useProjectDialogs();
  const nameId = useId();
  const slugId = useId();
  const errorId = useId();
  const { dialog, name, setName, slug, nameError, isLoading, closeDialog, submit, triggerRef } = state;
  const isDelete = dialog?.kind === "delete";
  const isRename = dialog?.kind === "rename";
  const title = isDelete ? "Delete Project" : isRename ? "Rename Project" : "Create Project";

  return (
    <ProjectDialogsContext.Provider value={state}>
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        {children}
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-surface-border bg-elevated text-copy-primary sm:max-w-md"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (triggerRef.current?.isConnected) triggerRef.current.focus();
          }}
        >
          <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="grid gap-6" aria-busy={isLoading}>
            <DialogHeader className="pr-8">
              <DialogTitle className="text-[1rem] text-copy-primary">{title}</DialogTitle>
              <DialogDescription className="break-words text-copy-muted">
                {isDelete && dialog?.kind === "delete"
                  ? `Delete “${dialog.project.name}”? This cannot be undone.`
                  : isRename && dialog?.kind === "rename"
                    ? `Choose a new name for “${dialog.project.name}”.`
                    : "Give your architecture workspace a name."}
              </DialogDescription>
            </DialogHeader>

            {!isDelete && (
              <div className="grid gap-3">
                <label htmlFor={nameId} className="text-sm font-medium text-copy-secondary">Project name</label>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  required
                  disabled={isLoading}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={[!isRename && slugId, nameError && errorId].filter(Boolean).join(" ") || undefined}
                  placeholder="My architecture project"
                  className="h-10 rounded-xl text-copy-primary"
                />
                {nameError && <p id={errorId} role="alert" className="text-sm text-error">{nameError}</p>}
                {!isRename && (
                  <p id={slugId} className="min-w-0 text-sm text-copy-muted">
                    Slug: <output className="break-all font-mono text-copy-secondary" aria-live="polite">{slug || "—"}</output>
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="rounded-b-3xl border-surface-border bg-surface">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isLoading} className="rounded-xl">Cancel</Button>
              <Button type="submit" variant={isDelete ? "destructive" : "default"} disabled={isLoading || (!isDelete && !slug)} className="rounded-xl">
                {isLoading && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {isLoading ? "Working…" : isDelete ? "Delete Project" : isRename ? "Save Changes" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ProjectDialogsContext.Provider>
  );
}
