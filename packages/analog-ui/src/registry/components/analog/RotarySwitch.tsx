import * as React from 'react';
import { cn } from '@/lib/utils';
import { SurfaceButton } from './SurfaceButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

const FLUTED_LAYER_PATH =
  'M155 1q29 34 72 34l25 31c-6 28 0 57 18 78l-9 39a93 93 0 0 0-50 63l-36 17a92 92 0 0 0-80 0l-36-17q-10-43-50-63l-8-39q26-34 17-78c11-12 15-18 25-31 28 0 55-13 72-35z';
const FLUTED_LAYER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 264"><path fill="black" d="${FLUTED_LAYER_PATH}"/></svg>`;
const FLUTED_LAYER_MASK = `url("data:image/svg+xml,${encodeURIComponent(FLUTED_LAYER_SVG)}")`;
const FLUTED_LAYER_MASK_STYLE = {
  WebkitMaskImage: FLUTED_LAYER_MASK,
  maskImage: FLUTED_LAYER_MASK,
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
} as React.CSSProperties;

export interface RotarySwitchMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface RotarySwitchProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  lighting?: AnalogLightingConfig<'surface' | 'bezel' | 'pointer' | 'track'>;
  startAngle?: number;
  sweepAngle?: number;
  marks?: readonly RotarySwitchMark[];
  showMarks?: boolean;
  showDetents?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getRangeRatio(value: number, min: number, range: number) {
  if (range === 0) return 0;
  return clamp((value - min) / range, 0, 1);
}

