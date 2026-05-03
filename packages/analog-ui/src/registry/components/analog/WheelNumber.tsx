import * as React from 'react';
import { cn } from '../../../lib/utils';
import { NumberField } from '@base-ui/react/number-field';
import { motion, useMotionValue, animate } from 'motion/react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useWheelScroll } from '../../hooks/use-wheel-scroll';
import {
  useAnalogLightEffect,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';
import { getWheelDirectionFactor, type AnalogWheelDirection } from './wheel-interaction';

export interface AnalogWheelNumberProps extends React.ComponentPropsWithoutRef<
  typeof NumberField.Root
> {
  lighting?: AnalogLightingConfig<'track' | 'wheel'>;
  /**
   * Which drag direction increases the numeric value.
   * @default 'down'
   */
  grabDirection?: AnalogWheelDirection;
  /**
   * Which wheel-scroll direction increases the numeric value.
   * @default 'down'
   */
  scrollDirection?: AnalogWheelDirection;
}

export const AnalogWheelNumber = React.forwardRef<HTMLDivElement, AnalogWheelNumberProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      lighting,
      step,
      min,
      max,
      smallStep = 0.1,
      largeStep = 10,
      grabDirection = 'down',
      scrollDirection = 'down',
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0);
    const actualValue = value !== undefined ? (value as number) : internalValue;

    const rotation = useMotionValue(0);
    const scrubAreaRef = React.useRef<HTMLDivElement>(null);
    const scrollDirectionFactor = getWheelDirectionFactor(scrollDirection);
    const wheelLighting: AnalogLightingConfig<'track' | 'wheel'> = {
      track: { travel: 1 },
      wheel: { travel: 0.36 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'wheel'], wheelLighting);
    const wheelFaceStyle = useAnalogLightEffect(
      'wheel',
      {
        varName: '--analog-light-angle-wheel-face',
      },
      wheelLighting.wheel,
    );

    React.useEffect(() => {
      // Rotate 18 degrees per value integer so higher values move deeper into the wheel.
      animate(rotation, actualValue * -18, { type: 'spring', stiffness: 400, damping: 40 });
    }, [actualValue, rotation]);

    const getStepAmount = React.useCallback(
      (event?: Event | { altKey?: boolean; shiftKey?: boolean }) => {
        const altKey = Boolean(event && 'altKey' in event && event.altKey);
        const shiftKey = Boolean(event && 'shiftKey' in event && event.shiftKey);
        if (altKey) return smallStep;
        if (shiftKey) return largeStep;
        return step !== undefined && step !== 'any' ? Number(step) : 1;
      },
      [largeStep, smallStep, step],
    );

    const clampValue = React.useCallback(
      (nextValue: number) => {
        let clampedValue = nextValue;
        if (min !== undefined) clampedValue = Math.max(min, clampedValue);
        if (max !== undefined) clampedValue = Math.min(max, clampedValue);
        return clampedValue;
      },
      [max, min],
    );

    useWheelScroll(
      scrubAreaRef,
      React.useCallback(
        (e, deltaDirection) => {
          const delta = deltaDirection * scrollDirectionFactor * getStepAmount(e);
          const newVal = clampValue(actualValue + delta);

          if (newVal !== actualValue) {
            if (value === undefined) setInternalValue(newVal);
            onValueChange?.(newVal, {} as any);
          }
        },
        [actualValue, clampValue, getStepAmount, scrollDirectionFactor, value, onValueChange],
      ),
    );

    return (
      <NumberField.Root
        ref={ref}
        value={actualValue}
        onValueChange={(val, details) => {
          if (val !== null) {
            const configuredDirection =
              details.reason === 'scrub'
                ? grabDirection
                : details.reason === 'wheel'
                  ? scrollDirection
                  : null;

            const nextValue =
              configuredDirection && details.direction
                ? clampValue(
                    actualValue +
                      getStepAmount(details.event) *
                        details.direction *
                        -getWheelDirectionFactor(configuredDirection),
                  )
                : val;

            if (value === undefined) setInternalValue(nextValue);
            onValueChange?.(nextValue, details);
          }
        }}
        step={step}
        min={min}
        max={max}
        smallStep={smallStep}
        largeStep={largeStep}
        {...props}
        className={cn('flex flex-col items-center gap-4', className)}
      >
        <NumberField.Group className="flex items-center rounded-md border border-[#333] bg-[#111] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] z-20">
          <NumberField.Decrement className="flex size-8 items-center justify-center rounded-sm text-[#888] hover:bg-[#222] hover:text-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[#000] active:shadow-none transition-all cursor-pointer outline-none">
            <MinusIcon className="size-4 pointer-events-none" />
          </NumberField.Decrement>
          <NumberField.Input className="w-16 bg-transparent text-center font-mono text-sm font-bold text-[#eee] tabular-nums outline-none selection:bg-[#555]" />
          <NumberField.Increment className="flex size-8 items-center justify-center rounded-sm text-[#888] hover:bg-[#222] hover:text-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[#000] active:shadow-none transition-all cursor-pointer outline-none">
            <PlusIcon className="size-4 pointer-events-none" />
          </NumberField.Increment>
        </NumberField.Group>

        <div
          className="relative inline-flex p-[var(--spacing-track-padding)] rounded-md analog-surface-recess overflow-hidden"
          style={{ ...lightingStyle, ...wheelFaceStyle }}
        >
          <div className="absolute inset-[2px] rounded-[4px] analog-track-slot" />
          <NumberField.ScrubArea
            ref={scrubAreaRef}
            direction="vertical"
            pixelSensitivity={3}
            className="relative w-32 h-48 cursor-ns-resize select-none overflow-hidden rounded-md analog-track-slot analog-track-slot-deep"
            style={{
              perspective: 800,
            }}
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
                rotateX: rotation,
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
                          ? `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), rgba(205, 205, 205, calc(0.2 + 0.32 * var(--analog-light-power, 1))) 0%, rgba(158, 158, 158, 0.96) 52%, rgba(126, 126, 126, 1) 100%)`
                          : `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), rgba(66, 66, 66, calc(0.18 + 0.34 * var(--analog-light-power, 1))) 0%, rgba(36, 36, 36, 0.94) 48%, rgba(17, 17, 17, 1) 100%)`,
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
  },
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
