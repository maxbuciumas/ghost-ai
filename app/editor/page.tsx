import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

async function EditorCanvas() {
  await auth.protect();

  return null;
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorCanvas />
    </Suspense>
  );
}
