import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { cn } from '../../../lib/utils';
import { SurfaceButton } from './SurfaceButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogTone } from './tone';
import { clamp, normalizeRatio, polarPoint, resolveRadialMarks, type RadialPoint } from './radial';

export interface GaugeMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export type GaugePoint = RadialPoint;

export interface GaugeResolvedMark extends GaugeMark {
  ratio: number;
  angle: number;
  lineStart: GaugePoint;
  lineEnd: GaugePoint;
  labelPosition: GaugePoint;
}

export interface GaugeRenderTrackProps {
  value: number;
  min: number;
  max: number;
  ratio: number;
  startAngle: number;
  sweepAngle: number;
  filterId: string;
  tone: AnalogTone;
  className: string;
}

export interface GaugeRenderIndicatorProps {
  value: number;
  min: number;
  max: number;
  ratio: number;
  startAngle: number;
  sweepAngle: number;
  fillMode: 'start' | 'center';
  centerValue: number;
  fillStart: number;
  fillLength: number;
  maskId: string;
  noiseId: string;
  tone: AnalogTone;
  glowColor: string;
  fillColor: string;
  className: string;
}

export interface GaugeRenderMarkProps {
  mark: GaugeResolvedMark;
  value: number;
  min: number;
  max: number;
  ratio: number;
  tone: AnalogTone;
  className: string;
}

