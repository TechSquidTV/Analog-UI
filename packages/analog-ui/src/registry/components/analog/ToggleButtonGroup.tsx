import * as React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { Indicator } from './Indicator';
import type { AnalogOrientation } from './orientation';
import { SquarePlunger } from './SquarePlunger';
import type { AnalogTone } from './tone';

type ToggleButtonGroupValueChangeHandler = NonNullable<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>['onValueChange']
>;
type ToggleButtonGroupChangeDetails = Parameters<ToggleButtonGroupValueChangeHandler>[1];
type ToggleButtonGroupElement = HTMLButtonElement | HTMLAnchorElement;
type ToggleButtonGroupItemRenderProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

type ToggleIndicatorState = 'auto' | 'always' | 'never';
type ToggleButtonVariant = 'chrome' | 'black';

const itemSizingClassName =
  'pointer-events-none invisible flex h-full min-h-0 min-w-11 items-center justify-center px-5 py-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase';

interface ToggleButtonGroupContextValue {
  variant?: ToggleButtonVariant;
  indicatorTone?: AnalogTone;
  indicatorActive: ToggleIndicatorState;
  extrusionLayers: number;
  itemHeight: React.CSSProperties['height'];
}

const ToggleButtonGroupContext = React.createContext<ToggleButtonGroupContextValue | undefined>(
  undefined,
);

export interface ToggleButtonGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>,
  'className' | 'defaultValue' | 'multiple' | 'onValueChange' | 'orientation' | 'style' | 'value'
> {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: ToggleButtonGroupChangeDetails) => void;
  orientation?: AnalogOrientation;
  variant?: ToggleButtonVariant;
  indicatorTone?: AnalogTone;
  indicatorActive?: ToggleIndicatorState;
  allowEmpty?: boolean;
  extrusionLayers?: number;
  itemHeight?: React.CSSProperties['height'];
  lighting?: AnalogLightingConfig<'track' | 'surface' | 'thumb' | 'lens'>;
  style?: React.CSSProperties;
}

export interface ToggleButtonGroupItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggle>,
  'className' | 'render' | 'style'
> {
  value: string;
  href?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  variant?: ToggleButtonVariant;
  indicatorTone?: AnalogTone;
  indicatorActive?: ToggleIndicatorState;
  extrusionLayers?: number;
  lighting?: AnalogLightingConfig<'surface' | 'thumb' | 'lens'>;
  className?: string;
  children?: React.ReactNode;
}

export const ToggleButtonGroup = React.forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      orientation = 'horizontal',
      variant,
      indicatorTone,
      indicatorActive = 'auto',
      allowEmpty = false,
      extrusionLayers = 32,
      itemHeight = '3.5rem',
      lighting,
      style,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['track', 'surface', 'thumb', 'lens'], lighting, {
      targetRef: internalRef,
    });
    const contextValue = React.useMemo<ToggleButtonGroupContextValue>(
      () => ({
        variant,
        indicatorTone,
        indicatorActive,
        extrusionLayers,
        itemHeight,
      }),
      [extrusionLayers, indicatorActive, indicatorTone, itemHeight, variant],
    );

    return (
      <ToggleButtonGroupContext.Provider value={contextValue}>
        <BaseToggleGroup
          ref={mergedRef}
          className={cn(
            'inline-flex min-w-0 shrink-0 rounded-[var(--analog-radius-panel)] analog-surface-recess p-1.5',
            orientation === 'vertical' ? 'flex-col gap-1.5' : 'flex-row flex-wrap gap-1.5',
            className,
          )}
          orientation={orientation}
          value={value === undefined ? undefined : value ? [value] : []}
          defaultValue={defaultValue ? [defaultValue] : undefined}
          onValueChange={(nextValue, details) => {
            const selectedValue = nextValue[0] ?? '';

            if (!allowEmpty && !selectedValue) {
              details.cancel();
              return;
            }

            onValueChange?.(selectedValue, details);
          }}
          multiple={false}
          style={{ ...lightingStyle, ...style }}
          {...props}
        />
      </ToggleButtonGroupContext.Provider>
    );
  },
);

