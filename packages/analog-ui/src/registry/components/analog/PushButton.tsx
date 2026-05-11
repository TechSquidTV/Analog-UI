import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { SquarePlunger } from './SquarePlunger';

type PushButtonElement = HTMLButtonElement | HTMLAnchorElement;
type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'height' | 'width' | 'onMouseDown' | 'onMouseUp' | 'onMouseLeave'
>;
type PushButtonMouseHandler = React.MouseEventHandler<PushButtonElement>;

export interface PushButtonProps extends NativeButtonProps {
  variant?: 'chrome' | 'black';
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  href?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  onMouseDown?: PushButtonMouseHandler;
  onMouseUp?: PushButtonMouseHandler;
  onMouseLeave?: PushButtonMouseHandler;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb'>;
  extrusionLayers?: number;
}

const sizingClassName =
  'pointer-events-none invisible flex h-full min-h-0 min-w-11 items-center justify-center px-5 py-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase';

export const PushButton = React.forwardRef<PushButtonElement, PushButtonProps>(
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
    const resolvedHeight = height ?? '3.5rem';
    const shouldRenderSizer = width === undefined;

    const [isPressed, setIsPressed] = React.useState(false);

    const handleMouseDown: PushButtonMouseHandler = (e) => {
      setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp: PushButtonMouseHandler = (e) => {
      setIsPressed(false);
      onMouseUp?.(e);
    };

    const handleMouseLeave: PushButtonMouseHandler = (e) => {
      setIsPressed(false);
      onMouseLeave?.(e);
    };

    const buttonProps = props as React.ComponentPropsWithoutRef<typeof Button>;
    const linkProps = props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <div
        className={cn(
          'relative inline-flex min-w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
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
          <span aria-hidden="true" className={sizingClassName}>
            {children}
          </span>
        ) : null}
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
            className="absolute inset-1.5 appearance-none border-none bg-transparent p-0 outline-none select-none"
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
            className="absolute inset-1.5 appearance-none border-none bg-transparent p-0 outline-none select-none"
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

PushButton.displayName = 'PushButton';
