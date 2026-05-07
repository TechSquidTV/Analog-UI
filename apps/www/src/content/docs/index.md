---
title: Get Started
description: Start with the docs structure, install flow, and component map before you drop Analog UI into a product surface.
section: introduction
order: 0
navTitle: Introduction
draft: false
---

Analog UI is a tactile component library and registry for building interfaces that feel machined, weighted, and reactive to light. The docs are organized in a familiar product shape: start here, move into install and theming guidance, then browse component pages and examples.

## How The Site Is Organized

There are five primary surfaces:

- **Docs** cover the install path, token model, registry flow, and per-component documentation.
- **Components** live under [`/docs/components`](/docs/components) as a hub plus one page per control.
- **Blocks** stay under [`/blocks`](/blocks) as the example surface, grouped by family.
- **Registry JSON** stays available under [`/r/registry.json`](/r/registry.json) and per-item files such as [`/r/dial.json`](/r/dial.json).
- **Preview routes** under `/view/*` isolate each block for focused testing, screenshots, and QA.

## Recommended Path

If you are evaluating the system for the first time, start here:

1. Read [Installation](/docs/getting-started) for package and registry usage.
2. Review [Tokens and Lighting](/docs/design/tokens-and-lighting) to understand the finish system.
3. Browse [All Components](/docs/components) to jump into a specific control.
4. Use [Blocks](/blocks) when you want the example-driven browsing surface.
5. Use [Registry](/docs/registry) when you need the install surface and dependency model.

## Design Intent

Analog UI follows a design direction we call **Studio Hyper-Skeuomorphism**. The goal is not nostalgia for its own sake. The goal is to give controls believable weight, clearer state, and a stronger sense of material response through:

- beveled recesses and chassis cavities
- constrained, material-aware lighting response
- restrained use of color for indicators, meters, and LCD accents
- typography that feels printed, engraved, or broadcast

## Current Surface Areas

The first website transition wave emphasizes these families:

- **Inputs:** dials, sliders, toggles, switches, and trim wheels
- **Readouts:** gauges, meters, and jewel indicators
- **Surfaces:** panels, button finishes, and reusable thumb hardware

That keeps the registry contract stable while the website grows into a more familiar docs-plus-examples product surface.
