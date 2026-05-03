import * as React from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '../../../lib/utils';
import { AnalogIndicator } from './Indicator';
import { RockerThumbSurface } from './RockerThumbSurface';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';

export interface AnalogToggleProps extends Omit<React.ComponentPropsWithoutRef<typeof ToggleGroup>, 'value'|'defaultValue'|'onValueChange'> {
  variant?: 'chrome' | 'black';
  leftLed?: 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
  rightLed?: 'red' | 'green' | 'amber' | 'blue' | 'white' | 'none';
  leftLedActive?: 'auto' | 'always' | 'never';
  rightLedActive?: 'auto' | 'always' | 'never';
  value?: 'left' | 'right';
  onValueChange?: (val: 'left' | 'right') => void;
  lighting?: AnalogLightingConfig<'track' | 'thumb' | 'lens' | 'surface'>;
}

type ToggleGroupMouseMoveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof ToggleGroup>['onMouseMove']>
>[0];

type ToggleGroupMouseLeaveEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<typeof ToggleGroup>['onMouseLeave']>
>[0];

export const AnalogToggle = React.forwardRef<HTMLDivElement, AnalogToggleProps>(
  ({ className, variant = 'chrome', leftLed = 'none', rightLed = 'none', leftLedActive = 'auto', rightLedActive = 'auto', value = 'left', onValueChange, lighting, ...props }, ref) => {
    
    const internalRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = (ref || internalRef) as React.RefObject<HTMLDivElement>;

    const [hoverState, setHoverState] = React.useState({
      isHovered: false,
      deltaX: 0,
      deltaY: 0
    });

    const handleMouseMove = (e: ToggleGroupMouseMoveEvent) => {
      if (!mergedRef.current) return;
      const rect = mergedRef.current.getBoundingClientRect();
      const absoluteX = e.clientX - rect.left;
      const absoluteY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      setHoverState({
        isHovered: true,
        deltaX: absoluteX - centerX,
        deltaY: absoluteY - centerY
      });
      props.onMouseMove?.(e);
    };

    const handleMouseLeave = (e: ToggleGroupMouseLeaveEvent) => {
      setHoverState({ ...hoverState, isHovered: false });
      props.onMouseLeave?.(e);
    };

    const isChrome = variant === 'chrome';
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
          "analog-toggle group relative inline-flex h-12 w-[104px] shrink-0 items-center justify-center rounded-lg border-none outline-none select-none",
          className
        )}
        style={{
          ...lightingStyle,
          '--glare-x': `${glareX}px`,
          '--glare-y': `${glareY}px`,
        } as React.CSSProperties}
        data-state={value}
        value={value ? [value] : []}
        onValueChange={(val) => {
          // If the user clicks the currently active one, and `val` is empty array,
          // do nothing to prevent deselection.
          if (val.length > 0) {
            onValueChange?.(val[0] as 'left' | 'right');
          }
        }}
        {...props}
      >
        <Toggle value="left" className="absolute top-0 bottom-0 left-0 w-1/2 z-[10] opacity-0 cursor-pointer" />
        <Toggle value="right" className="absolute top-0 bottom-0 right-0 w-1/2 z-[10] opacity-0 cursor-pointer" />

        {/* Outer Bevel / Base Plate */}
        <div className={cn(
          "absolute inset-0 rounded-lg pointer-events-none",
          isChrome 
            ? "bg-gradient-to-b from-neutral-300 to-neutral-500"
            : "bg-gradient-to-b from-neutral-700 to-neutral-900"
        )} style={{
           boxShadow: isChrome 
             ? `inset 0 1px 1px rgba(255,255,255,calc(1 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.1 * var(--analog-light-power, 1)))`
             : `inset 0 1px 1px rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1))), 0 0 0 1px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`
        }}>
          {/* Inner Recess / Track */}
          <div className="absolute inset-[var(--spacing-track-padding)] rounded-md analog-surface-recess" style={{ perspective: '800px' }}>
            
            {/* Rocker Pivot Container */}
            <RockerThumbSurface
              className="absolute inset-y-[2px] inset-x-[6px] rounded-sm"
              variant={variant}
              raisedSide={value === 'right' ? 'end' : 'start'}
            >
              <div className="absolute top-1/2 -mt-[5px] left-2 pointer-events-none">
                <AnalogIndicator size="xs" variant="none" shape="round" color={leftLed} isOn={leftLedActive === 'always' ? true : leftLedActive === 'never' ? false : value === 'left'} />
              </div>
              <div className="absolute top-1/2 -mt-[5px] right-2 pointer-events-none">
                <AnalogIndicator size="xs" variant="none" shape="round" color={rightLed} isOn={rightLedActive === 'always' ? true : rightLedActive === 'never' ? false : value === 'right'} />
              </div>
            </RockerThumbSurface>
          </div>
        </div>
      </ToggleGroup>
    );
  }
);
AnalogToggle.displayName = 'AnalogToggle';
