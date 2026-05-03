import React, { useRef } from 'react';
import { Button } from '@base-ui/react';
import { cn } from '../../../lib/utils';
import { useMergedRefs } from '../../../lib/refs';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  containerClassName?: string;
  rotation?: number;
  variant?: 'chrome' | 'black';
  lighting?: AnalogLightingConfig<'surface'>;
}

export const AnisotropicButton = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      className,
      containerClassName,
      style,
      rotation = 0,
      variant = 'chrome',
      lighting,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(forwardedRef, internalRef);
    const lightingStyle = useAnalogLighting(['surface'], lighting);

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawCenter = useMotionValue(0.4);

    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const springX = useSpring(rawX, springConfig);
    const springY = useSpring(rawY, springConfig);
    const springCenter = useSpring(rawCenter, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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

      const normalizedDeltaX = centerX > 0 ? deltaX / centerX : 0;
      const normalizedDeltaY = centerY > 0 ? deltaY / centerY : 0;
      const pointerFromCenter = maxDistance > 0 ? Math.min(1, distance / maxDistance) : 0;

      rawX.set(normalizedDeltaX);
      rawY.set(normalizedDeltaY);
      rawCenter.set(Math.max(0.4, pointerFromCenter));

      onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      rawX.set(0);
      rawY.set(0);
      rawCenter.set(0.4);
      onMouseLeave?.(e);
    };

    const pointerAngle = useTransform([springX, springY], ([x, y]: [number, number]) => {
      return `${-rotation * 0.75 + (x * 30 + y * 15)}deg`;
    });

    return (
      <div className={cn('inline-flex', containerClassName)}>
        <Button
          ref={mergedRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn('anisotropic-btn', `variant-${variant}`, className)}
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
        </Button>
      </div>
    );
  },
);
AnisotropicButton.displayName = 'AnisotropicButton';
