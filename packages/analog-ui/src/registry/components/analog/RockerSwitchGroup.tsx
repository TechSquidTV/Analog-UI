import * as React from 'react';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogOrientation } from './orientation';
import { Toggle, type ToggleProps } from './Toggle';
import type { AnalogTone } from './tone';

type RockerSwitchVariant = 'chrome' | 'black';

interface RockerSwitchGroupContextValue {
  variant?: RockerSwitchVariant;
  switchOrientation: AnalogOrientation;
  leftIndicatorTone?: AnalogTone;
  rightIndicatorTone?: AnalogTone;
}

const RockerSwitchGroupContext = React.createContext<RockerSwitchGroupContextValue | undefined>(
  undefined,
);

export interface RockerSwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: AnalogOrientation;
  switchOrientation?: AnalogOrientation;
  variant?: RockerSwitchVariant;
  leftIndicatorTone?: AnalogTone;
  rightIndicatorTone?: AnalogTone;
  lighting?: AnalogLightingConfig<'track' | 'surface' | 'thumb' | 'lens'>;
}

export interface RockerSwitchGroupItemProps extends Omit<ToggleProps, 'className'> {
  label?: React.ReactNode;
  labelPosition?: 'start' | 'end' | 'top' | 'bottom';
  className?: string;
  toggleClassName?: string;
}

function getAccessibleLabelText(label: React.ReactNode) {
  if (typeof label === 'string' || typeof label === 'number') {
    return String(label);
  }

  return undefined;
}

export const RockerSwitchGroup = React.forwardRef<HTMLDivElement, RockerSwitchGroupProps>(
  (
    {
      className,
      layout = 'horizontal',
      switchOrientation = 'horizontal',
      variant,
      leftIndicatorTone = 'warning',
      rightIndicatorTone = 'success',
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
    const contextValue = React.useMemo<RockerSwitchGroupContextValue>(
      () => ({
        variant,
        switchOrientation,
        leftIndicatorTone,
        rightIndicatorTone,
      }),
      [leftIndicatorTone, rightIndicatorTone, switchOrientation, variant],
    );

    return (
      <RockerSwitchGroupContext.Provider value={contextValue}>
        <div
          ref={mergedRef}
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
      leftIndicatorTone,
      rightIndicatorTone,
      leftAriaLabel,
      rightAriaLabel,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(RockerSwitchGroupContext);
    const resolvedOrientation = orientation ?? context?.switchOrientation ?? 'horizontal';
    const resolvedVariant = variant ?? context?.variant;
    const resolvedLeftIndicatorTone = leftIndicatorTone ?? context?.leftIndicatorTone ?? 'warning';
    const resolvedRightIndicatorTone =
      rightIndicatorTone ?? context?.rightIndicatorTone ?? 'success';
    const isLabelInline = labelPosition === 'start' || labelPosition === 'end';
    const shouldLabelRenderFirst = labelPosition === 'start' || labelPosition === 'top';
    const accessibleLabel = getAccessibleLabelText(label);
    const leftPositionLabel = resolvedOrientation === 'vertical' ? 'top' : 'left';
    const rightPositionLabel = resolvedOrientation === 'vertical' ? 'bottom' : 'right';
    const resolvedLeftAriaLabel =
      leftAriaLabel ??
      (accessibleLabel ? `${accessibleLabel} ${leftPositionLabel} option` : undefined);
    const resolvedRightAriaLabel =
      rightAriaLabel ??
      (accessibleLabel ? `${accessibleLabel} ${rightPositionLabel} option` : undefined);

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
        leftIndicatorTone={resolvedLeftIndicatorTone}
        rightIndicatorTone={resolvedRightIndicatorTone}
        leftAriaLabel={resolvedLeftAriaLabel}
        rightAriaLabel={resolvedRightAriaLabel}
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
