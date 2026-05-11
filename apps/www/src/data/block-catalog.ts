export const blockCategories = {
  inputs: {
    label: 'Inputs',
  },
  readouts: {
    label: 'Readouts',
  },
  surfaces: {
    label: 'Surfaces',
  },
} as const;

export type BlockCategory = keyof typeof blockCategories;

interface BlockCatalogItem {
  name: string;
  category: BlockCategory;
  order: number;
  summary: string;
}

export const blockCatalog = {
  dial: {
    name: 'dial',
    category: 'inputs',
    order: 10,
    summary: 'A potentiometer-style knob with foil sheen, hard shadows, and precise rotary travel.',
  },
  slider: {
    name: 'slider',
    category: 'inputs',
    order: 20,
    summary: 'A long-throw fader with recessed travel, tactile ridges, and strong thumb presence.',
  },
  toggle: {
    name: 'toggle',
    category: 'inputs',
    order: 30,
    summary: 'A heavy-duty rocker with optional LED states and enough depth to feel mechanical.',
  },
  'rocker-switch-group': {
    name: 'rocker-switch-group',
    category: 'inputs',
    order: 32,
    summary: 'A recessed switch bank for arranging rocker toggles with shared lighting.',
  },
  'square-button': {
    name: 'square-button',
    category: 'inputs',
    order: 35,
    summary:
      'A 3D plunger-style button with deep travel, machined edges, and dense square hardware.',
  },
  'square-toggle': {
    name: 'square-toggle',
    category: 'inputs',
    order: 36,
    summary: 'A latching square toggle that pairs plunger depth with compact LED state feedback.',
  },
  'toggle-button-group': {
    name: 'toggle-button-group',
    category: 'inputs',
    order: 37,
    summary: 'A selection group of square plunger toggle buttons with active LED feedback.',
  },
  switch: {
    name: 'switch',
    category: 'inputs',
    order: 40,
    summary:
      'A cylindrical track switch that rolls through a deep cavity rather than snapping flat.',
  },
  'wheel-select': {
    name: 'wheel-select',
    category: 'inputs',
    order: 50,
    summary: 'A stepped trim wheel for option selection with drag, wheel, and keyboard travel.',
  },
  'wheel-number': {
    name: 'wheel-number',
    category: 'inputs',
    order: 60,
    summary: 'A continuous numeric wheel for fine scrubbing and repeatable adjustments.',
  },
  gauge: {
    name: 'gauge',
    category: 'readouts',
    order: 70,
    summary: 'A circular monitor that layers LCD arc feedback over a machined control face.',
  },
  'lcd-display': {
    name: 'lcd-display',
    category: 'readouts',
    order: 75,
    summary:
      'An LCD readout with shadowed glyphs, static texture, glowing glass, and an opt-in display font slot.',
  },
  'needle-gauge': {
    name: 'needle-gauge',
    category: 'readouts',
    order: 78,
    summary:
      'A mechanical needle readout with glass, printed scale markings, and colored range zones.',
  },
  meter: {
    name: 'meter',
    category: 'readouts',
    order: 80,
    summary: 'A stereo channel monitor with analog ballistics, peaks, and console-grade density.',
  },
  indicator: {
    name: 'indicator',
    category: 'readouts',
    order: 90,
    summary: 'A jewel-like lamp with faceted glass, bloom, and a substantial bezel treatment.',
  },
  panel: {
    name: 'panel',
    category: 'surfaces',
    order: 100,
    summary:
      'An equipment-bay container with screws, structure, and room for dense control stacks.',
  },
  'rocker-thumb-surface': {
    name: 'rocker-thumb-surface',
    category: 'surfaces',
    order: 110,
    summary:
      'A reusable thumb shell used by sliders and switches to keep movement feeling machined.',
  },
} satisfies Record<string, BlockCatalogItem>;

export type BlockName = keyof typeof blockCatalog;
