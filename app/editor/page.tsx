import { Suspense } from "react";
import { EditorHome } from "@/components/editor/editor-home";
import { AuthenticatedEditor } from "@/components/editor/authenticated-editor";

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedEditor><EditorHome /></AuthenticatedEditor>
    </Suspense>
  );
}
