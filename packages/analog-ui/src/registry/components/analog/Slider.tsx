import * as React from 'react';
import { Slider } from '@base-ui/react';
import { cn } from '../../../lib/utils';
import { RockerThumbSurface } from './RockerThumbSurface';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogOrientation } from './orientation';

export interface AnalogSliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Slider.Root>, 'orientation'> {
  variant?: 'chrome' | 'black';
  orientation?: AnalogOrientation;
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
}

export const AnalogSlider = React.forwardRef<HTMLDivElement, AnalogSliderProps>(
  ({ className, variant = 'chrome', orientation = 'horizontal', lighting, ...props }, ref) => {
    const isVertical = orientation === 'vertical';
    const horizontalMarks = [
      { label: '-∞', pos: '0%', align: 'start' },
      { label: '-30', pos: '20%', align: 'center' },
      { label: '-20', pos: '40%', align: 'center' },
      { label: '-10', pos: '60%', align: 'center' },
      { label: '0', pos: '80%', align: 'center' },
      { label: '+10', pos: '100%', align: 'end' },
    ] as const;
    const sliderLighting: AnalogLightingConfig<'track' | 'thumb'> = {
      track: { travel: 1 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'thumb'], sliderLighting);

    return (
      <Slider.Root ref={ref} orientation={orientation} {...props}>
        <Slider.Control
          className={cn(
            'group relative flex items-center justify-center touch-none select-none data-[orientation=horizontal]:h-16 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-0 data-[orientation=vertical]:h-64 data-[orientation=vertical]:w-16 data-[orientation=vertical]:shrink-0',
            className,
          )}
          style={lightingStyle}
        >
          {/* Scale Markings */}
          {isVertical ? (
            <div className="absolute top-0 bottom-0 -left-6 w-4 pointer-events-none">
              {[
                { label: '+10', pos: '0%' },
                { label: '0', pos: '20%' },
                { label: '-10', pos: '40%' },
                { label: '-20', pos: '60%' },
                { label: '-30', pos: '80%' },
                { label: '-∞', pos: '100%' },
              ].map((mark) => (
                <span
                  key={mark.pos}
                  className="absolute left-0 w-full text-right text-[9px] font-mono text-[#555] opacity-80 -translate-y-1/2"
                  style={{ top: mark.pos }}
                >
                  {mark.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="absolute left-0 right-0 -top-6 h-4 pointer-events-none">
              {horizontalMarks.map((mark) => (
                <span
                  key={mark.pos}
                  className={cn(
                    'absolute top-0 text-[9px] font-mono text-[#555] opacity-80',
                    mark.align === 'start'
                      ? 'translate-x-0 text-left'
                      : mark.align === 'end'
                        ? '-translate-x-full text-right'
                        : '-translate-x-1/2 text-center',
                  )}
                  style={{ left: mark.pos }}
                >
                  {mark.label}
                </span>
              ))}
            </div>
          )}

          {/* Beveled Outer Track Recess */}
          <div
            className={cn(
              'absolute rounded-full analog-surface-recess',
              isVertical ? 'h-full w-3' : 'w-full h-3',
            )}
          >
            {/* The actual slot the fader moves in (dust cover) */}
            <div
              className={cn(
                'absolute inset-[var(--spacing-track-padding)] rounded-full analog-track-slot',
                isVertical ? 'w-1.5 left-1/2 -ml-[3px]' : 'h-1.5 top-1/2 -mt-[3px]',
              )}
            >
              <div
                className={cn(
                  'absolute analog-track-slot-guide',
                  isVertical ? 'inset-y-0 w-[0.5px] left-1/2' : 'inset-x-0 h-[0.5px] top-1/2',
                )}
              />
            </div>
          </div>

          <Slider.Track className="relative data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-0 flex items-center justify-center">
            {/* 
              Slider Indicator could go here if we wanted an LED strip next to the track.
              For a pure pro-audio fader, we usually just have a plastic/metal thumb.
            */}

            <Slider.Thumb
              className={cn(
                'absolute pointer-events-auto outline-none select-none data-[orientation=horizontal]:top-0 data-[orientation=horizontal]:h-8 data-[orientation=horizontal]:w-[72px] data-[orientation=horizontal]:-translate-y-1/2 data-[orientation=vertical]:left-0 data-[orientation=vertical]:h-[72px] data-[orientation=vertical]:w-8 data-[orientation=vertical]:-translate-x-1/2',
              )}
            >
              <RockerThumbSurface
                className="absolute inset-0 rounded-sm"
                variant={variant}
                orientation={orientation}
                raisedSide="both"
              >
                <div className="absolute inset-[4px] rounded-[6px] ring-2 ring-[var(--color-accent)] opacity-0 group-has-[[data-focus-visible]]:opacity-100 transition-opacity duration-300 pointer-events-none z-[4]" />
              </RockerThumbSurface>
            </Slider.Thumb>
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    );
  },
);
AnalogSlider.displayName = 'AnalogSlider';
