import * as React from 'react';
import type { MotionValue } from 'motion/react';
import {
  advanceContinuousAngle,
  blendAngleTowardSource,
  constrainAngleToArc,
  type AnalogLightConstraintMode,
} from '../../lib/angle-utils';

export const ANALOG_LIGHTING_PRESETS = {
  fixed: 0,
  muted: 0.2,
  standard: 0.45,
  eager: 0.8,
} as const;

export type AnalogLightingPreset = keyof typeof ANALOG_LIGHTING_PRESETS;
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
export interface AnalogLightStyleOptions extends AnalogLightingResponse {
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
  Partial<Record<Channel, AnalogLightingSetting>> & {
    local?: boolean;
  };

export interface AnalogLocalLightingConfig {
  /**
   * Enables component-relative lighting for controls that register a target element.
   * When false, no pointer listeners, observers, or RAF work are installed.
   */
  enabled?: boolean;
  /**
   * The lit surface used for pointer event scoping and dimension-relative falloff.
   * When omitted, the viewport is treated as the lighting surface.
   */
  surfaceRef?: React.RefObject<HTMLElement | null>;
  /**
   * Maximum influence of the local pointer angle before material channel travel is applied.
   */
  strength?: number;
  /**
   * Outer falloff radius as a fraction of the lit surface diagonal.
   */
  radius?: number;
  /**
   * Full-strength radius as a multiplier of the target diagonal.
   */
  innerRadius?: number;
  /**
   * Minimum outer falloff radius as a multiplier of the target diagonal.
   */
  minRadius?: number;
  /**
   * Maximum outer falloff radius as a multiplier of the target diagonal.
   */
  maxRadius?: number;
  /**
   * Center hold radius as a multiplier of the target diagonal.
   */
  deadZone?: number;
  /**
   * Angle response per pointer frame. 1 follows directly; lower values smooth direction changes.
   */
  responsiveness?: number;
}

export interface UseAnalogLightingOptions {
  targetRef?: React.RefObject<HTMLElement | null>;
  local?: boolean;
}

type AnalogLightingInputValue = number | MotionValue<number>;

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

export const DEFAULT_ANALOG_MATERIAL_RESPONSES: Record<
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
  baseAngle: AnalogLightingInputValue;
  sourceAngle: AnalogLightingInputValue;
  power: AnalogLightingInputValue;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
  localLighting: AnalogLocalLightingController | null;
}

export interface AnalogLightingProviderProps {
  children: React.ReactNode;
  baseAngle?: number | MotionValue<number>;
  sourceAngle?: number | MotionValue<number>;
  power?: number | MotionValue<number>;
  materials?: Partial<Record<AnalogMaterialChannel, AnalogLightingSetting>>;
  localLighting?: boolean | AnalogLocalLightingConfig;
}

const AnalogLightingContext = React.createContext<AnalogLightingContextValue | null>(null);

interface AnalogLocalLightingTargetConfig {
  channels: readonly AnalogMaterialChannel[];
  overrides?: AnalogLightingConfig;
  enabled: boolean;
}

interface AnalogLocalLightingTarget {
  element: HTMLElement;
  rect: DOMRect | null;
  getConfig: () => AnalogLocalLightingTargetConfig;
  previousRawAngle: number | null;
  continuousAngle: number;
  smoothedAngle: number | null;
}

interface AnalogLocalLightingController {
  enabled: boolean;
  registerTarget: (
    element: HTMLElement,
    getConfig: () => AnalogLocalLightingTargetConfig,
  ) => () => void;
}

interface ResolvedAnalogLocalLightingConfig {
  enabled: boolean;
  surfaceRef?: React.RefObject<HTMLElement | null>;
  strength: number;
  radius: number;
  innerRadius: number;
  minRadius: number;
  maxRadius: number;
  deadZone: number;
  responsiveness: number;
}

interface AnalogLightingScene {
  baseAngle: number;
  sourceAngle: number;
  power: number;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
}

