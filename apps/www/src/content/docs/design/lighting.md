---
title: Lighting
description: How Analog UI resolves shared and component-relative light direction, material channels, and component material overrides.
section: design
order: 21
navTitle: Lighting
draft: false
---

Analog UI lighting makes separate controls feel like one piece of hardware. A surface gets a shared scene direction, and it can optionally add component-relative pointer lighting so each control reacts from its own screen-space center.

Controls can render without a provider because the hooks fall back to a 180 degree light and `power={1}`. Add a provider when a panel, rack, or dense control bank should share a scene, react to pointer movement, or define scene-wide material behavior.

## Basic Setup

Wrap a panel or control bank in `AnalogLightingProvider`. Use `localLighting` when pointer movement should feel like a local light moving across actual controls on the surface.

```tsx
'use client';

import * as React from 'react';
import { AnalogLightingProvider, Dial, Panel, Toggle } from 'analog-ui';

export function ConsoleStrip() {
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  return (
    <AnalogLightingProvider
      baseAngle={180}
      power={1}
      localLighting={{ enabled: true, surfaceRef, strength: 0.7 }}
    >
      <Panel ref={surfaceRef} variant="rack">
        <Dial />
        <Toggle />
      </Panel>
    </AnalogLightingProvider>
  );
}
```

The provider supplies shared runtime inputs and an optional local pointer engine:

- `baseAngle` is the art-directed resting direction for the scene.
- `sourceAngle` is the live direction from the pointer, environment, or interaction model.
- `power` scales highlight and shadow strength without changing the geometry of the light.
- `localLighting` enables component-relative pointer lighting without changing individual component APIs.

`baseAngle`, `sourceAngle`, and `power` can be numbers or Motion values. If `sourceAngle` is omitted, it falls back to `baseAngle`. If `localLighting` is omitted or disabled, no local pointer listeners, observers, or animation-frame work are installed.

## Shared Pointer Lighting

Use `usePointerLighting` when the whole surface should share one moving source angle, rather than each registered component resolving from its own center.

- Pass `targetRef` so light orbits the panel or control bank instead of the viewport.
- Omit `targetRef` only when the viewport is intentionally the lit surface.
- Use `influence` to blend the pointer angle back toward `baseAngle`.
- Use `deadZoneRadius` to avoid noisy angle flips near the center.
- Use `enabled={false}` to return to the base angle and detach pointer tracking.
- Use `suspendRef` during heavy scrubbing if pointer lighting competes with drag interaction.

At `influence: 1`, the returned light follows the pointer directly. Lower values keep the scene calmer.

```tsx
const isScrubbingRef = React.useRef(false);
const sourceAngle = usePointerLighting({
  baseAngle: 180,
  influence: 0.55,
  targetRef: panelRef,
  suspendRef: isScrubbingRef,
  deadZoneRadius: 12,
});
```

## Local Component Lighting

Use provider-level `localLighting` when each control should react to the pointer from its own screen-space center. The provider installs one pointer listener for the surface, caches component bounds, and updates registered controls in one animation-frame batch.

```tsx
const panelRef = React.useRef<HTMLDivElement>(null);

<AnalogLightingProvider
  baseAngle={180}
  power={1}
  localLighting={{
    enabled: true,
    surfaceRef: panelRef,
    strength: 0.7,
  }}
>
  <Panel ref={panelRef}>
    <Dial />
    <Switch />
  </Panel>
</AnalogLightingProvider>;
```

Falloff is dimension-relative. The default outer radius is based on the lit surface diagonal and
clamped by each target's diagonal, so compact demos, rack panels, and full-screen surfaces keep a
similar feel. Set `localLighting={{ enabled: false }}` or omit `localLighting` to detach the local
pointer loop and use the shared scene angle. A single component can opt out with
`lighting={{ local: false }}`.

`localLighting` accepts:

| Option           | Use It For                                              | Default  |
| ---------------- | ------------------------------------------------------- | -------- |
| `enabled`        | Attaching or detaching the local lighting engine        | `false`  |
| `surfaceRef`     | Scoping pointer events and surface-relative falloff     | viewport |
| `strength`       | Maximum local influence before material travel applies  | `0.78`   |
| `radius`         | Outer falloff as a fraction of the surface diagonal     | `0.3`    |
| `innerRadius`    | Full-strength radius as a target-diagonal multiplier    | `0.35`   |
| `minRadius`      | Minimum outer radius as a target-diagonal multiplier    | `2.2`    |
| `maxRadius`      | Maximum outer radius as a target-diagonal multiplier    | `7`      |
| `deadZone`       | Center hold radius as a target-diagonal multiplier      | `0.06`   |
| `responsiveness` | Angle smoothing per pointer frame, from `0` through `1` | `0.42`   |

## Material Channels

Components call `useAnalogLighting` for the visible material channels they render.

