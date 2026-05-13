# Analog UI Codex Guidance

Project-specific component guidance now lives in the local skill at `.codex/skills/analog-ui-components/`.

When a task involves creating or modifying Analog UI components, registry entries, or tactile surface styling:

1. Read and follow `.codex/skills/analog-ui-components/SKILL.md`.
2. Apply that skill's rules instead of duplicating the full guidance in this file.

When a task changes a public component API, component composition model, reusable analog part, slot API, or documentation for those concepts:

1. Read `DESIGN.md`, especially the `Component Composition Architecture`, `Slot API Rules`, and `Composition Documentation` sections.
2. Treat `DESIGN.md` as the canonical ingestible spec for the finished-control / reusable-part / targeted-slot model.
3. Keep new component docs aligned with the documented customization ladder and composition tree format.

When a task adds, removes, renames, or documents a public component:

1. Keep component docs metadata in `apps/www/src/data/component-catalog.ts`.
2. Treat `component-catalog.ts` as the source for docs category, order, summary, and `/docs/components` material-logic rows.
3. Do not reintroduce `block-catalog.ts`, `lib/blocks.ts`, `BlockDemo`, or other "block" naming for public components.
4. Keep `/docs/components` tables generated through `apps/www/src/components/docs/ComponentsIndex.astro`.
5. Avoid wrapping docs tables in `section-panel` inside another docs panel; use the shared docs table styling or a light table frame instead.

When a task touches a public reusable analog part, such as a thumb shell, plunger, track slot, lens, bezel, peak marker, scale renderer, or other composable hardware piece:

1. Keep it registered in `packages/analog-ui/registry.json` and exported from `packages/analog-ui/src/index.ts` when package consumers should compose with it.
2. Do not add it to `apps/www/src/data/component-catalog.ts` unless it is intentionally promoted to a finished public component with its own `/docs/components` page and `/view` preview.
3. Document reusable parts through the consuming component's Composition section, targeted `render*` slot examples, and registry documentation rather than presenting the part as a standalone component.
4. Keep registry dependency relationships intact so finished controls can install their reusable parts automatically.
