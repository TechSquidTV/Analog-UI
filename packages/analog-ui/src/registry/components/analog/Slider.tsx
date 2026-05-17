import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { cn } from '../../../lib/utils';
import { RockerThumbSurface } from './RockerThumbSurface';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';
import type { AnalogOrientation } from './orientation';

export interface SliderMark {
  value: number;
  label: React.ReactNode;
  /**
   * Optional normalized position from 0 to 1 for non-linear legends such as audio fader laws.
   * When omitted, the mark is placed linearly between min and max.
   */
  position?: number;
  align?: 'start' | 'center' | 'end';
}

export interface SliderResolvedMark extends SliderMark {
  ratio: number;
  align: NonNullable<SliderMark['align']>;
}

export interface SliderRenderTrackProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  className: string;
}

export interface SliderRenderThumbProps {
  orientation: AnalogOrientation;
  isVertical: boolean;
  variant: 'chrome' | 'black';
  className: string;
  children: React.ReactNode;
}

export interface SliderRenderMarkProps {
  mark: SliderResolvedMark;
  orientation: AnalogOrientation;
  isVertical: boolean;
  className: string;
  style: React.CSSProperties;
}

export interface SliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseSlider.Root>,
  'orientation'
> {
  variant?: 'chrome' | 'black';
  orientation?: AnalogOrientation;
  getAriaLabel?: (index: number) => string;
  getAriaValueText?: (formattedValue: string, value: number, index: number) => string;
  lighting?: AnalogLightingConfig<'track' | 'thumb'>;
  marks?: readonly SliderMark[];
  showMarks?: boolean;
  trackClassName?: string;
  thumbClassName?: string;
  markClassName?: string;
  renderTrack?: (props: SliderRenderTrackProps) => React.ReactNode;
  renderThumb?: (props: SliderRenderThumbProps) => React.ReactNode;
  renderMark?: (props: SliderRenderMarkProps) => React.ReactNode;
}

function DefaultSliderTrack({ isVertical, className }: SliderRenderTrackProps) {
  return (
    <div data-slot="slider-track-recess" className={className}>
      <div
        data-slot="slider-track-slot"
        className={cn(
          'absolute inset-[var(--spacing-track-padding)] rounded-full analog-track-slot',
          isVertical ? 'w-1.5 left-1/2 -ml-[3px]' : 'h-1.5 top-1/2 -mt-[3px]',
        )}
      >
        <div
          data-slot="slider-track-guide"
          className={cn(
            'absolute analog-track-slot-guide',
            isVertical ? 'inset-y-0 w-[0.5px] left-1/2' : 'inset-x-0 h-[0.5px] top-1/2',
          )}
        />
      </div>
    </div>
  );
}