const DEFAULT_LOCAL_LIGHTING_CONFIG: ResolvedAnalogLocalLightingConfig = {
  enabled: false,
  strength: 0.78,
  radius: 0.3,
  innerRadius: 0.35,
  minRadius: 2.2,
  maxRadius: 7,
  deadZone: 0.06,
  responsiveness: 0.42,
};

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

function readLightingInput(value: AnalogLightingInputValue | undefined, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (isMotionValue(value)) return value.get();
  return fallback;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampPositive(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function clampResponsive(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? clamp01(value) : fallback;
}

function resolveLocalLightingConfig(
  value: boolean | AnalogLocalLightingConfig | undefined,
): ResolvedAnalogLocalLightingConfig {
  if (value === true) {
    return { ...DEFAULT_LOCAL_LIGHTING_CONFIG, enabled: true };
  }

  if (!value || value.enabled === false) {
    return DEFAULT_LOCAL_LIGHTING_CONFIG;
  }

  return {
    enabled: true,
    surfaceRef: value.surfaceRef,
    strength: clampResponsive(value.strength, DEFAULT_LOCAL_LIGHTING_CONFIG.strength),
    radius: clampPositive(value.radius, DEFAULT_LOCAL_LIGHTING_CONFIG.radius),
    innerRadius: clampPositive(value.innerRadius, DEFAULT_LOCAL_LIGHTING_CONFIG.innerRadius),
    minRadius: clampPositive(value.minRadius, DEFAULT_LOCAL_LIGHTING_CONFIG.minRadius),
    maxRadius: clampPositive(value.maxRadius, DEFAULT_LOCAL_LIGHTING_CONFIG.maxRadius),
    deadZone: clampPositive(value.deadZone, DEFAULT_LOCAL_LIGHTING_CONFIG.deadZone),
    responsiveness: clampResponsive(
      value.responsiveness,
      DEFAULT_LOCAL_LIGHTING_CONFIG.responsiveness,
    ),
  };
}

function getAngleDelta(targetAngle: number, currentAngle: number) {
  let delta = (targetAngle - currentAngle) % 360;

  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return delta;
}

function advanceSmoothedAngle(currentAngle: number, targetAngle: number, responsiveness: number) {
  if (responsiveness >= 1) return targetAngle;
  if (responsiveness <= 0) return currentAngle;

  return currentAngle + getAngleDelta(targetAngle, currentAngle) * responsiveness;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;

  const progress = clamp01((value - edge0) / (edge1 - edge0));

  return progress * progress * (3 - 2 * progress);
}

function getViewportRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    toJSON: () => ({}),
  };
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

  if (typeof value === 'string' && value in ANALOG_LIGHTING_PRESETS) {
    return ANALOG_LIGHTING_PRESETS[value as AnalogLightingPreset];
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
  const baseAngleInput = context?.baseAngle ?? 180;
  const sourceAngleInput = context?.sourceAngle ?? baseAngleInput;
  const powerInput = context?.power ?? 1;
  const baseAngle = useResolvedMotionNumber(baseAngleInput, 180);
  const sourceAngle = useResolvedMotionNumber(sourceAngleInput, baseAngle);
  const power = useResolvedMotionNumber(powerInput, 1);
  const materials = context?.materials ?? DEFAULT_ANALOG_MATERIAL_RESPONSES;
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
    localLighting: context?.localLighting ?? null,
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

function useAnalogLocalLightingController({
  baseAngle,
  sourceAngle,
  power,
  materials,
  localLighting,
}: {
  baseAngle: AnalogLightingInputValue;
  sourceAngle: AnalogLightingInputValue;
  power: AnalogLightingInputValue;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
  localLighting: boolean | AnalogLocalLightingConfig | undefined;
}) {
  const config = resolveLocalLightingConfig(localLighting);
  const configRef = React.useRef(config);
  const sceneInputsRef = React.useRef({
    baseAngle,
    sourceAngle,
    power,
    materials,
  });
  const surfaceRectRef = React.useRef<DOMRect | null>(null);
  const targetsRef = React.useRef(new Set<AnalogLocalLightingTarget>());
  const latestPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

  configRef.current = config;
  sceneInputsRef.current = {
    baseAngle,
    sourceAngle,
    power,
    materials,
  };

  const readScene = React.useCallback((): AnalogLightingScene => {
    const inputs = sceneInputsRef.current;
    const resolvedBaseAngle = readLightingInput(inputs.baseAngle, 180);

    return {
      baseAngle: resolvedBaseAngle,
      sourceAngle: readLightingInput(inputs.sourceAngle, resolvedBaseAngle),
      power: readLightingInput(inputs.power, 1),
      materials: inputs.materials,
    };
  }, []);

  const measureLayout = React.useCallback(() => {
    const resolvedConfig = configRef.current;
    const surfaceElement = resolvedConfig.surfaceRef?.current;

    surfaceRectRef.current = surfaceElement?.getBoundingClientRect() ?? getViewportRect();

    for (const target of targetsRef.current) {
      target.rect = target.element.getBoundingClientRect();
    }
  }, []);

  const writeSceneLighting = React.useCallback(
    (target: AnalogLocalLightingTarget, scene: AnalogLightingScene) => {
      const targetConfig = target.getConfig();

      target.element.style.setProperty('--analog-light-power', `${scene.power}`);
      target.element.style.setProperty('--analog-local-light-strength', '0');

      for (const channel of targetConfig.channels) {
        const response = resolveLightingResponse(
          targetConfig.overrides?.[channel],
          scene.materials[channel] ?? DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
        );
        const resolvedAngle = resolveAnalogLightAngle(scene.baseAngle, scene.sourceAngle, response);

        target.element.style.setProperty(`--analog-light-angle-${channel}`, `${resolvedAngle}deg`);
      }
    },
    [],
  );

  const writeLocalLighting = React.useCallback(
    (target: AnalogLocalLightingTarget, scene: AnalogLightingScene) => {
      const targetConfig = target.getConfig();

      if (!targetConfig.enabled) {
        writeSceneLighting(target, scene);
        return;
      }

      const rect = target.rect;
      const surfaceRect = surfaceRectRef.current;
      const pointer = latestPointerRef.current;

      if (!rect || !surfaceRect || !pointer || rect.width <= 0 || rect.height <= 0) {
        writeSceneLighting(target, scene);
        return;
      }

      const resolvedConfig = configRef.current;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = pointer.x - centerX;
      const dy = pointer.y - centerY;
      const distance = Math.hypot(dx, dy);
      const componentSize = Math.max(1, Math.hypot(rect.width, rect.height));
      const surfaceSize = Math.max(1, Math.hypot(surfaceRect.width, surfaceRect.height));
      const innerRadius = componentSize * resolvedConfig.innerRadius;
      const outerRadius = Math.min(
        componentSize * resolvedConfig.maxRadius,
        Math.max(componentSize * resolvedConfig.minRadius, surfaceSize * resolvedConfig.radius),
      );
      const deadZoneRadius = componentSize * resolvedConfig.deadZone;
      const influence =
        resolvedConfig.strength * (1 - smoothstep(innerRadius, outerRadius, distance));

      let localSourceAngle = scene.baseAngle;

      if (influence > 0.0001) {
        const rawAngle =
          distance <= deadZoneRadius && target.previousRawAngle !== null
            ? target.previousRawAngle
            : (Math.atan2(
                dx / Math.max(1, surfaceRect.width * 0.5),
                -dy / Math.max(1, surfaceRect.height * 0.5),
              ) *
                180) /
              Math.PI;

        target.continuousAngle =
          target.previousRawAngle === null
            ? rawAngle
            : advanceContinuousAngle(target.continuousAngle, rawAngle, target.previousRawAngle);
        target.previousRawAngle = rawAngle;
        target.smoothedAngle =
          target.smoothedAngle === null
            ? target.continuousAngle
            : advanceSmoothedAngle(
                target.smoothedAngle,
                target.continuousAngle,
                resolvedConfig.responsiveness,
              );
        localSourceAngle = blendAngleTowardSource(scene.baseAngle, target.smoothedAngle, influence);
      }

      target.element.style.setProperty('--analog-light-power', `${scene.power}`);
      target.element.style.setProperty('--analog-local-light-strength', `${influence}`);

      for (const channel of targetConfig.channels) {
        const response = resolveLightingResponse(
          targetConfig.overrides?.[channel],
          scene.materials[channel] ?? DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
        );
        const resolvedAngle = resolveAnalogLightAngle(scene.baseAngle, localSourceAngle, response);

        target.element.style.setProperty(`--analog-light-angle-${channel}`, `${resolvedAngle}deg`);
      }
    },
    [writeSceneLighting],
  );

  const processLighting = React.useCallback(() => {
    animationFrameRef.current = null;

    if (!configRef.current.enabled) return;

    const scene = readScene();

    for (const target of targetsRef.current) {
      writeLocalLighting(target, scene);
    }
  }, [readScene, writeLocalLighting]);

  const scheduleLighting = React.useCallback(() => {
    if (!configRef.current.enabled || animationFrameRef.current !== null) return;

    animationFrameRef.current = window.requestAnimationFrame(processLighting);
  }, [processLighting]);

  const restoreTargets = React.useCallback(() => {
    const scene = readScene();

    for (const target of targetsRef.current) {
      writeSceneLighting(target, scene);
    }
  }, [readScene, writeSceneLighting]);

  const registerTarget = React.useCallback(
    (element: HTMLElement, getConfig: () => AnalogLocalLightingTargetConfig) => {
      const scene = readScene();
      const target: AnalogLocalLightingTarget = {
        element,
        rect: null,
        getConfig,
        previousRawAngle: null,
        continuousAngle: scene.baseAngle,
        smoothedAngle: null,
      };

      targetsRef.current.add(target);
      resizeObserverRef.current?.observe(element);
      measureLayout();
      writeLocalLighting(target, scene);

      return () => {
        targetsRef.current.delete(target);
        resizeObserverRef.current?.unobserve(element);
        writeSceneLighting(target, readScene());
      };
    },
    [measureLayout, readScene, writeLocalLighting, writeSceneLighting],
  );

  React.useEffect(() => {
    if (!config.enabled) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      latestPointerRef.current = null;
      restoreTargets();
      return;
    }

    const resolvedSurface = config.surfaceRef?.current;
    const handlePointerMove = (event: PointerEvent | MouseEvent) => {
      latestPointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      scheduleLighting();
    };
    const handlePointerWarmup = (event: PointerEvent | MouseEvent) => {
      measureLayout();
      handlePointerMove(event);
    };
    const handlePointerLeave = () => {
      latestPointerRef.current = null;
      scheduleLighting();
    };
    const handleLayoutChange = () => {
      measureLayout();
      scheduleLighting();
    };

    measureLayout();

    if (resolvedSurface) {
      resolvedSurface.addEventListener('pointermove', handlePointerMove, { passive: true });
      resolvedSurface.addEventListener('pointerenter', handlePointerWarmup, { passive: true });
      resolvedSurface.addEventListener('pointerdown', handlePointerWarmup, { passive: true });
      resolvedSurface.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    } else {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    window.addEventListener('resize', handleLayoutChange, { passive: true });
    window.addEventListener('scroll', handleLayoutChange, { passive: true });

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (resolvedSurface) {
        resolvedSurface.removeEventListener('pointermove', handlePointerMove);
        resolvedSurface.removeEventListener('pointerenter', handlePointerWarmup);
        resolvedSurface.removeEventListener('pointerdown', handlePointerWarmup);
        resolvedSurface.removeEventListener('pointerleave', handlePointerLeave);
      } else {
        window.removeEventListener('pointermove', handlePointerMove);
      }

      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('scroll', handleLayoutChange);
    };
  }, [config.enabled, config.surfaceRef, measureLayout, restoreTargets, scheduleLighting]);

  React.useEffect(() => {
    if (!config.enabled || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      measureLayout();
      scheduleLighting();
    });
    const resolvedSurface = config.surfaceRef?.current;

    resizeObserverRef.current = observer;

    if (resolvedSurface) {
      observer.observe(resolvedSurface);
    }

    for (const target of targetsRef.current) {
      observer.observe(target.element);
    }

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  }, [config.enabled, config.surfaceRef, measureLayout, scheduleLighting]);

  React.useEffect(() => {
    if (configRef.current.enabled) {
      scheduleLighting();
    }
  });

  return React.useMemo<AnalogLocalLightingController | null>(
    () =>
      config.enabled
        ? {
            enabled: true,
            registerTarget,
          }
        : null,
    [config.enabled, registerTarget],
  );
}

