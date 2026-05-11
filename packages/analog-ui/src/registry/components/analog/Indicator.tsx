import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  useAnalogLightAngle,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';

export type IndicatorColor = 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
export type IndicatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IndicatorVariant = 'chrome' | 'black';
export type IndicatorShape = 'round' | 'square';

export interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isOn?: boolean;
  color?: IndicatorColor;
  size?: IndicatorSize;
  /**
   * Bezel material when the bezel is visible.
   * `variant="none"` is deprecated; use `disableBezel` instead.
   */
  variant?: IndicatorVariant | 'none';
  disableBezel?: boolean;
  shape?: IndicatorShape;
  lighting?: AnalogLightingConfig<'bezel' | 'lens'>;
}

const colorMaps = {
  red: {
    bg: 'var(--analog-led-red-surface)',
    core: 'var(--analog-led-red-core)',
    mid: 'var(--analog-led-red-base)',
    edge: 'var(--analog-led-red-edge)',
    bloom: 'var(--analog-led-red-glow)',
  },
  green: {
    bg: 'var(--analog-led-green-surface)',
    core: 'var(--analog-led-green-core)',
    mid: 'var(--analog-led-green-base)',
    edge: 'var(--analog-led-green-edge)',
    bloom: 'var(--analog-led-green-glow)',
  },
  amber: {
    bg: 'var(--analog-led-amber-surface)',
    core: 'var(--analog-led-amber-core)',
    mid: 'var(--analog-led-amber-base)',
    edge: 'var(--analog-led-amber-edge)',
    bloom: 'var(--analog-led-amber-glow)',
  },
  blue: {
    bg: 'var(--analog-led-blue-surface)',
    core: 'var(--analog-led-blue-core)',
    mid: 'var(--analog-led-blue-base)',
    edge: 'var(--analog-led-blue-edge)',
    bloom: 'var(--analog-led-blue-glow)',
  },
  white: {
    bg: 'var(--analog-led-white-surface)',
    core: 'var(--analog-led-white-core)',
    mid: 'var(--analog-led-white-base)',
    edge: 'var(--analog-led-white-edge)',
    bloom: 'var(--analog-led-white-glow)',
  },
};

const sizeMaps = {
  xs: 'w-[10px] h-[10px]',
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const bloomScale = 'var(--analog-bloom-strength, 0.7) * 1.428571';

const glowMaps = {
  xs: {
    blur: `calc(2px * ${bloomScale})`,
    shadow: `0 0 calc(4px * ${bloomScale}) calc(1px * ${bloomScale})`,
    shadow2: `0 0 calc(8px * ${bloomScale}) calc(2px * ${bloomScale})`,
  },
  sm: {
    blur: `calc(4px * ${bloomScale})`,
    shadow: `0 0 calc(6px * ${bloomScale}) calc(1px * ${bloomScale})`,
    shadow2: `0 0 calc(12px * ${bloomScale}) calc(3px * ${bloomScale})`,
  },
  md: {
    blur: `calc(8px * ${bloomScale})`,
    shadow: `0 0 calc(12px * ${bloomScale}) calc(2px * ${bloomScale})`,
    shadow2: `0 0 calc(24px * ${bloomScale}) calc(6px * ${bloomScale})`,
  },
  lg: {
    blur: `calc(12px * ${bloomScale})`,
    shadow: `0 0 calc(16px * ${bloomScale}) calc(3px * ${bloomScale})`,
    shadow2: `0 0 calc(32px * ${bloomScale}) calc(8px * ${bloomScale})`,
  },
  xl: {
    blur: `calc(16px * ${bloomScale})`,
    shadow: `0 0 calc(24px * ${bloomScale}) calc(4px * ${bloomScale})`,
    shadow2: `0 0 calc(48px * ${bloomScale}) calc(12px * ${bloomScale})`,
  },
};

const lensInset = '16%';

export const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(
  (
    {
      className,
      isOn = false,
      color = 'red',
      size = 'md',
      variant,
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
    const resolvedVariant = useAnalogMaterialVariant(variant === 'none' ? undefined : variant);
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
        data-analog-variant={resolvedVariant}
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
                ? `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), var(--analog-surface-metal-hi), var(--analog-surface-metal-mid) 40%, var(--analog-surface-metal-hi) 60%, var(--analog-surface-metal-lo))`
                : `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), var(--analog-surface-onyx-hi), var(--analog-surface-onyx-lo) 40%, var(--analog-surface-onyx-mid) 60%, color-mix(in oklch, var(--analog-surface-onyx-lo) 82%, black))`,
              boxShadow: isChrome
                ? `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.5) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.5) calc(var(--analog-bevel-width, 4px) * 0.75) rgba(255,255,255,calc(1.2 * var(--analog-light-power, 1))), inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.75) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.75) var(--analog-bevel-width, 4px) rgba(0,0,0,calc(0.4 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgba(255,255,255,calc(0.18 * var(--analog-light-power, 1))), 0 var(--analog-bevel-width, 4px) calc(var(--analog-bevel-width, 4px) * 1.5) rgba(0,0,0,calc(0.6 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), 0 0 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgba(0,0,0,calc(0.15 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`
                : `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.5) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.5) calc(var(--analog-bevel-width, 4px) * 0.75) rgba(0,0,0,calc(0.8 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), calc(sin(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-bezel, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))), 0 calc(var(--analog-bevel-width, 4px) * 0.75) calc(var(--analog-bevel-width, 4px) * 1.25) rgba(0,0,0,calc(0.9 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), 0 0 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgba(0,0,0,calc(0.6 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
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
              inset calc(sin(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px) * -1) calc(cos(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px)) calc(var(--analog-bevel-width, 4px) * 2) rgba(0,0,0,calc(0.9 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
              inset calc(sin(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(cos(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgba(0,0,0,calc(1 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
              calc(sin(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-lens, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgba(255,255,255,calc(${isChrome ? 0.6 : 0.2} * var(--analog-light-power, 1)))
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
            className="absolute inset-0 mix-blend-screen z-30 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              opacity: 'calc(var(--analog-grain-opacity) + 0.12)',
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
               radial-gradient(circle at 50% 50%, color-mix(in oklch, ${palette.bloom} calc(30% * ${bloomScale}), transparent) 20%, transparent 60%)
             `,
            filter: `blur(${glow.blur})`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    );
  },
);
Indicator.displayName = 'Indicator';
