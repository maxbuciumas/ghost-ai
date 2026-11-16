# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Prisma implementation and local checks complete; applying the first migration remains blocked by the native schema engine connection failure (`feature-specs/05-prisma.md`).

## Current Goal

- Apply the generated initial migration using Prisma Migrate once its native engine can connect. Models, the cached client, client generation, and the production build are verified.

## Completed

- Added `prisma/models/project.prisma` with ProjectStatus (DRAFT/ARCHIVED), Project, and ProjectCollaborator. Includes only the specified metadata plus primary keys and relation fields, owner/date and email/project-date indexes, project/email uniqueness, and cascading collaborator deletion. Clerk owner IDs remain strings; no local User model was introduced.
- Added `lib/prisma.ts` exporting a shared Prisma client, selecting Accelerate for `prisma+postgres://` and `PrismaPg` otherwise, with development global caching and an explicit missing-DATABASE_URL error. Installed `@prisma/extension-accelerate` for the specified branch.
- Renamed the pre-existing `prisma7.config.ts` to the CLI-discovered `prisma.config.ts`, preserved the multi-file schema/client output setup, and loaded `.env.local` before `.env` without overriding process environment values.
- Formatted the schema, generated Prisma Client 7.10.1, and generated/reviewed `prisma/migrations/20261116000000_init_projects/migration.sql` with Prisma's offline schema diff. Added the PostgreSQL migration lock file.
- Verification passed: schema validation/formatting, ESLint, TypeScript, production build, direct application-client `SELECT 1`, singleton reuse after module reload, and Accelerate extension initialization/caching. Live Accelerate queries were not tested because no Accelerate credentials are configured.
- Fixed project-name validation: create and rename reject names that normalize to an empty slug, including punctuation-only/unsupported-character-only input. The form shows an accessible inline error and disables submission; the hook also rejects invalid submission directly.
- Validation regression checks passed: TypeScript, ESLint, production build, and isolated browser tests for `___`, `---`, punctuation, whitespace, emoji-only and unsupported-script-only names, direct form submission, rename Enter submission, valid-name recovery, and unaffected delete confirmation.
- Implemented the exact editor home heading and description with a Plus/New Project button and no enclosing card, reusing the editor layout and retaining the page's server-side auth check.
- Added `hooks/use-project-dialogs.ts` for dialog, form, transition/loading, focus-return, and in-memory mock project state; `ProjectDialogsProvider` shares it between the home and sidebar.
- Added Create Project with a live normalized slug preview; Rename Project with current-name description, prefilled/autofocused input, and Enter submission; Delete Project with no input and a destructive confirm action.
- Wired both New Project entry points and owned-project rename/delete controls. Shared mock projects have no mutation actions. Mobile outside taps on the new scrim close the sidebar; navbar and desktop sidebar behavior are preserved.
- Verified with TypeScript, ESLint, and a production build. Headless Chrome checks against an isolated harness of the actual editor components passed create/slug/blank validation, rename prefill/focus/Enter/cancel, destructive delete, shared-project restrictions, Escape/focus return, empty states, reload reset, mobile scrim, dialog bounds, and keyboard focus trapping. Only Clerk's avatar was stubbed in that harness; application authentication was unchanged. No project API calls were observed.
- Refined both auth pages using the supplied screenshot: equal-width full-height desktop panels, a flat brand-tinted left surface, branding at the top, three compact feature rows, copyright at the bottom, and a centered 448px Clerk form. Mobile remains form-only.
- Added `--bg-auth-panel`/`bg-auth-panel`, explicit Geist Sans for body and Clerk buttons, and Geist Mono for code text. Configured Clerk's CSS cascade layer so Tailwind form sizing overrides apply correctly.
- Verified the auth UI in headless Chrome at 1440×900 and 375×812: exact 720px desktop panels, distinct nontransparent backgrounds, correct computed Geist families, readable feature labels, 448px desktop cards, no desktop scrolling or mobile horizontal overflow, and no runtime errors. ESLint and the production build (including TypeScript) pass.
- Configured shadcn/ui with the Radix Nova preset and installed Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea through the CLI.
- Installed Lucide React and created `lib/utils.ts` with the reusable `cn()` export.
- Mapped shadcn and Tailwind tokens to the dark-only Ghost AI palette in `app/globals.css`; enabled the dark variant in the root layout.
- Verified with TypeScript, ESLint, a `cn()` class-merging check, and a production build.
- Added `components/editor/editor-navbar.tsx`: fixed-height three-section navbar, state-aware PanelLeftOpen/PanelLeftClose toggle, and empty right section.
- Added `components/editor/project-sidebar.tsx`: sliding overlay, Projects header and close control, shadcn My Projects/Shared empty tabs, and full-width New Project placeholder button.
- Added `components/editor/editor-shell.tsx`, now mounted in `app/editor/layout.tsx`; sidebar visibility is client state and the reserved canvas keeps its full size.
- Simplified editor composition to three components: navbar, sidebar, and shell. Removed the unused dialog wrapper and documented title, description, footer actions, and token styling in `ui-context.md` for the first feature dialog.
- Verified the component simplification with `npx tsc --noEmit` and `npm run lint`; both passed.
- Editor verification passed: `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Browser interaction checks have not been run.
- Installed `@clerk/ui` and wrapped root route content in `ClerkProvider` with `dark` from `@clerk/ui/themes`. Appearance colors, typography, and radius reference app CSS variables.
- Added shared `app/(auth)/layout.tsx` and Clerk catch-all sign-in/sign-up pages. Large screens show compact branding and a short text-only feature list beside the centered form; small screens show only the form.
- Added root `proxy.ts`: configured Clerk auth paths and their children are public; all other application paths require authentication. No `middleware.ts` or deprecated `createRouteMatcher` was added.
- `/` redirects by session state; `/editor` uses its own shared shell layout and an additional server-side `auth.protect()` check. Sign-in/sign-up fallback destinations are `/editor`.
- Added the built-in `UserButton` to the navbar; profile settings and logout retain Clerk's default flows.
- Auth verification passed: TypeScript, ESLint, production build, 14 route-policy cases, and 3 static/framework asset matcher exclusions. Production-server signed-out HTTP checks passed for `/`, `/editor`, `/sign-in`, `/sign-up`, `/sign-in-admin`, and `/api/private`; auth pages omit editor chrome.
- Investigated the reported development `useSession` provider error: root provider wrapping is correct and `npm ls` shows one deduplicated `@clerk/shared@4.45.0`. With a fresh development server, headless Chrome passed both auth pages, signed-out `/` and `/editor` redirects, Clerk links between auth pages, reload, and mobile form visibility with no page or console errors. No application code change was justified by this investigation.

## In Progress

- Apply the initial migration. `prisma migrate dev --name init_projects`, `prisma migrate deploy`, and `prisma migrate status` fail through the native schema engine with P1001 (or a generic schema-engine error), including network-enabled retries and a 30-second timeout. TCP connectivity and read-only queries through `pg` and the application Prisma client succeed. The exact engine connection failure is unresolved; no reset or manual migration-history changes were attempted.

## Next Up

- Manually verify completion of browser sign-in/sign-up, the authenticated `/` redirect, profile settings, and logout against the connected Clerk instance. Signed-out browser navigation and auth form rendering have passed automated checks.
- Resolve the native schema engine's database connection failure, run `npx --no-install prisma migrate deploy`, then verify `prisma migrate status` and read both project tables through the application client before marking feature 05 complete.

## Open Questions

- What prevents the native Prisma schema engine from connecting while Node's PostgreSQL driver succeeds? Applying the first migration is the remaining blocker for feature 05. Real project APIs and persistence wiring remain outside this spec.

## Architecture Decisions

- Feature 05 adds database infrastructure only. Existing project dialogs remain mock-only. Project ownership uses Clerk IDs without a local User table; canvasJsonPath is nullable until future blob persistence is implemented.
- For this unit, create/rename/delete update a local mock project collection only and reset on reload. No API calls, database changes, or browser persistence are introduced. Project names are trimmed and must produce a nonempty slug; slug previews use lowercase ASCII letters/digits separated by hyphens.
- Use the generated shadcn/ui Radix Nova primitives unchanged; map their semantic CSS variables to the documented dark palette so app-level styling stays consistent.
- Keep editor composition in `components/editor/`; reuse the existing shadcn primitives unchanged. New Project now opens the local mock Create Project dialog.
- Keep shared sidebar state in `EditorShell`. Defer a shared dialog wrapper until actual dialog usage establishes its requirements.
- Default protection in `proxy.ts` implements the auth spec; resources also enforce authentication where they execute. Future protected pages, handlers, and Server Actions must perform their own auth and authorization checks.

## Session Notes

- The running development server retained old CSS token definitions during this change. The fresh production build and browser screenshots verify the new tint and sizing; restart the development server to pick up all CSS changes.
- Avoid using `text-base` as a font-size class in the auth layout: the app's `base` color token also resolves that utility to a text color. Use `text-[1rem]` when specifying that font size.
- The design system unit is complete. Existing unrelated working-tree changes are preserved.
- The editor shell reserves the canvas area; real canvas behavior remains deferred. Project dialogs are now implemented for the mock UI unit. Sidebar transitions respect reduced motion, and closed sidebar content is inert.
- Auth URL configuration resolved with user approval: added standard `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` to ignored `.env.local`; existing keys were preserved and no new redirect env vars were introduced.
- Account creation, credential submission, and signed-in account flows have not been exercised. Clerk development-mode document requests can initiate a browser handshake; the headless browser checks completed that handshake and verified signed-out navigation.
- The reported provider error could not be reproduced after a fresh development-server start. Stale development state after dependency installation is a possible cause, not a confirmed diagnosis. Restart the dev server and reload the browser if an older session still shows the error; telemetry and development-key notices are informational.