export interface GaugeRenderPointerProps {
  value: number;
  min: number;
  max: number;
  ratio: number;
  rotationAngle: number;
  pointerBevelAngle: string;
  tone: AnalogTone;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export interface GaugeProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Slider.Root>,
  'render'
> {
  tone?: AnalogTone;
  lighting?: AnalogLightingConfig<'surface' | 'pointer' | 'lens'>;
  startAngle?: number;
  sweepAngle?: number;
  marks?: readonly GaugeMark[];
  showMarks?: boolean;
  fillMode?: 'start' | 'center';
  centerValue?: number;
  trackClassName?: string;
  indicatorClassName?: string;
  markClassName?: string;
  pointerClassName?: string;
  renderTrack?: (props: GaugeRenderTrackProps) => React.ReactNode;
  renderIndicator?: (props: GaugeRenderIndicatorProps) => React.ReactNode;
  renderMark?: (props: GaugeRenderMarkProps) => React.ReactNode;
  renderPointer?: (props: GaugeRenderPointerProps) => React.ReactNode;
}

function DefaultGaugeTrack({ className, startAngle, sweepAngle, filterId }: GaugeRenderTrackProps) {
  return (
    <circle
      data-slot="gauge-track-arc"
      className={className}
      cx="50"
      cy="50"
      r="46"
      stroke="var(--analog-surface-cavity-strong)"
      strokeWidth="6"
      fill="none"
      pathLength="360"
      strokeDasharray={`${sweepAngle} 360`}
      transform={`rotate(${startAngle - 90} 50 50)`}
      filter={`url(#${filterId})`}
    />
  );
}

function DefaultGaugeIndicator({
  className,
  startAngle,
  fillStart,
  fillLength,
  maskId,
  noiseId,
  glowColor,
  fillColor,
}: GaugeRenderIndicatorProps) {
  return (
    <g data-slot="gauge-indicator" className={className}>
      <circle
        data-slot="gauge-indicator-glow"
        cx="50"
        cy="50"
        r="46"
        stroke={glowColor}
        strokeWidth="8"
        fill="none"
        pathLength="360"
        strokeDasharray={`${fillLength} 360`}
        strokeDashoffset={-fillStart}
        transform={`rotate(${startAngle - 90} 50 50)`}
        style={{
          filter: 'blur(calc(4px * var(--analog-bloom-strength, 0.7) * 1.428571))',
          opacity: 'calc(0.5 * var(--analog-bloom-strength, 0.7) * 1.428571)',
        }}
      />

      <g data-slot="gauge-indicator-fill" mask={`url(#${maskId})`}>
        <rect x="0" y="0" width="100" height="100" fill={fillColor} />
        <rect
          data-slot="gauge-indicator-noise"
          x="0"
          y="0"
          width="100"
          height="100"
          fill={`url(#${noiseId})`}
          style={{
            mixBlendMode: 'screen',
            opacity: 'var(--analog-grain-opacity)',
          }}
        />
      </g>
    </g>
  );
}

function DefaultGaugeMark({ mark, className }: GaugeRenderMarkProps) {
  return (
    <g data-slot="gauge-mark" className={className}>
      <line
        data-slot="gauge-mark-tick"
        x1={mark.lineStart.x}
        y1={mark.lineStart.y}
        x2={mark.lineEnd.x}
        y2={mark.lineEnd.y}
        stroke="var(--analog-telemetry-label)"
        strokeWidth="0.85"
        style={{ opacity: 0.85 }}
      />
      <text
        data-slot="gauge-mark-label"
        x={mark.labelPosition.x}
        y={mark.labelPosition.y}
        fill="var(--analog-legend)"
        fontSize="4"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {mark.label}
      </text>
    </g>
  );
}

function DefaultGaugePointer({
  className,
  style,
  rotationAngle,
  children,
}: GaugeRenderPointerProps) {
  return (
    <div data-slot="gauge-pointer" className={className} style={style}>
      <SurfaceButton
        data-slot="gauge-pointer-surface"
        rotation={rotationAngle}
        containerClassName="w-full h-full pointer-events-none"
        className="analog-dial-surface w-full h-full pointer-events-none"
        style={{ pointerEvents: 'none' }}
        disabled
        tabIndex={-1}
      >
        {children}
      </SurfaceButton>
    </div>
  );
}

export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      className,
      value,
      min = 0,
      max = 100,
      tone = 'success',
      lighting,
      startAngle = -135,
      sweepAngle = 270,
      marks,
      showMarks = marks !== undefined,
      fillMode = 'start',
      centerValue,
      trackClassName,
      indicatorClassName,
      markClassName,
      pointerClassName,
      renderTrack,
      renderIndicator,
      renderMark,
      renderPointer,
      ...props
    },
    ref,
  ) => {
    const pointerLightingRef = React.useRef<HTMLDivElement>(null);
    const gaugeId = React.useId().replace(/:/g, '');
    const colors = {
      glow: 'var(--analog-display-glow)',
      bg: 'var(--analog-display-fill)',
    };
    const lightingStyle = useAnalogLighting(['surface', 'pointer', 'lens'], lighting, {
      targetRef: pointerLightingRef,
    });

    return (
      <Slider.Root
        ref={ref}
        value={value}
        min={min}
        max={max}
        {...props}
        render={(rootProps, state) => {
          const rootPropsWithRef = rootProps as React.HTMLAttributes<HTMLDivElement> & {
            ref?: React.Ref<HTMLDivElement>;
          };
          const { ref: rootRenderRef, ...resolvedRootProps } = rootPropsWithRef;
          const val = state.values[0] ?? min;
          const ratio = normalizeRatio(val, min, max, val >= max ? 1 : 0);
          const resolvedSweepAngle = clamp(sweepAngle, 0, 359.999);
          const rotationAngle = startAngle + ratio * resolvedSweepAngle;
          const resolvedCenterValue = centerValue ?? (min + max) / 2;
          const centerRatio = normalizeRatio(
            resolvedCenterValue,
            min,
            max,
            resolvedCenterValue >= max ? 1 : 0,
          );
          const fillStartRatio = fillMode === 'center' ? Math.min(ratio, centerRatio) : 0;
          const fillEndRatio = fillMode === 'center' ? Math.max(ratio, centerRatio) : ratio;
          const fillStart = fillStartRatio * resolvedSweepAngle;
          const fillLength = Math.max(0, (fillEndRatio - fillStartRatio) * resolvedSweepAngle);
          const pointerBevelAngle = `calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg)`;
          const insetShadowId = `gauge-inset-shadow-${gaugeId}`;
          const indicatorMaskId = `gauge-indicator-mask-${gaugeId}`;
          const indicatorNoiseId = `gauge-indicator-noise-${gaugeId}`;
          const resolvedMarks = showMarks
            ? resolveRadialMarks(marks ?? [], {
                min,
                max,
                startAngle,
                sweepAngle: resolvedSweepAngle,
                fallbackRatio: (mark) => (mark.value >= max ? 1 : 0),
              }).map((mark) => ({
                ...mark,
                lineStart: polarPoint(39, mark.angle),
                lineEnd: polarPoint(44, mark.angle),
                labelPosition: polarPoint(33, mark.angle),
              }))
            : [];
          const trackProps: GaugeRenderTrackProps = {
            value: val,
            min,
            max,
            ratio,
            startAngle,
            sweepAngle: resolvedSweepAngle,
            filterId: insetShadowId,
            tone,
            className: cn(trackClassName),
          };
          const indicatorProps: GaugeRenderIndicatorProps = {
            value: val,
            min,
            max,
            ratio,
            startAngle,
            sweepAngle: resolvedSweepAngle,
            fillMode,
            centerValue: resolvedCenterValue,
            fillStart,
            fillLength,
            maskId: indicatorMaskId,
            noiseId: indicatorNoiseId,
            tone,
            glowColor: colors.glow,
            fillColor: colors.bg,
            className: cn(indicatorClassName),
          };
          const pointerChildren = (
            <div
              data-slot="gauge-pointer-rotor"
              className="absolute inset-0 rounded-full"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <div
                data-slot="gauge-pointer-line"
                className="absolute left-1/2 -translate-x-1/2 rounded-full border"
                style={{
                  top: '12%',
                  width: '3%',
                  height: '24%',
                  borderColor:
                    'color-mix(in oklch, var(--analog-control-border-strong) 65%, transparent)',
                  background:
                    `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg - 45deg), ` +
                    `color-mix(in oklch, var(--analog-surface-metal-hi) 78%, var(--analog-highlight-color) 22%) 0%, ` +
                    `var(--analog-surface-metal-mid) 40%, ` +
                    `var(--analog-surface-metal-lo) 100%)`,
                  boxShadow: `inset calc(sin(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-highlight-rgb) / calc(0.6 * var(--analog-light-power, 1))), inset calc(sin(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * -0.25) calc(cos(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-shadow-rgb) / calc(0.5 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), calc(sin(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(${pointerBevelAngle}) * var(--analog-bevel-width, 4px) * -0.25) var(--analog-bevel-width, 4px) rgb(var(--analog-shadow-rgb) / calc(0.6 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
                }}
              >
                <div
                  data-slot="gauge-pointer-highlight"
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
          );
          const pointerProps: GaugeRenderPointerProps = {
            value: val,
            min,
            max,
            ratio,
            rotationAngle,
            pointerBevelAngle,
            tone,
            className: cn('absolute pointer-events-none', pointerClassName),
            style: { inset: 'var(--analog-gauge-center-inset, 1.5rem)' },
            children: pointerChildren,
          };

          return (
            <div
              {...resolvedRootProps}
              ref={(node) => {
                pointerLightingRef.current = node;

                if (typeof rootRenderRef === 'function') {
                  rootRenderRef(node);
                } else if (rootRenderRef) {
                  rootRenderRef.current = node;
                }
              }}
              data-slot="gauge-root"
              className={cn(
                'relative mx-auto flex aspect-square w-full min-w-0 max-w-[12rem] items-center justify-center p-4',
                className,
              )}
              data-analog-tone={tone}
              style={{
                ...lightingStyle,
                ...rootProps.style,
              }}
            >
              {/* Invisible Linear Slider Control overlaying everything for interaction */}
              <Slider.Control
                data-slot="gauge-control"
                className="absolute inset-4 z-40 touch-none cursor-ew-resize"
              >
                <Slider.Track data-slot="gauge-hidden-track" className="w-full h-full opacity-0">
                  <Slider.Thumb data-slot="gauge-hidden-thumb" className="w-8 h-full" />
                </Slider.Track>
              </Slider.Control>

              <div data-slot="gauge-scale" className="absolute inset-0 pointer-events-none">
                {/* Background Cavity / Track */}
                <svg
                  data-slot="gauge-svg"
                  viewBox="0 0 100 100"
                  className="w-full h-full overflow-visible p-2"
                >
                  <defs data-slot="gauge-definitions">
                    <filter data-slot="gauge-inset-shadow" id={insetShadowId}>
                      <feOffset dx="0" dy="1" />
                      <feGaussianBlur stdDeviation="1" result="offset-blur" />
                      <feComposite
                        operator="out"
                        in="SourceGraphic"
                        in2="offset-blur"
                        result="inverse"
                      />
                      <feFlood
                        floodColor="var(--analog-shadow-color)"
                        floodOpacity="0.7"
                        result="color"
                      />
                      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                    <mask data-slot="gauge-indicator-mask" id={indicatorMaskId}>
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="var(--analog-mask-fill)"
                        strokeWidth="6.5"
                        fill="none"
                        pathLength="360"
                        strokeDasharray={`${fillLength} 360`}
                        strokeDashoffset={-fillStart}
                        transform={`rotate(${startAngle - 90} 50 50)`}
                      />
                    </mask>
                    <pattern
                      data-slot="gauge-indicator-noise-pattern"
                      id={indicatorNoiseId}
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

                  {renderTrack?.(trackProps) ?? <DefaultGaugeTrack {...trackProps} />}

                  {renderIndicator?.(indicatorProps) ?? (
                    <DefaultGaugeIndicator {...indicatorProps} />
                  )}

                  {resolvedMarks.map((mark, index) => (
                    <React.Fragment key={`${mark.value}-${mark.position ?? mark.ratio}-${index}`}>
                      {renderMark?.({
                        mark,
                        value: val,
                        min,
                        max,
                        ratio,
                        tone,
                        className: cn(markClassName),
                      }) ?? (
                        <DefaultGaugeMark
                          mark={mark}
                          value={val}
                          min={min}
                          max={max}
                          ratio={ratio}
                          tone={tone}
                          className={cn(markClassName)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </svg>
              </div>

              {renderPointer?.(pointerProps) ?? <DefaultGaugePointer {...pointerProps} />}
            </div>
          );
        }}
      />
    );
  },
);
Gauge.displayName = 'Gauge';
