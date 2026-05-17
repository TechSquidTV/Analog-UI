---
title: Registry
description: Install editable Analog UI source files with the shadcn CLI.
section: reference
order: 40
draft: false
---

Analog UI publishes shadcn-compatible registry files for the shared foundation, installable controls, and reusable Analog UI parts.

## Registry Files

- [`/r/registry.json`](/r/registry.json) lists every installable item
- [`/r/analog-foundation.json`](/r/analog-foundation.json) provides the shared token and finish layer
- [`/r/analog-tone.json`](/r/analog-tone.json) provides the shared semantic tone type
- item files such as [`/r/dial.json`](/r/dial.json), [`/r/panel.json`](/r/panel.json), or [`/r/rocker-thumb-surface.json`](/r/rocker-thumb-surface.json) install individual controls or reusable parts

## Install Pattern

The recommended install flow is:

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/panel.json
```

Swap `panel.json` for whichever item you need next.

## Registry Families

The registry includes:

- **Style:** `analog-foundation`
- **Lib:** `utils`, `refs`, `angle-utils`, `wheel-interaction`
- **Hooks:** `use-analog-lighting`, `analog-material-scope`, `use-pointer-lighting`, `use-wheel-input`
- **Component helpers:** `analog-tone`
- **Controls and reusable UI parts:** dials, meters, switches, wheels, panels, buttons, toggles, indicators, readouts, and thumb surfaces

Controls that support inherited material finishes pull in `analog-material-scope` automatically through their registry dependencies, so you only need to install it directly when composing your own subtree scopes.

Controls that expose `tone` pull in `analog-tone` automatically. Install it directly only when you are composing your own component around the same semantic color roles.

Controls that participate in provider-level `localLighting` or `motionLighting` pull in `use-analog-lighting` through their registry dependencies. Install that hook directly only when you are authoring a custom component that should register its own local lighting target or motion-lit surface.
