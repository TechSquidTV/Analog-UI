---
version: alpha
name: Analog UI
description: Studio Hyper-Skeuomorphism for tactile control surfaces, machined hardware, and restrained console lighting.
colors:
  background: '#080808'
  panel: '#121212'
  surface: '#1A1A1A'
  surface-raised: '#2A2A2A'
  chrome-hi: '#E5E5E5'
  chrome-mid: '#B5B5B5'
  chrome-low: '#8A8A8A'
  black-hi: '#3A3A3A'
  black-mid: '#242424'
  black-low: '#151515'
  accent: '#5B5B5B'
  annotation: '#A0A0A0'
  legend: '#888888'
  telemetry-label: '#555555'
  telemetry-value: '#5B5B5B'
  tone-primary: '#D8D8D8'
  tone-secondary: '#5B5B5B'
  tone-accent: '#8C8C8C'
  tone-destructive: '#D44040'
  tone-success: '#5CA34D'
  tone-warning: '#D19324'
  tone-info: '#3B86E0'
  tone-neutral: '#F4F4F4'
typography:
  headline-display:
    fontFamily: Helvetica Neue
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Helvetica Neue
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Helvetica Neue
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Helvetica Neue
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Helvetica Neue
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Helvetica Neue
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Helvetica Neue
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.18em
  label-md:
    fontFamily: Helvetica Neue
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.3em
  label-sm:
    fontFamily: Helvetica Neue
    fontSize: 9px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.16em
  telemetry-data:
    fontFamily: ui-monospace
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.02em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  pill: 999px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  track-padding: 4px
  panel-padding: 48px
components:
  panel-rack:
    backgroundColor: '{colors.panel}'
    rounded: '{rounded.lg}'
    padding: '{spacing.panel-padding}'
  control-recess-pill:
    backgroundColor: '{colors.black-low}'
    rounded: '{rounded.pill}'
    padding: '{spacing.track-padding}'
  control-recess-rect:
    backgroundColor: '{colors.black-low}'
    rounded: '{rounded.md}'
    padding: '{spacing.track-padding}'
  dial-face:
    backgroundColor: '{colors.chrome-mid}'
    rounded: '{rounded.full}'
  dial-pointer:
    backgroundColor: '{colors.chrome-low}'
    rounded: '{rounded.full}'
  slider-thumb:
    backgroundColor: '{colors.chrome-mid}'
    rounded: '{rounded.sm}'
  toggle-rocker:
    backgroundColor: '{colors.chrome-mid}'
    rounded: '{rounded.sm}'
  switch-thumb:
    backgroundColor: '{colors.chrome-mid}'
    rounded: '{rounded.full}'
  wheel-cylinder:
    backgroundColor: '{colors.black-mid}'
    rounded: '{rounded.md}'
  indicator-primary:
    backgroundColor: '{colors.tone-primary}'
    rounded: '{rounded.full}'
  indicator-accent:
    backgroundColor: '{colors.tone-accent}'
    rounded: '{rounded.full}'
  indicator-success:
    backgroundColor: '{colors.tone-success}'
    rounded: '{rounded.full}'
  indicator-warning:
    backgroundColor: '{colors.tone-warning}'
    rounded: '{rounded.full}'
  indicator-info:
    backgroundColor: '{colors.tone-info}'
    rounded: '{rounded.full}'
---

# Analog UI

## Overview

Analog UI uses **Studio Hyper-Skeuomorphism**: dark rack panels, machined knobs, dense cavities, foil reflections, and jewel-like indicators that feel lifted from studio hardware rather than flat app chrome. The interface should feel tactile, engineered, and premium, with physical mass implied through bevels, layered shadows, and material-specific lighting response.

The brand voice is technical and cinematic rather than playful. Most of the screen should stay in deep neutrals and textured metals. Saturated color belongs almost exclusively to lit states, meter fills, display glass, and indicator optics.

## Colors

The palette is anchored in black chassis surfaces, gunmetal mid-tones, and bright chrome edges.

- **Background (`#080808`)** is the void behind the system.
- **Panel (`#121212`)** is the main rack face.
- **Surface and raised surface (`#1A1A1A`, `#2A2A2A`)** support cavities, housings, and control wells.
- **Chrome (`#E5E5E5`, `#B5B5B5`, `#8A8A8A`)** is reserved for machined faces, dials, and premium hardware.
- **Black material (`#3A3A3A`, `#242424`, `#151515`)** is for stealth variants and heavy-duty controls.
- **Annotation and legend grays** stay split by role: `legend` for printed markings, `annotation` for supporting copy, `telemetry-label` for scale ticks, and `telemetry-value` for live readouts.
- **Tone colors** should feel emissive and concentrated when they pass through optics, with brighter cores than housings.

