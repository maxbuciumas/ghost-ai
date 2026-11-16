import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { readProjectInput } from "@/lib/project-input";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

async function checkOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = await readProjectInput(request);
  if (input instanceof Response) return input;
  const { projectId } = await params;
  const denied = await checkOwner(projectId, userId);
  if (denied) return denied;
  const project = await prisma.project.update({ where: { id: projectId, ownerId: userId }, data: { name: input.name } });
  return Response.json({ project });
}

export async function DELETE(_request: Request, { params }: ProjectRouteContext) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const denied = await checkOwner(projectId, userId);
  if (denied) return denied;
  await prisma.project.deleteMany({ where: { id: projectId, ownerId: userId } });
  return new Response(null, { status: 204 });
}
