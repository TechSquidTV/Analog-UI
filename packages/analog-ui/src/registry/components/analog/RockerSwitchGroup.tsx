import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogOrientation } from './orientation';
import { Toggle, type ToggleProps } from './Toggle';
import type { IndicatorColor } from './Indicator';

type RockerSwitchVariant = 'chrome' | 'black';

interface RockerSwitchGroupContextValue {
  variant?: RockerSwitchVariant;
  switchOrientation: AnalogOrientation;
  leftLed: IndicatorColor;
  rightLed: IndicatorColor;
}

const RockerSwitchGroupContext = React.createContext<RockerSwitchGroupContextValue | undefined>(
  undefined,
);

export interface RockerSwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: AnalogOrientation;
  switchOrientation?: AnalogOrientation;
  variant?: RockerSwitchVariant;
  leftLed?: IndicatorColor;
  rightLed?: IndicatorColor;
  lighting?: AnalogLightingConfig<'track' | 'surface' | 'thumb' | 'lens'>;
}

export interface RockerSwitchGroupItemProps extends Omit<ToggleProps, 'className'> {
  label?: React.ReactNode;
  labelPosition?: 'start' | 'end' | 'top' | 'bottom';
  className?: string;
  toggleClassName?: string;
}

export const RockerSwitchGroup = React.forwardRef<HTMLDivElement, RockerSwitchGroupProps>(
  (
    {
      className,
      layout = 'horizontal',
      switchOrientation = 'horizontal',
      variant,
      leftLed = 'amber',
      rightLed = 'green',
      lighting,
      style,
      ...props
    },
    ref,
  ) => {
    const lightingStyle = useAnalogLighting(['track', 'surface', 'thumb', 'lens'], lighting);
    const contextValue = React.useMemo<RockerSwitchGroupContextValue>(
      () => ({
        variant,
        switchOrientation,
        leftLed,
        rightLed,
      }),
      [leftLed, rightLed, switchOrientation, variant],
    );

    return (
      <RockerSwitchGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex min-w-0 shrink-0 rounded-[var(--analog-radius-panel)] analog-surface-recess p-3',
            layout === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-3',
            className,
          )}
          style={{ ...lightingStyle, ...style }}
          {...props}
        />
      </RockerSwitchGroupContext.Provider>
    );
  },
);

RockerSwitchGroup.displayName = 'RockerSwitchGroup';

export const RockerSwitchGroupItem = React.forwardRef<HTMLDivElement, RockerSwitchGroupItemProps>(
  (
    {
      className,
      toggleClassName,
      label,
      labelPosition = 'top',
      orientation,
      variant,
      leftLed,
      rightLed,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(RockerSwitchGroupContext);
    const resolvedOrientation = orientation ?? context?.switchOrientation ?? 'horizontal';
    const resolvedVariant = variant ?? context?.variant;
    const resolvedLeftLed = leftLed ?? context?.leftLed ?? 'amber';
    const resolvedRightLed = rightLed ?? context?.rightLed ?? 'green';
    const isLabelInline = labelPosition === 'start' || labelPosition === 'end';
    const shouldLabelRenderFirst = labelPosition === 'start' || labelPosition === 'top';

    const labelNode = label ? (
      <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.22em] text-[var(--analog-telemetry-label)]">
        {label}
      </span>
    ) : null;
    const toggleNode = (
      <Toggle
        className={toggleClassName}
        orientation={resolvedOrientation}
        variant={resolvedVariant}
        leftLed={resolvedLeftLed}
        rightLed={resolvedRightLed}
        {...props}
      />
    );

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center',
          isLabelInline ? 'gap-3' : 'flex-col gap-2',
          className,
        )}
      >
        {shouldLabelRenderFirst ? labelNode : toggleNode}
        {shouldLabelRenderFirst ? toggleNode : labelNode}
      </div>
    );
  },
);

RockerSwitchGroupItem.displayName = 'RockerSwitchGroupItem';
