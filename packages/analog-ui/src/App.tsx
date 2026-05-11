/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { usePointerLighting } from './registry/hooks/use-pointer-lighting';
import { AnalogLightingProvider } from './registry/hooks/use-analog-lighting';
import { Dial } from './registry/components/analog/Dial';
import { Toggle } from './registry/components/analog/Toggle';
import { PushButton } from './registry/components/analog/PushButton';
import { PushToggle } from './registry/components/analog/PushToggle';
import { Switch } from './registry/components/analog/Switch';
import { Slider } from './registry/components/analog/Slider';
import {
  Meter,
  MeterGroup,
  MeterGroupChannel,
  MeterGroupSeparator,
  type MeterGroupVariant,
} from './registry/components/analog/Meter';
import { WheelSelect } from './registry/components/analog/WheelSelect';
import { WheelNumber } from './registry/components/analog/WheelNumber';
import {
  Indicator,
  type IndicatorColor,
  type IndicatorShape,
  type IndicatorSize,
} from './registry/components/analog/Indicator';
import { Gauge } from './registry/components/analog/Gauge';
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelFooter,
} from './registry/components/analog/Panel';
import { ComponentShowcase } from './components/ComponentShowcase';

function useAudioMeter() {
  const [channels, setChannels] = useState({ l: -60, r: -60, lPeak: -60, rPeak: -60 });
  const lPeakRef = useRef(-60);
  const rPeakRef = useRef(-60);
  const lPeakTime = useRef(0);
  const rPeakTime = useRef(0);

  useEffect(() => {
    const tick = () => {
      setChannels((prev) => {
        const isHitL = Math.random() < 0.18;
        const isHitR = Math.random() < 0.15;

        const targetL = isHitL ? -18 + Math.random() * 24 : -60;
        const targetR = isHitR ? -20 + Math.random() * 26 : -60;

        let newL = prev.l;
        if (targetL > prev.l) newL = targetL;
        else newL = Math.max(-60, prev.l - 2.4);

        let newR = prev.r;
        if (targetR > prev.r) newR = targetR;
        else newR = Math.max(-60, prev.r - 2.6);

        if (newL >= prev.lPeak) {
          lPeakRef.current = newL;
          lPeakTime.current = Date.now();
        } else if (Date.now() - lPeakTime.current > 1500) {
          lPeakRef.current = Math.max(newL, lPeakRef.current - 1.5);
        }

        if (newR >= prev.rPeak) {
          rPeakRef.current = newR;
          rPeakTime.current = Date.now();
        } else if (Date.now() - rPeakTime.current > 1500) {
          rPeakRef.current = Math.max(newR, rPeakRef.current - 1.5);
        }

        return { l: newL, r: newR, lPeak: lPeakRef.current, rPeak: rPeakRef.current };
      });
    };

    const interval = setInterval(tick, 40);
    return () => clearInterval(interval);
  }, []);

  return channels;
}

