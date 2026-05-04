import React, { useState, useRef } from 'react';
import { AnisotropicButton } from './AnisotropicButton';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useWheelScroll } from '../../hooks/use-wheel-scroll';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export interface DialProps {
  value?: number; // Total degrees accumulated
  onChange?: (value: number, degrees: number, revolutions: number) => void;
  variant?: 'chrome' | 'black';
  className?: string; // allow overrides
  disabled?: boolean;
  lighting?: AnalogLightingConfig<'surface' | 'pointer'>;
}

export const Dial = React.forwardRef<HTMLDivElement, DialProps>(
  (
    {
      value: externalValue,
      onChange,
      variant = 'chrome',
      className,
      disabled,
      lighting,
    }: DialProps = {},
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(0);
    const rotation = externalValue !== undefined ? externalValue : internalValue;

    const [isDragging, setIsDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, dialRef);

    // Cache these to avoid layout thrashing and jitter during drag
    const centerRef = useRef({ x: 0, y: 0 });
    const lastAngleRef = useRef(0);
    const dragRotationRef = useRef(0); // Tracks exact rotation continuously during drag to prevent drift
    const applyRotation = React.useCallback(
      (nextRotation: number) => {
        if (externalValue === undefined) {
          setInternalValue(nextRotation);
        }

        if (onChange) {
          const degrees = ((nextRotation % 360) + 360) % 360;
          const revolutions = Math.floor(nextRotation / 360);
          onChange(nextRotation, degrees, revolutions);
        }
      },
      [externalValue, onChange],
    );
    const degrees = ((rotation % 360) + 360) % 360;
    const revolutions = Math.floor(rotation / 360);

    useWheelScroll(
      dialRef,
      React.useCallback(
        (e, deltaDirection) => {
          if (disabled) return;
          // Scroll up = positive rotation, scroll down = negative rotation. Usually wheels are 1 or -1 deltaDirection
          // Let's use 15 degrees per tick.
          const step = 15;
          const delta = deltaDirection > 0 ? step : -step;
          applyRotation(rotation + delta);
        },
        [applyRotation, rotation, disabled],
      ),
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Use pointer capture to keep tracking even if pointer leaves window bounds
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      e.preventDefault();
      setIsDragging(true);

      if (!dialRef.current) return;

      // Cache center on drag start
      const rect = dialRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const angle =
        Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x) *
        (180 / Math.PI);
      lastAngleRef.current = angle;
      dragRotationRef.current = rotation;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;

      const dx = e.clientX - centerRef.current.x;
      const dy = e.clientY - centerRef.current.y;

      // If we're too close to the center, angle calculations become erratic. Skip update.
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      let delta = angle - lastAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      dragRotationRef.current += delta;
      const newRotation = dragRotationRef.current;
      applyRotation(newRotation);

      lastAngleRef.current = angle;
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      let nextRotation: number | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          nextRotation = rotation + 15;
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          nextRotation = rotation - 15;
          break;
        case 'PageUp':
          nextRotation = rotation + 45;
          break;
        case 'PageDown':
          nextRotation = rotation - 45;
          break;
        case 'Home':
          nextRotation = 0;
          break;
        default:
          break;
      }

      if (nextRotation !== null) {
        e.preventDefault();
        applyRotation(nextRotation);
      }
    };

    const isBlack = variant === 'black';
    const lightingStyle = useAnalogLighting(['surface', 'pointer'], lighting);

    return (
      <div
        ref={mergedRef}
        className={cn(
          'mx-auto aspect-square w-full min-w-0 max-w-[16rem] shrink-0 rounded-full touch-none',
          isDragging
            ? 'cursor-grabbing'
            : disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-grab',
          className,
        )}
        style={lightingStyle}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-valuenow={Math.round(rotation)}
        aria-valuetext={`${Math.round(degrees)} degrees, ${revolutions} revolutions`}
        aria-label="Analog dial"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <AnisotropicButton
          disabled={disabled}
          variant={variant}
          rotation={rotation}
          containerClassName="w-full h-full"
          className="w-full h-full"
          tabIndex={-1}
          aria-hidden="true"
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        >
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Dial indicator line */}
            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 rounded-full border',
                isBlack ? 'border-[#0a0a0a]' : 'border-neutral-600/50',
              )}
              style={{
                top: '12%',
                width: '3%',
                height: '24%',
                background: isBlack
                  ? `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${rotation}deg - 45deg), #444 0%, #222 40%, #000 100%)`
                  : `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${rotation}deg - 45deg), #a3a3a3 0%, #737373 40%, #404040 100%)`,
                boxShadow: isBlack
                  ? `inset 0 1px 1px rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1)))`
                  : `inset 0 1px 2px rgba(255,255,255,calc(0.6 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
              }}
            >
              {/* Add a tiny central highlight */}
              <div
                className={cn(
                  'absolute rounded-full blur-[0.5px]',
                  isBlack ? 'bg-neutral-400' : 'bg-white',
                )}
                style={{
                  top: '10%',
                  left: '50%',
                  width: '30%',
                  height: '30%',
                  transform: `translateX(-50%)`,
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
        </AnisotropicButton>
      </div>
    );
  },
);
Dial.displayName = 'Dial';
