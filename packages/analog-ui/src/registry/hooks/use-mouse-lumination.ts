import { useEffect, useRef } from 'react';
import { useMotionValue } from 'motion/react';
import {
  angleToLightingVector,
  advanceContinuousAngle,
  blendLightingVectors,
  clampLightingInfluence,
  smoothstep,
  vectorToLightingAngle,
} from './angle-utils';

export interface UseMouseLuminationOptions {
  baseAngle?: number;
  influence?: number; // 0 keeps the base angle, 1 follows the pointer immediately
  enabled?: boolean;
}

/**
 * Maps the global mouse position to a continuous light angle.
 * Lower influence values reduce how much of the mouse orbit becomes source-angle travel.
 */
export function useMouseLumination({
  baseAngle = 180,
  influence = 1,
  enabled = true,
}: UseMouseLuminationOptions = {}) {
  const angleValue = useMotionValue(baseAngle);
  const continuousMouseAngle = useRef(baseAngle);
  const stabilizedLightVector = useRef(angleToLightingVector(baseAngle));
  const previousRawMouseAngle = useRef<number | null>(null);
  const resolvedInfluence = clampLightingInfluence(influence);

  useEffect(() => {
    if (!enabled || resolvedInfluence <= 0) {
      continuousMouseAngle.current = baseAngle;
      stabilizedLightVector.current = angleToLightingVector(baseAngle);
      previousRawMouseAngle.current = null;
      angleValue.set(baseAngle);
      return;
    }

    if (previousRawMouseAngle.current === null) {
      continuousMouseAngle.current = baseAngle;
      stabilizedLightVector.current = angleToLightingVector(baseAngle);
      angleValue.set(baseAngle);
      return;
    }

    angleValue.set(
      baseAngle + (continuousMouseAngle.current - baseAngle) * resolvedInfluence
    );
  }, [angleValue, baseAngle, enabled, resolvedInfluence]);

  useEffect(() => {
    if (!enabled || resolvedInfluence <= 0) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distanceFromCenter = Math.hypot(dx, dy);

      if (distanceFromCenter <= 1e-6) {
        return;
      }

      const minViewportSize = Math.min(window.innerWidth, window.innerHeight);
      const stabilizationInnerRadius = Math.max(28, minViewportSize * 0.035);
      const stabilizationOuterRadius = Math.max(
        stabilizationInnerRadius + 1,
        minViewportSize * 0.18
      );
      const responseWeight =
        0.12 +
        0.88 *
          smoothstep(
            stabilizationInnerRadius,
            stabilizationOuterRadius,
            distanceFromCenter
          );

      // The viewport center is an angular singularity, so we ease into the
      // pointer direction there instead of letting tiny moves flip the light.
      const targetLightVector = {
        x: -dx / distanceFromCenter,
        y: -dy / distanceFromCenter,
      };
      stabilizedLightVector.current = blendLightingVectors(
        stabilizedLightVector.current,
        targetLightVector,
        responseWeight
      );
      const targetAngle = vectorToLightingAngle(
        stabilizedLightVector.current.x,
        stabilizedLightVector.current.y
      );

      continuousMouseAngle.current =
        previousRawMouseAngle.current === null
          ? targetAngle
          : advanceContinuousAngle(
              continuousMouseAngle.current,
              targetAngle,
              previousRawMouseAngle.current
            );
      previousRawMouseAngle.current = targetAngle;

      angleValue.set(
        baseAngle + (continuousMouseAngle.current - baseAngle) * resolvedInfluence
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [angleValue, baseAngle, enabled, resolvedInfluence]);

  return angleValue;
}
