export interface RadialPoint {
  x: number;
  y: number;
}

export interface ResolveRadialMarksOptions<TMark> {
  min: number;
  max: number;
  startAngle: number;
  sweepAngle: number;
  fallbackRatio?: number | ((mark: TMark) => number);
}

export type ResolvedRadialMark<TMark extends { value: number; position?: number }> = TMark & {
  ratio: number;
  angle: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRatio(value: number, min: number, max: number, fallbackRatio = 0) {
  const range = max - min;

  if (range <= 0) return fallbackRatio;

  return clamp((value - min) / range, 0, 1);
}

export function ratioToAngle(ratio: number, startAngle: number, sweepAngle: number) {
  return startAngle + clamp(ratio, 0, 1) * sweepAngle;
}

export function valueToAngle(
  value: number,
  min: number,
  max: number,
  startAngle: number,
  sweepAngle: number,
  fallbackRatio = 0,
) {
  return ratioToAngle(normalizeRatio(value, min, max, fallbackRatio), startAngle, sweepAngle);
}

export function angleToRatio(angle: number, startAngle: number, sweepAngle: number) {
  if (sweepAngle === 0) return 0;

  return clamp((angle - startAngle) / sweepAngle, 0, 1);
}

export function getArcRatioFromPoint(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  startAngle: number,
  sweepAngle: number,
) {
  if (sweepAngle === 0) return 0;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
  const normalizedAngle = ((angle - startAngle + 360) % 360) % 360;

  if (normalizedAngle <= sweepAngle) {
    return clamp(normalizedAngle / sweepAngle, 0, 1);
  }

  const distanceToStart = Math.min(normalizedAngle, 360 - normalizedAngle);
  const distanceToEnd = Math.abs(normalizedAngle - sweepAngle);
  return distanceToStart < distanceToEnd ? 0 : 1;
}

export function polarPoint(
  radius: number,
  angle: number,
  centerX = 50,
  centerY = 50,
  precision = 4,
): RadialPoint {
  const radians = (angle * Math.PI) / 180;

  return {
    x: roundRadialNumber(centerX + Math.cos(radians) * radius, precision),
    y: roundRadialNumber(centerY + Math.sin(radians) * radius, precision),
  };
}

export function resolveRadialMarks<TMark extends { value: number; position?: number }>(
  marks: readonly TMark[],
  options: ResolveRadialMarksOptions<TMark>,
): Array<ResolvedRadialMark<TMark>> {
  const { min, max, startAngle, sweepAngle, fallbackRatio = 0 } = options;

  return marks.map((mark) => {
    const resolvedFallbackRatio =
      typeof fallbackRatio === 'function' ? fallbackRatio(mark) : fallbackRatio;
    const ratio =
      mark.position !== undefined
        ? clamp(mark.position, 0, 1)
        : normalizeRatio(mark.value, min, max, resolvedFallbackRatio);

    return {
      ...mark,
      ratio,
      angle: ratioToAngle(ratio, startAngle, sweepAngle),
    };
  });
}

function roundRadialNumber(value: number, precision: number) {
  return Number(value.toFixed(precision));
}
