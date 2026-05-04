import { useEffect, useRef, type RefObject } from 'react';
import { useMotionValue } from 'motion/react';
import {
  advanceContinuousAngle,
  blendAngleTowardSource,
  clampLightingInfluence,
  vectorToLightingAngle,
} from './angle-utils';

export interface UseMouseLuminationOptions {
  baseAngle?: number;
  influence?: number; // 0 keeps the base angle, 1 follows the pointer immediately
  enabled?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
  deadZoneRadius?: number;
}

function resolveAnchorPoint(targetRef: RefObject<HTMLElement | null> | undefined) {
  const element = targetRef?.current;

  if (element) {
    const rect = element.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

/**
 * Maps the global mouse position to a continuous light angle around the lit surface.
 * Lower influence values blend the moving light back toward the base angle.
 */
export function useMouseLumination({
  baseAngle = 180,
  influence = 1,
  enabled = true,
  targetRef,
  deadZoneRadius = 8,
}: UseMouseLuminationOptions = {}) {
  const angleValue = useMotionValue(baseAngle);
  const continuousMouseAngle = useRef(baseAngle);
  const previousRawMouseAngle = useRef<number | null>(null);
  const resolvedInfluence = clampLightingInfluence(influence);
  const resolvedDeadZoneRadius = Math.max(0, deadZoneRadius);

  useEffect(() => {
    if (!enabled || resolvedInfluence <= 0) {
      continuousMouseAngle.current = baseAngle;
      previousRawMouseAngle.current = null;
      angleValue.set(baseAngle);
      return;
    }

    if (previousRawMouseAngle.current === null) {
      continuousMouseAngle.current = baseAngle;
      angleValue.set(baseAngle);
      return;
    }

    angleValue.set(
      blendAngleTowardSource(baseAngle, continuousMouseAngle.current, resolvedInfluence),
    );
  }, [angleValue, baseAngle, enabled, resolvedInfluence]);

  useEffect(() => {
    if (!enabled || resolvedInfluence <= 0) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x: cx, y: cy } = resolveAnchorPoint(targetRef);
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distanceFromCenter = Math.hypot(dx, dy);

      if (distanceFromCenter <= Math.max(1e-6, resolvedDeadZoneRadius)) {
        return;
      }

      const targetLightVector = {
        x: -dx / distanceFromCenter,
        y: -dy / distanceFromCenter,
      };
      const targetAngle = vectorToLightingAngle(targetLightVector.x, targetLightVector.y);

      continuousMouseAngle.current =
        previousRawMouseAngle.current === null
          ? targetAngle
          : advanceContinuousAngle(
              continuousMouseAngle.current,
              targetAngle,
              previousRawMouseAngle.current,
            );
      previousRawMouseAngle.current = targetAngle;

      angleValue.set(
        blendAngleTowardSource(baseAngle, continuousMouseAngle.current, resolvedInfluence),
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [angleValue, baseAngle, enabled, resolvedDeadZoneRadius, resolvedInfluence, targetRef]);

  return angleValue;
}
