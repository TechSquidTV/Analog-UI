import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { Indicator, type IndicatorColor } from './Indicator';
import { SquarePlunger } from './SquarePlunger';

export interface PushToggleProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Toggle>,
  'height' | 'width'
> {
  variant?: 'chrome' | 'black';
  indicatorColor?: IndicatorColor;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb' | 'lens'>;
  extrusionLayers?: number;
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
}

type TogglePressedChangeHandler = NonNullable<
  React.ComponentPropsWithoutRef<typeof Toggle>['onPressedChange']
>;

const sizingClassName =
  'pointer-events-none invisible flex h-full min-h-0 min-w-11 items-center justify-center px-5 py-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase';

export const PushToggle = React.forwardRef<HTMLButtonElement, PushToggleProps>(
  (
    {
      className,
      variant,
      indicatorColor = 'none',
      lighting,
      extrusionLayers = 32,
      width,
      height,
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
    const resolvedHeight = height ?? '3.5rem';
    const shouldRenderSizer = width === undefined;

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
          'relative inline-flex min-w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
          className,
        )}
        style={{
          ...lightingStyle,
          width,
          height: resolvedHeight,
          perspective: '2400px',
        }}
      >
        {shouldRenderSizer ? (
          <span aria-hidden="true" className={sizingClassName}>
            {children}
          </span>
        ) : null}
        <Toggle
          ref={mergedRef}
          className="absolute inset-1.5 appearance-none border-none bg-transparent p-0 outline-none select-none"
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

PushToggle.displayName = 'PushToggle';
