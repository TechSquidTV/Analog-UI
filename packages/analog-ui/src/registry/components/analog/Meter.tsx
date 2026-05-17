import * as React from 'react';
import { Meter as BaseMeter } from '@base-ui/react/meter';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogOrientation } from './orientation';
import type { AnalogTone } from './tone';

export type MeterVariant = 'metered' | 'display';
export type MeterScalePreset = 'linear' | 'dbfs' | 'vu';
type MeterGroupOrientation = AnalogOrientation;
type MeterGroupLabelPosition = 'top' | 'bottom' | 'left' | 'right';
export type MeterGroupVariant = 'panel' | 'chrome' | 'black';

export interface MeterMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface MeterZone {
  from?: number;
  to?: number;
  color: string;
  glow?: string;
}

export interface MeterBallistics {
  attackMs?: number;
  releaseMs?: number;
  peakHoldMs?: number;
  peakReleaseMs?: number;
}

export interface MeterResolvedMark extends MeterMark {
  ratio: number;
}

export interface MeterRenderScaleProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  scaleSide: 'leading' | 'trailing';
  marks: readonly MeterResolvedMark[];
  className: string;
  markClassName: string;
}

export interface MeterRenderTrackProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  value: number;
  min: number;
  max: number;
  percentage: number;
  peakPercentage: number | null;
  variant: MeterVariant;
  tone: AnalogTone;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export interface MeterRenderIndicatorProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  value: number;
  min: number;
  max: number;
  percentage: number;
  clipPath: string;
  transitionMs: number;
  variant: MeterVariant;
  tone: AnalogTone;
  className: string;
  style: React.CSSProperties;
  fillClassName: string;
  fillStyle: React.CSSProperties;
  children: React.ReactNode;
}

export interface MeterRenderPeakMarkerProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  value: number;
  min: number;
  max: number;
  percentage: number;
  className: string;
  style: React.CSSProperties;
}

export interface MeterRenderSegmentsProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  segments: number;
  className: string;
  style: React.CSSProperties;
}

export interface MeterRenderLensProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  variant: MeterVariant;
  tone: AnalogTone;
  className: string;
  style: React.CSSProperties;
}

export interface MeterProps extends React.ComponentPropsWithoutRef<typeof BaseMeter.Root> {
  orientation?: AnalogOrientation;
  peakValue?: number | null;
  variant?: MeterVariant;
  tone?: AnalogTone;
  segments?: number;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'lens'>;
  scalePreset?: MeterScalePreset;
  marks?: readonly MeterMark[];
  showScale?: boolean;
  scaleSide?: 'leading' | 'trailing';
  zones?: readonly MeterZone[];
  ballistics?: 'none' | 'vu' | 'ppm' | MeterBallistics;
  scaleClassName?: string;
  scaleMarkClassName?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  peakMarkerClassName?: string;
  segmentsClassName?: string;
  lensClassName?: string;
  renderScale?: (props: MeterRenderScaleProps) => React.ReactNode;
  renderTrack?: (props: MeterRenderTrackProps) => React.ReactNode;
  renderIndicator?: (props: MeterRenderIndicatorProps) => React.ReactNode;
  renderPeakMarker?: (props: MeterRenderPeakMarkerProps) => React.ReactNode;
  renderSegments?: (props: MeterRenderSegmentsProps) => React.ReactNode;
  renderLens?: (props: MeterRenderLensProps) => React.ReactNode;
}

export interface MeterGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: MeterGroupOrientation;
  variant?: MeterGroupVariant;
  lighting?: AnalogLightingConfig<'panel' | 'bezel' | 'track' | 'lens'>;
}

export interface MeterGroupChannelProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  labelPosition?: MeterGroupLabelPosition;
}

export type MeterGroupSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const MeterGroupContext = React.createContext<{
  orientation: MeterGroupOrientation;
} | null>(null);

const clampMeterPercentage = (value: number, min: number, max: number) => {
  const range = max - min;

  if (range <= 0) {
    return value >= max ? 100 : 0;
  }

  return Math.min(100, Math.max(0, ((value - min) / range) * 100));
};

