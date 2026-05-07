import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogOrientation } from './orientation';

export type AnalogMeterVariant = 'metered' | 'lcd-green' | 'lcd-amber' | 'lcd-blue';
export type AnalogMeterScalePreset = 'linear' | 'dbfs' | 'vu';
type AnalogMeterGroupOrientation = AnalogOrientation;
type AnalogMeterGroupLabelPosition = 'top' | 'bottom' | 'left' | 'right';
export type AnalogMeterGroupVariant = 'panel' | 'chrome' | 'black';

export interface AnalogMeterMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface AnalogMeterZone {
  from?: number;
  to?: number;
  color: string;
  glow?: string;
}

export interface AnalogMeterBallistics {
  attackMs?: number;
  releaseMs?: number;
  peakHoldMs?: number;
  peakReleaseMs?: number;
}

export interface AnalogMeterProps extends React.ComponentPropsWithoutRef<typeof Meter.Root> {
  orientation?: AnalogOrientation;
  peakValue?: number | null;
  variant?: AnalogMeterVariant;
  segments?: number;
  lighting?: AnalogLightingConfig<'surface' | 'lens'>;
  scalePreset?: AnalogMeterScalePreset;
  marks?: readonly AnalogMeterMark[];
  showScale?: boolean;
  scaleSide?: 'leading' | 'trailing';
  zones?: readonly AnalogMeterZone[];
  ballistics?: 'none' | 'vu' | 'ppm' | AnalogMeterBallistics;
}

export interface AnalogMeterGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: AnalogMeterGroupOrientation;
  variant?: AnalogMeterGroupVariant;
  lighting?: AnalogLightingConfig<'panel' | 'track' | 'lens'>;
}

export interface AnalogMeterGroupChannelProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  labelPosition?: AnalogMeterGroupLabelPosition;
}

