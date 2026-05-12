import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { cn } from '@/lib/utils';
import { SurfaceButton } from './SurfaceButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

const FLUTE_COUNT = 7;
const FLUTE_INDICES = Array.from({ length: FLUTE_COUNT }, (_, index) => index);

export interface RotarySwitchMark {
  value: number;
  label: React.ReactNode;
  position?: number;
}

export interface RotarySwitchProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Slider.Root>,
  'render' | 'step'
> {
  lighting?: AnalogLightingConfig<'surface' | 'bezel' | 'pointer'>;
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

export const RotarySwitch = React.forwardRef<HTMLDivElement, RotarySwitchProps>(
  (
    {
      className,
      disabled,
      lighting,
      min = 0,
      max = 6,
      startAngle = -135,
      sweepAngle = 270,
      marks,
      showMarks = marks !== undefined,
      showDetents = true,
      ...props
    },
    ref,
  ) => {
    const resolvedMin = Math.round(Math.min(min, max));
    const resolvedMax = Math.round(Math.max(min, max));
    const range = resolvedMax - resolvedMin;
    const resolvedSweepAngle = Math.min(359.999, Math.max(0, sweepAngle));
    const lightingStyle = useAnalogLighting(['surface', 'bezel', 'pointer'], lighting);
    const surfaceLighting = lighting?.surface ? { surface: lighting.surface } : undefined;

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

    return (
      <Slider.Root
        ref={ref}
        min={resolvedMin}
        max={resolvedMax}
        disabled={disabled}
        {...props}
        step={1}
        render={(rootProps, state) => {
          const rawValue = state.values[0] ?? resolvedMin;
          const switchValue = clamp(Math.round(rawValue), resolvedMin, resolvedMax);
          const ratio = getRangeRatio(switchValue, resolvedMin, range);
          const rotationAngle = startAngle + ratio * resolvedSweepAngle;
          const knobRotation = rotationAngle + 90;
          const pointerBevelAngle = `calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg)`;

          return (
            <div
              {...rootProps}
              className={cn(
                'relative mx-auto flex aspect-square w-full min-w-0 max-w-[13rem] select-none items-center justify-center p-5 outline-none',
                disabled ? 'opacity-50' : 'opacity-100',
                className,
              )}
              data-analog-value={switchValue}
              style={{
                ...lightingStyle,
                ...rootProps.style,
              }}
            >
              <Slider.Control
                className={cn(
                  'absolute inset-5 z-50 touch-none rounded-full',
                  disabled ? 'cursor-not-allowed' : 'cursor-ew-resize',
                )}
              >
                <Slider.Track className="h-full w-full opacity-0">
                  <Slider.Thumb className="h-full w-10" />
                </Slider.Track>
              </Slider.Control>

              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                {detents.map((detent) => {
                  const angle = startAngle + detent.ratio * resolvedSweepAngle;
                  const radians = (angle * Math.PI) / 180;
                  const isSelected = detent.value === switchValue;
                  const lineStartX = 50 + Math.cos(radians) * 39.5;
                  const lineStartY = 50 + Math.sin(radians) * 39.5;
                  const lineEndX = 50 + Math.cos(radians) * 45;
                  const lineEndY = 50 + Math.sin(radians) * 45;

                  return (
                    <line
                      key={detent.value}
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
                  const labelX = 50 + Math.cos(radians) * 34;
                  const labelY = 50 + Math.sin(radians) * 34;

                  return (
                    <text
                      key={`${mark.value}-${String(mark.label)}`}
                      x={labelX}
                      y={labelY}
                      fill="var(--analog-legend)"
                      fontSize="4"
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
                className="pointer-events-none absolute inset-[9%] rounded-full"
                style={{
                  background:
                    `radial-gradient(circle at 50% 42%, transparent 0 54%, rgba(255,255,255,calc(0.11 * var(--analog-light-power, 1))) 55%, transparent 59%), ` +
                    `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - 90deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 58%, black 42%) 0%, var(--analog-surface-onyx-mid) 34%, var(--analog-surface-onyx-lo) 100%)`,
                  boxShadow:
                    '0 18px 28px rgba(0,0,0,calc(0.58 * var(--analog-shadow-depth, 1))), ' +
                    'inset 0 2px 3px rgba(255,255,255,calc(0.12 * var(--analog-light-power, 1))), ' +
                    'inset 0 -10px 16px rgba(0,0,0,calc(0.88 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))',
                }}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[13%] overflow-hidden rounded-full"
                style={{
                  transform: `rotate(${knobRotation}deg)`,
                  transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                  background:
                    `repeating-conic-gradient(from -90deg, color-mix(in oklch, var(--analog-surface-onyx-hi) 24%, var(--analog-surface-onyx-mid) 76%) 0deg, var(--analog-surface-onyx-mid) 17deg, var(--analog-surface-onyx-lo) 25deg, color-mix(in oklch, black 82%, var(--analog-surface-onyx-lo) 18%) 30deg, var(--analog-surface-onyx-mid) 51.428deg), ` +
                    `radial-gradient(circle at 50% 50%, transparent 0 50%, rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 52%, transparent 57%, rgba(0,0,0,calc(0.82 * var(--analog-light-power, 1))) 100%)`,
                  boxShadow:
                    'inset 0 0 0 1px rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))), ' +
                    'inset 0 12px 18px rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))), ' +
                    'inset 0 -16px 22px rgba(0,0,0,calc(0.86 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))',
                }}
              >
                {FLUTE_INDICES.map((index) => {
                  const fluteAngle = (index * 360) / FLUTE_COUNT;

                  return (
                    <div
                      key={index}
                      className="absolute left-1/2 top-[2.5%] h-[47%] w-[18%]"
                      style={{
                        transform: `translateX(-50%) rotate(${fluteAngle}deg)`,
                        transformOrigin: '50% 101%',
                        clipPath:
                          'polygon(50% 0%, 82% 8%, 100% 72%, 82% 100%, 18% 100%, 0% 72%, 18% 8%)',
                        borderRadius: '999px 999px 24% 24%',
                        background:
                          `linear-gradient(calc(var(--analog-light-angle-bezel, 180deg) - ${rotationAngle + fluteAngle}deg), ` +
                          `color-mix(in oklch, var(--analog-surface-onyx-hi) 54%, black 46%) 0%, ` +
                          `var(--analog-surface-onyx-mid) 42%, ` +
                          `color-mix(in oklch, var(--analog-surface-onyx-lo) 86%, black 14%) 100%)`,
                        boxShadow:
                          'inset 1px 0 2px rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))), ' +
                          'inset -1px 0 2px rgba(0,0,0,calc(0.72 * var(--analog-light-power, 1))), ' +
                          '0 1px 1px rgba(255,255,255,calc(0.05 * var(--analog-light-power, 1)))',
                      }}
                    >
                      {index === 0 ? (
                        <div
                          className="absolute left-1/2 top-[10%] h-[75%] w-[18%] -translate-x-1/2 rounded-full"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.48) 58%, rgba(0,0,0,0.42))',
                            boxShadow:
                              `inset calc(sin(${pointerBevelAngle}) * 1px) calc(cos(${pointerBevelAngle}) * -1px) 1px rgba(255,255,255,calc(0.5 * var(--analog-light-power, 1))), ` +
                              '0 0 0 1px rgba(0,0,0,0.34), 0 0 7px rgba(255,255,255,0.16)',
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })}

                <div
                  className="absolute inset-[23%] rounded-full"
                  style={{
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.82), inset 0 0 18px rgba(0,0,0,0.74)',
                    background: 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)',
                  }}
                />
              </div>

              <div className="pointer-events-none absolute inset-[23%] z-30 rounded-full">
                <SurfaceButton
                  rotation={knobRotation}
                  lighting={surfaceLighting}
                  containerClassName="h-full w-full pointer-events-none"
                  className="analog-dial-surface h-full w-full pointer-events-none"
                  style={{ pointerEvents: 'none' }}
                  disabled
                  tabIndex={-1}
                />
              </div>
            </div>
          );
        }}
      />
    );
  },
);
RotarySwitch.displayName = 'RotarySwitch';
