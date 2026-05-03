import * as React from 'react';
import { cn } from '../../../lib/utils';
import {
  useAnalogLightAngle,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';

export type AnalogIndicatorColor = 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
export type AnalogIndicatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AnalogIndicatorVariant = 'chrome' | 'black';
export type AnalogIndicatorShape = 'round' | 'square';

export interface AnalogIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isOn?: boolean;
  color?: AnalogIndicatorColor;
  size?: AnalogIndicatorSize;
  /**
   * Bezel material when the bezel is visible.
   * `variant="none"` is deprecated; use `disableBezel` instead.
   */
  variant?: AnalogIndicatorVariant | 'none';
  disableBezel?: boolean;
  shape?: AnalogIndicatorShape;
  lighting?: AnalogLightingConfig<'bezel' | 'lens'>;
}

const colorMaps = {
  red: {
    bg: '#3a0808',
    core: '#fc8888',
    mid: '#d44040',
    edge: '#8c1c1c',
    bloom: 'rgba(212, 64, 64, 0.7)',
  },
  green: {
    bg: '#0f2913',
    core: '#bdf2c3',
    mid: '#5ca34d',
    edge: '#2b5e20',
    bloom: 'rgba(92, 163, 77, 0.7)',
  },
  amber: {
    bg: '#2e1d05',
    core: '#fcefc7',
    mid: '#d19324',
    edge: '#8a5b0f',
    bloom: 'rgba(209, 147, 36, 0.7)',
  },
  blue: {
    bg: '#081e36',
    core: '#c5e2ff',
    mid: '#3b86e0',
    edge: '#164882',
    bloom: 'rgba(59, 134, 224, 0.7)',
  },
  white: {
    bg: '#404040',
    core: '#ffffff',
    mid: '#f4f4f4',
    edge: '#a3a3a3',
    bloom: 'rgba(255, 255, 255, 0.8)',
  },
};

