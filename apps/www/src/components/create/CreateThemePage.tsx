import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  AnalogLightingProvider,
  Dial,
  Gauge,
  Indicator,
  LCDDisplay,
  Meter,
  MeterGroup,
  MeterGroupChannel,
  MeterGroupSeparator,
  Panel,
  PanelAction,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  RotarySwitch,
  Slider,
  PushButton,
  Switch,
  Toggle,
  useAnalogLighting,
  usePointerLighting,
  type AnalogMaterialChannel,
  type AnalogTone,
} from '../../../../../packages/analog-ui/src/index';

type TokenKind = 'color' | 'number' | 'size';

interface TokenControl {
  id: string;
  cssVar: string;
  label: string;
  kind: TokenKind;
  defaultValue: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: 'px';
}

interface TokenGroup {
  id: string;
  label: string;
  eyebrow: string;
  controls: TokenControl[];
}

type ThemeValues = Record<string, string>;

interface ThemePreset {
  id: string;
  name: string;
  caption: string;
  swatches: string[];
  values: Partial<ThemeValues>;
}

const tokenGroups: TokenGroup[] = [
  {
    id: 'semantic',
    label: 'Semantic',
    eyebrow: 'Host Tokens',
    controls: [
      {
        id: 'background',
        cssVar: '--background',
        label: 'Background',
        kind: 'color',
        defaultValue: '#050505',
      },
      {
        id: 'foreground',
        cssVar: '--foreground',
        label: 'Foreground',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
      { id: 'card', cssVar: '--card', label: 'Card', kind: 'color', defaultValue: '#171819' },
      {
        id: 'cardForeground',
        cssVar: '--card-foreground',
        label: 'Card text',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
      {
        id: 'popover',
        cssVar: '--popover',
        label: 'Popover',
        kind: 'color',
        defaultValue: '#171819',
      },
      {
        id: 'popoverForeground',
        cssVar: '--popover-foreground',
        label: 'Popover text',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
      {
        id: 'primary',
        cssVar: '--primary',
        label: 'Primary',
        kind: 'color',
        defaultValue: '#d8d8d8',
      },
      {
        id: 'primaryForeground',
        cssVar: '--primary-foreground',
        label: 'Primary text',
        kind: 'color',
        defaultValue: '#050505',
      },
      {
        id: 'secondary',
        cssVar: '--secondary',
        label: 'Secondary',
        kind: 'color',
        defaultValue: '#54595c',
      },
      {
        id: 'secondaryForeground',
        cssVar: '--secondary-foreground',
        label: 'Secondary text',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
      { id: 'muted', cssVar: '--muted', label: 'Muted', kind: 'color', defaultValue: '#242628' },
      { id: 'accent', cssVar: '--accent', label: 'Accent', kind: 'color', defaultValue: '#78e6a5' },
      {
        id: 'accentForeground',
        cssVar: '--accent-foreground',
        label: 'Accent text',
        kind: 'color',
        defaultValue: '#050505',
      },
      {
        id: 'destructive',
        cssVar: '--destructive',
        label: 'Destructive',
        kind: 'color',
        defaultValue: '#f25b4b',
      },
      {
        id: 'destructiveForeground',
        cssVar: '--destructive-foreground',
        label: 'Destructive text',
        kind: 'color',
        defaultValue: '#050505',
      },
      {
        id: 'mutedForeground',
        cssVar: '--muted-foreground',
        label: 'Muted text',
        kind: 'color',
        defaultValue: '#9a9b96',
      },
      { id: 'border', cssVar: '--border', label: 'Border', kind: 'color', defaultValue: '#313436' },
      { id: 'input', cssVar: '--input', label: 'Input', kind: 'color', defaultValue: '#3b4042' },
      { id: 'ring', cssVar: '--ring', label: 'Ring', kind: 'color', defaultValue: '#9ef6bd' },
      {
        id: 'radius',
        cssVar: '--radius',
        label: 'Radius',
        kind: 'size',
        defaultValue: '12',
        min: 6,
        max: 18,
        step: 1,
        unit: 'px',
      },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    eyebrow: 'Host Chart Tokens',
    controls: [
      {
        id: 'chart1',
        cssVar: '--chart-1',
        label: 'Chart 1',
        kind: 'color',
        defaultValue: '#35d36b',
      },
      {
        id: 'chart2',
        cssVar: '--chart-2',
        label: 'Chart 2',
        kind: 'color',
        defaultValue: '#55a8ff',
      },
      {
        id: 'chart3',
        cssVar: '--chart-3',
        label: 'Chart 3',
        kind: 'color',
        defaultValue: '#f25b4b',
      },
      {
        id: 'chart4',
        cssVar: '--chart-4',
        label: 'Chart 4',
        kind: 'color',
        defaultValue: '#f1b53f',
      },
      {
        id: 'chart5',
        cssVar: '--chart-5',
        label: 'Chart 5',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
    ],
  },
  {
    id: 'materials',
    label: 'Ramps',
    eyebrow: 'Analog Material Ramps',
    controls: [
      {
        id: 'surfaceCavity',
        cssVar: '--analog-surface-cavity',
        label: 'Cavity',
        kind: 'color',
        defaultValue: '#070809',
      },
      {
        id: 'surfacePanel',
        cssVar: '--analog-surface-panel',
        label: 'Panel',
        kind: 'color',
        defaultValue: '#151719',
      },
      {
        id: 'metalHi',
        cssVar: '--analog-surface-metal-hi',
        label: 'Metal high',
        kind: 'color',
        defaultValue: '#d9ddd9',
      },
      {
        id: 'metalMid',
        cssVar: '--analog-surface-metal-mid',
        label: 'Metal mid',
        kind: 'color',
        defaultValue: '#8a9293',
      },
      {
        id: 'metalLo',
        cssVar: '--analog-surface-metal-lo',
        label: 'Metal low',
        kind: 'color',
        defaultValue: '#42484a',
      },
      {
        id: 'onyxHi',
        cssVar: '--analog-surface-onyx-hi',
        label: 'Onyx high',
        kind: 'color',
        defaultValue: '#2b2e30',
      },
      {
        id: 'onyxMid',
        cssVar: '--analog-surface-onyx-mid',
        label: 'Onyx mid',
        kind: 'color',
        defaultValue: '#17191b',
      },
      {
        id: 'onyxLo',
        cssVar: '--analog-surface-onyx-lo',
        label: 'Onyx low',
        kind: 'color',
        defaultValue: '#050607',
      },
    ],
  },
  {
    id: 'emissive',
    label: 'Tone',
    eyebrow: 'Analog Tones',
    controls: [
      {
        id: 'tonePrimary',
        cssVar: '--analog-tone-primary',
        label: 'Primary',
        kind: 'color',
        defaultValue: '#d8d8d8',
      },
      {
        id: 'toneSecondary',
        cssVar: '--analog-tone-secondary',
        label: 'Secondary',
        kind: 'color',
        defaultValue: '#8c8f8c',
      },
      {
        id: 'toneAccent',
        cssVar: '--analog-tone-accent',
        label: 'Accent',
        kind: 'color',
        defaultValue: '#78e6a5',
      },
      {
        id: 'toneDestructive',
        cssVar: '--analog-tone-destructive',
        label: 'Destructive',
        kind: 'color',
        defaultValue: '#f25b4b',
      },
      {
        id: 'toneSuccess',
        cssVar: '--analog-tone-success',
        label: 'Success',
        kind: 'color',
        defaultValue: '#35d36b',
      },
      {
        id: 'toneWarning',
        cssVar: '--analog-tone-warning',
        label: 'Warning',
        kind: 'color',
        defaultValue: '#f1b53f',
      },
      {
        id: 'toneInfo',
        cssVar: '--analog-tone-info',
        label: 'Info',
        kind: 'color',
        defaultValue: '#55a8ff',
      },
      {
        id: 'toneNeutral',
        cssVar: '--analog-tone-neutral',
        label: 'Neutral',
        kind: 'color',
        defaultValue: '#f4f4f0',
      },
      {
        id: 'peakMarker',
        cssVar: '--analog-meter-peak-marker',
        label: 'Peak marker',
        kind: 'color',
        defaultValue: '#fff0aa',
      },
    ],
  },
  {
    id: 'recipes',
    label: 'Recipes',
    eyebrow: 'Finish Recipes',
    controls: [
      {
        id: 'shadowDepth',
        cssVar: '--analog-shadow-depth',
        label: 'Shadow depth',
        kind: 'number',
        defaultValue: '1.05',
        min: 0.45,
        max: 1.5,
        step: 0.05,
      },
      {
        id: 'grainOpacity',
        cssVar: '--analog-grain-opacity',
        label: 'Grain',
        kind: 'number',
        defaultValue: '0.28',
        min: 0,
        max: 0.7,
        step: 0.01,
      },
      {
        id: 'foilOpacity',
        cssVar: '--analog-foil-opacity',
        label: 'Foil',
        kind: 'number',
        defaultValue: '0.24',
        min: 0,
        max: 0.7,
        step: 0.01,
      },
      {
        id: 'bloomStrength',
        cssVar: '--analog-bloom-strength',
        label: 'Bloom',
        kind: 'number',
        defaultValue: '0.66',
        min: 0.2,
        max: 1.2,
        step: 0.02,
      },
      {
        id: 'trackPadding',
        cssVar: '--analog-track-padding',
        label: 'Track padding',
        kind: 'size',
        defaultValue: '4',
        min: 2,
        max: 10,
        step: 1,
        unit: 'px',
      },
      {
        id: 'bevelWidth',
        cssVar: '--analog-bevel-width',
        label: 'Bevel',
        kind: 'size',
        defaultValue: '4',
        min: 1,
        max: 8,
        step: 1,
        unit: 'px',
      },
    ],
  },
];

const allControls = tokenGroups.flatMap((group) => group.controls);

const derivedVars = [
  ['--font-mono', "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace"],
  ['--spacing-track-padding', 'var(--analog-track-padding)'],
  ['--analog-radius-base', 'var(--radius)'],
  ['--analog-radius-micro', 'calc(var(--radius) * 0.35)'],
  ['--analog-radius-window', 'calc(var(--radius) * 0.65)'],
  ['--analog-radius-recess', 'calc(var(--radius) * 0.85)'],
  ['--analog-radius-shell', 'var(--radius)'],
  ['--analog-radius-panel', 'calc(var(--radius) * 1.15)'],
  ['--analog-light-source', '180deg'],
  [
    '--analog-surface-cavity-strong',
    'color-mix(in oklch, var(--analog-surface-cavity) 78%, black 22%)',
  ],
  ['--analog-surface-raised', 'color-mix(in oklch, var(--analog-surface-panel) 78%, white 8%)'],
  ['--analog-material-hi', 'var(--analog-surface-metal-hi)'],
  ['--analog-material-mid', 'var(--analog-surface-metal-mid)'],
  ['--analog-material-lo', 'var(--analog-surface-metal-lo)'],
  [
    '--analog-material-border',
    'color-mix(in oklch, var(--analog-surface-metal-lo) 34%, transparent)',
  ],
  [
    '--analog-material-border-strong',
    'color-mix(in oklch, var(--analog-surface-metal-lo) 52%, transparent)',
  ],
  ['--analog-control-foreground', 'var(--foreground)'],
  [
    '--analog-control-foreground-muted',
    'color-mix(in oklch, var(--muted-foreground) 88%, var(--foreground) 12%)',
  ],
  [
    '--analog-control-foreground-subtle',
    'color-mix(in oklch, var(--muted-foreground) 72%, var(--foreground) 28%)',
  ],
  [
    '--analog-material-foreground',
    'color-mix(in oklch, var(--analog-surface-metal-lo) 42%, var(--analog-control-foreground) 58%)',
  ],
  ['--analog-annotation', 'color-mix(in oklch, var(--foreground) 62%, var(--muted-foreground))'],
  ['--analog-legend', 'color-mix(in oklch, var(--foreground) 48%, var(--muted-foreground))'],
  [
    '--analog-telemetry-label',
    'color-mix(in oklch, var(--foreground) 34%, var(--muted-foreground))',
  ],
  ['--analog-telemetry-value', 'color-mix(in oklch, var(--accent) 62%, var(--foreground))'],
  ['--analog-control-surface', 'color-mix(in oklch, var(--card) 84%, var(--foreground) 16%)'],
  [
    '--analog-control-surface-strong',
    'color-mix(in oklch, var(--card) 72%, var(--foreground) 28%)',
  ],
  ['--analog-control-border', 'color-mix(in oklch, var(--border) 70%, var(--foreground) 30%)'],
  [
    '--analog-control-border-strong',
    'color-mix(in oklch, var(--border) 52%, var(--foreground) 48%)',
  ],
  ['--analog-control-selection', 'color-mix(in oklch, var(--accent) 78%, var(--foreground) 22%)'],
  ['--analog-control-glass', 'color-mix(in oklch, var(--foreground) 5%, transparent)'],
  ['--analog-control-glass-border', 'color-mix(in oklch, var(--border) 68%, transparent)'],
  [
    '--analog-panel-border',
    'color-mix(in oklch, var(--border) 62%, var(--analog-surface-raised) 38%)',
  ],
  ['--analog-panel-foreground', 'var(--card-foreground)'],
  [
    '--analog-panel-muted',
    'color-mix(in oklch, var(--muted-foreground) 82%, var(--foreground) 18%)',
  ],
  [
    '--analog-screw-hole',
    'color-mix(in oklch, var(--analog-surface-cavity-strong) 72%, black 28%)',
  ],
  ['--analog-tone-chart-1', 'var(--chart-1)'],
  ['--analog-tone-chart-2', 'var(--chart-2)'],
  ['--analog-tone-chart-3', 'var(--chart-3)'],
  ['--analog-tone-chart-4', 'var(--chart-4)'],
  ['--analog-tone-chart-5', 'var(--chart-5)'],
  ['--analog-tone-current', 'var(--analog-tone-accent)'],
  ['--analog-emissive-base', 'var(--analog-tone-current)'],
  ['--analog-emissive-core', 'color-mix(in oklch, var(--analog-tone-current) 36%, white 64%)'],
  ['--analog-emissive-glow', 'color-mix(in oklch, var(--analog-tone-current) 78%, white)'],
  ['--analog-emissive-surface', 'color-mix(in oklch, var(--analog-tone-current) 34%, black 66%)'],
  ['--analog-emissive-edge', 'color-mix(in oklch, var(--analog-tone-current) 62%, black 38%)'],
  ['--analog-display-glow', 'var(--analog-tone-current)'],
  ['--analog-display-fill', 'color-mix(in oklch, var(--analog-tone-current) 84%, white 16%)'],
  ['--analog-display-ink', 'color-mix(in oklch, var(--analog-tone-current) 18%, black 82%)'],
  ['--analog-display-legend', 'color-mix(in oklch, var(--analog-tone-current) 30%, black 70%)'],
  ['--analog-meter-zone-success', 'var(--analog-tone-success)'],
  [
    '--analog-meter-zone-success-glow',
    'color-mix(in oklch, var(--analog-tone-success) 76%, white)',
  ],
  ['--analog-meter-zone-warning', 'var(--analog-tone-warning)'],
  [
    '--analog-meter-zone-warning-glow',
    'color-mix(in oklch, var(--analog-tone-warning) 78%, white)',
  ],
  ['--analog-meter-zone-destructive', 'var(--analog-tone-destructive)'],
  [
    '--analog-meter-zone-destructive-glow',
    'color-mix(in oklch, var(--analog-tone-destructive) 82%, white)',
  ],
] as const;

const themeMappings = [
  ['--color-background', 'var(--background)'],
  ['--color-foreground', 'var(--foreground)'],
  ['--color-card', 'var(--card)'],
  ['--color-card-foreground', 'var(--card-foreground)'],
  ['--color-popover', 'var(--popover)'],
  ['--color-popover-foreground', 'var(--popover-foreground)'],
  ['--color-primary', 'var(--primary)'],
  ['--color-primary-foreground', 'var(--primary-foreground)'],
  ['--color-secondary', 'var(--secondary)'],
  ['--color-secondary-foreground', 'var(--secondary-foreground)'],
  ['--color-muted', 'var(--muted)'],
  ['--color-muted-foreground', 'var(--muted-foreground)'],
  ['--color-accent', 'var(--accent)'],
  ['--color-accent-foreground', 'var(--accent-foreground)'],
  ['--color-destructive', 'var(--destructive)'],
  ['--color-destructive-foreground', 'var(--destructive-foreground)'],
  ['--color-border', 'var(--border)'],
  ['--color-input', 'var(--input)'],
  ['--color-ring', 'var(--ring)'],
  ['--color-chart-1', 'var(--chart-1)'],
  ['--color-chart-2', 'var(--chart-2)'],
  ['--color-chart-3', 'var(--chart-3)'],
  ['--color-chart-4', 'var(--chart-4)'],
  ['--color-chart-5', 'var(--chart-5)'],
  ['--color-analog-surface-cavity', 'var(--analog-surface-cavity)'],
  ['--color-analog-surface-panel', 'var(--analog-surface-panel)'],
  ['--color-analog-surface-metal-hi', 'var(--analog-surface-metal-hi)'],
  ['--color-analog-surface-metal-mid', 'var(--analog-surface-metal-mid)'],
  ['--color-analog-surface-metal-lo', 'var(--analog-surface-metal-lo)'],
  ['--color-analog-tone-primary', 'var(--analog-tone-primary)'],
  ['--color-analog-tone-secondary', 'var(--analog-tone-secondary)'],
  ['--color-analog-tone-accent', 'var(--analog-tone-accent)'],
  ['--color-analog-tone-destructive', 'var(--analog-tone-destructive)'],
  ['--color-analog-tone-success', 'var(--analog-tone-success)'],
  ['--color-analog-tone-warning', 'var(--analog-tone-warning)'],
  ['--color-analog-tone-info', 'var(--analog-tone-info)'],
  ['--color-analog-tone-neutral', 'var(--analog-tone-neutral)'],
  ['--color-analog-tone-chart-1', 'var(--analog-tone-chart-1)'],
  ['--color-analog-tone-chart-2', 'var(--analog-tone-chart-2)'],
  ['--color-analog-tone-chart-3', 'var(--analog-tone-chart-3)'],
  ['--color-analog-tone-chart-4', 'var(--analog-tone-chart-4)'],
  ['--color-analog-tone-chart-5', 'var(--analog-tone-chart-5)'],
  ['--radius-sm', 'calc(var(--radius) * 0.6)'],
  ['--radius-md', 'calc(var(--radius) * 0.8)'],
  ['--radius-lg', 'var(--radius)'],
  ['--radius-xl', 'calc(var(--radius) * 1.4)'],
] as const;

const previewTabs = ['Rack', 'Surfaces', 'Code'] as const;

const initialThemeValues = Object.fromEntries(
  allControls.map((control) => [control.id, control.defaultValue]),
) as ThemeValues;

const themePresets: ThemePreset[] = [
  {
    id: 'studio-black',
    name: 'Studio Black',
    caption: 'Chrome / emerald',
    swatches: ['#050505', '#151719', '#d9ddd9', '#78e6a5'],
    values: {
      radius: '12',
      shadowDepth: '1.08',
      grainOpacity: '0.3',
      foilOpacity: '0.28',
      bloomStrength: '0.68',
      trackPadding: '4',
      bevelWidth: '4',
    },
  },
  {
    id: 'polar-bench',
    name: 'Polar Bench',
    caption: 'Bright lab',
    swatches: ['#e7ecec', '#f8f7f0', '#b8c4c7', '#2bbcd3'],
    values: {
      background: '#e7ecec',
      foreground: '#111519',
      card: '#f8f7f0',
      cardForeground: '#111519',
      popover: '#f3f6f5',
      popoverForeground: '#111519',
      primary: '#2b3a3f',
      primaryForeground: '#f7fbfb',
      secondary: '#bcc8ca',
      secondaryForeground: '#101417',
      muted: '#dfe5e6',
      mutedForeground: '#5d686b',
      accent: '#2bbcd3',
      accentForeground: '#061113',
      destructive: '#c94343',
      destructiveForeground: '#fff7f2',
      border: '#adb9bc',
      input: '#9facaf',
      ring: '#2bbcd3',
      radius: '6',
      chart1: '#19b56f',
      chart2: '#2bbcd3',
      chart3: '#c94343',
      chart4: '#c79b2a',
      chart5: '#2b3a3f',
      surfaceCavity: '#c7d0d2',
      surfacePanel: '#e3e6e3',
      metalHi: '#ffffff',
      metalMid: '#b8c4c7',
      metalLo: '#66757a',
      onyxHi: '#475156',
      onyxMid: '#2e3639',
      onyxLo: '#111719',
      tonePrimary: '#2b3a3f',
      toneSecondary: '#728186',
      toneAccent: '#2bbcd3',
      toneDestructive: '#c94343',
      toneSuccess: '#19b56f',
      toneWarning: '#c79b2a',
      toneInfo: '#2477d4',
      toneNeutral: '#ffffff',
      peakMarker: '#fff2a3',
      shadowDepth: '0.62',
      grainOpacity: '0.06',
      foilOpacity: '0.52',
      bloomStrength: '0.42',
      trackPadding: '2',
      bevelWidth: '2',
    },
  },
  {
    id: 'tape-amber',
    name: 'Tape Amber',
    caption: 'Warm console',
    swatches: ['#120b07', '#302012', '#ffb84d', '#38d6bd'],
    values: {
      background: '#120b07',
      foreground: '#fff1d2',
      card: '#22150c',
      cardForeground: '#fff1d2',
      popover: '#2d1c10',
      popoverForeground: '#fff1d2',
      primary: '#ffb84d',
      primaryForeground: '#180b03',
      secondary: '#875c34',
      secondaryForeground: '#fff1d2',
      muted: '#352316',
      mutedForeground: '#bba071',
      accent: '#38d6bd',
      accentForeground: '#061714',
      destructive: '#ff4f3f',
      destructiveForeground: '#1d0904',
      border: '#65401e',
      input: '#7a4d25',
      ring: '#ffcd72',
      radius: '14',
      chart1: '#58d778',
      chart2: '#38d6bd',
      chart3: '#ff4f3f',
      chart4: '#ffb84d',
      chart5: '#fff1d2',
      surfaceCavity: '#160d08',
      surfacePanel: '#302012',
      metalHi: '#ffd98a',
      metalMid: '#a8733d',
      metalLo: '#4a2d17',
      onyxHi: '#3a3028',
      onyxMid: '#211811',
      onyxLo: '#080403',
      tonePrimary: '#ffb84d',
      toneSecondary: '#c08b50',
      toneAccent: '#38d6bd',
      toneDestructive: '#ff4f3f',
      toneSuccess: '#58d778',
      toneWarning: '#ffcf66',
      toneInfo: '#55b8ff',
      toneNeutral: '#fff1d2',
      peakMarker: '#fff0a8',
      shadowDepth: '1.14',
      grainOpacity: '0.52',
      foilOpacity: '0.18',
      bloomStrength: '0.72',
      trackPadding: '4',
      bevelWidth: '4',
    },
  },
  {
    id: 'violet-crt',
    name: 'Violet CRT',
    caption: 'Neon optics',
    swatches: ['#080510', '#1f1430', '#00f0d8', '#ff4fd8'],
    values: {
      background: '#080510',
      foreground: '#f7ecff',
      card: '#161020',
      cardForeground: '#f7ecff',
      popover: '#1f1430',
      popoverForeground: '#f7ecff',
      primary: '#b97cff',
      primaryForeground: '#0a0612',
      secondary: '#2b2050',
      secondaryForeground: '#f7ecff',
      muted: '#201831',
      mutedForeground: '#b8a5c8',
      accent: '#00f0d8',
      accentForeground: '#001614',
      destructive: '#ff477e',
      destructiveForeground: '#13020a',
      border: '#47325c',
      input: '#553b71',
      ring: '#00f0d8',
      radius: '16',
      chart1: '#00f0d8',
      chart2: '#ff4fd8',
      chart3: '#ffe66d',
      chart4: '#7c5cff',
      chart5: '#f7ecff',
      surfaceCavity: '#07040c',
      surfacePanel: '#1a1126',
      metalHi: '#f2d6ff',
      metalMid: '#8f73b8',
      metalLo: '#403052',
      onyxHi: '#322544',
      onyxMid: '#1b1326',
      onyxLo: '#06030a',
      tonePrimary: '#b97cff',
      toneSecondary: '#8d78ff',
      toneAccent: '#00f0d8',
      toneDestructive: '#ff477e',
      toneSuccess: '#58ff9e',
      toneWarning: '#ffe66d',
      toneInfo: '#4cc8ff',
      toneNeutral: '#f7ecff',
      peakMarker: '#fff27a',
      shadowDepth: '1.16',
      grainOpacity: '0.2',
      foilOpacity: '0.64',
      bloomStrength: '1.02',
      trackPadding: '3',
      bevelWidth: '4',
    },
  },
  {
    id: 'field-olive',
    name: 'Field Olive',
    caption: 'Rugged panel',
    swatches: ['#090b07', '#273120', '#d7c16a', '#f07d3c'],
    values: {
      background: '#090b07',
      foreground: '#f0ead0',
      card: '#171b11',
      cardForeground: '#f0ead0',
      popover: '#202617',
      popoverForeground: '#f0ead0',
      primary: '#d7c16a',
      primaryForeground: '#0b0c06',
      secondary: '#55614a',
      secondaryForeground: '#f0ead0',
      muted: '#272d1f',
      mutedForeground: '#abb090',
      accent: '#f07d3c',
      accentForeground: '#130803',
      destructive: '#e14537',
      destructiveForeground: '#150604',
      border: '#4e5843',
      input: '#657257',
      ring: '#d7c16a',
      radius: '6',
      chart1: '#8bd15f',
      chart2: '#67b7c8',
      chart3: '#e14537',
      chart4: '#d7c16a',
      chart5: '#f0ead0',
      surfaceCavity: '#080a06',
      surfacePanel: '#273120',
      metalHi: '#cfc496',
      metalMid: '#7e8064',
      metalLo: '#3e4636',
      onyxHi: '#31382c',
      onyxMid: '#181d14',
      onyxLo: '#050603',
      tonePrimary: '#d7c16a',
      toneSecondary: '#8c966e',
      toneAccent: '#f07d3c',
      toneDestructive: '#e14537',
      toneSuccess: '#8bd15f',
      toneWarning: '#f1c24d',
      toneInfo: '#67b7c8',
      toneNeutral: '#f0ead0',
      peakMarker: '#ffe48a',
      shadowDepth: '1.18',
      grainOpacity: '0.56',
      foilOpacity: '0.1',
      bloomStrength: '0.46',
      trackPadding: '4',
      bevelWidth: '3',
    },
  },
];

function getPresetValues(preset: ThemePreset) {
  return { ...initialThemeValues, ...preset.values };
}

const defaultPreset = themePresets[0];
const defaultPresetId = defaultPreset?.id ?? 'custom';
const defaultThemeValues = defaultPreset ? getPresetValues(defaultPreset) : initialThemeValues;

const palettePreviewIds = [
  'background',
  'foreground',
  'card',
  'popover',
  'primary',
  'secondary',
  'accent',
  'destructive',
  'chart1',
  'chart2',
  'chart3',
  'chart4',
  'surfaceCavity',
  'surfacePanel',
  'metalHi',
  'metalMid',
  'metalLo',
  'onyxHi',
  'onyxMid',
  'onyxLo',
  'tonePrimary',
  'toneAccent',
  'toneSuccess',
  'toneWarning',
] as const;

const palettePreviewControls = palettePreviewIds
  .map((id) => allControls.find((control) => control.id === id))
  .filter((control): control is TokenControl => Boolean(control));

const tonePreviewRows = [
  ['Primary', 'primary'],
  ['Secondary', 'secondary'],
  ['Accent', 'accent'],
  ['Success', 'success'],
  ['Warning', 'warning'],
  ['Info', 'info'],
  ['Neutral', 'neutral'],
  ['Chart 1', 'chart-1'],
  ['Chart 2', 'chart-2'],
  ['Chart 3', 'chart-3'],
  ['Chart 4', 'chart-4'],
  ['Chart 5', 'chart-5'],
] as const satisfies ReadonlyArray<readonly [string, AnalogTone]>;

const materialChannelRows = [
  ['Panel', 'panel', 'var(--analog-surface-panel)'],
  ['Track', 'track', 'var(--analog-surface-cavity)'],
  ['Thumb', 'thumb', 'var(--analog-surface-metal-mid)'],
  ['Bezel', 'bezel', 'var(--analog-surface-metal-hi)'],
  ['Lens', 'lens', 'var(--analog-tone-info)'],
  ['Pointer', 'pointer', 'var(--analog-tone-warning)'],
] as const satisfies ReadonlyArray<readonly [string, AnalogMaterialChannel, string]>;

function formatTokenValue(control: TokenControl, value: string) {
  if (control.kind === 'size') {
    return `${value}${control.unit ?? 'px'}`;
  }

  return value;
}

function getThemeStyle(values: ThemeValues) {
  const style = {} as CSSProperties & Record<string, string>;

  for (const control of allControls) {
    style[control.cssVar] = formatTokenValue(control, values[control.id] ?? control.defaultValue);
  }

  for (const [name, value] of derivedVars) {
    style[name] = value;
  }

  for (const [name, value] of themeMappings) {
    style[name] = value;
  }

  return style;
}

function getThemeCss(values: ThemeValues) {
  const lines = ['/* Analog UI theme exported from /create */', ':root {'];

  tokenGroups.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      lines.push('');
    }

    lines.push(`  /* ${group.eyebrow} */`);

    group.controls.forEach((control) => {
      const value = values[control.id] ?? control.defaultValue;

      lines.push(`  ${control.cssVar}: ${formatTokenValue(control, value)};`);
    });
  });

  lines.push(
    '',
    '  /* Derived recipe tokens */',
    ...derivedVars.map(([name, value]) => `  ${name}: ${value};`),
    '}',
    '',
    '@theme inline {',
    ...themeMappings.map(([name, value]) => `  ${name}: ${value};`),
    '}',
  );

  return lines.join('\n');
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TokenField({
  control,
  value,
  onManualChange,
  setValues,
}: {
  control: TokenControl;
  value: string;
  onManualChange: () => void;
  setValues: Dispatch<SetStateAction<ThemeValues>>;
}) {
  const updateValue = (nextValue: string) => {
    onManualChange();
    setValues((current) => ({ ...current, [control.id]: nextValue }));
  };

  if (control.kind === 'color') {
    return (
      <label className="grid gap-2 rounded-[var(--analog-radius-window)] border border-white/8 bg-black/18 p-3">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#e8e8e3]">{control.label}</span>
          <span
            className="h-5 w-5 shrink-0 rounded-full border border-white/16"
            style={{ backgroundColor: value }}
          />
        </span>
        <span className="grid grid-cols-[40px_minmax(0,1fr)] gap-2">
          <input
            className="h-9 w-10 cursor-pointer rounded-[var(--analog-radius-micro)] border border-white/12 bg-transparent p-0"
            type="color"
            value={isHexColor(value) ? value : control.defaultValue}
            aria-label={`${control.label} color`}
            onChange={(event) => updateValue(event.currentTarget.value)}
          />
          <input
            className="min-w-0 rounded-[var(--analog-radius-micro)] border border-white/10 bg-black/22 px-3 font-mono text-xs text-[#d9d9d2] outline-none transition-colors duration-200 focus:border-[var(--ring)]"
            value={value}
            spellCheck={false}
            onChange={(event) => updateValue(event.currentTarget.value)}
          />
        </span>
      </label>
    );
  }

  const numberValue = Number(value);
  const sliderValue = Number.isFinite(numberValue) ? numberValue : Number(control.defaultValue);

  return (
    <label className="grid gap-3 rounded-[var(--analog-radius-window)] border border-white/8 bg-black/18 p-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#e8e8e3]">{control.label}</span>
        <span className="font-mono text-xs text-[var(--accent)]">
          {formatTokenValue(control, value)}
        </span>
      </span>
      <Slider
        className="h-12"
        min={control.min}
        max={control.max}
        step={control.step}
        value={sliderValue}
        showMarks={false}
        onValueChange={(nextValue) => {
          const resolvedValue = Array.isArray(nextValue) ? nextValue[0] : nextValue;

          updateValue(String(resolvedValue ?? sliderValue));
        }}
      />
    </label>
  );
}

function PresetSelector({
  activePresetId,
  onPresetSelect,
}: {
  activePresetId: string;
  onPresetSelect: (preset: ThemePreset) => void;
}) {
  return (
    <div className="mt-5 grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#85857d]">
          Presets
        </div>
        {activePresetId === 'custom' ? (
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Custom
          </div>
        ) : null}
      </div>
      <div className="grid gap-2">
        {themePresets.map((preset) => {
          const isActive = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              className={[
                'group grid min-h-[4.5rem] gap-3 rounded-[var(--analog-radius-window)] border px-3 py-3 text-left transition-colors duration-200',
                isActive
                  ? 'border-[var(--ring)] bg-white/[0.09] text-white'
                  : 'border-white/8 bg-black/20 text-[#d9d9d2] hover:border-white/18 hover:bg-white/[0.05]',
              ].join(' ')}
              aria-pressed={isActive}
              onClick={() => onPresetSelect(preset)}
            >
              <span className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold uppercase tracking-[0.12em]">
                    {preset.name}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#92928b]">
                    {preset.caption}
                  </span>
                </span>
                <span className="grid shrink-0 grid-cols-4 overflow-hidden rounded-full border border-white/12">
                  {preset.swatches.map((swatch) => (
                    <span
                      key={`${preset.id}-${swatch}`}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeWorkbench({
  activeGroup,
  activePresetId,
  values,
  onManualChange,
  setValues,
  onExport,
  onGroupChange,
  onPresetSelect,
  onReset,
}: {
  activeGroup: TokenGroup;
  activePresetId: string;
  values: ThemeValues;
  onManualChange: () => void;
  setValues: Dispatch<SetStateAction<ThemeValues>>;
  onExport: () => void;
  onGroupChange: (groupId: string) => void;
  onPresetSelect: (preset: ThemePreset) => void;
  onReset: () => void;
}) {
  return (
    <Panel variant="rack" screwHole="slot" className="lg:sticky lg:top-28">
      <PanelHeader className="gap-4 p-5 pb-4">
        <div className="eyebrow">{activeGroup.eyebrow}</div>
        <PanelTitle className="text-2xl uppercase tracking-[0.14em]">Theme Tokens</PanelTitle>
      </PanelHeader>
      <PanelContent className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-2">
          {tokenGroups.map((group) => (
            <PushButton
              key={group.id}
              type="button"
              width="100%"
              height="2.75rem"
              variant={activeGroup.id === group.id ? 'chrome' : 'black'}
              onClick={() => onGroupChange(group.id)}
            >
              {group.label}
            </PushButton>
          ))}
        </div>

        <PresetSelector activePresetId={activePresetId} onPresetSelect={onPresetSelect} />

        <div className="mt-5 grid gap-3">
          {activeGroup.controls.map((control) => (
            <TokenField
              key={control.id}
              control={control}
              onManualChange={onManualChange}
              value={values[control.id] ?? control.defaultValue}
              setValues={setValues}
            />
          ))}
        </div>
      </PanelContent>
      <PanelFooter className="grid grid-cols-2 gap-3 px-5 pb-5">
        <PushButton type="button" width="100%" height="2.75rem" variant="black" onClick={onReset}>
          Reset
        </PushButton>
        <PushButton type="button" width="100%" height="2.75rem" onClick={onExport}>
          Export
        </PushButton>
      </PanelFooter>
    </Panel>
  );
}

function ControlLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--analog-panel-muted)]">
        {label}
      </span>
      <span className="font-mono text-xs text-[var(--accent)]">{value}</span>
    </div>
  );
}

function RackPreview() {
  const [drive, setDrive] = useState(64);
  const [tone, setTone] = useState(44);
  const [focus, setFocus] = useState(72);
  const [circuit, setCircuit] = useState(2);
  const [mix, setMix] = useState(-6);
  const [power, setPower] = useState(true);
  const [mode, setMode] = useState<'left' | 'right'>('right');
  const [signalTrim, setSignalTrim] = useState(0);
  const baseEnergy = power ? 18 + drive * 0.55 + focus * 0.18 + (mode === 'right' ? 8 : 0) : 0;
  const energy = power ? clampNumber(baseEnergy + signalTrim, 0, 100) : 0;
  const rightEnergy = power ? clampNumber(energy - 9 + tone * 0.12, 0, 100) : 0;
  const isHot = power && energy > 72;
  const handleSignalChange = (nextValue: number | number[]) => {
    const nextSignal = Array.isArray(nextValue) ? nextValue[0] : nextValue;

    if (typeof nextSignal !== 'number') return;

    setSignalTrim(clampNumber(nextSignal, 0, 100) - baseEnergy);
  };

  return (
    <Panel variant="rack" screwHole="slot" className="min-h-[620px]">
      <PanelHeader className="gap-5 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--analog-panel-muted)]">
              Theme Lab
            </div>
            <PanelTitle className="mt-3 text-3xl uppercase tracking-[0.18em] md:text-4xl">
              Analog Create
            </PanelTitle>
          </div>
          <PanelAction className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Indicator isOn={power} tone="success" size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--analog-panel-muted)]">
                Power
              </span>
            </div>
            <Switch checked={power} onCheckedChange={setPower} />
          </PanelAction>
        </div>
      </PanelHeader>

      <PanelContent className="grid gap-5 px-5 pb-5 md:px-7 md:pb-7 xl:grid-cols-[1fr_280px]">
        <div className="grid gap-5">
          <Panel variant="default" surface="subtle" screws={false}>
            <PanelContent className="grid gap-5 p-5">
              <div className="grid gap-5 md:grid-cols-4">
                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Drive" value={`${Math.round(drive)}%`} />
                  <Dial
                    mode="knob"
                    min={0}
                    max={100}
                    value={drive}
                    className="w-20 md:w-24"
                    onValueChange={setDrive}
                  />
                </div>
                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Tone" value={`${Math.round(tone)}%`} />
                  <Dial
                    mode="knob"
                    min={0}
                    max={100}
                    value={tone}
                    variant="black"
                    className="w-20 md:w-24"
                    onValueChange={setTone}
                  />
                </div>
                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Focus" value={`${Math.round(focus)}%`} />
                  <Dial
                    mode="knob"
                    min={0}
                    max={100}
                    value={focus}
                    className="w-20 md:w-24"
                    onValueChange={setFocus}
                  />
                </div>
                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Circuit" value={['A', 'B', 'C', 'D', 'E'][circuit] ?? 'C'} />
                  <RotarySwitch
                    aria-label="Circuit selector"
                    className="w-24 p-2 md:w-28"
                    min={0}
                    max={4}
                    value={circuit}
                    onValueChange={(next) => setCircuit(next as number)}
                    showMarks={false}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div className="grid gap-4">
                  <ControlLabel label="Wet mix" value={`${mix > 0 ? '+' : ''}${mix} dB`} />
                  <Slider
                    value={mix}
                    min={-24}
                    max={6}
                    marks={[
                      { value: -24, label: '-24' },
                      { value: -6, label: '-6' },
                      { value: 6, label: '+6' },
                    ]}
                    onValueChange={(next) => setMix(next as number)}
                  />
                </div>

                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Circuit" value={mode === 'right' ? 'Wide' : 'Tight'} />
                  <Toggle
                    value={mode}
                    leftIndicatorTone="warning"
                    rightIndicatorTone="success"
                    onValueChange={setMode}
                  />
                </div>
              </div>
            </PanelContent>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel variant="default" surface="subtle" screws={false}>
              <PanelHeader className="p-5 pb-3">
                <PanelTitle className="text-lg uppercase tracking-[0.16em]">
                  Semantic Card
                </PanelTitle>
                <PanelDescription>Program level and headroom.</PanelDescription>
              </PanelHeader>
              <PanelContent className="grid gap-5 px-5 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold">Total Signal</div>
                  <div className="flex items-center gap-2">
                    <Indicator isOn={power} tone="destructive" size="xs" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Gauge
                    aria-label="Total signal gauge"
                    className="w-[4.5rem] max-w-[4.5rem] shrink-0 p-1 [--analog-gauge-center-inset:0.75rem]"
                    max={100}
                    min={0}
                    onValueChange={handleSignalChange}
                    showMarks={false}
                    value={energy}
                    tone={isHot ? 'warning' : 'success'}
                  />
                  <LCDDisplay
                    className="min-w-[8.5rem] flex-1 [&>div]:w-full"
                    label="HDRM"
                    value={Math.round(100 - energy)}
                    units="%"
                    tone={isHot ? 'warning' : 'success'}
                    size="sm"
                    screenClassName="min-w-[8.5rem] px-3 py-2"
                    valueClassName="text-[20px] tracking-[0.08em]"
                  />
                </div>
              </PanelContent>
            </Panel>

            <Panel variant="default" surface="subtle" screws={false}>
              <PanelHeader className="p-5 pb-3">
                <PanelTitle className="text-lg uppercase tracking-[0.16em]">Readout</PanelTitle>
                <PanelDescription>Patch telemetry.</PanelDescription>
              </PanelHeader>
              <PanelContent className="grid justify-items-stretch gap-5 px-5 pb-5">
                <LCDDisplay
                  className="w-full min-w-0 [&>div]:w-full"
                  label="Output"
                  value={Math.round(energy + mix)}
                  units="dB"
                  tone={mode === 'right' ? 'success' : 'warning'}
                  size="md"
                />
                <div className="flex flex-wrap items-center gap-4">
                  <Indicator isOn={power} tone="info" size="sm" />
                  <Indicator isOn={isHot} tone="destructive" size="sm" />
                  <Indicator isOn={power && !isHot} tone="warning" size="sm" />
                </div>
              </PanelContent>
            </Panel>
          </div>
        </div>

        <Panel
          variant="default"
          surface="subtle"
          screws={false}
          className="flex min-h-[360px] flex-col"
        >
          <PanelHeader className="p-5 pb-4">
            <PanelTitle className="text-lg uppercase tracking-[0.16em]">Meters</PanelTitle>
            <PanelDescription>Stereo bus.</PanelDescription>
          </PanelHeader>
          <PanelContent className="flex flex-1 items-center justify-center px-5 pb-5">
            <MeterGroup variant="panel" aria-label="Create page stereo meter">
              <MeterGroupChannel label="L">
                <Meter
                  orientation="vertical"
                  value={energy}
                  peakValue={Math.min(100, energy + 8)}
                  variant="metered"
                  segments={40}
                />
              </MeterGroupChannel>
              <MeterGroupSeparator />
              <MeterGroupChannel label="R">
                <Meter
                  orientation="vertical"
                  value={rightEnergy}
                  peakValue={Math.min(100, rightEnergy + 12)}
                  variant="metered"
                  segments={40}
                />
              </MeterGroupChannel>
            </MeterGroup>
          </PanelContent>
        </Panel>
      </PanelContent>
    </Panel>
  );
}

function MaterialChannelPreview() {
  const channels = materialChannelRows.map(([, channel]) => channel);
  const lightingStyle = useAnalogLighting(channels);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" style={lightingStyle}>
      {materialChannelRows.map(([label, channel, colorVar]) => (
        <div
          key={channel}
          className="grid min-h-16 place-items-center rounded-[var(--analog-radius-window)] border border-white/8 px-3 py-2 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]"
          style={{
            background:
              `linear-gradient(calc(var(--analog-light-angle-${channel}, 180deg) - 90deg), ` +
              `color-mix(in oklch, ${colorVar} 72%, white 12%) 0%, ` +
              `${colorVar} 52%, ` +
              `color-mix(in oklch, ${colorVar} 72%, black 28%) 100%)`,
            boxShadow:
              `inset calc(sin(var(--analog-light-angle-${channel}, 180deg)) * 1px) calc(cos(var(--analog-light-angle-${channel}, 180deg)) * -1px) 1px rgba(255,255,255,calc(0.16 * var(--analog-light-power, 1))), ` +
              `inset calc(sin(var(--analog-light-angle-${channel}, 180deg)) * -2px) calc(cos(var(--analog-light-angle-${channel}, 180deg)) * 2px) 6px rgba(0,0,0,calc(0.46 * var(--analog-shadow-depth, 1)))`,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function SurfacesPreview() {
  const rows = [
    ['Registry', '24 items', 'success'],
    ['Token groups', `${tokenGroups.length} groups`, 'warning'],
    ['Finish recipes', 'Live', 'info'],
  ] as const satisfies ReadonlyArray<readonly [string, string, AnalogTone]>;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map(([label, value, tone]) => (
          <Panel key={label} variant="default" surface="subtle" screws={false}>
            <PanelContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                <Indicator isOn tone={tone} size="xs" disableBezel />
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div>
            </PanelContent>
          </Panel>
        ))}
      </div>

      <Panel variant="rack" screwHole="slot">
        <PanelHeader className="p-5 pb-4">
          <PanelTitle className="text-2xl uppercase tracking-[0.14em]">Surface Palette</PanelTitle>
          <PanelDescription>
            Host app chrome, material ramps, and optical tone roles.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="grid gap-5 px-5 pb-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {palettePreviewControls.map((control) => (
              <div
                key={control.id}
                className="min-h-24 rounded-[var(--analog-radius-window)] border border-white/8 p-3"
                style={{
                  background:
                    `linear-gradient(180deg, color-mix(in oklch, var(${control.cssVar}) 74%, white 10%), ` +
                    `var(${control.cssVar}))`,
                }}
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/70 mix-blend-difference">
                  {control.label}
                </div>
              </div>
            ))}
          </div>

          <Panel variant="default" surface="subtle" screws={false}>
            <PanelContent className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <PushButton type="button" width="8rem" height="2.75rem">
                  Primary
                </PushButton>
                <PushButton type="button" width="8rem" height="2.75rem" variant="black">
                  Secondary
                </PushButton>
              </div>
              <div className="mt-6 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4">
                <Gauge
                  aria-label="Theme token level gauge"
                  className="max-w-[7rem] p-1"
                  disabled
                  value={74}
                  tone="info"
                />
                <LCDDisplay
                  className="w-full min-w-0 [&>div]:w-full"
                  label="Accent"
                  value={74}
                  units="%"
                  tone="info"
                  size="sm"
                />
              </div>
              <div className="mt-6 grid gap-3">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Optical tones
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tonePreviewRows.map(([label, tone]) => (
                    <div
                      key={tone}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-[var(--analog-radius-window)] border border-white/8 bg-black/18 px-3 py-2"
                    >
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {label}
                      </span>
                      <Indicator isOn tone={tone} size="xs" disableBezel />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Lighting channels
                </div>
                <MaterialChannelPreview />
              </div>
            </PanelContent>
          </Panel>
        </PanelContent>
      </Panel>
    </div>
  );
}

function PreviewStage({
  activeTab,
  setActiveTab,
  themeStyle,
  exportCss,
}: {
  activeTab: (typeof previewTabs)[number];
  setActiveTab: (tab: (typeof previewTabs)[number]) => void;
  themeStyle: CSSProperties;
  exportCss: string;
}) {
  return (
    <Panel
      variant="rack"
      screws={false}
      className="min-w-0 p-3 text-[var(--foreground)] md:p-5"
      style={themeStyle}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {previewTabs.map((tab) => (
            <PushButton
              key={tab}
              type="button"
              width="6.5rem"
              height="2.6rem"
              variant={activeTab === tab ? 'chrome' : 'black'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </PushButton>
          ))}
        </div>
        <PushButton href="/docs/design/tokens" width="8.75rem" height="2.5rem" variant="black">
          tokens.md
        </PushButton>
      </div>

      {activeTab === 'Rack' ? <RackPreview /> : null}
      {activeTab === 'Surfaces' ? <SurfacesPreview /> : null}
      {activeTab === 'Code' ? (
        <pre className="max-h-[680px] overflow-auto rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/42 p-4 text-sm leading-6 text-[#e6e6dc]">
          <code>{exportCss}</code>
        </pre>
      ) : null}
    </Panel>
  );
}

export default function CreateThemePage() {
  const pageRef = useRef<HTMLElement>(null);
  const [values, setValues] = useState<ThemeValues>(defaultThemeValues);
  const [activePresetId, setActivePresetId] = useState(defaultPresetId);
  const [activeGroupId, setActiveGroupId] = useState(tokenGroups[0].id);
  const [activeTab, setActiveTab] = useState<(typeof previewTabs)[number]>('Rack');
  const [exportMessage, setExportMessage] = useState('Ready');
  const themeStyle = useMemo(() => getThemeStyle(values), [values]);
  const exportCss = useMemo(() => getThemeCss(values), [values]);
  const activeGroup = tokenGroups.find((group) => group.id === activeGroupId) ?? tokenGroups[0];
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.34,
    targetRef: pageRef,
  });

  const handleExport = async () => {
    setActiveTab('Code');

    try {
      await navigator.clipboard.writeText(exportCss);
      setExportMessage('Copied');
    } catch {
      setExportMessage('Code ready');
    }
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setValues(getPresetValues(preset));
    setActivePresetId(preset.id);
    setExportMessage(preset.name);
  };

  const handleManualChange = () => {
    setActivePresetId('custom');
    setExportMessage('Custom');
  };

  const handleReset = () => {
    setValues(defaultThemeValues);
    setActivePresetId(defaultPresetId);
    setExportMessage('Ready');
  };

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <section ref={pageRef} className="site-frame pt-8 md:pt-10">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow mb-4">Create Theme</div>
            <h1 className="max-w-3xl text-4xl font-semibold text-white md:text-6xl">
              Analog theme workbench
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#a9a9a2]">
              {exportMessage}
            </span>
            <PushButton type="button" width="10rem" onClick={handleExport}>
              Export Theme
            </PushButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <ThemeWorkbench
            activeGroup={activeGroup}
            activePresetId={activePresetId}
            values={values}
            onManualChange={handleManualChange}
            setValues={setValues}
            onExport={handleExport}
            onGroupChange={setActiveGroupId}
            onPresetSelect={handlePresetSelect}
            onReset={handleReset}
          />
          <PreviewStage
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            themeStyle={themeStyle}
            exportCss={exportCss}
          />
        </div>
      </section>
    </AnalogLightingProvider>
  );
}