export default function App() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [dialValue, setDialValue] = useState(0);
  const [degrees, setDegrees] = useState(0);
  const [revolutions, setRevolutions] = useState(0);

  const [blackDialValue, setBlackDialValue] = useState(0);

  // States for Toggles
  const [toggle1, setToggle1] = useState<'left' | 'right'>('right');
  const [toggle2, setToggle2] = useState<'left' | 'right'>('left');
  const [verticalToggle1, setVerticalToggle1] = useState<'left' | 'right'>('right');
  const [verticalToggle2, setVerticalToggle2] = useState<'left' | 'right'>('left');

  // LED Config for Toggles
  const [togglesLeftLed, setTogglesLeftLed] = useState<IndicatorColor>('none');
  const [togglesRightLed, setTogglesRightLed] = useState<IndicatorColor>('none');
  const [togglesLeftActive, setTogglesLeftActive] = useState<'auto' | 'always' | 'never'>('auto');
  const [togglesRightActive, setTogglesRightActive] = useState<'auto' | 'always' | 'never'>('auto');

  // Analog Switch States
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [verticalSwitch1, setVerticalSwitch1] = useState(true);
  const [verticalSwitch2, setVerticalSwitch2] = useState(false);

  // States for Faders
  const [fader1, setFader1] = useState(0);
  const [fader2, setFader2] = useState(0);

  const [indicatorOn, setIndicatorOn] = useState(false);
  const [indicatorColor, setIndicatorColor] = useState<Exclude<IndicatorColor, 'none'>>('red');
  const [indicatorSize, setIndicatorSize] = useState<Exclude<IndicatorSize, 'xs'>>('lg');
  const [indicatorShape, setIndicatorShape] = useState<IndicatorShape>('round');
  const [indicatorHasBezel, setIndicatorHasBezel] = useState(true);

  // Push Button / Toggle States
  const [sqToggle1, setSqToggle1] = useState(true);
  const [sqToggle2, setSqToggle2] = useState(false);

  // Audio meter logic
  const meter = useAudioMeter();
  const [isMeterAnimated, setIsMeterAnimated] = useState(true);
  const [staticMeterL, setStaticMeterL] = useState(-12);
  const [staticMeterR, setStaticMeterR] = useState(-18);
  const [meterVariant, setMeterVariant] = useState<
    'metered' | 'lcd-green' | 'lcd-amber' | 'lcd-blue'
  >('metered');
  const [meterGroupVariant, setMeterGroupVariant] = useState<MeterGroupVariant>('chrome');
  const [isSegmented, setIsSegmented] = useState(true);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [gaugeVariant, setGaugeVariant] = useState<'lcd-green' | 'lcd-amber' | 'lcd-blue'>(
    'lcd-green',
  );
  const [wheelValue, setWheelValue] = useState('SPEED');
  const [wheelNum, setWheelNum] = useState(0);

  // Global Light Controller
  const [lightAngle, setLightAngle] = useState(180);
  const [lightPower, setLightPower] = useState(120);
  const [mouseInfluence, setMouseInfluence] = useState(1);

  const dynamicLightAngle = usePointerLighting({
    baseAngle: lightAngle,
    influence: mouseInfluence,
    targetRef: surfaceRef,
  });

  const [panelVariant, setPanelVariant] = useState<'default' | 'rack'>('rack');
  const [panelScrews, setPanelScrews] = useState(true);
  const [screwVariant, setScrewVariant] = useState<'chrome' | 'black'>('chrome');
  const [screwHole, setScrewHole] = useState<'none' | 'slot' | 'cross' | 'star'>('cross');
  const [compressionToggle, setCompressionToggle] = useState<'left' | 'right'>('left');
  const [makeupGain, setMakeupGain] = useState<number[]>([4]);
  const [bypass, setBypass] = useState(false);
  const faderMarks = [
    { value: -60, label: '-∞', position: 0 },
    { value: -30, label: '-30', position: 0.22 },
    { value: -20, label: '-20', position: 0.42 },
    { value: -10, label: '-10', position: 0.62 },
    { value: 0, label: '0', position: 0.8 },
    { value: 10, label: '+10', position: 1 },
  ] as const;
  const makeupGainMarks = [
    { value: -12, label: '-12' },
    { value: -6, label: '-6' },
    { value: 0, label: '0' },
    { value: 6, label: '+6' },
    { value: 12, label: '+12' },
  ] as const;
  const panGaugeMarks = [
    { value: -100, label: 'L' },
    { value: 0, label: 'C' },
    { value: 100, label: 'R' },
  ] as const;

  return (
    <AnalogLightingProvider
      baseAngle={lightAngle}
      sourceAngle={dynamicLightAngle}
      power={lightPower / 120}
    >
      <div
        ref={surfaceRef}
        className="flex min-h-screen w-full flex-col bg-background p-8 pt-32 font-sans text-foreground md:p-16 md:pt-16"
      >
        <Panel
          variant="rack"
          screws={false}
          className="fixed top-6 right-6 z-50 w-72 p-5 md:top-12 md:right-12"
        >
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-5">
            Analog Lighting
          </div>

          <div className="flex gap-6 items-center">
            <div className="relative shrink-0">
              <Dial
                className="w-16 h-16 !mx-0"
                value={lightAngle}
                onChange={(v) => setLightAngle(Math.round(v))}
                variant="black"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between text-[10px] text-[#888] font-mono uppercase mb-1">
                <span>Angle</span>
                <span className="text-[var(--color-accent)]">
                  {Math.round(((lightAngle % 360) + 360) % 360)}°
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-[#888] font-mono uppercase mb-2 mt-2">
                <span>Power</span>
                <span className="text-[var(--color-accent)]">{lightPower}W</span>
              </div>
              <Slider
                aria-label="Lighting power"
                className="mb-2 h-10 w-full"
                min={0}
                max={500}
                value={lightPower}
                showMarks={false}
                onValueChange={(next) => setLightPower(Math.round(next as number))}
              />
              <div className="flex justify-between text-[10px] text-[#888] font-mono uppercase mb-2">
                <span>Mouse Travel</span>
                <span className="text-[var(--color-accent)]">
                  {Math.round(mouseInfluence * 100)}%
                </span>
              </div>
              <Slider
                aria-label="Mouse travel influence"
                className="h-10 w-full"
                min={0}
                max={1}
                step={0.01}
                value={mouseInfluence}
                showMarks={false}
                onValueChange={(next) => setMouseInfluence(next as number)}
              />
            </div>
          </div>
        </Panel>

        <div className="mb-12 md:mb-20 max-w-xl text-left">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <img
              src="/img/logo/SVG/logo.svg"
              alt="Analog UI logo"
              className="h-full w-full rounded-[22px] object-cover shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Analog UI</h1>
          <p className="text-xl text-[var(--color-accent)] font-medium mb-6 italic">
            UI you can feel.
          </p>
          <div className="text-[#a0a0a0] font-sans text-[17px] leading-relaxed space-y-4">
            <p>
              Analog UI is a component library and custom registry built on top of shadcn/ui to help
              you build highly tactile web experiences faster. It provides pre-built "studio
              hyper-skeuomorphism" components for physical inputs, LED displays, sliders, and more.
            </p>
            <p>
              Components are available via the{' '}
              <code className="bg-[#1a1a1a] text-[#d4d4d4] px-1.5 py-0.5 rounded text-sm font-mono border border-[#333]">
                shadcn
              </code>{' '}
              CLI command.
            </p>
          </div>
        </div>

        <ComponentShowcase
          title="Analog Encoder & Knob"
          description="A rotary control that can behave as an endless encoder or a bounded audio knob. The bounded mode adds a real value range, sweep, steps, and a center detent while keeping the same tactile lighting response."
          specs={[
            { label: 'Encoder', value: `${Math.round(dialValue)}°` },
            { label: 'Degrees', value: `${Math.round(degrees)}°` },
            { label: 'Revolutions', value: revolutions },
            { label: 'Trim', value: `${blackDialValue.toFixed(1)} dB` },
          ]}
        >
          <div className="flex w-full flex-wrap items-center justify-center gap-16">
            <Dial
              value={dialValue}
              onChange={(val, deg, rev) => {
                setDialValue(val);
                setDegrees(deg);
                setRevolutions(rev);
              }}
            />
            <Dial
              variant="black"
              mode="knob"
              min={-12}
              max={12}
              step={0.5}
              detentValue={0}
              value={blackDialValue}
              onValueChange={setBlackDialValue}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Push Button & Toggle"
          description="Skeuomorphic push controls with realistic 3D extrusion, machined finishes, and dynamic lighting. The toggle variant includes an optional LED indicator for state feedback."
          specs={[
            { label: 'Toggle 1', value: sqToggle1 ? 'ON' : 'OFF' },
            { label: 'Toggle 2', value: sqToggle2 ? 'ON' : 'OFF' },
          ]}
        >
          <div className="flex flex-wrap gap-12 items-center justify-center py-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-8">
                <PushButton onClick={() => console.log('Click')}>PUSH</PushButton>
                <PushButton variant="black" onClick={() => console.log('Click')}>
                  EXEC
                </PushButton>
              </div>
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest font-bold">
                Momentary
              </span>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-8">
                <PushToggle
                  pressed={sqToggle1}
                  onPressedChange={setSqToggle1}
                  indicatorColor="green"
                >
                  PWR
                </PushToggle>
                <PushToggle
                  variant="black"
                  pressed={sqToggle2}
                  onPressedChange={setSqToggle2}
                  indicatorColor="red"
                >
                  ARM
                </PushToggle>
              </div>
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest font-bold">
                Latching (LED)
              </span>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Toggle"
          description="A heavy-duty rocker switch modeled with physical depth. Features textured grip ridges, an anodized baseplate, and configurable LED status indicators."
          specs={[
            { label: 'State (Chrome)', value: toggle1 === 'right' ? 'ON' : 'OFF' },
            { label: 'State (Black)', value: toggle2 === 'right' ? 'ON' : 'OFF' },
            {
              label: 'Left LED',
              value: (
                <select
                  className="bg-transparent text-right outline-none text-[var(--color-accent)] font-mono border-none"
                  value={togglesLeftLed}
                  onChange={(e) => setTogglesLeftLed(e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="blue">Blue</option>
                  <option value="white">White</option>
                </select>
              ),
            },
            {
              label: 'Right LED',
              value: (
                <select
                  className="bg-transparent text-right outline-none text-[var(--color-accent)] font-mono border-none"
                  value={togglesRightLed}
                  onChange={(e) => setTogglesRightLed(e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="blue">Blue</option>
                  <option value="white">White</option>
                </select>
              ),
            },
            {
              label: 'Left Mode',
              value: (
                <select
                  className="bg-transparent text-right outline-none text-[var(--color-accent)] font-mono border-none"
                  value={togglesLeftActive}
                  onChange={(e) => setTogglesLeftActive(e.target.value as any)}
                >
                  <option value="auto">Auto</option>
                  <option value="always">Always</option>
                  <option value="never">Never</option>
                </select>
              ),
            },
            {
              label: 'Right Mode',
              value: (
                <select
                  className="bg-transparent text-right outline-none text-[var(--color-accent)] font-mono border-none"
                  value={togglesRightActive}
                  onChange={(e) => setTogglesRightActive(e.target.value as any)}
                >
                  <option value="auto">Auto</option>
                  <option value="always">Always</option>
                  <option value="never">Never</option>
                </select>
              ),
            },
          ]}
        >
          <div className="flex flex-wrap items-end justify-center gap-12">
            <div className="flex flex-col gap-16 items-center justify-center">
              <div className="flex items-center gap-6">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Sys Pwr
                </span>
                <Toggle
                  leftLed={togglesLeftLed}
                  rightLed={togglesRightLed}
                  leftLedActive={togglesLeftActive}
                  rightLedActive={togglesRightActive}
                  value={toggle1 as 'left' | 'right'}
                  onValueChange={setToggle1 as any}
                />
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Aux Pwr
                </span>
                <Toggle
                  variant="black"
                  leftLed={togglesLeftLed}
                  rightLed={togglesRightLed}
                  leftLedActive={togglesLeftActive}
                  rightLedActive={togglesRightActive}
                  value={toggle2 as 'left' | 'right'}
                  onValueChange={setToggle2 as any}
                />
              </div>
            </div>

            <div className="flex items-start gap-10">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Bay Door
                </span>
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">
                  Open
                </span>
                <Toggle
                  orientation="vertical"
                  leftLed={togglesLeftLed}
                  rightLed={togglesRightLed}
                  leftLedActive={togglesLeftActive}
                  rightLedActive={togglesRightActive}
                  value={verticalToggle1}
                  onValueChange={setVerticalToggle1}
                />
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">
                  Shut
                </span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Aux Bus
                </span>
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">
                  Arm
                </span>
                <Toggle
                  variant="black"
                  orientation="vertical"
                  leftLed={togglesLeftLed}
                  rightLed={togglesRightLed}
                  leftLedActive={togglesLeftActive}
                  rightLedActive={togglesRightActive}
                  value={verticalToggle2}
                  onValueChange={setVerticalToggle2}
                />
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">
                  Safe
                </span>
              </div>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Switch"
          description="A tactile track switch that reimagines the standard toggle. Features a 3D-extruded metallic cylinder that rolls through a recessed cavity in horizontal or vertical layouts."
          specs={[
            { label: 'Horizontal (Chrome)', value: switch1 ? 'ON' : 'OFF' },
            { label: 'Horizontal (Black)', value: switch2 ? 'ON' : 'OFF' },
            { label: 'Vertical (Chrome)', value: verticalSwitch1 ? 'ON' : 'OFF' },
            { label: 'Vertical (Black)', value: verticalSwitch2 ? 'ON' : 'OFF' },
          ]}
        >
          <div className="flex flex-col gap-14 items-center justify-center py-12">
            <div className="flex flex-col gap-8 w-full max-w-sm">
              <div className="flex items-center justify-between w-full gap-6">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Warp
                </span>
                <Switch variant="chrome" checked={switch1} onCheckedChange={setSwitch1} />
              </div>
              <div className="flex items-center justify-between w-full gap-6">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Stealth
                </span>
                <Switch variant="black" checked={switch2} onCheckedChange={setSwitch2} />
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Launch
                </span>
                <Switch
                  orientation="vertical"
                  variant="chrome"
                  checked={verticalSwitch1}
                  onCheckedChange={setVerticalSwitch1}
                />
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                  Cloak
                </span>
                <Switch
                  orientation="vertical"
                  variant="black"
                  checked={verticalSwitch2}
                  onCheckedChange={setVerticalSwitch2}
                />
              </div>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Slider"
          description="A linear sliding fader with a thick tactile base and extruded grip track. Highly responsive and fully integrated with the shared analog lighting system for dynamic casting."
          specs={[
            { label: 'Fader 1 (Chrome)', value: `${fader1}dB` },
            { label: 'Fader 2 (Black)', value: `${fader2}dB` },
            { label: 'Travel', value: '100mm' },
          ]}
        >
          <div className="flex flex-col gap-24 items-center justify-center py-12">
            <div className="flex gap-24 items-center justify-center">
              <Slider
                orientation="vertical"
                variant="chrome"
                min={-60}
                max={10}
                value={fader1}
                onValueChange={(val) => setFader1(val as number)}
                marks={faderMarks}
                showMarks
              />
            </div>
            <div className="flex w-full max-w-sm">
              <Slider
                orientation="horizontal"
                variant="black"
                min={-60}
                max={10}
                value={fader2}
                onValueChange={(val) => setFader2(val as number)}
                marks={faderMarks}
                showMarks
                className="w-full"
              />
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Meter"
          description="A calibrated stereo level meter with optional display ballistics, dbFS scale marks, and segmented or continuous LED arrays."
          specs={[
            {
              label: 'Animated',
              value: <Switch checked={isMeterAnimated} onCheckedChange={setIsMeterAnimated} />,
            },
            {
              label: 'Stat L',
              value: (
                <Slider
                  aria-label="Static left meter level"
                  className="h-10 w-28"
                  disabled={isMeterAnimated}
                  min={-60}
                  max={6}
                  step={1}
                  value={staticMeterL}
                  showMarks={false}
                  variant="black"
                  onValueChange={(next) => setStaticMeterL(next as number)}
                />
              ),
            },
            {
              label: 'Stat R',
              value: (
                <Slider
                  aria-label="Static right meter level"
                  className="h-10 w-28"
                  disabled={isMeterAnimated}
                  min={-60}
                  max={6}
                  step={1}
                  value={staticMeterR}
                  showMarks={false}
                  variant="black"
                  onValueChange={(next) => setStaticMeterR(next as number)}
                />
              ),
            },
            {
              label: 'Meter',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={meterVariant}
                  onChange={(e) => setMeterVariant(e.target.value as any)}
                >
                  <option value="metered">Metered</option>
                  <option value="lcd-green">LCD Green</option>
                  <option value="lcd-amber">LCD Amber</option>
                  <option value="lcd-blue">LCD Blue</option>
                </select>
              ),
            },
            {
              label: 'Display',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={meterGroupVariant}
                  onChange={(e) => setMeterGroupVariant(e.target.value as MeterGroupVariant)}
                >
                  <option value="chrome">Chrome</option>
                  <option value="panel">Panel</option>
                  <option value="black">Black</option>
                </select>
              ),
            },
            {
              label: 'Segments',
              value: <Switch checked={isSegmented} onCheckedChange={setIsSegmented} />,
            },
          ]}
        >
          <div className="flex items-center justify-center py-12">
            <MeterGroup variant={meterGroupVariant} aria-label="Stereo output meter">
              <MeterGroupChannel label="L">
                <Meter
                  orientation="vertical"
                  value={isMeterAnimated ? meter.l : staticMeterL}
                  peakValue={meter.lPeak}
                  variant={meterVariant}
                  scalePreset="dbfs"
                  showScale
                  ballistics="ppm"
                  segments={isSegmented ? 40 : undefined}
                />
              </MeterGroupChannel>
              <MeterGroupSeparator />
              <MeterGroupChannel label="R">
                <Meter
                  orientation="vertical"
                  value={isMeterAnimated ? meter.r : staticMeterR}
                  peakValue={meter.rPeak}
                  variant={meterVariant}
                  scalePreset="dbfs"
                  showScale
                  ballistics="ppm"
                  segments={isSegmented ? 40 : undefined}
                />
              </MeterGroupChannel>
            </MeterGroup>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Bipolar Pan Gauge"
          description="A configurable radial gauge with custom sweep geometry, caller-defined marks, and an optional center-fill mode for bipolar audio values like pan and balance."
          specs={[
            {
              label: 'Pan',
              value: (
                <Slider
                  aria-label="Pan gauge value"
                  className="h-10 w-28"
                  min={-100}
                  max={100}
                  value={gaugeValue}
                  showMarks={false}
                  variant="black"
                  onValueChange={(next) => setGaugeValue(next as number)}
                />
              ),
            },
            {
              label: 'Variant',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={gaugeVariant}
                  onChange={(e) => setGaugeVariant(e.target.value as any)}
                >
                  <option value="lcd-green">LCD Green</option>
                  <option value="lcd-amber">LCD Amber</option>
                  <option value="lcd-blue">LCD Blue</option>
                </select>
              ),
            },
          ]}
        >
          <div className="flex w-full items-center justify-center py-12">
            <Gauge
              className="max-w-sm"
              min={-100}
              max={100}
              value={gaugeValue}
              onValueChange={(val) => setGaugeValue(val as number)}
              variant={gaugeVariant}
              fillMode="center"
              centerValue={0}
              marks={panGaugeMarks}
              showMarks
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Wheel Select"
          description="A vertically-oriented selection wheel inspired by aircraft pitch trim mechanisms. Provides tactile, stepped navigation through options."
          specs={[{ label: 'Value', value: wheelValue }]}
        >
          <div className="flex w-full items-center justify-center py-12">
            <WheelSelect
              className="max-w-sm"
              options={['PITCH DOWN', 'NEUTRAL', 'PITCH UP', 'AUTO TRIM', 'MANUAL']}
              value={wheelValue}
              onValueChange={setWheelValue}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Wheel Number"
          description="A continuous numeric input mechanism with scrub interactions. Perfect for precision adjustments requiring fine-grained control."
          specs={[{ label: 'Value', value: wheelNum.toString() }]}
        >
          <div className="flex w-full items-center justify-center py-12">
            <WheelNumber
              className="max-w-sm"
              value={wheelNum}
              onValueChange={(val) => setWheelNum(val ?? 0)}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Indicator"
          description="A hyper-skeuomorphic status indicator based on classic amp and console jewel lights. Features faceted glass textures, dynamic core lighting with bloom, and a metallic bezel."
          specs={[
            {
              label: 'State',
              value: <Switch checked={indicatorOn} onCheckedChange={setIndicatorOn} />,
            },
            {
              label: 'Color',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={indicatorColor}
                  onChange={(e) => setIndicatorColor(e.target.value as any)}
                >
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="blue">Blue</option>
                  <option value="white">White</option>
                </select>
              ),
            },
            {
              label: 'Size',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={indicatorSize}
                  onChange={(e) => setIndicatorSize(e.target.value as any)}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              ),
            },
            {
              label: 'Shape',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={indicatorShape}
                  onChange={(e) => setIndicatorShape(e.target.value as any)}
                >
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                </select>
              ),
            },
            {
              label: 'Bezel',
              value: <Switch checked={indicatorHasBezel} onCheckedChange={setIndicatorHasBezel} />,
            },
          ]}
        >
          <div className="flex gap-16 items-center justify-center py-12">
            <div className="flex flex-col gap-4 items-center">
              <Indicator
                isOn={indicatorOn}
                color={indicatorColor}
                size={indicatorSize}
                shape={indicatorShape}
                variant="chrome"
                disableBezel={!indicatorHasBezel}
              />
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest font-bold">
                Chrome
              </span>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <Indicator
                isOn={indicatorOn}
                color={indicatorColor}
                size={indicatorSize}
                shape={indicatorShape}
                variant="black"
                disableBezel={!indicatorHasBezel}
              />
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest font-bold">
                Black
              </span>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Panel"
          description="A container component analogous to an audio rack panel. Features industrial styling, optional screws, and structured layout subcomponents (Header, Content, Footer)."
          specs={[
            {
              label: 'Variant',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={panelVariant}
                  onChange={(e) => setPanelVariant(e.target.value as any)}
                >
                  <option value="default">Default</option>
                  <option value="rack">Rack</option>
                </select>
              ),
            },
            {
              label: 'Screws',
              value: <Switch checked={panelScrews} onCheckedChange={setPanelScrews} />,
            },
            {
              label: 'Screw Variant',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={screwVariant}
                  onChange={(e) => setScrewVariant(e.target.value as any)}
                >
                  <option value="chrome">Chrome</option>
                  <option value="black">Black</option>
                </select>
              ),
            },
            {
              label: 'Screw Hole',
              value: (
                <select
                  className="bg-[#111] text-[#888] border border-[#333] rounded px-2 py-1 text-xs outline-none"
                  value={screwHole}
                  onChange={(e) => setScrewHole(e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="slot">Slot</option>
                  <option value="cross">Cross</option>
                  <option value="star">Star</option>
                </select>
              ),
            },
          ]}
        >
          <div className="w-full max-w-3xl px-4">
            <Panel
              variant={panelVariant}
              screws={panelScrews}
              screwVariant={screwVariant}
              screwHole={screwHole}
            >
              <PanelHeader>
                <PanelTitle>Master Bus</PanelTitle>
                <PanelDescription>Dynamics, makeup gain, and stereo output</PanelDescription>
              </PanelHeader>
              <PanelContent className="grid gap-12 md:grid-cols-[minmax(0,1fr)_176px] md:items-stretch">
                <div className="flex flex-col justify-center gap-10 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">Compression</span>
                    <Toggle
                      value={compressionToggle}
                      onValueChange={setCompressionToggle}
                      className="w-[104px]"
                    />
                  </div>
                  <div className="flex flex-col gap-10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#a0a0a0]">Makeup Gain</span>
                      <span className="text-xs font-mono text-[#555]">{makeupGain[0]} dB</span>
                    </div>
                    <div className="px-2 pb-2 mt-4">
                      <Slider
                        value={makeupGain}
                        onValueChange={(value) =>
                          setMakeupGain(Array.isArray(value) ? [...value] : [value])
                        }
                        max={12}
                        min={-12}
                        marks={makeupGainMarks}
                        showMarks
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
                  <MeterGroup
                    variant="panel"
                    className="my-auto"
                    aria-label="Master bus stereo output"
                  >
                    <MeterGroupChannel label="L">
                      <Meter
                        orientation="vertical"
                        value={isMeterAnimated ? meter.l : staticMeterL}
                        peakValue={meter.lPeak}
                        variant={meterVariant}
                        scalePreset="dbfs"
                        showScale
                        ballistics="ppm"
                        segments={isSegmented ? 40 : undefined}
                      />
                    </MeterGroupChannel>
                    <MeterGroupSeparator />
                    <MeterGroupChannel label="R">
                      <Meter
                        orientation="vertical"
                        value={isMeterAnimated ? meter.r : staticMeterR}
                        peakValue={meter.rPeak}
                        variant={meterVariant}
                        scalePreset="dbfs"
                        showScale
                        ballistics="ppm"
                        segments={isSegmented ? 40 : undefined}
                      />
                    </MeterGroupChannel>
                  </MeterGroup>
                </div>
              </PanelContent>
              <PanelFooter>
                <PushToggle
                  className="w-full"
                  indicatorColor="amber"
                  pressed={bypass}
                  variant={bypass ? 'chrome' : 'black'}
                  onPressedChange={setBypass}
                >
                  Bypass
                </PushToggle>
              </PanelFooter>
            </Panel>
          </div>
        </ComponentShowcase>
      </div>
    </AnalogLightingProvider>
  );
}
