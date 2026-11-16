import "server-only";

import { prisma } from "@/lib/prisma";

export function getOwnedProjects(ownerId: string) {
  return prisma.project.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
}

export function getSharedProjects(userId: string, emails: string[]) {
  return prisma.project.findMany({
    where: {
      ownerId: { not: userId },
      collaborators: { some: { email: { in: emails, mode: "insensitive" } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
