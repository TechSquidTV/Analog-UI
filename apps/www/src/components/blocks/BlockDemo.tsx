import { useEffect, useRef, useState, type ReactNode } from 'react';

import {
  Indicator,
  LCDDisplay,
  AnalogLightingProvider,
  Meter,
  MeterGroup,
  MeterGroupChannel,
  MeterGroupSeparator,
  Slider,
  Switch,
  Toggle,
  WheelNumber,
  WheelSelect,
  Dial,
  Gauge,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  SquareButton,
  SquareToggle,
  NeedleGauge,
  type NeedleGaugeScalePreset,
  usePointerLighting,
} from '../../../../../packages/analog-ui/src/index';
import { cn } from '../../../../../packages/analog-ui/src/lib/utils';
import { RockerThumbSurface } from '../../../../../packages/analog-ui/src/registry/components/analog/RockerThumbSurface';
import type { BlockName } from '../../data/block-catalog';

type DemoMode = 'compact' | 'full';

interface BlockDemoProps {
  name: BlockName;
  mode?: DemoMode;
}

function useAudioMeter() {
  const [channels, setChannels] = useState({ l: 0, r: 0, lPeak: 0, rPeak: 0 });
  const lPeakRef = useRef(0);
  const rPeakRef = useRef(0);
  const lPeakTime = useRef(0);
  const rPeakTime = useRef(0);

  useEffect(() => {
    const tick = () => {
      setChannels((prev) => {
        const isHitL = Math.random() < 0.1;
        const isHitR = Math.random() < 0.1;

        const targetL = isHitL ? 50 + Math.random() * 50 : 0;
        const targetR = isHitR ? 50 + Math.random() * 50 : 0;

        let newL = prev.l;
        if (targetL > prev.l) newL = targetL;
        else newL = Math.max(0, prev.l - 6);

        let newR = prev.r;
        if (targetR > prev.r) newR = targetR;
        else newR = Math.max(0, prev.r - 6);

        if (newL >= prev.lPeak) {
          lPeakRef.current = newL;
          lPeakTime.current = Date.now();
        } else if (Date.now() - lPeakTime.current > 1500) {
          lPeakRef.current = Math.max(newL, lPeakRef.current - 1);
        }

        if (newR >= prev.rPeak) {
          rPeakRef.current = newR;
          rPeakTime.current = Date.now();
        } else if (Date.now() - rPeakTime.current > 1500) {
          rPeakRef.current = Math.max(newR, rPeakRef.current - 1);
        }

        return { l: newL, r: newR, lPeak: lPeakRef.current, rPeak: rPeakRef.current };
      });
    };

    const interval = window.setInterval(tick, 40);
    return () => window.clearInterval(interval);
  }, []);

  return channels;
}

function FooterItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-[110px] flex-1 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
        {label}
      </div>
      <div className="mt-1 font-mono text-[12px] text-[#e5e5e5]">{value}</div>
    </div>
  );
}

function ControlButton({
  isActive,
  onClick,
  children,
}: {
  isActive?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-200',
        isActive
          ? 'border-white/16 bg-white/[0.08] text-white'
          : 'border-white/8 bg-white/[0.03] text-[#a8a8a8] hover:border-white/14 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function DemoStage({
  mode,
  footer,
  children,
}: {
  mode: DemoMode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: mode === 'compact' ? 0.24 : 0.38,
    targetRef: surfaceRef,
  });

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <div
        ref={surfaceRef}
        className={cn(
          'section-panel',
          mode === 'compact' ? 'min-h-[280px] p-5' : 'min-h-[430px] p-8',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-[1px] rounded-[var(--analog-radius-shell)] border border-white/4" />
        <div className="relative z-10 flex h-full flex-col gap-6">
          <div className="flex flex-1 items-center justify-center">{children}</div>
          {footer ? <div className="flex flex-wrap gap-3">{footer}</div> : null}
        </div>
      </div>
    </AnalogLightingProvider>
  );
}