ToggleButtonGroup.displayName = 'ToggleButtonGroup';

export const ToggleButtonGroupItem = React.forwardRef<
  ToggleButtonGroupElement,
  ToggleButtonGroupItemProps
>(
  (
    {
      className,
      value,
      href,
      target,
      rel,
      download,
      width,
      height,
      variant,
      indicatorTone,
      indicatorActive,
      extrusionLayers,
      lighting,
      children,
      nativeButton,
      type,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(ToggleButtonGroupContext);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const internalRef = React.useRef<ToggleButtonGroupElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'thumb', 'lens'], lighting, {
      targetRef: containerRef,
    });
    const resolvedVariant = variant ?? context?.variant;
    const resolvedIndicatorTone = indicatorTone ?? context?.indicatorTone;
    const resolvedIndicatorActive = indicatorActive ?? context?.indicatorActive ?? 'auto';
    const resolvedExtrusionLayers = extrusionLayers ?? context?.extrusionLayers ?? 32;
    const resolvedHeight = height ?? context?.itemHeight ?? '3.5rem';
    const shouldRenderSizer = width === undefined;

    const renderItem = React.useCallback(
      (renderProps: ToggleButtonGroupItemRenderProps, state: BaseToggle.State) => {
        const isIndicatorOn =
          resolvedIndicatorActive === 'always' ||
          (resolvedIndicatorActive === 'auto' && state.pressed);
        const indicator = resolvedIndicatorTone ? (
          <div className="absolute right-0.5 top-[-3px]">
            <Indicator size="xs" tone={resolvedIndicatorTone} isOn={isIndicatorOn} disableBezel />
          </div>
        ) : null;
        const sharedClassName = cn(
          'relative size-full appearance-none border-none bg-transparent p-0 outline-none select-none',
          renderProps.className,
        );
        const sharedStyle = {
          ...renderProps.style,
          transformStyle: 'preserve-3d',
        } as React.CSSProperties;
        const content = (
          <SquarePlunger
            variant={resolvedVariant}
            isPressed={state.pressed}
            extrusionLayers={resolvedExtrusionLayers}
            indicator={indicator}
          >
            {children}
          </SquarePlunger>
        );

        if (href) {
          const {
            role: _role,
            type: _type,
            disabled: _disabled,
            ['aria-pressed']: _ariaPressed,
            ...anchorProps
          } = renderProps as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
            disabled?: boolean;
            type?: string;
            ref?: React.Ref<HTMLAnchorElement>;
          };

          return (
            <a
              {...anchorProps}
              href={disabled ? undefined : href}
              target={target}
              rel={rel}
              download={download}
              className={sharedClassName}
              style={sharedStyle}
            >
              {content}
            </a>
          );
        }

        const buttonProps = renderProps as React.ButtonHTMLAttributes<HTMLButtonElement> & {
          ref?: React.Ref<HTMLButtonElement>;
        };

        return (
          <button
            {...buttonProps}
            type={type ?? 'button'}
            disabled={disabled}
            className={sharedClassName}
            style={sharedStyle}
          >
            {content}
          </button>
        );
      },
      [
        children,
        disabled,
        download,
        href,
        rel,
        resolvedExtrusionLayers,
        resolvedIndicatorActive,
        resolvedIndicatorTone,
        resolvedVariant,
        target,
        type,
      ],
    );

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative inline-flex min-w-14 shrink-0 items-center justify-center p-0',
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
          <span aria-hidden="true" className={itemSizingClassName}>
            {children}
          </span>
        ) : null}
        <BaseToggle
          ref={mergedRef as React.Ref<HTMLButtonElement>}
          className="absolute inset-0"
          value={value}
          nativeButton={nativeButton ?? !href}
          disabled={disabled}
          render={renderItem}
          {...props}
        />
      </div>
    );
  },
);

ToggleButtonGroupItem.displayName = 'ToggleButtonGroupItem';
