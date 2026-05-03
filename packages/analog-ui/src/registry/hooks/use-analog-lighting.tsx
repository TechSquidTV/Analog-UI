import * as React from 'react';
import type { MotionValue } from 'motion/react';
import {
  advanceContinuousAngle,
  blendAngleTowardSource,
  constrainAngleToArc,
  type AnalogLightConstraintMode,
} from './angle-utils';

export const LIGHTING_PRESETS = {
  fixed: 0,
  muted: 0.2,
  standard: 0.45,
  eager: 0.8,
} as const;

export type AnalogLightingPreset = keyof typeof LIGHTING_PRESETS;
export type AnalogLightingValue = number | AnalogLightingPreset;
export interface AnalogLightConstraint {
  anchor?: number;
  arc?: number;
  mode?: AnalogLightConstraintMode;
}

export interface AnalogLightingResponse {
  travel?: AnalogLightingValue;
  offset?: number;
  constraint?: AnalogLightConstraint;
}

export type AnalogLightingSetting = AnalogLightingValue | AnalogLightingResponse;
export interface AnalogLightEffectOptions extends AnalogLightingResponse {
  varName?: `--${string}`;
}

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

export type AnalogLightingConfig<Channel extends AnalogMaterialChannel = AnalogMaterialChannel> =
  Partial<Record<Channel, AnalogLightingSetting>>;

interface ResolvedAnalogLightingResponse {
  travel: number;
  offset: number;
  constraint: ResolvedAnalogLightConstraint | null;
}

interface ResolvedAnalogLightConstraint {
  anchor: number;
  arc: number;
  mode: AnalogLightConstraintMode;
}

interface LegacyAnalogLightingResponse extends AnalogLightingResponse {
  follow?: AnalogLightingValue;
}

export const DEFAULT_MATERIAL_RESPONSES: Record<
  AnalogMaterialChannel,
  ResolvedAnalogLightingResponse
> = {
  panel: { travel: 0.12, offset: 0, constraint: null },
  screw: { travel: 0.45, offset: 0, constraint: null },
  track: { travel: 0.14, offset: 0, constraint: null },
  wheel: { travel: 0.3, offset: 0, constraint: null },
  bezel: { travel: 0.5, offset: 0, constraint: null },
  lens: { travel: 0.9, offset: 0, constraint: null },
  thumb: { travel: 0.7, offset: 0, constraint: null },
  pointer: { travel: 1, offset: 0, constraint: null },
  surface: { travel: 0.75, offset: 0, constraint: null },
};

interface AnalogLightingContextValue {
  baseAngle: number;
  sourceAngle: number;
  power: number;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
}

