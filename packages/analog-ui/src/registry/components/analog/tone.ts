export const analogTones = [
  'primary',
  'secondary',
  'accent',
  'destructive',
  'success',
  'warning',
  'info',
  'neutral',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;

export type AnalogTone = (typeof analogTones)[number];
