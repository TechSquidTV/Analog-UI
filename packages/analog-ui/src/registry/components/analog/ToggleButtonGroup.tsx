import * as React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { Indicator, type IndicatorColor } from './Indicator';
import type { AnalogOrientation } from './orientation';
import { SquarePlunger } from './SquarePlunger';

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

interface ToggleButtonGroupContextValue {
  variant?: ToggleButtonVariant;
  indicatorColor: IndicatorColor;
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
  indicatorColor?: IndicatorColor;
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
  indicatorColor?: IndicatorColor;
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
      indicatorColor = 'green',
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
    const lightingStyle = useAnalogLighting(['track', 'surface', 'thumb', 'lens'], lighting);
    const contextValue = React.useMemo<ToggleButtonGroupContextValue>(
      () => ({
        variant,
        indicatorColor,
        indicatorActive,
        extrusionLayers,
        itemHeight,
      }),
      [extrusionLayers, indicatorActive, indicatorColor, itemHeight, variant],
    );

    return (
      <ToggleButtonGroupContext.Provider value={contextValue}>
        <BaseToggleGroup
          ref={ref}
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

            if (!allowEmpty && !selectedValue) return;
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
      indicatorColor,
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
    const internalRef = React.useRef<ToggleButtonGroupElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'thumb', 'lens'], lighting);
    const resolvedVariant = variant ?? context?.variant;
    const resolvedIndicatorColor = indicatorColor ?? context?.indicatorColor ?? 'green';
    const resolvedIndicatorActive = indicatorActive ?? context?.indicatorActive ?? 'auto';
    const resolvedExtrusionLayers = extrusionLayers ?? context?.extrusionLayers ?? 32;
    const resolvedHeight = height ?? context?.itemHeight ?? '3.5rem';

    const renderItem = React.useCallback(
      (renderProps: ToggleButtonGroupItemRenderProps, state: BaseToggle.State) => {
        const isIndicatorOn =
          resolvedIndicatorActive === 'always' ||
          (resolvedIndicatorActive === 'auto' && state.pressed);
        const indicator =
          resolvedIndicatorColor !== 'none' ? (
            <div className="absolute right-0.5 top-[-3px]">
              <Indicator
                size="xs"
                color={resolvedIndicatorColor}
                isOn={isIndicatorOn}
                disableBezel
              />
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
        resolvedIndicatorColor,
        resolvedVariant,
        target,
        type,
      ],
    );

    return (
      <div
        className={cn('relative inline-flex shrink-0 items-center justify-center p-0', className)}
        style={{
          ...lightingStyle,
          width,
          height: resolvedHeight,
          perspective: '2400px',
        }}
      >
        <BaseToggle
          ref={mergedRef as React.Ref<HTMLButtonElement>}
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
