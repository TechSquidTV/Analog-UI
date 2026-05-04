import * as React from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { AnalogIndicator, type AnalogIndicatorColor } from './Indicator';
import { RockerThumbSurface } from './RockerThumbSurface';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

type AnalogToggleOrientation = 'horizontal' | 'vertical';
type AnalogToggleValue = 'left' | 'right';

export interface AnalogToggleProps extends Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroup>,
  'value' | 'defaultValue' | 'onValueChange'
> {
  variant?: 'chrome' | 'black';
  orientation?: AnalogToggleOrientation;
  leftLed?: AnalogIndicatorColor;
  rightLed?: AnalogIndicatorColor;
  leftLedActive?: 'auto' | 'always' | 'never';
  rightLedActive?: 'auto' | 'always' | 'never';
  value?: AnalogToggleValue;
  onValueChange?: (val: AnalogToggleValue) => void;
  lighting?: AnalogLightingConfig<'track' | 'thumb' | 'lens' | 'surface'>;
}

type ToggleGroupMouseMoveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof ToggleGroup>['onMouseMove']>
>[0];

type ToggleGroupMouseLeaveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof ToggleGroup>['onMouseLeave']>
>[0];

const getLedPositionStyle = (
  orientation: AnalogToggleOrientation,
  side: AnalogToggleValue,
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

export const AnalogToggle = React.forwardRef<HTMLDivElement, AnalogToggleProps>(
  (
    {
      className,
      variant = 'chrome',
      orientation = 'horizontal',
      leftLed = 'none',
      rightLed = 'none',
      leftLedActive = 'auto',
      rightLedActive = 'auto',
      value = 'left',
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

    const isChrome = variant === 'chrome';
    const isVertical = orientation === 'vertical';
    const lightingStyle = useAnalogLighting(['track', 'thumb', 'lens', 'surface'], lighting);

    // We dampen the glare movement significantly so it feels heavy and metallic
    const glareX = hoverState.isHovered ? hoverState.deltaX * 0.15 : 0;
    const glareY = hoverState.isHovered ? hoverState.deltaY * 0.15 : 0;

    return (
      <ToggleGroup
        ref={mergedRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'analog-toggle group relative inline-flex min-w-0 shrink-0 items-center justify-center rounded-lg border-none outline-none select-none',
          isVertical ? 'h-[104px] w-12' : 'h-12 w-[104px]',
          className,
        )}
        style={
          {
            ...lightingStyle,
            '--glare-x': `${glareX}px`,
            '--glare-y': `${glareY}px`,
          } as React.CSSProperties
        }
        data-state={value}
        data-orientation={orientation}
        aria-orientation={orientation}
        value={value ? [value] : []}
        onValueChange={(val) => {
          // If the user clicks the currently active one, and `val` is empty array,
          // do nothing to prevent deselection.
          if (val.length > 0) {
            onValueChange?.(val[0] as AnalogToggleValue);
          }
        }}
        {...props}
      >
        <Toggle
          value="left"
          className={cn(
            'absolute z-[10] opacity-0 cursor-pointer',
            isVertical ? 'left-0 right-0 top-0 h-1/2' : 'top-0 bottom-0 left-0 w-1/2',
          )}
        />
        <Toggle
          value="right"
          className={cn(
            'absolute z-[10] opacity-0 cursor-pointer',
            isVertical ? 'left-0 right-0 bottom-0 h-1/2' : 'top-0 bottom-0 right-0 w-1/2',
          )}
        />

        {/* Outer Bevel / Base Plate */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg pointer-events-none',
            isChrome
              ? 'bg-gradient-to-b from-neutral-300 to-neutral-500'
              : 'bg-gradient-to-b from-neutral-700 to-neutral-900',
          )}
          style={{
            boxShadow: isChrome
              ? `inset 0 1px 1px rgba(255,255,255,calc(1 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`
              : `inset 0 1px 1px rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
          }}
        >
          {/* Inner Recess / Track */}
          <div
            className="absolute inset-[var(--spacing-track-padding)] rounded-md analog-surface-recess"
            style={{ perspective: '800px' }}
          >
            {/* Rocker Pivot Container */}
            <RockerThumbSurface
              className={cn(
                'absolute rounded-sm',
                isVertical ? 'inset-x-[2px] inset-y-[6px]' : 'inset-y-[2px] inset-x-[6px]',
              )}
              variant={variant}
              orientation={orientation}
              raisedSide={value === 'right' ? 'end' : 'start'}
            >
              <div
                className="absolute pointer-events-none"
                style={getLedPositionStyle(orientation, 'left')}
              >
                <AnalogIndicator
                  size="xs"
                  disableBezel
                  shape="round"
                  color={leftLed}
                  isOn={
                    leftLedActive === 'always'
                      ? true
                      : leftLedActive === 'never'
                        ? false
                        : value === 'left'
                  }
                />
              </div>
              <div
                className="absolute pointer-events-none"
                style={getLedPositionStyle(orientation, 'right')}
              >
                <AnalogIndicator
                  size="xs"
                  disableBezel
                  shape="round"
                  color={rightLed}
                  isOn={
                    rightLedActive === 'always'
                      ? true
                      : rightLedActive === 'never'
                        ? false
                        : value === 'right'
                  }
                />
              </div>
            </RockerThumbSurface>
          </div>
        </div>
      </ToggleGroup>
    );
  },
);
AnalogToggle.displayName = 'AnalogToggle';