function DefaultSliderThumb({ className, variant, orientation, children }: SliderRenderThumbProps) {
  return (
    <RockerThumbSurface
      className={className}
      variant={variant}
      orientation={orientation}
      raisedSide="both"
      extrusionLayers={16}
    >
      {children}
    </RockerThumbSurface>
  );
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      variant,
      orientation = 'horizontal',
      lighting,
      min = 0,
      max = 100,
      marks,
      showMarks = marks !== undefined,
      trackClassName,
      thumbClassName,
      markClassName,
      renderTrack,
      renderThumb,
      renderMark,
      getAriaLabel,
      getAriaValueText,
      ...props
    },
    ref,
  ) => {
    const controlRef = React.useRef<HTMLDivElement>(null);
    const resolvedVariant = useAnalogMaterialVariant(variant);
    const isVertical = orientation === 'vertical';
    const sliderLighting: AnalogLightingConfig<'track' | 'thumb'> = {
      track: { travel: 1 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'thumb'], sliderLighting, {
      targetRef: controlRef,
    });
    const sliderRange = max - min;
    const getThumbAriaLabel = React.useCallback(
      (index: number) => getAriaLabel?.(index) ?? ariaLabel ?? 'Analog slider',
      [ariaLabel, getAriaLabel],
    );
    const resolvedMarks = React.useMemo<SliderResolvedMark[]>(() => {
      if (!showMarks || !marks?.length) return [];

      return marks.map((mark) => {
        const ratio =
          mark.position !== undefined
            ? Math.min(1, Math.max(0, mark.position))
            : sliderRange === 0
              ? 0
              : Math.min(1, Math.max(0, (mark.value - min) / sliderRange));

        return {
          ...mark,
          ratio,
          align: mark.align ?? (ratio <= 0.001 ? 'start' : ratio >= 0.999 ? 'end' : 'center'),
        };
      });
    }, [marks, min, showMarks, sliderRange]);

    return (
      <BaseSlider.Root
        ref={ref}
        orientation={orientation}
        min={min}
        max={max}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Analog slider')}
        aria-labelledby={ariaLabelledBy}
        data-slot="slider-root"
        data-analog-variant={resolvedVariant}
        {...props}
      >
        <BaseSlider.Control
          ref={controlRef}
          data-slot="slider-control"
          className={cn(
            'group relative flex items-center justify-center touch-none select-none data-[orientation=horizontal]:h-16 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-0 data-[orientation=vertical]:h-64 data-[orientation=vertical]:w-16 data-[orientation=vertical]:shrink-0',
            className,
          )}
          style={lightingStyle}
        >
          {/* Scale Markings */}
          {showMarks && isVertical ? (
            <div
              data-slot="slider-scale"
              className="absolute top-0 bottom-0 -left-6 w-4 pointer-events-none"
            >
              {resolvedMarks.map((mark) => {
                const markClass = cn(
                  'absolute left-0 w-full -translate-y-1/2 text-right text-[9px] font-mono text-[color:var(--analog-telemetry-label)] opacity-80',
                  markClassName,
                );
                const markStyle = { top: `${(1 - mark.ratio) * 100}%` };

                return renderMark ? (
                  <React.Fragment key={`${mark.value}-${String(mark.label)}`}>
                    {renderMark({
                      mark,
                      orientation,
                      isVertical,
                      className: markClass,
                      style: markStyle,
                    })}
                  </React.Fragment>
                ) : (
                  <span
                    key={`${mark.value}-${String(mark.label)}`}
                    data-slot="slider-mark"
                    className={markClass}
                    style={markStyle}
                  >
                    {mark.label}
                  </span>
                );
              })}
            </div>
          ) : showMarks ? (
            <div
              data-slot="slider-scale"
              className="absolute left-0 right-0 -top-6 h-4 pointer-events-none"
            >
              {resolvedMarks.map((mark) => {
                const markClass = cn(
                  'absolute top-0 text-[9px] font-mono text-[color:var(--analog-telemetry-label)] opacity-80',
                  mark.align === 'start'
                    ? 'translate-x-0 text-left'
                    : mark.align === 'end'
                      ? '-translate-x-full text-right'
                      : '-translate-x-1/2 text-center',
                  markClassName,
                );
                const markStyle = { left: `${mark.ratio * 100}%` };

                return renderMark ? (
                  <React.Fragment key={`${mark.value}-${String(mark.label)}`}>
                    {renderMark({
                      mark,
                      orientation,
                      isVertical,
                      className: markClass,
                      style: markStyle,
                    })}
                  </React.Fragment>
                ) : (
                  <span
                    key={`${mark.value}-${String(mark.label)}`}
                    data-slot="slider-mark"
                    className={markClass}
                    style={markStyle}
                  >
                    {mark.label}
                  </span>
                );
              })}
            </div>
          ) : null}

          {renderTrack ? (
            renderTrack({
              orientation,
              isVertical,
              className: cn(
                'absolute rounded-full analog-surface-recess',
                isVertical ? 'h-full w-3' : 'w-full h-3',
                trackClassName,
              ),
            })
          ) : (
            <DefaultSliderTrack
              orientation={orientation}
              isVertical={isVertical}
              className={cn(
                'absolute rounded-full analog-surface-recess',
                isVertical ? 'h-full w-3' : 'w-full h-3',
                trackClassName,
              )}
            />
          )}

          <BaseSlider.Track
            data-slot="slider-position-track"
            className="relative data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-0 flex items-center justify-center"
          >
            {/*
              Slider indicator could go here if we wanted a tone strip next to the track.
              For a pure pro-audio fader, we usually just have a plastic/metal thumb.
            */}

            <BaseSlider.Thumb
              data-slot="slider-thumb"
              getAriaLabel={
                getAriaLabel || ariaLabel || !ariaLabelledBy ? getThumbAriaLabel : undefined
              }
              getAriaValueText={getAriaValueText}
              className={cn(
                'absolute pointer-events-auto outline-none select-none transform-gpu data-[orientation=horizontal]:top-0 data-[orientation=horizontal]:h-8 data-[orientation=horizontal]:w-[72px] data-[orientation=horizontal]:-translate-y-1/2 data-[orientation=vertical]:left-0 data-[orientation=vertical]:h-[72px] data-[orientation=vertical]:w-8 data-[orientation=vertical]:-translate-x-1/2',
                thumbClassName,
              )}
              style={{ willChange: 'transform' }}
            >
              {(renderThumb ?? DefaultSliderThumb)({
                className: 'absolute inset-0 rounded-[var(--analog-radius-window)]',
                variant: resolvedVariant,
                orientation,
                isVertical,
                children: (
                  <div
                    data-slot="slider-focus-ring"
                    className="absolute inset-[4px] rounded-[var(--analog-radius-micro)] ring-2 ring-[var(--color-accent)] opacity-0 group-has-[[data-focus-visible]]:opacity-100 transition-opacity duration-300 pointer-events-none z-[4]"
                  />
                ),
              })}
            </BaseSlider.Thumb>
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    );
  },
);
Slider.displayName = 'Slider';
