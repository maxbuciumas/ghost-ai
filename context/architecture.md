# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |
| Auth             | Clerk                   | User identity and route protection                             |
| Database         | Prisma + PostgreSQL     | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors          |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                |
| Artifact storage | Vercel Blob             | Canvas snapshots and generated Markdown specs                  |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, and persistence.
- `trigger` — Long-running background jobs: AI design generation and spec generation.
- `lib` — Shared infrastructure: Prisma client, access control helpers, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `prisma` — Database schema and generated client output.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database**: metadata, ownership, relationships, and task run records.
- **Vercel Blob**: generated artifacts — canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- Project records, spec records, and task run records belong in PostgreSQL.
- Canvas content and Markdown output are stored in and retrieved from Vercel Blob.
- The blob URL is stored in the database (`canvasJsonPath`, `filePath`) as the reference to the artifact.

## Prisma Infrastructure

- Prisma ORM 7 loads the multi-file schema from `prisma/`; project models live in `prisma/models/project.prisma`. The client is generated to the ignored `app/generated/prisma` directory.
- `Project` stores the Clerk owner ID as a string, project metadata, DRAFT/ARCHIVED status, an optional future canvas blob URL, and timestamps. `ProjectCollaborator` stores project membership by email; project deletion cascades to its collaborator records.
- `lib/prisma.ts` exports the shared `prisma` instance. `prisma+postgres://` URLs use Accelerate; other URLs use `@prisma/adapter-pg`. Development hot reloads reuse the instance cached on `globalThis`.
- `prisma.config.ts` loads `.env.local` before `.env`, preserving existing process environment values. CLI schema and migration operations use the same local database selection as the app. Run `prisma generate` explicitly after schema changes and before building a fresh checkout.
- Project APIs list/create owned projects and rename/delete only after verifying the Clerk owner ID. Create accepts a validated slug plus eight hexadecimal characters as an explicit ID, per the feature 07 clarification; callers omitting it retain the schema's cuid default. Shared server-side project queries match verified Clerk emails case-insensitively and exclude owned projects.

## Auth and Collaboration Model

- The root layout provides Clerk with a token-based dark theme. Public sign-in/sign-up pages share `app/(auth)/layout.tsx`; the workspace shell lives in `app/editor/layout.tsx`.
- Root `proxy.ts` protects application routes by default, exempting only the configured Clerk sign-in/sign-up paths and their child paths. Framework assets are excluded from its matcher. Protected resources also check authentication where they execute; the editor page uses `auth.protect()`.
- `/` redirects authenticated users to `/editor` and unauthenticated users to the configured sign-in path. Clerk's built-in user menu handles profile settings and logout.
- Every project has a single owner (Clerk user ID).
- Projects can include additional collaborators.
- Only authenticated users can access protected routes.
- Only the owner or a collaborator can mutate project resources.
- Liveblocks room tokens are issued only after verifying project membership.

## Project Lists and Actions

- The editor home remains a Server Component. `AuthenticatedEditor` fetches owned/shared lists using `lib/projects.ts` and passes serializable summaries through `EditorShell` and the shared dialog provider to the sidebar. Initial load has no client fetch. The shell is composed at the page level so mutation refreshes reload both lists.
- `hooks/use-project-actions.ts` owns dialog, input, request, pending, and error state. Create generates a stable slug/suffix preview, persists that exact ID through POST, and navigates to `/editor/[projectId]`. This ID is the future Liveblocks room identity; renaming only changes the display name.
- Rename refreshes server data. Delete replaces the active workspace with `/editor`, otherwise refreshing. Errors leave the dialog open for retry. Only owned projects expose mutation controls; API ownership enforcement remains authoritative.
- `/editor/[projectId]` supplies a minimal project workspace destination and verifies owner or verified-email collaborator membership. Canvas and Liveblocks functionality remain deferred.

## Starter System Designs

- Prebuilt templates are static canvas snapshots stored in the codebase.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state.
- Execution: durable background task via Trigger.dev.
- Output: structured node and edge updates written into the shared Liveblocks room.

### Spec Generation

- Input: current canvas graph and project context.
- Execution: durable background task via Trigger.dev.
- Output: Markdown technical spec saved to the filesystem and linked to the project in the database.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity or real-time state requires them.
5. The canvas schema must remain consistent between user-created content and imported templates.