| Channel   | Use It For                                   | Default Travel | Default Feel                      |
| --------- | -------------------------------------------- | -------------- | --------------------------------- |
| `panel`   | Rack faces, macro containers, meter housings | `0.12`         | Calm, broad movement              |
| `screw`   | Screws and small hardware accents            | `0.45`         | Sharper specular catches          |
| `track`   | Recesses, rails, cavities, slots             | `0.14`         | Dark, quiet movement              |
| `wheel`   | Trim wheels, drums, number wheels            | `0.3`          | Heavy but responsive              |
| `bezel`   | Rings, trims, lamp housings                  | `0.5`          | Crisp edge light                  |
| `lens`    | Glass, jewels, optical inserts               | `0.9`          | Eager glints and bloom            |
| `thumb`   | Handles, rockers, caps, plungers             | `0.7`          | Strong face and sidewall response |
| `pointer` | Needles, dial pointers, indicators           | `1`            | Direct light tracking             |
| `surface` | General lit surfaces and custom controls     | `0.75`         | Responsive default                |

Use the most specific channel that describes the material. A slider should not light its recessed track and moving thumb with the same response.

## Response Values

Lighting responses can be numbers, presets, or response objects. Numbers are clamped from `0` to `1`; `0` stays on `baseAngle`, and `1` tracks the resolved source directly. With shared lighting that source is `sourceAngle`; with local lighting it is the component-relative pointer angle after distance falloff.

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

- `travel` controls how much a channel follows the resolved source angle.
- `offset` rotates the resolved channel angle.
- `constraint` limits motion to an arc with `{ anchor, arc, mode }`.

Use `constraint.mode: "clamp"` for a hard stop and `constraint.mode: "fold"` when reflection should bounce inside the arc. If a constraint omits details, it defaults to `anchor: 180`, `arc: 180`, and `mode: "fold"`.

```tsx
type AnalogLightingConfig<Channel extends AnalogMaterialChannel> = Partial<
  Record<Channel, number | 'fixed' | 'muted' | 'standard' | 'eager' | AnalogLightingResponse>
> & {
  local?: boolean;
};
```

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

Use a component `lighting` prop when one control needs a material-specific response:

```tsx
<Toggle
  lighting={{
    track: 'fixed',
    thumb: { travel: 0.8 },
    lens: { travel: 'eager', constraint: { anchor: 180, arc: 120, mode: 'fold' } },
  }}
/>
```

Component overrides are merged channel-by-channel over provider defaults, then over the built-in channel defaults. They should describe material behavior, not visual decoration. If the component introduces a visible material channel, expose a typed `lighting` prop for it.

Set `lighting={{ local: false }}` when a component should keep the shared scene angle even inside a provider with `localLighting` enabled.

## CSS Authoring

Use `useAnalogLighting` inside public components to resolve CSS variables for the channels you render. Route moving gradients, highlights, and shadows through those variables:

```tsx
const rootRef = React.useRef<HTMLDivElement>(null);
const lightingStyle = useAnalogLighting(['track', 'thumb'], lighting, {
  targetRef: rootRef,
});

return (
  <div
    ref={rootRef}
    style={{
      ...lightingStyle,
      background:
        'linear-gradient(var(--analog-light-angle-track, 180deg), var(--analog-surface-cavity), black)',
      boxShadow:
        'inset calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 2px rgba(255, 255, 255, calc(0.12 * var(--analog-light-power, 1)))',
    }}
  />
);
```

Pass `targetRef` when a public component should participate in provider-level `localLighting`. The hook still returns fallback CSS variables, so installed components render correctly when local lighting is disabled or no provider exists.

Use `useAnalogLightStyle` when a component needs a secondary light variable for a custom layer:

```tsx
const wheelFaceStyle = useAnalogLightStyle(
  'wheel',
  {
    varName: '--analog-light-angle-wheel-face',
    offset: 18,
    constraint: { anchor: 180, arc: 150, mode: 'fold' },
  },
  lighting?.wheel,
);
```

Use `useAnalogLightAngle` when an effect needs a numeric angle in JavaScript, such as placing a lens glint or computing a custom polar highlight.

## Lighting Rules

- Derive light-driven gradients from resolved channel variables such as `var(--analog-light-angle-track, 180deg)`.
- Scale highlight and shadow alpha with `calc(... * var(--analog-light-power, 1))`.
- Keep tracks, cavities, and recesses quieter than exposed hardware.
- Let panels move less than knobs, lamps, wheels, pointers, and thumbs.
- Let lenses and emissive elements react more eagerly than structural surfaces.
- Keep indicator emission centered. Move the lens glint, bezel, and recess reflections instead.
- Keep printed legends, ticks, numerals, and icons readable; avoid rotating dramatic lighting across text.
- Preserve shortest-path 360 degree rotation with no visible seam flip.
- Shape material feel with `travel`, `offset`, and constraints instead of per-material lag.
- Avoid hardcoded dynamic light angles in public components.
