export const componentCategories = {
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

export type ComponentCategory = keyof typeof componentCategories;

interface ComponentCatalogItem {
  name: string;
  category: ComponentCategory;
  order: number;
  summary: string;
  materialLogic: string;
}

export const componentCatalog = {
  dial: {
    name: 'dial',
    category: 'inputs',
    order: 10,
    summary: 'A potentiometer-style knob with foil sheen, hard shadows, and precise rotary travel.',
    materialLogic: 'The main face uses `surface`; pointer lines, pips, or needles use `pointer`.',
  },
  slider: {
    name: 'slider',
    category: 'inputs',
    order: 20,
    summary: 'A long-throw fader with recessed travel, tactile ridges, and strong thumb presence.',
    materialLogic:
      'The rail, recess, and dust slot use `track`; the handle, cap, and grip ridges use `thumb`.',
  },
  toggle: {
    name: 'toggle',
    category: 'inputs',
    order: 30,
    summary:
      'A heavy-duty rocker with optional tone indicators and enough depth to feel mechanical.',
    materialLogic:
      'The housing sits in `surface` or `track`; the moving paddle or rocker uses `thumb`; embedded lamps use `lens`.',
  },
  'rocker-switch-group': {
    name: 'rocker-switch-group',
    category: 'inputs',
    order: 32,
    summary: 'A recessed switch bank for arranging rocker toggles with shared lighting.',
    materialLogic:
      'Group related controls inside panels or equipment bays rather than floating them independently.',
  },
  'push-button': {
    name: 'push-button',
    category: 'inputs',
    order: 35,
    summary: 'A 3D push button with deep travel, responsive text sizing, and machined edges.',
    materialLogic: 'Static chassis, moving plunger, surface recess, and perspective tilt.',
  },
  'push-toggle': {
    name: 'push-toggle',
    category: 'inputs',
    order: 36,
    summary: 'A latching push toggle that pairs plunger depth with compact tone feedback.',
    materialLogic:
      'For precision toggles and latching buttons, place tone indicators in the top-right corner.',
  },
  'toggle-button-group': {
    name: 'toggle-button-group',
    category: 'inputs',
    order: 37,
    summary: 'A selection group of push toggles with active tone feedback.',
    materialLogic:
      'Group related controls inside panels or equipment bays rather than floating them independently.',
  },
  switch: {
    name: 'switch',
    category: 'inputs',
    order: 40,
    summary:
      'A cylindrical track switch that rolls through a deep cavity rather than snapping flat.',
    materialLogic:
      'The housing sits in `surface` or `track`; the moving paddle or rocker uses `thumb`; embedded lamps use `lens`.',
  },
  'rotary-switch': {
    name: 'rotary-switch',
    category: 'inputs',
    order: 45,
    summary: 'A stepped integer selector with a seven-flute black ring and machined center cap.',
    materialLogic:
      'The selector ring and center cap use `surface`; pointer marks and detents use `pointer`.',
  },
  'wheel-select': {
    name: 'wheel-select',
    category: 'inputs',
    order: 50,
    summary: 'A stepped trim wheel for option selection with drag, wheel, and keyboard travel.',
    materialLogic:
      'The background cavity uses `track`; the cylinder, printed drum surface, and any broad foil glare use `wheel`.',
  },
  'wheel-number': {
    name: 'wheel-number',
    category: 'inputs',
    order: 60,
    summary: 'A continuous numeric wheel for fine scrubbing and repeatable adjustments.',
    materialLogic:
      'The background cavity uses `track`; the cylinder, printed drum surface, and any broad foil glare use `wheel`.',
  },
  gauge: {
    name: 'gauge',
    category: 'readouts',
    order: 70,
    summary:
      'A circular monitor that layers tone-driven arc feedback over a machined control face.',
    materialLogic:
      'Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`.',
  },
  'lcd-display': {
    name: 'lcd-display',
    category: 'readouts',
    order: 75,
    summary:
      'A segmented display readout with shadowed glyphs, static texture, glowing glass, and an opt-in display font slot.',
    materialLogic: 'Segmented readouts, display glass, and mono typography for telemetry.',
  },
  'needle-gauge': {
    name: 'needle-gauge',
    category: 'readouts',
    order: 78,
    summary:
      'A mechanical needle readout with glass, printed scale markings, and colored range zones.',
    materialLogic:
      'Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`.',
  },
  meter: {
    name: 'meter',
    category: 'readouts',
    order: 80,
    summary: 'A stereo channel monitor with analog ballistics, peaks, and console-grade density.',
    materialLogic:
      'Housings and bridge panels use `panel` or `surface`; needles and read pointers use `pointer`; glass covers and optical glints use `lens`.',
  },
  indicator: {
    name: 'indicator',
    category: 'readouts',
    order: 90,
    summary: 'A jewel-like lamp with faceted glass, bloom, and a substantial bezel treatment.',
    materialLogic:
      'Bezels, lamp cups, and retaining rings use `bezel`; lit glass and clear caps use `lens`.',
  },
  panel: {
    name: 'panel',
    category: 'surfaces',
    order: 100,
    summary:
      'An equipment-bay container with screws, structure, and room for dense control stacks.',
    materialLogic:
      'The rack face uses `panel`; screws and hardware use `screw`; mounted control caps keep their own local channels.',
  },
  'rocker-thumb-surface': {
    name: 'rocker-thumb-surface',
    category: 'surfaces',
    order: 110,
    summary:
      'A reusable thumb shell used by sliders and switches to keep movement feeling machined.',
    materialLogic: 'Handles, rockers, switch paddles, slider caps, and moving plungers.',
  },
} satisfies Record<string, ComponentCatalogItem>;

export type ComponentName = keyof typeof componentCatalog;
