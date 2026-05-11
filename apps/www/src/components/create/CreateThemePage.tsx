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
  Slider,
  PushButton,
  Switch,
  Toggle,
  usePointerLighting,
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
        id: 'secondary',
        cssVar: '--secondary',
        label: 'Secondary',
        kind: 'color',
        defaultValue: '#54595c',
      },
      { id: 'accent', cssVar: '--accent', label: 'Accent', kind: 'color', defaultValue: '#78e6a5' },
      {
        id: 'mutedForeground',
        cssVar: '--muted-foreground',
        label: 'Muted text',
        kind: 'color',
        defaultValue: '#9a9b96',
      },
      { id: 'border', cssVar: '--border', label: 'Border', kind: 'color', defaultValue: '#313436' },
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
    id: 'materials',
    label: 'Materials',
    eyebrow: 'Analog Materials',
    controls: [
      {
        id: 'surfaceCavity',
        cssVar: '--analog-surface-cavity',
        label: 'Cavity',
        kind: 'color',
        defaultValue: '#070809',
      },
      {
        id: 'surfaceCavityStrong',
        cssVar: '--analog-surface-cavity-strong',
        label: 'Deep cavity',
        kind: 'color',
        defaultValue: '#0c0d0f',
      },
      {
        id: 'surfacePanel',
        cssVar: '--analog-surface-panel',
        label: 'Panel',
        kind: 'color',
        defaultValue: '#151719',
      },
      {
        id: 'surfaceRaised',
        cssVar: '--analog-surface-raised',
        label: 'Raised',
        kind: 'color',
        defaultValue: '#25282a',
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
    label: 'Emissive',
    eyebrow: 'LED / LCD',
    controls: [
      {
        id: 'ledGreen',
        cssVar: '--analog-led-green-base',
        label: 'Green',
        kind: 'color',
        defaultValue: '#35d36b',
      },
      {
        id: 'ledAmber',
        cssVar: '--analog-led-amber-base',
        label: 'Amber',
        kind: 'color',
        defaultValue: '#f1b53f',
      },
      {
        id: 'ledRed',
        cssVar: '--analog-led-red-base',
        label: 'Red',
        kind: 'color',
        defaultValue: '#f25b4b',
      },
      {
        id: 'ledBlue',
        cssVar: '--analog-led-blue-base',
        label: 'Blue',
        kind: 'color',
        defaultValue: '#55a8ff',
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
  ['--popover', 'var(--card)'],
  ['--popover-foreground', 'var(--card-foreground)'],
  ['--primary', 'var(--accent)'],
  ['--primary-foreground', 'var(--background)'],
  ['--secondary-foreground', 'var(--foreground)'],
  ['--muted', 'color-mix(in oklch, var(--card) 82%, var(--background))'],
  ['--accent-foreground', 'var(--background)'],
  ['--destructive', 'var(--analog-led-red-base)'],
  ['--destructive-foreground', 'var(--background)'],
  ['--input', 'var(--border)'],
  ['--font-mono', "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace"],
  ['--spacing-track-padding', 'var(--analog-track-padding)'],
  ['--color-background', 'var(--background)'],
  ['--color-foreground', 'var(--foreground)'],
  ['--color-card', 'var(--card)'],
  ['--color-card-foreground', 'var(--card-foreground)'],
  ['--color-secondary', 'var(--secondary)'],
  ['--color-accent', 'var(--accent)'],
  ['--color-muted-foreground', 'var(--muted-foreground)'],
  ['--color-border', 'var(--border)'],
  ['--color-ring', 'var(--ring)'],
] as const;

const previewTabs = ['Rack', 'Cards', 'Code'] as const;

const initialThemeValues = Object.fromEntries(
  allControls.map((control) => [control.id, control.defaultValue]),
) as ThemeValues;

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
    '  /* shadcn-compatible aliases */',
    ...derivedVars
      .filter(([name]) => !name.startsWith('--color-'))
      .map(([name, value]) => `  ${name}: ${value};`),
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
  setValues,
}: {
  control: TokenControl;
  value: string;
  setValues: Dispatch<SetStateAction<ThemeValues>>;
}) {
  const updateValue = (nextValue: string) => {
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

function ThemeWorkbench({
  activeGroup,
  values,
  setValues,
  onExport,
  onGroupChange,
}: {
  activeGroup: TokenGroup;
  values: ThemeValues;
  setValues: Dispatch<SetStateAction<ThemeValues>>;
  onExport: () => void;
  onGroupChange: (groupId: string) => void;
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

        <div className="mt-5 grid gap-3">
          {activeGroup.controls.map((control) => (
            <TokenField
              key={control.id}
              control={control}
              value={values[control.id] ?? control.defaultValue}
              setValues={setValues}
            />
          ))}
        </div>
      </PanelContent>
      <PanelFooter className="grid grid-cols-2 gap-3 px-5 pb-5">
        <PushButton
          type="button"
          width="100%"
          height="2.75rem"
          variant="black"
          onClick={() => setValues(initialThemeValues)}
        >
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
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8f8f89]">
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#85857d]">
              Theme Lab
            </div>
            <PanelTitle className="mt-3 text-3xl uppercase tracking-[0.18em] md:text-4xl">
              Analog Create
            </PanelTitle>
          </div>
          <PanelAction className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Indicator isOn={power} color="green" size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a2a29a]">
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid justify-items-center gap-3">
                  <ControlLabel label="Drive" value={`${Math.round(drive)}%`} />
                  <Dial
                    mode="knob"
                    min={0}
                    max={100}
                    value={drive}
                    className="w-24 md:w-28"
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
                    className="w-24 md:w-28"
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
                    className="w-24 md:w-28"
                    onValueChange={setFocus}
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
                  <Toggle value={mode} leftLed="amber" rightLed="green" onValueChange={setMode} />
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
              <PanelContent className="px-5 pb-5">
                <Panel variant="default" surface="subtle" screws={false}>
                  <PanelContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold">Total Signal</div>
                      <div className="flex items-center gap-2">
                        <Indicator isOn={power} color="red" size="xs" />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                          LIVE
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3">
                      <Gauge
                        aria-label="Total signal gauge"
                        className="max-w-[4.75rem] p-1 [--analog-gauge-center-inset:0.75rem]"
                        max={100}
                        min={0}
                        onValueChange={handleSignalChange}
                        showMarks={false}
                        value={energy}
                        variant={isHot ? 'lcd-amber' : 'lcd-green'}
                      />
                      <LCDDisplay
                        className="w-full min-w-0 [&>div]:w-full"
                        label="HDRM"
                        value={Math.round(100 - energy)}
                        units="%"
                        variant={isHot ? 'lcd-amber' : 'lcd-green'}
                        size="sm"
                        screenClassName="px-2 py-1.5"
                        valueClassName="text-[18px] tracking-[0.08em]"
                      />
                    </div>
                  </PanelContent>
                </Panel>
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
                  variant={mode === 'right' ? 'lcd-green' : 'lcd-amber'}
                  size="md"
                />
                <div className="flex flex-wrap items-center gap-4">
                  <Indicator isOn={power} color="blue" size="sm" />
                  <Indicator isOn={isHot} color="red" size="sm" />
                  <Indicator isOn={power && !isHot} color="amber" size="sm" />
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

function CardsPreview() {
  const rows = [
    ['Registry', '24 items', 'green'],
    ['Token tiers', '3 layers', 'amber'],
    ['Finish recipes', 'Live', 'blue'],
  ] as const;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map(([label, value, color]) => (
          <Panel key={label} variant="default" surface="subtle" screws={false}>
            <PanelContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                <Indicator isOn color={color} size="xs" disableBezel />
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div>
            </PanelContent>
          </Panel>
        ))}
      </div>

      <Panel variant="rack" screwHole="slot">
        <PanelHeader className="p-5 pb-4">
          <PanelTitle className="text-2xl uppercase tracking-[0.14em]">Surface Palette</PanelTitle>
          <PanelDescription>Host tokens, material ramps, and emissive colors.</PanelDescription>
        </PanelHeader>
        <PanelContent className="grid gap-5 px-5 pb-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {allControls
              .filter((control) => control.kind === 'color')
              .slice(0, 16)
              .map((control) => (
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
                  variant="lcd-blue"
                />
                <LCDDisplay
                  className="w-full min-w-0 [&>div]:w-full"
                  label="Accent"
                  value={74}
                  units="%"
                  variant="lcd-blue"
                  size="sm"
                />
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
              width="5.75rem"
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
      {activeTab === 'Cards' ? <CardsPreview /> : null}
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
  const [values, setValues] = useState<ThemeValues>(initialThemeValues);
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

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <section ref={pageRef} className="site-frame pt-8 md:pt-10">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow mb-4">Create Theme</div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
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
            values={values}
            setValues={setValues}
            onExport={handleExport}
            onGroupChange={setActiveGroupId}
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
