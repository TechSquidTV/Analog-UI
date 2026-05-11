import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { Indicator, type IndicatorColor } from './Indicator';
import { SquarePlunger } from './SquarePlunger';

export interface SquareToggleProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  variant?: 'chrome' | 'black';
  indicatorColor?: IndicatorColor;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb' | 'lens'>;
  extrusionLayers?: number;
}

type TogglePressedChangeHandler = NonNullable<
  React.ComponentPropsWithoutRef<typeof Toggle>['onPressedChange']
>;

export const SquareToggle = React.forwardRef<HTMLButtonElement, SquareToggleProps>(
  (
    {
      className,
      variant,
      indicatorColor = 'none',
      lighting,
      extrusionLayers = 32,
      children,
      pressed,
      defaultPressed,
      onPressedChange,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb', 'lens'], lighting);

    const [uncontrolledPressed, setUncontrolledPressed] = React.useState(Boolean(defaultPressed));
    const isPressed = pressed ?? uncontrolledPressed;
    const handlePressedChange = React.useCallback<TogglePressedChangeHandler>(
      (nextPressed, details) => {
        if (pressed === undefined) {
          setUncontrolledPressed(nextPressed);
        }

        onPressedChange?.(nextPressed, details);
      },
      [onPressedChange, pressed],
    );

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
          pressed={pressed}
          defaultPressed={defaultPressed}
          onPressedChange={handlePressedChange}
          {...props}
        >
          <SquarePlunger
            variant={variant}
            isPressed={isPressed}
            extrusionLayers={extrusionLayers}
            indicator={
              indicatorColor !== 'none' && (
                <div className="absolute right-0.5 top-[-3px]">
                  <Indicator size="xs" color={indicatorColor} isOn={isPressed} disableBezel />
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
