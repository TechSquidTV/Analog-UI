---
name: analog-ui-components
description: Create and update Analog UI components and registry entries using the repo's Studio Hyper-Skeuomorphism design system. Use when working on public components in `packages/analog-ui/src/registry/components/analog/`, updating `packages/analog-ui/registry.json`, or styling tactile controls that must follow the analog lighting system, BaseUI patterns, and Tailwind CSS v4 conventions.
---

# Analog UI Components

## Overview

Use this skill to build or revise Analog UI components that feel tactile, machined, and reactive to the analog lighting system. All implementation details must align with the Studio Hyper-Skeuomorphism standards defined in [DESIGN.md](DESIGN.md). Keep public components installable through the shadcn registry flow and keep visual finish work tied to resolved per-material lighting variables.

## Workflow

1. Read the target component and one or two nearby components before editing so the new work matches existing registry patterns.
2. Place distributed public components in `packages/analog-ui/src/registry/components/analog/`.
3. Register every new public component in `packages/analog-ui/registry.json`.
4. Follow the Component Composition Architecture in `DESIGN.md`: finished controls by default, reusable analog parts when useful across controls, and targeted `render*` slots for high-variance hardware pieces.
5. Use Tailwind CSS v4 utilities for layout, spacing, and structure. Use inline styles or CSS variables only when they are the clearest way to express lighting, material finish, or complex layered effects.

## Composability Model

- Finished controls such as `Slider`, `Meter`, `NeedleGauge`, `Dial`, and `Switch` should remain polished, complete, install-and-use components.
- Promote stable physical pieces to reusable registry items only when they are valuable outside one component, such as thumb shells, plungers, track slots, lenses, bezels, peak markers, scale renderers, or ballistics/scale hooks.
- Public reusable parts must be registered in `packages/analog-ui/registry.json`, documented in the website component docs, and exported from `packages/analog-ui/src/index.ts` when package consumers should compose with them.
- Prefer typed `render*` slots for fixed-layout controls when users are likely to swap one hardware piece, for example `renderThumb`, `renderTrack`, `renderIndicator`, `renderPeakMarker`, `renderScale`, or `renderLens`.
- Prefer compound subcomponents only when consumers naturally arrange children themselves, such as panel sections or meter group channels.
- Add stable `data-slot` attributes to public layers and slot defaults.
- Keep cosmetic tuning on CSS variables, `tone`, `variant`, `lighting`, `className`, and `style` before introducing a slot.
- Component docs must include the composition tree and a focused customization example when a component exposes reusable parts or render slots.

## Lighting System

- Treat `AnalogLightingProvider` and `useAnalogLighting` as the canonical lighting path for public components.
- Do not hardcode light-driven gradient angles, highlight opacities, or shadow opacities.
- Use `calc()` with `var(--analog-light-power, 1)` to scale alpha values for highlights and shadows.
- Derive gradient directions from resolved per-material variables such as `var(--analog-light-angle-surface, 180deg)` or `var(--analog-light-angle-thumb, 180deg)` instead of locking them to fixed angles whenever the effect represents the light source.
- Expose typed `lighting` props for visible materials such as `track`, `thumb`, `panel`, `pointer`, `lens`, or `surface`.
- Keep non-lit structure in Tailwind utilities, but route gloss, bevels, chrome, extrusions, ridges, cavities, and other finish details through the lighting system.

## Visual Direction

- Aim for Studio Hyper-Skeuomorphism as detailed in [DESIGN.md](../../../DESIGN.md): machined metals, dark plastics, foil textures, glossy finishes, and tone indicators.
- Use the specific color palette (Chrome, Black material, tone cores) and typography defined in the design spec.
- Stack inset and drop shadows to build realistic depth, bevels, ridges, and cavities.
- Use layered elements, pseudo-elements, and blend modes when they help add texture, foil, or glare without flattening the base material.
- Prefer realistic cubic-bezier easing that feels mechanical instead of generic UI motion.

## Performance Guardrails

- Keep drag, scrub, and telemetry state in the smallest subtree that needs to animate. Do not let a slider, meter, or wheel rerender a whole demo surface every frame.
- When a control lives inside an expensive showcase, prefer local live state during interaction and synchronize broader derived state on commit when the design allows it.
- Scope pointer lighting to the active surface, cache measured bounds, and coalesce pointer updates with `requestAnimationFrame`.
- Avoid React hover-state toggles that only exist to “wake up” pointer lighting on first movement; first-touch hitching is usually worse than always-ready tracking.
- Idle synthetic telemetry and decorative motion when the component or showcase is offscreen.
- Pre-promote heavily dragged parts such as slider thumbs when the visual shell is dense enough to benefit from an isolated transform layer.

## Implementation Pattern

```tsx
const lightingStyle = useAnalogLighting(['surface'], lighting);

style={{
  ...lightingStyle,
  background: `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 90deg), #b5b5b5, #e5e5e5 50%, #8a8a8a)`,
  boxShadow:
    `inset 0 1px 1px rgba(255, 255, 255, calc(1 * var(--analog-light-power, 1))), ` +
    `0 2px 4px rgba(0, 0, 0, calc(0.5 * var(--analog-light-power, 1)))`,
}}
```

## Checklist

- Place new public components in `packages/analog-ui/src/registry/components/analog/`.
- Register new public components in `packages/analog-ui/registry.json`.
- Export reusable public parts from `packages/analog-ui/src/index.ts` when package consumers should compose with them.
- Build interactive behavior on BaseUI primitives when applicable.
- Preserve finished-control defaults while adding targeted composition points.
- Add `data-slot` attributes to stable public layers.
- Update component docs with composition and customization guidance for new slots or reusable parts.
- Use Tailwind CSS v4 for structure and spacing.
- Drive light-reactive styles from `useAnalogLighting`, `--analog-light-power`, and the appropriate `--analog-light-angle-*` material channels.
- Make the finished control feel tactile rather than flat.
