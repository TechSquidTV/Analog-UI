import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export interface AnalogSwitchProps extends React.ComponentPropsWithoutRef<typeof BaseSwitch.Root> {
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
}

export const AnalogSwitch = React.forwardRef<HTMLButtonElement, AnalogSwitchProps>(
  ({ className, variant = 'chrome', lighting, ...props }, ref) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);

    const isChrome = variant === 'chrome';
    const switchLighting: AnalogLightingConfig<'track' | 'thumb'> = {
      track: { travel: 1 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'thumb'], switchLighting);

    return (
      <BaseSwitch.Root
        ref={mergedRef}
        className={cn(
          'analog-switch group relative inline-flex h-[36px] w-[104px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none outline-none select-none',
          className,
        )}
        style={lightingStyle}
        {...props}
      >
        {/* Outer Bevel / Base Plate (Track) */}
        <div className="absolute inset-0 rounded-full overflow-hidden analog-surface-recess">
          {/* The actual slot cavity */}
          <div
            className={cn(
              'absolute inset-[var(--spacing-track-padding)] rounded-full analog-track-slot analog-track-slot-unlit flex items-center justify-between px-[24px]',
            )}
          >
            {/* Labels */}
            <span className="font-mono text-[9px] font-bold text-[#555] opacity-0 group-data-[checked]:opacity-100 transition-opacity duration-300">
              ON
            </span>
            <span className="font-mono text-[9px] font-bold text-[#555] opacity-50 group-data-[checked]:opacity-0 transition-opacity duration-300">
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
                    className={cn(
                      'absolute inset-0 rounded-full',
                      isChrome
                        ? 'bg-neutral-400 border border-neutral-500/20'
                        : 'bg-[#121212] border border-[#222]/50',
                    )}
                    style={{
                      transform: `translateZ(-${zDepth}px) scale(${scale})`,
                      opacity,
                    }}
                  />
                );
              })}

              {/* Front Face */}
              <div
                className={cn(
                  'analog-switch-face absolute inset-0 rounded-full overflow-hidden',
                  `variant-${variant}`,
                )}
              >
                {/* Dial Conic Gradient for Anisotropic Specular Highlight */}
                <div
                  className={cn(
                    'analog-switch-lighting absolute inset-0 z-[1]',
                    `variant-${variant}`,
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
                <div className="absolute inset-[2px] rounded-full border border-black/10 z-[2]" />
                <div className="absolute inset-[4px] rounded-full border border-black/10 z-[2]" />

                {/* Subtle edge highlight */}
                <div
                  className="absolute inset-0 rounded-full z-[3]"
                  style={{
                    boxShadow: `inset calc(sin(var(--analog-light-angle-thumb, 180deg)) * 2px) calc(cos(var(--analog-light-angle-thumb, 180deg)) * -2px) 2px rgba(255,255,255,calc(0.8 * var(--analog-light-power, 1)))`,
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
AnalogSwitch.displayName = 'AnalogSwitch';
