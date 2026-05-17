import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { cn } from '../../../lib/utils';
import { SurfaceButton } from './SurfaceButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import {
  clamp,
  getArcRatioFromPoint,
  normalizeRatio,
  polarPoint,
  resolveRadialMarks,
  valueToAngle,
  type RadialPoint,
} from './radial';

const FLUTED_LAYER_PATH =
  'M155 1q29 34 72 34l25 31c-6 28 0 57 18 78l-9 39a93 93 0 0 0-50 63l-36 17a92 92 0 0 0-80 0l-36-17q-10-43-50-63l-8-39q26-34 17-78c11-12 15-18 25-31 28 0 55-13 72-35z';
const FLUTED_LAYER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 264"><path fill="currentColor" d="${FLUTED_LAYER_PATH}"/></svg>`;
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

export interface RotarySwitchResolvedMark extends RotarySwitchMark {
  ratio: number;
  angle: number;
  labelPosition: RadialPoint;
}

export interface RotarySwitchResolvedDetent {
  value: number;
  ratio: number;
  angle: number;
  isSelected: boolean;
  lineStart: RadialPoint;
  lineEnd: RadialPoint;
}

export interface RotarySwitchRenderState {
  value: number;
  min: number;
  max: number;
  ratio: number;
  startAngle: number;
  sweepAngle: number;
  rotationAngle: number;
  knobRotation: number;
  disabled: boolean | undefined;
}

