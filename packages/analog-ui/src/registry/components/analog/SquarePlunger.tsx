import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';

interface SquarePlungerProps {
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
                ? '1px solid rgba(255,255,255,0.15)'
                : '1px solid rgba(255,255,255,0.02)',
              borderRight: isChrome ? '1px solid rgba(0,0,0,0.3)' : '1px solid rgba(0,0,0,0.6)',
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
                inset calc(sin(var(--analog-light-angle-surface)) * 3px) calc(cos(var(--analog-light-angle-surface)) * -3px) 2px rgba(255, 255, 255, calc(1 * var(--analog-light-power, 1))),
                inset calc(sin(var(--analog-light-angle-surface)) * -6px) calc(cos(var(--analog-light-angle-surface)) * 6px) 16px rgba(0, 0, 0, calc(0.5 * var(--analog-light-power, 1))),
                ${isPressed ? '0 2px 4px' : '0 15px 30px'} rgba(0, 0, 0, calc(0.7 * var(--analog-light-power, 1)))
              `
              : `
                inset calc(sin(var(--analog-light-angle-surface)) * 1.5px) calc(cos(var(--analog-light-angle-surface)) * -1.5px) 1px rgba(255, 255, 255, calc(0.3 * var(--analog-light-power, 1))),
                inset calc(sin(var(--analog-light-angle-surface)) * -3px) calc(cos(var(--analog-light-angle-surface)) * 3px) 12px rgba(0, 0, 0, calc(0.95 * var(--analog-light-power, 1))),
                ${isPressed ? '0 3px 6px' : '0 18px 36px'} rgba(0, 0, 0, calc(0.9 * var(--analog-light-power, 1)))
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
            className="relative z-10 flex size-full items-center justify-center p-1 text-[10px] font-bold uppercase tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
            style={{
              color: isChrome
                ? 'color-mix(in oklch, var(--analog-surface-metal-lo) 42%, var(--analog-control-foreground) 58%)'
                : 'color-mix(in oklch, var(--analog-surface-metal-hi) 72%, white 28%)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
