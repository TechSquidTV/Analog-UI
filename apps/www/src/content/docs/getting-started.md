---
title: Installation
description: Install Analog UI from the package or shadcn registry, then wire the shared analog foundation into your app.
section: getting-started
order: 10
navTitle: Installation
draft: false
---

Analog UI can be consumed in two ways:

- as a package import for direct component usage
- as shadcn-compatible registry items that copy editable source into your project

## Package Usage

Import the shared stylesheet first so the analog tokens, materials, and lighting defaults are available:

```tsx
import 'analog-ui/styles.css';
import { Dial, Gauge, Panel } from 'analog-ui';
```

That path is best when you want the library as a cohesive dependency and you are comfortable shipping its exported styles directly.

## Registry Usage

The registry output lives under `/r/*`. Install the foundation item before individual controls so the material tokens and lighting variables are present:

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/dial.json
```

Repeat the second command for any other item, such as `slider`, `meter`, or `panel`.

## Choosing Between the Two

- Pick the **package** when you want the fastest path to a consistent tactile interface.
- Pick the **registry** when you want ownership of the installed source files and shadcn-style local customization.

## Tailwind and Theme Assumptions

Analog UI is designed for Tailwind CSS v4 and the standard shadcn/tweakcn semantic token contract. The component recipes expect your host theme to define:

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
- `--radius`, `--font-mono`

The Analog foundation maps those values into material surfaces, display glass, meter zones, and semantic tone roles. Components that emit or highlight color expose a `tone` prop, so product color changes happen through tokens:

```css
:root {
  --analog-tone-success: var(--chart-1);
  --analog-tone-warning: var(--chart-4);
  --analog-tone-info: var(--chart-2);
}
```

```tsx
<Indicator isOn tone="success" />
<Gauge defaultValue={72} tone="warning" />
<Meter variant="display" tone="info" />
```

## First Controls To Try

These components give a good feel for the system quickly:

- [Dial preview](/view/dial)
- [Slider preview](/view/slider)
- [Meter preview](/view/meter)
- [Panel preview](/view/panel)