function DialDemo({ mode }: { mode: DemoMode }) {
  const [value, setValue] = useState(42);
  const [auxValue, setAuxValue] = useState(218);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Chrome" value={`${Math.round(value)}°`} />
          <FooterItem label="Black" value={`${Math.round(auxValue)}°`} />
          <FooterItem label="Travel" value="Continuous" />
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-10">
        <Dial value={value} onChange={(next) => setValue(next)} />
        {mode === 'full' ? (
          <Dial variant="black" value={auxValue} onChange={(next) => setAuxValue(next)} />
        ) : null}
      </div>
    </DemoStage>
  );
}

function SliderDemo({ mode }: { mode: DemoMode }) {
  const [verticalValue, setVerticalValue] = useState(2);
  const [horizontalValue, setHorizontalValue] = useState(-12);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Vertical" value={`${verticalValue} dB`} />
          <FooterItem label="Horizontal" value={`${horizontalValue} dB`} />
          <FooterItem label="Travel" value="100 mm" />
        </>
      }
    >
      <div
        className={cn(
          'flex w-full items-center justify-center gap-10',
          mode === 'compact' ? 'max-w-[360px] flex-col' : 'max-w-3xl',
        )}
      >
        {mode === 'full' ? (
          <Slider
            orientation="vertical"
            variant="chrome"
            min={-40}
            max={10}
            value={verticalValue}
            onValueChange={(next) => setVerticalValue(next as number)}
          />
        ) : null}

        <div className="w-full max-w-md">
          <Slider
            orientation="horizontal"
            variant="black"
            min={-40}
            max={10}
            value={horizontalValue}
            onValueChange={(next) => setHorizontalValue(next as number)}
            className="w-full"
          />
        </div>
      </div>
    </DemoStage>
  );
}

function ToggleDemo({ mode }: { mode: DemoMode }) {
  const [mainValue, setMainValue] = useState<'left' | 'right'>('right');
  const [auxValue, setAuxValue] = useState<'left' | 'right'>('left');
  const [verticalValue, setVerticalValue] = useState<'left' | 'right'>('right');

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Main Bus" value={mainValue === 'right' ? 'On' : 'Off'} />
          <FooterItem label="Aux Bus" value={auxValue === 'right' ? 'On' : 'Off'} />
          <FooterItem label="Lighting" value="LED aware" />
        </>
      }
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-10',
          mode === 'compact' && 'max-w-[420px]',
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#636363]">
              Main
            </span>
            <Toggle
              value={mainValue}
              onValueChange={setMainValue}
              leftLed="amber"
              rightLed="green"
            />
          </div>
          <div className="flex items-center gap-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#636363]">
              Aux
            </span>
            <Toggle
              variant="black"
              value={auxValue}
              onValueChange={setAuxValue}
              leftLed="red"
              rightLed="green"
            />
          </div>
        </div>

        {mode === 'full' ? (
          <div className="flex flex-col items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#636363]">
              Bay Door
            </span>
            <Toggle
              orientation="vertical"
              value={verticalValue}
              onValueChange={setVerticalValue}
              leftLed="amber"
              rightLed="green"
            />
          </div>
        ) : null}
      </div>
    </DemoStage>
  );
}

function SquareButtonDemo({ mode }: { mode: DemoMode }) {
  const [lastAction, setLastAction] = useState('Idle');

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Last Action" value={lastAction} />
          <FooterItem label="Travel" value="Momentary" />
          <FooterItem label="Hardware" value="Square plunger" />
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8">
            <SquareButton onClick={() => setLastAction('Push')}>PUSH</SquareButton>
            {mode === 'full' ? (
              <SquareButton variant="black" onClick={() => setLastAction('Exec')}>
                EXEC
              </SquareButton>
            ) : null}
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#555]">
            Momentary
          </span>
        </div>
      </div>
    </DemoStage>
  );
}

