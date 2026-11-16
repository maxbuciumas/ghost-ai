import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { AuthenticatedEditor } from "@/components/editor/authenticated-editor";
import { prisma } from "@/lib/prisma";

async function Workspace({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth.protect();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { collaborators: true } });
  if (!project) notFound();
  if (project.ownerId !== userId) {
    const user = await currentUser();
    const emails = user?.emailAddresses.filter(email => email.verification?.status === "verified")
      .map(email => email.emailAddress.toLowerCase()) ?? [];
    if (!project.collaborators.some(member => emails.includes(member.email.toLowerCase()))) notFound();
  }
  return (
    <AuthenticatedEditor>
      <div className="flex h-full items-center justify-center p-6">
        <h1 className="text-xl font-semibold text-copy-primary">{project.name}</h1>
      </div>
    </AuthenticatedEditor>
  );
}

export default function WorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  return <Suspense fallback={null}><Workspace params={params} /></Suspense>;
}