export interface RotarySwitchRenderKnobProps extends RotarySwitchRenderState {
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export interface RotarySwitchRenderPointerProps extends RotarySwitchRenderState {
  className: string;
  style: React.CSSProperties;
}

export interface RotarySwitchRenderCapProps extends RotarySwitchRenderState {
  lighting: AnalogLightingConfig<'surface'> | undefined;
  containerClassName: string;
  surfaceContainerClassName: string;
  surfaceClassName: string;
  surfaceStyle: React.CSSProperties;
}

export interface RotarySwitchRenderMarkProps extends RotarySwitchRenderState {
  mark: RotarySwitchResolvedMark;
  className: string;
}

export interface RotarySwitchRenderDetentProps extends RotarySwitchRenderState {
  detent: RotarySwitchResolvedDetent;
  className: string;
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
  renderKnob?: (props: RotarySwitchRenderKnobProps) => React.ReactNode;
  renderPointer?: (props: RotarySwitchRenderPointerProps) => React.ReactNode;
  renderCap?: (props: RotarySwitchRenderCapProps) => React.ReactNode;
  renderMark?: (props: RotarySwitchRenderMarkProps) => React.ReactNode;
  renderDetent?: (props: RotarySwitchRenderDetentProps) => React.ReactNode;
}

function getScalarValue(value: number | readonly number[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeSwitchValue(value: number, min: number, max: number) {
  return clamp(Math.round(value), min, max);
}

function DefaultRotarySwitchDetent({ detent, className }: RotarySwitchRenderDetentProps) {
  return (
    <line
      data-slot="rotary-switch-detent"
      className={className}
      x1={detent.lineStart.x}
      y1={detent.lineStart.y}
      x2={detent.lineEnd.x}
      y2={detent.lineEnd.y}
      stroke={
        detent.isSelected
          ? 'color-mix(in oklch, var(--analog-surface-metal-hi) 84%, var(--analog-highlight-color) 16%)'
          : 'var(--analog-telemetry-label)'
      }
      strokeWidth={detent.isSelected ? 1.2 : 0.75}
      strokeLinecap="round"
      style={{ opacity: detent.isSelected ? 0.95 : 0.62 }}
    />
  );
}

function DefaultRotarySwitchMark({ mark, className }: RotarySwitchRenderMarkProps) {
  return (
    <text
      data-slot="rotary-switch-mark"
      className={className}
      x={mark.labelPosition.x}
      y={mark.labelPosition.y}
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
}

function DefaultRotarySwitchPointer({ className, style }: RotarySwitchRenderPointerProps) {
  return <div className={className} data-slot="rotary-switch-pointer" style={style} />;
}

function DefaultRotarySwitchKnob({
  knobRotation,
  className,
  style,
  children,
}: RotarySwitchRenderKnobProps) {
  const flutedLightingTransform = `rotate(${-knobRotation}deg)`;
  const flutedBevelAngle = `calc(var(--analog-light-angle-bezel, 180deg) - ${knobRotation}deg)`;
  const flutedEdgeFilter =
    `drop-shadow(calc(sin(${flutedBevelAngle}) * 0.55px) calc(cos(${flutedBevelAngle}) * -0.55px) 0 rgb(var(--analog-highlight-rgb) / calc(0.1 * var(--analog-light-power, 1)))) ` +
    `drop-shadow(calc(sin(${flutedBevelAngle}) * -1.2px) calc(cos(${flutedBevelAngle}) * 1.2px) 1.6px rgb(var(--analog-shadow-rgb) / calc(0.58 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))))`;

  return (
    <div
      aria-hidden="true"
      className={className}
      data-slot="rotary-switch-knob-stack"
      style={style}
    >
      <div
        className="absolute -inset-[3.5%] rounded-full"
        data-slot="rotary-switch-backing"
        style={{
          background:
            `radial-gradient(circle at 42% 28%, color-mix(in oklch, var(--analog-surface-onyx-mid) 52%, var(--analog-highlight-color) 3%) 0%, transparent 34%), ` +
            `linear-gradient(calc(var(--analog-light-angle-track, 180deg) - 90deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 28%, var(--analog-shadow-color) 72%) 0%, var(--analog-surface-onyx-mid) 36%, var(--analog-surface-onyx-lo) 100%)`,
          boxShadow:
            `inset calc(sin(var(--analog-light-angle-track, 180deg)) * 1px) calc(cos(var(--analog-light-angle-track, 180deg)) * -1px) 0 rgb(var(--analog-highlight-rgb) / calc(0.07 * var(--analog-light-power, 1))), ` +
            `inset calc(sin(var(--analog-light-angle-track, 180deg)) * -5px) calc(cos(var(--analog-light-angle-track, 180deg)) * 5px) 16px rgb(var(--analog-shadow-rgb) / calc(0.72 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
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
          className="absolute inset-0 overflow-hidden"
          data-slot="rotary-switch-fluted-body"
          style={{
            ...FLUTED_LAYER_MASK_STYLE,
            boxShadow:
              `inset calc(sin(${flutedBevelAngle}) * 2px) calc(cos(${flutedBevelAngle}) * -2px) 3px rgb(var(--analog-highlight-rgb) / calc(0.12 * var(--analog-light-power, 1))), ` +
              `inset calc(sin(${flutedBevelAngle}) * -8px) calc(cos(${flutedBevelAngle}) * 8px) 18px rgb(var(--analog-shadow-rgb) / calc(0.76 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
          }}
        >
          <div
            className="absolute -inset-[22%]"
            data-slot="rotary-switch-fluted-body-lighting"
            style={{
              transform: flutedLightingTransform,
              transformOrigin: '50% 50%',
              background:
                `radial-gradient(circle at 38% 22%, rgb(var(--analog-highlight-rgb) / calc(0.13 * var(--analog-light-power, 1))) 0%, transparent 32%), ` +
                `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), var(--analog-surface-onyx-hi) 0%, var(--analog-surface-onyx-mid) 44%, var(--analog-surface-onyx-lo) 100%)`,
            }}
          />
        </div>
        <div
          className="absolute inset-0 overflow-hidden opacity-70 mix-blend-screen"
          data-slot="rotary-switch-fluted-gloss"
          style={{
            ...FLUTED_LAYER_MASK_STYLE,
          }}
        >
          <div
            className="absolute -inset-[22%]"
            data-slot="rotary-switch-fluted-gloss-lighting"
            style={{
              transform: flutedLightingTransform,
              transformOrigin: '50% 50%',
              background: `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 112deg), rgb(var(--analog-highlight-rgb) / calc(0.15 * var(--analog-light-power, 1))) 0%, rgb(var(--analog-highlight-rgb) / 0.02) 31%, transparent 52%, rgb(var(--analog-shadow-rgb) / calc(0.42 * var(--analog-light-power, 1))) 100%)`,
            }}
          />
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 270 264"
          className="pointer-events-none absolute inset-0 overflow-visible"
          data-slot="rotary-switch-fluted-edge"
          style={{ filter: flutedEdgeFilter }}
        >
          <path
            d={FLUTED_LAYER_PATH}
            fill="none"
            stroke="rgb(var(--analog-shadow-rgb) / 0.38)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
          />
          <path
            d={FLUTED_LAYER_PATH}
            fill="none"
            stroke="color-mix(in oklch, var(--analog-surface-metal-hi) 42%, transparent)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
            style={{ mixBlendMode: 'screen' }}
          />
        </svg>
        <div
          className="absolute inset-[31%] rounded-full"
          data-slot="rotary-switch-center-shadow"
          style={{
            background:
              'radial-gradient(circle, var(--analog-surface-cavity) 0%, var(--analog-surface-cavity-strong) 100%)',
            boxShadow:
              'inset 0 0 0 1px rgb(var(--analog-shadow-rgb) / 0.82), inset 0 0 14px rgb(var(--analog-shadow-rgb) / 0.72)',
          }}
        />
        {children}
      </div>
    </div>
  );
}

function DefaultRotarySwitchCap({
  knobRotation,
  lighting,
  containerClassName,
  surfaceContainerClassName,
  surfaceClassName,
  surfaceStyle,
}: RotarySwitchRenderCapProps) {
  return (
    <div className={containerClassName} data-slot="rotary-switch-cap">
      <SurfaceButton
        rotation={knobRotation}
        lighting={lighting}
        containerClassName={surfaceContainerClassName}
        className={surfaceClassName}
        style={surfaceStyle}
        disabled
        tabIndex={-1}
      />
    </div>
  );
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
      renderKnob,
      renderPointer,
      renderCap,
      renderMark,
      renderDetent,
      style,
      tabIndex,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-valuetext': ariaValueText,
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
    const resolvedSweepAngle = clamp(sweepAngle, 0, 359.999);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const lightingStyle = useAnalogLighting(['surface', 'bezel', 'pointer', 'track'], lighting, {
      targetRef: rootRef,
    });
    const surfaceLighting = lighting?.surface ? { surface: lighting.surface } : undefined;
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

    const endPointerInteraction = React.useCallback(
      (target?: HTMLElement | null, pointerId?: number) => {
        const resolvedPointerId = pointerId ?? activePointerIdRef.current;

        if (resolvedPointerId !== null && target?.hasPointerCapture(resolvedPointerId)) {
          target.releasePointerCapture(resolvedPointerId);
        }

        activePointerIdRef.current = null;
      },
      [],
    );

    React.useEffect(() => {
      if (disabled) {
        endPointerInteraction(rootRef.current);
      }
    }, [disabled, endPointerInteraction]);

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
        if (event.button !== 0) return;
        if (activePointerIdRef.current !== null) return;

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
        if (activePointerIdRef.current !== event.pointerId) return;

        if (disabled || event.buttons === 0) {
          endPointerInteraction(event.currentTarget, event.pointerId);
          return;
        }
        if (event.defaultPrevented) return;

        event.preventDefault();
        commitPointerValue(event);
      },
      [commitPointerValue, disabled, endPointerInteraction, onPointerMove],
    );

    const handlePointerUp = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerUp?.(event);
        if (activePointerIdRef.current !== event.pointerId) return;

        endPointerInteraction(event.currentTarget, event.pointerId);
      },
      [endPointerInteraction, onPointerUp],
    );

    const handlePointerCancel = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerCancel?.(event);
        if (activePointerIdRef.current !== event.pointerId) return;

        endPointerInteraction(event.currentTarget, event.pointerId);
      },
      [endPointerInteraction, onPointerCancel],
    );

