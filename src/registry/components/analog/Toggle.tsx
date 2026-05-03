import * as React from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils';
import { AnalogIndicator } from './Indicator';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '@/registry/hooks/use-analog-lighting';

export interface AnalogToggleProps extends Omit<React.ComponentPropsWithoutRef<typeof ToggleGroup>, 'value'|'defaultValue'|'onValueChange'> {
  variant?: 'chrome' | 'black';
  leftLed?: 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
  rightLed?: 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
  leftLedActive?: 'auto' | 'always' | 'never';
  rightLedActive?: 'auto' | 'always' | 'never';
  value?: 'left' | 'right';
  onValueChange?: (val: 'left' | 'right') => void;
  lighting?: AnalogLightingConfig<'track' | 'thumb' | 'lens' | 'surface'>;
}

const GripRidges = ({ position, isChrome }: { position: 'left' | 'right'; isChrome: boolean }) => (
  <div
    className={cn(
      "absolute top-1/2 -translate-y-1/2 flex gap-[4px] opacity-80 mix-blend-hard-light px-1 pointer-events-none",
      position === 'left' ? "left-[20px]" : "right-[20px]"
    )}
  >
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-[2px] h-7 rounded-sm",
          isChrome
            ? "bg-gradient-to-r from-neutral-400 via-neutral-100 to-neutral-400"
            : "bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800"
        )}
        style={{
          boxShadow: isChrome
            ? `1px 0 1px rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1))), -1px 0 1px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1)))`
            : `1px 0 1px rgba(255,255,255,calc(0.3 * var(--analog-light-power, 1))), -1px 0 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1)))`
        }}
      />
    ))}
  </div>
);


export const AnalogToggle = React.forwardRef<HTMLDivElement, AnalogToggleProps>(
  ({ className, variant = 'chrome', leftLed = 'none', rightLed = 'none', leftLedActive = 'auto', rightLedActive = 'auto', value = 'left', onValueChange, lighting, ...props }, ref) => {
    
    const internalRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = (ref || internalRef) as React.RefObject<HTMLDivElement>;

    const [hoverState, setHoverState] = React.useState({
      isHovered: false,
      deltaX: 0,
      deltaY: 0
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mergedRef.current) return;
      const rect = mergedRef.current.getBoundingClientRect();
      const absoluteX = e.clientX - rect.left;
      const absoluteY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      setHoverState({
        isHovered: true,
        deltaX: absoluteX - centerX,
        deltaY: absoluteY - centerY
      });
      props.onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setHoverState({ ...hoverState, isHovered: false });
      props.onMouseLeave?.(e);
    };

    const isChrome = variant === 'chrome';
    const lightingStyle = useAnalogLighting(['track', 'thumb', 'lens', 'surface'], lighting);
    
    // We dampen the glare movement significantly so it feels heavy and metallic
    const glareX = hoverState.isHovered ? hoverState.deltaX * 0.15 : 0;
    const glareY = hoverState.isHovered ? hoverState.deltaY * 0.15 : 0;

    return (
      <ToggleGroup
        ref={mergedRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "analog-toggle group relative inline-flex h-12 w-[104px] shrink-0 items-center justify-center rounded-lg border-none outline-none select-none",
          className
        )}
        style={{
          ...lightingStyle,
          '--glare-x': `${glareX}px`,
          '--glare-y': `${glareY}px`,
        } as React.CSSProperties}
        data-state={value}
        value={value ? [value] : []}
        onValueChange={(val) => {
          // If the user clicks the currently active one, and `val` is empty array,
          // do nothing to prevent deselection.
          if (val.length > 0) {
            onValueChange?.(val[0] as 'left' | 'right');
          }
        }}
        {...props}
      >
        <Toggle value="left" className="absolute top-0 bottom-0 left-0 w-1/2 z-[10] opacity-0 cursor-pointer" />
        <Toggle value="right" className="absolute top-0 bottom-0 right-0 w-1/2 z-[10] opacity-0 cursor-pointer" />

        {/* Outer Bevel / Base Plate */}
        <div className={cn(
          "absolute inset-0 rounded-lg pointer-events-none",
          isChrome 
            ? "bg-gradient-to-b from-neutral-300 to-neutral-500"
            : "bg-gradient-to-b from-neutral-700 to-neutral-900"
        )} style={{
           boxShadow: isChrome 
             ? `inset 0 1px 1px rgba(255,255,255,calc(1 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`
             : `inset 0 1px 1px rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`
        }}>
          {/* Inner Recess / Track */}
          <div className="absolute inset-[var(--spacing-track-padding)] rounded-md analog-surface-recess" style={{ perspective: '800px' }}>
            
            {/* Rocker Pivot Container */}
            <div className="analog-rocker-container absolute inset-y-[2px] inset-x-[6px] rounded-sm pointer-events-none">
               
               {/* 3D Depth Extrusion Layers (Skirt) - rendered behind the face */}
               {[...Array(24)].map((_, i) => (
                 <div 
                   key={`extrusion-${i}`} 
                   className={cn(
                     "absolute inset-0 rounded-sm",
                     isChrome ? "bg-neutral-400 border border-neutral-500/30" : "bg-[#121212] border border-[#222]/50"
                   )} 
                   style={{ transform: `translateZ(-${i + 1}px)` }} 
                 />
               ))}

               {/* Front Face */}
               <div className={cn(
                 "analog-rocker-face absolute inset-0 rounded-sm",
                 `variant-${variant}`
               )}>
                 {/* Foil texture wrap for the knob */}
                 <div 
                   className={cn(
                     "analog-foil rounded-sm z-[1]",
                     isChrome ? "opacity-40" : "opacity-30 filter grayscale brightness-50"
                   )}
                   style={{ backgroundSize: '250%' }}
                 />

                 {/* Center Ridge / Pivot bump */}
                 <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-black/20 z-[2]" 
                      style={{ boxShadow: `1px 0 0 rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1)))` }} />

                 {/* Status Indicators carved into the face */}
                 <div className="z-[3]">
                   <div className="absolute top-1/2 -mt-[5px] left-2 pointer-events-none">
                     <AnalogIndicator size="xs" variant="none" shape="round" color={leftLed} isOn={leftLedActive === 'always' ? true : leftLedActive === 'never' ? false : value === 'left'} />
                   </div>
                   <div className="absolute top-1/2 -mt-[5px] right-2 pointer-events-none">
                     <AnalogIndicator size="xs" variant="none" shape="round" color={rightLed} isOn={rightLedActive === 'always' ? true : rightLedActive === 'never' ? false : value === 'right'} />
                   </div>
                 </div>

                 {/* Grip Ridges */}
                 <div className="z-[3]">
                   <GripRidges position="left" isChrome={isChrome} />
                   <GripRidges position="right" isChrome={isChrome} />
                 </div>
                 
               </div>
            </div>
          </div>
        </div>
      </ToggleGroup>
    );
  }
);
AnalogToggle.displayName = 'AnalogToggle';