export function AnalogLightingProvider({
  children,
  baseAngle = 180,
  sourceAngle,
  power = 1,
  materials,
  localLighting,
}: AnalogLightingProviderProps) {
  const mergedMaterials = React.useMemo(() => {
    const next: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>> = {};

    for (const channel of Object.keys(
      DEFAULT_ANALOG_MATERIAL_RESPONSES,
    ) as AnalogMaterialChannel[]) {
      next[channel] = resolveLightingResponse(
        materials?.[channel],
        DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
      );
    }

    return next;
  }, [materials]);
  const resolvedSourceAngle = sourceAngle ?? baseAngle;
  const localLightingController = useAnalogLocalLightingController({
    baseAngle,
    sourceAngle: resolvedSourceAngle,
    power,
    materials: mergedMaterials,
    localLighting,
  });

  const value = React.useMemo(
    () => ({
      baseAngle,
      sourceAngle: resolvedSourceAngle,
      power,
      materials: mergedMaterials,
      localLighting: localLightingController,
    }),
    [baseAngle, localLightingController, mergedMaterials, power, resolvedSourceAngle],
  );

  return <AnalogLightingContext.Provider value={value}>{children}</AnalogLightingContext.Provider>;
}

export function useAnalogLighting<Channel extends AnalogMaterialChannel>(
  channels: readonly Channel[],
  overrides?: AnalogLightingConfig<Channel>,
  options: UseAnalogLightingOptions = {},
) {
  const environment = useAnalogLightingEnvironment();
  const targetConfigRef = React.useRef<AnalogLocalLightingTargetConfig>({
    channels,
    overrides,
    enabled: false,
  });
  const localTargetEnabled =
    options.local !== false && overrides?.local !== false && environment.localLighting !== null;

  targetConfigRef.current = {
    channels,
    overrides,
    enabled: localTargetEnabled,
  };

  React.useEffect(() => {
    const element = options.targetRef?.current;

    if (!element || !environment.localLighting || !localTargetEnabled) return;

    return environment.localLighting.registerTarget(element, () => targetConfigRef.current);
  }, [environment.localLighting, localTargetEnabled, options.targetRef]);

  const style = {
    '--analog-light-power': `${environment.power}`,
  } as React.CSSProperties & Record<string, string>;

  for (const channel of channels) {
    const response = resolveLightingResponse(
      overrides?.[channel],
      environment.materials[channel] ?? DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
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

export function useAnalogLightStyle<Channel extends AnalogMaterialChannel>(
  channel: Channel,
  options: AnalogLightStyleOptions = {},
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
  options: AnalogLightStyleOptions = {},
  override?: AnalogLightingSetting,
) {
  const environment = useAnalogLightingEnvironment();
  const response = resolveLightingResponse(
    override ?? options,
    environment.materials[channel] ?? DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
  );
  const effectResponse = resolveLightingResponse(options, response);
  const resolvedAngle = resolveAnalogLightAngle(
    environment.baseAngle,
    environment.sourceAngle,
    effectResponse,
  );

  return resolvedAngle;
}