const sizeMaps = {
  xs: 'w-[10px] h-[10px]',
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const glowMaps = {
  xs: { blur: '2px', shadow: '0 0 4px 1px', shadow2: '0 0 8px 2px' },
  sm: { blur: '4px', shadow: '0 0 6px 1px', shadow2: '0 0 12px 3px' },
  md: { blur: '8px', shadow: '0 0 12px 2px', shadow2: '0 0 24px 6px' },
  lg: { blur: '12px', shadow: '0 0 16px 3px', shadow2: '0 0 32px 8px' },
  xl: { blur: '16px', shadow: '0 0 24px 4px', shadow2: '0 0 48px 12px' },
};

const lensInset = '16%';

export const AnalogIndicator = React.forwardRef<HTMLDivElement, AnalogIndicatorProps>(
  (
    {
      className,
      isOn = false,
      color = 'red',
      size = 'md',
      variant = 'chrome',
      disableBezel = false,
      shape = 'round',
      lighting,
      ...props
    },
    ref,
  ) => {
    const resolvedColor = color === 'none' ? 'red' : color;
    const palette = colorMaps[resolvedColor];
    const glow = glowMaps[size];
    const resolvedVariant: AnalogIndicatorVariant = variant === 'none' ? 'chrome' : variant;
    const isChrome = resolvedVariant === 'chrome';
    const hasBezel = !disableBezel && variant !== 'none';
    const radius = shape === 'square' ? '15%' : '50%';
    const lightingStyle = useAnalogLighting(['bezel', 'lens'], lighting);
    const lensLightAngle = useAnalogLightAngle('lens', {}, lighting?.lens);
    const lensGlintPosition = React.useMemo(() => {
      const radians = (lensLightAngle * Math.PI) / 180;
      const horizontal = -Math.sin(radians);
      const arcHalfRadians = (60 / 2) * (Math.PI / 180);
      const maxArcX = Math.sin(arcHalfRadians);
      const projectedX = maxArcX * Math.sin(horizontal * (Math.PI / 2));
      const projectedY = -Math.sqrt(Math.max(0, 1 - projectedX * projectedX));

      return {
        x: 50 + projectedX * 28,
        y: 50 + projectedY * 22,
      };
    }, [lensLightAngle]);

    if (color === 'none') return null;

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center shrink-0',
          sizeMaps[size],
          className,
        )}
        style={{ ...lightingStyle, borderRadius: radius }}
        {...props}
      >
        {/* Bezel Base */}
        {hasBezel && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: radius,
              background: isChrome
                ? `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), #e5e5e5, #888 40%, #e5e5e5 60%, #444)`
                : `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), #444, #111 40%, #222 60%, #000)`,
              boxShadow: isChrome
                ? `inset 0 2px 3px rgba(255,255,255,calc(1.2 * var(--analog-light-power, 1))), inset 0 -3px 4px rgba(0,0,0,calc(0.4 * var(--analog-light-power, 1))), 0 4px 6px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.15 * var(--analog-light-power, 1)))`
                : `inset 0 1px 2px rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset 0 -2px 3px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 3px 5px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
            }}
          />
        )}

        {/* Lens Base & Recess */}
        <div
          className="absolute overflow-hidden pointer-events-none"
          style={{
            // Keep the jewel lens geometry stable even when the bezel is hidden.
            inset: lensInset,
            borderRadius: shape === 'square' ? '8%' : '50%',
            backgroundColor: palette.bg,
            boxShadow: hasBezel
              ? `
              inset 0 4px 8px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))),
              inset 0 1px 2px rgba(0,0,0,calc(1 * var(--analog-light-power, 1))),
              0 1px 0 rgba(255,255,255,calc(${isChrome ? 0.6 : 0.2} * var(--analog-light-power, 1)))
            `
              : undefined,
          }}
        >
          {/* Jewel Faceted Texture Overlay (Always visible) */}
          <div
            className="absolute inset-0 mix-blend-overlay z-10 opacity-80"
            style={{
              backgroundImage:
                shape === 'square'
                  ? `linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0) 100%)`
                  : `repeating-conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.4) 15deg, rgba(255,255,255,0) 30deg), 
                repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0) 20%)`,
            }}
          />

          {/* Master Light Reflection (unlit state) */}
          <div
            className="absolute inset-0 opacity-60 mix-blend-screen z-20"
            style={{
              borderRadius: shape === 'square' ? '8%' : '50%',
              background: `radial-gradient(circle at ${lensGlintPosition.x}% ${lensGlintPosition.y}%, rgba(255,255,255,calc(0.72 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,calc(0.34 * var(--analog-light-power, 1))) 16%, rgba(255,255,255,0) 40%)`,
            }}
          />

          {/* Center dark sphere effect to simulate 3D dome */}
          <div
            className="absolute inset-0 z-20"
            style={{
              borderRadius: shape === 'square' ? '8%' : '50%',
              background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* Lit State */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-300 ease-out z-30',
              isOn ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              borderRadius: shape === 'square' ? '8%' : '50%',
              background: `radial-gradient(circle at 50% 40%, ${palette.core} 0%, ${palette.mid} 40%, ${palette.edge} 100%)`,
            }}
          >
            {/* Intense Core glint */}
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{
                borderRadius: shape === 'square' ? '8%' : '50%',
                background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
              }}
            />
          </div>

          {/* Grain texture for realism */}
          <div
            className="absolute inset-0 mix-blend-overlay z-30 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Outer Bloom / Halo effect when on */}
        <div
          className={cn(
            'absolute pointer-events-none transition-opacity duration-300 ease-out z-40',
            isOn ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            inset: lensInset,
            borderRadius: shape === 'square' ? '8%' : '50%',
            boxShadow: `${glow.shadow} ${palette.bloom}, ${glow.shadow2} ${palette.bloom}`,
            mixBlendMode: 'screen',
          }}
        />

        {/* Soft Core Bloom with fast falloff */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] pointer-events-none transition-opacity duration-300 ease-out z-40',
            isOn ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            borderRadius: radius,
            background: `
               radial-gradient(circle at 50% 50%, ${palette.bloom} 0%, transparent 20%),
               radial-gradient(circle at 50% 50%, ${palette.bloom.replace(/[\d.]+\)$/, '0.3)')} 20%, transparent 60%)
             `,
            filter: `blur(${glow.blur})`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    );
  },
);
AnalogIndicator.displayName = 'AnalogIndicator';
