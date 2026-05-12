---
title: Components
description: Studio Hyper-Skeuomorphic React components for tactile controls and analog lighting.
section: reference
order: 30
navTitle: All Components
draft: false
---

Studio Hyper-Skeuomorphic React components for tactile controls, machined panels, meters, and analog lighting. Built with Tailwind CSS and a shadcn-compatible registry.

## Inputs

| Component | Material Logic |
| --- | --- |
| **[Dial](/docs/components/dial)** | The main face uses `surface`; pointer lines, pips, or needles use `pointer`. |
| **[Slider](/docs/components/slider)** | The rail, recess, and dust slot use `track`; the handle, cap, and grip ridges use `thumb`. |
| **[Toggle](/docs/components/toggle)** | The housing sits in `surface` or `track`; the moving paddle or rocker uses `thumb`; embedded lamps use `lens`. |
| **[Rocker Switch Group](/docs/components/rocker-switch-group)** | Group related controls inside panels or equipment bays rather than floating them independently. |
| **[Push Button](/docs/components/push-button)** | Static Chassis, Moving Plunger, Surface Recess, and Perspective Tilt. |
| **[Push Toggle](/docs/components/push-toggle)** | For precision toggles and latching buttons, place tone indicators in the Top-Right corner. |
| **[Toggle Button Group](/docs/components/toggle-button-group)** | Group related controls inside panels or equipment bays rather than floating them independently. |
| **[Switch](/docs/components/switch)** | The housing sits in `surface` or `track`; the moving paddle or rocker uses `thumb`; embedded lamps use `lens`. |
| **[Wheel Select](/docs/components/wheel-select)** | The background cavity uses `track`; the cylinder, printed drum surface, and any broad foil glare use `wheel`. |
| **[Wheel Number](/docs/components/wheel-number)** | The background cavity uses `track`; the cylinder, printed drum surface, and any broad foil glare use `wheel`. |

## Readouts

| Component | Material Logic |
| --- | --- |
| **[Gauge](/docs/components/gauge)** | Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`. |
| **[LCD Display](/docs/components/lcd-display)** | Segmented readouts, display glass, and mono for telemetry. |
| **[Needle Gauge](/docs/components/needle-gauge)** | Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`. |
| **[Meter](/docs/components/meter)** | Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`. |
| **[Indicator](/docs/components/indicator)** | Bezels, lamp cups, and retaining rings use `bezel`; lit glass, jewels, and clear caps use `lens`. |

## Surfaces

| Component | Material Logic |
| --- | --- |
| **[Panel](/docs/components/panel)** | The rack face uses `panel`; screws and hardware use `screw`; mounted control caps still keep their own local channels instead of inheriting panel behavior. |
| **[Rocker Thumb Surface](/docs/components/rocker-thumb-surface)** | Handles, rockers, switch paddles, slider caps, and moving plungers. |

## Examples And Install Commands

| Route | Role |
| --- | --- |
| **[`/docs/components/dial`](/docs/components/dial)** | Core component presentation. |
| **[`/view/dial`](/view/dial)** | Showcase surfaces. |
| **[`/docs/registry`](/docs/registry)** | shadcn-compatible registry. |
