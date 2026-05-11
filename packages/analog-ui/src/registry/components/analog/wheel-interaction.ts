export type WheelDirection = 'up' | 'down';

export function getWheelDirectionFactor(direction: WheelDirection) {
  return direction === 'down' ? 1 : -1;
}
