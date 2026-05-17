import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';

export type SquarePlungerVariant = 'chrome' | 'black' | 'rubber';

export interface SquarePlungerProps {
  variant?: SquarePlungerVariant;
  isPressed: boolean;
  extrusionLayers?: number;
  children?: React.ReactNode;
  indicator?: React.ReactNode;
  className?: string;
  faceClassName?: string;
  faceStyle?: React.CSSProperties;
}

export const SquarePlunger = ({
  variant,
  isPressed,
  extrusionLayers = 32,
  children,
  indicator,
  className,
  faceClassName,
  faceStyle,
}: SquarePlungerProps) => {
  const inheritedVariant = useAnalogMaterialVariant(variant === 'rubber' ? undefined : variant);
  const resolvedVariant = variant ?? inheritedVariant;
  const isChrome = resolvedVariant === 'chrome';
  const isRubber = resolvedVariant === 'rubber';
  const extrusionBackground = isChrome
    ? 'var(--analog-surface-metal-mid)'
    : isRubber
      ? 'color-mix(in oklch, var(--analog-surface-metal-hi) 52%, var(--analog-highlight-color) 48%)'
      : 'var(--analog-surface-onyx-lo)';
  const extrusionHighlight = isChrome
    ? 'var(--analog-extrusion-highlight)'
    : isRubber
      ? 'rgb(var(--analog-highlight-rgb) / calc(0.16 * var(--analog-light-power, 1)))'
      : 'var(--analog-extrusion-highlight-muted)';
  const extrusionShadow = isChrome
    ? 'var(--analog-extrusion-shadow)'
    : isRubber
      ? 'rgb(var(--analog-shadow-rgb) / calc(0.18 * var(--analog-shadow-depth, 1)))'
      : 'var(--analog-extrusion-shadow-strong)';
  const thumbLightAngle =
    'var(--analog-light-angle-thumb, var(--analog-light-angle-surface, 180deg))';
  const faceBackground = isRubber
    ? 'color-mix(in oklch, var(--analog-surface-metal-hi) 42%, var(--analog-highlight-color) 58%)'
    : isChrome
      ? `linear-gradient(calc(${thumbLightAngle} - 180deg), var(--analog-surface-metal-hi), var(--analog-surface-metal-mid) 50%, var(--analog-surface-metal-lo))`
      : `linear-gradient(calc(${thumbLightAngle} - 180deg), var(--analog-surface-onyx-hi), var(--analog-surface-onyx-mid) 50%, var(--analog-surface-onyx-lo))`;
  const faceShadow = isRubber
    ? `
      inset 0 1px 1px rgb(var(--analog-highlight-rgb) / calc(0.28 * var(--analog-light-power, 1))),
      inset 0 -2px 6px rgb(var(--analog-shadow-rgb) / calc(0.14 * var(--analog-shadow-depth, 1))),
      ${
        isPressed
          ? '0 calc(var(--analog-bevel-width, 4px) * 0.45) var(--analog-bevel-width, 4px)'
          : '0 calc(var(--analog-bevel-width, 4px) * 3) calc(var(--analog-bevel-width, 4px) * 6)'
      } rgb(var(--analog-shadow-rgb) / calc(0.42 * var(--analog-shadow-depth, 1)))
    `
    : isChrome
      ? `
      inset calc(sin(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * 0.75) calc(cos(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * -0.75) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-highlight-rgb) / calc(1 * var(--analog-light-power, 1))),
      inset calc(sin(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * -1.5) calc(cos(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * 1.5) calc(var(--analog-bevel-width, 4px) * 4) rgb(var(--analog-shadow-rgb) / calc(0.5 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
      ${
        isPressed
          ? '0 calc(var(--analog-bevel-width, 4px) * 0.5) var(--analog-bevel-width, 4px)'
          : '0 calc(var(--analog-bevel-width, 4px) * 3.75) calc(var(--analog-bevel-width, 4px) * 7.5)'
      } rgb(var(--analog-shadow-rgb) / calc(0.7 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))
    `
      : `
      inset calc(sin(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * 0.375) calc(cos(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * -0.375) calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-highlight-rgb) / calc(0.3 * var(--analog-light-power, 1))),
      inset calc(sin(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * -0.75) calc(cos(${thumbLightAngle}) * var(--analog-bevel-width, 4px) * 0.75) calc(var(--analog-bevel-width, 4px) * 3) rgb(var(--analog-shadow-rgb) / calc(0.95 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
      ${
        isPressed
          ? '0 calc(var(--analog-bevel-width, 4px) * 0.75) calc(var(--analog-bevel-width, 4px) * 1.5)'
          : '0 calc(var(--analog-bevel-width, 4px) * 4.5) calc(var(--analog-bevel-width, 4px) * 9)'
      } rgb(var(--analog-shadow-rgb) / calc(0.9 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))
    `;
  const contentColor = isRubber
    ? 'var(--analog-plunger-label-rubber)'
    : isChrome
      ? 'var(--analog-plunger-label-chrome)'
      : 'var(--analog-plunger-label-black)';
  const contentFilter = isRubber
    ? 'none'
    : isChrome
      ? 'drop-shadow(0 1px 1px rgb(var(--analog-highlight-rgb) / calc(0.32 * var(--analog-light-power, 1))))'
      : 'drop-shadow(0 2px 4px var(--analog-shadow-color))';

  return (
    <motion.div
      data-slot="square-plunger"
      data-analog-variant={resolvedVariant}
      className={cn('absolute inset-0', className)}
      initial={false}
      animate={{
        z: isPressed ? -4 : 14,
        rotateX: isPressed ? 0 : 12,
        y: isPressed ? 2 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 600,
        damping: 25,
        mass: 1.2,
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        data-slot="square-plunger-stack"
        className="relative size-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Extrusion Layers */}
        {[...Array(extrusionLayers)].map((_, index) => (
          <div
            key={`extrusion-${index}`}
            data-slot="square-plunger-extrusion-layer"
            className="absolute inset-0"
            style={{
              background: extrusionBackground,
              transform: `translateZ(-${index + 1}px)`,
              filter: `brightness(${
                isRubber
                  ? Math.max(0.62, 1 - (index / extrusionLayers) * 0.48)
                  : Math.max(0.15, 1 - (index / extrusionLayers) * 1.2)
              })`,
              borderLeft: `1px solid ${extrusionHighlight}`,
              borderRight: `1px solid ${extrusionShadow}`,
            }}
          />
        ))}

        {/* Main Face */}
        <div
          data-slot="square-plunger-face"
          className={cn('absolute inset-0', faceClassName)}
          style={{
            background: faceStyle?.background ?? faceBackground,
            boxShadow: faceStyle?.boxShadow ?? faceShadow,
            transition:
              'background 180ms ease-out, box-shadow 180ms ease-out, filter 180ms ease-out',
            ...faceStyle,
          }}
        >
          {isRubber ? null : (
            <div
              data-slot="square-plunger-foil"
              className={cn(
                'analog-foil pointer-events-none absolute inset-0',
                isChrome ? 'mix-blend-overlay' : 'mix-blend-soft-light filter grayscale',
              )}
              style={{
                opacity: 'var(--analog-foil-opacity, 0.25)',
                backgroundSize: '250%',
              }}
            />
          )}

          {indicator}

          {/* Face Content */}
          <div
            data-slot="square-plunger-content"
            className="relative z-10 flex size-full items-center justify-center p-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase"
            style={{
              color: contentColor,
              filter: contentFilter,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
