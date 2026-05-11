import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { cn } from '@/lib/utils';
import { SurfaceButton } from './SurfaceButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export type GaugeVariant = 'lcd-green' | 'lcd-amber' | 'lcd-blue';

export interface GaugeMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface GaugeProps extends React.ComponentPropsWithoutRef<typeof Slider.Root> {
  variant?: GaugeVariant;
  lighting?: AnalogLightingConfig<'surface' | 'pointer' | 'lens'>;
  startAngle?: number;
  sweepAngle?: number;
  marks?: readonly GaugeMark[];
  showMarks?: boolean;
  fillMode?: 'start' | 'center';
  centerValue?: number;
}

export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      className,
      value,
      min = 0,
      max = 100,
      variant = 'lcd-green',
      lighting,
      startAngle = -135,
      sweepAngle = 270,
      marks,
      showMarks = marks !== undefined,
      fillMode = 'start',
      centerValue,
      ...props
    },
    ref,
  ) => {
    const getVariantColors = (v: GaugeVariant) => {
      switch (v) {
        case 'lcd-amber':
          return {
            glow: 'var(--analog-lcd-amber-glow)',
            bg: 'var(--analog-lcd-amber-fill)',
          };
        case 'lcd-blue':
          return {
            glow: 'var(--analog-lcd-blue-glow)',
            bg: 'var(--analog-lcd-blue-fill)',
          };
        case 'lcd-green':
        default:
          return {
            glow: 'var(--analog-lcd-green-glow)',
            bg: 'var(--analog-lcd-green-fill)',
          };
      }
    };

    const colors = getVariantColors(variant as GaugeVariant);
    const lightingStyle = useAnalogLighting(['surface', 'pointer', 'lens'], lighting);

    return (
      <Slider.Root
        ref={ref}
        value={value}
        min={min}
        max={max}
        {...props}
        render={(rootProps, state) => {
          const val = state.values[0] ?? min;
          const range = max - min;
          const ratio = range === 0 ? 0 : Math.min(1, Math.max(0, (val - min) / range));
          const resolvedSweepAngle = Math.min(359.999, Math.max(0, sweepAngle));
          const rotationAngle = startAngle + ratio * resolvedSweepAngle;
          const resolvedCenterValue = centerValue ?? (min + max) / 2;
          const centerRatio =
            range === 0 ? 0 : Math.min(1, Math.max(0, (resolvedCenterValue - min) / range));
          const fillStartRatio = fillMode === 'center' ? Math.min(ratio, centerRatio) : 0;
          const fillEndRatio = fillMode === 'center' ? Math.max(ratio, centerRatio) : ratio;
          const fillStart = fillStartRatio * resolvedSweepAngle;
          const fillLength = Math.max(0, (fillEndRatio - fillStartRatio) * resolvedSweepAngle);
          const pointerBevelAngle = `calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg)`;
          const resolvedMarks = showMarks
            ? (marks ?? []).map((mark) => ({
                ...mark,
                ratio:
                  mark.position !== undefined
                    ? Math.min(1, Math.max(0, mark.position))
                    : range === 0
                      ? 0
                      : Math.min(1, Math.max(0, (mark.value - min) / range)),
              }))
            : [];

          return (
            <div
              {...rootProps}
              className={cn(
                'relative mx-auto flex aspect-square w-full min-w-0 max-w-[12rem] items-center justify-center p-4',
                className,
              )}
              style={lightingStyle}
            >
              {/* Invisible Linear Slider Control overlaying everything for interaction */}
              <Slider.Control className="absolute inset-4 z-40 touch-none cursor-ew-resize">
                <Slider.Track className="w-full h-full opacity-0">
                  <Slider.Thumb className="w-8 h-full" />
                </Slider.Track>
              </Slider.Control>

              <div className="absolute inset-0 pointer-events-none">
                {/* Background Cavity / Track */}
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible p-2">
                  <defs>
                    <filter id="gauge-inset-shadow">
                      <feOffset dx="0" dy="1" />
                      <feGaussianBlur stdDeviation="1" result="offset-blur" />
                      <feComposite
                        operator="out"
                        in="SourceGraphic"
                        in2="offset-blur"
                        result="inverse"
                      />
                      <feFlood floodColor="black" floodOpacity="0.7" result="color" />
                      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                    <mask id="gauge-indicator-mask">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="white"
                        strokeWidth="6.5"
                        fill="none"
                        pathLength="360"
                        strokeDasharray={`${fillLength} 360`}
                        strokeDashoffset={-fillStart}
                        transform={`rotate(${startAngle - 90} 50 50)`}
                      />
                    </mask>
                    <pattern
                      id="gauge-indicator-noise"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <image
                        href="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                        preserveAspectRatio="none"
                      />
                    </pattern>
                  </defs>

                  {/* Track Background */}
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="var(--analog-surface-cavity-strong)"
                    strokeWidth="6"
                    fill="none"
                    pathLength="360"
                    strokeDasharray={`${resolvedSweepAngle} 360`}
                    transform={`rotate(${startAngle - 90} 50 50)`}
                    filter="url(#gauge-inset-shadow)"
                  />

                  {/* Indicator Glow */}
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke={colors.glow}
                    strokeWidth="8"
                    fill="none"
                    pathLength="360"
                    strokeDasharray={`${fillLength} 360`}
                    strokeDashoffset={-fillStart}
                    transform={`rotate(${startAngle - 90} 50 50)`}
                    style={{
                      filter: 'blur(4px)',
                      opacity: 0.5,
                    }}
                  />

                  {/* Indicator Foreground with Noise Masked */}
                  <g mask="url(#gauge-indicator-mask)">
                    <rect x="0" y="0" width="100" height="100" fill={colors.bg} />
                    <rect
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                      fill="url(#gauge-indicator-noise)"
                      style={{
                        mixBlendMode: 'screen',
                        opacity: 'var(--analog-grain-opacity)',
                      }}
                    />
                  </g>

                  {resolvedMarks.map((mark) => {
                    const angle = startAngle + mark.ratio * resolvedSweepAngle;
                    const radians = (angle * Math.PI) / 180;
                    const lineStartX = 50 + Math.cos(radians) * 39;
                    const lineStartY = 50 + Math.sin(radians) * 39;
                    const lineEndX = 50 + Math.cos(radians) * 44;
                    const lineEndY = 50 + Math.sin(radians) * 44;
                    const labelX = 50 + Math.cos(radians) * 33;
                    const labelY = 50 + Math.sin(radians) * 33;

                    return (
                      <g key={`${mark.value}-${String(mark.label)}`}>
                        <line
                          x1={lineStartX}
                          y1={lineStartY}
                          x2={lineEndX}
                          y2={lineEndY}
                          stroke="var(--analog-telemetry-label)"
                          strokeWidth="0.85"
                          style={{ opacity: 0.85 }}
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          fill="var(--analog-legend)"
                          fontSize="4"
                          fontFamily="var(--font-mono, ui-monospace, monospace)"
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {mark.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Central dial surface */}
              <div className="absolute inset-6 pointer-events-none">
                <SurfaceButton
                  rotation={rotationAngle}
                  containerClassName="w-full h-full pointer-events-none"
                  className="w-full h-full pointer-events-none"
                  style={{ pointerEvents: 'none' }}
                  disabled
                  tabIndex={-1}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ transform: `rotate(${rotationAngle}deg)` }}
                  >
                    {/* Dial indicator line */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 rounded-full border"
                      style={{
                        top: '12%',
                        width: '3%',
                        height: '24%',
                        borderColor:
                          'color-mix(in oklch, var(--analog-control-border-strong) 65%, transparent)',
                        background:
                          `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg - 45deg), ` +
                          `color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%) 0%, ` +
                          `var(--analog-surface-metal-mid) 40%, ` +
                          `var(--analog-surface-metal-lo) 100%)`,
                        boxShadow: `inset calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 2px rgba(255,255,255,calc(0.6 * var(--analog-light-power, 1))), inset calc(sin(${pointerBevelAngle}) * -1px) calc(cos(${pointerBevelAngle}) * 1px) 2px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 4px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
                      }}
                    >
                      <div
                        className="absolute rounded-full blur-[0.5px]"
                        style={{
                          top: '10%',
                          left: '50%',
                          width: '30%',
                          height: '30%',
                          backgroundColor: 'var(--analog-surface-metal-hi)',
                          transform: `translateX(-50%)`,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                </SurfaceButton>
              </div>
            </div>
          );
        }}
      />
    );
  },
);
Gauge.displayName = 'Gauge';
