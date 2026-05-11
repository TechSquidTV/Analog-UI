---
title: Lighting
description: How Analog UI resolves shared light direction, material channels, and per-component lighting overrides.
section: design
order: 21
navTitle: Lighting
draft: false
---

Analog UI lighting makes separate controls feel like one piece of hardware. A surface gets a shared light direction, then each material channel resolves its own angle and intensity from that scene.

## Basic Setup

Wrap a panel or control bank in `AnalogLightingProvider`. Use `usePointerLighting` when the light should follow the pointer around that surface.

```tsx
'use client';

import * as React from 'react';
import { AnalogLightingProvider, Dial, Panel, Toggle, usePointerLighting } from 'analog-ui';

export function ConsoleStrip() {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.35,
    targetRef: surfaceRef,
  });

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <Panel ref={surfaceRef} variant="rack">
        <Dial />
        <Toggle />
      </Panel>
    </AnalogLightingProvider>
  );
}
```

The provider supplies three runtime inputs:

- `baseAngle` is the art-directed resting direction for the scene.
- `sourceAngle` is the live direction from the pointer, environment, or interaction model.
- `power` scales highlight and shadow strength without changing the geometry of the light.

`sourceAngle` and `power` can be numbers or Motion values.

## Pointer Lighting

`usePointerLighting` maps pointer position to a continuous light angle around the target surface.

- Pass `targetRef` so light orbits the panel or control bank instead of the viewport.
- Use `influence` to blend the pointer angle back toward `baseAngle`.
- Use `deadZoneRadius` to avoid noisy angle flips near the center.
- Use `suspendRef` during heavy scrubbing if pointer lighting competes with drag interaction.

At `influence: 1`, the returned light follows the pointer directly. Lower values keep the scene calmer.

## Material Channels

Components call `useAnalogLighting` for the visible material channels they render.

| Channel   | Use It For                                   | Default Feel                      |
| --------- | -------------------------------------------- | --------------------------------- |
| `panel`   | Rack faces, macro containers, meter housings | Calm, broad movement              |
| `screw`   | Screws and small hardware accents            | Sharper specular catches          |
| `track`   | Recesses, rails, cavities, slots             | Dark, quiet movement              |
| `wheel`   | Trim wheels, drums, number wheels            | Heavy but responsive              |
| `bezel`   | Rings, trims, lamp housings                  | Crisp edge light                  |
| `lens`    | Glass, jewels, optical inserts               | Eager glints and bloom            |
| `thumb`   | Handles, rockers, caps, plungers             | Strong face and sidewall response |
| `pointer` | Needles, dial pointers, indicators           | Direct light tracking             |
| `surface` | General lit surfaces and custom controls     | Responsive default                |

Use the most specific channel that describes the material. A slider should not light its recessed track and moving thumb with the same response.

## Response Values

Lighting responses can be numbers, presets, or response objects.

```tsx
<Dial
  lighting={{
    surface: { travel: 0.55, offset: -8 },
    pointer: 'eager',
  }}
/>
```

Available presets:

| Preset     | Travel |
| ---------- | ------ |
| `fixed`    | `0`    |
| `muted`    | `0.2`  |
| `standard` | `0.45` |
| `eager`    | `0.8`  |

Response object fields:

- `travel` controls how much a channel follows `sourceAngle`.
- `offset` rotates the resolved channel angle.
- `constraint` limits motion to an arc with `{ anchor, arc, mode }`.

Use `constraint.mode: "clamp"` for a hard stop and `constraint.mode: "fold"` when reflection should bounce inside the arc.

## Provider Defaults

Set scene-wide material behavior with the `materials` prop:

```tsx
<AnalogLightingProvider
  baseAngle={180}
  sourceAngle={sourceAngle}
  power={0.9}
  materials={{
    panel: 'muted',
    track: { travel: 0.12 },
    lens: 'eager',
    thumb: { travel: 0.7, offset: 10 },
  }}
>
  <Panel variant="rack">{children}</Panel>
</AnalogLightingProvider>
```

Use provider defaults when an entire surface should feel heavier, calmer, or more reactive.

## Component Overrides

Use a component `lighting` prop when one control needs a local response:

```tsx
<Toggle
  lighting={{
    track: 'fixed',
    thumb: { travel: 0.8 },
    lens: { travel: 'eager', constraint: { anchor: 180, arc: 120, mode: 'fold' } },
  }}
/>
```

Component overrides should describe material behavior, not visual decoration. If the component introduces a visible material channel, expose a typed `lighting` prop for it.

## CSS Authoring

Use `useAnalogLighting` inside public components to resolve CSS variables for the channels you render:

```tsx
const lightingStyle = useAnalogLighting(['track', 'thumb'], lighting);

return (
  <div
    style={{
      ...lightingStyle,
      background:
        'linear-gradient(var(--analog-light-angle-track, 180deg), var(--analog-surface-cavity), black)',
      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, calc(0.12 * var(--analog-light-power, 1)))',
    }}
  />
);
```

Use `useAnalogLightStyle` when a component needs a secondary light variable for a custom layer:

```tsx
const wheelFaceStyle = useAnalogLightStyle('wheel', {
  varName: '--analog-light-angle-wheel-face',
  offset: 18,
});
```

## Lighting Rules

- Derive light-driven gradients from resolved channel variables such as `var(--analog-light-angle-track, 180deg)`.
- Scale highlight and shadow alpha with `calc(... * var(--analog-light-power, 1))`.
- Keep tracks, cavities, and recesses quieter than exposed hardware.
- Let panels move less than knobs, lamps, wheels, pointers, and thumbs.
- Let lenses and emissive elements react more eagerly than structural surfaces.
- Preserve shortest-path 360 degree rotation with no visible seam flip.
- Avoid hardcoded dynamic light angles in public components.