const getMeterIndicatorClipPath = (isVertical: boolean, percentage: number) =>
  isVertical ? `inset(${100 - percentage}% 0 0 0)` : `inset(0 ${100 - percentage}% 0 0)`;

const getPeakMarkerStyle = (isVertical: boolean, percentage: number): React.CSSProperties =>
  isVertical
    ? {
        bottom: `calc(${percentage}% - 1px)`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% + 6px)',
        height: '2px',
      }
    : {
        left: `calc(${percentage}% - 1px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '2px',
        height: 'calc(100% + 6px)',
      };

const defaultScaleMarks: Record<Exclude<MeterScalePreset, 'linear'>, MeterMark[]> = {
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

const defaultScaleDomains: Record<MeterScalePreset, { min: number; max: number }> = {
  linear: { min: 0, max: 100 },
  dbfs: { min: -60, max: 6 },
  vu: { min: -20, max: 3 },
};

const defaultScaleZones: Record<Exclude<MeterScalePreset, 'linear'>, MeterZone[]> = {
  dbfs: [
    {
      from: -60,
      to: -6,
      color: 'var(--analog-meter-zone-success)',
      glow: 'var(--analog-meter-zone-success-glow)',
    },
    {
      from: -6,
      to: 0,
      color: 'var(--analog-meter-zone-warning)',
      glow: 'var(--analog-meter-zone-warning-glow)',
    },
    {
      from: 0,
      to: 6,
      color: 'var(--analog-meter-zone-destructive)',
      glow: 'var(--analog-meter-zone-destructive-glow)',
    },
  ],
  vu: [
    {
      from: -20,
      to: 0,
      color: 'var(--analog-meter-zone-success)',
      glow: 'var(--analog-meter-zone-success-glow)',
    },
    {
      from: 0,
      to: 3,
      color: 'var(--analog-meter-zone-warning)',
      glow: 'var(--analog-meter-zone-warning-glow)',
    },
  ],
};

function resolveBallisticsConfig(ballistics: MeterProps['ballistics']): Required<MeterBallistics> {
  if (ballistics === 'vu') {
    return { attackMs: 300, releaseMs: 700, peakHoldMs: 900, peakReleaseMs: 450 };
  }

  if (ballistics === 'ppm') {
    return { attackMs: 30, releaseMs: 1200, peakHoldMs: 1400, peakReleaseMs: 600 };
  }

  if (ballistics === 'none' || ballistics == null) {
    return { attackMs: 50, releaseMs: 50, peakHoldMs: 0, peakReleaseMs: 50 };
  }

  return {
    attackMs: ballistics.attackMs ?? 80,
    releaseMs: ballistics.releaseMs ?? 220,
    peakHoldMs: ballistics.peakHoldMs ?? 0,
    peakReleaseMs: ballistics.peakReleaseMs ?? 160,
  };
}

function buildZoneGradient(
  zones: readonly MeterZone[],
  min: number,
  max: number,
  isVertical: boolean,
  key: 'color' | 'glow',
) {
  const direction = isVertical ? 'to top' : 'to right';
  const ordered = [...zones]
    .map((zone) => ({
      start: zone.from ?? min,
      end: zone.to ?? max,
      tone: key === 'glow' ? (zone.glow ?? zone.color) : zone.color,
    }))
    .sort((a, b) => a.start - b.start);

  const stops = ordered.flatMap((zone) => {
    const start = clampMeterPercentage(zone.start, min, max);
    const end = clampMeterPercentage(zone.end, min, max);
    return [`${zone.tone} ${start}%`, `${zone.tone} ${end}%`];
  });

  return `linear-gradient(${direction}, ${stops.join(', ')})`;
}

function DefaultMeterScale({
  isVertical,
  scaleSide,
  marks,
  className,
  markClassName,
}: MeterRenderScaleProps) {
  if (!marks.length) return null;

  return (
    <div data-slot="meter-scale" className={className}>
      {marks.map((mark) =>
        isVertical ? (
          <span
            key={`${mark.value}-${String(mark.label)}`}
            data-slot="meter-scale-mark"
            className={cn(
              'absolute w-full -translate-y-1/2',
              scaleSide === 'leading' ? 'right-0 text-right' : 'left-0 text-left',
              markClassName,
            )}
            style={{ top: `${(1 - mark.ratio) * 100}%` }}
          >
            {mark.label}
          </span>
        ) : (
          <span
            key={`${mark.value}-${String(mark.label)}`}
            data-slot="meter-scale-mark"
            className={cn('absolute -translate-x-1/2 text-center', markClassName)}
            style={{ left: `${mark.ratio * 100}%` }}
          >
            {mark.label}
          </span>
        ),
      )}
    </div>
  );
}

function DefaultMeterTrack({ className, style, children }: MeterRenderTrackProps) {
  return (
    <BaseMeter.Track data-slot="meter-track" className={className} style={style}>
      {children}
    </BaseMeter.Track>
  );
}

function DefaultMeterIndicator({
  className,
  style,
  fillClassName,
  fillStyle,
  children,
}: MeterRenderIndicatorProps) {
  return (
    <BaseMeter.Indicator data-slot="meter-indicator" className={className} style={style}>
      <div data-slot="meter-indicator-fill" className={fillClassName} style={fillStyle} />
      {children}
    </BaseMeter.Indicator>
  );
}

function DefaultMeterPeakMarker({ className, style }: MeterRenderPeakMarkerProps) {
  return <div data-slot="meter-peak-marker" className={className} style={style} />;
}

function DefaultMeterSegments({ className, style }: MeterRenderSegmentsProps) {
  return <div data-slot="meter-segments" className={className} style={style} />;
}

function DefaultMeterLens({ className, style }: MeterRenderLensProps) {
  return <div data-slot="meter-lens" className={className} style={style} />;
}

export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      orientation = 'vertical',
      peakValue = null,
      value,
      min,
      max,
      variant = 'metered',
      tone = 'success',
      segments,
      lighting,
      scalePreset = 'linear',
      marks,
      showScale = false,
      scaleSide = 'leading',
      zones,
      ballistics = 'none',
      scaleClassName,
      scaleMarkClassName,
      trackClassName,
      indicatorClassName,
      peakMarkerClassName,
      segmentsClassName,
      lensClassName,
      renderScale,
      renderTrack,
      renderIndicator,
      renderPeakMarker,
      renderSegments,
      renderLens,
      ...props
    },
    ref,
  ) => {
    const isVertical = orientation === 'vertical';
    const domain = defaultScaleDomains[scalePreset];
    const resolvedMin = min ?? domain.min;
    const resolvedMax = max ?? domain.max;
    const currentValue = value ?? resolvedMin;
    const effectiveBallistics = resolveBallisticsConfig(ballistics);
    const previousValueRef = React.useRef(currentValue);
    const [displayPeakValue, setDisplayPeakValue] = React.useState<number | null>(
      peakValue ?? null,
    );
    const transitionMs =
      currentValue >= previousValueRef.current
        ? effectiveBallistics.attackMs
        : effectiveBallistics.releaseMs;

    React.useEffect(() => {
      previousValueRef.current = currentValue;
    }, [currentValue]);

    React.useEffect(() => {
      if (peakValue == null) {
        setDisplayPeakValue(null);
        return;
      }

      setDisplayPeakValue((previous) => {
        if (previous == null || peakValue >= previous) {
          return peakValue;
        }

        if (effectiveBallistics.peakHoldMs === 0) {
          return peakValue;
        }

        return previous;
      });

      if (
        displayPeakValue != null &&
        peakValue < displayPeakValue &&
        effectiveBallistics.peakHoldMs > 0
      ) {
        const timeout = window.setTimeout(() => {
          setDisplayPeakValue(peakValue);
        }, effectiveBallistics.peakHoldMs);

        return () => window.clearTimeout(timeout);
      }
    }, [displayPeakValue, effectiveBallistics.peakHoldMs, peakValue]);

    const percentage = clampMeterPercentage(currentValue, resolvedMin, resolvedMax);
    const peakPercentage =
      displayPeakValue != null
        ? clampMeterPercentage(Math.max(currentValue, displayPeakValue), resolvedMin, resolvedMax)
        : null;
    const indicatorClipPath = getMeterIndicatorClipPath(isVertical, percentage);
    const shouldRenderScale = showScale || renderScale !== undefined;
    const resolvedMarks = React.useMemo<MeterResolvedMark[]>(() => {
      if (!shouldRenderScale) return [];

      const sourceMarks = marks ?? (scalePreset === 'linear' ? [] : defaultScaleMarks[scalePreset]);

      return sourceMarks.map((mark) => ({
        ...mark,
        ratio:
          mark.position !== undefined
            ? Math.min(1, Math.max(0, mark.position))
            : clampMeterPercentage(mark.value, resolvedMin, resolvedMax) / 100,
      }));
    }, [marks, resolvedMax, resolvedMin, scalePreset, shouldRenderScale]);

    const getVariantColors = (v: MeterVariant, isVert: boolean) => {
      const dir = isVert ? 'to top' : 'to right';
      switch (v) {
        case 'display':
          return {
            glow: 'var(--analog-display-glow)',
            bg: 'var(--analog-display-fill)',
            peak: 'var(--analog-emissive-core)',
            peakGlow: 'color-mix(in oklch, var(--analog-emissive-glow) 72%, transparent)',
            isDisplay: true,
          };
        case 'metered':
        default:
          return {
            bg: `linear-gradient(${dir}, var(--analog-meter-zone-success) 60%, var(--analog-meter-zone-warning) 80%, var(--analog-meter-zone-destructive) 95%)`,
            glow: `linear-gradient(${dir}, var(--analog-meter-zone-success-glow) 60%, var(--analog-meter-zone-warning-glow) 80%, var(--analog-meter-zone-destructive-glow) 95%)`,
            peak: 'var(--analog-meter-peak-marker)',
            peakGlow: 'color-mix(in oklch, var(--analog-meter-peak-marker) 78%, transparent)',
            isDisplay: false,
          };
      }
    };

    const colors = getVariantColors(variant as MeterVariant, isVertical);
    const resolvedZones =
      zones ?? (scalePreset === 'linear' ? undefined : defaultScaleZones[scalePreset]);
    const zoneBackground =
      variant === 'metered' && resolvedZones?.length
        ? buildZoneGradient(resolvedZones, resolvedMin, resolvedMax, isVertical, 'color')
        : colors.bg;
    const zoneGlow =
      variant === 'metered' && resolvedZones?.length
        ? buildZoneGradient(resolvedZones, resolvedMin, resolvedMax, isVertical, 'glow')
        : colors.glow;
    const trackLightingStyle = useAnalogLighting(['surface', 'track', 'lens'], {
      track: { travel: 1 },
      ...lighting,
    });
    const scaleNode = shouldRenderScale
      ? (renderScale ?? DefaultMeterScale)({
          orientation,
          isVertical,
          scaleSide,
          marks: resolvedMarks,
          className: cn(
            'pointer-events-none absolute text-[9px] font-mono text-[color:var(--analog-telemetry-label)] opacity-90',
            isVertical
              ? scaleSide === 'leading'
                ? '-left-8 top-0 bottom-0 w-6'
                : '-right-8 top-0 bottom-0 w-6'
              : scaleSide === 'leading'
                ? 'left-0 right-0 -top-6 h-4'
                : 'left-0 right-0 -bottom-6 h-4',
            scaleClassName,
          ),
          markClassName: cn(scaleMarkClassName),
        })
      : null;
    const indicatorNode = (renderIndicator ?? DefaultMeterIndicator)({
      orientation,
      isVertical,
      value: currentValue,
      min: resolvedMin,
      max: resolvedMax,
      percentage,
      clipPath: indicatorClipPath,
      transitionMs,
      variant,
      tone,
      className: cn(
        'absolute inset-0 pointer-events-none !w-full !h-full z-10',
        indicatorClassName,
      ),
      style: {
        clipPath: indicatorClipPath,
        transition: `clip-path ${transitionMs}ms ease-out`,
      },
      fillClassName: 'absolute inset-0',
      fillStyle: {
        background: zoneBackground,
        boxShadow: colors.isDisplay
          ? 'none'
          : '0 0 4px color-mix(in oklch, var(--analog-control-foreground) 18%, transparent) inset',
      },
      children: (
        <div
          data-slot="meter-indicator-noise"
          className="absolute inset-0 pointer-events-none mix-blend-screen z-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: `calc(var(--analog-grain-opacity) + (var(--analog-grain-opacity) * var(--analog-light-power, 1)))`,
          }}
        />
      ),
    });
    const peakMarkerNode =
      peakPercentage != null
        ? (renderPeakMarker ?? DefaultMeterPeakMarker)({
            orientation,
            isVertical,
            value: displayPeakValue ?? currentValue,
            min: resolvedMin,
            max: resolvedMax,
            percentage: peakPercentage,
            className: cn('absolute pointer-events-none z-30 rounded-full', peakMarkerClassName),
            style: {
              ...getPeakMarkerStyle(isVertical, peakPercentage),
              background: colors.peak,
              boxShadow: `0 0 calc(10px * var(--analog-bloom-strength, 0.7) * 1.428571) ${colors.peakGlow}`,
              transition: `all ${effectiveBallistics.peakReleaseMs}ms ease-out`,
            },
          })
        : null;
    const segmentsNode =
      segments !== undefined && segments > 0
        ? (renderSegments ?? DefaultMeterSegments)({
            orientation,
            isVertical,
            segments,
            className: cn(
              'absolute inset-0 pointer-events-none z-20 opacity-90',
              segmentsClassName,
            ),
            style: {
              background: isVertical
                ? `repeating-linear-gradient(to bottom, transparent 0%, transparent calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments}))`
                : `repeating-linear-gradient(to right, transparent 0%, transparent calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments}))`,
            },
          })
        : null;
    const lensNode = (renderLens ?? DefaultMeterLens)({
      orientation,
      isVertical,
      variant,
      tone,
      className: cn('absolute inset-0 pointer-events-none z-30', lensClassName),
      style: {
        background: `linear-gradient(var(--analog-light-angle-lens, 180deg), rgb(var(--analog-highlight-rgb) / calc(0.15 * var(--analog-light-power, 1))) 0%, transparent 50%, rgb(var(--analog-shadow-rgb) / calc(0.5 * var(--analog-light-power, 1))) 100%)`,
        mixBlendMode: colors.isDisplay ? 'soft-light' : 'overlay',
        opacity: colors.isDisplay ? 0.3 : 1,
      },
    });
    const trackNode = (renderTrack ?? DefaultMeterTrack)({
      orientation,
      isVertical,
      value: currentValue,
      min: resolvedMin,
      max: resolvedMax,
      percentage,
      peakPercentage,
      variant,
      tone,
      className: cn(
        'relative overflow-hidden rounded-full analog-surface-recess-sm',
        isVertical ? 'w-3 h-full' : 'w-full h-3',
        trackClassName,
      ),
      style: trackLightingStyle,
      children: (
        <>
          <div
            data-slot="meter-glow"
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-[0.40] z-0"
            style={{
              filter: 'blur(calc(6px * var(--analog-bloom-strength, 0.7) * 1.428571))',
            }}
          >
            <div
              data-slot="meter-glow-fill"
              className="absolute inset-0"
              style={{
                clipPath: indicatorClipPath,
                transition: `clip-path ${transitionMs}ms ease-out`,
                background: zoneGlow,
              }}
            />
          </div>
          {indicatorNode}
          {peakMarkerNode}
          {segmentsNode}
          {lensNode}
        </>
      ),
    });

    return (
      <BaseMeter.Root
        ref={ref}
        value={currentValue}
        min={resolvedMin}
        max={resolvedMax}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Level meter')}
        aria-labelledby={ariaLabelledBy}
        data-slot="meter-root"
        className={cn(
          'relative flex items-center justify-center',
          isVertical ? 'h-64 w-8 shrink-0 flex-col' : 'h-8 w-full min-w-0',
          className,
        )}
        data-orientation={orientation}
        data-analog-tone={tone}
        {...props}
      >
        {scaleNode}
        {trackNode}
      </BaseMeter.Root>
    );
  },
);
Meter.displayName = 'Meter';

export const MeterGroup = React.forwardRef<HTMLDivElement, MeterGroupProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant = 'panel',
      lighting,
      style,
      children,
      role,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['panel', 'bezel', 'track', 'lens'], lighting, {
      targetRef: internalRef,
    });
    const shellClassName =
      variant === 'chrome'
        ? 'analog-bezel-shell-chrome'
        : variant === 'black'
          ? 'analog-bezel-shell-black'
          : 'analog-panel-shell';

    return (
      <MeterGroupContext.Provider value={{ orientation }}>
        <div
          ref={mergedRef}
          role={role ?? 'group'}
          data-slot="meter-group"
          data-orientation={orientation}
          className={cn(
            'relative inline-flex min-w-0 max-w-full rounded-[var(--analog-radius-panel)] border border-transparent p-[var(--spacing-track-padding)] text-[color:var(--analog-panel-foreground)]',
            orientation === 'horizontal' ? 'flex-row items-stretch' : 'flex-col items-stretch',
            shellClassName,
            className,
          )}
          style={{
            ...lightingStyle,
            ...style,
          }}
          {...props}
        >
          <div
            data-slot="meter-group-shell"
            className="relative overflow-hidden rounded-[var(--analog-radius-shell)] analog-surface-recess p-[var(--spacing-track-padding)]"
          >
            <div
              data-slot="meter-group-slot"
              className={cn(
                'relative overflow-hidden rounded-[var(--analog-radius-recess)] analog-track-slot analog-track-slot-unlit',
                orientation === 'horizontal' ? 'px-3 py-3' : 'px-3 py-3',
              )}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(var(--analog-light-angle-lens, 180deg), rgb(var(--analog-highlight-rgb) / calc(0.08 * var(--analog-light-power, 1))) 0%, rgb(var(--analog-highlight-rgb) / 0.02) 24%, transparent 48%, rgb(var(--analog-shadow-rgb) / calc(0.18 * var(--analog-light-power, 1))) 100%)`,
                }}
              />
              <div
                className={cn(
                  'relative z-10 inline-flex min-w-0 max-w-full',
                  orientation === 'horizontal' ? 'flex-row items-end' : 'flex-col items-stretch',
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </MeterGroupContext.Provider>
    );
  },
);
MeterGroup.displayName = 'MeterGroup';

