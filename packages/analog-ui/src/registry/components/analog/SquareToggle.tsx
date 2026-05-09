import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { AnalogIndicator, type AnalogIndicatorColor } from './Indicator';
import { SquarePlunger } from './SquarePlunger';

export interface SquareToggleProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  variant?: 'chrome' | 'black';
  indicatorColor?: AnalogIndicatorColor;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb' | 'lens'>;
  extrusionLayers?: number;
}

export const SquareToggle = React.forwardRef<HTMLButtonElement, SquareToggleProps>(
  (
    {
      className,
      variant,
      indicatorColor = 'none',
      lighting,
      extrusionLayers = 32,
      children,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb', 'lens'], lighting);

    const isPressed = props.pressed ?? props.defaultPressed;

    return (
      <div
        className={cn(
          'relative inline-flex h-14 w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
          className,
        )}
        style={{
          ...lightingStyle,
          perspective: '2400px',
        }}
      >
        <Toggle
          ref={mergedRef}
          className="relative size-full appearance-none border-none bg-transparent p-0 outline-none select-none"
          style={{ transformStyle: 'preserve-3d' }}
          {...props}
        >
          <SquarePlunger
            variant={variant}
            isPressed={isPressed}
            extrusionLayers={extrusionLayers}
            indicator={
              indicatorColor !== 'none' && (
                <div className="absolute right-0.5 top-[-3px]">
                  <AnalogIndicator size="xs" color={indicatorColor} isOn={isPressed} disableBezel />
                </div>
              )
            }
          >
            {children}
          </SquarePlunger>
        </Toggle>
      </div>
    );
  },
);

SquareToggle.displayName = 'SquareToggle';
