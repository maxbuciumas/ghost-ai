import type { ReactNode } from "react";

import { EditorShell } from "@/components/editor/editor-shell";

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return <EditorShell>{children}</EditorShell>;
}
