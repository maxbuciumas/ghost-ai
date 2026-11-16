import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RedirectToWorkspace() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) return redirectToSignIn();

  redirect("/editor");
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectToWorkspace />
    </Suspense>
  );
}