## Token Architecture

Analog UI layers tactile hardware tokens on top of the host theme without inventing a competing app color system. The public contract is shadcn/tweakcn-compatible CSS variables plus a small Analog namespace for physical materials and optical tone roles.

- Use the standard shadcn and tweakcn semantic tokens as the source of truth for app chrome: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` through `chart-5`, and their foreground pairs.
- Add Analog UI material, finish, and optical tokens in the `analog` namespace so tactile recipes stay cohesive with the lighting API.
- Declare Analog defaults in `:root` and `.dark`, but express them directly through the public token contract. This is a breaking system: do not ship compatibility aliases, legacy physical hue names, or CSS fallback chains for removed tokens.
- Export `--color-analog-*` theme mappings only for canonical Analog tokens that should be addressable through Tailwind utilities.
- Keep non-color recipe tokens as plain CSS variables so they can drive gradients, bevels, texture, and lighting response without polluting Tailwind's utility namespace.

Recommended token tiers:

- **Host semantic tokens:** `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-*`.
- **Analog material tokens:** `--analog-surface-*`, `--analog-shadow-*`, `--analog-grain-*`, `--analog-track-*`, `--analog-bevel-*`.
- **Analog tone tokens:** `--analog-tone-primary`, `--analog-tone-secondary`, `--analog-tone-accent`, `--analog-tone-destructive`, `--analog-tone-success`, `--analog-tone-warning`, `--analog-tone-info`, `--analog-tone-neutral`, and `--analog-tone-chart-1` through `--analog-tone-chart-5`.
- **Analog optical slot tokens:** `--analog-tone-current`, `--analog-emissive-base`, `--analog-emissive-core`, `--analog-emissive-glow`, `--analog-emissive-surface`, `--analog-emissive-edge`, `--analog-display-fill`, `--analog-display-ink`, and `--analog-display-legend`.
- **Runtime lighting tokens:** `--analog-light-power` and `--analog-light-angle-*`.

Recommended naming rules:

- **Surfaces and materials:** `--analog-surface-cavity`, `--analog-surface-panel`, `--analog-surface-metal-hi`, `--analog-surface-onyx-lo`.
- **Component color control:** use a `tone` prop for color role. Keep `variant` for visual structure, material recipe, or interaction style.
- **Optical states:** components set `data-analog-tone="<tone>"` and read the optical slot tokens. They should not encode physical hue names in props or CSS variables.
- **Finish controls:** `--analog-shadow-depth`, `--analog-bevel-width`, `--analog-grain-opacity`, `--analog-foil-opacity`, `--analog-bloom-strength`.
- **Geometry and spacing:** `--analog-track-padding`.
- **Lighting defaults:** `--analog-light-source`.

Implementation rules:

- `@theme inline` should map host semantic tokens first, then canonical `--color-analog-*` mappings for current Analog tokens.
- `:root` and `.dark` should define Analog UI defaults so the package demo works out of the box, and those defaults must be expressed through semantic shadcn-compatible tokens.
- Component code should prefer `var(--analog-...)` tokens for material recipes and reserve literal color ramps for one-off prototypes only.
- Removed names are removed completely. Do not keep aliases for `lcd-*`, old physical hue names, or old zone color tokens.

### Component Tone API

Use `tone` when the consumer chooses a color role. This separates semantic color from visual construction:

- `variant` describes the component recipe, such as `chrome`, `black`, `metered`, or `display`.
- `tone` describes the role of the emitted or highlighted color, such as `primary`, `accent`, `success`, `warning`, `destructive`, or `chart-1`.
- `material` or existing finish props describe physical finish where needed.

Required public tone names:

- `primary`
- `secondary`
- `accent`
- `destructive`
- `success`
- `warning`
- `info`
- `neutral`
- `chart-1`
- `chart-2`
- `chart-3`
- `chart-4`
- `chart-5`

Consumer customization should happen by overriding CSS variables, either globally in `:root` / `.dark` or locally on a wrapper:

```css
.studio-critical {
  --analog-tone-accent: oklch(0.72 0.22 32);
  --analog-tone-success: oklch(0.78 0.18 142);
}
```

This keeps the library compatible with shadcn and tweakcn exports while giving Analog components their own tactile optical vocabulary.

## Typography

Typography should feel like a control room: bold industrial sans for product voice, restrained body copy, and mono for telemetry.

- **Headlines** are heavy, compact, and slightly tight-tracked. They should feel machined, not airy.
- **Body copy** stays calm and readable, using neutral gray rather than bright white.
- **Labels** are uppercase and spaced out to resemble panel print and console legends.
- **Telemetry** uses mono for values, scales, and technical readouts.

Avoid extra-light hero headings for core component presentation. The system reads best when major titles have clear weight and authority.

## Layout

The layout strategy is spacious at the page level and dense at the control level.

- Use an 4px / 8px micro-spacing rhythm for tracks, ridges, and bezel details.
- Use 24px to 48px padding for panels and showcase containers so the controls have room to breathe.
- Group related controls inside panels or equipment bays rather than floating them independently.
- Keep the visual center of each control unobstructed. Specs, labels, and helpers should orbit the control, not compete with it.

## Elevation & Depth

Depth is a first-class part of the identity. Hierarchy should come from bevel stacks, recesses, inner shadows, chamfers, foil glare, and machined extrusion rather than generic soft UI shadows.

Every lit finish should follow the analog lighting system. Surfaces should not share one universal response:

- tracks and recesses should move less,
- wheels should feel heavier but still responsive,
- panels should stay calmer than hardware,
- lenses and indicators can follow the light more eagerly.

### Lighting Model

Analog UI lighting is driven by three runtime inputs:

- `baseAngle` is the art-directed resting direction for the scene.
- `sourceAngle` is the live direction from the environment, cursor, or another interaction model.
- `power` scales highlight and shadow intensity without changing the geometric direction of the light.

Rules for moving light:

- Mouse-driven or pointer-driven lighting should orbit around the lit surface or panel center, not the viewport, unless the whole viewport is intentionally the lit surface.
- `influence` should only blend the live source back toward the base direction. At `1`, the light should track the live source directly with no hidden damping.
- If the pointer passes through the exact angular singularity at the center of a surface, prefer a tiny dead zone or a brief hold instead of easing the entire orbit.
- Per-material feel should come from `travel`, `offset`, and optional arc constraints rather than ad hoc lag.
- The lighting path must preserve shortest-path 360 degree rotation with no visible seam flip.

### Material Channels

Treat the material channels as the shared vocabulary for lit parts:

- `panel`: large chassis faces, rack plates, meter housings, and macro surfaces. Low travel, broad gradients, restrained highlights.
- `screw`: exposed fasteners and machined hardware accents. Sharper specular catches and tighter directional shadowing than the parent panel.
- `track`: recesses, rails, cavities, and slots. Minimal travel, darker occlusion, and slower-moving highlight bands.
- `wheel`: rotating drums, cylinders, and number wheels. Moderate travel, heavier shading, and directional glare that still feels massive.
- `bezel`: rings, trims, lamp bezels, and metal housings around optics. Crisp chrome or onyx edge light with stronger bevel response.
- `lens`: glass, jewels, indicator domes, and optical inserts. Highest travel, focused glints, and believable constrained reflections.
- `thumb`: handles, rockers, switch paddles, slider caps, and moving plungers. Strong response with clear highlight migration across the face and sidewalls.
- `pointer`: printed indicator lines, metal needles, and dial pointers. Direct response with the least ambiguity so directional readout stays legible.
- `surface`: general control faces, caps, and machined tops when no more specific channel exists. Medium-to-high travel with stable material identity.

### Lighting Composition Rules

- Move directional gradients, specular streaks, bevel catches, foil glare, and cast-shadow direction with the resolved material angle.
- Keep base pigment, cavity darkness, engraved geometry, and most ambient occlusion stable so the object still feels solid when the light moves.
- Printed legends, ticks, numerals, and icons should stay readable and mostly neutral. They can inherit subtle contrast from the host surface, but they should not rotate their own dramatic light gradients.
- Indicator emission stays centered in the optic. The lens glint, bezel, and recess reflections respond to the light; the emissive core should not appear to orbit around the housing.
- Separate nested materials instead of flattening them. A toggle can use `track` for the cavity, `thumb` for the rocker, and `lens` for the pilot light at the same time.
- Avoid one-off hover-light systems for a single component. If a surface needs a special optic, derive it from an existing material channel and a constrained effect angle.

### Mechanical Plunger Motion

For high-travel controls (buttons, toggles), prioritize **Isolated Displacement**:

- **Static Chassis**: The background cavity or track should remain perfectly stationary at `Z=0`.
- **Moving Plunger**: The entire control block—including face, text, and extrusion—should move as a single unit along the Z and Y axes.
- **Surface Recess**: When active, the face should physically sink below the panel surface (crossing into negative Z-space).
- **Perspective Tilt**: Use a moderate perspective tilt (e.g., 12-15 degrees) that levels out to zero when pressed to imply a mechanical seat.

## Shapes

The shape language mixes long pill recesses with compact machined rectangles and circular control faces.

- Use **pill-shaped recesses** for slider tracks and cylindrical travel slots.
- Use **rectangular recesses** for toggles, wheels, and equipment housings.
- Use **fully round** geometry for dials, switch thumbs, screws, and jewel lamps.
- Use **High-Travel Rectangles** for master-bus and power controls, utilizing deep extrusion (32+ layers) and clear physical displacement.
- Keep corners consistent within a control family. Hard-rect and pill geometry can coexist on a screen, but a single component should not drift between incompatible corner languages.

## Components

Buttons, dials, sliders, wheels, toggles, switches, meters, and panels should all expose the same material logic.

- **Anisotropic buttons and dials:** the main face uses `surface`; pointer lines, pips, or needles use `pointer`. Chamfers and knurled rims can stay on `surface` unless they need a distinctly heavier response.
- **Sliders:** the rail, recess, and dust slot use `track`; the handle, cap, and grip ridges use `thumb`. The cavity should stay visually seated while the thumb carries the more active highlights.
- **Toggle and switch controls:** the housing sits in `surface` or `track`; the moving paddle or rocker uses `thumb`; embedded lamps use `lens`. If there is a visible trim ring around the lamp, it should use `bezel`.
- **Wheels:** the background cavity uses `track`; the cylinder, printed drum surface, and any broad foil glare use `wheel`. Windows or trim around the wheel can stay calmer on `surface` or `bezel`.
- **Indicators:** bezels, lamp cups, and retaining rings use `bezel`; lit glass, jewels, and clear caps use `lens`. The glow itself is emissive and should not be treated as a separate directional material.
- **Meters and gauges:** housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`.
- **Panels:** the rack face uses `panel`; screws and hardware use `screw`; mounted control caps still keep their own local channels instead of inheriting panel behavior.