    const detents = React.useMemo(() => {
      if (!showDetents || range < 0 || range > 40) return [];

      return Array.from({ length: range + 1 }, (_, index) => {
        const value = resolvedMin + index;
        const ratio = normalizeRatio(value, resolvedMin, resolvedMax);
        const angle = valueToAngle(value, resolvedMin, resolvedMax, startAngle, resolvedSweepAngle);

        return {
          value,
          ratio,
          angle,
          isSelected: value === currentValue,
          lineStart: polarPoint(51.5, angle),
          lineEnd: polarPoint(57, angle),
        };
      });
    }, [
      currentValue,
      range,
      resolvedMax,
      resolvedMin,
      resolvedSweepAngle,
      showDetents,
      startAngle,
    ]);

    const resolvedMarks = React.useMemo(() => {
      if (!showMarks) return [];

      const sourceMarks =
        marks ??
        detents.map((detent) => ({
          value: detent.value,
          label: detent.value,
          position: detent.ratio,
        }));

      return resolveRadialMarks(sourceMarks, {
        min: resolvedMin,
        max: resolvedMax,
        startAngle,
        sweepAngle: resolvedSweepAngle,
      }).map((mark) => ({
        ...mark,
        labelPosition: polarPoint(65, mark.angle),
      }));
    }, [detents, marks, resolvedMax, resolvedMin, resolvedSweepAngle, showMarks, startAngle]);

