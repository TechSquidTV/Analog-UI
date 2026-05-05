export const blockCategories = {
  inputs: {
    label: "Inputs",
    description: "Hands-on controls for dial, travel, toggle, and trim interactions.",
  },
  readouts: {
    label: "Readouts",
    description: "Monitors, gauges, and indicator surfaces for machine-state feedback.",
  },
  surfaces: {
    label: "Surfaces",
    description: "Material studies and housing primitives that anchor the analog finish system.",
  },
} as const;

export type BlockCategory = keyof typeof blockCategories;

export interface BlockCatalogItem {
  name: string;
  category: BlockCategory;
  featured: boolean;
  order: number;
  summary: string;
}

export const blockCatalog = {
  dial: {
    name: "dial",
    category: "inputs",
    featured: true,
    order: 10,
    summary: "A potentiometer-style knob with foil sheen, hard shadows, and precise rotary travel.",
  },
  slider: {
    name: "slider",
    category: "inputs",
    featured: true,
    order: 20,
    summary: "A long-throw fader with recessed travel, tactile ridges, and strong thumb presence.",
  },
  toggle: {
    name: "toggle",
    category: "inputs",
    featured: true,
    order: 30,
    summary: "A heavy-duty rocker with optional LED states and enough depth to feel mechanical.",
  },
  "square-button": {
    name: "square-button",
    category: "inputs",
    featured: false,
    order: 35,
    summary: "A 3D plunger-style button with deep travel, machined edges, and dense square hardware.",
  },
  "square-toggle": {
    name: "square-toggle",
    category: "inputs",
    featured: false,
    order: 36,
    summary: "A latching square toggle that pairs plunger depth with compact LED state feedback.",
  },
  switch: {
    name: "switch",
    category: "inputs",
    featured: false,
    order: 40,
    summary: "A cylindrical track switch that rolls through a deep cavity rather than snapping flat.",
  },
  "wheel-select": {
    name: "wheel-select",
    category: "inputs",
    featured: true,
    order: 50,
    summary: "A stepped trim wheel for option selection with drag, wheel, and keyboard travel.",
  },
  "wheel-number": {
    name: "wheel-number",
    category: "inputs",
    featured: false,
    order: 60,
    summary: "A continuous numeric wheel for fine scrubbing and repeatable adjustments.",
  },
  gauge: {
    name: "gauge",
    category: "readouts",
    featured: true,
    order: 70,
    summary: "A circular monitor that layers LCD arc feedback over a machined control face.",
  },
  "lcd-display": {
    name: "lcd-display",
    category: "readouts",
    featured: true,
    order: 75,
    summary: "A seven-segment screen with shadowed numerals, static texture, and softly glowing LCD glass.",
  },
  meter: {
    name: "meter",
    category: "readouts",
    featured: true,
    order: 80,
    summary: "A stereo channel monitor with analog ballistics, peaks, and console-grade density.",
  },
  indicator: {
    name: "indicator",
    category: "readouts",
    featured: false,
    order: 90,
    summary: "A jewel-like lamp with faceted glass, bloom, and a substantial bezel treatment.",
  },
  panel: {
    name: "panel",
    category: "surfaces",
    featured: true,
    order: 100,
    summary: "An equipment-bay container with screws, structure, and room for dense control stacks.",
  },
  "rocker-thumb-surface": {
    name: "rocker-thumb-surface",
    category: "surfaces",
    featured: false,
    order: 110,
    summary: "A reusable thumb shell used by sliders and switches to keep movement feeling machined.",
  },
} satisfies Record<string, BlockCatalogItem>;

export type BlockName = keyof typeof blockCatalog;
