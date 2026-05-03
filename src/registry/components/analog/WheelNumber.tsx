import * as React from 'react';
import { cn } from '@/lib/utils';
import { NumberField } from '@base-ui/react/number-field';
import { motion, useMotionValue, animate } from 'motion/react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useWheelScroll } from '@/registry/hooks/use-wheel-scroll';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '@/registry/hooks/use-analog-lighting';

export interface AnalogWheelNumberProps extends React.ComponentPropsWithoutRef<typeof NumberField.Root> {
  lighting?: AnalogLightingConfig<'track' | 'wheel'>;
}

export const AnalogWheelNumber = React.forwardRef<HTMLDivElement, AnalogWheelNumberProps>(
  ({ className, value, defaultValue, onValueChange, lighting, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0);
    const actualValue = value !== undefined ? (value as number) : internalValue;

    const rotation = useMotionValue(0);
    const scrubAreaRef = React.useRef<HTMLDivElement>(null);
    const lightingStyle = useAnalogLighting(['track', 'wheel'], lighting);

    React.useEffect(() => {
      // Rotate 18 degrees per value integer. 
      // Negative because grabbing the wheel and dragging UP increases the value,
      // and dragging the front face UP rotates the cylinder AWAY (negative around X-axis if standard CSS).
      // We will map negative rotation to ensure it aligns with standard trim wheels.
      animate(rotation, actualValue * -18, { type: 'spring', stiffness: 400, damping: 40 });
    }, [actualValue, rotation]);

    useWheelScroll(
      scrubAreaRef,
      React.useCallback((e, deltaDirection) => {
        const isUp = deltaDirection > 0;
        const step = props.step !== undefined && props.step !== 'any' ? Number(props.step) : 1;
        const delta = isUp ? step : -step;
        let newVal = actualValue + delta;
        
        if (props.min !== undefined) newVal = Math.max(props.min, newVal);
        if (props.max !== undefined) newVal = Math.min(props.max, newVal);

        if (newVal !== actualValue) {
          if (value === undefined) setInternalValue(newVal);
          onValueChange?.(newVal, {} as any);
        }
      }, [actualValue, props.step, props.min, props.max, value, onValueChange])
    );

    return (
      <NumberField.Root
        ref={ref}
        value={actualValue}
        onValueChange={(val, details) => {
          if (val !== null) {
            if (value === undefined) setInternalValue(val);
            onValueChange?.(val, details);
          }
        }}
        {...props}
        className={cn("flex flex-col items-center gap-4", className)}
      >
        <NumberField.Group className="flex items-center rounded-md border border-[#333] bg-[#111] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] z-20">
          <NumberField.Decrement className="flex size-8 items-center justify-center rounded-sm text-[#888] hover:bg-[#222] hover:text-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[#000] active:shadow-none transition-all cursor-pointer outline-none">
            <MinusIcon className="size-4 pointer-events-none" />
          </NumberField.Decrement>
          <NumberField.Input 
            className="w-16 bg-transparent text-center font-mono text-sm font-bold text-[#eee] tabular-nums outline-none selection:bg-[#555]" 
          />
          <NumberField.Increment className="flex size-8 items-center justify-center rounded-sm text-[#888] hover:bg-[#222] hover:text-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[#000] active:shadow-none transition-all cursor-pointer outline-none">
            <PlusIcon className="size-4 pointer-events-none" />
          </NumberField.Increment>
        </NumberField.Group>

        <div
          className="relative inline-flex p-[var(--spacing-track-padding)] rounded-md analog-surface-recess overflow-hidden"
          style={lightingStyle}
        >
          <div className="absolute inset-[2px] rounded-[4px] bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,1)]" />
          <NumberField.ScrubArea 
            ref={scrubAreaRef}
            direction="vertical" 
            pixelSensitivity={3}
            className="relative w-32 h-48 cursor-ns-resize select-none overflow-hidden rounded-md bg-[#111] shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
            style={{ perspective: 800 }}
          >
            <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-50">
               <CursorGrowIcon className="text-white fill-black" />
            </NumberField.ScrubAreaCursor>

            <div className="analog-wheel-lighting" />

            <div className="absolute top-1/2 left-0 w-3 h-[4px] -translate-y-1/2 bg-[var(--color-amber-bg)] z-10 pointer-events-none shadow-[0_0_10px_var(--color-amber-glow)] border-y border-[#111]" />
            <div className="absolute top-1/2 right-0 w-3 h-[4px] -translate-y-1/2 bg-[var(--color-amber-bg)] z-10 pointer-events-none shadow-[0_0_10px_var(--color-amber-glow)] border-y border-[#111]" />
            
            {/* Center glass reading line */}
            <div className="absolute top-1/2 left-0 right-0 h-[24px] -translate-y-1/2 border-y border-white/10 bg-white/5 z-10 pointer-events-none mix-blend-screen" />

            {/* Rendered Cylinder */}
            <motion.div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ 
                transformStyle: 'preserve-3d',
                rotateX: rotation 
              }}
            >
              {/* Render 40 ridges around the entire cylinder for realism */}
              {[...Array(40)].map((_, i) => {
                const angle = (i / 40) * 360;
                const radius = 100;
                
                // Paint every 10th ridge with a white stripe for speed reference
                const isMarked = i % 10 === 0;

                return (
                  <div
                    key={`ridge-${i}`}
                    className="absolute top-1/2 left-0 w-full h-[12px] -translate-y-1/2 flex items-center justify-center select-none"
                    style={{
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      transform: `rotateX(${angle}deg) translateZ(${radius}px)`, 
                    }}
                  >
                    <div 
                      className="absolute inset-x-2 inset-y-[1px] rounded-[1.5px] border-b border-[#000]"
                      style={{
                        background: isMarked 
                          ? `linear-gradient(calc(var(--analog-light-angle-wheel, 180deg) - 90deg), rgba(221, 221, 221, calc(0.3 + 0.7 * var(--analog-light-power, 1))), rgba(153, 153, 153, 1))` 
                          : `linear-gradient(calc(var(--analog-light-angle-wheel, 180deg) - 90deg), rgba(42, 42, 42, calc(0.3 + 0.7 * var(--analog-light-power, 1))), rgba(17, 17, 17, 1))`
                      }}
                    />
                  </div>
                );
              })}
            </motion.div>
          </NumberField.ScrubArea>
        </div>
      </NumberField.Root>
    );
  }
);
AnalogWheelNumber.displayName = 'AnalogWheelNumber';

function CursorGrowIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}
