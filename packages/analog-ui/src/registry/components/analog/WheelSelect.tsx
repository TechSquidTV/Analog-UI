import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useWheelScroll } from '../../hooks/use-wheel-scroll';
import {
  useAnalogLightEffect,
  useAnalogLighting,
  type AnalogLightingConfig,
} from '../../hooks/use-analog-lighting';
import { getWheelDirectionFactor, type AnalogWheelDirection } from './wheel-interaction';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const wheelIndicatorStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-led-amber-base)',
  borderColor: 'var(--analog-control-surface-strong)',
  boxShadow: '0 0 10px var(--analog-led-amber-glow)',
};

const wheelReadoutGlassStyle: React.CSSProperties = {
  backgroundColor: 'var(--analog-control-glass)',
  borderColor: 'var(--analog-control-glass-border)',
};

function getWheelRidgeBackground(isMarked: boolean) {
  return isMarked
    ? `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%) 0%, var(--analog-surface-metal-mid) 52%, var(--analog-surface-metal-lo) 100%)`
    : `linear-gradient(var(--analog-light-angle-wheel-face, 180deg), color-mix(in oklch, var(--analog-surface-onyx-hi) 74%, white 10%) 0%, var(--analog-surface-onyx-mid) 48%, var(--analog-surface-onyx-lo) 100%)`;
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

export interface AnalogWheelSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  options: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  lighting?: AnalogLightingConfig<'track' | 'wheel'>;
  /**
   * Which drag direction advances to later options in the array.
   * @default 'down'
   */
  grabDirection?: AnalogWheelDirection;
  /**
   * Which wheel-scroll direction advances to later options in the array.
   * @default 'down'
   */
  scrollDirection?: AnalogWheelDirection;
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

export const AnalogWheelSelect = React.forwardRef<HTMLDivElement, AnalogWheelSelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      className,
      style,
      lighting,
      grabDirection = 'down',
      scrollDirection = 'down',
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? options[0] ?? '');
    const selectedValue = value !== undefined ? value : internalValue;
    const initialIndex = Math.max(0, options.indexOf(selectedValue));
    const optionIdBase = React.useId();

    const [activeIndex, setActiveIndex] = useState(initialIndex);

    const y = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);
    const [wheelMetrics, setWheelMetrics] = useState({ itemHeight: 0, radius: 0 });
    const wheelLighting: AnalogLightingConfig<'track' | 'wheel'> = {
      track: { travel: 1 },
      wheel: { travel: 0.36 },
      ...lighting,
    };
    const lightingStyle = useAnalogLighting(['track', 'wheel'], wheelLighting);
    const wheelFaceStyle = useAnalogLightEffect(
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
    const maxIndex = Math.max(options.length - 1, 0);
    const grabDirectionFactor = getWheelDirectionFactor(grabDirection);
    const scrollDirectionFactor = getWheelDirectionFactor(scrollDirection);
    const maxWheelOffset = maxIndex * itemHeight * grabDirectionFactor;

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

        animate(y, nextIndex * itemHeight * grabDirectionFactor, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
      },
      [grabDirectionFactor, itemHeight, y],
    );
    const clampIndex = React.useCallback(
      (nextIndex: number) => Math.min(maxIndex, Math.max(0, nextIndex)),
      [maxIndex],
    );
    const commitIndex = React.useCallback(
      (nextIndex: number) => {
        const clampedIndex = clampIndex(nextIndex);
        animateToIndex(clampedIndex);

        if (value === undefined) {
          setInternalValue(options[clampedIndex]);
        }

        onValueChange?.(options[clampedIndex]);
      },
      [animateToIndex, clampIndex, onValueChange, options, value],
    );

    useEffect(() => {
      if (itemHeight === 0) return;

      return y.on('change', (latest) => {
        let index = Math.round((latest / itemHeight) * grabDirectionFactor);
        if (index < 0) index = 0;
        if (index >= options.length) index = options.length - 1;
        setActiveIndex(index);
      });
    }, [y, itemHeight, options.length, grabDirectionFactor]);

    // Set initial position based on selected index
    useEffect(() => {
      if (itemHeight === 0) return;

      const targetY = initialIndex * itemHeight * grabDirectionFactor;
      animate(y, targetY, { type: 'spring', stiffness: 300, damping: 30 });
    }, [initialIndex, itemHeight, y, grabDirectionFactor]);

    const handleDragEnd = () => {
      if (itemHeight === 0) return;

      const currentY = y.get();
      const index = clampIndex(Math.round((currentY / itemHeight) * grabDirectionFactor));
      commitIndex(index);
    };

    useWheelScroll(
      containerRef,
      React.useCallback(
        (e, deltaDirection) => {
          const newIndex = clampIndex(activeIndex + deltaDirection * scrollDirectionFactor);

          if (newIndex !== activeIndex) {
            commitIndex(newIndex);
          }
        },
        [activeIndex, clampIndex, commitIndex, scrollDirectionFactor],
      ),
    );

    const displayValue = options[activeIndex] ?? selectedValue;
    const previousValue = activeIndex > 0 ? options[activeIndex - 1] : null;
    const nextValue = activeIndex < maxIndex ? options[activeIndex + 1] : null;

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
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = maxIndex;
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
          'relative flex min-w-0 items-center justify-center select-none touch-none overflow-visible rounded-md p-[var(--spacing-track-padding)] analog-surface-recess',
          className,
        )}
        style={{
          ...lightingStyle,
          ...wheelFaceStyle,
          height: 'var(--analog-wheel-control-height)',
          width: 'min(100%, var(--analog-wheel-control-width))',
          ...style,
        }}
        role="listbox"
        tabIndex={0}
        aria-label={props['aria-label'] ?? 'Analog wheel select'}
        aria-orientation="vertical"
        aria-activedescendant={`${optionIdBase}-${activeIndex}`}
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
              'relative h-full overflow-hidden rounded-md analog-track-slot analog-track-slot-deep',
            )}
            style={{
              width: 'var(--analog-wheel-cylinder-width)',
              perspective: '800px',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 rounded-sm border"
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
              dragConstraints={{
                top: Math.min(0, maxWheelOffset),
                bottom: Math.max(0, maxWheelOffset),
              }}
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
                rotateX: useTransform(
                  y,
                  (latest) => (-(latest * grabDirectionFactor) / circumference) * 360,
                ),
              }}
            >
              {[...Array(40)].map((_, i) => {
                const angle = (i / 40) * 360;
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
          </div>

          <div className="pointer-events-none absolute inset-0 z-40">
            {previousValue ? (
              <div
                className="absolute top-1/2 left-1/2 flex items-center justify-center rounded opacity-80"
                style={{
                  boxSizing: 'border-box',
                  minHeight: 'var(--analog-wheel-adjacent-label-min-height)',
                  width: 'var(--analog-wheel-adjacent-label-width)',
                  paddingInline: 'calc(var(--spacing) * 2)',
                  paddingBlock: 'calc(var(--spacing) * 0.5)',
                  transform:
                    'translate(-50%, calc(-100% - var(--analog-wheel-adjacent-label-gap)))',
                }}
              >
                <WheelOptionLabel label={previousValue} tone="secondary" />
              </div>
            ) : null}

            <div
              className="absolute top-1/2 left-1/2 flex items-center justify-center rounded border"
              style={{
                boxSizing: 'border-box',
                height: 'var(--analog-wheel-readout-height)',
                width: 'var(--analog-wheel-readout-width)',
                paddingInline: 'calc(var(--spacing) * 2)',
                borderColor: 'var(--analog-control-border)',
                backgroundColor:
                  'color-mix(in oklch, var(--analog-control-surface) 92%, transparent)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                style={{
                  filter:
                    'drop-shadow(0 0 8px color-mix(in oklch, var(--analog-control-foreground) 18%, transparent))',
                }}
              >
                <WheelOptionLabel label={displayValue} tone="primary" />
              </span>
            </div>

            {nextValue ? (
              <div
                className="absolute top-1/2 left-1/2 flex items-center justify-center rounded opacity-80"
                style={{
                  boxSizing: 'border-box',
                  minHeight: 'var(--analog-wheel-adjacent-label-min-height)',
                  width: 'var(--analog-wheel-adjacent-label-width)',
                  paddingInline: 'calc(var(--spacing) * 2)',
                  paddingBlock: 'calc(var(--spacing) * 0.5)',
                  transform: 'translate(-50%, var(--analog-wheel-adjacent-label-gap))',
                }}
              >
                <WheelOptionLabel label={nextValue} tone="secondary" />
              </div>
            ) : null}
          </div>

          <div className="sr-only">
            {options.map((opt, i) => (
              <div
                key={opt}
                id={`${optionIdBase}-${i}`}
                role="option"
                aria-selected={selectedValue === opt}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
AnalogWheelSelect.displayName = 'AnalogWheelSelect';
