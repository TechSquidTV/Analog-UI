import * as React from 'react';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { Indicator } from './Indicator';
import { RockerThumbSurface } from './RockerThumbSurface';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';
import type { AnalogOrientation } from './orientation';
import type { AnalogTone } from './tone';

type ToggleValue = 'left' | 'right';

export interface ToggleProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
> {
  variant?: 'chrome' | 'black';
  orientation?: AnalogOrientation;
  leftIndicatorTone?: AnalogTone;
  rightIndicatorTone?: AnalogTone;
  leftIndicatorActive?: 'auto' | 'always' | 'never';
  rightIndicatorActive?: 'auto' | 'always' | 'never';
  value?: ToggleValue;
  defaultValue?: ToggleValue;
  onValueChange?: (val: ToggleValue) => void;
  lighting?: AnalogLightingConfig<'track' | 'thumb' | 'lens' | 'surface'>;
}

type ToggleGroupMouseMoveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof BaseToggleGroup>['onMouseMove']>
>[0];

type ToggleGroupMouseLeaveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof BaseToggleGroup>['onMouseLeave']>
>[0];

const getIndicatorPositionStyle = (
  orientation: AnalogOrientation,
  side: ToggleValue,
): React.CSSProperties =>
  orientation === 'horizontal'
    ? {
        left: side === 'left' ? '25%' : '75%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        left: '50%',
        top: side === 'left' ? '25%' : '75%',
        transform: 'translate(-50%, -50%)',
      };

