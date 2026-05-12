---
title: Get Started
description: Studio Hyper-Skeuomorphic components for tactile React interfaces.
section: introduction
order: 0
navTitle: Introduction
draft: false
---

Studio Hyper-Skeuomorphic React components for tactile controls, machined panels, meters, and analog lighting. Built with Tailwind CSS and a shadcn-compatible registry.

## Start Here

| Page | Role |
| --- | --- |
| **[Installation](/docs/getting-started)** | Tailwind CSS and a shadcn-compatible registry. |
| **[Tokens](/docs/design/tokens)** | Host semantic tokens, Analog material tokens, Analog tone tokens, Analog optical slot tokens, and runtime lighting tokens. |
| **[Lighting](/docs/design/lighting)** | `baseAngle`, `sourceAngle`, and `power`. |
| **[All Components](/docs/components)** | Tactile controls, machined panels, meters, and analog lighting. |
| **[Registry](/docs/registry)** | Studio Hyper-Skeuomorphic as the category phrase in registry listings, site metadata, and short product descriptions. |
| **[FAQ](/docs/faq)** | Host semantic tokens, material recipes, and the shadcn-compatible registry. |

## Design Model

Analog UI uses **Studio Hyper-Skeuomorphism**: dark rack panels, machined knobs, dense cavities, foil reflections, and jewel-like indicators that feel lifted from studio hardware rather than flat app chrome. The interface should feel tactile, engineered, and premium, with physical mass implied through bevels, layered shadows, and material-specific lighting response.

| System | Language |
| --- | --- |
| **Typography** | Bold industrial sans for product voice, restrained body copy, and mono for telemetry. |
| **Layout** | Spacious at the page level and dense at the control level. |
| **Depth** | Bevel stacks, recesses, inner shadows, chamfers, foil glare, and machined extrusion. |
| **Color** | Deep neutrals and textured metals. Saturated color belongs almost exclusively to lit states, meter fills, display glass, and indicator optics. |
| **Labels** | Uppercase and spaced out to resemble panel print and console legends. |

## Component Families

| Family | Material Logic |
| --- | --- |
| **Inputs** | Buttons, dials, sliders, wheels, toggles, switches, meters, and panels should all expose the same material logic. |
| **Readouts** | Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`. |
| **Surfaces** | The rack face uses `panel`; screws and hardware use `screw`; mounted control caps still keep their own local channels instead of inheriting panel behavior. |
