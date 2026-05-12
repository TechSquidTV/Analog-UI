import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  Dial,
  Gauge,
  Indicator,
  LCDDisplay,
  Meter,
  MeterGroup,
  MeterGroupChannel,
  MeterGroupSeparator,
  NeedleGauge,
  Panel,
  PanelContent,
  PushButton,
  PushToggle,
  RockerSwitchGroup,
  RockerSwitchGroupItem,
  RotarySwitch,
  Slider,
  Switch,
  Toggle,
  ToggleButtonGroup,
  ToggleButtonGroupItem,
  WheelNumber,
  type AnalogTone,
} from '../../../../../packages/analog-ui/src/index';

const algorithms = ['OPTO', 'FET', 'TAPE', 'BUS', 'CLIP'];
const monitorModes = ['edit', 'mix', 'print'];

function useStereoMeter(energy: number, enabled: boolean, suspendRef?: RefObject<boolean>) {
  const [channels, setChannels] = useState({ l: 0, r: 0, lPeak: 0, rPeak: 0 });
  const lPeakRef = useRef(0);
  const rPeakRef = useRef(0);
  const lPeakTime = useRef(0);
  const rPeakTime = useRef(0);

  useEffect(() => {
    if (!enabled) {
      lPeakRef.current = 0;
      rPeakRef.current = 0;
      lPeakTime.current = 0;
      rPeakTime.current = 0;
      setChannels((prev) =>
        prev.l === 0 && prev.r === 0 && prev.lPeak === 0 && prev.rPeak === 0
          ? prev
          : { l: 0, r: 0, lPeak: 0, rPeak: 0 },
      );
      return;
    }

    const tick = () => {
      if (suspendRef?.current) return;

      setChannels((prev) => {
        const base = 10 + energy * 44;
        const burstChance = 0.11 + energy * 0.14;
        const burstL = Math.random() < burstChance ? 12 + Math.random() * 30 : 0;
        const burstR = Math.random() < burstChance ? 12 + Math.random() * 30 : 0;
        const targetL = Math.min(100, base * (0.55 + Math.random() * 0.48) + burstL);
        const targetR = Math.min(100, base * (0.5 + Math.random() * 0.5) + burstR);
        const decay = Math.max(2.4, 5.2 - energy * 2.2);

        const nextL = targetL > prev.l ? targetL : Math.max(0, prev.l - decay);
        const nextR = targetR > prev.r ? targetR : Math.max(0, prev.r - decay);

        if (nextL >= prev.lPeak) {
          lPeakRef.current = nextL;
          lPeakTime.current = Date.now();
        } else if (Date.now() - lPeakTime.current > 1300) {
          lPeakRef.current = Math.max(nextL, lPeakRef.current - 1.2);
        }

        if (nextR >= prev.rPeak) {
          rPeakRef.current = nextR;
          rPeakTime.current = Date.now();
        } else if (Date.now() - rPeakTime.current > 1300) {
          rPeakRef.current = Math.max(nextR, rPeakRef.current - 1.2);
        }

        return {
          l: nextL,
          r: nextR,
          lPeak: lPeakRef.current,
          rPeak: rPeakRef.current,
        };
      });
    };

    const interval = window.setInterval(tick, 42);
    return () => window.clearInterval(interval);
  }, [enabled, energy, suspendRef]);

  return channels;
}

function useElementVisibility(targetRef: RefObject<HTMLElement | null>, rootMargin = '160px 0px') {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = targetRef.current;

    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, targetRef]);

  return isVisible;
}

interface MasterOutPanelProps {
  active: boolean;
  driveHot: boolean;
  energy: number;
  onClipChange: (clip: boolean) => void;
  suspendRef?: RefObject<boolean>;
}

interface HomeVstSurfaceProps {
  onScrubbingChange?: (isScrubbing: boolean) => void;
}

interface DemoSliderProps extends Omit<
  ComponentPropsWithoutRef<typeof Slider>,
  'value' | 'onValueChange'
> {
  value: number;
  onValueChange: (value: number) => void;
  onScrubbingChange?: (isScrubbing: boolean) => void;
}

interface ControlCellProps {
  label: ReactNode;
  value?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface StatusLampProps {
  label: ReactNode;
  isOn: boolean;
  tone: AnalogTone;
}

interface StatusRailItemProps {
  label: ReactNode;
  value: ReactNode;
  isOn?: boolean;
  tone?: AnalogTone;
}

function formatDb(value: number) {
  return `${value > 0 ? '+' : ''}${value} dB`;
}

function formatSigned(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);

  return `${rounded > 0 ? '+' : ''}${formatted}`;
}

function HardwareLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.24em] text-[#8b8b8b] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function StatusLamp({ label, isOn, tone }: StatusLampProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Indicator isOn={isOn} tone={tone} size="xs" />
      <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-[#9f9f9f]">
        {label}
      </span>
    </div>
  );
}

function StatusRailItem({ label, value, isOn, tone }: StatusRailItemProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {tone ? <Indicator isOn={Boolean(isOn)} tone={tone} size="xs" /> : null}
        <HardwareLabel className="truncate">{label}</HardwareLabel>
      </div>
      <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9c9c9]">
        {value}
      </span>
    </div>
  );
}

function ControlCell({ label, value, children, className }: ControlCellProps) {
  return (
    <div
      className={`flex min-h-[9.5rem] min-w-0 flex-col justify-between gap-3 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-3 ${className ?? ''}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 44%, rgba(0,0,0,0.22)), rgba(10,10,10,0.54)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -14px 32px rgba(0,0,0,0.24), 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <HardwareLabel className="truncate">{label}</HardwareLabel>
        {value ? (
          <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9c9c9]">
            {value}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

function DemoSlider({ value, onValueChange, onScrubbingChange, ...props }: DemoSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Slider
      {...props}
      value={localValue}
      onPointerDownCapture={() => onScrubbingChange?.(true)}
      onPointerUpCapture={() => onScrubbingChange?.(false)}
      onPointerCancelCapture={() => onScrubbingChange?.(false)}
      onValueChange={(next, eventDetails) => {
        setLocalValue(next as number);

        if (eventDetails.reason === 'drag' || eventDetails.reason === 'track-press') {
          onScrubbingChange?.(true);
        }
      }}
      onValueCommitted={(next) => {
        const resolvedValue = next as number;

        setLocalValue(resolvedValue);
        onScrubbingChange?.(false);
        onValueChange(resolvedValue);
      }}
    />
  );
}

function MasterOutPanel({
  active,
  driveHot,
  energy,
  onClipChange,
  suspendRef,
}: MasterOutPanelProps) {
  const meter = useStereoMeter(energy, active, suspendRef);
  const meterClip = active && (meter.lPeak > 82 || meter.rPeak > 82);
  const clipSentRef = useRef(false);
  const averageLevel = (meter.l + meter.r) / 2;
  const vuValue = active ? Math.min(3, -20 + averageLevel * 0.22) : -20;
  const peakValue = Math.round(Math.max(meter.lPeak, meter.rPeak));

  useEffect(() => {
    if (clipSentRef.current === meterClip) return;

    clipSentRef.current = meterClip;
    onClipChange(meterClip);
  }, [meterClip, onClipChange]);

  return (
    <div className="grid h-full min-w-0 content-start gap-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <HardwareLabel>Output Meter</HardwareLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
          Ceiling {driveHot || meterClip ? 'Hot' : '-1.0 dB'}
        </span>
      </div>

      <div className="grid min-w-0 gap-3">
        <div className="mx-auto grid w-full max-w-[18rem] min-w-0 gap-3">
          <NeedleGauge
            className="w-full max-w-none"
            value={vuValue}
            min={-20}
            max={3}
            scalePreset="vu"
            label="Bus VU"
            unit="dB"
            needleTone={driveHot ? 'warning' : 'success'}
          />
          <MeterGroup
            className="flex w-full justify-center"
            variant="panel"
            aria-label="Stereo output meter"
          >
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

          <LCDDisplay
            size="sm"
            align="right"
            label="PK"
            value={peakValue}
            units="%"
            tone={meterClip ? 'destructive' : 'info'}
            className="w-full [&>div]:w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatusLamp label="Audio" isOn={active} tone="success" />
        <StatusLamp label="Clip" isOn={meterClip || driveHot} tone="destructive" />
        <StatusLamp label="Limit" isOn={driveHot} tone="warning" />
      </div>
    </div>
  );
}

export default function HomeVstSurface({ onScrubbingChange }: HomeVstSurfaceProps = {}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);
  const isSurfaceVisible = useElementVisibility(surfaceRef, '160px 0px');
  const [meterClip, setMeterClip] = useState(false);

  const [preset, setPreset] = useState(7);
  const [algorithmIndex, setAlgorithmIndex] = useState(2);
  const [drive, setDrive] = useState(168);
  const [tone, setTone] = useState(36);
  const [width, setWidth] = useState(214);
  const [focus, setFocus] = useState(58);
  const [lowGain, setLowGain] = useState(-1.5);
  const [midGain, setMidGain] = useState(2);
  const [airGain, setAirGain] = useState(3);
  const [mix, setMix] = useState(-4);
  const [inputTrim, setInputTrim] = useState(-8);
  const [outputTrim, setOutputTrim] = useState(2);
  const [fieldMode, setFieldMode] = useState<'left' | 'right'>('right');
  const [sidechainMode, setSidechainMode] = useState<'left' | 'right'>('left');
  const [listenMode, setListenMode] = useState<'left' | 'right'>('right');
  const [phaseMode, setPhaseMode] = useState<'left' | 'right'>('left');
  const [monitorMode, setMonitorMode] = useState(monitorModes[0]);
  const [oversample, setOversample] = useState(true);
  const [power, setPower] = useState(true);
  const [sync, setSync] = useState(true);

  const energy = power
    ? Math.min(
        1,
        0.26 +
          drive / 500 +
          focus / 190 +
          Math.max(0, midGain) / 220 +
          Math.max(0, airGain) / 180 +
          Math.max(0, mix + 12) / 120 +
          (fieldMode === 'right' ? 0.08 : 0.02) +
          (sidechainMode === 'right' ? 0.03 : 0) +
          (sync ? 0.04 : 0) -
          (oversample ? 0.03 : 0),
      )
    : 0;
  const algorithm = algorithms[algorithmIndex] ?? algorithms[0];
  const gaugeTone: Extract<AnalogTone, 'success' | 'warning' | 'info'> =
    algorithm === 'TAPE' || algorithm === 'CLIP'
      ? 'warning'
      : algorithm === 'BUS'
        ? 'info'
        : 'success';
  const driveHot = power && drive > 230;
  const clip = driveHot || meterClip;
  const stereoMode = fieldMode === 'right' ? 'Wide' : 'Mid';
  const isMeterActive = power && isSurfaceVisible;
  const driveDisplay = Math.round((drive / 270) * 100);
  const toneDisplay = Math.round(tone - 50);
  const widthDisplay = Math.round((width / 270) * 140);
  const reduction = power ? Math.min(18, Math.max(0, energy * 15 + (driveHot ? 2.4 : 0))) : 0;
  const handleScrubbingChange = (isScrubbing: boolean) => {
    isScrubbingRef.current = isScrubbing;
    onScrubbingChange?.(isScrubbing);
  };

  useEffect(() => {
    if (isMeterActive) return;

    setMeterClip(false);
  }, [isMeterActive]);

  return (
    <Panel
      ref={surfaceRef}
      variant="rack"
      screws
      screwHole="slot"
      className="analog-docs-lcd-pixel-bold w-full"
    >
      <PanelContent className="p-0">
        <div className="grid gap-3 px-3 pb-3 lg:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="truncate font-mono text-[13px] font-bold uppercase tracking-[0.28em] text-[#e2e2e2]">
              AUV-61 Bus Console
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7f7f7f]">
              <span>48 kHz</span>
              <span>Latency 32 spl</span>
              <span>CPU 11%</span>
            </div>
          </div>

          <div className="grid min-w-0 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <LCDDisplay
              size="sm"
              align="left"
              label="Preset"
              value={`P-${preset.toString().padStart(2, '0')}`}
              units={algorithm}
              tone="info"
              className="w-full max-w-[14rem] justify-self-start [&>div]:w-full"
            />
            <ToggleButtonGroup
              value={monitorMode}
              onValueChange={setMonitorMode}
              indicatorTone="info"
              itemHeight="2.75rem"
              className="h-fit self-center justify-center"
            >
              {monitorModes.map((mode) => (
                <ToggleButtonGroupItem key={mode} value={mode} width="4.8rem">
                  {mode}
                </ToggleButtonGroupItem>
              ))}
            </ToggleButtonGroup>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <StatusLamp label="Power" isOn={power} tone="success" />
            <StatusLamp label="Clip" isOn={clip} tone="destructive" />
            <StatusLamp label="Link" isOn={sync} tone="info" />
          </div>
        </div>

        <div className="grid gap-3 p-3 xl:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)_minmax(16rem,21rem)]">
          <div className="grid min-w-0 gap-3">
            <div
              className="grid min-w-0 gap-3 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-3"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.28)), rgba(9,9,9,0.58)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -18px 44px rgba(0,0,0,0.22)',
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <HardwareLabel>Session</HardwareLabel>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                  P-{preset.toString().padStart(2, '0')} / {algorithm}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="grid min-h-[9.5rem] min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <HardwareLabel>Program</HardwareLabel>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                      P-{preset.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex min-h-0 items-center justify-center">
                    <WheelNumber
                      value={preset}
                      onValueChange={(next) => setPreset(next ?? 0)}
                      min={0}
                      max={99}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid min-h-[9.5rem] min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <HardwareLabel>Circuit</HardwareLabel>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                      {algorithm}
                    </span>
                  </div>
                  <div className="flex min-h-0 items-center justify-center">
                    <RotarySwitch
                      aria-label="Circuit selector"
                      className="w-full max-w-[9.5rem] p-2"
                      min={0}
                      max={algorithms.length - 1}
                      value={algorithmIndex}
                      onValueChange={(next) => setAlgorithmIndex(next as number)}
                      showMarks={false}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid min-h-28 min-w-0 grid-rows-[auto_1fr] gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-3">
                  <div className="grid min-w-0 gap-1 text-left">
                    <HardwareLabel>PWR</HardwareLabel>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                      {power ? 'Online' : 'Muted'}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-center">
                    <PushToggle pressed={power} onPressedChange={setPower} indicatorTone="success">
                      PWR
                    </PushToggle>
                  </div>
                </div>

                <div className="grid min-h-28 min-w-0 grid-rows-[auto_1fr] gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-3">
                  <div className="grid min-w-0 gap-1 text-left">
                    <HardwareLabel>Link</HardwareLabel>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                      {sync ? 'On' : 'Free'}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-center">
                    <PushToggle
                      variant="black"
                      pressed={sync}
                      onPressedChange={setSync}
                      indicatorTone="info"
                    >
                      LINK
                    </PushToggle>
                  </div>
                </div>
              </div>

              <RockerSwitchGroup
                layout="vertical"
                switchOrientation="horizontal"
                variant="black"
                className="w-full"
              >
                <RockerSwitchGroupItem
                  label="SC Filter"
                  value={sidechainMode}
                  onValueChange={setSidechainMode}
                  leftIndicatorTone="neutral"
                  rightIndicatorTone="warning"
                  labelPosition="start"
                  className="w-full justify-between"
                  toggleClassName="w-[108px]"
                />
                <RockerSwitchGroupItem
                  label="Listen"
                  value={listenMode}
                  onValueChange={setListenMode}
                  leftIndicatorTone="neutral"
                  rightIndicatorTone="info"
                  labelPosition="start"
                  className="w-full justify-between"
                  toggleClassName="w-[108px]"
                />
                <RockerSwitchGroupItem
                  label="Phase"
                  value={phaseMode}
                  onValueChange={setPhaseMode}
                  leftIndicatorTone="neutral"
                  rightIndicatorTone="destructive"
                  labelPosition="start"
                  className="w-full justify-between"
                  toggleClassName="w-[108px]"
                />
              </RockerSwitchGroup>
            </div>
          </div>

          <div className="grid min-w-0 gap-3">
            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              <ControlCell label="Drive" value={`${driveDisplay}%`}>
                <Dial value={drive} onChange={(next) => setDrive(next)} className="w-24 md:w-28" />
              </ControlCell>
              <ControlCell label="Color" value={formatSigned(toneDisplay)}>
                <Dial
                  variant="black"
                  value={tone}
                  onChange={(next) => setTone(next)}
                  className="w-24 md:w-28"
                />
              </ControlCell>
              <ControlCell label="Width" value={`${widthDisplay}%`}>
                <Dial value={width} onChange={(next) => setWidth(next)} className="w-24 md:w-28" />
              </ControlCell>
            </div>

            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_13rem]">
              <div
                className="grid min-w-0 gap-3 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-3"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.28)), rgba(9,9,9,0.58)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="grid grid-cols-3 gap-3">
                  <ControlCell label="Low" value={formatSigned(lowGain)} className="min-h-[8.5rem]">
                    <Dial
                      mode="knob"
                      min={-12}
                      max={12}
                      value={lowGain}
                      onValueChange={setLowGain}
                      className="w-20"
                    />
                  </ControlCell>
                  <ControlCell label="Mid" value={formatSigned(midGain)} className="min-h-[8.5rem]">
                    <Dial
                      mode="knob"
                      min={-12}
                      max={12}
                      value={midGain}
                      onValueChange={setMidGain}
                      variant="black"
                      className="w-20"
                    />
                  </ControlCell>
                  <ControlCell label="Air" value={formatSigned(airGain)} className="min-h-[8.5rem]">
                    <Dial
                      mode="knob"
                      min={-12}
                      max={12}
                      value={airGain}
                      onValueChange={setAirGain}
                      className="w-20"
                    />
                  </ControlCell>
                </div>

                <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <HardwareLabel>Blend</HardwareLabel>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                        {formatDb(mix)}
                      </span>
                    </div>
                    <DemoSlider
                      orientation="horizontal"
                      variant="black"
                      min={-40}
                      max={10}
                      value={mix}
                      onValueChange={(next) => setMix(next as number)}
                      onScrubbingChange={handleScrubbingChange}
                      className="w-full min-w-0"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <HardwareLabel>Field {stereoMode}</HardwareLabel>
                    <Toggle
                      value={fieldMode}
                      onValueChange={setFieldMode}
                      leftIndicatorTone="warning"
                      rightIndicatorTone="success"
                      className="w-[108px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid min-h-full content-start gap-3 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <HardwareLabel>Dynamics</HardwareLabel>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                    {algorithm}
                  </span>
                </div>
                <Gauge
                  className="mx-auto aspect-square w-full max-w-[11rem]"
                  value={focus}
                  onValueChange={(next) => setFocus(next as number)}
                  tone={gaugeTone}
                />
                <LCDDisplay
                  size="sm"
                  align="right"
                  label="Gain Red"
                  value={reduction.toFixed(1)}
                  units="dB"
                  tone={gaugeTone}
                  className="w-full [&>div]:w-full"
                />
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-2.5">
                    <StatusLamp label="Detect" isOn={power} tone={gaugeTone} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#858585]">
                      {sidechainMode === 'right' ? 'HPF' : 'Full'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-2.5">
                    <HardwareLabel>OS {oversample ? '4x' : '1x'}</HardwareLabel>
                    <Switch checked={oversample} onCheckedChange={setOversample} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-3 md:grid-cols-[1fr_1fr] md:items-center">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-3">
                  <HardwareLabel>Input</HardwareLabel>
                  <DemoSlider
                    orientation="vertical"
                    min={-40}
                    max={10}
                    value={inputTrim}
                    onValueChange={(next) => setInputTrim(next as number)}
                    onScrubbingChange={handleScrubbingChange}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                    {formatDb(inputTrim)}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <HardwareLabel>Output</HardwareLabel>
                  <DemoSlider
                    orientation="vertical"
                    variant="black"
                    min={-40}
                    max={10}
                    value={outputTrim}
                    onValueChange={(next) => setOutputTrim(next as number)}
                    onScrubbingChange={handleScrubbingChange}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                    {formatDb(outputTrim)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <PushButton width="100%" height="2.5rem">
                    A/B
                  </PushButton>
                  <PushButton width="100%" height="2.5rem" variant="black">
                    SAFE
                  </PushButton>
                </div>
                <LCDDisplay
                  size="sm"
                  align="right"
                  label="I/O Trim"
                  value={formatDb(outputTrim - inputTrim)}
                  tone={clip ? 'destructive' : 'success'}
                  className="w-full [&>div]:w-full"
                />
                <div className="grid gap-2 rounded-[var(--analog-radius-recess)] border border-white/[0.07] bg-black/20 p-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <HardwareLabel>Monitor</HardwareLabel>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9c9c9]">
                      {monitorMode}
                    </span>
                  </div>
                  <StatusLamp
                    label="Print Safe"
                    isOn={!clip}
                    tone={clip ? 'destructive' : 'success'}
                  />
                </div>
              </div>
            </div>
          </div>

          <Panel variant="rack" screws screwHole="slot" className="h-full">
            <PanelContent className="h-full p-0">
              <MasterOutPanel
                active={isMeterActive}
                driveHot={driveHot}
                energy={energy}
                onClipChange={setMeterClip}
                suspendRef={isScrubbingRef}
              />
            </PanelContent>
          </Panel>
        </div>

        <div className="px-3 pb-3">
          <div
            className="grid gap-2 rounded-[var(--analog-radius-window)] border border-white/[0.08] bg-black/20 p-2 sm:grid-cols-2 lg:grid-cols-7"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2)), rgba(9,9,9,0.52)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <StatusRailItem label="Mode" value={monitorMode} />
            <StatusRailItem label="Field" value={stereoMode} />
            <StatusRailItem label="SC" value={sidechainMode === 'right' ? 'HPF' : 'Full'} />
            <StatusRailItem label="Listen" value={listenMode === 'right' ? 'Cue' : 'Off'} />
            <StatusRailItem
              label="Phase"
              value={phaseMode === 'right' ? 'Inv' : 'Norm'}
              isOn={phaseMode === 'right'}
              tone="destructive"
            />
            <StatusRailItem label="Sync" value={sync ? 'On' : 'Free'} isOn={sync} tone="info" />
            <StatusRailItem
              label="Engine"
              value={power ? 'On' : 'Mute'}
              isOn={power}
              tone="success"
            />
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
