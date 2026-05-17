# Analog UI

Analog UI is a Studio Hyper-Skeuomorphic React component library for tactile
interfaces: machined panels, rotary controls, faders, switches, segmented
readouts, meters, analog lighting, and tone-driven indicators.

The library ships in two forms:

- package imports from `analog-ui`
- shadcn-compatible registry items from `/r/*`

## Install

Import the shared stylesheet before using package components:

```tsx
import 'analog-ui/styles.css';
import { Dial, Gauge, Panel } from 'analog-ui';
```

For editable source installs, add the foundation item before individual
controls:

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/dial.json
```

## Theme Model

Analog UI is built for Tailwind CSS v4 and the standard shadcn/tweakcn CSS
variable contract. App palettes should come from host tokens such as
`--background`, `--foreground`, `--card`, `--primary`, `--secondary`,
`--accent`, `--destructive`, `--border`, `--input`, `--ring`, and
`--chart-1` through `--chart-5`.

Analog-specific variables describe physical rendering on top of that palette:
material surfaces, bevels, shadows, lighting, display glass, and tone roles.
Override them directly when a product needs a different hardware finish.

```css
:root {
  --analog-tone-success: var(--chart-1);
  --analog-tone-warning: var(--chart-4);
  --analog-tone-info: var(--chart-2);
}
```

Components use a semantic `tone` prop for emitted or highlighted color:

```tsx
<Indicator isOn tone="success" />
<Gauge defaultValue={72} tone="warning" />
<Meter variant="display" tone="info" />
```

Material structure stays on component variants such as `chrome`, `black`, or
display style variants. Color roles stay on `tone`.

## Lighting

Controls render with fallback lighting on their own. Wrap a panel or dense
control bank in `AnalogLightingProvider` when controls should share a scene,
enable `localLighting` when pointer movement should react from each component's
on-screen center, and add `motionLighting` when mobile tilt should steer the
same light source:

```tsx
import * as React from 'react';
import { AnalogLightingProvider, Dial, Panel } from 'analog-ui';

export function ConsolePanel() {
  const panelRef = React.useRef<HTMLDivElement>(null);

  return (
    <AnalogLightingProvider
      baseAngle={180}
      power={1}
      localLighting={{ enabled: true, surfaceRef: panelRef }}
      motionLighting={{ enabled: true }}
    >
      <Panel ref={panelRef}>
        <Dial />
      </Panel>
    </AnalogLightingProvider>
  );
}
```

## Development

```bash
pnpm install
pnpm dev
pnpm --filter analog-ui typecheck
pnpm --filter analog-ui registry:build
pnpm --filter analog-ui-www build
```

Design guidance lives in [DESIGN.md](DESIGN.md). Component implementation rules
live in [.codex/skills/analog-ui-components/SKILL.md](.codex/skills/analog-ui-components/SKILL.md).
