import React, { useState, useRef } from 'react';
import { AnisotropicButton } from './AnisotropicButton';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { useWheelScroll } from '../../hooks/use-wheel-scroll';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/use-analog-material';

export interface DialProps {
  /**
   * In encoder mode this is the accumulated rotation in degrees.
   * In knob mode this is the domain value between min and max.
   */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, degrees: number, revolutions: number) => void;
  onValueChange?: (value: number) => void;
  mode?: 'encoder' | 'knob';
  variant?: 'chrome' | 'black';
  className?: string;
  disabled?: boolean;
  lighting?: AnalogLightingConfig<'surface' | 'pointer'>;
  min?: number;
  max?: number;
  step?: number;
  fineStep?: number;
  coarseStep?: number;
  startAngle?: number;
  sweepAngle?: number;
  detentValue?: number;
  detentThreshold?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, min: number, step: number) {
  if (!Number.isFinite(step) || step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
}

function roundDisplayValue(value: number) {
  return Math.round(value * 1000) / 1000;
}

export const Dial = React.forwardRef<HTMLDivElement, DialProps>(
  (
    {
      value: externalValue,
      defaultValue,
      onChange,
      onValueChange,
      mode,
      variant,
      className,
      disabled,
      lighting,
      min,
      max,
      step,
      fineStep,
      coarseStep,
      startAngle = 210,
      sweepAngle = 300,
      detentValue,
      detentThreshold,
    }: DialProps = {},
    ref,
  ) => {
    const hasExplicitSizeOverride =
      typeof className === 'string' && /\b(?:size|min-w|max-w|w|basis)-[^\s]+/.test(className);

    const resolvedMode = mode ?? (min !== undefined || max !== undefined ? 'knob' : 'encoder');
    const isKnob = resolvedMode === 'knob';
    const resolvedMin = min ?? 0;
    const resolvedMax = max ?? 100;
    const resolvedRange = resolvedMax - resolvedMin;
    const resolvedSweepAngle = Math.min(359.999, Math.max(1, sweepAngle));
    const resolvedStep = step ?? (isKnob ? 1 : 15);
    const resolvedFineStep = fineStep ?? (isKnob ? resolvedStep / 10 : resolvedStep);
    const resolvedCoarseStep = coarseStep ?? (isKnob ? resolvedStep * 10 : resolvedStep * 3);

    const [internalValue, setInternalValue] = useState(defaultValue ?? (isKnob ? resolvedMin : 0));
    const currentValue = externalValue !== undefined ? externalValue : internalValue;

    const [isDragging, setIsDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, dialRef);

    // Cache these to avoid layout thrashing and jitter during drag.
    const centerRef = useRef({ x: 0, y: 0 });
    const lastAngleRef = useRef(0);
    const dragRotationRef = useRef(0);

    const valueToRotation = React.useCallback(
      (nextValue: number) => {
        if (!isKnob || resolvedRange === 0) return nextValue;
        const ratio = clamp((nextValue - resolvedMin) / resolvedRange, 0, 1);
        return startAngle + ratio * resolvedSweepAngle;
      },
      [isKnob, resolvedMin, resolvedRange, resolvedSweepAngle, startAngle],
    );

    const normalizeKnobValue = React.useCallback(
      (nextValue: number, customStep = resolvedStep) => {
        let normalizedValue = clamp(nextValue, resolvedMin, resolvedMax);
        normalizedValue = roundToStep(normalizedValue, resolvedMin, customStep);

        const threshold =
          detentThreshold ??
          (Number.isFinite(customStep) && customStep > 0 ? customStep / 2 : resolvedRange * 0.01);

        if (
          detentValue !== undefined &&
          Math.abs(normalizedValue - detentValue) <= Math.max(threshold, 0)
        ) {
          normalizedValue = detentValue;
        }

        return clamp(roundDisplayValue(normalizedValue), resolvedMin, resolvedMax);
      },
      [detentThreshold, detentValue, resolvedMax, resolvedMin, resolvedRange, resolvedStep],
    );

    const rotationToValue = React.useCallback(
      (nextRotation: number, customStep = resolvedStep) => {
        if (!isKnob || resolvedRange === 0) return nextRotation;
        const clampedRotation = clamp(nextRotation, startAngle, startAngle + resolvedSweepAngle);
        const ratio = (clampedRotation - startAngle) / resolvedSweepAngle;
        const nextValue = resolvedMin + ratio * resolvedRange;
        return normalizeKnobValue(nextValue, customStep);
      },
      [
        isKnob,
        normalizeKnobValue,
        resolvedMin,
        resolvedRange,
        resolvedStep,
        resolvedSweepAngle,
        startAngle,
      ],
    );

    const getStepAmount = React.useCallback(
      (event?: { altKey?: boolean; shiftKey?: boolean }) => {
        if (event?.altKey) return resolvedFineStep;
        if (event?.shiftKey) return resolvedCoarseStep;
        return resolvedStep;
      },
      [resolvedCoarseStep, resolvedFineStep, resolvedStep],
    );

    const applyValue = React.useCallback(
      (nextRawValue: number, customStep = resolvedStep) => {
        const nextValue = isKnob ? normalizeKnobValue(nextRawValue, customStep) : nextRawValue;

        if (externalValue === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);

        if (onChange) {
          if (isKnob) {
            const rotation = valueToRotation(nextValue);
            onChange(nextValue, ((rotation % 360) + 360) % 360, 0);
          } else {
            const degrees = ((nextValue % 360) + 360) % 360;
            const revolutions = Math.floor(nextValue / 360);
            onChange(nextValue, degrees, revolutions);
          }
        }
      },
      [
        externalValue,
        isKnob,
        normalizeKnobValue,
        onChange,
        onValueChange,
        resolvedStep,
        valueToRotation,
      ],
    );

    const pointerRotation = isKnob ? valueToRotation(currentValue) : currentValue;
    const degrees = ((pointerRotation % 360) + 360) % 360;
    const revolutions = isKnob ? 0 : Math.floor(currentValue / 360);

    useWheelScroll(
      dialRef,
      React.useCallback(
        (event, deltaDirection) => {
          if (disabled) return;

          const stepAmount = getStepAmount(event);
          const delta = deltaDirection > 0 ? stepAmount : -stepAmount;
          applyValue(currentValue + delta, stepAmount);
        },
        [applyValue, currentValue, disabled, getStepAmount],
      ),
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
      event.preventDefault();
      setIsDragging(true);

      if (!dialRef.current) return;

      const rect = dialRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const angle =
        Math.atan2(event.clientY - centerRef.current.y, event.clientX - centerRef.current.x) *
        (180 / Math.PI);
      lastAngleRef.current = angle;
      dragRotationRef.current = pointerRotation;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;

      const dx = event.clientX - centerRef.current.x;
      const dy = event.clientY - centerRef.current.y;

      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      let delta = angle - lastAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      dragRotationRef.current += delta;

      if (isKnob) {
        dragRotationRef.current = clamp(
          dragRotationRef.current,
          startAngle,
          startAngle + resolvedSweepAngle,
        );
        const nextValue = rotationToValue(dragRotationRef.current);
        applyValue(nextValue);
        dragRotationRef.current = valueToRotation(nextValue);
      } else {
        applyValue(dragRotationRef.current);
      }

      lastAngleRef.current = angle;
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      let nextValue: number | null = null;
      const stepAmount = getStepAmount(event);

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          nextValue = currentValue + stepAmount;
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          nextValue = currentValue - stepAmount;
          break;
        case 'PageUp':
          nextValue = currentValue + resolvedCoarseStep;
          break;
        case 'PageDown':
          nextValue = currentValue - resolvedCoarseStep;
          break;
        case 'Home':
          nextValue = isKnob ? resolvedMin : 0;
          break;
        case 'End':
          if (isKnob) {
            nextValue = resolvedMax;
          }
          break;
        default:
          break;
      }

      if (nextValue !== null) {
        event.preventDefault();
        applyValue(nextValue, stepAmount);
      }
    };

    const resolvedVariant = useAnalogMaterialVariant(variant);
    const isBlack = resolvedVariant === 'black';
    const lightingStyle = useAnalogLighting(['surface', 'pointer'], lighting);
    const pointerBorderColor = isBlack
      ? 'var(--analog-control-border-strong)'
      : 'color-mix(in oklch, var(--analog-surface-metal-lo) 52%, transparent)';
    const pointerBackground = isBlack
      ? `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${pointerRotation}deg - 45deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 38%, var(--analog-surface-metal-lo) 62%) 0%, var(--analog-surface-onyx-mid) 40%, var(--analog-surface-onyx-lo) 100%)`
      : `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${pointerRotation}deg - 45deg), color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%) 0%, var(--analog-surface-metal-mid) 40%, var(--analog-surface-metal-lo) 100%)`;
    const pointerHighlight = isBlack
      ? 'color-mix(in oklch, var(--analog-surface-metal-mid) 72%, var(--analog-surface-metal-hi) 28%)'
      : 'color-mix(in oklch, var(--analog-surface-metal-hi) 88%, white 12%)';
    const pointerBevelAngle = `calc(var(--analog-light-angle-pointer, 180deg) - ${pointerRotation}deg)`;

    return (
      <div
        ref={mergedRef}
        data-analog-variant={resolvedVariant}
        className={cn(
          'mx-auto aspect-square max-w-full shrink-0 rounded-full touch-none',
          !hasExplicitSizeOverride && 'w-64',
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
        aria-valuenow={Math.round(currentValue * 1000) / 1000}
        aria-valuemin={isKnob ? resolvedMin : undefined}
        aria-valuemax={isKnob ? resolvedMax : undefined}
        aria-valuetext={
          isKnob
            ? `${roundDisplayValue(currentValue)} at ${Math.round(degrees)} degrees`
            : `${Math.round(degrees)} degrees, ${revolutions} revolutions`
        }
        aria-label={isKnob ? 'Analog knob' : 'Analog dial'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <AnisotropicButton
          disabled={disabled}
          variant={resolvedVariant}
          rotation={pointerRotation}
          containerClassName="w-full h-full"
          className="w-full h-full"
          tabIndex={-1}
          aria-hidden="true"
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        >
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ transform: `rotate(${pointerRotation}deg)` }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full border"
              style={{
                top: '12%',
                width: '3%',
                height: '24%',
                borderColor: pointerBorderColor,
                background: pointerBackground,
                boxShadow: isBlack
                  ? `inset calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 1px rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1))), inset calc(sin(${pointerBevelAngle}) * -1px) calc(cos(${pointerBevelAngle}) * 1px) 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1))), calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 4px rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1)))`
                  : `inset calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 2px rgba(255,255,255,calc(0.6 * var(--analog-light-power, 1))), inset calc(sin(${pointerBevelAngle}) * -1px) calc(cos(${pointerBevelAngle}) * 1px) 2px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 4px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`,
              }}
            >
              <div
                className="absolute rounded-full blur-[0.5px]"
                style={{
                  top: '10%',
                  left: '50%',
                  width: '30%',
                  height: '30%',
                  transform: 'translateX(-50%)',
                  opacity: 0.6,
                  backgroundColor: pointerHighlight,
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
