---
title: Tokens and Lighting
description: How Analog UI layers host tokens, material finishes, and runtime lighting so components stay tactile without taking over an app theme.
section: design
order: 20
draft: false
---

Analog UI gets its physical weight from a layered token system, not from isolated one-off gradients. The host app keeps control of the core theme. Analog UI adds material recipes on top, then lets runtime lighting resolve the final angle and intensity for each visible surface.

## Token Tiers

Think in three tiers when you extend the system:

- **Host semantic tokens:** `background`, `foreground`, `card`, `secondary`, `accent`, `border`, `ring`, and their foreground pairs define the product palette.
- **Analog design tokens:** `--analog-surface-*`, `--analog-led-*`, `--analog-shadow-*`, `--analog-grain-*`, and `--analog-bevel-*` turn that palette into chassis, metal, glass, and indicator recipes.
- **Runtime lighting tokens:** `--analog-light-angle-*` and `--analog-light-power` describe the live light response for each material channel.

That separation keeps Analog UI compatible with shadcn and tweakcn themes. A product can change its palette without rewriting every bevel, reflection, and recess.

## Material Families

Most components draw from a small set of material families:

- **Cavity and panel surfaces** for housings, recesses, wells, and rack faces
- **Metal channels** for machined hardware such as dials, bezels, pointers, screws, and thumbs
- **Onyx channels** for black variants, stealth finishes, and heavy control shells
- **LED and LCD channels** for concentrated emissive states, meter zones, and display glass

The neutral materials should carry most of the interface. Saturated color works best when something emits, reports, warns, or changes state.

## Material Scope

Analog UI treats `chrome` and `black` as material finishes, not alternate app themes. The host shadcn tokens still define the core palette, while Analog UI resolves its surface recipes from those values.

Use `AnalogMaterialScope` when a whole section should default to one finish:

```tsx
import { AnalogMaterialScope, AnalogToggle, Dial, Panel } from 'analog-ui';

<AnalogMaterialScope variant="black">
  <Panel>
    <Dial />
    <AnalogToggle />
  </Panel>
</AnalogMaterialScope>;
```

Scope behavior:

- `AnalogMaterialScope` sets the default finish for descendant Analog UI controls.
- Component-level `variant` props override the inherited finish.
- The scope does not replace `background`, `foreground`, `primary`, `border`, or other host shadcn tokens.

This makes material choice additive: a black control bank can sit inside any compatible product theme without redefining the rest of the app.

## Lighting Model

Light response is a first-class part of the product language. Wrap a surface in `AnalogLightingProvider` when the scene needs a shared light direction:

```tsx
<AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
  <Panel>
    <Dial />
    <AnalogToggle />
  </Panel>
</AnalogLightingProvider>
```

The provider supplies three runtime inputs:

- `baseAngle` is the art-directed resting direction for the scene.
- `sourceAngle` is the live direction from the cursor, environment, or interaction model.
- `power` scales highlight and shadow strength without changing the geometry of the light.

Components use `useAnalogLighting` to turn those inputs into per-material CSS variables such as `--analog-light-angle-panel`, `--analog-light-angle-thumb`, and `--analog-light-power`.

## Lighting Rules

Design the response by material role. A panel, lens, pointer, and thumb should not all chase the same light source with the same energy.

Important rules:

- Derive light-driven gradients from resolved channel variables such as `var(--analog-light-angle-track, 180deg)` or `var(--analog-light-angle-thumb, 180deg)`.
- Scale highlight and shadow alpha with `calc(... * var(--analog-light-power, 1))`.
- Keep tracks, cavities, and recesses quieter than exposed hardware.
- Let panels move less than knobs, lamps, wheels, and pointers.
- Allow lenses and emissive elements to react more eagerly than structural surfaces.
- Expose typed `lighting` props when a new component introduces visible material channels.

## Surface Behavior

Analog UI should feel machined rather than soft:

- Use bevels, chamfers, and inset stacks before generic drop shadows.
- Prefer layered materials over flat fills.
- Reserve saturated color for indicators, meters, LCD arcs, and active states.
- Keep typography technical and broadcast-like rather than playful.
- Let texture, glass, foil, and glare support the state of the control instead of decorating around it.

## Extension Guidance

When you add a token, finish, or control, match the existing physical grammar before inventing a new one:

- Use long pill recesses for travel slots.
- Use compact rectangles for housings and control wells.
- Use circular faces for knobs, screws, lamps, and printed scales.
- Use mono telemetry and uppercase labels for instrumentation.
- Route gloss, bevels, chrome, ridges, cavities, and other finish details through the analog token and lighting system.

The broader design reference for these decisions is preserved in [`DESIGN.md`](https://github.com/techsquidtv/analog-ui/blob/main/DESIGN.md).
