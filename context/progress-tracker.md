# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete: editor chrome (`feature-specs/02-editor.md`).

## Current Goal

- The reusable editor navbar and floating project sidebar from `feature-specs/02-editor.md` are implemented; the dialog styling pattern is documented for future use.

## Completed

- Configured shadcn/ui with the Radix Nova preset and installed Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea through the CLI.
- Installed Lucide React and created `lib/utils.ts` with the reusable `cn()` export.
- Mapped shadcn and Tailwind tokens to the dark-only Ghost AI palette in `app/globals.css`; enabled the dark variant in the root layout.
- Verified with TypeScript, ESLint, a `cn()` class-merging check, and a production build.
- Added `components/editor/editor-navbar.tsx`: fixed-height three-section navbar, state-aware PanelLeftOpen/PanelLeftClose toggle, and empty right section.
- Added `components/editor/project-sidebar.tsx`: sliding overlay, Projects header and close control, shadcn My Projects/Shared empty tabs, and full-width New Project placeholder button.
- Added `components/editor/editor-shell.tsx` and mounted it on the home page; sidebar visibility is client state and the reserved canvas keeps its full size.
- Simplified editor composition to three components: navbar, sidebar, and shell. Removed the unused dialog wrapper and documented title, description, footer actions, and token styling in `ui-context.md` for the first feature dialog.
- Verified the component simplification with `npx tsc --noEmit` and `npm run lint`; both passed.
- Editor verification passed: `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Browser interaction checks have not been run.

## In Progress

- None.

## Next Up

- Select the next feature unit from the project specs.

## Open Questions

- None blocking the editor chrome unit. Project creation behavior remains deferred to its feature spec.

## Architecture Decisions

- Use the generated shadcn/ui Radix Nova primitives unchanged; map their semantic CSS variables to the documented dark palette so app-level styling stays consistent.
- Keep editor composition in `components/editor/`; reuse the existing shadcn primitives unchanged. New Project is disabled until its creation flow is implemented.
- Keep shared sidebar state in `EditorShell`. Defer a shared dialog wrapper until actual dialog usage establishes its requirements.

## Session Notes

- The design system unit is complete. Existing unrelated working-tree changes are preserved.
- The editor shell reserves the canvas area; canvas behavior and actual dialogs are outside this unit. Sidebar transitions respect reduced motion, and closed sidebar content is inert.
