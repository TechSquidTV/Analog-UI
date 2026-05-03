---
version: alpha
name: Analog UI
description: Studio Hyper-Skeuomorphism for tactile control surfaces, machined hardware, and restrained console lighting.
colors:
  background: "#080808"
  panel: "#121212"
  surface: "#1A1A1A"
  surface-raised: "#2A2A2A"
  chrome-hi: "#E5E5E5"
  chrome-mid: "#B5B5B5"
  chrome-low: "#8A8A8A"
  black-hi: "#3A3A3A"
  black-mid: "#242424"
  black-low: "#151515"
  accent: "#5B5B5B"
  annotation: "#A0A0A0"
  legend: "#888888"
  telemetry-label: "#555555"
  telemetry-value: "#5B5B5B"
  led-red: "#D44040"
  led-red-core: "#FC8888"
  led-amber: "#D19324"
  led-amber-core: "#FCEFC7"
  led-green: "#5CA34D"
  led-green-core: "#BDF2C3"
  led-blue: "#3B86E0"
  led-blue-core: "#C5E2FF"
  led-white: "#F4F4F4"
  led-white-core: "#FFFFFF"
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
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel-padding}"
  control-recess-pill:
    backgroundColor: "{colors.black-low}"
    rounded: "{rounded.pill}"
    padding: "{spacing.track-padding}"
  control-recess-rect:
    backgroundColor: "{colors.black-low}"
    rounded: "{rounded.md}"
    padding: "{spacing.track-padding}"
  dial-face:
    backgroundColor: "{colors.chrome-mid}"
    rounded: "{rounded.full}"
  dial-pointer:
    backgroundColor: "{colors.chrome-low}"
    rounded: "{rounded.full}"
  slider-thumb:
    backgroundColor: "{colors.chrome-mid}"
    rounded: "{rounded.sm}"
  toggle-rocker:
    backgroundColor: "{colors.chrome-mid}"
    rounded: "{rounded.sm}"
  switch-thumb:
    backgroundColor: "{colors.chrome-mid}"
    rounded: "{rounded.full}"
  wheel-cylinder:
    backgroundColor: "{colors.black-mid}"
    rounded: "{rounded.md}"
  indicator-red:
    backgroundColor: "{colors.led-red}"
    rounded: "{rounded.full}"
  indicator-amber:
    backgroundColor: "{colors.led-amber}"
    rounded: "{rounded.full}"
  indicator-green:
    backgroundColor: "{colors.led-green}"
    rounded: "{rounded.full}"
  indicator-blue:
    backgroundColor: "{colors.led-blue}"
    rounded: "{rounded.full}"
  indicator-white:
    backgroundColor: "{colors.led-white}"
    rounded: "{rounded.full}"
---

# Analog UI

## Overview

Analog UI uses **Studio Hyper-Skeuomorphism**: dark rack panels, machined knobs, dense cavities, foil reflections, and jewel-like indicators that feel lifted from studio hardware rather than flat app chrome. The interface should feel tactile, engineered, and premium, with physical mass implied through bevels, layered shadows, and material-specific lighting response.

The brand voice is technical and cinematic rather than playful. Most of the screen should stay in deep neutrals and textured metals. Saturated color belongs almost exclusively to lit states, meter fills, and LED indicators.

## Colors

The palette is anchored in black chassis surfaces, gunmetal mid-tones, and bright chrome edges.

- **Background (`#080808`)** is the void behind the system.
- **Panel (`#121212`)** is the main rack face.
- **Surface and raised surface (`#1A1A1A`, `#2A2A2A`)** support cavities, housings, and control wells.
- **Chrome (`#E5E5E5`, `#B5B5B5`, `#8A8A8A`)** is reserved for machined faces, dials, and premium hardware.
- **Black material (`#3A3A3A`, `#242424`, `#151515`)** is for stealth variants and heavy-duty controls.
- **Annotation and legend grays** stay split by role: `legend` for printed markings, `annotation` for supporting copy, `telemetry-label` for scale ticks, and `telemetry-value` for live readouts.
- **LED colors** should feel emissive and concentrated, with brighter cores than housings.

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

## Shapes

The shape language mixes long pill recesses with compact machined rectangles and circular control faces.

- Use **pill-shaped recesses** for slider tracks and cylindrical travel slots.
- Use **rectangular recesses** for toggles, wheels, and equipment housings.
- Use **fully round** geometry for dials, switch thumbs, screws, and jewel lamps.
- Keep corners consistent within a control family. Hard-rect and pill geometry can coexist on a screen, but a single component should not drift between incompatible corner languages.

## Components

Buttons, dials, sliders, wheels, toggles, switches, meters, and panels should all expose the same material logic.

- **Anisotropic buttons and dials:** the main face uses the `surface` channel; pointer lines use `pointer`.
- **Sliders:** the rail and recess use `track`; the handle and ridges use `thumb`.
- **Toggle and switch controls:** the housing sits in `surface` or `track`; the moving part uses `thumb`; embedded lamps use `lens`.
- **Wheels:** the background cavity uses `track`; the cylinder and overlay glare use `wheel`.
- **Indicators:** bezels use `bezel`; lit glass uses `lens`.
- **Panels:** the rack face uses `panel`; screws and hardware use `screw`.

Implementation guidance:

- Public components should expose typed lighting props scoped to their visible materials.
- Internals should consume resolved per-material variables such as `--analog-light-angle-track`, `--analog-light-angle-wheel`, or `--analog-light-angle-panel`.
- New components should not read legacy pre-provider lighting variables directly.
- Material lighting should be numeric-first, with presets as convenience aliases.
- Materials should react immediately; shape their response with `travel`, `offset`, and optional arc constraints instead of per-material easing lag.
- Use derived effect angles for special cases such as wheel glare or lens glints when an optic needs to stay within a believable visible arc.
- The lighting path must preserve smooth 360 degree rotation with no visible seam flip.

## Do's and Don'ts

- Do reserve saturated color for LEDs, live signals, and status states.
- Do keep labels, legends, and telemetry visually distinct instead of collapsing them into one gray.
- Do make chrome, black plastic, lenses, and panels feel like different materials.
- Do keep track and wheel lighting independently tunable.
- Don't flatten tactile controls into generic gradients or single-shadow cards.
- Don't use soft pastel accents or bright page backgrounds.
- Don't introduce one-off lighting variables for special cases when a material channel already exists.
- Don't mix extra-light presentation typography with otherwise industrial component styling.
