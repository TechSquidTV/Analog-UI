import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';

export interface SquarePlungerProps {
  variant?: 'chrome' | 'black';
  isPressed: boolean;
  extrusionLayers?: number;
  children?: React.ReactNode;
  indicator?: React.ReactNode;
  className?: string;
}

export const SquarePlunger = ({
  variant,
  isPressed,
  extrusionLayers = 32,
  children,
  indicator,
  className,
}: SquarePlungerProps) => {
  const resolvedVariant = useAnalogMaterialVariant(variant);
  const isChrome = resolvedVariant === 'chrome';

  return (
    <motion.div
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
      <div className="relative size-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* Extrusion Layers */}
        {[...Array(extrusionLayers)].map((_, index) => (
          <div
            key={`extrusion-${index}`}
            className={cn(
              'absolute inset-0',
              isChrome
                ? 'bg-[var(--analog-surface-metal-mid)]'
                : 'bg-[var(--analog-surface-onyx-lo)]',
            )}
            style={{
              transform: `translateZ(-${index + 1}px)`,
              filter: `brightness(${Math.max(0.15, 1 - (index / extrusionLayers) * 1.2)})`,
              borderLeft: isChrome
                ? '1px solid var(--analog-extrusion-highlight)'
                : '1px solid var(--analog-extrusion-highlight-muted)',
              borderRight: isChrome
                ? '1px solid var(--analog-extrusion-shadow)'
                : '1px solid var(--analog-extrusion-shadow-strong)',
            }}
          />
        ))}

        {/* Main Face */}
        <div
          className="absolute inset-0"
          style={{
            background: isChrome
              ? `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 180deg), var(--analog-surface-metal-hi), var(--analog-surface-metal-mid) 50%, var(--analog-surface-metal-lo))`
              : `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 180deg), var(--analog-surface-onyx-hi), var(--analog-surface-onyx-mid) 50%, var(--analog-surface-onyx-lo))`,
            boxShadow: isChrome
              ? `
                inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.75) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.75) calc(var(--analog-bevel-width, 4px) * 0.5) rgb(var(--analog-highlight-rgb) / calc(1 * var(--analog-light-power, 1))),
                inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -1.5) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 1.5) calc(var(--analog-bevel-width, 4px) * 4) rgb(var(--analog-shadow-rgb) / calc(0.5 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
                ${
                  isPressed
                    ? '0 calc(var(--analog-bevel-width, 4px) * 0.5) var(--analog-bevel-width, 4px)'
                    : '0 calc(var(--analog-bevel-width, 4px) * 3.75) calc(var(--analog-bevel-width, 4px) * 7.5)'
                } rgb(var(--analog-shadow-rgb) / calc(0.7 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))
              `
              : `
                inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.375) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.375) calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-highlight-rgb) / calc(0.3 * var(--analog-light-power, 1))),
                inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.75) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.75) calc(var(--analog-bevel-width, 4px) * 3) rgb(var(--analog-shadow-rgb) / calc(0.95 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))),
                ${
                  isPressed
                    ? '0 calc(var(--analog-bevel-width, 4px) * 0.75) calc(var(--analog-bevel-width, 4px) * 1.5)'
                    : '0 calc(var(--analog-bevel-width, 4px) * 4.5) calc(var(--analog-bevel-width, 4px) * 9)'
                } rgb(var(--analog-shadow-rgb) / calc(0.9 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))
              `,
          }}
        >
          <div
            className={cn(
              'analog-foil pointer-events-none absolute inset-0',
              isChrome ? 'mix-blend-overlay' : 'mix-blend-soft-light filter grayscale',
            )}
            style={{
              opacity: 'var(--analog-foil-opacity, 0.25)',
              backgroundSize: '250%',
            }}
          />

          {indicator}

          {/* Face Content */}
          <div
            className="relative z-10 flex size-full items-center justify-center p-1 text-center text-[10px] font-bold tracking-[0.25em] whitespace-nowrap uppercase"
            style={{
              color: isChrome
                ? 'color-mix(in oklch, var(--analog-surface-metal-lo) 42%, var(--analog-control-foreground) 58%)'
                : 'color-mix(in oklch, var(--analog-surface-metal-hi) 72%, var(--analog-highlight-color) 28%)',
              filter: 'drop-shadow(0 2px 4px var(--analog-shadow-color))',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
