import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { Indicator } from './Indicator';
import { SquarePlunger } from './SquarePlunger';
import type { AnalogTone } from './tone';

export interface PushToggleProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Toggle>,
  'height' | 'width' | 'className' | 'nativeButton' | 'render' | 'style'
> {
  variant?: 'chrome' | 'black';
  indicatorTone?: AnalogTone;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb' | 'lens'>;
  extrusionLayers?: number;
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  className?: string;
  controlClassName?: string;
  style?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
}

type PushToggleRenderProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

const sizingClassName =
  'pointer-events-none invisible flex h-full min-h-0 min-w-11 items-center justify-center px-5 py-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase';

export const PushToggle = React.forwardRef<HTMLButtonElement, PushToggleProps>(
  (
    {
      className,
      controlClassName,
      style,
      controlStyle,
      variant,
      indicatorTone,
      lighting,
      extrusionLayers = 32,
      width,
      height,
      children,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb', 'lens'], lighting);
    const resolvedHeight = height ?? '3.5rem';
    const shouldRenderSizer = width === undefined;

    const renderToggle = React.useCallback(
      (renderProps: PushToggleRenderProps, state: Toggle.State) => {
        const isPressed = state.pressed;
        const indicator = indicatorTone ? (
          <div data-slot="push-toggle-indicator" className="absolute right-0.5 top-[-3px]">
            <Indicator size="xs" tone={indicatorTone} isOn={isPressed} disableBezel />
          </div>
        ) : null;

        return (
          <button
            {...renderProps}
            data-slot="push-toggle-root"
            className={cn(
              'absolute inset-1.5 appearance-none border-none bg-transparent p-0 outline-none select-none',
              renderProps.className,
              controlClassName,
            )}
            style={{
              ...renderProps.style,
              ...controlStyle,
              transformStyle: 'preserve-3d',
            }}
          >
            <span
              data-slot="push-toggle-plunger"
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <SquarePlunger
                variant={variant}
                isPressed={isPressed}
                extrusionLayers={extrusionLayers}
                indicator={indicator}
              >
                {children}
              </SquarePlunger>
            </span>
          </button>
        );
      },
      [children, controlClassName, controlStyle, extrusionLayers, indicatorTone, variant],
    );

    return (
      <div
        data-slot="push-toggle"
        className={cn(
          'relative inline-flex min-w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
          className,
        )}
        style={{
          ...lightingStyle,
          ...style,
          width,
          height: resolvedHeight,
          perspective: '2400px',
        }}
      >
        {shouldRenderSizer ? (
          <span aria-hidden="true" data-slot="push-toggle-sizer" className={sizingClassName}>
            {children}
          </span>
        ) : null}
        <Toggle {...props} ref={mergedRef} nativeButton render={renderToggle} />
      </div>
    );
  },
);

PushToggle.displayName = 'PushToggle';