export const Toggle = React.forwardRef<HTMLDivElement, ToggleProps>(
  (
    {
      className,
      variant,
      orientation = 'horizontal',
      leftIndicatorTone,
      rightIndicatorTone,
      leftIndicatorActive = 'auto',
      rightIndicatorActive = 'auto',
      value,
      defaultValue = 'left',
      onValueChange,
      lighting,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);

    const [hoverState, setHoverState] = React.useState({
      isHovered: false,
      deltaX: 0,
      deltaY: 0,
    });

    const handleMouseMove = (e: ToggleGroupMouseMoveEvent) => {
      if (!internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      const absoluteX = e.clientX - rect.left;
      const absoluteY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setHoverState({
        isHovered: true,
        deltaX: absoluteX - centerX,
        deltaY: absoluteY - centerY,
      });
      props.onMouseMove?.(e);
    };

    const handleMouseLeave = (e: ToggleGroupMouseLeaveEvent) => {
      setHoverState({
        isHovered: false,
        deltaX: 0,
        deltaY: 0,
      });
      props.onMouseLeave?.(e);
    };

    const resolvedVariant = useAnalogMaterialVariant(variant);
    const isChrome = resolvedVariant === 'chrome';
    const isVertical = orientation === 'vertical';
    const groupValue = value === undefined ? undefined : [value];
    const groupDefaultValue = value === undefined ? [defaultValue] : undefined;
    const lightingStyle = useAnalogLighting(['track', 'thumb', 'lens', 'surface'], lighting);
    const basePlateBackground = isChrome
      ? `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 180deg), color-mix(in oklch, var(--analog-surface-metal-hi) 76%, var(--analog-highlight-color) 24%) 0%, var(--analog-surface-metal-mid) 42%, var(--analog-surface-metal-lo) 100%)`
      : `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 180deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 72%, var(--analog-surface-metal-lo) 28%) 0%, var(--analog-surface-onyx-mid) 46%, var(--analog-surface-onyx-lo) 100%)`;

    // We dampen the glare movement significantly so it feels heavy and metallic
    const glareX = hoverState.isHovered ? hoverState.deltaX * 0.15 : 0;
    const glareY = hoverState.isHovered ? hoverState.deltaY * 0.15 : 0;
    const renderIndicator = (side: ToggleValue, activeValue: ToggleValue) => {
      const indicatorTone = side === 'left' ? leftIndicatorTone : rightIndicatorTone;
      const indicatorActive = side === 'left' ? leftIndicatorActive : rightIndicatorActive;

      if (!indicatorTone) return null;

      return (
        <div
          className="absolute pointer-events-none"
          style={getIndicatorPositionStyle(orientation, side)}
        >
          <Indicator
            size="xs"
            disableBezel
            shape="round"
            tone={indicatorTone}
            isOn={
              indicatorActive === 'always'
                ? true
                : indicatorActive === 'never'
                  ? false
                  : activeValue === side
            }
          />
        </div>
      );
    };

    return (
      <BaseToggleGroup
        ref={mergedRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'analog-toggle group relative inline-flex min-w-0 shrink-0 items-center justify-center rounded-[var(--analog-radius-shell)] border-none outline-none select-none',
          isVertical ? 'h-[104px] w-12' : 'h-12 w-[104px]',
          className,
        )}
        data-analog-variant={resolvedVariant}
        style={
          {
            ...lightingStyle,
            '--glare-x': `${glareX}px`,
            '--glare-y': `${glareY}px`,
          } as React.CSSProperties
        }
        data-state={value}
        orientation={orientation}
        value={groupValue}
        defaultValue={groupDefaultValue}
        onValueChange={(val, details) => {
          const selectedValue = val[0] as ToggleValue | undefined;

          if (!selectedValue) {
            details.cancel();
            return;
          }

          onValueChange?.(selectedValue);
        }}
        {...props}
      >
        <BaseToggle
          value="left"
          className={cn(
            'absolute z-[10] opacity-0 cursor-pointer',
            isVertical ? 'left-0 right-0 top-0 h-1/2' : 'top-0 bottom-0 left-0 w-1/2',
          )}
          data-analog-toggle-value="left"
        />
        <BaseToggle
          value="right"
          className={cn(
            'absolute z-[10] opacity-0 cursor-pointer',
            isVertical ? 'left-0 right-0 bottom-0 h-1/2' : 'top-0 bottom-0 right-0 w-1/2',
          )}
          data-analog-toggle-value="right"
        />

        {/* Outer Bevel / Base Plate */}
        <div
          className="absolute inset-0 rounded-[var(--analog-radius-shell)] pointer-events-none"
          style={{
            background: basePlateBackground,
            boxShadow: isChrome
              ? `inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-highlight-rgb) / calc(1 * var(--analog-light-power, 1))), inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-shadow-rgb) / calc(0.2 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgb(var(--analog-highlight-rgb) / calc(0.18 * var(--analog-light-power, 1))), 0 calc(var(--analog-bevel-width, 4px) * 0.5) var(--analog-bevel-width, 4px) rgb(var(--analog-shadow-rgb) / calc(0.5 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), 0 0 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-shadow-rgb) / calc(0.1 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`
              : `inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-highlight-rgb) / calc(0.15 * var(--analog-light-power, 1))), inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-shadow-rgb) / calc(0.8 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgb(var(--analog-highlight-rgb) / calc(0.08 * var(--analog-light-power, 1))), 0 calc(var(--analog-bevel-width, 4px) * 0.5) var(--analog-bevel-width, 4px) rgb(var(--analog-shadow-rgb) / calc(0.9 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), 0 0 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-shadow-rgb) / calc(0.6 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
          }}
        >
          {/* Inner Recess / Track */}
          <div
            className="absolute inset-[var(--spacing-track-padding)] rounded-[var(--analog-radius-recess)] analog-surface-recess"
            style={{ perspective: '800px' }}
          >
            {(['left', 'right'] as const).map((activeValue) => (
              <div
                key={activeValue}
                className={cn(
                  'analog-toggle-visual absolute pointer-events-none rounded-[var(--analog-radius-window)]',
                  isVertical ? 'inset-x-[2px] inset-y-[6px]' : 'inset-y-[2px] inset-x-[6px]',
                )}
                data-analog-toggle-state={activeValue}
              >
                <RockerThumbSurface
                  className="size-full rounded-[var(--analog-radius-window)]"
                  variant={resolvedVariant}
                  orientation={orientation}
                  raisedSide={activeValue === 'right' ? 'end' : 'start'}
                >
                  {renderIndicator('left', activeValue)}
                  {renderIndicator('right', activeValue)}
                </RockerThumbSurface>
              </div>
            ))}
          </div>
        </div>
      </BaseToggleGroup>
    );
  },
);
Toggle.displayName = 'Toggle';
