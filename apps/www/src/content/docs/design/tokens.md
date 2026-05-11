---
title: Tokens
description: How Analog UI layers host theme tokens, material recipes, and finish variables without taking over your app palette.
section: design
order: 20
navTitle: Tokens
draft: false
---

Analog UI gets its physical weight from layered CSS variables. Your app keeps control of the core theme, while Analog UI adds material recipes for chassis surfaces, metal, glass, LEDs, LCDs, shadows, bevels, and texture.

## Theme Contract

Analog UI is designed for Tailwind CSS v4 and shadcn-compatible semantic tokens. It works best when your app defines these host values:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--secondary`, `--accent`
- `--muted-foreground`
- `--border`, `--ring`
- `--radius`
- `--font-mono`

Analog UI ships fallback values so components can render on their own, but host tokens make the controls feel native to your product theme.

## Token Tiers

Think in three layers when you theme the system:

- **Host semantic tokens** define the product palette and typography baseline.
- **Analog material tokens** turn that palette into tactile surfaces, metal, onyx, glass, LED, LCD, and meter recipes.
- **Analog recipe tokens** control geometry, finish intensity, grain, bloom, bevel depth, and other physical details.

Runtime lighting variables such as `--analog-light-angle-*` and `--analog-light-power` are covered in [Lighting](/docs/design/lighting). Treat them as live rendering state, not static theme tokens.

## Material Tokens

The surface ramp provides the neutral hardware vocabulary:

- `--analog-surface-cavity` and `--analog-surface-cavity-strong` for wells, recesses, slots, and tracks.
- `--analog-surface-panel` and `--analog-surface-raised` for rack faces, containers, and raised housings.
- `--analog-surface-metal-hi`, `--analog-surface-metal-mid`, and `--analog-surface-metal-lo` for chrome hardware.
- `--analog-surface-onyx-hi`, `--analog-surface-onyx-mid`, and `--analog-surface-onyx-lo` for black hardware.

The public `chrome` variant resolves through the metal ramp. The public `black` variant resolves through the onyx ramp. They are material finishes, not separate app themes.

## Emissive Tokens

Saturated color should mostly appear when something emits light, reports state, or marks a measured range.

- `--analog-led-red-*`, `--analog-led-amber-*`, `--analog-led-green-*`, `--analog-led-blue-*`, and `--analog-led-white-*` define lamp bodies, bright cores, glow, surfaces, and edges.
- `--analog-lcd-green-*`, `--analog-lcd-amber-*`, and `--analog-lcd-blue-*` define display fill, ink, legend, and glow.
- `--analog-meter-zone-*` and `--analog-meter-peak-marker` define meter ranges and peak indicators.

Keep most of the interface in neutral materials. Let LEDs, LCD arcs, active states, and meters carry color.

## Recipe Tokens

Recipe tokens tune how the hardware feels without changing the product palette:

- `--analog-shadow-depth`
- `--analog-bevel-width`
- `--analog-grain-opacity`
- `--analog-foil-opacity`
- `--analog-bloom-strength`
- `--analog-track-padding`
- `--analog-radius-*`

Use these when you need a denser rack surface, quieter bloom, sharper bevels, or tighter control geometry.

## Override Scope

Set broad defaults at the theme level:

```css
:root {
  --analog-bloom-strength: 0.64;
  --analog-grain-opacity: 0.3;
}

.dark {
  --analog-shadow-depth: 1.05;
  --analog-foil-opacity: 0.22;
}
```

Use local scopes when one panel needs a different finish density:

```css
.mastering-panel {
  --analog-surface-panel: color-mix(in oklch, var(--card) 78%, black);
  --analog-track-padding: calc(var(--spacing) * 1.25);
  --analog-bloom-strength: 0.55;
}
```

Avoid setting `--analog-light-angle-*` globally unless you are intentionally replacing the runtime lighting model for a static surface.

## Tailwind Utilities

Analog UI keeps most finish controls as plain CSS variables. Export `--color-analog-*` aliases only when you want a token to be available as a Tailwind color utility.

For component styling, prefer `var(--analog-...)` tokens for material recipes. Reserve literal color ramps for one-off prototypes or small internal details that are not part of the public system.

## Extension Checklist

- Derive new surface colors from host semantic tokens when possible.
- Add material and finish values under the `--analog-*` namespace.
- Keep geometry and finish controls as CSS variables unless they need Tailwind color utilities.
- Use LED and LCD tokens only for active, emissive, or measured states.
- Keep `chrome` and `black` as material variants that can sit inside any compatible app theme.