export const MeterGroupChannel = React.forwardRef<HTMLDivElement, MeterGroupChannelProps>(
  ({ className, label, labelPosition, children, ...props }, ref) => {
    const group = React.useContext(MeterGroupContext);
    const resolvedLabelPosition =
      labelPosition ?? (group?.orientation === 'vertical' ? 'right' : 'bottom');
    const labelNode =
      label != null ? (
        <span
          data-slot="meter-group-channel-label"
          className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-[color:var(--analog-telemetry-label)]"
        >
          {label}
        </span>
      ) : null;

    return (
      <div
        ref={ref}
        data-slot="meter-group-channel"
        className={cn(
          'relative flex shrink-0 items-center justify-center',
          resolvedLabelPosition === 'top' && 'flex-col gap-3 px-3 pt-1 pb-2',
          resolvedLabelPosition === 'bottom' && 'flex-col gap-3 px-3 pt-2 pb-1',
          resolvedLabelPosition === 'left' && 'flex-row gap-3 px-2 py-3',
          resolvedLabelPosition === 'right' && 'flex-row gap-3 px-2 py-3',
          className,
        )}
        {...props}
      >
        {resolvedLabelPosition === 'top' || resolvedLabelPosition === 'left' ? labelNode : null}
        <div className="relative flex items-center justify-center">{children}</div>
        {resolvedLabelPosition === 'bottom' || resolvedLabelPosition === 'right' ? labelNode : null}
      </div>
    );
  },
);
MeterGroupChannel.displayName = 'MeterGroupChannel';

export const MeterGroupSeparator = React.forwardRef<HTMLDivElement, MeterGroupSeparatorProps>(
  ({ className, style, ...props }, ref) => {
    const group = React.useContext(MeterGroupContext);
    const isHorizontal = (group?.orientation ?? 'horizontal') === 'horizontal';

    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-slot="meter-group-separator"
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full analog-track-slot-guide opacity-80',
          isHorizontal ? 'mx-1 my-3 w-px self-stretch' : 'mx-3 my-1 h-px self-auto',
          className,
        )}
        style={style}
        {...props}
      />
    );
  },
);
MeterGroupSeparator.displayName = 'MeterGroupSeparator';