### Edge-Mounted Indicators

For precision toggles and latching buttons, place tone indicators in the **Top-Right corner**, potentially "breaking" the top boundary of the face to simulate a top-bevel mounting.

Implementation guidance:

- Public components should expose typed lighting props scoped to their visible materials.
- Internals should consume resolved per-material variables such as `--analog-light-angle-track`, `--analog-light-angle-wheel`, or `--analog-light-angle-panel`.
- New components should not read legacy pre-provider lighting variables directly.
- Material lighting should be numeric-first, with presets as named configuration options.
- Materials should react immediately; shape their response with `travel`, `offset`, and optional arc constraints instead of per-material easing lag.
- Mouse-driven light hooks should measure from the active surface bounds whenever a control lives inside a smaller lit panel.
- Use derived effect angles for special cases such as wheel glare or lens glints when an optic needs to stay within a believable visible arc.
- The lighting path must preserve smooth 360 degree rotation with no visible seam flip.

## Interaction Performance

Analog UI can afford rich gradients, bevels, foil, and glow, but the interaction path must stay local and cheap. Perceived lag usually comes from broad React churn or pointer-time layout work, not from one gradient by itself.

Rules for interactive controls and demos:

- Keep continuous motion state in the smallest subtree that actually needs it. Meter ballistics, scrub state, and other high-frequency updates should not live at the page or whole-surface level if only one panel is moving.
- For expensive showcase surfaces, let controls keep their own live drag state and only synchronize heavier outer state on commit when possible. Scrubbing should stay responsive even if labels, derived stats, or unrelated controls update later.
- Scope mouse or pointer lighting to the active surface, cache its bounds, and coalesce movement with `requestAnimationFrame`. Do not force fresh layout reads on every raw pointer event.
- Avoid “wake-up” React state flips just to start tracking the pointer. First-touch latency matters, especially for sliders, dials, and other scrub controls.
- Pause decorative animation and synthetic telemetry when a showcase is offscreen or otherwise inactive.
- Pre-promote heavily dragged or transformed parts such as slider thumbs when the visual treatment is dense enough to benefit from an isolated layer.

## Do's and Don'ts

- Do reserve saturated color for indicators, live signals, and status states.
- Do keep labels, legends, and telemetry visually distinct instead of collapsing them into one gray.
- Do make chrome, black plastic, lenses, and panels feel like different materials.
- Do keep track and wheel lighting independently tunable.
- Do isolate high-frequency interaction state from large showcase surfaces.
- Don't flatten tactile controls into generic gradients or single-shadow cards.
- Don't use soft pastel accents or bright page backgrounds.
- Don't introduce one-off lighting variables for special cases when a material channel already exists.
- Don't mix extra-light presentation typography with otherwise industrial component styling.
- Don't let pointer lighting or demo telemetry force whole-page rerenders during drag.
