import * as React from 'react';
import { cn } from '@/lib/utils';
import { NumberField } from '@base-ui/react/number-field';
import { createChangeEventDetails } from '@base-ui/react/internals/createBaseUIEventDetails';
import { motion, useMotionValue, animate } from 'motion/react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useWheelInput } from '../../hooks/use-wheel-input';
import {
  useAnalogLightStyle,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';
import { getWheelDirectionFactor, type WheelDirection } from './wheel-interaction';

const wheelIndicatorStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-led-amber-base)',
  borderColor: 'var(--analog-control-surface-strong)',
  boxShadow: '0 0 10px var(--analog-led-amber-glow)',
};

const wheelReadoutGlassStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-control-glass)',
  borderColor: 'var(--analog-control-glass-border)',
};

function getWheelRidgeBackground(isMarked: boolean) {
  return isMarked
    ? `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%) 0%, var(--analog-surface-metal-mid) 52%, var(--analog-surface-metal-lo) 100%)`
    : `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 74%, white 10%) 0%, var(--analog-surface-onyx-mid) 48%, var(--analog-surface-onyx-lo) 100%)`;
}

export interface WheelNumberProps extends React.ComponentPropsWithoutRef<typeof NumberField.Root> {
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'wheel'>;
  /**
   * Which drag direction increases the numeric value.
   * @default 'down'
   */
  grabDirection?: WheelDirection;
  /**
   * Which wheel-scroll direction increases the numeric value.
   * @default 'down'
   */
  scrollDirection?: WheelDirection;
}

export const WheelNumber = React.forwardRef<HTMLDivElement, WheelNumberProps>(
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
      style,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0);
    const actualValue = value !== undefined ? (value as number) : internalValue;

    const rotation = useMotionValue(0);
    const scrubAreaRef = React.useRef<HTMLDivElement>(null);
    const scrollDirectionFactor = getWheelDirectionFactor(scrollDirection);
    const wheelLighting: AnalogLightingConfig<'surface' | 'track' | 'wheel'> = {
      track: { travel: 1 },
      wheel: { travel: 0.36 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['surface', 'track', 'wheel'], wheelLighting);
    const wheelFaceStyle = useAnalogLightStyle(
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

    useWheelInput(
      scrubAreaRef,
      React.useCallback(
        (e, deltaDirection) => {
          const delta = deltaDirection * scrollDirectionFactor * getStepAmount(e);
          const newVal = clampValue(actualValue + delta);
          const direction = delta > 0 ? 1 : -1;

          if (newVal !== actualValue) {
            if (value === undefined) setInternalValue(newVal);
            onValueChange?.(
              newVal,
              createChangeEventDetails('wheel', e, scrubAreaRef.current, { direction }),
            );
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
        className={cn('flex w-full min-w-0 max-w-[8rem] flex-col items-stretch gap-4', className)}
        style={{
          ...lightingStyle,
          ...style,
        }}
      >
        <NumberField.Group
          className="z-20 flex w-full min-w-0 items-center rounded-[var(--analog-radius-recess)] border p-1"
          style={{
            borderColor: 'var(--analog-control-border)',
            backgroundColor: 'var(--analog-control-surface)',
            boxShadow:
              `inset calc(sin(var(--analog-light-angle-surface, 180deg)) * -1px) calc(cos(var(--analog-light-angle-surface, 180deg)) * 1px) 3px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), ` +
              `calc(sin(var(--analog-light-angle-surface, 180deg)) * 1px) calc(cos(var(--analog-light-angle-surface, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.04 * var(--analog-light-power, 1)))`,
          }}
        >
          <NumberField.Decrement className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--analog-radius-micro)] text-[var(--analog-control-foreground-muted)] transition-all outline-none hover:bg-[var(--analog-control-surface-strong)] hover:text-[var(--analog-control-foreground)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[var(--analog-surface-cavity-strong)] active:shadow-none">
            <MinusIcon className="size-4 pointer-events-none" />
          </NumberField.Decrement>
          <NumberField.Input className="min-w-0 flex-1 bg-transparent px-2 text-center font-mono text-sm font-bold text-[var(--analog-control-foreground)] tabular-nums outline-none selection:bg-[var(--analog-control-selection)] selection:text-[var(--analog-control-foreground)]" />
          <NumberField.Increment className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--analog-radius-micro)] text-[var(--analog-control-foreground-muted)] transition-all outline-none hover:bg-[var(--analog-control-surface-strong)] hover:text-[var(--analog-control-foreground)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[var(--analog-surface-cavity-strong)] active:shadow-none">
            <PlusIcon className="size-4 pointer-events-none" />
          </NumberField.Increment>
        </NumberField.Group>

        <div
          className="relative flex w-full min-w-0 overflow-hidden rounded-[var(--analog-radius-recess)] p-[var(--spacing-track-padding)] analog-surface-recess"
          style={{ ...lightingStyle, ...wheelFaceStyle }}
        >
          <div className="absolute inset-[2px] rounded-[var(--analog-wheel-slot-radius)] analog-track-slot" />
          <NumberField.ScrubArea
            ref={scrubAreaRef}
            direction="vertical"
            pixelSensitivity={3}
            className="relative h-48 w-full min-w-0 cursor-ns-resize select-none overflow-hidden rounded-[var(--analog-wheel-slot-radius)] analog-track-slot analog-track-slot-deep"
            style={{
              perspective: 800,
            }}
          >
            <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-50">
              <CursorGrowIcon className="fill-[var(--analog-surface-cavity-strong)] text-[var(--analog-control-foreground)]" />
            </NumberField.ScrubAreaCursor>

            <div className="analog-wheel-lighting" />

            <div
              className="absolute top-1/2 left-0 z-10 h-[4px] w-3 -translate-y-1/2 border-y pointer-events-none"
              style={wheelIndicatorStyle}
            />
            <div
              className="absolute top-1/2 right-0 z-10 h-[4px] w-3 -translate-y-1/2 border-y pointer-events-none"
              style={wheelIndicatorStyle}
            />

            {/* Center glass reading line */}
            <div
              className="absolute top-1/2 left-0 right-0 z-10 h-[24px] -translate-y-1/2 border-y pointer-events-none mix-blend-screen"
              style={wheelReadoutGlassStyle}
            />

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
                      className="absolute inset-x-2 inset-y-[1px] rounded-[1.5px] border-b"
                      style={{
                        borderColor:
                          'color-mix(in oklch, var(--analog-control-border-strong) 80%, black 20%)',
                        background: getWheelRidgeBackground(isMarked),
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
WheelNumber.displayName = 'WheelNumber';

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
