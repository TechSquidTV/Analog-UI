import * as React from 'react';
import type { MotionValue } from 'motion/react';

export const LIGHTING_PRESETS = {
  fixed: 0,
  muted: 0.2,
  standard: 0.45,
  eager: 0.8,
} as const;

export type AnalogLightingPreset = keyof typeof LIGHTING_PRESETS;
export type AnalogLightingValue = number | AnalogLightingPreset;

export type AnalogMaterialChannel =
  | 'panel'
  | 'screw'
  | 'track'
  | 'wheel'
  | 'bezel'
  | 'lens'
  | 'thumb'
  | 'pointer'
  | 'surface';

export type AnalogLightingConfig<
  Channel extends AnalogMaterialChannel = AnalogMaterialChannel,
> = Partial<Record<Channel, AnalogLightingValue>>;

export const DEFAULT_MATERIAL_INFLUENCES: Record<AnalogMaterialChannel, number> = {
  panel: LIGHTING_PRESETS.muted,
  screw: 0.3,
  track: 0.18,
  wheel: 0.55,
  bezel: 0.35,
  lens: LIGHTING_PRESETS.eager,
  thumb: 0.5,
  pointer: 0.7,
  surface: LIGHTING_PRESETS.standard,
};

interface AnalogLightingContextValue {
  baseAngle: number;
  sourceAngle: number;
  power: number;
  materials: Partial<Record<AnalogMaterialChannel, number>>;
}

export interface AnalogLightingProviderProps {
  children: React.ReactNode;
  baseAngle?: number | MotionValue<number>;
  sourceAngle?: number | MotionValue<number>;
  power?: number | MotionValue<number>;
  materials?: Partial<Record<AnalogMaterialChannel, AnalogLightingValue>>;
}

const AnalogLightingContext = React.createContext<AnalogLightingContextValue | null>(null);

function isMotionValue(value: unknown): value is MotionValue<number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'get' in value &&
    typeof (value as { get?: unknown }).get === 'function' &&
    'on' in value &&
    typeof (value as { on?: unknown }).on === 'function'
  );
}

function useResolvedMotionNumber(
  value: number | MotionValue<number> | undefined,
  fallback: number
) {
  const [resolved, setResolved] = React.useState(() => {
    if (typeof value === 'number') return value;
    if (isMotionValue(value)) return value.get();
    return fallback;
  });

  React.useEffect(() => {
    if (typeof value === 'number') {
      setResolved(value);
      return;
    }

    if (isMotionValue(value)) {
      setResolved(value.get());
      return value.on('change', latest => setResolved(latest));
    }

    setResolved(fallback);
  }, [fallback, value]);

  return resolved;
}

function resolveLightingValue(value: AnalogLightingValue | undefined, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }

  if (typeof value === 'string' && value in LIGHTING_PRESETS) {
    return LIGHTING_PRESETS[value as AnalogLightingPreset];
  }

  return fallback;
}

export function AnalogLightingProvider({
  children,
  baseAngle = 180,
  sourceAngle,
  power = 1,
  materials,
}: AnalogLightingProviderProps) {
  const resolvedBaseAngle = useResolvedMotionNumber(baseAngle, 180);
  const resolvedSourceAngle = useResolvedMotionNumber(
    sourceAngle,
    resolvedBaseAngle
  );
  const resolvedPower = useResolvedMotionNumber(power, 1);

  const mergedMaterials = React.useMemo(() => {
    const next: Partial<Record<AnalogMaterialChannel, number>> = {};

    for (const channel of Object.keys(DEFAULT_MATERIAL_INFLUENCES) as AnalogMaterialChannel[]) {
      next[channel] = resolveLightingValue(
        materials?.[channel],
        DEFAULT_MATERIAL_INFLUENCES[channel]
      );
    }

    return next;
  }, [materials]);

  const value = React.useMemo(
    () => ({
      baseAngle: resolvedBaseAngle,
      sourceAngle: resolvedSourceAngle,
      power: resolvedPower,
      materials: mergedMaterials,
    }),
    [mergedMaterials, resolvedBaseAngle, resolvedPower, resolvedSourceAngle]
  );

  return (
    <AnalogLightingContext.Provider value={value}>
      {children}
    </AnalogLightingContext.Provider>
  );
}

export function useAnalogLighting<
  Channel extends AnalogMaterialChannel,
>(
  channels: readonly Channel[],
  overrides?: AnalogLightingConfig<Channel>
) {
  const context = React.useContext(AnalogLightingContext);
  const baseAngle = context?.baseAngle ?? 180;
  const sourceAngle = context?.sourceAngle ?? baseAngle;
  const power = context?.power ?? 1;
  const contextMaterials = context?.materials ?? DEFAULT_MATERIAL_INFLUENCES;

  const style = {
    '--analog-light-power': `${power}`,
  } as React.CSSProperties & Record<string, string>;

  for (const channel of channels) {
    const influence = resolveLightingValue(
      overrides?.[channel],
      contextMaterials[channel] ?? DEFAULT_MATERIAL_INFLUENCES[channel]
    );

    const resolvedAngle = baseAngle + (sourceAngle - baseAngle) * influence;
    style[`--analog-light-angle-${channel}`] = `${resolvedAngle}deg`;
  }

  return style;
}