function getScalarValue(value: number | readonly number[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeSwitchValue(value: number, min: number, max: number) {
  return clamp(Math.round(value), min, max);
}

function getArcRatioFromPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  startAngle: number,
  sweepAngle: number,
) {
  if (sweepAngle === 0) return 0;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
  const normalizedAngle = ((angle - startAngle + 360) % 360) % 360;

  if (normalizedAngle <= sweepAngle) {
    return clamp(normalizedAngle / sweepAngle, 0, 1);
  }

  const distanceToStart = Math.min(normalizedAngle, 360 - normalizedAngle);
  const distanceToEnd = Math.abs(normalizedAngle - sweepAngle);
  return distanceToStart < distanceToEnd ? 0 : 1;
}

export const RotarySwitch = React.forwardRef<HTMLDivElement, RotarySwitchProps>(
  (
    {
      className,
      disabled,
      lighting,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 6,
      startAngle = -135,
      sweepAngle = 270,
      marks,
      showMarks = marks !== undefined,
      showDetents = true,
      style,
      tabIndex,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const resolvedMin = Math.round(Math.min(min, max));
    const resolvedMax = Math.round(Math.max(min, max));
    const range = resolvedMax - resolvedMin;
    const resolvedSweepAngle = Math.min(359.999, Math.max(0, sweepAngle));
    const lightingStyle = useAnalogLighting(['surface', 'bezel', 'pointer', 'track'], lighting);
    const surfaceLighting = lighting?.surface ? { surface: lighting.surface } : undefined;
    const generatedId = React.useId().replace(/:/g, '');
    const backingGradientId = `rotary-switch-backing-${generatedId}`;
    const bodyGradientId = `rotary-switch-body-${generatedId}`;
    const glossGradientId = `rotary-switch-gloss-${generatedId}`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(() =>
      normalizeSwitchValue(getScalarValue(defaultValue) ?? resolvedMin, resolvedMin, resolvedMax),
    );
    const currentValue = normalizeSwitchValue(
      getScalarValue(value) ?? internalValue,
      resolvedMin,
      resolvedMax,
    );
    const currentValueRef = React.useRef(currentValue);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const activePointerIdRef = React.useRef<number | null>(null);
    currentValueRef.current = currentValue;

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const commitValue = React.useCallback(
      (nextValue: number) => {
        const normalizedValue = normalizeSwitchValue(nextValue, resolvedMin, resolvedMax);
        if (normalizedValue === currentValueRef.current) return;

        currentValueRef.current = normalizedValue;

        if (!isControlled) {
          setInternalValue(normalizedValue);
        }

        onValueChange?.(normalizedValue);
      },
      [isControlled, onValueChange, resolvedMax, resolvedMin],
    );

    const commitPointerValue = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        const node = rootRef.current;
        if (!node) return;

        const ratio = getArcRatioFromPoint(
          event.clientX,
          event.clientY,
          node.getBoundingClientRect(),
          startAngle,
          resolvedSweepAngle,
        );

        commitValue(resolvedMin + ratio * range);
      },
      [commitValue, range, resolvedMin, resolvedSweepAngle, startAngle],
    );

    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || disabled) return;

        activePointerIdRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        event.preventDefault();
        commitPointerValue(event);
      },
      [commitPointerValue, disabled, onPointerDown],
    );

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.defaultPrevented || disabled) return;
        if (activePointerIdRef.current !== event.pointerId) return;

        event.preventDefault();
        commitPointerValue(event);
      },
      [commitPointerValue, disabled, onPointerMove],
    );

    const handlePointerUp = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerUp?.(event);
        if (activePointerIdRef.current !== event.pointerId) return;

        activePointerIdRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      },
      [onPointerUp],
    );

    const handlePointerCancel = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerCancel?.(event);
        if (activePointerIdRef.current !== event.pointerId) return;

        activePointerIdRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      },
      [onPointerCancel],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            event.preventDefault();
            commitValue(currentValueRef.current + 1);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            event.preventDefault();
            commitValue(currentValueRef.current - 1);
            break;
          case 'Home':
            event.preventDefault();
            commitValue(resolvedMin);
            break;
          case 'End':
            event.preventDefault();
            commitValue(resolvedMax);
            break;
        }
      },
      [commitValue, disabled, onKeyDown, resolvedMax, resolvedMin],
    );

    const detents = React.useMemo(() => {
      if (!showDetents || range < 0 || range > 40) return [];

      return Array.from({ length: range + 1 }, (_, index) => {
        const value = resolvedMin + index;
        return {
          value,
          ratio: getRangeRatio(value, resolvedMin, range),
        };
      });
    }, [range, resolvedMin, showDetents]);

    const resolvedMarks = React.useMemo(() => {
      if (!showMarks) return [];

      const sourceMarks =
        marks ??
        detents.map((detent) => ({
          value: detent.value,
          label: detent.value,
          position: detent.ratio,
        }));

      return sourceMarks.map((mark) => ({
        ...mark,
        ratio:
          mark.position !== undefined
            ? clamp(mark.position, 0, 1)
            : getRangeRatio(mark.value, resolvedMin, range),
      }));
    }, [detents, marks, range, resolvedMin, showMarks]);

    const ratio = getRangeRatio(currentValue, resolvedMin, range);
    const rotationAngle = startAngle + ratio * resolvedSweepAngle;
    const knobRotation = rotationAngle + 90;

    return (
      <div
        ref={setRootRef}
        role="slider"
        aria-valuemin={resolvedMin}
        aria-valuemax={resolvedMax}
        aria-valuenow={currentValue}
        aria-disabled={disabled || undefined}
        aria-valuetext={String(currentValue)}
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        {...props}
        className={cn(
          'relative mx-auto flex aspect-square w-full min-w-0 max-w-[14rem] touch-none select-none items-center justify-center p-7 outline-none',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-ew-resize opacity-100',
          className,
        )}
        data-analog-value={currentValue}
        style={{
          ...lightingStyle,
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        data-slot="rotary-switch"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible"
          data-slot="rotary-switch-scale"
        >
          {detents.map((detent) => {
            const angle = startAngle + detent.ratio * resolvedSweepAngle;
            const radians = (angle * Math.PI) / 180;
            const isSelected = detent.value === currentValue;
            const lineStartX = 50 + Math.cos(radians) * 51.5;
            const lineStartY = 50 + Math.sin(radians) * 51.5;
            const lineEndX = 50 + Math.cos(radians) * 57;
            const lineEndY = 50 + Math.sin(radians) * 57;

            return (
              <line
                key={detent.value}
                data-slot="rotary-switch-detent"
                x1={lineStartX}
                y1={lineStartY}
                x2={lineEndX}
                y2={lineEndY}
                stroke={
                  isSelected
                    ? 'color-mix(in oklch, var(--analog-surface-metal-hi) 84%, white 16%)'
                    : 'var(--analog-telemetry-label)'
                }
                strokeWidth={isSelected ? 1.2 : 0.75}
                strokeLinecap="round"
                style={{ opacity: isSelected ? 0.95 : 0.62 }}
              />
            );
          })}

          {resolvedMarks.map((mark) => {
            const angle = startAngle + mark.ratio * resolvedSweepAngle;
            const radians = (angle * Math.PI) / 180;
            const labelX = 50 + Math.cos(radians) * 65;
            const labelY = 50 + Math.sin(radians) * 65;

            return (
              <text
                key={`${mark.value}-${String(mark.label)}`}
                data-slot="rotary-switch-mark"
                x={labelX}
                y={labelY}
                fill="var(--analog-legend)"
                fontSize="4.6"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ opacity: 0.78 }}
              >
                {mark.label}
              </text>
            );
          })}
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[8%] z-20 overflow-visible"
          data-slot="rotary-switch-knob-stack"
        >
          <div
            className="absolute -inset-[3.5%] rounded-full"
            data-slot="rotary-switch-backing"
            style={{
              background:
                `radial-gradient(circle at 42% 28%, color-mix(in oklch, var(--analog-surface-onyx-mid) 52%, white 3%) 0%, transparent 34%), ` +
                `linear-gradient(calc(var(--analog-light-angle-track, 180deg) - 90deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 28%, black 72%) 0%, var(--analog-surface-onyx-mid) 36%, var(--analog-surface-onyx-lo) 100%)`,
              boxShadow:
                `inset calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 0 rgba(255,255,255,calc(0.07 * var(--analog-light-power, 1))), ` +
                `inset calc(sin(var(--analog-light-angle-track, 180deg)) * -5px) calc(cos(var(--analog-light-angle-track, 180deg)) * 5px) 16px rgba(0,0,0,calc(0.72 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
            }}
          />

          <div
            className="absolute inset-[5%]"
            data-slot="rotary-switch-fluted-rotor"
            style={{
              transform: `rotate(${knobRotation}deg)`,
              transformOrigin: '50% 50%',
              transition: 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',
              willChange: 'transform',
            }}
          >
            <div
              className="absolute inset-0"
              data-slot="rotary-switch-fluted-body"
              style={{
                ...FLUTED_LAYER_MASK_STYLE,
                background:
                  `radial-gradient(circle at 38% 22%, rgba(255,255,255,calc(0.13 * var(--analog-light-power, 1))) 0%, transparent 32%), ` +
                  `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), var(--analog-surface-onyx-hi) 0%, var(--analog-surface-onyx-mid) 44%, var(--analog-surface-onyx-lo) 100%)`,
                boxShadow:
                  `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * 2px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * -2px) 3px rgba(255,255,255,calc(0.12 * var(--analog-light-power, 1))), ` +
                  `inset calc(sin(var(--analog-light-angle-bezel, 180deg)) * -8px) calc(cos(var(--analog-light-angle-bezel, 180deg)) * 8px) 18px rgba(0,0,0,calc(0.76 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
              }}
            />
            <div
              className="absolute inset-0 opacity-70 mix-blend-screen"
              data-slot="rotary-switch-fluted-gloss"
              style={{
                ...FLUTED_LAYER_MASK_STYLE,
                background: `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 112deg), rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.02) 31%, transparent 52%, rgba(0,0,0,calc(0.42 * var(--analog-light-power, 1))) 100%)`,
              }}
            />
            <div
              className="absolute inset-[31%] rounded-full"
              data-slot="rotary-switch-center-shadow"
              style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.9) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.82), inset 0 0 14px rgba(0,0,0,0.72)',
              }}
            />
            <div
              className="absolute left-1/2 top-[5%] h-[28%] w-[4.5%] -translate-x-1/2 rounded-full"
              data-slot="rotary-switch-pointer"
              style={{
                background: `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - 90deg), rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 58%, rgba(0,0,0,0.34) 100%)`,
                boxShadow:
                  '0 0 0 1px rgba(0,0,0,0.3), 0 0 5px rgba(255,255,255,0.14), inset 0 0 1px rgba(255,255,255,0.82)',
              }}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-[27%] z-30 rounded-full"
          data-slot="rotary-switch-cap"
        >
          <SurfaceButton
            rotation={knobRotation}
            lighting={surfaceLighting}
            containerClassName="h-full w-full pointer-events-none"
            className="analog-dial-surface no-chamfer h-full w-full pointer-events-none"
            style={{ pointerEvents: 'none' }}
            disabled
            tabIndex={-1}
          />
        </div>
      </div>
    );
  },
);
RotarySwitch.displayName = 'RotarySwitch';
