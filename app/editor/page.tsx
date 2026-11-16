import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { EditorHome } from "@/components/editor/editor-home";

async function AuthenticatedEditorHome() {
  await auth.protect();

  return <EditorHome />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedEditorHome />
    </Suspense>
  );
}
