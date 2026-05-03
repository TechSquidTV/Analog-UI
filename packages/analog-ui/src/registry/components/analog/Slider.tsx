import * as React from 'react';
import { Slider } from '@base-ui/react';
import { cn } from '../../../lib/utils';
import { RockerThumbSurface } from './RockerThumbSurface';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';

export interface AnalogSliderProps extends React.ComponentPropsWithoutRef<typeof Slider.Root> {
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
}

export const AnalogSlider = React.forwardRef<HTMLDivElement, AnalogSliderProps>(
  ({ className, variant = 'chrome', lighting, ...props }, ref) => {
    
    // Check if the component is vertical or horizontal
    const isVertical = props.orientation === 'vertical';
    const sliderLighting: AnalogLightingConfig<'track' | 'thumb'> = {
      track: { travel: 1 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'thumb'], sliderLighting);

    return (
      <Slider.Root {...props}>
        <Slider.Control 
          ref={ref}
          className={cn(
            "group flex items-center justify-center relative touch-none select-none",
            isVertical ? "h-64 w-16" : "w-full min-w-[250px] h-16",
            className
          )}
          style={lightingStyle}
        >
          {/* Scale Markings */}
          {isVertical ? (
            <div className="absolute top-0 bottom-0 -left-6 w-4 pointer-events-none">
               {[
                 { label: "+10", pos: "0%" },
                 { label: "0", pos: "20%" },
                 { label: "-10", pos: "40%" },
                 { label: "-20", pos: "60%" },
                 { label: "-30", pos: "80%" },
                 { label: "-∞", pos: "100%" },
               ].map(mark => (
                 <span key={mark.pos} className="absolute left-0 w-full text-right text-[9px] font-mono text-[#555] opacity-80 -translate-y-1/2" style={{ top: mark.pos }}>
                   {mark.label}
                 </span>
               ))}
            </div>
          ) : (
            <div className="absolute left-0 right-0 -top-6 h-4 pointer-events-none">
               {[
                 { label: "-∞", pos: "0%" },
                 { label: "-30", pos: "20%" },
                 { label: "-20", pos: "40%" },
                 { label: "-10", pos: "60%" },
                 { label: "0", pos: "80%" },
                 { label: "+10", pos: "100%" },
               ].map(mark => (
                 <span key={mark.pos} className="absolute top-0 text-center text-[9px] font-mono text-[#555] opacity-80 -translate-x-1/2" style={{ left: mark.pos }}>
                   {mark.label}
                 </span>
               ))}
            </div>
          )}

          {/* Beveled Outer Track Recess */}
          <div 
            className={cn(
              "absolute rounded-full analog-surface-recess",
              isVertical ? "h-full w-3" : "w-full h-3"
            )}
          >
            {/* The actual slot the fader moves in (dust cover) */}
            <div className={cn(
               "absolute inset-[var(--spacing-track-padding)] rounded-full analog-track-slot",
               isVertical ? "w-1.5 left-1/2 -ml-[3px]" : "h-1.5 top-1/2 -mt-[3px]"
            )}>
               <div className={cn(
                 "absolute analog-track-slot-guide",
                 isVertical ? "inset-y-0 w-[0.5px] left-1/2" : "inset-x-0 h-[0.5px] top-1/2"
               )} />
            </div>
          </div>

          <Slider.Track className="relative data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-0 flex items-center justify-center">
            {/* 
              Slider Indicator could go here if we wanted an LED strip next to the track.
              For a pure pro-audio fader, we usually just have a plastic/metal thumb.
            */}
            
            <Slider.Thumb 
              className={cn(
                 "absolute outline-none select-none pointer-events-auto",
                 isVertical ? "w-8 h-[72px] -translate-x-1/2 left-0" : "w-[72px] h-8 -translate-y-1/2 top-0"
              )}
            >
              <RockerThumbSurface
                className="absolute inset-0 rounded-sm"
                variant={variant}
                orientation={isVertical ? 'vertical' : 'horizontal'}
                raisedSide="both"
              >
                <div className="absolute inset-[4px] rounded-[6px] ring-2 ring-[var(--color-accent)] opacity-0 group-has-[[data-focus-visible]]:opacity-100 transition-opacity duration-300 pointer-events-none z-[4]" />
              </RockerThumbSurface>
            </Slider.Thumb>
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    );
  }
);
AnalogSlider.displayName = 'AnalogSlider';
