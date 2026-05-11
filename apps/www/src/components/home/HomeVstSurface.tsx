import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type RefObject } from 'react';

import {
  Indicator,
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
  PanelAction,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  SquareButton,
  SquareToggle,
} from '../../../../../packages/analog-ui/src/index';

const algorithms = ['TAPE', 'VALVE', 'BUS', 'WIDE', 'PUNCH'];

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

  useEffect(() => {
    if (clipSentRef.current === meterClip) return;

    clipSentRef.current = meterClip;
    onClipChange(meterClip);
  }, [meterClip, onClipChange]);

  return (
    <Panel variant="rack" screws={false} className="h-full">
      <PanelHeader className="gap-2 p-5 pb-3">
        <PanelTitle className="text-xl uppercase tracking-[0.14em]">Master Out</PanelTitle>
        <PanelDescription>Stereo metering and output display.</PanelDescription>
      </PanelHeader>

      <PanelContent className="grid gap-6 px-5 pb-5">
        <div className="flex justify-center">
          <div className="origin-top scale-[0.84] sm:scale-100">
            <MeterGroup variant="panel" aria-label="Stereo output meter">
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
        </div>
      </PanelContent>

      <PanelFooter className="flex flex-wrap gap-5 px-5 pb-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Left {Math.round(meter.l)} / {Math.round(meter.lPeak)}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Right {Math.round(meter.r)} / {Math.round(meter.rPeak)}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Ceiling {driveHot || meterClip ? 'Hot' : '-1.0 dB'}
        </span>
      </PanelFooter>
    </Panel>
  );
}