export type AnalogMeterGroupSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const AnalogMeterGroupContext = React.createContext<{
  orientation: AnalogMeterGroupOrientation;
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

const defaultScaleMarks: Record<Exclude<AnalogMeterScalePreset, 'linear'>, AnalogMeterMark[]> = {
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

const defaultScaleDomains: Record<AnalogMeterScalePreset, { min: number; max: number }> = {
  linear: { min: 0, max: 100 },
  dbfs: { min: -60, max: 6 },
  vu: { min: -20, max: 3 },
};

const defaultScaleZones: Record<Exclude<AnalogMeterScalePreset, 'linear'>, AnalogMeterZone[]> = {
  dbfs: [
    {
      from: -60,
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
      to: 6,
      color: 'var(--analog-meter-zone-red)',
      glow: 'var(--analog-meter-zone-red-glow)',
    },
  ],
  vu: [
    {
      from: -20,
      to: 0,
      color: 'var(--analog-meter-zone-green)',
      glow: 'var(--analog-meter-zone-green-glow)',
    },
    {
      from: 0,
      to: 3,
      color: 'var(--analog-meter-zone-amber)',
      glow: 'var(--analog-meter-zone-amber-glow)',
    },
  ],
};

function resolveBallisticsConfig(
  ballistics: AnalogMeterProps['ballistics'],
): Required<AnalogMeterBallistics> {
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
  zones: readonly AnalogMeterZone[],
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

const getMeterGroupShellStyle = (variant: AnalogMeterGroupVariant): React.CSSProperties => {
  switch (variant) {
    case 'chrome':
      return {
        borderColor: 'transparent',
        background: `linear-gradient(calc(var(--analog-light-angle-panel, 180deg) - 90deg), color-mix(in oklch, var(--analog-surface-metal-hi) 82%, white 10%) 0%, var(--analog-surface-metal-hi) 18%, var(--analog-surface-metal-mid) 52%, var(--analog-surface-metal-lo) 100%)`,
        boxShadow:
          `inset 0 1px 1px rgba(255,255,255,calc(0.95 * var(--analog-light-power, 1))), ` +
          `inset 0 -1px 2px rgba(0,0,0,calc(0.25 * var(--analog-light-power, 1))), ` +
          `0 2px 4px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), ` +
          `0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`,
      };
    case 'black':
      return {
        borderColor: 'transparent',
        background: `linear-gradient(calc(var(--analog-light-angle-panel, 180deg) - 90deg), var(--analog-surface-onyx-hi) 0%, var(--analog-surface-onyx-mid) 45%, var(--analog-surface-onyx-lo) 100%)`,
        boxShadow:
          `inset 0 1px 1px rgba(255,255,255,calc(0.12 * var(--analog-light-power, 1))), ` +
          `inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), ` +
          `0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), ` +
          `0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
      };
    case 'panel':
    default:
      return {
        borderColor: 'transparent',
        background: `linear-gradient(calc(var(--analog-light-angle-panel, 180deg) - 90deg), rgba(255,255,255,calc(0.03 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,calc(0.22 * var(--analog-light-power, 1))) 100%), var(--analog-surface-panel)`,
        boxShadow:
          `inset 0 1px 1px rgba(255, 255, 255, calc(0.07 * var(--analog-light-power, 1))), ` +
          `0 4px 12px rgba(0, 0, 0, 0.5), ` +
          `0 0 0 1px color-mix(in oklch, var(--analog-surface-raised) 38%, transparent)`,
      };
  }
};

export const AnalogMeter = React.forwardRef<HTMLDivElement, AnalogMeterProps>(
  (
    {
      className,
      orientation = 'vertical',
      peakValue = null,
      value,
      min,
      max,
      variant = 'metered',
      segments,
      lighting,
      scalePreset = 'linear',
      marks,
      showScale = false,
      scaleSide = 'leading',
      zones,
      ballistics = 'none',
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
    const resolvedMarks = React.useMemo(() => {
      if (!showScale) return [];

      const sourceMarks = marks ?? (scalePreset === 'linear' ? [] : defaultScaleMarks[scalePreset]);

      return sourceMarks.map((mark) => ({
        ...mark,
        ratio:
          mark.position !== undefined
            ? Math.min(1, Math.max(0, mark.position))
            : clampMeterPercentage(mark.value, resolvedMin, resolvedMax) / 100,
      }));
    }, [marks, resolvedMax, resolvedMin, scalePreset, showScale]);

    const getVariantColors = (v: AnalogMeterVariant, isVert: boolean) => {
      const dir = isVert ? 'to top' : 'to right';
      switch (v) {
        case 'lcd-green':
          return {
            glow: 'var(--analog-lcd-green-glow)',
            bg: 'var(--analog-lcd-green-fill)',
            peak: 'color-mix(in oklch, var(--analog-led-green-core) 74%, white 26%)',
            peakGlow: 'color-mix(in oklch, var(--analog-led-green-glow) 72%, transparent)',
            isLcd: true,
          };
        case 'lcd-amber':
          return {
            glow: 'var(--analog-lcd-amber-glow)',
            bg: 'var(--analog-lcd-amber-fill)',
            peak: 'color-mix(in oklch, var(--analog-led-amber-core) 74%, white 26%)',
            peakGlow: 'color-mix(in oklch, var(--analog-led-amber-glow) 72%, transparent)',
            isLcd: true,
          };
        case 'lcd-blue':
          return {
            glow: 'var(--analog-lcd-blue-glow)',
            bg: 'var(--analog-lcd-blue-fill)',
            peak: 'color-mix(in oklch, var(--analog-led-blue-core) 74%, white 26%)',
            peakGlow: 'color-mix(in oklch, var(--analog-led-blue-glow) 72%, transparent)',
            isLcd: true,
          };
        case 'metered':
        default:
          return {
            bg: `linear-gradient(${dir}, var(--analog-meter-zone-green) 60%, var(--analog-meter-zone-amber) 80%, var(--analog-meter-zone-red) 95%)`,
            glow: `linear-gradient(${dir}, var(--analog-meter-zone-green-glow) 60%, var(--analog-meter-zone-amber-glow) 80%, var(--analog-meter-zone-red-glow) 95%)`,
            peak: 'var(--analog-meter-peak-marker)',
            peakGlow: 'color-mix(in oklch, var(--analog-meter-peak-marker) 78%, transparent)',
            isLcd: false,
          };
      }
    };

    const colors = getVariantColors(variant as AnalogMeterVariant, isVertical);
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
    const lightingStyle = useAnalogLighting(['surface', 'lens'], lighting);
    const trackLightingStyle = {
      ...lightingStyle,
      '--analog-light-angle-track': 'var(--analog-light-angle-surface)',
    } as React.CSSProperties;

    return (
      <Meter.Root
        ref={ref}
        value={currentValue}
        min={resolvedMin}
        max={resolvedMax}
        className={cn(
          'relative flex items-center justify-center',
          isVertical ? 'h-64 w-8 shrink-0 flex-col' : 'h-8 w-full min-w-0',
          className,
        )}
        data-orientation={orientation}
        {...props}
      >
        {showScale ? (
          <div
            className={cn(
              'pointer-events-none absolute text-[9px] font-mono text-[color:var(--analog-telemetry-label)] opacity-90',
              isVertical
                ? scaleSide === 'leading'
                  ? '-left-8 top-0 bottom-0 w-6'
                  : '-right-8 top-0 bottom-0 w-6'
                : scaleSide === 'leading'
                  ? 'left-0 right-0 -top-6 h-4'
                  : 'left-0 right-0 -bottom-6 h-4',
            )}
          >
            {resolvedMarks.map((mark) =>
              isVertical ? (
                <span
                  key={`${mark.value}-${String(mark.label)}`}
                  className={cn(
                    'absolute w-full -translate-y-1/2',
                    scaleSide === 'leading' ? 'right-0 text-right' : 'left-0 text-left',
                  )}
                  style={{ top: `${(1 - mark.ratio) * 100}%` }}
                >
                  {mark.label}
                </span>
              ) : (
                <span
                  key={`${mark.value}-${String(mark.label)}`}
                  className="absolute -translate-x-1/2 text-center"
                  style={{ left: `${mark.ratio * 100}%` }}
                >
                  {mark.label}
                </span>
              ),
            )}
          </div>
        ) : null}

        {/* Track / Cavity */}
        <Meter.Track
          className={cn(
            'relative overflow-hidden rounded-full analog-surface-recess-sm',
            isVertical ? 'w-3 h-full' : 'w-full h-3',
          )}
          style={trackLightingStyle}
        >
          {/* GLOW LAYER */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-[0.40] z-0"
            style={{ filter: 'blur(6px)' }}
          >
            <div
              className="absolute inset-0"
              style={{
                clipPath: indicatorClipPath,
                transition: `clip-path ${transitionMs}ms ease-out`,
                background: zoneGlow,
              }}
            />
          </div>

          {/* LED Indicator layer */}
          <Meter.Indicator
            className="absolute inset-0 pointer-events-none !w-full !h-full z-10"
            style={{
              clipPath: indicatorClipPath,
              transition: `clip-path ${transitionMs}ms ease-out`,
            }}
          >
            {/* Lit LEDs */}
            <div
              className="absolute inset-0"
              style={{
                background: zoneBackground,
                boxShadow: colors.isLcd
                  ? 'none'
                  : '0 0 4px color-mix(in oklch, var(--analog-control-foreground) 18%, transparent) inset',
              }}
            />

            {/* Analog Noise Overlay (only on lit parts) */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen z-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                opacity: `calc(var(--analog-grain-opacity) + (var(--analog-grain-opacity) * var(--analog-light-power, 1)))`,
              }}
            />
          </Meter.Indicator>

          {peakPercentage != null && (
            <div
              className="absolute pointer-events-none z-30 rounded-full"
              style={{
                ...getPeakMarkerStyle(isVertical, peakPercentage),
                background: colors.peak,
                boxShadow: `0 0 10px ${colors.peakGlow}`,
                transition: `all ${effectiveBallistics.peakReleaseMs}ms ease-out`,
              }}
            />
          )}

          {/* Segments Grille Overlay */}
          {segments && (
            <div
              className="absolute inset-0 pointer-events-none z-20 opacity-90"
              style={{
                background: isVertical
                  ? `repeating-linear-gradient(to bottom, transparent 0%, transparent calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments}))`
                  : `repeating-linear-gradient(to right, transparent 0%, transparent calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments} - 1.5px), var(--analog-meter-segment-divider) calc(100% / ${segments}))`,
              }}
            />
          )}

          {/* Inner glass reflection */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `linear-gradient(var(--analog-light-angle-lens, 180deg), rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))) 0%, transparent 50%, rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))) 100%)`,
              mixBlendMode: colors.isLcd ? 'soft-light' : 'overlay',
              opacity: colors.isLcd ? 0.3 : 1,
            }}
          />
        </Meter.Track>
      </Meter.Root>
    );
  },
);
AnalogMeter.displayName = 'AnalogMeter';

export const AnalogMeterGroup = React.forwardRef<HTMLDivElement, AnalogMeterGroupProps>(
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
    const lightingStyle = useAnalogLighting(['panel', 'track', 'lens'], lighting);
    const shellStyle = getMeterGroupShellStyle(variant);

    return (
      <AnalogMeterGroupContext.Provider value={{ orientation }}>
        <div
          ref={ref}
          role={role ?? 'group'}
          data-orientation={orientation}
          className={cn(
            'relative inline-flex min-w-0 max-w-full rounded-xl border border-transparent p-[var(--spacing-track-padding)] text-[color:var(--analog-panel-foreground)]',
            orientation === 'horizontal' ? 'flex-row items-stretch' : 'flex-col items-stretch',
            className,
          )}
          style={{
            ...lightingStyle,
            ...shellStyle,
            ...style,
          }}
          {...props}
        >
          <div className="relative overflow-hidden rounded-lg analog-surface-recess p-[var(--spacing-track-padding)]">
            <div
              className={cn(
                'relative overflow-hidden rounded-[calc(var(--radius-lg)-5px)] analog-track-slot analog-track-slot-unlit',
                orientation === 'horizontal' ? 'px-3 py-3' : 'px-3 py-3',
              )}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(var(--analog-light-angle-lens, 180deg), rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.02) 24%, transparent 48%, rgba(0,0,0,calc(0.18 * var(--analog-light-power, 1))) 100%)`,
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
      </AnalogMeterGroupContext.Provider>
    );
  },
);
AnalogMeterGroup.displayName = 'AnalogMeterGroup';