function SquareToggleDemo({ mode }: { mode: DemoMode }) {
  const [mainToggle, setMainToggle] = useState(true);
  const [auxToggle, setAuxToggle] = useState(false);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Power" value={mainToggle ? 'On' : 'Off'} />
          <FooterItem label="Arm" value={auxToggle ? 'On' : 'Off'} />
          <FooterItem label="Behavior" value="Latching LED" />
        </>
      }
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-12',
          mode === 'compact' && 'max-w-[420px]',
        )}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8">
            <SquareToggle
              pressed={mainToggle}
              onPressedChange={setMainToggle}
              indicatorColor="green"
            >
              PWR
            </SquareToggle>
            <SquareToggle
              variant="black"
              pressed={auxToggle}
              onPressedChange={setAuxToggle}
              indicatorColor="red"
            >
              ARM
            </SquareToggle>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#555]">
            Latching (LED)
          </span>
        </div>
      </div>
    </DemoStage>
  );
}

function SwitchDemo({ mode }: { mode: DemoMode }) {
  const [warp, setWarp] = useState(true);
  const [stealth, setStealth] = useState(false);
  const [launch, setLaunch] = useState(true);
  const [cloak, setCloak] = useState(false);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Warp" value={warp ? 'Enabled' : 'Disabled'} />
          <FooterItem label="Stealth" value={stealth ? 'Enabled' : 'Disabled'} />
          <FooterItem label="Launch" value={launch ? 'Enabled' : 'Disabled'} />
          <FooterItem label="Cloak" value={cloak ? 'Enabled' : 'Disabled'} />
          <FooterItem label="Behavior" value="Center-pivot roll" />
        </>
      }
    >
      <div className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-12">
        <div className="flex w-full max-w-md flex-col gap-10">
          <div className="flex items-center justify-between gap-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
              Warp
            </span>
            <Switch checked={warp} onCheckedChange={setWarp} />
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
              Stealth
            </span>
            <Switch variant="black" checked={stealth} onCheckedChange={setStealth} />
          </div>
        </div>

        <div className="flex items-start justify-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
              Launch
            </span>
            <Switch orientation="vertical" checked={launch} onCheckedChange={setLaunch} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
              Cloak
            </span>
            <Switch
              orientation="vertical"
              variant="black"
              checked={cloak}
              onCheckedChange={setCloak}
            />
          </div>
        </div>
      </div>
    </DemoStage>
  );
}

function WheelSelectDemo({ mode }: { mode: DemoMode }) {
  const options = ['PITCH DOWN', 'NEUTRAL', 'PITCH UP'];
  const [value, setValue] = useState(options[1]);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Selected" value={value} />
          <FooterItem label="Mode" value="Infinite cycle" />
        </>
      }
    >
      <div className="flex items-center justify-center gap-8">
        <WheelSelect options={options} value={value} onValueChange={setValue} infinite />
      </div>
    </DemoStage>
  );
}

function WheelNumberDemo({ mode }: { mode: DemoMode }) {
  const [value, setValue] = useState(0);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Value" value={value.toString()} />
          <FooterItem label="Interaction" value="Scrub + wheel" />
        </>
      }
    >
      <WheelNumber value={value} onValueChange={(next) => setValue(next ?? 0)} />
    </DemoStage>
  );
}

function GaugeDemo({ mode }: { mode: DemoMode }) {
  const [value, setValue] = useState(42);
  const [variant, setVariant] = useState<'lcd-green' | 'lcd-amber' | 'lcd-blue'>('lcd-green');

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Value" value={`${value}%`} />
          <div className="flex min-w-[180px] flex-1 flex-wrap gap-2 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2">
            <div className="w-full text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
              Variant
            </div>
            <ControlButton
              isActive={variant === 'lcd-green'}
              onClick={() => setVariant('lcd-green')}
            >
              Green
            </ControlButton>
            <ControlButton
              isActive={variant === 'lcd-amber'}
              onClick={() => setVariant('lcd-amber')}
            >
              Amber
            </ControlButton>
            <ControlButton isActive={variant === 'lcd-blue'} onClick={() => setVariant('lcd-blue')}>
              Blue
            </ControlButton>
          </div>
        </>
      }
    >
      <Gauge value={value} onValueChange={(next) => setValue(next as number)} variant={variant} />
    </DemoStage>
  );
}

