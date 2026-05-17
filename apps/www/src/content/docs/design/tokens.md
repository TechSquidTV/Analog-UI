---
title: Tokens
description: How Analog UI layers host theme tokens, material recipes, and finish variables without taking over your app palette.
section: design
order: 20
navTitle: Tokens
draft: false
---

Analog UI gets its physical weight from layered CSS variables. Your app keeps control of the core theme, while Analog UI adds material recipes for chassis surfaces, metal, glass, tone-driven indicators, display glass, shadows, bevels, and texture.

## Theme Contract

Analog UI is designed for Tailwind CSS v4 and the standard shadcn/tweakcn semantic token contract. It works best when your app defines these host values:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`
- `--radius`
- `--font-mono`

Analog UI defines canonical defaults for these tokens in its theme entry. In app code, host shadcn or tweakcn variables are the source of truth. A tweakcn export that declares `:root`, `.dark`, and `@theme inline` color mappings can sit underneath Analog UI without adding an Analog-specific palette first.

## Token Tiers

Think in three layers when you theme the system:

- **Host semantic tokens** define the product palette and typography baseline.
- **Analog material tokens** turn that palette into tactile surfaces, metal, onyx, and glass recipes.
- **Analog tone tokens** map semantic color roles into emissive indicators, displays, and measured ranges.
- **Analog recipe tokens** control geometry, finish intensity, grain, bloom, bevel depth, and other physical details.

Runtime lighting variables such as `--analog-light-angle-*`, `--analog-light-power`, and `--analog-local-light-strength` are covered in [Lighting](/docs/design/lighting). Treat them as live rendering state, not static theme tokens.

## Material Tokens

The surface ramp provides the neutral hardware vocabulary:

- `--analog-surface-cavity` and `--analog-surface-cavity-strong` for wells, recesses, slots, and tracks.
- `--analog-surface-panel` and `--analog-surface-raised` for rack faces, containers, and raised housings.
- `--analog-surface-metal-hi`, `--analog-surface-metal-mid`, and `--analog-surface-metal-lo` for chrome hardware.
- `--analog-surface-onyx-hi`, `--analog-surface-onyx-mid`, and `--analog-surface-onyx-lo` for black hardware.

The public `chrome` variant resolves through the metal ramp. The public `black` variant resolves through the onyx ramp. They are material finishes, not separate app themes.

## Tone Tokens

Saturated color should mostly appear when something emits light, reports state, or marks a measured range.

- `--analog-tone-primary`, `--analog-tone-secondary`, `--analog-tone-accent`, and `--analog-tone-destructive` derive from shadcn semantic tokens.
- `--analog-tone-success`, `--analog-tone-warning`, `--analog-tone-info`, and `--analog-tone-neutral` provide app-level state roles for controls that need more than the base shadcn set.
- `--analog-tone-chart-1` through `--analog-tone-chart-5` mirror the shadcn chart tokens for dense telemetry and range displays.
- `--analog-tone-current` is set by `data-analog-tone` on each component instance.

Components expose `tone` props instead of physical hue props. Use `tone="success"`, `tone="warning"`, `tone="info"`, or another semantic role; override the corresponding CSS variable when a product theme needs different color.

```tsx
<Indicator isOn tone="success" />
<Gauge defaultValue={72} tone="warning" />
<Meter variant="display" tone="info" />
```

```css
:root {
  --analog-tone-success: var(--chart-1);
  --analog-tone-warning: var(--chart-4);
  --analog-tone-info: var(--chart-2);
}
```

## Optical Slots

Tone values feed optical slots that describe how color becomes hardware:

- `--analog-emissive-base`, `--analog-emissive-core`, `--analog-emissive-glow`, `--analog-emissive-surface`, and `--analog-emissive-edge` define indicator bodies, bright cores, glow, surfaces, and edges.
- `--analog-display-glow`, `--analog-display-fill`, `--analog-display-ink`, and `--analog-display-legend` define display glass, text, and legend treatment.
- `--analog-meter-zone-success`, `--analog-meter-zone-warning`, `--analog-meter-zone-destructive`, and their `*-glow` companions define range-meter colors.
- `--analog-meter-peak-marker` defines peak indicators.

Keep most of the interface in neutral materials. Let indicators, display arcs, active states, and meters carry color.

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

Analog UI keeps most finish controls as plain CSS variables. Export `--color-analog-*` mappings only when you want a token to be available as a Tailwind color utility.

For component styling, prefer `var(--analog-...)` tokens for material recipes. Reserve literal color ramps for one-off prototypes or small internal details that are not part of the public system.

## Extension Checklist

- Derive new surface colors from host semantic tokens when possible.
- Add material and finish values under the `--analog-*` namespace.
- Keep geometry and finish controls as CSS variables unless they need Tailwind color utilities.
- Use tone tokens and optical slots only for active, emissive, or measured states.
- Keep `chrome` and `black` as material variants that can sit inside any compatible app theme.
