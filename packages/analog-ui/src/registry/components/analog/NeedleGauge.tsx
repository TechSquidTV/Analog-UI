import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { cn } from '@/lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import {
  useAnalogMaterialVariant,
  type AnalogMaterialVariant,
} from '../../hooks/analog-material-scope';

export type NeedleGaugeScalePreset = 'linear' | 'dbfs' | 'vu';
export type NeedleGaugeNeedleVariant = 'red' | 'chrome';

export interface NeedleGaugeMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface NeedleGaugeZone {
  from?: number;
  to?: number;
  color: string;
  glow?: string;
}

export interface NeedleGaugeSpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  restDelta?: number;
  restVelocity?: number;
}

export interface NeedleGaugeProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Meter.Root>,
  'children'
> {
  variant?: AnalogMaterialVariant;
  needleVariant?: NeedleGaugeNeedleVariant;
  lighting?: AnalogLightingConfig<'panel' | 'bezel' | 'track' | 'lens' | 'pointer' | 'surface'>;
  startAngle?: number;
  sweepAngle?: number;
  marks?: readonly NeedleGaugeMark[];
  zones?: readonly NeedleGaugeZone[];
  scalePreset?: NeedleGaugeScalePreset;
  minorTickCount?: number;
  label?: React.ReactNode;
  unit?: React.ReactNode;
  showValue?: boolean;
  valueFormatter?: (value: number) => React.ReactNode;
  animationDuration?: number;
  spring?: boolean | NeedleGaugeSpringConfig;
}

type ResolvedNeedleGaugeSpringConfig = Required<NeedleGaugeSpringConfig>;

const defaultNeedleGaugeSpring: ResolvedNeedleGaugeSpringConfig = {
  stiffness: 420,
  damping: 28,
  mass: 1,
  restDelta: 0.035,
  restVelocity: 0.035,
};

const defaultScaleDomains: Record<NeedleGaugeScalePreset, { min: number; max: number }> = {
  linear: { min: 0, max: 100 },
  dbfs: { min: -60, max: 6 },
  vu: { min: -20, max: 3 },
};

const dialGeometry = {
  centerX: 110,
  centerY: 160,
  radius: 108,
  minorTickInnerRadius: 87,
  minorTickOuterRadius: 97,
  majorTickInnerRadius: 82,
  majorTickOuterRadius: 99,
  labelRadius: 67,
} as const;