function LCDDisplayDemo({ mode }: { mode: DemoMode }) {
  const programs = [
    { label: 'Program', value: 'CH-07', units: 'MEM' },
    { label: 'Output Trim', value: '-12.8', units: 'DB' },
    { label: 'Delay Time', value: '88:12', units: 'MS' },
  ] as const;
  const [variant, setVariant] = useState<'lcd-green' | 'lcd-amber' | 'lcd-blue'>('lcd-green');
  const [programIndex, setProgramIndex] = useState(0);
  const current = programs[programIndex];

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Readout" value={current.value} />
          <FooterItem label="Preset" value={current.label} />
          <div className="flex min-w-[220px] flex-1 flex-wrap gap-2 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2">
            <div className="w-full text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
              Variant
            </div>
            <ControlButton
              isActive={variant === 'lcd-green'}
              onClick={() => setVariant('lcd-green')}
            >
              Green
            </ControlButton>
            <ControlButton
              isActive={variant === 'lcd-amber'}
              onClick={() => setVariant('lcd-amber')}
            >
              Amber
            </ControlButton>
            <ControlButton isActive={variant === 'lcd-blue'} onClick={() => setVariant('lcd-blue')}>
              Blue
            </ControlButton>
            <ControlButton
              onClick={() => setProgramIndex((index) => (index + 1) % programs.length)}
            >
              Profile
            </ControlButton>
          </div>
        </>
      }
    >
      <div className="analog-docs-lcd-pixel flex flex-col items-center gap-6">
        <LCDDisplay
          label={current.label}
          value={current.value}
          units={current.units}
          variant={variant}
          size={mode === 'compact' ? 'md' : 'lg'}
          digits={6}
        />
        {mode === 'full' ? (
          <LCDDisplay
            label="Peak Hold"
            value="-03.2"
            units="DB"
            variant="lcd-amber"
            size="sm"
            digits={5}
          />
        ) : null}
      </div>
    </DemoStage>
  );
}

function NeedleGaugeDemo({ mode }: { mode: DemoMode }) {
  const presets = {
    vu: { value: -3, unit: 'VU', label: 'OUTPUT', points: [-14, -3, 2] },
    dbfs: { value: -9, unit: 'dB', label: 'BUS', points: [-32, -9, 3] },
    linear: { value: 64, unit: '%', label: 'LOAD', points: [18, 64, 94] },
  } satisfies Record<
    NeedleGaugeScalePreset,
    { value: number; unit: string; label: string; points: [number, number, number] }
  >;
  const [scalePreset, setScalePreset] = useState<NeedleGaugeScalePreset>('vu');
  const [value, setValue] = useState(presets.vu.value);
  const [variant, setVariant] = useState<'chrome' | 'black'>('chrome');
  const preset = presets[scalePreset];

  const setPreset = (nextPreset: NeedleGaugeScalePreset) => {
    setScalePreset(nextPreset);
    setValue(presets[nextPreset].value);
  };

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Needle" value={`${value}${preset.unit}`} />
          <div className="flex min-w-0 flex-1 basis-full flex-wrap gap-2 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2 sm:min-w-[220px] sm:basis-auto">
            <div className="w-full text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
              Range
            </div>
            <ControlButton isActive={scalePreset === 'vu'} onClick={() => setPreset('vu')}>
              VU
            </ControlButton>
            <ControlButton isActive={scalePreset === 'dbfs'} onClick={() => setPreset('dbfs')}>
              dBFS
            </ControlButton>
            <ControlButton isActive={scalePreset === 'linear'} onClick={() => setPreset('linear')}>
              Load
            </ControlButton>
          </div>
          {mode === 'full' ? (
            <div className="flex min-w-0 flex-1 basis-full flex-wrap gap-2 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2 sm:min-w-[260px] sm:basis-auto">
              <div className="w-full text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
                Reading
              </div>
              <ControlButton onClick={() => setValue(preset.points[0])}>Low</ControlButton>
              <ControlButton onClick={() => setValue(preset.points[1])}>Nom</ControlButton>
              <ControlButton onClick={() => setValue(preset.points[2])}>Peak</ControlButton>
            </div>
          ) : null}
          {mode === 'full' ? (
            <div className="flex min-w-[180px] flex-none flex-wrap gap-2 rounded-[var(--analog-radius-shell)] border border-white/10 bg-black/30 px-3 py-2">
              <div className="w-full text-[9px] font-semibold uppercase tracking-[0.26em] text-[#787878]">
                Shell
              </div>
              <ControlButton isActive={variant === 'chrome'} onClick={() => setVariant('chrome')}>
                Chrome
              </ControlButton>
              <ControlButton isActive={variant === 'black'} onClick={() => setVariant('black')}>
                Black
              </ControlButton>
            </div>
          ) : null}
        </>
      }
    >
      <NeedleGauge
        value={value}
        scalePreset={scalePreset}
        unit={preset.unit}
        label={preset.label}
        variant={variant}
        className={mode === 'compact' ? 'max-w-[17rem]' : 'max-w-full sm:max-w-[22rem]'}
      />
    </DemoStage>
  );
}

