# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Features 06 and 07 implemented; the initial database schema is now applied and live Prisma reads and transactional CRUD verification pass. The missing-table runtime error is resolved. Native Prisma CLI connectivity remains unresolved.

## Current Goal

- Verify authenticated editor flows in the browser. Restore native Prisma CLI connectivity before applying future migrations with Migrate.

## Completed

- Made PostgreSQL TLS verification explicit by changing only `DATABASE_URL`'s `sslmode=require` to `sslmode=verify-full` in ignored `.env.local` and `.env`. This preserves the driver's current certificate/hostname verification behavior and removes its SSL compatibility warning. Restart the development server to recreate its cached connection pool with the new URL.
- Verified the updated URL with a live PostgreSQL connection and Project-table read without the SSL warning. The first connection timed out; the bounded retry succeeded.
- Resolved the reported `public.Project` missing-table error by applying the exact saved initial migration through `pg` in a transaction after checking that project tables, enum, and populated migration history were absent. Recorded the migration in `_prisma_migrations` using Prisma's documented table format, SHA-256 checksum, completion timestamp, and step count; checksum and completion were verified. No existing project data was modified or reset.
- Live verification passed: both project tables read through the application's Prisma singleton; a bounded transaction using the same generated Prisma client and PostgreSQL adapter passed create/list/rename/delete, collaborator cascade, and rollback cleanup. No verification projects were retained. Initial verification connections stalled; bounded connection and transaction-start timeouts allowed the CRUD check to complete.
- Native engine diagnosis: Node driver connections succeed, including all resolved IPv4 endpoints with verified TLS. Native `migrate status` continues to fail with P1001, including three retries after schema application; a temporary localhost TCP relay also failed. No saved credentials, SSL settings, or connection URLs were changed. The schema application used the Node driver rather than a successful Prisma Migrate invocation.
- Feature 07: replaced mock collections with server-loaded owned/shared project summaries, using shared Prisma data helpers and verified Clerk email membership. Added `use-project-actions.ts` for real create/rename/delete requests, pending/error state, duplicate submission protection, navigation, and refresh. Removed the unused mock data and mock hook.
- Feature 07: create previews and persists the exact slug plus eight-character random suffix ID; project and future room identities are identical. Rename preserves identity. Sidebar project links open an authorized minimal `/editor/[projectId]` destination; deleting the active project returns to `/editor`.
- Features 06/07 verification passed: production build, ESLint, and isolated tests executing the actual API handlers and actions hook. Checks cover 401/403/404/400, owned-list isolation, default names, slug-ID persistence/collisions, no initial client fetch, create navigation, rename prefill/refresh, active versus inactive delete, duplicate submission prevention, and retained dialog errors. Auth and database boundaries are stubbed; authenticated browser flows and live CRUD have not been verified.
- Read-only network-enabled database verification confirmed both `Project` and `ProjectCollaborator` tables are absent. Retrying `prisma migrate deploy` with network access still fails with a generic schema-engine error. No destructive reset or manual migration-history edits were performed.
- Feature 06: added GET/POST `/api/projects` and PATCH/DELETE `/api/projects/[projectId]`. Clerk identity supplies ownerId; missing create names default to Untitled Project, IDs use Prisma defaults, mutations require ownership, and project APIs return JSON 401/403 rather than auth redirects. Invalid JSON/names return 400 and missing projects return 404.
- Feature 06 verification: production build and isolated tests of the actual handlers passed authentication, ownership, list isolation, ID/owner injection resistance, default names, invalid inputs, rename, delete, and missing records. The database boundary was stubbed in these tests; live database verification remains separate.
- Fixed the existing Prisma singleton's incompatible union query signatures by exposing the common PrismaClient API for both direct and Accelerate clients; runtime connection selection is unchanged.
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

- Restore native Prisma schema-engine connectivity for future migrations. The initial schema and migration history are now applied through the Node driver; native CLI status remains unverified because the engine still returns P1001.

## Next Up

- Manually verify completion of browser sign-in/sign-up, the authenticated `/` redirect, profile settings, and logout against the connected Clerk instance. Signed-out browser navigation and auth form rendering have passed automated checks.
- Resolve the native schema engine's database connection failure, then verify `prisma migrate status` recognizes the recorded initial migration. Schema application and live client reads/CRUD have passed; native CLI verification remains outstanding.

## Open Questions

- Resolved feature 06/07 ID ambiguity: user explicitly selected slug plus suffix as both project and room ID. POST accepts this validated ID; requests without an ID still use Prisma's default. No schema changes or sequential IDs were added.
- What prevents the native Prisma schema engine from connecting while Node's PostgreSQL driver succeeds? This no longer blocks the editor's initial schema, but must be resolved for future native CLI migrations.

## Architecture Decisions

- Feature 05 adds database infrastructure only. Existing project dialogs remain mock-only. Project ownership uses Clerk IDs without a local User table; canvasJsonPath is nullable until future blob persistence is implemented.
- Features 06/07 supersede the mock-dialog unit: project actions now call real APIs and server components reload persisted lists. Project names are trimmed and create/rename forms require a nonempty slug; the create room ID adds a stable random suffix and remains unchanged on rename.
- Use the generated shadcn/ui Radix Nova primitives unchanged; map their semantic CSS variables to the documented dark palette so app-level styling stays consistent.
- Keep editor composition in `components/editor/`; reuse the existing shadcn primitives unchanged. New Project opens the shared Create Project dialog backed by the real API.
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
