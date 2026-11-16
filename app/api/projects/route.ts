import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getOwnedProjects } from "@/lib/projects";
import { readProjectInput } from "@/lib/project-input";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ projects: await getOwnedProjects(userId) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = await readProjectInput(request, true);
  if (input instanceof Response) return input;
  try {
    const project = await prisma.project.create({ data: { ownerId: userId, ...input } });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return Response.json({ error: "Project room ID already exists. Please reopen the create dialog and try again." }, { status: 409 });
    }
    throw error;
  }
}
