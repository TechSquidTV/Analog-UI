---
title: Registry
description: The machine-readable install surface for Analog UI, including per-item JSON and the shared foundation layer.
section: reference
order: 40
draft: false
---

Analog UI publishes a shadcn-compatible registry document and per-item JSON files.

## Registry Endpoints

- [`/r/registry.json`](/r/registry.json) is the top-level registry index
- [`/r/analog-foundation.json`](/r/analog-foundation.json) provides the shared token and finish layer
- item files such as [`/r/dial.json`](/r/dial.json) or [`/r/panel.json`](/r/panel.json) install individual controls

## Install Pattern

The recommended install flow is:

```bash
pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/panel.json
```

Swap `panel.json` for whichever item you need next.

## Registry Families

The registry currently includes:

- **Style:** `analog-foundation`
- **Lib:** `utils`, `refs`, `angle-utils`, `wheel-interaction`
- **Hooks:** `use-analog-lighting`, `use-analog-material`, `use-mouse-lumination`, `use-wheel-scroll`
- **Components and UI:** dials, meters, switches, wheels, panels, buttons, toggles, and thumb surfaces

Controls that support inherited material finishes pull in `use-analog-material` automatically through their registry dependencies, so you only need to install it directly when composing your own subtree scopes.

## Local Build Source

This repo generates website registry artifacts from the package source with the package workspace script:

```bash
pnpm --filter analog-ui registry:build
```

That script updates the website copy under `/r/*` without changing the public registry schema.
