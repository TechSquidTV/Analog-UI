import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMergedRefs } from '@/lib/refs';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useWheelInput } from '../../hooks/use-wheel-input';
import {
  useAnalogLightStyle,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';
import { getWheelDirectionFactor, type WheelDirection } from './wheel-interaction';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const wheelIndicatorStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-led-amber-base)',
  borderColor: 'var(--analog-control-surface-strong)',
  boxShadow:
    '0 0 calc(10px * var(--analog-bloom-strength, 0.7) * 1.428571) var(--analog-led-amber-glow)',
};

const wheelReadoutGlassStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-control-glass)',
  borderColor: 'var(--analog-control-glass-border)',
};

const WHEEL_RIDGE_COUNT = 40;
const WHEEL_LABEL_RENDER_BUFFER = 2;
const WHEEL_LABEL_FRONT_OPACITY = [1, 0.84, 0.54, 0.24] as const;
const WHEEL_UNBOUNDED_DRAG_STEPS = 2048;

function getWheelRidgeBackground(isMarked: boolean) {
  return isMarked
    ? `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%) 0%, var(--analog-surface-metal-mid) 52%, var(--analog-surface-metal-lo) 100%)`
    : `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 74%, white 10%) 0%, var(--analog-surface-onyx-mid) 48%, var(--analog-surface-onyx-lo) 100%)`;
}

function getWheelLabelSlotOffsets(stepAngle: number) {
  if (!(stepAngle > 0)) return [0];

  const halfRingCount = Math.ceil(180 / stepAngle) + WHEEL_LABEL_RENDER_BUFFER;

  return Array.from({ length: halfRingCount * 2 + 1 }, (_, index) => index - halfRingCount);
}

function getWheelLabelOpacity(offset: number) {
  return WHEEL_LABEL_FRONT_OPACITY[Math.abs(offset)] ?? 0;
}

function wrapIndex(index: number, count: number) {
  const remainder = index % count;
  return remainder < 0 ? remainder + count : remainder;
}

function getNearestWrappedIndex(index: number, around: number, count: number) {
  const targetIndex = wrapIndex(index, count);
  const currentIndex = wrapIndex(around, count);
  let delta = targetIndex - currentIndex;

  if (delta > count / 2) {
    delta -= count;
  } else if (delta < -count / 2) {
    delta += count;
  }

  return around + delta;
}

function findOptionIndexByValue(options: string[], value: string | undefined) {
  if (value === undefined) return undefined;

  const index = options.indexOf(value);
  return index >= 0 ? index : 0;
}

function resolveLengthPx(node: HTMLElement, value: string) {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.inlineSize = value;
  probe.style.blockSize = '0';
  node.appendChild(probe);
  const { width } = probe.getBoundingClientRect();
  probe.remove();
  return width;
}

export interface WheelSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  getOptionLabel?: (index: number) => string | undefined;
  minIndex?: number;
  maxIndex?: number;
  infinite?: boolean;
  lighting?: AnalogLightingConfig<'track' | 'wheel'>;
  /**
   * Which drag direction advances to later options in the array.
   * @default 'down'
   */
  grabDirection?: WheelDirection;
  /**
   * Which wheel-scroll direction advances to later options in the array.
   * @default 'down'
   */
  scrollDirection?: WheelDirection;
}

function splitWheelLabel(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
}

