import * as React from 'react';
import { Slider } from '@base-ui/react';
import { cn } from '@/lib/utils';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '@/registry/hooks/use-analog-lighting';

export interface AnalogSliderProps extends React.ComponentPropsWithoutRef<typeof Slider.Root> {
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
}

export const AnalogSlider = React.forwardRef<HTMLDivElement, AnalogSliderProps>(
  ({ className, variant = 'chrome', lighting, ...props }, ref) => {
    
    // Check if the component is vertical or horizontal
    const isVertical = props.orientation === 'vertical';
    const isChrome = variant === 'chrome';
    const lightingStyle = useAnalogLighting(['track', 'thumb'], lighting);

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
               "absolute inset-[var(--spacing-track-padding)] rounded-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,1)]",
               isVertical ? "w-1.5 left-1/2 -ml-[3px]" : "h-1.5 top-1/2 -mt-[3px]"
            )}>
               <div className={cn(
                 "absolute bg-neutral-800 opacity-50",
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
                 isVertical ? "w-5 h-16 -translate-x-1/2 left-0" : "w-16 h-5 -translate-y-1/2 top-0"
              )}
            >
              {/* Thumb 3D Base */}
             <div className={cn(
                  "absolute inset-0 rounded-sm",
                  `variant-${variant}`
               )} style={{
                  background: isChrome 
                    ? `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg) - 90deg), #b5b5b5, #e5e5e5 50%, #8a8a8a)`
                    : `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg) - 90deg), #242424, #3a3a3a 50%, #151515)`,
                  boxShadow: isChrome 
                    ? `inset 0 1px 1px rgba(255,255,255,calc(1 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1))), 0 8px 16px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`
                    : `inset 0 1px 1px rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 8px 16px rgba(0,0,0,calc(0.95 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`
               }}>
                 {/* Foil texture wrap for the knob */}
                 <div 
                   className={cn(
                     "analog-foil rounded-sm z-[1]",
                     isChrome ? "opacity-40" : "opacity-30 filter grayscale brightness-50"
                   )}
                   style={{ backgroundSize: '250%' }}
                 />

                 {/* Center Line Indicator */}
                 <div className={cn(
                   "absolute bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.4)] z-[3]",
                   isVertical ? "h-[2px] inset-x-0 top-1/2 -mt-[1px]" : "w-[2px] inset-y-0 left-1/2 -ml-[1px]"
                 )} />

                 {/* Focus Ring Indicator (invisible unless focus-visible) */}
                 <div className="absolute inset-[4px] rounded-md ring-2 ring-[var(--color-accent)] opacity-0 group-has-[[data-focus-visible]]:opacity-100 transition-opacity duration-300 pointer-events-none" />
                 
                 {/* Ridge styling / Texture */}
                 {isVertical && (
                   <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex flex-col gap-[3px] opacity-80 mix-blend-hard-light pointer-events-none z-[2]">
                     {[...Array(5)].map((_, i) => (
                       <div key={i}
                         className="w-full h-[2px] rounded-sm"
                         style={{
                           background: isChrome
                             ? `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg) - 90deg), #e5e5e5, #b5b5b5)`
                             : `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg) - 90deg), #3a3a3a, #151515)`,
                           boxShadow: isChrome
                             ? `0 1px 1px rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1))), 0 -1px 1px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1)))`
                             : `0 1px 1px rgba(255,255,255,calc(0.3 * var(--analog-light-power, 1))), 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1)))`
                         }}
                       />
                     ))}
                   </div>
                 )}
                 {!isVertical && (
                   <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 flex gap-[3px] opacity-80 mix-blend-hard-light pointer-events-none z-[2]">
                     {[...Array(5)].map((_, i) => (
                       <div key={`h-ridge-${i}`} 
                            className="w-[2px] h-full rounded-sm"
                            style={{
                              background: isChrome
                                ? `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg)), #e5e5e5, #b5b5b5)`
                                : `linear-gradient(calc(var(--analog-light-angle-thumb, 180deg)), #3a3a3a, #151515)`,
                              boxShadow: isChrome
                                ? `1px 0 1px rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1))), -1px 0 1px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1)))`
                                : `1px 0 1px rgba(255,255,255,calc(0.3 * var(--analog-light-power, 1))), -1px 0 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1)))`
                            }}
                       />
                     ))}
                   </div>
                 )}
               </div>
               
               {/* 3D Extrusion Stack */}
               <div className="absolute inset-x-1 inset-y-1 -z-10 bg-neutral-900 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.8)]" />
            </Slider.Thumb>
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    );
  }
);
AnalogSlider.displayName = 'AnalogSlider';
