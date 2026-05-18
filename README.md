# Analog UI

[![CI](https://img.shields.io/github/actions/workflow/status/TechSquidTV/Analog-UI/ci.yml?branch=main&label=CI)](https://github.com/TechSquidTV/Analog-UI/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/analog-ui?label=npm)](https://www.npmjs.com/package/analog-ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)](https://tailwindcss.com)
[![shadcn registry](https://img.shields.io/badge/shadcn-registry-111111)](https://analogui.com/docs/registry)

Studio Hyper-Skeuomorphic React components for tactile controls with immersive lighting.

![Analog UI component preview](https://analogui.com/img/readme/analog-ui-preview.png)

Analog UI ships as both a package and a shadcn-compatible registry. The docs are
the source of truth for installation, theming, lighting, composition, and
component APIs.

## Docs

- [Documentation](https://analogui.com/docs)
- [Installation](https://analogui.com/docs/getting-started)
- [All Components](https://analogui.com/docs/components)
- [Registry](https://analogui.com/docs/registry)
- [Tokens](https://analogui.com/docs/design/tokens)
- [Lighting](https://analogui.com/docs/design/lighting)

## Quick Start

```tsx
import 'analog-ui/styles.css';
import { Dial, Gauge, Panel } from 'analog-ui';
```

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/dial.json
```

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

For contributor-facing design and composition rules, see
[DESIGN.md](DESIGN.md) and
[.codex/skills/analog-ui-components/SKILL.md](.codex/skills/analog-ui-components/SKILL.md).
