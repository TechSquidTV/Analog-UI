import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { SquarePlunger, type SquarePlungerVariant } from './SquarePlunger';
import type { AnalogOrientation } from './orientation';
import type { AnalogTone } from './tone';

export type CheckboxVariant = SquarePlungerVariant;
export type CheckboxLabelPosition = 'start' | 'end' | 'top' | 'bottom';

type BaseCheckboxRootProps = React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>;
type BaseCheckboxGroupProps = React.ComponentPropsWithoutRef<typeof BaseCheckboxGroup>;

interface CheckboxContextValue {
  variant?: CheckboxVariant;
  tone?: AnalogTone;
  itemSize?: React.CSSProperties['width'];
  labelPosition?: CheckboxLabelPosition;
  extrusionLayers?: number;
}

const CheckboxContext = React.createContext<CheckboxContextValue | undefined>(undefined);

export interface CheckboxProps extends Omit<
  BaseCheckboxRootProps,
  'children' | 'className' | 'nativeButton' | 'render' | 'style'
> {
  variant?: CheckboxVariant;
  tone?: AnalogTone;
  size?: React.CSSProperties['width'];
  labelPosition?: CheckboxLabelPosition;
  extrusionLayers?: number;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb'>;
  className?: string;
  controlClassName?: string;
  labelClassName?: string;
  style?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface CheckboxGroupProps extends Omit<
  BaseCheckboxGroupProps,
  'className' | 'render' | 'style'
> {
  orientation?: AnalogOrientation;
  variant?: CheckboxVariant;
  tone?: AnalogTone;
  itemSize?: React.CSSProperties['width'];
  itemLabelPosition?: CheckboxLabelPosition;
  extrusionLayers?: number;
  lighting?: AnalogLightingConfig<'track' | 'surface' | 'thumb'>;
  className?: string;
  style?: React.CSSProperties;
}

const checkboxBloomScale = 'var(--analog-bloom-strength, 0.7) * 1.428571';

const activeCheckboxFaceStyle: React.CSSProperties = {
  background:
    'radial-gradient(circle at 50% 48%, var(--analog-emissive-core) 0%, color-mix(in oklch, var(--analog-emissive-core) 44%, var(--analog-emissive-base) 56%) 34%, var(--analog-emissive-base) 68%, color-mix(in oklch, var(--analog-emissive-base) 72%, var(--analog-emissive-edge) 28%) 100%)',
  boxShadow: `inset 0 0 calc(7px * ${checkboxBloomScale}) color-mix(in oklch, var(--analog-emissive-glow) 16%, transparent), 0 0 calc(8px * ${checkboxBloomScale}) color-mix(in oklch, var(--analog-emissive-glow) 28%, transparent), 0 0 calc(14px * ${checkboxBloomScale}) color-mix(in oklch, var(--analog-emissive-glow) 16%, transparent)`,
};

const labelPositionClassNames: Record<CheckboxLabelPosition, string> = {
  start: 'flex-row items-center',
  end: 'flex-row items-center',
  top: 'flex-col items-center text-center',
  bottom: 'flex-col items-center text-center',
};

function isLabelFirst(position: CheckboxLabelPosition) {
  return position === 'start' || position === 'top';
}

function isPressKey(key: string) {
  return key === ' ' || key === 'Enter';
}

export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  (
    {
      className,
      controlClassName,
      labelClassName,
      style,
      controlStyle,
      variant,
      tone,
      size,
      labelPosition,
      extrusionLayers,
      lighting,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(CheckboxContext);
    const resolvedVariant = variant ?? context?.variant ?? 'rubber';
    const resolvedTone = tone ?? context?.tone ?? 'accent';
    const resolvedSize = size ?? context?.itemSize ?? '2.75rem';
    const resolvedLabelPosition = labelPosition ?? context?.labelPosition ?? 'end';
    const resolvedExtrusionLayers = extrusionLayers ?? context?.extrusionLayers ?? 18;
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb'], lighting);
    const [isPressing, setIsPressing] = React.useState(false);

    const labelNode = children ? (
      <span
        data-slot="checkbox-label"
        className={cn(
          'min-w-0 text-[11px] font-semibold tracking-[0.18em] text-[var(--analog-control-foreground-muted)] uppercase',
          labelClassName,
        )}
      >
        {children}
      </span>
    ) : null;

    const controlNode = (
      <span
        data-slot="checkbox-control-shell"
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-[var(--analog-radius-shell)] analog-surface-recess p-0.5',
          controlClassName,
        )}
        style={{
          ...lightingStyle,
          width: resolvedSize,
          height: resolvedSize,
          perspective: '1800px',
          ...controlStyle,
        }}
      >
        <BaseCheckbox.Root
          ref={ref}
          disabled={disabled}
          nativeButton={false}
          render={(rootProps, state) => {
            const isActive = state.checked || state.indeterminate;
            const canPress = !state.disabled && !state.readOnly;

            const handlePointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
              rootProps.onPointerDown?.(event);

              if (canPress && event.button === 0 && !event.defaultPrevented) {
                setIsPressing(true);
              }
            };

            const handlePointerUp: React.PointerEventHandler<HTMLElement> = (event) => {
              rootProps.onPointerUp?.(event);
              setIsPressing(false);
            };

            const handlePointerCancel: React.PointerEventHandler<HTMLElement> = (event) => {
              rootProps.onPointerCancel?.(event);
              setIsPressing(false);
            };

            const handlePointerLeave: React.PointerEventHandler<HTMLElement> = (event) => {
              rootProps.onPointerLeave?.(event);
              setIsPressing(false);
            };

            const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
              if (canPress && isPressKey(event.key) && !event.repeat) {
                setIsPressing(true);
              }

              rootProps.onKeyDown?.(event);
            };

            const handleKeyUp: React.KeyboardEventHandler<HTMLElement> = (event) => {
              rootProps.onKeyUp?.(event);

              if (isPressKey(event.key)) {
                setIsPressing(false);
              }
            };

            const handleBlur: React.FocusEventHandler<HTMLElement> = (event) => {
              rootProps.onBlur?.(event);
              setIsPressing(false);
            };

            return (
              <span
                {...rootProps}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerLeave}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onBlur={handleBlur}
                data-slot="checkbox-root"
                className={cn(
                  'absolute inset-0.5 appearance-none rounded-[calc(var(--analog-radius-window)*0.9)] border-none bg-transparent p-0 outline-none select-none',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--analog-emissive-glow)]',
                  'data-[disabled]:cursor-not-allowed',
                  rootProps.className,
                )}
                style={{
                  ...rootProps.style,
                  transformStyle: 'preserve-3d',
                }}
              >
                <span
                  data-slot="checkbox-plunger"
                  className="pointer-events-none absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <SquarePlunger
                    variant={resolvedVariant}
                    isPressed={isPressing}
                    extrusionLayers={resolvedExtrusionLayers}
                    faceStyle={isActive ? activeCheckboxFaceStyle : undefined}
                  />
                </span>
              </span>
            );
          }}
          {...props}
        />
      </span>
    );

    const wrapperClassName = cn(
      'inline-flex min-w-0 gap-3',
      labelPositionClassNames[resolvedLabelPosition],
      disabled && 'cursor-not-allowed opacity-60',
      className,
    );

    if (children) {
      return (
        <label
          data-slot="checkbox"
          data-analog-tone={resolvedTone}
          className={wrapperClassName}
          style={style}
        >
          {isLabelFirst(resolvedLabelPosition) ? labelNode : null}
          {controlNode}
          {isLabelFirst(resolvedLabelPosition) ? null : labelNode}
        </label>
      );
    }

    return (
      <span
        data-slot="checkbox"
        data-analog-tone={resolvedTone}
        className={wrapperClassName}
        style={style}
      >
        {controlNode}
      </span>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      className,
      orientation = 'vertical',
      variant,
      tone,
      itemSize,
      itemLabelPosition = 'end',
      extrusionLayers = 18,
      lighting,
      style,
      ...props
    },
    ref,
  ) => {
    const lightingStyle = useAnalogLighting(['track', 'surface', 'thumb'], lighting);
    const contextValue = React.useMemo<CheckboxContextValue>(
      () => ({
        variant,
        tone,
        itemSize,
        labelPosition: itemLabelPosition,
        extrusionLayers,
      }),
      [extrusionLayers, itemLabelPosition, itemSize, tone, variant],
    );

    return (
      <CheckboxContext.Provider value={contextValue}>
        <BaseCheckboxGroup
          ref={ref}
          data-slot="checkbox-group"
          className={cn(
            'inline-flex min-w-0 shrink-0 rounded-[var(--analog-radius-panel)] analog-surface-recess p-2',
            orientation === 'vertical' ? 'flex-col gap-2.5' : 'flex-row flex-wrap gap-3',
            className,
          )}
          style={{ ...lightingStyle, ...style }}
          {...props}
        />
      </CheckboxContext.Provider>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
