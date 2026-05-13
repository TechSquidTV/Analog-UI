import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';
import type { AnalogOrientation } from './orientation';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof BaseSwitch.Root> {
  variant?: 'chrome' | 'black';
  orientation?: AnalogOrientation;
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
}

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, variant, orientation = 'horizontal', lighting, ...props }, ref) => {
    const internalRef = React.useRef<HTMLElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);

    const resolvedVariant = useAnalogMaterialVariant(variant);
    const isChrome = resolvedVariant === 'chrome';
    const isVertical = orientation === 'vertical';
    const switchLighting: AnalogLightingConfig<'track' | 'thumb'> = {
      track: { travel: 1 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'thumb'], switchLighting);

    return (
      <BaseSwitch.Root
        ref={mergedRef}
        className={cn(
          'analog-switch group relative inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-full border-none outline-none select-none',
          isVertical ? 'h-[104px] w-[36px]' : 'h-[36px] w-[104px]',
          className,
        )}
        style={lightingStyle}
        {...props}
        data-analog-variant={resolvedVariant}
        data-orientation={orientation}
      >
        {/* Outer Bevel / Base Plate (Track) */}
        <div className="absolute inset-0 rounded-full overflow-hidden analog-surface-recess">
          {/* The actual slot cavity */}
          <div
            className={cn(
              'absolute inset-[var(--spacing-track-padding)] rounded-full analog-track-slot analog-track-slot-unlit flex items-center justify-between',
              isVertical ? 'flex-col py-[18px]' : 'px-[24px]',
            )}
          >
            {/* Labels */}
            <span className="font-mono text-[9px] leading-none font-bold tracking-[0.18em] text-[color:var(--analog-telemetry-label)] opacity-0 group-data-[checked]:opacity-100 transition-opacity duration-300">
              ON
            </span>
            <span className="font-mono text-[9px] leading-none font-bold tracking-[0.18em] text-[color:var(--analog-telemetry-label)] opacity-50 group-data-[checked]:opacity-0 transition-opacity duration-300">
              OFF
            </span>
          </div>
        </div>

        {/* The Thumb */}
        <BaseSwitch.Thumb className="analog-switch-thumb absolute left-1/2 top-1/2 -mt-[14px] -ml-[14px] w-[28px] h-[28px] pointer-events-none">
          <div className="w-full h-full relative" style={{ perspective: '800px' }}>
            <div className="analog-switch-cylinder absolute inset-0 rounded-full">
              {/* 3D Depth Extrusion Layers (Skirt) - rendered behind the face */}
              {[...Array(40)].map((_, i) => {
                const zDepth = (i + 1) * 1.5;
                const scale = Math.max(0.3, 1 - i * 0.008);
                const opacity = 1 - Math.pow(i / 39, 1.5); // Fade out
                return (
                  <div
                    key={`extrusion-${i}`}
                    className="absolute inset-0 rounded-full border"
                    style={{
                      transform: `translateZ(-${zDepth}px) scale(${scale})`,
                      opacity,
                      backgroundColor: isChrome
                        ? 'var(--analog-surface-metal-mid)'
                        : 'var(--analog-surface-onyx-mid)',
                      borderColor: isChrome
                        ? 'color-mix(in oklch, var(--analog-surface-metal-lo) 28%, transparent)'
                        : 'color-mix(in oklch, var(--analog-control-border) 78%, transparent)',
                    }}
                  />
                );
              })}

              {/* Front Face */}
              <div
                className={cn(
                  'analog-switch-face absolute inset-0 rounded-full overflow-hidden',
                  `variant-${resolvedVariant}`,
                )}
              >
                {/* Dial conic gradient for specular highlight */}
                <div
                  className={cn(
                    'analog-switch-lighting absolute inset-0 z-[1]',
                    `variant-${resolvedVariant}`,
                  )}
                />

                {/* Foil texture wrap for the knob */}
                <div
                  className={cn(
                    'analog-foil analog-switch-foil z-[2]',
                    isChrome
                      ? 'opacity-30 mix-blend-screen'
                      : 'opacity-20 filter grayscale brightness-50',
                  )}
                />

                {/* Concentric rings to make it look machined */}
                <div className="absolute inset-[2px] rounded-full border border-[color:var(--analog-seam-shadow)] z-[2]" />
                <div className="absolute inset-[4px] rounded-full border border-[color:var(--analog-seam-shadow)] z-[2]" />

                {/* Subtle edge highlight */}
                <div
                  className="absolute inset-0 rounded-full z-[3]"
                  style={{
                    boxShadow: `inset calc(sin(var(--analog-light-angle-thumb, 180deg)) * 2px) calc(cos(var(--analog-light-angle-thumb, 180deg)) * -2px) 2px rgb(var(--analog-highlight-rgb) / calc(0.8 * var(--analog-light-power, 1)))`,
                  }}
                />
              </div>
            </div>
          </div>
        </BaseSwitch.Thumb>
      </BaseSwitch.Root>
    );
  },
);
Switch.displayName = 'Switch';