function MeterDemo({ mode }: { mode: DemoMode }) {
  const meter = useAudioMeter();

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Left" value={`${Math.round(meter.l)} / ${Math.round(meter.lPeak)}`} />
          <FooterItem label="Right" value={`${Math.round(meter.r)} / ${Math.round(meter.rPeak)}`} />
          <FooterItem label="Display" value="Stereo" />
        </>
      }
    >
      <div className={cn(mode === 'compact' ? 'scale-[0.82]' : 'scale-100')}>
        <MeterGroup aria-label="Stereo output meter">
          <MeterGroupChannel label="L">
            <Meter
              orientation="vertical"
              value={meter.l}
              peakValue={meter.lPeak}
              variant="metered"
              segments={40}
            />
          </MeterGroupChannel>
          <MeterGroupSeparator />
          <MeterGroupChannel label="R">
            <Meter
              orientation="vertical"
              value={meter.r}
              peakValue={meter.rPeak}
              variant="metered"
              segments={40}
            />
          </MeterGroupChannel>
        </MeterGroup>
      </div>
    </DemoStage>
  );
}

function IndicatorDemo({ mode }: { mode: DemoMode }) {
  const colors = ['red', 'amber', 'green', 'blue', 'white'] as const;
  const [isOn, setIsOn] = useState(true);
  const [colorIndex, setColorIndex] = useState(1);
  const color = colors[colorIndex];

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem
            label="State"
            value={
              <button
                type="button"
                onClick={() => setIsOn((current) => !current)}
                className="text-left"
              >
                {isOn ? 'Powered' : 'Dark'}
              </button>
            }
          />
          <FooterItem
            label="Color"
            value={
              <button
                type="button"
                onClick={() => setColorIndex((current) => (current + 1) % colors.length)}
                className="text-left capitalize"
              >
                {color}
              </button>
            }
          />
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <Indicator isOn={isOn} color={color} size="lg" variant="chrome" />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
            Chrome
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Indicator isOn={isOn} color={color} size="lg" variant="black" />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
            Black
          </span>
        </div>
      </div>
    </DemoStage>
  );
}