    const ratio = normalizeRatio(currentValue, resolvedMin, resolvedMax);
    const rotationAngle = valueToAngle(
      currentValue,
      resolvedMin,
      resolvedMax,
      startAngle,
      resolvedSweepAngle,
    );
    const knobRotation = rotationAngle + 90;
    const renderState: RotarySwitchRenderState = {
      value: currentValue,
      min: resolvedMin,
      max: resolvedMax,
      ratio,
      startAngle,
      sweepAngle: resolvedSweepAngle,
      rotationAngle,
      knobRotation,
      disabled,
    };
    const pointerProps: RotarySwitchRenderPointerProps = {
      ...renderState,
      className: 'absolute left-1/2 top-[5%] h-[28%] w-[4.5%] -translate-x-1/2 rounded-full',
      style: {
        background:
          'linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - 90deg), var(--analog-surface-metal-hi) 0%, var(--analog-surface-metal-mid) 58%, var(--analog-surface-metal-lo) 100%)',
        boxShadow:
          '0 0 0 1px var(--analog-material-border-strong), 0 0 5px rgb(var(--analog-highlight-rgb) / 0.14), inset 0 0 1px rgb(var(--analog-highlight-rgb) / 0.82)',
      },
    };
    const pointerNode = renderPointer?.(pointerProps) ?? (
      <DefaultRotarySwitchPointer {...pointerProps} />
    );
    const knobProps: RotarySwitchRenderKnobProps = {
      ...renderState,
      className: 'pointer-events-none absolute inset-[8%] z-20 overflow-visible',
      style: {},
      children: pointerNode,
    };
    const knobNode = renderKnob?.(knobProps) ?? <DefaultRotarySwitchKnob {...knobProps} />;
    const capProps: RotarySwitchRenderCapProps = {
      ...renderState,
      lighting: surfaceLighting,
      containerClassName: 'pointer-events-none absolute inset-[27%] z-30 rounded-full',
      surfaceContainerClassName: 'h-full w-full pointer-events-none',
      surfaceClassName: 'analog-dial-surface no-chamfer h-full w-full pointer-events-none',
      surfaceStyle: { pointerEvents: 'none' },
    };
    const capNode = renderCap?.(capProps) ?? <DefaultRotarySwitchCap {...capProps} />;

    return (
      <BaseSlider.Root
        ref={setRootRef}
        value={currentValue}
        min={resolvedMin}
        max={resolvedMax}
        step={1}
        largeStep={1}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...props}
        className={cn(
          'relative mx-auto flex aspect-square w-full min-w-0 max-w-[14rem] touch-none select-none items-center justify-center p-7 outline-none data-[focused]:ring-2 data-[focused]:ring-[var(--color-accent)]',
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
        onKeyDown={onKeyDown}
        onValueChange={(nextValue) => {
          const scalarValue = getScalarValue(nextValue);

          if (scalarValue !== undefined) {
            commitValue(scalarValue);
          }
        }}
        data-slot="rotary-switch"
      >
        <BaseSlider.Thumb
          data-slot="rotary-switch-input"
          className="pointer-events-none absolute z-50 size-12 opacity-0"
          tabIndex={disabled ? -1 : (tabIndex ?? 0)}
          aria-label={ariaLabel ?? 'Rotary switch'}
          aria-labelledby={ariaLabelledBy}
          getAriaValueText={(_, nextValue) => ariaValueText ?? String(nextValue)}
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible"
          data-slot="rotary-switch-scale"
        >
          {detents.map((detent) => (
            <React.Fragment key={detent.value}>
              {renderDetent?.({
                ...renderState,
                detent,
                className: '',
              }) ?? <DefaultRotarySwitchDetent {...renderState} detent={detent} className="" />}
            </React.Fragment>
          ))}

          {resolvedMarks.map((mark, index) => (
            <React.Fragment key={`${mark.value}-${String(mark.label)}-${index}`}>
              {renderMark?.({
                ...renderState,
                mark,
                className: '',
              }) ?? <DefaultRotarySwitchMark {...renderState} mark={mark} className="" />}
            </React.Fragment>
          ))}
        </svg>

        {knobNode}
        {capNode}
      </BaseSlider.Root>
    );
  },
);
RotarySwitch.displayName = 'RotarySwitch';