export interface AnalogLightingProviderProps {
  children: React.ReactNode;
  baseAngle?: number | MotionValue<number>;
  sourceAngle?: number | MotionValue<number>;
  power?: number | MotionValue<number>;
  materials?: Partial<Record<AnalogMaterialChannel, AnalogLightingSetting>>;
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
  fallback: number,
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
      return value.on('change', (latest) => setResolved(latest));
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

function isLightingResponse(
  value: AnalogLightingSetting | undefined,
): value is AnalogLightingResponse {
  return typeof value === 'object' && value !== null;
}

function resolveLightingConstraint(
  value: AnalogLightConstraint | undefined,
  fallback: ResolvedAnalogLightConstraint | null,
): ResolvedAnalogLightConstraint | null {
  if (!value) return fallback;

  return {
    anchor: Number.isFinite(value.anchor) ? value.anchor : (fallback?.anchor ?? 180),
    arc: Number.isFinite(value.arc)
      ? Math.min(360, Math.max(0, value.arc!))
      : (fallback?.arc ?? 180),
    mode: value.mode ?? fallback?.mode ?? 'fold',
  };
}

function resolveLightingResponse(
  value: AnalogLightingSetting | undefined,
  fallback: ResolvedAnalogLightingResponse,
): ResolvedAnalogLightingResponse {
  if (isLightingResponse(value)) {
    const legacyValue = value as LegacyAnalogLightingResponse;
    const resolvedTravel = resolveLightingValue(
      legacyValue.travel ?? legacyValue.follow,
      fallback.travel,
    );

    return {
      travel: resolvedTravel,
      offset: Number.isFinite(legacyValue.offset) ? legacyValue.offset! : fallback.offset,
      constraint: resolveLightingConstraint(legacyValue.constraint, fallback.constraint),
    };
  }

  if (value !== undefined) {
    return {
      travel: resolveLightingValue(value, fallback.travel),
      offset: fallback.offset,
      constraint: fallback.constraint,
    };
  }

  return fallback;
}

function useAnalogLightingEnvironment() {
  const context = React.useContext(AnalogLightingContext);
  const baseAngle = context?.baseAngle ?? 180;
  const sourceAngle = context?.sourceAngle ?? baseAngle;
  const power = context?.power ?? 1;
  const materials = context?.materials ?? DEFAULT_MATERIAL_RESPONSES;
  const previousRawSourceAngle = React.useRef<number | null>(null);
  const continuousSourceAngle = React.useRef(sourceAngle);

  continuousSourceAngle.current =
    previousRawSourceAngle.current === null
      ? sourceAngle
      : advanceContinuousAngle(
          continuousSourceAngle.current,
          sourceAngle,
          previousRawSourceAngle.current,
        );
  previousRawSourceAngle.current = sourceAngle;

  return {
    baseAngle,
    sourceAngle: continuousSourceAngle.current,
    power,
    materials,
  };
}

function resolveAnalogLightAngle(
  baseAngle: number,
  sourceAngle: number,
  response: ResolvedAnalogLightingResponse,
) {
  let resolvedAngle =
    blendAngleTowardSource(baseAngle, sourceAngle, response.travel) + response.offset;

  if (response.constraint) {
    resolvedAngle = constrainAngleToArc(
      resolvedAngle,
      response.constraint.anchor,
      response.constraint.arc,
      response.constraint.mode,
    );
  }

  return resolvedAngle;
}

export function AnalogLightingProvider({
  children,
  baseAngle = 180,
  sourceAngle,
  power = 1,
  materials,
}: AnalogLightingProviderProps) {
  const resolvedBaseAngle = useResolvedMotionNumber(baseAngle, 180);
  const resolvedSourceAngle = useResolvedMotionNumber(sourceAngle, resolvedBaseAngle);
  const resolvedPower = useResolvedMotionNumber(power, 1);

  const mergedMaterials = React.useMemo(() => {
    const next: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>> = {};

    for (const channel of Object.keys(DEFAULT_MATERIAL_RESPONSES) as AnalogMaterialChannel[]) {
      next[channel] = resolveLightingResponse(
        materials?.[channel],
        DEFAULT_MATERIAL_RESPONSES[channel],
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
    [mergedMaterials, resolvedBaseAngle, resolvedPower, resolvedSourceAngle],
  );

  return <AnalogLightingContext.Provider value={value}>{children}</AnalogLightingContext.Provider>;
}

export function useAnalogLighting<Channel extends AnalogMaterialChannel>(
  channels: readonly Channel[],
  overrides?: AnalogLightingConfig<Channel>,
) {
  const environment = useAnalogLightingEnvironment();

  const style = {
    '--analog-light-power': `${environment.power}`,
  } as React.CSSProperties & Record<string, string>;

  for (const channel of channels) {
    const response = resolveLightingResponse(
      overrides?.[channel],
      environment.materials[channel] ?? DEFAULT_MATERIAL_RESPONSES[channel],
    );
    const resolvedAngle = resolveAnalogLightAngle(
      environment.baseAngle,
      environment.sourceAngle,
      response,
    );
    style[`--analog-light-angle-${channel}`] = `${resolvedAngle}deg`;
  }

  return style;
}

export function useAnalogLightEffect<Channel extends AnalogMaterialChannel>(
  channel: Channel,
  options: AnalogLightEffectOptions = {},
  override?: AnalogLightingSetting,
) {
  const resolvedAngle = useAnalogLightAngle(channel, options, override);
  const environment = useAnalogLightingEnvironment();
  const variableName = options.varName ?? (`--analog-light-angle-${channel}` as const);

  return {
    '--analog-light-power': `${environment.power}`,
    [variableName]: `${resolvedAngle}deg`,
  } as React.CSSProperties & Record<string, string>;
}

export function useAnalogLightAngle<Channel extends AnalogMaterialChannel>(
  channel: Channel,
  options: AnalogLightEffectOptions = {},
  override?: AnalogLightingSetting,
) {
  const environment = useAnalogLightingEnvironment();
  const response = resolveLightingResponse(
    override ?? options,
    environment.materials[channel] ?? DEFAULT_MATERIAL_RESPONSES[channel],
  );
  const effectResponse = resolveLightingResponse(options, response);
  const resolvedAngle = resolveAnalogLightAngle(
    environment.baseAngle,
    environment.sourceAngle,
    effectResponse,
  );

  return resolvedAngle;
}
