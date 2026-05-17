import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { SquarePlunger } from './SquarePlunger';

type PushButtonElement = HTMLButtonElement | HTMLAnchorElement;
type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'height'
  | 'width'
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onPointerCancel'
  | 'onPointerLeave'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onBlur'
  | 'onMouseDown'
  | 'onMouseUp'
  | 'onMouseLeave'
  | 'className'
  | 'style'
>;
type PushButtonMouseHandler = React.MouseEventHandler<PushButtonElement>;
type PushButtonPointerHandler = React.PointerEventHandler<PushButtonElement>;
type PushButtonKeyboardHandler = React.KeyboardEventHandler<PushButtonElement>;
type PushButtonFocusHandler = React.FocusEventHandler<PushButtonElement>;

export interface PushButtonProps extends NativeButtonProps {
  variant?: 'chrome' | 'black';
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  href?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  onPointerDown?: PushButtonPointerHandler;
  onPointerUp?: PushButtonPointerHandler;
  onPointerCancel?: PushButtonPointerHandler;
  onPointerLeave?: PushButtonPointerHandler;
  onKeyDown?: PushButtonKeyboardHandler;
  onKeyUp?: PushButtonKeyboardHandler;
  onBlur?: PushButtonFocusHandler;
  onMouseDown?: PushButtonMouseHandler;
  onMouseUp?: PushButtonMouseHandler;
  onMouseLeave?: PushButtonMouseHandler;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'thumb'>;
  extrusionLayers?: number;
  className?: string;
  controlClassName?: string;
  style?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
}

const sizingClassName =
  'pointer-events-none invisible flex h-full min-h-0 min-w-11 items-center justify-center px-5 py-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase';

export const PushButton = React.forwardRef<PushButtonElement, PushButtonProps>(
  (
    {
      className,
      controlClassName,
      style,
      controlStyle,
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
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onKeyDown,
      onKeyUp,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const internalRef = React.useRef<HTMLElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const lightingStyle = useAnalogLighting(['surface', 'track', 'thumb'], lighting, {
      targetRef: containerRef,
    });
    const resolvedHeight = height ?? '3.5rem';
    const shouldRenderSizer = width === undefined;

    const [isPressed, setIsPressed] = React.useState(false);

    const handlePointerDown: PushButtonPointerHandler = (e) => {
      if (e.button !== 0) {
        onPointerDown?.(e);
        return;
      }

      setIsPressed(true);
      onPointerDown?.(e);
    };

    const handlePointerUp: PushButtonPointerHandler = (e) => {
      setIsPressed(false);
      onPointerUp?.(e);
    };

    const handlePointerCancel: PushButtonPointerHandler = (e) => {
      setIsPressed(false);
      onPointerCancel?.(e);
    };

    const handlePointerLeave: PushButtonPointerHandler = (e) => {
      setIsPressed(false);
      onPointerLeave?.(e);
    };

    const handleKeyDown: PushButtonKeyboardHandler = (e) => {
      if (!e.repeat && (e.key === ' ' || e.key === 'Enter')) {
        setIsPressed(true);
      }

      onKeyDown?.(e);
    };

    const handleKeyUp: PushButtonKeyboardHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        setIsPressed(false);
      }

      onKeyUp?.(e);
    };

    const handleBlur: PushButtonFocusHandler = (e) => {
      setIsPressed(false);
      onBlur?.(e);
    };

    const buttonProps = props as React.ComponentPropsWithoutRef<typeof Button>;
    const renderLink = href ? (
      <a href={href} target={target} rel={rel} download={download} />
    ) : undefined;

    return (
      <div
        ref={containerRef}
        data-slot="push-button"
        className={cn(
          'relative inline-flex min-w-14 shrink-0 items-center justify-center analog-surface-recess p-1.5',
          className,
        )}
        style={{
          ...lightingStyle,
          ...style,
          width,
          height: resolvedHeight,
          perspective: '2400px',
        }}
      >
        {shouldRenderSizer ? (
          <span aria-hidden="true" data-slot="push-button-sizer" className={sizingClassName}>
            {children}
          </span>
        ) : null}
        <Button
          {...buttonProps}
          ref={mergedRef as React.Ref<HTMLElement>}
          nativeButton={!href}
          render={renderLink}
          data-slot="push-button-root"
          onPointerDown={
            handlePointerDown as React.ComponentPropsWithoutRef<typeof Button>['onPointerDown']
          }
          onPointerUp={
            handlePointerUp as React.ComponentPropsWithoutRef<typeof Button>['onPointerUp']
          }
          onPointerCancel={
            handlePointerCancel as React.ComponentPropsWithoutRef<typeof Button>['onPointerCancel']
          }
          onPointerLeave={
            handlePointerLeave as React.ComponentPropsWithoutRef<typeof Button>['onPointerLeave']
          }
          onKeyDown={handleKeyDown as React.ComponentPropsWithoutRef<typeof Button>['onKeyDown']}
          onKeyUp={handleKeyUp as React.ComponentPropsWithoutRef<typeof Button>['onKeyUp']}
          onBlur={handleBlur as React.ComponentPropsWithoutRef<typeof Button>['onBlur']}
          className={cn(
            'absolute inset-1.5 appearance-none border-none bg-transparent p-0 outline-none select-none',
            controlClassName,
          )}
          style={{ ...controlStyle, transformStyle: 'preserve-3d' }}
        >
          <span
            data-slot="push-button-plunger"
            className="pointer-events-none absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <SquarePlunger
              variant={variant}
              isPressed={isPressed}
              extrusionLayers={extrusionLayers}
            >
              {children}
            </SquarePlunger>
          </span>
        </Button>
      </div>
    );
  },
);

PushButton.displayName = 'PushButton';
