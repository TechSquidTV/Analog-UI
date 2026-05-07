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
  suspendRef?: RefObject<boolean>;
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
  suspendRef,
  deadZoneRadius = 8,
}: UseMouseLuminationOptions = {}) {
  const angleValue = useMotionValue(baseAngle);
  const continuousMouseAngle = useRef(baseAngle);
  const previousRawMouseAngle = useRef<number | null>(null);
  const anchorPoint = useRef<{ x: number; y: number } | null>(null);
  const pendingFrame = useRef<number | null>(null);
  const latestPointer = useRef<{ x: number; y: number } | null>(null);
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
    if (!enabled || resolvedInfluence <= 0) {
      latestPointer.current = null;
      anchorPoint.current = null;

      if (pendingFrame.current !== null) {
        window.cancelAnimationFrame(pendingFrame.current);
        pendingFrame.current = null;
      }

      return;
    }

    const updateAnchorPoint = () => {
      anchorPoint.current = resolveAnchorPoint(targetRef);
    };

    const isSuspended = () => suspendRef?.current === true;

    const processPointer = () => {
      pendingFrame.current = null;

      if (isSuspended()) return;

      const pointer = latestPointer.current;
      const anchor = anchorPoint.current;

      if (!pointer || !anchor) return;

      const dx = pointer.x - anchor.x;
      const dy = pointer.y - anchor.y;
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

    const handleMouseMove = (e: MouseEvent) => {
      if (isSuspended()) return;

      latestPointer.current = {
        x: e.clientX,
        y: e.clientY,
      };

      if (pendingFrame.current !== null) return;

      pendingFrame.current = window.requestAnimationFrame(processPointer);
    };

    const targetElement = targetRef?.current;
    const handlePointerMove = (e: PointerEvent) => {
      if (isSuspended()) return;

      latestPointer.current = {
        x: e.clientX,
        y: e.clientY,
      };

      if (pendingFrame.current !== null) return;

      pendingFrame.current = window.requestAnimationFrame(processPointer);
    };

    const handleTargetWarmup = () => {
      if (isSuspended()) return;

      updateAnchorPoint();
    };

    updateAnchorPoint();

    if (targetElement) {
      targetElement.addEventListener('pointermove', handlePointerMove, { passive: true });
      targetElement.addEventListener('pointerdown', handleTargetWarmup, { passive: true });
      targetElement.addEventListener('pointerenter', handleTargetWarmup, { passive: true });
    } else {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    window.addEventListener('resize', updateAnchorPoint, { passive: true });
    window.addEventListener('scroll', updateAnchorPoint, { passive: true });

    const observerTarget = targetElement;
    const resizeObserver =
      observerTarget && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateAnchorPoint())
        : null;
    resizeObserver?.observe(observerTarget);

    return () => {
      if (pendingFrame.current !== null) {
        window.cancelAnimationFrame(pendingFrame.current);
        pendingFrame.current = null;
      }

      resizeObserver?.disconnect();
      if (targetElement) {
        targetElement.removeEventListener('pointermove', handlePointerMove);
        targetElement.removeEventListener('pointerdown', handleTargetWarmup);
        targetElement.removeEventListener('pointerenter', handleTargetWarmup);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', updateAnchorPoint);
      window.removeEventListener('scroll', updateAnchorPoint);
    };
  }, [
    angleValue,
    baseAngle,
    enabled,
    resolvedDeadZoneRadius,
    resolvedInfluence,
    suspendRef,
    targetRef,
  ]);

  return angleValue;
}
