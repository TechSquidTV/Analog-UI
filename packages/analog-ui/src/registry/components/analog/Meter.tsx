import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export type AnalogMeterVariant = 'metered' | 'lcd-green' | 'lcd-amber' | 'lcd-blue';
type AnalogMeterGroupOrientation = 'horizontal' | 'vertical';
type AnalogMeterGroupLabelPosition = 'top' | 'bottom' | 'left' | 'right';
export type AnalogMeterGroupVariant = 'panel' | 'chrome' | 'black';

export interface AnalogMeterProps extends React.ComponentPropsWithoutRef<typeof Meter.Root> {
  orientation?: 'horizontal' | 'vertical';
  peakValue?: number | null;
  variant?: AnalogMeterVariant;
  segments?: number;
  lighting?: AnalogLightingConfig<'surface' | 'lens'>;
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

export interface AnalogMeterGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

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
      min = 0,
      max = 100,
      variant = 'metered',
      segments,
      lighting,
      ...props
    },
    ref,
  ) => {
    const isVertical = orientation === 'vertical';
    const currentValue = value ?? min;
    const percentage = clampMeterPercentage(currentValue, min, max);
    const peakPercentage =
      peakValue != null ? clampMeterPercentage(Math.max(currentValue, peakValue), min, max) : null;
    const indicatorClipPath = getMeterIndicatorClipPath(isVertical, percentage);

    const getVariantColors = (v: AnalogMeterVariant, isVert: boolean) => {
      const dir = isVert ? 'to top' : 'to right';
      switch (v) {
        case 'lcd-green':
          return { glow: '#5ca34d', bg: '#67b557', peak: 'rgba(235, 255, 237, 0.96)', isLcd: true };
        case 'lcd-amber':
          return { glow: '#d19324', bg: '#e6a42e', peak: 'rgba(255, 244, 218, 0.96)', isLcd: true };
        case 'lcd-blue':
          return { glow: '#3b86e0', bg: '#4d98f0', peak: 'rgba(232, 244, 255, 0.96)', isLcd: true };
        case 'metered':
        default:
          return {
            bg: `linear-gradient(${dir}, #65ba59 60%, #e6a227 80%, #d44040 95%)`,
            glow: `linear-gradient(${dir}, #5ba850 60%, #d49524 80%, #c43b3b 95%)`,
            peak: '#fff0aa',
            isLcd: false,
          };
      }
    };

    const colors = getVariantColors(variant as AnalogMeterVariant, isVertical);
    const lightingStyle = useAnalogLighting(['surface', 'lens'], lighting);
    const trackLightingStyle = {
      ...lightingStyle,
      '--analog-light-angle-track': 'var(--analog-light-angle-surface)',
    } as React.CSSProperties;

    return (
      <Meter.Root
        ref={ref}
        value={currentValue}
        min={min}
        max={max}
        className={cn(
          'relative flex items-center justify-center',
          isVertical ? 'flex-col w-8 h-64' : 'w-64 h-8',
          className,
        )}
        {...props}
      >
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
                transition: 'clip-path 50ms ease-out',
                background: colors.glow,
              }}
            />
          </div>

          {/* LED Indicator layer */}
          <Meter.Indicator
            className="absolute inset-0 pointer-events-none !w-full !h-full z-10"
            style={{
              clipPath: indicatorClipPath,
              transition: 'clip-path 50ms ease-out', // Real-time audio response
            }}
          >
            {/* Lit LEDs */}
            <div
              className="absolute inset-0"
              style={{
                background: colors.bg,
                boxShadow: colors.isLcd ? 'none' : '0 0 4px rgba(255,255,255,0.15) inset',
              }}
            />

            {/* Analog Noise Overlay (only on lit parts) */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply z-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                opacity: `calc(0.3 + (0.3 * var(--analog-light-power, 1)))`,
              }}
            />
          </Meter.Indicator>

          {peakPercentage != null && (
            <div
              className="absolute pointer-events-none z-30 rounded-full"
              style={{
                ...getPeakMarkerStyle(isVertical, peakPercentage),
                background: colors.peak,
                boxShadow: `0 0 10px color-mix(in srgb, ${colors.peak} 75%, transparent)`,
              }}
            />
          )}

          {/* Segments Grille Overlay */}
          {segments && (
            <div
              className="absolute inset-0 pointer-events-none z-20 opacity-90"
              style={{
                background: isVertical
                  ? `repeating-linear-gradient(to bottom, transparent 0%, transparent calc(100% / ${segments} - 1.5px), #171717 calc(100% / ${segments} - 1.5px), #171717 calc(100% / ${segments}))`
                  : `repeating-linear-gradient(to right, transparent 0%, transparent calc(100% / ${segments} - 1.5px), #171717 calc(100% / ${segments} - 1.5px), #171717 calc(100% / ${segments}))`,
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
            'relative inline-flex rounded-xl border border-transparent p-[var(--spacing-track-padding)] text-white',
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
                  'relative z-10 inline-flex',
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
