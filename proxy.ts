import { clerkMiddleware } from "@clerk/nextjs/server";

const publicAuthPaths = [
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
].filter((path): path is string => Boolean(path));

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const isPublicAuthPath = publicAuthPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (pathname === "/api/projects" || pathname.startsWith("/api/projects/")) {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  } else if (!isPublicAuthPath) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
