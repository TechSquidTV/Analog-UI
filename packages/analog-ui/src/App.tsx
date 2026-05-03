/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from './lib/utils';
import { useMouseLumination } from './registry/hooks/use-mouse-lumination';
import { AnalogLightingProvider } from './registry/hooks/use-analog-lighting';
import { Dial } from './registry/components/analog/Dial';
import { AnalogToggle } from './registry/components/analog/Toggle';
import { AnalogSwitch } from './registry/components/analog/Switch';
import { AnalogSlider } from './registry/components/analog/Slider';
import { AnalogMeter } from './registry/components/analog/Meter';
import { AnalogWheelSelect } from './registry/components/analog/WheelSelect';
import { AnalogWheelNumber } from './registry/components/analog/WheelNumber';
import {
  AnalogIndicator,
  type AnalogIndicatorColor,
  type AnalogIndicatorShape,
  type AnalogIndicatorSize,
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
  const [channels, setChannels] = useState({ l: 0, r: 0, lPeak: 0, rPeak: 0 });
  const lPeakRef = useRef(0);
  const rPeakRef = useRef(0);
  const lPeakTime = useRef(0);
  const rPeakTime = useRef(0);

  useEffect(() => {
    const tick = () => {
      setChannels((prev) => {
        // More realistic bouncy audio simulation
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

    const interval = setInterval(tick, 40);
    return () => clearInterval(interval);
  }, []);

  return channels;
}

export default function App() {
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
  const [togglesLeftLed, setTogglesLeftLed] = useState<AnalogIndicatorColor>('none');
  const [togglesRightLed, setTogglesRightLed] = useState<AnalogIndicatorColor>('none');
  const [togglesLeftActive, setTogglesLeftActive] = useState<'auto' | 'always' | 'never'>('auto');
  const [togglesRightActive, setTogglesRightActive] = useState<'auto' | 'always' | 'never'>('auto');

  // Analog Switch States
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);

  // States for Faders
  const [fader1, setFader1] = useState(0);
  const [fader2, setFader2] = useState(0);

  const [indicatorOn, setIndicatorOn] = useState(false);
  const [indicatorColor, setIndicatorColor] =
    useState<Exclude<AnalogIndicatorColor, 'none'>>('red');
  const [indicatorSize, setIndicatorSize] = useState<Exclude<AnalogIndicatorSize, 'xs'>>('lg');
  const [indicatorShape, setIndicatorShape] = useState<AnalogIndicatorShape>('round');
  const [indicatorHasBezel, setIndicatorHasBezel] = useState(true);

  // Audio meter logic
  const meter = useAudioMeter();
  const [isMeterAnimated, setIsMeterAnimated] = useState(true);
  const [staticMeterL, setStaticMeterL] = useState(70);
  const [staticMeterR, setStaticMeterR] = useState(50);
  const [meterVariant, setMeterVariant] = useState<
    'metered' | 'lcd-green' | 'lcd-amber' | 'lcd-blue'
  >('metered');
  const [isSegmented, setIsSegmented] = useState(true);
  const [gaugeValue, setGaugeValue] = useState(42);
  const [gaugeVariant, setGaugeVariant] = useState<'lcd-green' | 'lcd-amber' | 'lcd-blue'>(
    'lcd-green',
  );
  const [wheelValue, setWheelValue] = useState('SPEED');
  const [wheelNum, setWheelNum] = useState(0);

  // Global Light Controller
  const [lightAngle, setLightAngle] = useState(180);
  const [lightPower, setLightPower] = useState(120);
  const [mouseInfluence, setMouseInfluence] = useState(1);

  const dynamicLightAngle = useMouseLumination({
    baseAngle: lightAngle,
    influence: mouseInfluence,
  });

  const [panelVariant, setPanelVariant] = useState<'default' | 'rack'>('rack');
  const [panelScrews, setPanelScrews] = useState(true);
  const [screwVariant, setScrewVariant] = useState<'chrome' | 'black'>('chrome');
  const [screwHole, setScrewHole] = useState<'none' | 'slot' | 'cross' | 'star'>('cross');
  const [compressionToggle, setCompressionToggle] = useState<'left' | 'right'>('left');
  const [makeupGain, setMakeupGain] = useState<number[]>([4]);
  const [bypass, setBypass] = useState(false);

  return (
    <AnalogLightingProvider
      baseAngle={lightAngle}
      sourceAngle={dynamicLightAngle}
      power={lightPower / 120}
    >
      <div className="w-full min-h-screen p-8 md:p-16 flex flex-col pt-32 md:pt-16">
        <div className="fixed top-6 right-6 md:top-12 md:right-12 z-50 bg-[#141414] border border-[#262626] rounded-xl p-5 w-72 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
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
              <input
                type="range"
                min="0"
                max="500"
                value={lightPower}
                onChange={(e) => setLightPower(Number(e.target.value))}
                className="w-full h-1 bg-[#222] rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-accent)] [&::-webkit-slider-thumb]:cursor-pointer mb-4"
              />
              <div className="flex justify-between text-[10px] text-[#888] font-mono uppercase mb-2">
                <span>Mouse Travel</span>
                <span className="text-[var(--color-accent)]">
                  {Math.round(mouseInfluence * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mouseInfluence}
                onChange={(e) => setMouseInfluence(Number(e.target.value))}
                className="w-full h-1 bg-[#222] rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-accent)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>

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
          title="Anisotropic Dial"
          description="A classic potentiometer dial featuring radial anisotropic shading and dynamic foil reflections. Responds to the shared analog lighting system for a realistic metallic sheen. Drag to rotate."
          specs={[
            { label: 'Value', value: `${Math.round(dialValue)}°` },
            { label: 'Degrees', value: `${Math.round(degrees)}°` },
            { label: 'Revolutions', value: revolutions },
          ]}
        >
          <div className="flex gap-16 items-center justify-center flex-wrap">
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
              value={blackDialValue}
              onChange={(val) => {
                setBlackDialValue(val);
              }}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Industrial Power Rocker"
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
                <AnalogToggle
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
                <AnalogToggle
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
                <AnalogToggle
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
                <AnalogToggle
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
          title="Machined Cylinder Switch"
          description="A tactile track switch that reimagines the standard toggle. Features a 3D-extruded metallic cylinder that rolls through a recessed cavity."
          specs={[
            { label: 'State (Chrome)', value: switch1 ? 'ON' : 'OFF' },
            { label: 'State (Black)', value: switch2 ? 'ON' : 'OFF' },
          ]}
        >
          <div className="flex flex-col gap-16 items-center justify-center py-12">
            <div className="flex items-center justify-between w-48 gap-6">
              <span className="font-mono text-xs text-[#555] uppercase tracking-widest">Warp</span>
              <AnalogSwitch variant="chrome" checked={switch1} onCheckedChange={setSwitch1} />
            </div>
            <div className="flex items-center justify-between w-48 gap-6">
              <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                Stealth
              </span>
              <AnalogSwitch variant="black" checked={switch2} onCheckedChange={setSwitch2} />
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Professional Audio Fader"
          description="A linear sliding fader with a thick tactile base and extruded grip track. Highly responsive and fully integrated with the shared analog lighting system for dynamic casting."
          specs={[
            { label: 'Fader 1 (Chrome)', value: `${fader1}dB` },
            { label: 'Fader 2 (Black)', value: `${fader2}dB` },
            { label: 'Travel', value: '100mm' },
          ]}
        >
          <div className="flex flex-col gap-24 items-center justify-center py-12">
            <div className="flex gap-24 items-center justify-center">
              <AnalogSlider
                orientation="vertical"
                variant="chrome"
                min={-40}
                max={10}
                value={fader1}
                onValueChange={(val) => setFader1(val as number)}
              />
            </div>
            <div className="flex w-full max-w-sm">
              <AnalogSlider
                orientation="horizontal"
                variant="black"
                min={-40}
                max={10}
                value={fader2}
                onValueChange={(val) => setFader2(val as number)}
                className="w-full"
              />
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Audio Channel Monitor"
          description="A high-fidelity VU meter module. Features customizable LCD variants, smooth analog needle ballistics, and segmented or continuous LED arrays."
          specs={[
            {
              label: 'Animated',
              value: (
                <AnalogSwitch checked={isMeterAnimated} onCheckedChange={setIsMeterAnimated} />
              ),
            },
            {
              label: 'Stat L',
              value: (
                <input
                  type="range"
                  className="w-24 accent-[#555]"
                  disabled={isMeterAnimated}
                  value={staticMeterL}
                  onChange={(e) => setStaticMeterL(Number(e.target.value))}
                />
              ),
            },
            {
              label: 'Stat R',
              value: (
                <input
                  type="range"
                  className="w-24 accent-[#555]"
                  disabled={isMeterAnimated}
                  value={staticMeterR}
                  onChange={(e) => setStaticMeterR(Number(e.target.value))}
                />
              ),
            },
            {
              label: 'Variant',
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
              label: 'Segments',
              value: <AnalogSwitch checked={isSegmented} onCheckedChange={setIsSegmented} />,
            },
          ]}
        >
          <div className="flex gap-8 items-end justify-center py-12">
            {/* L Channel */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-md bg-[#181818] p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.05)]">
                <AnalogMeter
                  orientation="vertical"
                  value={isMeterAnimated ? meter.l : staticMeterL}
                  peakValue={meter.lPeak}
                  variant={meterVariant}
                  segments={isSegmented ? 40 : undefined}
                />
              </div>
              <span className="font-mono text-xs text-[#555] font-bold">L</span>
            </div>

            {/* R Channel */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-md bg-[#181818] p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.05)]">
                <AnalogMeter
                  orientation="vertical"
                  value={isMeterAnimated ? meter.r : staticMeterR}
                  peakValue={meter.rPeak}
                  variant={meterVariant}
                  segments={isSegmented ? 40 : undefined}
                />
              </div>
              <span className="font-mono text-xs text-[#555] font-bold">R</span>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="LCD Radial Gauge"
          description="A circular gauge that merges an anisotropic metallic dial with an LCD arc display. Operates as a purely visual monitor."
          specs={[
            {
              label: 'Value',
              value: (
                <input
                  type="range"
                  className="w-24 accent-[#555]"
                  value={gaugeValue}
                  onChange={(e) => setGaugeValue(Number(e.target.value))}
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
          <div className="flex justify-center items-center py-12">
            <Gauge
              value={gaugeValue}
              onValueChange={(val) => setGaugeValue(val as number)}
              variant={gaugeVariant}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Tactile Trim Wheel"
          description="A vertically-oriented selection wheel inspired by aircraft pitch trim mechanisms. Provides tactile, stepped navigation through options."
          specs={[{ label: 'Value', value: wheelValue }]}
        >
          <div className="flex gap-8 items-center justify-center py-12">
            <AnalogWheelSelect
              options={['PITCH DOWN', 'NEUTRAL', 'PITCH UP', 'AUTO TRIM', 'MANUAL']}
              value={wheelValue}
              onValueChange={setWheelValue}
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Tactile Trim Wheel (Numeric)"
          description="A continuous numeric input mechanism with scrub interactions. Perfect for precision adjustments requiring fine-grained control."
          specs={[{ label: 'Value', value: wheelNum.toString() }]}
        >
          <div className="flex gap-8 items-center justify-center py-12">
            <AnalogWheelNumber value={wheelNum} onValueChange={(val) => setWheelNum(val ?? 0)} />
          </div>
        </ComponentShowcase>

        <ComponentShowcase
          title="Faceted Jewel Lamp"
          description="A hyper-skeuomorphic status indicator based on classic amp and console jewel lights. Features faceted glass textures, dynamic core lighting with bloom, and a metallic bezel."
          specs={[
            {
              label: 'State',
              value: <AnalogSwitch checked={indicatorOn} onCheckedChange={setIndicatorOn} />,
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
              value: (
                <AnalogSwitch checked={indicatorHasBezel} onCheckedChange={setIndicatorHasBezel} />
              ),
            },
          ]}
        >
          <div className="flex gap-16 items-center justify-center py-12">
            <div className="flex flex-col gap-4 items-center">
              <AnalogIndicator
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
              <AnalogIndicator
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
          title="Equipment Panel"
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
              value: <AnalogSwitch checked={panelScrews} onCheckedChange={setPanelScrews} />,
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
          <div className="w-full max-w-sm px-4">
            <Panel
              variant={panelVariant}
              screws={panelScrews}
              screwVariant={screwVariant}
              screwHole={screwHole}
            >
              <PanelHeader>
                <PanelTitle>Master Bus</PanelTitle>
                <PanelDescription>Dynamics and EQ</PanelDescription>
              </PanelHeader>
              <PanelContent className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a0a0a0]">Compression</span>
                  <AnalogToggle
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
                    <AnalogSlider
                      value={makeupGain}
                      onValueChange={(value) =>
                        setMakeupGain(Array.isArray(value) ? [...value] : [value])
                      }
                      max={12}
                      min={-12}
                      orientation="horizontal"
                      className="w-full min-w-0"
                    />
                  </div>
                </div>
              </PanelContent>
              <PanelFooter>
                <button
                  onClick={() => setBypass(!bypass)}
                  className={cn(
                    'w-full py-2 text-sm rounded shadow-[inset_0_1px_rgba(255,255,255,0.05),0_1px_4px_rgba(0,0,0,0.5)] transition-colors font-mono uppercase tracking-widest cursor-pointer',
                    bypass
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[#222] hover:bg-[#333] text-[#888]',
                  )}
                >
                  Bypass
                </button>
              </PanelFooter>
            </Panel>
          </div>
        </ComponentShowcase>
      </div>
    </AnalogLightingProvider>
  );
}