function PanelDemo({ mode }: { mode: DemoMode }) {
  const meter = useAudioMeter();
  const [compression, setCompression] = useState<'left' | 'right'>('left');
  const [makeupGain, setMakeupGain] = useState<number[]>([4]);
  const [bypass, setBypass] = useState(false);

  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Compression" value={compression === 'right' ? 'Fast' : 'Warm'} />
          <FooterItem label="Makeup" value={`${makeupGain[0]} dB`} />
          <FooterItem label="Bypass" value={bypass ? 'Armed' : 'Listening'} />
        </>
      }
    >
      <div className={cn('w-full max-w-4xl', mode === 'compact' ? 'scale-[0.86]' : 'scale-100')}>
        <Panel variant="rack" screws className="w-full">
          <PanelHeader>
            <PanelTitle>Master Bus</PanelTitle>
            <PanelDescription>Dynamics, makeup gain, and stereo output</PanelDescription>
          </PanelHeader>
          <PanelContent className="grid gap-12 md:grid-cols-[minmax(0,1fr)_176px] md:items-stretch">
            <div className="flex flex-col justify-center gap-10 py-2">
              <div className="flex items-center justify-between gap-6">
                <span className="text-sm text-[#a0a0a0]">Compression</span>
                <Toggle value={compression} onValueChange={setCompression} className="w-[104px]" />
              </div>
              <div className="flex flex-col gap-10 pt-4">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-[#a0a0a0]">Makeup Gain</span>
                  <span className="text-xs font-mono text-[#555]">{makeupGain[0]} dB</span>
                </div>
                <div className="px-2 pb-2 pt-4">
                  <Slider
                    value={makeupGain}
                    onValueChange={(next) =>
                      setMakeupGain(Array.isArray(next) ? [...next] : [next as number])
                    }
                    max={12}
                    min={-12}
                    orientation="horizontal"
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center md:min-h-0 md:self-stretch md:pl-8">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-px md:block"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0), color-mix(in oklch, var(--analog-surface-raised) 42%, transparent) 18%, rgba(0,0,0,0.55) 50%, color-mix(in oklch, var(--analog-surface-raised) 24%, transparent) 82%, rgba(255,255,255,0))',
                }}
              />
              <MeterGroup variant="panel" aria-label="Master bus stereo output">
                <MeterGroupChannel label="L">
                  <Meter
                    orientation="vertical"
                    value={meter.l}
                    peakValue={meter.lPeak}
                    variant="metered"
                    segments={40}
                  />
                </MeterGroupChannel>
                <MeterGroupSeparator />
                <MeterGroupChannel label="R">
                  <Meter
                    orientation="vertical"
                    value={meter.r}
                    peakValue={meter.rPeak}
                    variant="metered"
                    segments={40}
                  />
                </MeterGroupChannel>
              </MeterGroup>
            </div>
          </PanelContent>
          <PanelFooter>
            <button
              type="button"
              onClick={() => setBypass((current) => !current)}
              className={cn(
                'w-full rounded py-2 font-mono text-sm uppercase tracking-widest shadow-[inset_0_1px_rgba(255,255,255,0.05),0_1px_4px_rgba(0,0,0,0.5)] transition-colors',
                bypass
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[#222] text-[#888] hover:bg-[#333]',
              )}
            >
              Bypass
            </button>
          </PanelFooter>
        </Panel>
      </div>
    </DemoStage>
  );
}

function RockerThumbSurfaceDemo({ mode }: { mode: DemoMode }) {
  return (
    <DemoStage
      mode={mode}
      footer={
        <>
          <FooterItem label="Usage" value="Slider + switch hardware" />
          <FooterItem label="Variants" value="Chrome / Black" />
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-black/40 p-3">
            <RockerThumbSurface
              className="h-9 w-[88px] rounded-sm"
              variant="chrome"
              orientation="horizontal"
              raisedSide="both"
            />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
            Horizontal
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-black/40 p-3">
            <RockerThumbSurface
              className="h-[88px] w-9 rounded-sm"
              variant="black"
              orientation="vertical"
              raisedSide="both"
            />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#686868]">
            Vertical
          </span>
        </div>
      </div>
    </DemoStage>
  );
}

export default function BlockDemo({ name, mode = 'full' }: BlockDemoProps) {
  switch (name) {
    case 'dial':
      return <DialDemo mode={mode} />;
    case 'slider':
      return <SliderDemo mode={mode} />;
    case 'toggle':
      return <ToggleDemo mode={mode} />;
    case 'square-button':
      return <SquareButtonDemo mode={mode} />;
    case 'square-toggle':
      return <SquareToggleDemo mode={mode} />;
    case 'switch':
      return <SwitchDemo mode={mode} />;
    case 'wheel-select':
      return <WheelSelectDemo mode={mode} />;
    case 'wheel-number':
      return <WheelNumberDemo mode={mode} />;
    case 'gauge':
      return <GaugeDemo mode={mode} />;
    case 'lcd-display':
      return <LCDDisplayDemo mode={mode} />;
    case 'needle-gauge':
      return <NeedleGaugeDemo mode={mode} />;
    case 'meter':
      return <MeterDemo mode={mode} />;
    case 'indicator':
      return <IndicatorDemo mode={mode} />;
    case 'panel':
      return <PanelDemo mode={mode} />;
    case 'rocker-thumb-surface':
      return <RockerThumbSurfaceDemo mode={mode} />;
    default:
      return null;
  }
}
