export function clampLightingInfluence(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(min: number, max: number, value: number) {
  if (max <= min) {
    return value >= max ? 1 : 0;
  }

  const t = clampLightingInfluence((value - min) / (max - min));
  return t * t * (3 - 2 * t);
}

function getWrappedAngleDelta(targetAngle: number, currentAngle: number) {
  let delta = (targetAngle - currentAngle) % 360;

  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return delta;
}

export function advanceContinuousAngle(
  previousContinuousAngle: number,
  nextRawAngle: number,
  previousRawAngle: number
) {
  return previousContinuousAngle + getWrappedAngleDelta(nextRawAngle, previousRawAngle);
}

export type AnalogLightConstraintMode = 'clamp' | 'fold';

export function constrainAngleToArc(
  angle: number,
  anchor: number,
  arc: number,
  mode: AnalogLightConstraintMode = 'fold'
) {
  const constrainedArc = Math.min(360, Math.max(0, arc));

  if (constrainedArc >= 360) return angle;
  if (constrainedArc <= 0) return anchor;

  const halfArc = constrainedArc / 2;
  const delta = getWrappedAngleDelta(angle, anchor);

  if (mode === 'clamp') {
    return anchor + Math.max(-halfArc, Math.min(halfArc, delta));
  }

  const cycle = constrainedArc * 2;
  let foldedDelta = ((delta + halfArc) % cycle + cycle) % cycle;

  if (foldedDelta > constrainedArc) {
    foldedDelta = cycle - foldedDelta;
  }

  return anchor + foldedDelta - halfArc;
}

function normalizeCartesian(x: number, y: number) {
  const magnitude = Math.hypot(x, y);

  if (magnitude <= 1e-6) {
    return null;
  }

  return {
    x: x / magnitude,
    y: y / magnitude,
  };
}

export function angleToLightingVector(angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.sin(radians),
    y: -Math.cos(radians),
  };
}

export function vectorToLightingAngle(x: number, y: number) {
  return (Math.atan2(x, -y) * 180) / Math.PI;
}

export function blendLightingVectors(
  current: { x: number; y: number },
  target: { x: number; y: number },
  weight: number
) {
  const resolvedWeight = clampLightingInfluence(weight);

  if (resolvedWeight <= 0) return current;
  if (resolvedWeight >= 1) return target;

  const blendedVector = normalizeCartesian(
    current.x * (1 - resolvedWeight) + target.x * resolvedWeight,
    current.y * (1 - resolvedWeight) + target.y * resolvedWeight
  );

  return blendedVector ?? current;
}

export function blendAngleTowardSource(
  baseAngle: number,
  sourceAngle: number,
  travel: number
) {
  const weight = clampLightingInfluence(travel);

  if (weight <= 0) return baseAngle;
  if (weight >= 1) return sourceAngle;

  const blendedVector = blendLightingVectors(
    angleToLightingVector(baseAngle),
    angleToLightingVector(sourceAngle),
    weight
  );
  return vectorToLightingAngle(blendedVector.x, blendedVector.y);
}
