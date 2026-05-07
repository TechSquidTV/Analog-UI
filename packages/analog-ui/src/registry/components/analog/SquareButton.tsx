import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { SquarePlunger } from './SquarePlunger';

export interface SquareButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb'>;
  extrusionLayers?: number;
}

type ButtonMouseDownEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof Button>['onMouseDown']>
>[0];

type ButtonMouseUpEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof Button>['onMouseUp']>
>[0];

type ButtonMouseLeaveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof Button>['onMouseLeave']>
>[0];

export const SquareButton = React.forwardRef<HTMLButtonElement, SquareButtonProps>(
  (
    {
      className,
      variant,
      lighting,
      extrusionLayers = 32,
      children,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb'], lighting);

    const [isPressed, setIsPressed] = React.useState(false);

    const handleMouseDown = (e: ButtonMouseDownEvent) => {
      setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp = (e: ButtonMouseUpEvent) => {
      setIsPressed(false);
      onMouseUp?.(e);
    };

    const handleMouseLeave = (e: ButtonMouseLeaveEvent) => {
      setIsPressed(false);
      onMouseLeave?.(e);
    };

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
        <Button
          ref={mergedRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="relative size-full appearance-none border-none bg-transparent p-0 outline-none select-none"
          style={{ transformStyle: 'preserve-3d' }}
          {...props}
        >
          <SquarePlunger
            variant={variant}
            isPressed={isPressed}
            extrusionLayers={extrusionLayers}
          >
            {children}
          </SquarePlunger>
        </Button>
      </div>
    );
  },
);

SquareButton.displayName = 'SquareButton';
