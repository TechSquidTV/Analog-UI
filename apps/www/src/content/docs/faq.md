---
title: Frequently Asked Questions
description: Common answers about installing, theming, customizing, and composing Analog UI components.
section: reference
order: 50
navTitle: FAQ
draft: false
---

## What is Analog UI for?

Analog UI is for tactile React interfaces that should feel like hardware: rotary controls, faders, switches, indicators, meters, segmented displays, and rack-style panels. It works best in product surfaces where physical affordance helps people read state and manipulate values quickly.

## What is Studio Hyper-Skeuomorphism?

Studio Hyper-Skeuomorphism is a digital design language focused on making interfaces feel physically present, engineered, and instrument-like. It draws from recording studios, broadcast consoles, rack-mounted equipment, industrial controls, lab instruments, and high-end audio hardware rather than everyday objects or nostalgic desktop metaphors.

Its visuals emphasize dark chassis surfaces, machined metal, inset cavities, bevelled edges, weighted switches, rotary controls, engraved or printed legends, optical glass, segmented displays, meters, jewel-like lamps, foil reflections, and directional material lighting. Color is usually restrained and functional, appearing as emitted light, warning states, measured ranges, display glass, or active feedback.

Unlike classic skeuomorphism, Studio Hyper-Skeuomorphism does not ask a digital control to become a literal real-world object. It treats precision hardware as a visual grammar. Inset wells suggest range and constraint. Bevels suggest pressability and mass. Ticks, legends, needles, meters, lamps, and segmented displays make state readable at a glance. Shadows and reflected light describe structure instead of sitting on top as decoration.

Key principles include:

- affordance before metaphor
- material hierarchy before ornament
- instrument density before empty spaciousness
- neutral chassis surfaces with concentrated signal color
- lighting, shadow, and bevels as structural information
- printed legends, ticks, tracks, lamps, and readouts as part of the interface language

## Is Analog UI a full app theme?

No. Analog UI is a component and material system that sits on top of your app theme. Your host theme keeps ownership of the semantic palette, typography baseline, and layout decisions. Analog UI adds the hardware layer: surfaces, bevels, glass, tone roles, lighting, and control recipes.

## Should I use the package or the registry?

Use the package when you want the fastest path to a consistent component set:

```tsx
import 'analog-ui/styles.css';
import { Dial, Panel, Meter } from 'analog-ui';
```

Use the registry when you want editable source copied into your project:

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/dial.json
```

Both paths use the same design model. The main difference is whether the component source stays in the package or becomes part of your app.

## What should I install first?

For package usage, import `analog-ui/styles.css` before rendering Analog UI components. For registry usage, install `analog-foundation` before installing individual controls. The foundation supplies the shared material tokens, lighting variables, tone roles, and tactile recipes that the controls expect.

## Which styling setup does Analog UI expect?

Analog UI is designed for Tailwind CSS v4 and the standard shadcn/tweakcn semantic token contract. It expects host tokens such as `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--border`, `--ring`, `--radius`, `--font-mono`, and `--chart-1` through `--chart-5`.

See [Tokens](/docs/design/tokens) for the full theme contract.

## How do I change component colors?

Keep structural material choices on component variants such as `chrome` or `black`. Use `tone` props for emitted, active, measured, or status color:

```tsx
<Indicator isOn tone="success" />
<Gauge defaultValue={72} tone="warning" />
<Meter variant="display" tone="info" />
```

Then remap tone variables in CSS when your product palette needs a different result:

```css
:root {
  --analog-tone-success: var(--chart-1);
  --analog-tone-warning: var(--chart-4);
  --analog-tone-info: var(--chart-2);
}
```

## Do I need an `AnalogLightingProvider`?

Individual controls include fallback lighting values, so they can render on their own. Use `AnalogLightingProvider` when controls should share one light direction across a panel, rack, or dense control bank. Pair it with `usePointerLighting` when the light should respond to pointer movement over a surface.

See [Lighting](/docs/design/lighting) for setup examples.

## Can I mix Analog UI with regular shadcn/ui components?

Yes. Analog UI is meant to live beside ordinary application UI. Use tactile controls where physical weight helps the interaction, then keep tables, forms, menus, dialogs, and navigation in the quieter component language your app already uses.

## Can I customize the source?

Yes. Registry installs copy editable components into your project, which is the best path for deep structural customization. Package usage is better for stable imports, but you can still adjust the look through CSS variables, theme tokens, `tone` props, material variants, and lighting props.

## Where do I find component examples?

Start with [All Components](/docs/components) for the docs index, then open an individual component page for install commands, usage snippets, live previews, and prop references. The `/view/*` routes, such as [Dial preview](/view/dial), show isolated component demos.