function WheelOptionLabel({ label, tone }: { label: string; tone: 'primary' | 'secondary' }) {
  const lines = splitWheelLabel(label);
  const labelStyle: React.CSSProperties =
    tone === 'primary'
      ? {
          fontSize: 'var(--analog-wheel-label-primary-size)',
          lineHeight: 'var(--analog-wheel-label-primary-line-height)',
          letterSpacing: 'var(--analog-wheel-label-letter-spacing)',
          color: 'var(--analog-control-foreground)',
        }
      : {
          fontSize: 'var(--analog-wheel-label-secondary-size)',
          lineHeight: 'var(--analog-wheel-label-secondary-line-height)',
          letterSpacing: 'var(--analog-wheel-label-letter-spacing)',
          color: 'var(--analog-telemetry-label)',
        };

  return (
    <span
      className="flex flex-col items-center justify-center whitespace-nowrap text-center font-mono font-bold uppercase"
      style={labelStyle}
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

export const WheelSelect = React.forwardRef<HTMLDivElement, WheelSelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      selectedIndex,
      defaultSelectedIndex,
      onSelectedIndexChange,
      getOptionLabel,
      minIndex,
      maxIndex,
      infinite = false,
      className,
      style,
      lighting,
      grabDirection = 'down',
      scrollDirection = 'down',
      ...props
    },
    ref,
  ) => {
    const initialCommittedIndex = React.useMemo(() => {
      if (defaultSelectedIndex !== undefined) return defaultSelectedIndex;
      if (options !== undefined) {
        return findOptionIndexByValue(options, defaultValue) ?? 0;
      }
      return minIndex ?? 0;
    }, [defaultSelectedIndex, defaultValue, minIndex, options]);
    const [committedIndex, setCommittedIndex] = useState(initialCommittedIndex);
    const [activeIndex, setActiveIndex] = useState(initialCommittedIndex);

    const y = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);
    const [wheelMetrics, setWheelMetrics] = useState({ itemHeight: 0, radius: 0 });
    const isArrayMode = options !== undefined;
    const optionCount = options?.length ?? 0;
    const isInfiniteCycle = infinite && optionCount > 0;
    const resolvedMinIndex = isInfiniteCycle
      ? undefined
      : isArrayMode
        ? optionCount > 0
          ? 0
          : undefined
        : (minIndex ?? 0);
    const resolvedMaxIndex = isInfiniteCycle
      ? undefined
      : isArrayMode
        ? optionCount > 0
          ? optionCount - 1
          : undefined
        : maxIndex;
    const normalizePhysicalIndex = React.useCallback(
      (nextIndex: number) => {
        if (isInfiniteCycle) return nextIndex;

        let normalizedIndex = nextIndex;

        if (resolvedMinIndex !== undefined) {
          normalizedIndex = Math.max(resolvedMinIndex, normalizedIndex);
        }

        if (resolvedMaxIndex !== undefined) {
          normalizedIndex = Math.min(resolvedMaxIndex, normalizedIndex);
        }

        return normalizedIndex;
      },
      [isInfiniteCycle, resolvedMaxIndex, resolvedMinIndex],
    );
    const getReportedIndex = React.useCallback(
      (physicalIndex: number) => {
        if (isInfiniteCycle && optionCount > 0) {
          return wrapIndex(physicalIndex, optionCount);
        }

        return normalizePhysicalIndex(physicalIndex);
      },
      [isInfiniteCycle, normalizePhysicalIndex, optionCount],
    );
    const resolveOptionLabelAtIndex = React.useCallback(
      (index: number) => {
        if (options !== undefined) {
          if (optionCount === 0) return undefined;
          if (isInfiniteCycle) {
            return options[wrapIndex(index, optionCount)];
          }
          if (index < 0 || index >= optionCount) return undefined;

          return options[index];
        }

        if (resolvedMinIndex !== undefined && index < resolvedMinIndex) return undefined;
        if (resolvedMaxIndex !== undefined && index > resolvedMaxIndex) return undefined;

        return getOptionLabel?.(index);
      },
      [getOptionLabel, isInfiniteCycle, optionCount, options, resolvedMaxIndex, resolvedMinIndex],
    );
    const controlledIndex = React.useMemo(() => {
      if (selectedIndex !== undefined) return selectedIndex;
      if (options !== undefined) {
        return findOptionIndexByValue(options, value);
      }
      return undefined;
    }, [options, selectedIndex, value]);
    const currentPhysicalIndex = React.useMemo(() => {
      if (controlledIndex !== undefined) {
        if (isInfiniteCycle && optionCount > 0) {
          return getNearestWrappedIndex(controlledIndex, committedIndex, optionCount);
        }

        return normalizePhysicalIndex(controlledIndex);
      }

      return normalizePhysicalIndex(committedIndex);
    }, [committedIndex, controlledIndex, isInfiniteCycle, normalizePhysicalIndex, optionCount]);
    const currentIndex = getReportedIndex(currentPhysicalIndex);
    const currentLabel = resolveOptionLabelAtIndex(currentPhysicalIndex) ?? '';

    const wheelLighting: AnalogLightingConfig<'track' | 'wheel'> = {
      track: { travel: 1 },
      wheel: { travel: 0.36 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'wheel'], wheelLighting);
    const wheelFaceStyle = useAnalogLightStyle(
      'wheel',
      {
        varName: '--analog-light-angle-wheel-face',
      },
      wheelLighting.wheel,
    );

    // Magic numbers for wheel
    const itemHeight = wheelMetrics.itemHeight;
    const radius = wheelMetrics.radius;
    const circumference = radius > 0 ? 2 * Math.PI * radius : 1;
    const stepAngle = circumference > 0 ? (itemHeight / circumference) * 360 : 0;
    const labelRadius = Math.max(radius - Math.max(itemHeight * 0.12, 4), 0);
    const grabDirectionFactor = getWheelDirectionFactor(grabDirection);
    const scrollDirectionFactor = getWheelDirectionFactor(scrollDirection);
    const labelSlotOffsets = React.useMemo(() => getWheelLabelSlotOffsets(stepAngle), [stepAngle]);
    const dragConstraints = React.useMemo(() => {
      if (itemHeight === 0) return undefined;

      if (isInfiniteCycle) {
        const unboundedOffset = itemHeight * WHEEL_UNBOUNDED_DRAG_STEPS;
        const centerOffset = currentPhysicalIndex * itemHeight * grabDirectionFactor;

        return {
          top: Math.min(centerOffset - unboundedOffset, centerOffset + unboundedOffset),
          bottom: Math.max(centerOffset - unboundedOffset, centerOffset + unboundedOffset),
        };
      }

      const minOffset =
        resolvedMinIndex !== undefined
          ? resolvedMinIndex * itemHeight * grabDirectionFactor
          : undefined;
      const maxOffset =
        resolvedMaxIndex !== undefined
          ? resolvedMaxIndex * itemHeight * grabDirectionFactor
          : undefined;

      if (minOffset === undefined && maxOffset === undefined) return undefined;

      const unboundedOffset = itemHeight * WHEEL_UNBOUNDED_DRAG_STEPS;
      const rangeStart =
        minOffset !== undefined
          ? minOffset
          : (maxOffset ?? 0) - grabDirectionFactor * unboundedOffset;
      const rangeEnd =
        maxOffset !== undefined
          ? maxOffset
          : (minOffset ?? 0) + grabDirectionFactor * unboundedOffset;

      return {
        top: Math.min(rangeStart, rangeEnd),
        bottom: Math.max(rangeStart, rangeEnd),
      };
    }, [
      currentPhysicalIndex,
      grabDirectionFactor,
      isInfiniteCycle,
      itemHeight,
      resolvedMaxIndex,
      resolvedMinIndex,
    ]);
    const wheelRotation = useTransform(
      y,
      (latest) => (-(latest * grabDirectionFactor) / circumference) * 360,
    );
    const labelRotation = useTransform(y, (latest) => {
      if (itemHeight === 0 || stepAngle === 0) return 0;

      const continuousIndex = (latest / itemHeight) * grabDirectionFactor;
      return -(continuousIndex - activeIndex) * stepAngle;
    });

    useIsomorphicLayoutEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const syncWheelMetrics = () => {
        const nextItemHeight = resolveLengthPx(node, 'var(--analog-wheel-step-height)');
        const nextRadius = resolveLengthPx(node, 'var(--analog-wheel-cylinder-radius)');

        setWheelMetrics((previous) => {
          if (previous.itemHeight === nextItemHeight && previous.radius === nextRadius) {
            return previous;
          }

          return {
            itemHeight: Number.isFinite(nextItemHeight) ? nextItemHeight : 0,
            radius: Number.isFinite(nextRadius) ? nextRadius : 0,
          };
        });
      };

      syncWheelMetrics();

      const resizeObserver = new ResizeObserver(syncWheelMetrics);
      resizeObserver.observe(node);

      const mutationObserver = new MutationObserver(syncWheelMetrics);
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme'],
      });

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, []);

    const animateToIndex = React.useCallback(
      (nextIndex: number) => {
        if (itemHeight === 0) return;

        animate(y, normalizePhysicalIndex(nextIndex) * itemHeight * grabDirectionFactor, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
      },
      [grabDirectionFactor, itemHeight, normalizePhysicalIndex, y],
    );
    const commitIndex = React.useCallback(
      (nextIndex: number) => {
        const normalizedIndex = normalizePhysicalIndex(nextIndex);
        animateToIndex(normalizedIndex);
        setCommittedIndex(normalizedIndex);

        onSelectedIndexChange?.(getReportedIndex(normalizedIndex));

        const nextLabel = resolveOptionLabelAtIndex(normalizedIndex);
        if (nextLabel !== undefined) {
          onValueChange?.(nextLabel);
        }
      },
      [
        animateToIndex,
        getReportedIndex,
        normalizePhysicalIndex,
        onSelectedIndexChange,
        onValueChange,
        resolveOptionLabelAtIndex,
      ],
    );

    useEffect(() => {
      if (itemHeight === 0) return;

      return y.on('change', (latest) => {
        const nextIndex = normalizePhysicalIndex(
          Math.round((latest / itemHeight) * grabDirectionFactor),
        );
        setActiveIndex(nextIndex);
      });
    }, [grabDirectionFactor, itemHeight, normalizePhysicalIndex, y]);

    // Set initial position based on selected index
    useEffect(() => {
      if (itemHeight === 0) return;

      const targetY = currentPhysicalIndex * itemHeight * grabDirectionFactor;
      animate(y, targetY, { type: 'spring', stiffness: 300, damping: 30 });
    }, [currentPhysicalIndex, grabDirectionFactor, itemHeight, y]);

    useEffect(() => {
      if (itemHeight !== 0) return;
      setActiveIndex(currentPhysicalIndex);
    }, [currentPhysicalIndex, itemHeight]);

    const handleDragEnd = () => {
      if (itemHeight === 0) return;

      const currentY = y.get();
      const index = normalizePhysicalIndex(
        Math.round((currentY / itemHeight) * grabDirectionFactor),
      );
      commitIndex(index);
    };

    useWheelInput(
      containerRef,
      React.useCallback(
        (e, deltaDirection) => {
          const newIndex = normalizePhysicalIndex(
            activeIndex + deltaDirection * scrollDirectionFactor,
          );

          if (newIndex !== activeIndex) {
            commitIndex(newIndex);
          }
        },
        [activeIndex, commitIndex, normalizePhysicalIndex, scrollDirectionFactor],
      ),
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(e);
      if (e.defaultPrevented) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = activeIndex - 1;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = activeIndex + 1;
          break;
        case 'PageUp':
          nextIndex = activeIndex - 5;
          break;
        case 'PageDown':
          nextIndex = activeIndex + 5;
          break;
        case 'Home':
          nextIndex = isInfiniteCycle ? null : (resolvedMinIndex ?? null);
          break;
        case 'End':
          nextIndex = isInfiniteCycle ? null : (resolvedMaxIndex ?? null);
          break;
        default:
          break;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        commitIndex(nextIndex);
      }
    };

    return (
      <div
        {...props}
        ref={mergedRef}
        className={cn(
          'relative flex min-w-0 items-center justify-center select-none touch-none overflow-visible rounded-[var(--analog-radius-recess)] p-[var(--spacing-track-padding)] analog-surface-recess',
          className,
        )}
        style={{
          ...lightingStyle,
          ...wheelFaceStyle,
          height: 'var(--analog-wheel-control-height)',
          width: 'min(100%, var(--analog-wheel-control-width))',
          ...style,
        }}
        role="spinbutton"
        tabIndex={0}
        aria-label={props['aria-label'] ?? 'Analog wheel select'}
        aria-orientation="vertical"
        aria-valuenow={currentIndex}
        aria-valuetext={currentLabel}
        aria-valuemin={resolvedMinIndex}
        aria-valuemax={resolvedMaxIndex}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          props.onPointerDown?.(event);
          if (!event.defaultPrevented) {
            containerRef.current?.focus();
          }
        }}
      >
        <div
          className="absolute analog-track-slot"
          style={{
            inset: 'calc(var(--spacing) * 0.5)',
            borderRadius: 'var(--analog-wheel-slot-radius)',
          }}
        />
        <div className="relative flex size-full items-center justify-center">
          <div
            className={cn(
              'relative h-full overflow-hidden rounded-[var(--analog-wheel-slot-radius)] analog-track-slot analog-track-slot-deep',
            )}
            style={{
              width: 'var(--analog-wheel-cylinder-width)',
              perspective: '800px',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 rounded-[var(--analog-radius-window)] border"
              style={{
                insetInline: 'var(--analog-wheel-cylinder-inset-inline)',
                borderColor:
                  'color-mix(in oklch, var(--analog-control-glass-border) 72%, transparent)',
                background:
                  `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), ` +
                  `color-mix(in oklch, var(--analog-surface-onyx-hi) 74%, white 10%) 0%, ` +
                  `var(--analog-surface-onyx-mid) 48%, ` +
                  `var(--analog-surface-onyx-lo) 100%)`,
                boxShadow:
                  'inset 0 0 0 1px rgba(0, 0, 0, 0.5), inset 10px 0 14px rgba(255,255,255,0.04), inset -10px 0 14px rgba(0,0,0,0.5)',
              }}
            />
            <div className="analog-wheel-lighting" />
            <div
              className="absolute top-1/2 left-0 z-10 -translate-y-1/2 border-y pointer-events-none"
              style={{
                width: 'var(--analog-wheel-indicator-width)',
                height: 'var(--analog-wheel-indicator-height)',
                ...wheelIndicatorStyle,
              }}
            />
            <div
              className="absolute top-1/2 right-0 z-10 -translate-y-1/2 border-y pointer-events-none"
              style={{
                width: 'var(--analog-wheel-indicator-width)',
                height: 'var(--analog-wheel-indicator-height)',
                ...wheelIndicatorStyle,
              }}
            />
            <div
              className="absolute top-1/2 left-0 right-0 z-10 -translate-y-1/2 border-y pointer-events-none mix-blend-screen"
              style={{
                height: 'var(--analog-wheel-readout-height)',
                ...wheelReadoutGlassStyle,
              }}
            />

            {/* Draggable Cylinder */}
            <motion.div
              drag="y"
              dragConstraints={dragConstraints}
              dragElastic={0}
              dragMomentum={true}
              onDragEnd={handleDragEnd}
              style={{ y }}
              className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
            />

            {/* Rendered Cylinder */}
            <motion.div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transformStyle: 'preserve-3d',
                rotateX: wheelRotation,
              }}
            >
              {[...Array(WHEEL_RIDGE_COUNT)].map((_, i) => {
                const angle = (i / WHEEL_RIDGE_COUNT) * 360;
                const isMarked = i % 10 === 0;
                return (
                  <div
                    key={`ridge-${i}`}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex items-center justify-center select-none"
                    style={{
                      height: 'var(--analog-wheel-ridge-height)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                    }}
                  >
                    <div
                      className="absolute border-b"
                      style={{
                        insetBlock: 'calc(var(--spacing) * 0.25)',
                        insetInline: 'var(--analog-wheel-ridge-inset-inline)',
                        borderRadius: 'var(--analog-wheel-ridge-radius)',
                        borderColor:
                          'color-mix(in oklch, var(--analog-control-border-strong) 80%, black 20%)',
                        background: getWheelRidgeBackground(isMarked),
                      }}
                    />
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transformStyle: 'preserve-3d',
                rotateX: labelRotation,
              }}
            >
              {labelSlotOffsets.map((offset) => {
                const optionIndex = activeIndex + offset;
                const label = resolveOptionLabelAtIndex(optionIndex);
                const opacity = label === undefined ? 0 : getWheelLabelOpacity(offset);

                return (
                  <div
                    key={`wheel-face-${offset}`}
                    className="absolute top-1/2 left-1/2 flex items-center justify-center"
                    style={{
                      boxSizing: 'border-box',
                      height: 'var(--analog-wheel-readout-height)',
                      width: 'var(--analog-wheel-readout-width)',
                      paddingInline: 'calc(var(--spacing) * 2)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      opacity,
                      transform:
                        `translate(-50%, -50%) rotateX(${offset * stepAngle}deg) ` +
                        `translateZ(${labelRadius}px)`,
                    }}
                  >
                    {label ? (
                      <span
                        style={{
                          filter:
                            offset === 0
                              ? 'drop-shadow(0 0 8px color-mix(in oklch, var(--analog-control-foreground) 18%, transparent)) drop-shadow(0 1px 1px rgba(0,0,0,0.68))'
                              : 'drop-shadow(0 1px 1px rgba(0,0,0,0.7))',
                        }}
                      >
                        <WheelOptionLabel
                          label={label}
                          tone={offset === 0 ? 'primary' : 'secondary'}
                        />
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    );
  },
);
WheelSelect.displayName = 'WheelSelect';