export default function HomeVstSurface({ onScrubbingChange }: HomeVstSurfaceProps = {}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);
  const isSurfaceVisible = useElementVisibility(surfaceRef, '160px 0px');
  const [meterClip, setMeterClip] = useState(false);

  const [preset, setPreset] = useState(7);
  const [algorithm, setAlgorithm] = useState(algorithms[2]);
  const [drive, setDrive] = useState(168);
  const [tone, setTone] = useState(36);
  const [width, setWidth] = useState(214);
  const [focus, setFocus] = useState(58);
  const [mix, setMix] = useState(-4);
  const [inputTrim, setInputTrim] = useState(-8);
  const [outputTrim, setOutputTrim] = useState(2);
  const [fieldMode, setFieldMode] = useState<'left' | 'right'>('right');
  const [oversample, setOversample] = useState(true);
  const [power, setPower] = useState(true);
  const [sync, setSync] = useState(true);

  const energy = power
    ? Math.min(
        1,
        0.26 +
          drive / 500 +
          focus / 190 +
          Math.max(0, mix + 12) / 120 +
          (fieldMode === 'right' ? 0.08 : 0.02) +
          (sync ? 0.04 : 0) -
          (oversample ? 0.03 : 0),
      )
    : 0;
  const gaugeVariant =
    algorithm === 'TAPE' || algorithm === 'VALVE'
      ? 'lcd-amber'
      : algorithm === 'WIDE'
        ? 'lcd-blue'
        : 'lcd-green';
  const driveHot = power && drive > 230;
  const clip = driveHot || meterClip;
  const stereoMode = fieldMode === 'right' ? 'Wide' : 'Mid';
  const isMeterActive = power && isSurfaceVisible;
  const handleScrubbingChange = (isScrubbing: boolean) => {
    isScrubbingRef.current = isScrubbing;
    onScrubbingChange?.(isScrubbing);
  };

  useEffect(() => {
    if (isMeterActive) return;

    setMeterClip(false);
  }, [isMeterActive]);

  return (
    <Panel ref={surfaceRef} variant="rack" screws screwHole="slot" className="w-full">
      <PanelHeader className="gap-4 p-6 md:p-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7f7f7f]">
          Channel Strip
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <PanelTitle className="text-3xl uppercase tracking-[0.18em] md:text-4xl">
              Helios Channel
            </PanelTitle>
            <PanelDescription className="mt-3 text-base leading-7 text-[#9b9b9b]">
              A production-style audio panel assembled from Analog UI controls, readouts, and rack
              hardware.
            </PanelDescription>
          </div>

          <PanelAction className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <Indicator isOn={power} color="green" size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9f9f9f]">
                Power
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Indicator isOn={clip} color="red" size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9f9f9f]">
                Clip
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Indicator isOn={sync} color="blue" size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9f9f9f]">
                Link
              </span>
            </div>
          </PanelAction>
        </div>
      </PanelHeader>

      <PanelContent className="grid gap-5 px-4 pb-4 md:px-6 md:pb-6 xl:grid-cols-2">
        <Panel variant="rack" screws={false} className="h-full">
          <PanelHeader className="gap-2 p-5 pb-3">
            <PanelTitle className="text-xl uppercase tracking-[0.14em]">Program Matrix</PanelTitle>
            <PanelDescription>Preset, circuit, and utility controls.</PanelDescription>
          </PanelHeader>

          <PanelContent className="grid gap-6 px-5 pb-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Preset P-{preset.toString().padStart(2, '0')}
                </span>
                <WheelNumber value={preset} onValueChange={(next) => setPreset(next ?? 0)} />
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Circuit {algorithm}
                </span>
                <WheelSelect options={algorithms} value={algorithm} onValueChange={setAlgorithm} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-3">
                <SquareToggle pressed={power} onPressedChange={setPower} indicatorColor="green">
                  PWR
                </SquareToggle>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#777]">
                  {power ? 'Online' : 'Muted'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <SquareToggle
                  variant="black"
                  pressed={sync}
                  onPressedChange={setSync}
                  indicatorColor="blue"
                >
                  SYNC
                </SquareToggle>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#777]">
                  {sync ? 'Linked' : 'Free'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <SquareButton>PUSH</SquareButton>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#777]">
                  Momentary
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <SquareButton variant="black">EXEC</SquareButton>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#777]">
                  Black
                </span>
              </div>
            </div>
          </PanelContent>

          <PanelFooter className="flex flex-wrap gap-5 px-5 pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Program P-{preset.toString().padStart(2, '0')}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Algorithm {algorithm}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Engine {power ? 'Online' : 'Muted'}
            </span>
          </PanelFooter>
        </Panel>

        <Panel variant="rack" screws={false} className="h-full">
          <PanelHeader className="gap-2 p-5 pb-3">
            <PanelTitle className="text-xl uppercase tracking-[0.14em]">Tone Stack</PanelTitle>
            <PanelDescription>Drive, tone, field, and stereo behavior.</PanelDescription>
          </PanelHeader>

          <PanelContent className="grid gap-6 px-5 pb-5">
            <div className="flex flex-wrap items-start justify-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Drive
                </span>
                <Dial value={drive} onChange={(next) => setDrive(next)} className="w-24 md:w-28" />
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Tone
                </span>
                <Dial
                  variant="black"
                  value={tone}
                  onChange={(next) => setTone(next)}
                  className="w-24 md:w-28"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Width
                </span>
                <Dial value={width} onChange={(next) => setWidth(next)} className="w-24 md:w-28" />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_120px]">
              <div className="flex items-center justify-between gap-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Field {stereoMode}
                </span>
                <Toggle
                  value={fieldMode}
                  onValueChange={setFieldMode}
                  leftLed="amber"
                  rightLed="green"
                  className="w-[108px]"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  OS {oversample ? '4x' : '1x'}
                </span>
                <Switch checked={oversample} onCheckedChange={setOversample} />
              </div>
            </div>

            <div className="min-w-0 pt-3">
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
          </PanelContent>

          <PanelFooter className="flex flex-wrap gap-5 px-5 pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Drive {Math.round(drive)} deg
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Tone {Math.round(tone)} deg
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Mix {mix} dB
            </span>
          </PanelFooter>
        </Panel>

        <Panel variant="rack" screws={false} className="h-full">
          <PanelHeader className="gap-2 p-5 pb-3">
            <PanelTitle className="text-xl uppercase tracking-[0.14em]">Focus and Gain</PanelTitle>
            <PanelDescription>Flux display with input and output trim.</PanelDescription>
          </PanelHeader>

          <PanelContent className="grid gap-6 px-5 pb-5">
            <div className="flex flex-wrap items-end justify-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                  Flux {Math.round(focus)}%
                </span>
                <Gauge
                  className="h-36 w-36 md:h-40 md:w-40"
                  value={focus}
                  onValueChange={(next) => setFocus(next as number)}
                  variant={gaugeVariant}
                />
              </div>

              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                    Input
                  </span>
                  <DemoSlider
                    orientation="vertical"
                    min={-40}
                    max={10}
                    value={inputTrim}
                    onValueChange={(next) => setInputTrim(next as number)}
                    onScrubbingChange={handleScrubbingChange}
                  />
                  <div className="flex items-center gap-2">
                    <Indicator isOn={power} color="white" size="xs" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#777]">
                      Line
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#818181]">
                    Output
                  </span>
                  <DemoSlider
                    orientation="vertical"
                    variant="black"
                    min={-40}
                    max={10}
                    value={outputTrim}
                    onValueChange={(next) => setOutputTrim(next as number)}
                    onScrubbingChange={handleScrubbingChange}
                  />
                  <div className="flex items-center gap-2">
                    <Indicator isOn={power} color="amber" size="xs" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#777]">
                      Lift
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>

          <PanelFooter className="flex flex-wrap gap-5 px-5 pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Input {inputTrim} dB
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Output {outputTrim} dB
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
              Display {gaugeVariant.replace('lcd-', '')}
            </span>
          </PanelFooter>
        </Panel>

        <MasterOutPanel
          active={isMeterActive}
          driveHot={driveHot}
          energy={energy}
          onClipChange={setMeterClip}
          suspendRef={isScrubbingRef}
        />
      </PanelContent>

      <PanelFooter className="flex flex-wrap gap-5 px-4 pb-4 pt-0 md:px-6 md:pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Character {algorithm}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Field {stereoMode}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#878787]">
          Sync {sync ? 'Linked' : 'Free'}
        </span>
      </PanelFooter>
    </Panel>
  );
}
