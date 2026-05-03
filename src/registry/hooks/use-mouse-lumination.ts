import { useEffect, useRef } from 'react';
import { useMotionValue } from 'motion/react';

export interface UseMouseLuminationOptions {
  baseAngle?: number;
  influence?: number; // 0 (none) to 1 (full follow)
  enabled?: boolean;
}

/**
 * Maps the global mouse position to an angle instantly.
 * Used for dynamic lighting on Skeuomorphic interfaces.
 */
export function useMouseLumination({
  baseAngle = 180,
  influence = 1,
  enabled = true,
}: UseMouseLuminationOptions = {}) {
  const angleValue = useMotionValue(baseAngle);
  const continuousMouseAngle = useRef(baseAngle);

  useEffect(() => {
    if (!enabled) {
      continuousMouseAngle.current = baseAngle;
      angleValue.set(baseAngle);
      return;
    }

    angleValue.set(baseAngle + (continuousMouseAngle.current - baseAngle) * influence);
  }, [angleValue, baseAngle, enabled, influence]);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Calculate mouse angle relative to center of screen.
      // Top translates to 180deg (light pointing down).
      // Right translates to 270deg (light pointing left).
      // Bottom translates to 0deg (light pointing up).
      // Left translates to 90deg (light pointing right).
      const rawMouseAngle = (Math.atan2(dy, dx) * 180) / Math.PI; 
      const target = rawMouseAngle - 90; 

      // Keep the raw mouse angle continuous so we never snap at the 0/360 seam.
      let diff = (target - continuousMouseAngle.current) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      continuousMouseAngle.current += diff;
      angleValue.set(
        baseAngle + (continuousMouseAngle.current - baseAngle) * influence
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [angleValue, baseAngle, enabled, influence]);

  return angleValue;
}
