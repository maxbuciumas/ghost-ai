import { auth, currentUser } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

import { EditorShell } from "@/components/editor/editor-shell";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";

export async function AuthenticatedEditor({ children }: { children: ReactNode }) {
  const { userId } = await auth.protect();
  const user = await currentUser();
  const emails = user?.emailAddresses
    .filter((email) => email.verification?.status === "verified")
    .map((email) => email.emailAddress) ?? [];
  const [owned, shared] = await Promise.all([
    getOwnedProjects(userId), getSharedProjects(userId, emails),
  ]);
  return (
    <EditorShell
      ownedProjects={owned.map(({ id, name }) => ({ id, name, isOwner: true }))}
      sharedProjects={shared.map(({ id, name }) => ({ id, name, isOwner: false }))}
    >
      {children}
    </EditorShell>
  );
}