const defaultScaleMarks: Record<Exclude<NeedleGaugeScalePreset, 'linear'>, NeedleGaugeMark[]> = {
  dbfs: [
    { value: -60, label: '-60' },
    { value: -40, label: '-40' },
    { value: -20, label: '-20' },
    { value: -10, label: '-10' },
    { value: -6, label: '-6' },
    { value: -3, label: '-3' },
    { value: 0, label: '0' },
    { value: 3, label: '+3' },
    { value: 6, label: '+6' },
  ],
  vu: [
    { value: -20, label: '-20' },
    { value: -10, label: '-10' },
    { value: -7, label: '-7' },
    { value: -5, label: '-5' },
    { value: -3, label: '-3' },
    { value: 0, label: '0' },
    { value: 3, label: '+3' },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const roundSvgNumber = (value: number) => Number(value.toFixed(4));

const normalizeRatio = (value: number, min: number, max: number) => {
  const range = max - min;

  if (range <= 0) {
    return value >= max ? 1 : 0;
  }

  return clamp((value - min) / range, 0, 1);
};

const polarPoint = (centerX: number, centerY: number, radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;

  return {
    x: roundSvgNumber(centerX + Math.cos(radians) * radius),
    y: roundSvgNumber(centerY + Math.sin(radians) * radius),
  };
};

const arcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarPoint(centerX, centerY, radius, startAngle);
  const end = polarPoint(centerX, centerY, radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

function getLinearMarks(min: number, max: number): NeedleGaugeMark[] {
  return Array.from({ length: 6 }, (_, index) => {
    const value = min + ((max - min) * index) / 5;

    return {
      value,
      label: Number.isInteger(value) ? String(value) : value.toFixed(1),
    };
  });
}

function getDefaultZones(
  min: number,
  max: number,
  scalePreset: NeedleGaugeScalePreset,
): NeedleGaugeZone[] {
  if (scalePreset === 'dbfs') {
    return [
      {
        from: min,
        to: -6,
        color: 'var(--analog-meter-zone-green)',
        glow: 'var(--analog-meter-zone-green-glow)',
      },
      {
        from: -6,
        to: 0,
        color: 'var(--analog-meter-zone-amber)',
        glow: 'var(--analog-meter-zone-amber-glow)',
      },
      {
        from: 0,
        to: max,
        color: 'var(--analog-meter-zone-red)',
        glow: 'var(--analog-meter-zone-red-glow)',
      },
    ];
  }

  if (scalePreset === 'vu') {
    return [
      {
        from: min,
        to: 0,
        color: 'var(--analog-meter-zone-green)',
        glow: 'var(--analog-meter-zone-green-glow)',
      },
      {
        from: 0,
        to: max,
        color: 'var(--analog-meter-zone-amber)',
        glow: 'var(--analog-meter-zone-amber-glow)',
      },
    ];
  }

  const range = max - min;

  return [
    {
      from: min,
      to: min + range * 0.72,
      color: 'var(--analog-meter-zone-green)',
      glow: 'var(--analog-meter-zone-green-glow)',
    },
    {
      from: min + range * 0.72,
      to: min + range * 0.9,
      color: 'var(--analog-meter-zone-amber)',
      glow: 'var(--analog-meter-zone-amber-glow)',
    },
    {
      from: min + range * 0.9,
      to: max,
      color: 'var(--analog-meter-zone-red)',
      glow: 'var(--analog-meter-zone-red-glow)',
    },
  ];
}

function formatNeedleGaugeValue(value: number) {
  if (Number.isInteger(value)) return String(value);
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(2);
}

function resolveNeedleGaugeSpring(
  spring: NeedleGaugeProps['spring'],
): ResolvedNeedleGaugeSpringConfig | null {
  if (spring === false) return null;
  if (spring === true || spring === undefined) return defaultNeedleGaugeSpring;

  return {
    ...defaultNeedleGaugeSpring,
    ...spring,
  };
}

const getNeedleGaugeShellStyle = (variant: AnalogMaterialVariant): React.CSSProperties => {
  if (variant === 'black') {
    return {
      borderColor: 'transparent',
      background: `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), var(--analog-surface-onyx-hi) 0%, var(--analog-surface-onyx-mid) 45%, var(--analog-surface-onyx-lo) 100%)`,
      boxShadow:
        `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * 1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * -1px) 1px rgba(255,255,255,calc(0.14 * var(--analog-light-power, 1))), ` +
        `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * -1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * 1px) 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), ` +
        `calc(sin(var(--analog-light-angle-bezel, 180deg)) * 1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))), ` +
        `0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), ` +
        `0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
    };
  }

  return {
    borderColor: 'transparent',
    background: `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), color-mix(in oklch, var(--analog-surface-metal-hi) 82%, white 10%) 0%, var(--analog-surface-metal-hi) 18%, var(--analog-surface-metal-mid) 52%, var(--analog-surface-metal-lo) 100%)`,
    boxShadow:
      `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * 1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * -1px) 1px rgba(255,255,255,calc(0.95 * var(--analog-light-power, 1))), ` +
      `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * -1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * 1px) 2px rgba(0,0,0,calc(0.25 * var(--analog-light-power, 1))), ` +
      `calc(sin(var(--analog-light-angle-bezel, 180deg)) * 1px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.18 * var(--analog-light-power, 1))), ` +
      `0 2px 4px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), ` +
      `0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`,
  };
};

export const NeedleGauge = React.forwardRef<HTMLDivElement, NeedleGaugeProps>(
  (
    {
      className,
      style,
      value,
      min,
      max,
      variant,
      needleVariant = 'red',
      lighting,
      startAngle = 195,
      sweepAngle = 150,
      marks,
      zones,
      scalePreset = 'linear',
      minorTickCount = 40,
      label = 'LEVEL',
      unit = '%',
      showValue = true,
      valueFormatter,
      animationDuration = 420,
      spring = true,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant = useAnalogMaterialVariant(variant);
    const isBlack = resolvedVariant === 'black';
    const domain = defaultScaleDomains[scalePreset];
    const resolvedMin = min ?? domain.min;
    const resolvedMax = max ?? domain.max;
    const currentValue = value ?? resolvedMin;
    const ratio = normalizeRatio(currentValue, resolvedMin, resolvedMax);
    const resolvedSweepAngle = Math.min(300, Math.max(40, sweepAngle));
    const needleAngle = startAngle + ratio * resolvedSweepAngle;
    const needleRotation = needleAngle - 270;
    const resolvedSpring = React.useMemo(() => resolveNeedleGaugeSpring(spring), [spring]);
    const shouldUseSpring = animationDuration > 0 && resolvedSpring !== null;
    const [displayNeedleRotation, setDisplayNeedleRotation] = React.useState(needleRotation);
    const displayNeedleRotationRef = React.useRef(needleRotation);
    const needleVelocityRef = React.useRef(0);
    const displayNeedleAngle = displayNeedleRotation + 270;
    const needleTransition =
      animationDuration > 0 && !shouldUseSpring
        ? `transform ${animationDuration}ms cubic-bezier(0.2, 0.85, 0.18, 1)`
        : 'none';
    const formattedValue = valueFormatter?.(currentValue) ?? formatNeedleGaugeValue(currentValue);

    React.useEffect(() => {
      if (animationDuration <= 0) {
        displayNeedleRotationRef.current = needleRotation;
        needleVelocityRef.current = 0;
        setDisplayNeedleRotation(needleRotation);
        return;
      }

      if (!shouldUseSpring || resolvedSpring === null) {
        const animationFrame = window.requestAnimationFrame(() => {
          displayNeedleRotationRef.current = needleRotation;
          needleVelocityRef.current = 0;
          setDisplayNeedleRotation(needleRotation);
        });

        return () => window.cancelAnimationFrame(animationFrame);
      }

      let previousTime: number | null = null;
      let animationFrame = 0;

      const step = (time: number) => {
        if (previousTime === null) {
          previousTime = time;
        }

        const delta = Math.min(0.032, Math.max(0.001, (time - previousTime) / 1000));
        previousTime = time;
        const displacement = displayNeedleRotationRef.current - needleRotation;
        const acceleration =
          (-resolvedSpring.stiffness * displacement -
            resolvedSpring.damping * needleVelocityRef.current) /
          resolvedSpring.mass;
        const nextVelocity = needleVelocityRef.current + acceleration * delta;
        const nextRotation = displayNeedleRotationRef.current + nextVelocity * delta;

        if (
          Math.abs(nextRotation - needleRotation) <= resolvedSpring.restDelta &&
          Math.abs(nextVelocity) <= resolvedSpring.restVelocity
        ) {
          displayNeedleRotationRef.current = needleRotation;
          needleVelocityRef.current = 0;
          setDisplayNeedleRotation(needleRotation);
          return;
        }

        displayNeedleRotationRef.current = nextRotation;
        needleVelocityRef.current = nextVelocity;
        setDisplayNeedleRotation(nextRotation);
        animationFrame = window.requestAnimationFrame(step);
      };

      animationFrame = window.requestAnimationFrame(step);

      return () => window.cancelAnimationFrame(animationFrame);
    }, [animationDuration, needleRotation, resolvedSpring, shouldUseSpring]);

    const resolvedMarks = React.useMemo(() => {
      const sourceMarks =
        marks ??
        (scalePreset === 'linear'
          ? getLinearMarks(resolvedMin, resolvedMax)
          : defaultScaleMarks[scalePreset]);

      return sourceMarks.map((mark) => ({
        ...mark,
        ratio:
          mark.position !== undefined
            ? clamp(mark.position, 0, 1)
            : normalizeRatio(mark.value, resolvedMin, resolvedMax),
      }));
    }, [marks, resolvedMax, resolvedMin, scalePreset]);
    const minorTicks = React.useMemo(
      () =>
        Array.from({ length: Math.floor(Math.max(0, minorTickCount)) + 1 }, (_, index) => {
          const tickRatio = minorTickCount === 0 ? 0 : index / minorTickCount;
          const isMajor = resolvedMarks.some((mark) => Math.abs(mark.ratio - tickRatio) < 0.01);

          return isMajor ? null : tickRatio;
        }).filter((tickRatio): tickRatio is number => tickRatio !== null),
      [minorTickCount, resolvedMarks],
    );
    const resolvedZones = zones ?? getDefaultZones(resolvedMin, resolvedMax, scalePreset);
    const lightingStyle = useAnalogLighting(
      ['panel', 'bezel', 'track', 'lens', 'pointer', 'surface'],
      {
        track: { travel: 1 },
        ...lighting,
      },
    );
    const shellStyle = getNeedleGaugeShellStyle(resolvedVariant);
    const accessibilityValue =
      typeof formattedValue === 'string' || typeof formattedValue === 'number'
        ? String(formattedValue)
        : formatNeedleGaugeValue(currentValue);
    const accessibilityUnit =
      typeof unit === 'string' || typeof unit === 'number' ? ` ${unit}` : '';
    const rootLabel =
      props['aria-label'] ?? (typeof label === 'string' ? `${label} needle gauge` : 'Needle gauge');

    return (
      <Meter.Root
        ref={ref}
        value={currentValue}
        min={resolvedMin}
        max={resolvedMax}
        data-analog-variant={resolvedVariant}
        className={cn(
          'relative inline-flex aspect-[11/7] w-full max-w-[19rem] min-w-0 shrink-0 items-center justify-center rounded-[var(--analog-radius-panel)] border border-transparent p-[var(--spacing-track-padding)] text-[var(--analog-control-foreground)]',
          className,
        )}
        style={{
          ...lightingStyle,
          ...shellStyle,
          ...style,
        }}
        aria-label={rootLabel}
        aria-valuetext={`${accessibilityValue}${accessibilityUnit}`}
        {...props}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[var(--analog-radius-shell)] analog-surface-recess">
          <div className="relative h-full w-full overflow-hidden rounded-[inherit] analog-track-slot analog-track-slot-unlit">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(var(--analog-light-angle-lens, 180deg), rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.02) 24%, transparent 48%, rgba(0,0,0,calc(0.18 * var(--analog-light-power, 1))) 100%)`,
              }}
            />
            <div
              className="relative h-full w-full overflow-hidden rounded-[inherit]"
              style={{
                boxShadow:
                  `0 0 0 1px color-mix(in oklch, var(--analog-control-border-strong) 48%, transparent), ` +
                  `inset calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.12 * var(--analog-light-power, 1))), ` +
                  `inset calc(sin(var(--analog-light-angle-track, 180deg)) * -2px) calc(cos(var(--analog-light-angle-track, 180deg)) * 2px) 5px rgba(0,0,0,calc(0.58 * var(--analog-light-power, 1))), ` +
                  `calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.1 * var(--analog-light-power, 1))), ` +
                  `0 6px 16px rgba(0,0,0,calc(0.52 * var(--analog-light-power, 1)))`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    `radial-gradient(ellipse at 50% 92%, rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 0%, transparent 42%), ` +
                    `linear-gradient(var(--analog-light-angle-track, 180deg), rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.02) 30%, rgba(0,0,0,calc(0.58 * var(--analog-light-power, 1))) 100%), ` +
                    `var(--analog-surface-cavity)`,
                  boxShadow:
                    `inset calc(sin(var(--analog-light-angle-track, 180deg)) * -6px) calc(cos(var(--analog-light-angle-track, 180deg)) * 6px) 18px rgba(0,0,0,calc(0.72 * var(--analog-light-power, 1))), ` +
                    `inset calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1)))`,
                }}
              />
              <div
                className="absolute inset-0 opacity-[var(--analog-grain-opacity)] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E")`,
                  backgroundSize: '70px 54px',
                }}
              />

              <svg
                viewBox="0 0 220 160"
                className="absolute inset-0 z-10 h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={arcPath(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.radius,
                    startAngle,
                    startAngle + resolvedSweepAngle,
                  )}
                  fill="none"
                  stroke="color-mix(in oklch, var(--analog-surface-raised) 48%, black 52%)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  opacity="0.72"
                />
                {resolvedZones.map((zone) => {
                  const fromRatio = normalizeRatio(
                    zone.from ?? resolvedMin,
                    resolvedMin,
                    resolvedMax,
                  );
                  const toRatio = normalizeRatio(zone.to ?? resolvedMax, resolvedMin, resolvedMax);
                  const zoneStart = startAngle + Math.min(fromRatio, toRatio) * resolvedSweepAngle;
                  const zoneEnd = startAngle + Math.max(fromRatio, toRatio) * resolvedSweepAngle;

                  return (
                    <React.Fragment key={`${zoneStart}-${zoneEnd}-${zone.color}`}>
                      <path
                        d={arcPath(
                          dialGeometry.centerX,
                          dialGeometry.centerY,
                          dialGeometry.radius,
                          zoneStart,
                          zoneEnd,
                        )}
                        fill="none"
                        stroke={zone.glow ?? zone.color}
                        strokeWidth="9"
                        strokeLinecap="round"
                        opacity="0.26"
                        style={{ filter: 'blur(4px)' }}
                      />
                      <path
                        d={arcPath(
                          dialGeometry.centerX,
                          dialGeometry.centerY,
                          dialGeometry.radius,
                          zoneStart,
                          zoneEnd,
                        )}
                        fill="none"
                        stroke={zone.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.86"
                      />
                    </React.Fragment>
                  );
                })}

                {minorTicks.map((tickRatio) => {
                  const angle = startAngle + tickRatio * resolvedSweepAngle;
                  const inner = polarPoint(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.minorTickInnerRadius,
                    angle,
                  );
                  const outer = polarPoint(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.minorTickOuterRadius,
                    angle,
                  );

                  return (
                    <line
                      key={tickRatio}
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="var(--analog-telemetry-label)"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      opacity="0.46"
                    />
                  );
                })}

                {resolvedMarks.map((mark) => {
                  const angle = startAngle + mark.ratio * resolvedSweepAngle;
                  const tickInner = polarPoint(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.majorTickInnerRadius,
                    angle,
                  );
                  const tickOuter = polarPoint(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.majorTickOuterRadius,
                    angle,
                  );
                  const labelPoint = polarPoint(
                    dialGeometry.centerX,
                    dialGeometry.centerY,
                    dialGeometry.labelRadius,
                    angle,
                  );

                  return (
                    <g key={`${mark.value}-${String(mark.label)}`}>
                      <line
                        x1={tickInner.x}
                        y1={tickInner.y}
                        x2={tickOuter.x}
                        y2={tickOuter.y}
                        stroke="color-mix(in oklch, var(--analog-control-foreground) 72%, var(--analog-telemetry-label))"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        opacity="0.82"
                      />
                      <text
                        x={labelPoint.x}
                        y={labelPoint.y}
                        fill="var(--analog-legend)"
                        fontSize="8"
                        fontFamily="var(--font-mono, ui-monospace, monospace)"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {mark.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div
                data-slot="needle-gauge-needle"
                className="absolute left-1/2 bottom-0 z-20 h-[68%] w-[0.42rem] origin-bottom -translate-x-1/2 rounded-full"
                style={{
                  transform: `translateX(-50%) rotate(${displayNeedleRotation}deg)`,
                  transition: needleTransition,
                  willChange: 'transform',
                  clipPath: 'polygon(46% 0%, 54% 0%, 68% 82%, 50% 100%, 32% 82%)',
                  background:
                    needleVariant === 'chrome'
                      ? `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${displayNeedleAngle}deg - 90deg), color-mix(in oklch, var(--analog-surface-metal-hi) 82%, white 18%) 0%, var(--analog-surface-metal-mid) 42%, var(--analog-surface-metal-lo) 100%)`
                      : `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${displayNeedleAngle}deg - 90deg), var(--analog-led-red-core) 0%, var(--analog-led-red-base) 42%, color-mix(in oklch, var(--analog-led-red-base) 56%, black 44%) 100%)`,
                  boxShadow:
                    needleVariant === 'chrome'
                      ? `inset 1px 0 1px rgba(255,255,255,calc(0.56 * var(--analog-light-power, 1))), inset -1px 0 1px rgba(0,0,0,calc(0.38 * var(--analog-light-power, 1)))`
                      : `inset 1px 0 1px rgba(255,255,255,calc(0.42 * var(--analog-light-power, 1))), inset -1px 0 1px rgba(0,0,0,calc(0.46 * var(--analog-light-power, 1))), 0 0 10px color-mix(in oklch, var(--analog-led-red-glow) 28%, transparent)`,
                  filter:
                    'drop-shadow(calc(sin(var(--analog-light-angle-pointer, 180deg)) * 2px) calc(cos(var(--analog-light-angle-pointer, 180deg)) * -2px) 3px rgba(0,0,0,0.72))',
                }}
              />

              <div className="pointer-events-none absolute left-1/2 bottom-0 z-30 aspect-square w-[17%] -translate-x-1/2 translate-y-1/2 overflow-hidden rounded-full">
                <div
                  className={cn(
                    'surface-button analog-dial-surface no-chamfer relative h-full w-full overflow-hidden rounded-full',
                    isBlack ? 'variant-black' : 'variant-chrome',
                  )}
                  style={
                    {
                      '--pointer-angle': `${-displayNeedleRotation * 0.75}deg`,
                      '--pointer-from-center': 0.48,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="holo-bg"
                    style={{
                      transform: `rotate(${displayNeedleRotation}deg)`,
                      transition: needleTransition,
                    }}
                  />
                  <div className="holo-glare" />
                  <div
                    className="holo-texture"
                    style={{
                      transform: `rotate(${displayNeedleRotation}deg)`,
                      transition: needleTransition,
                    }}
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-[13%] z-20 flex flex-col items-center gap-1 px-8 text-center">
                <div className="text-[9px] font-bold tracking-[0.32em] text-[color:var(--analog-telemetry-label)] uppercase">
                  {label}
                </div>
                {showValue ? (
                  <div className="font-mono text-[11px] font-bold tracking-[0.08em] text-[color:var(--analog-telemetry-value)] tabular-nums">
                    {formattedValue}
                    {unit ? (
                      <span className="ml-1 text-[color:var(--analog-telemetry-label)]">
                        {unit}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                className="absolute inset-0 z-40 pointer-events-none"
                style={{
                  background:
                    `linear-gradient(calc(var(--analog-light-angle-lens, 180deg) - 18deg), rgba(255,255,255,calc(0.22 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.06) 18%, transparent 42%, rgba(0,0,0,calc(0.28 * var(--analog-light-power, 1))) 100%), ` +
                    `radial-gradient(ellipse at 34% 12%, rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1))) 0%, transparent 38%)`,
                  mixBlendMode: 'screen',
                  opacity: 0.72,
                }}
              />
            </div>
          </div>
        </div>
      </Meter.Root>
    );
  },
);
NeedleGauge.displayName = 'NeedleGauge';
