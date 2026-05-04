---
title: Tokens and Lighting
description: The material system, semantic token layering, and lighting rules that make Analog UI feel tactile.
section: design
order: 20
draft: false
---

Analog UI is built around a layered token model instead of isolated one-off gradients. The visual system starts with host semantic colors, adds analog material tokens, and then resolves runtime lighting variables on top.

## Token Tiers

Use three tiers of values when extending or integrating the system:

- **Host semantic tokens:** `background`, `foreground`, `card`, `secondary`, `accent`, `border`, and related foreground pairs
- **Analog design tokens:** `--analog-surface-*`, `--analog-led-*`, `--analog-shadow-*`, `--analog-grain-*`, and `--analog-bevel-*`
- **Runtime lighting tokens:** `--analog-light-angle-*` and `--analog-light-power`

This layering keeps Analog UI compatible with the host theme instead of replacing it wholesale.

## Material Families

The default design language uses a few consistent material channels:

- **Cavity and panel surfaces** for housings, recesses, and rack faces
- **Metal channels** for machined hardware such as dials and bezels
- **Onyx channels** for black variants and stealth finishes
- **LED channels** for concentrated emissive states

The system is intentionally neutral until something is lit.

## Lighting Rules

Light response is a first-class part of the product language. Components should not hardcode a single global gradient direction. Instead, they should read the resolved per-material angles exposed by the lighting provider.

Important rules:

- tracks and recesses should move less than exposed hardware
- panels should stay calmer than knobs, lamps, and wheels
- emissive elements can react more eagerly than structural surfaces
- alpha and shadow intensity should scale with `--analog-light-power`

## Surface Behavior

Analog UI should feel machined, not soft:

- Use bevels, chamfers, and inset stacks before generic drop shadows.
- Prefer layered materials over flat fills.
- Reserve saturated color for indicators, meters, LCD arcs, and active states.
- Keep typography technical and broadcast-like rather than playful.

## Extension Guidance

When adding new controls, match the existing physical grammar:

- long pill recesses for travel slots
- compact rectangles for housings
- circular faces for knobs, screws, and lamps
- mono telemetry and uppercase labels for instrumentation

The broader design reference for these decisions is preserved in [`DESIGN.md`](https://github.com/techsquidtv/analog-ui/blob/main/DESIGN.md).
