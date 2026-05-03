import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export type AnalogMeterVariant = 'metered' | 'lcd-green' | 'lcd-amber' | 'lcd-blue';

export interface AnalogMeterProps extends React.ComponentPropsWithoutRef<typeof Meter.Root> {
  orientation?: 'horizontal' | 'vertical';
  peakValue?: number | null;
  variant?: AnalogMeterVariant;
  segments?: number;
  lighting?: AnalogLightingConfig<'surface' | 'lens'>;
}

export const AnalogMeter = React.forwardRef<HTMLDivElement, AnalogMeterProps>(
  (
    {
      className,
      orientation = 'vertical',
      peakValue: _peakValue = null,
      value,
      max = 100,
      variant = 'metered',
      segments,
      lighting,
      ...props
    },
    ref,
  ) => {
    const isVertical = orientation === 'vertical';

    const percentage = value != null ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

    // Vertical clip path: inset(top right bottom left)
    const insetVal = isVertical
      ? `inset(${100 - percentage}% 0 0 0)`
      : `inset(0 0 0 ${100 - percentage}%)`; // wait actually right should be 100-perc for horizontal? Wait, for horizontal left-to-right, it's inset(top right bottom left). So if percentage=20, right=80%. So inset(0 80% 0 0).

    const insetValHoriz = `inset(0 ${100 - percentage}% 0 0)`;

    const getVariantColors = (v: AnalogMeterVariant, isVert: boolean) => {
      const dir = isVert ? 'to top' : 'to right';
      switch (v) {
        case 'lcd-green':
          return { glow: '#5ca34d', bg: '#67b557', isLcd: true };
        case 'lcd-amber':
          return { glow: '#d19324', bg: '#e6a42e', isLcd: true };
        case 'lcd-blue':
          return { glow: '#3b86e0', bg: '#4d98f0', isLcd: true };
        case 'metered':
        default:
          return {
            bg: `linear-gradient(${dir}, #65ba59 60%, #e6a227 80%, #d44040 95%)`,
            glow: `linear-gradient(${dir}, #5ba850 60%, #d49524 80%, #c43b3b 95%)`,
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
        value={value ?? 0}
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
            'relative analog-surface-recess-sm',
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
                clipPath: isVertical ? insetVal : insetValHoriz,
                transition: 'clip-path 50ms ease-out',
                background: colors.glow,
              }}
            />
          </div>

          {/* LED Indicator layer */}
          <Meter.Indicator
            className="absolute inset-0 pointer-events-none !w-full !h-full z-10"
            style={{
              clipPath: isVertical ? insetVal : insetValHoriz,
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
