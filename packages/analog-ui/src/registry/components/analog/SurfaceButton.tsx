import React, { useRef } from 'react';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import { useAnalogMaterialVariant } from '../../hooks/analog-material-scope';

export interface SurfaceButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  containerClassName?: string;
  disabled?: boolean;
  rotation?: number;
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'surface'>;
}

export const SurfaceButton = React.forwardRef<HTMLDivElement, SurfaceButtonProps>(
  (
    {
      children,
      className,
      containerClassName,
      disabled,
      style,
      rotation = 0,
      variant,
      lighting,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(forwardedRef, internalRef);
    const lightingStyle = useAnalogLighting(['surface'], lighting, {
      targetRef: internalRef,
    });
    const resolvedVariant = useAnalogMaterialVariant(variant);

    const rawCenter = useMotionValue(0.4);

    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const springCenter = useSpring(rawCenter, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      const absoluteX = e.clientX - rect.left;
      const absoluteY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = absoluteX - centerX;
      const deltaY = absoluteY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      const pointerFromCenter = maxDistance > 0 ? Math.min(1, distance / maxDistance) : 0;

      rawCenter.set(Math.max(0.4, pointerFromCenter));

      onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      rawCenter.set(0.4);
      onMouseLeave?.(e);
    };

    const pointerAngle = `${-rotation * 0.75}deg`;

    return (
      <div className={cn('inline-flex', containerClassName)}>
        <div
          ref={mergedRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-disabled={disabled || undefined}
          data-analog-variant={resolvedVariant}
          className={cn('surface-button', `variant-${resolvedVariant}`, className)}
          style={{
            ...lightingStyle,
            ...style,
          }}
          {...props}
        >
          <div className="holo-bg" style={{ transform: `rotate(${rotation}deg)` }} />
          <motion.div
            className="holo-glare"
            style={
              {
                '--pointer-angle': pointerAngle,
                '--pointer-from-center': springCenter,
              } as any
            }
          />
          <div className="holo-texture" style={{ transform: `rotate(${rotation}deg)` }} />
          {children && <span className="content">{children}</span>}
        </div>
      </div>
    );
  },
);
SurfaceButton.displayName = 'SurfaceButton';