export const AnalogMeterGroupChannel = React.forwardRef<
  HTMLDivElement,
  AnalogMeterGroupChannelProps
>(({ className, label, labelPosition, children, ...props }, ref) => {
  const group = React.useContext(AnalogMeterGroupContext);
  const resolvedLabelPosition =
    labelPosition ?? (group?.orientation === 'vertical' ? 'right' : 'bottom');
  const labelNode =
    label != null ? (
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-[color:var(--analog-telemetry-label)]">
        {label}
      </span>
    ) : null;

  return (
    <div
      ref={ref}
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
});
AnalogMeterGroupChannel.displayName = 'AnalogMeterGroupChannel';

export const AnalogMeterGroupSeparator = React.forwardRef<
  HTMLDivElement,
  AnalogMeterGroupSeparatorProps
>(({ className, style, ...props }, ref) => {
  const group = React.useContext(AnalogMeterGroupContext);
  const isHorizontal = (group?.orientation ?? 'horizontal') === 'horizontal';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full analog-track-slot-guide opacity-80',
        isHorizontal ? 'mx-1 my-3 w-px self-stretch' : 'mx-3 my-1 h-px self-auto',
        className,
      )}
      style={style}
      {...props}
    />
  );
});
AnalogMeterGroupSeparator.displayName = 'AnalogMeterGroupSeparator';
