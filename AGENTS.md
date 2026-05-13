# Analog UI Codex Guidance

Project-specific component guidance now lives in the local skill at `.codex/skills/analog-ui-components/`.

When a task involves creating or modifying Analog UI components, registry entries, or tactile surface styling:

1. Read and follow `.codex/skills/analog-ui-components/SKILL.md`.
2. Apply that skill's rules instead of duplicating the full guidance in this file.

When a task changes a public component API, component composition model, reusable analog part, slot API, or documentation for those concepts:

1. Read `DESIGN.md`, especially the `Component Composition Architecture`, `Slot API Rules`, and `Composition Documentation` sections.
2. Treat `DESIGN.md` as the canonical ingestible spec for the finished-control / reusable-part / targeted-slot model.
3. Keep new component docs aligned with the documented customization ladder and composition tree format.
