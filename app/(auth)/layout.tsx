import { FileText, Ghost, Share2, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const features = [
  {
    icon: WandSparkles,
    title: "AI Architecture Generation",
    description: "Describe your system. AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from your canvas.",
  },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh w-full bg-base lg:grid-cols-2">
      <aside className="hidden min-w-0 flex-col border-r border-surface-border bg-auth-panel px-10 py-10 lg:flex xl:px-16 xl:py-12">
        <div className="flex shrink-0 items-center gap-3 text-[1rem] font-semibold tracking-tight text-copy-primary">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-primary-foreground">
            <Ghost className="size-5" aria-hidden="true" />
          </span>
          Ghost AI
        </div>
        <div className="flex flex-1 flex-col justify-center py-12">
          <h1 className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-copy-primary xl:text-4xl">
            Design systems at the<br />speed of thought.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-copy-muted xl:text-[1rem]">
            Describe your architecture in plain English. Ghost AI maps it to a shared
            canvas your whole team can refine in real time.
          </p>
          <ul className="mt-10 space-y-7 xl:mt-12 xl:space-y-8">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-accent-dim text-brand">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm leading-6 font-medium text-copy-secondary xl:text-[1rem]">{title}</h2>
                  <p className="mt-1 max-w-md text-sm leading-6 text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="shrink-0 text-xs text-copy-muted">© 2026 Ghost AI. All rights reserved.</p>
      </aside>
      <main className="flex min-w-0 items-center justify-center bg-base px-4 py-8 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
