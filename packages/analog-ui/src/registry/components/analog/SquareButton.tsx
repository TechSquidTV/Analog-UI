import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { SquarePlunger } from './SquarePlunger';

type SquareButtonElement = HTMLButtonElement | HTMLAnchorElement;
type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'height' | 'width' | 'onMouseDown' | 'onMouseUp' | 'onMouseLeave'
>;
type SquareButtonMouseHandler = React.MouseEventHandler<SquareButtonElement>;

export interface SquareButtonProps extends NativeButtonProps {
  variant?: 'chrome' | 'black';
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  href?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  onMouseDown?: SquareButtonMouseHandler;
  onMouseUp?: SquareButtonMouseHandler;
  onMouseLeave?: SquareButtonMouseHandler;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb'>;
  extrusionLayers?: number;
}

export const SquareButton = React.forwardRef<SquareButtonElement, SquareButtonProps>(
  (
    {
      className,
      variant,
      width,
      height,
      href,
      target,
      rel,
      download,
      lighting,
      extrusionLayers = 32,
      children,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb'], lighting);

    const [isPressed, setIsPressed] = React.useState(false);

    const handleMouseDown: SquareButtonMouseHandler = (e) => {
      setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp: SquareButtonMouseHandler = (e) => {
      setIsPressed(false);
      onMouseUp?.(e);
    };

    const handleMouseLeave: SquareButtonMouseHandler = (e) => {
      setIsPressed(false);
      onMouseLeave?.(e);
    };

    const buttonProps = props as React.ComponentPropsWithoutRef<typeof Button>;
    const linkProps = props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <div
        className={cn(
          'relative inline-flex h-14 w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
          className,
        )}
        style={{
          ...lightingStyle,
          width,
          height,
          perspective: '2400px',
        }}
      >
        {href ? (
          <a
            ref={mergedRef as React.Ref<HTMLAnchorElement>}
            href={href}
            target={target}
            rel={rel}
            download={download}
            onMouseDown={handleMouseDown as React.MouseEventHandler<HTMLAnchorElement>}
            onMouseUp={handleMouseUp as React.MouseEventHandler<HTMLAnchorElement>}
            onMouseLeave={handleMouseLeave as React.MouseEventHandler<HTMLAnchorElement>}
            className="relative size-full appearance-none border-none bg-transparent p-0 outline-none select-none"
            style={{ transformStyle: 'preserve-3d' }}
            {...linkProps}
          >
            <SquarePlunger
              variant={variant}
              isPressed={isPressed}
              extrusionLayers={extrusionLayers}
            >
              {children}
            </SquarePlunger>
          </a>
        ) : (
          <Button
            ref={mergedRef as React.Ref<HTMLButtonElement>}
            onMouseDown={
              handleMouseDown as React.ComponentPropsWithoutRef<typeof Button>['onMouseDown']
            }
            onMouseUp={handleMouseUp as React.ComponentPropsWithoutRef<typeof Button>['onMouseUp']}
            onMouseLeave={
              handleMouseLeave as React.ComponentPropsWithoutRef<typeof Button>['onMouseLeave']
            }
            className="relative size-full appearance-none border-none bg-transparent p-0 outline-none select-none"
            style={{ transformStyle: 'preserve-3d' }}
            {...buttonProps}
          >
            <SquarePlunger
              variant={variant}
              isPressed={isPressed}
              extrusionLayers={extrusionLayers}
            >
              {children}
            </SquarePlunger>
          </Button>
        )}
      </div>
    );
  },
);

SquareButton.displayName = 'SquareButton';
