export type AnalogWheelDirection = 'up' | 'down';

export function getWheelDirectionFactor(direction: AnalogWheelDirection) {
  return direction === 'down' ? 1 : -1;
}
