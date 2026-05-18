import * as React from 'react';
import { useMotionValue, type MotionValue } from 'motion/react';
import {
  advanceContinuousAngle,
  blendAngleTowardSource,
  constrainAngleToArc,
  type AnalogLightConstraintMode,
  vectorToLightingAngle,
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
    interactive?: boolean;
  };

export interface AnalogInteractivePointerLightingConfig {
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
   * Maximum influence of the component pointer angle before material channel travel is applied.
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

export type AnalogMotionLightingPermissionMode = 'on-interaction' | 'none';

export interface AnalogMotionLightingConfig {
  /**
   * Enables device-orientation lighting. When false, no device motion listeners or RAF work run.
   */
  enabled?: boolean;
  /**
   * Device tilt in degrees that maps to full influence.
   */
  maxTilt?: number;
  /**
   * Maximum influence of the tilt angle before material channel travel is applied.
   */
  strength?: number;
  /**
   * Normalized tilt magnitude that holds the base angle to avoid noisy sensor drift.
   */
  deadZone?: number;
  /**
   * Angle and power response per device-orientation frame. 1 follows directly.
   */
  responsiveness?: number;
  /**
   * Multipliers applied to provider power from flat through fully tilted.
   */
  powerRange?: readonly [number, number];
  /**
   * iOS requires sensor permission from a user gesture. on-interaction requests on first tap/key.
   */
  requestPermission?: AnalogMotionLightingPermissionMode;
}

export interface AnalogInteractiveLightingConfig {
  /**
   * Enables or disables all interactive lighting inputs.
   */
  enabled?: boolean;
  /**
   * Pointer-driven lighting, resolved from each registered component target.
   */
  pointer?: boolean | AnalogInteractivePointerLightingConfig;
  /**
   * Device-orientation lighting for mobile tilt.
   */
  motion?: boolean | AnalogMotionLightingConfig;
}

export interface UseAnalogLightingOptions {
  targetRef?: React.RefObject<HTMLElement | null>;
  interactive?: boolean;
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
  pointerLighting: AnalogPointerLightingController | null;
}

export interface AnalogLightingProviderProps {
  children: React.ReactNode;
  baseAngle?: number | MotionValue<number>;
  sourceAngle?: number | MotionValue<number>;
  power?: number | MotionValue<number>;
  materials?: Partial<Record<AnalogMaterialChannel, AnalogLightingSetting>>;
  interactiveLighting?: boolean | AnalogInteractiveLightingConfig;
}

const AnalogLightingContext = React.createContext<AnalogLightingContextValue | null>(null);

interface AnalogPointerLightingTargetConfig {
  channels: readonly AnalogMaterialChannel[];
  overrides?: AnalogLightingConfig;
  enabled: boolean;
}

interface AnalogPointerLightingTarget {
  element: HTMLElement;
  rect: DOMRect | null;
  getConfig: () => AnalogPointerLightingTargetConfig;
  previousRawAngle: number | null;
  continuousAngle: number;
  smoothedAngle: number | null;
}

interface AnalogPointerLightingController {
  enabled: boolean;
  registerTarget: (
    element: HTMLElement,
    getConfig: () => AnalogPointerLightingTargetConfig,
  ) => () => void;
}

interface ResolvedAnalogPointerLightingConfig {
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

interface ResolvedAnalogMotionLightingConfig {
  enabled: boolean;
  maxTilt: number;
  strength: number;
  deadZone: number;
  responsiveness: number;
  powerRange: readonly [number, number];
  requestPermission: AnalogMotionLightingPermissionMode;
}

interface AnalogLightingScene {
  baseAngle: number;
  sourceAngle: number;
  power: number;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
}

const DEFAULT_POINTER_LIGHTING_CONFIG: ResolvedAnalogPointerLightingConfig = {
  enabled: false,
  strength: 0.78,
  radius: 0.3,
  innerRadius: 0.35,
  minRadius: 2.2,
  maxRadius: 7,
  deadZone: 0.06,
  responsiveness: 0.42,
};

const DEFAULT_MOTION_LIGHTING_CONFIG: ResolvedAnalogMotionLightingConfig = {
  enabled: false,
  maxTilt: 34,
  strength: 0.52,
  deadZone: 0.08,
  responsiveness: 0.18,
  powerRange: [0.96, 1.08],
  requestPermission: 'on-interaction',
};

type AnalogDeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type AnalogDeviceOrientationListener = (event: DeviceOrientationEvent) => void;

const analogDeviceOrientationListeners = new Set<AnalogDeviceOrientationListener>();
let analogDeviceOrientationCleanup: (() => void) | null = null;
let analogMotionPermissionPromise: Promise<boolean> | null = null;

function getDeviceOrientationEventConstructor() {
  if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') {
    return null;
  }

  return window.DeviceOrientationEvent as AnalogDeviceOrientationEventConstructor;
}

function handleAnalogDeviceOrientation(event: DeviceOrientationEvent) {
  for (const listener of analogDeviceOrientationListeners) {
    listener(event);
  }
}

function addAnalogDeviceOrientationListener(listener: AnalogDeviceOrientationListener) {
  if (typeof window === 'undefined') return () => {};

  analogDeviceOrientationListeners.add(listener);

  if (!analogDeviceOrientationCleanup) {
    window.addEventListener('deviceorientation', handleAnalogDeviceOrientation, { passive: true });
    analogDeviceOrientationCleanup = () => {
      window.removeEventListener('deviceorientation', handleAnalogDeviceOrientation);
    };
  }

  return () => {
    analogDeviceOrientationListeners.delete(listener);

    if (analogDeviceOrientationListeners.size === 0 && analogDeviceOrientationCleanup) {
      analogDeviceOrientationCleanup();
      analogDeviceOrientationCleanup = null;
    }
  };
}

export function requestAnalogMotionLightingPermission() {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const OrientationEventConstructor = getDeviceOrientationEventConstructor();

  if (!OrientationEventConstructor) return Promise.resolve(false);
  if (typeof OrientationEventConstructor.requestPermission !== 'function') {
    return Promise.resolve(true);
  }

  analogMotionPermissionPromise ??= OrientationEventConstructor.requestPermission()
    .then((state) => state === 'granted')
    .catch(() => false);

  return analogMotionPermissionPromise;
}

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

function clampPowerRange(
  value: readonly [number, number] | undefined,
  fallback: readonly [number, number],
): readonly [number, number] {
  if (!value) return fallback;

  const first = Number.isFinite(value[0]) ? Math.max(0, value[0]) : fallback[0];
  const second = Number.isFinite(value[1]) ? Math.max(0, value[1]) : fallback[1];

  return first <= second ? [first, second] : [second, first];
}

function resolvePointerLightingConfig(
  value: boolean | AnalogInteractivePointerLightingConfig | undefined,
): ResolvedAnalogPointerLightingConfig {
  if (value === true) {
    return { ...DEFAULT_POINTER_LIGHTING_CONFIG, enabled: true };
  }

  if (!value || value.enabled === false) {
    return DEFAULT_POINTER_LIGHTING_CONFIG;
  }

  return {
    enabled: true,
    surfaceRef: value.surfaceRef,
    strength: clampResponsive(value.strength, DEFAULT_POINTER_LIGHTING_CONFIG.strength),
    radius: clampPositive(value.radius, DEFAULT_POINTER_LIGHTING_CONFIG.radius),
    innerRadius: clampPositive(value.innerRadius, DEFAULT_POINTER_LIGHTING_CONFIG.innerRadius),
    minRadius: clampPositive(value.minRadius, DEFAULT_POINTER_LIGHTING_CONFIG.minRadius),
    maxRadius: clampPositive(value.maxRadius, DEFAULT_POINTER_LIGHTING_CONFIG.maxRadius),
    deadZone: clampPositive(value.deadZone, DEFAULT_POINTER_LIGHTING_CONFIG.deadZone),
    responsiveness: clampResponsive(
      value.responsiveness,
      DEFAULT_POINTER_LIGHTING_CONFIG.responsiveness,
    ),
  };
}

function resolveMotionLightingConfig(
  value: boolean | AnalogMotionLightingConfig | undefined,
): ResolvedAnalogMotionLightingConfig {
  if (value === true) {
    return { ...DEFAULT_MOTION_LIGHTING_CONFIG, enabled: true };
  }

  if (!value || value.enabled === false) {
    return DEFAULT_MOTION_LIGHTING_CONFIG;
  }

  return {
    enabled: true,
    maxTilt: Math.max(1, clampPositive(value.maxTilt, DEFAULT_MOTION_LIGHTING_CONFIG.maxTilt)),
    strength: clampResponsive(value.strength, DEFAULT_MOTION_LIGHTING_CONFIG.strength),
    deadZone: clampResponsive(value.deadZone, DEFAULT_MOTION_LIGHTING_CONFIG.deadZone),
    responsiveness: clampResponsive(
      value.responsiveness,
      DEFAULT_MOTION_LIGHTING_CONFIG.responsiveness,
    ),
    powerRange: clampPowerRange(value.powerRange, DEFAULT_MOTION_LIGHTING_CONFIG.powerRange),
    requestPermission: value.requestPermission ?? DEFAULT_MOTION_LIGHTING_CONFIG.requestPermission,
  };
}

function resolveInteractiveLightingInputs(
  interactiveLighting: boolean | AnalogInteractiveLightingConfig | undefined,
) {
  if (!interactiveLighting) {
    return {
      pointer: false,
      motion: false,
    };
  }

  if (interactiveLighting === true) {
    return {
      pointer: true,
      motion: true,
    };
  }

  if (interactiveLighting.enabled === false) {
    return {
      pointer: false,
      motion: false,
    };
  }

  return {
    pointer: interactiveLighting.pointer ?? false,
    motion: interactiveLighting.motion ?? false,
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

function getScreenOrientationAngle() {
  const screenAngle = window.screen?.orientation?.angle;

  if (typeof screenAngle === 'number' && Number.isFinite(screenAngle)) {
    return screenAngle;
  }

  const legacyOrientation = (window as Window & { orientation?: number }).orientation;

  return typeof legacyOrientation === 'number' && Number.isFinite(legacyOrientation)
    ? legacyOrientation
    : 0;
}

function rotateCartesian(x: number, y: number, degrees: number) {
  if (degrees === 0) return { x, y };

  const radians = (-degrees * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
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
    const resolvedTravel = resolveLightingValue(value.travel, fallback.travel);

    return {
      travel: resolvedTravel,
      offset: Number.isFinite(value.offset) ? value.offset! : fallback.offset,
      constraint: resolveLightingConstraint(value.constraint, fallback.constraint),
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
    pointerLighting: context?.pointerLighting ?? null,
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

function useAnalogPointerLightingController({
  baseAngle,
  sourceAngle,
  power,
  materials,
  pointerLighting,
}: {
  baseAngle: AnalogLightingInputValue;
  sourceAngle: AnalogLightingInputValue;
  power: AnalogLightingInputValue;
  materials: Partial<Record<AnalogMaterialChannel, ResolvedAnalogLightingResponse>>;
  pointerLighting: boolean | AnalogInteractivePointerLightingConfig | undefined;
}) {
  const config = resolvePointerLightingConfig(pointerLighting);
  const configRef = React.useRef(config);
  const sceneInputsRef = React.useRef({
    baseAngle,
    sourceAngle,
    power,
    materials,
  });
  const surfaceRectRef = React.useRef<DOMRect | null>(null);
  const targetsRef = React.useRef(new Set<AnalogPointerLightingTarget>());
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
    (target: AnalogPointerLightingTarget, scene: AnalogLightingScene) => {
      const targetConfig = target.getConfig();

      target.element.style.setProperty('--analog-light-power', `${scene.power}`);
      target.element.style.setProperty('--analog-pointer-light-strength', '0');

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

  const writePointerLighting = React.useCallback(
    (target: AnalogPointerLightingTarget, scene: AnalogLightingScene) => {
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

      let pointerSourceAngle = scene.baseAngle;

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
        pointerSourceAngle = blendAngleTowardSource(
          scene.baseAngle,
          target.smoothedAngle,
          influence,
        );
      }

      target.element.style.setProperty('--analog-light-power', `${scene.power}`);
      target.element.style.setProperty('--analog-pointer-light-strength', `${influence}`);

      for (const channel of targetConfig.channels) {
        const response = resolveLightingResponse(
          targetConfig.overrides?.[channel],
          scene.materials[channel] ?? DEFAULT_ANALOG_MATERIAL_RESPONSES[channel],
        );
        const resolvedAngle = resolveAnalogLightAngle(
          scene.baseAngle,
          pointerSourceAngle,
          response,
        );

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
      writePointerLighting(target, scene);
    }
  }, [readScene, writePointerLighting]);

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
    (element: HTMLElement, getConfig: () => AnalogPointerLightingTargetConfig) => {
      const scene = readScene();
      const target: AnalogPointerLightingTarget = {
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
      writePointerLighting(target, scene);

      return () => {
        targetsRef.current.delete(target);
        resizeObserverRef.current?.unobserve(element);
        writeSceneLighting(target, readScene());
      };
    },
    [measureLayout, readScene, writePointerLighting, writeSceneLighting],
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

  return React.useMemo<AnalogPointerLightingController | null>(
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

function useAnalogMotionLighting({
  baseAngle,
  sourceAngle,
  power,
  motionLighting,
}: {
  baseAngle: AnalogLightingInputValue;
  sourceAngle: AnalogLightingInputValue;
  power: AnalogLightingInputValue;
  motionLighting: boolean | AnalogMotionLightingConfig | undefined;
}) {
  const config = resolveMotionLightingConfig(motionLighting);
  const fallbackSourceAngle = readLightingInput(sourceAngle, readLightingInput(baseAngle, 180));
  const fallbackPower = readLightingInput(power, 1);
  const sourceAngleValue = useMotionValue(fallbackSourceAngle);
  const powerValue = useMotionValue(fallbackPower);
  const configRef = React.useRef(config);
  const sceneInputsRef = React.useRef({
    baseAngle,
    sourceAngle,
    power,
  });
  const latestTiltRef = React.useRef<{ x: number; y: number; magnitude: number } | null>(null);
  const previousRawTiltAngleRef = React.useRef<number | null>(null);
  const continuousTiltAngleRef = React.useRef(fallbackSourceAngle);
  const animationFrameRef = React.useRef<number | null>(null);

  configRef.current = config;
  sceneInputsRef.current = {
    baseAngle,
    sourceAngle,
    power,
  };

  const readScene = React.useCallback(() => {
    const inputs = sceneInputsRef.current;
    const resolvedBaseAngle = readLightingInput(inputs.baseAngle, 180);

    return {
      baseAngle: resolvedBaseAngle,
      sourceAngle: readLightingInput(inputs.sourceAngle, resolvedBaseAngle),
      power: readLightingInput(inputs.power, 1),
    };
  }, []);

  const writeFallbackScene = React.useCallback(() => {
    const scene = readScene();

    sourceAngleValue.set(scene.sourceAngle);
    powerValue.set(scene.power);
  }, [powerValue, readScene, sourceAngleValue]);

  const processMotionLighting = React.useCallback(() => {
    animationFrameRef.current = null;

    if (!configRef.current.enabled) return;

    const resolvedConfig = configRef.current;
    const scene = readScene();
    const tilt = latestTiltRef.current;
    let targetAngle = scene.sourceAngle;
    let targetPower = scene.power;

    if (tilt && tilt.magnitude > resolvedConfig.deadZone) {
      const rawTiltAngle = vectorToLightingAngle(tilt.x, tilt.y);
      const tiltAmount = smoothstep(resolvedConfig.deadZone, 1, tilt.magnitude);
      const influence = resolvedConfig.strength * tiltAmount;
      const [minPower, maxPower] = resolvedConfig.powerRange;

      continuousTiltAngleRef.current =
        previousRawTiltAngleRef.current === null
          ? rawTiltAngle
          : advanceContinuousAngle(
              continuousTiltAngleRef.current,
              rawTiltAngle,
              previousRawTiltAngleRef.current,
            );
      previousRawTiltAngleRef.current = rawTiltAngle;
      targetAngle = blendAngleTowardSource(
        scene.sourceAngle,
        continuousTiltAngleRef.current,
        influence,
      );
      targetPower = scene.power * (minPower + (maxPower - minPower) * tiltAmount);
    }

    const responsiveness = resolvedConfig.responsiveness;
    const currentAngle = sourceAngleValue.get();
    const currentPower = powerValue.get();

    sourceAngleValue.set(advanceSmoothedAngle(currentAngle, targetAngle, responsiveness));
    powerValue.set(currentPower + (targetPower - currentPower) * responsiveness);
  }, [powerValue, readScene, sourceAngleValue]);

  const scheduleMotionLighting = React.useCallback(() => {
    if (!configRef.current.enabled || animationFrameRef.current !== null) return;

    animationFrameRef.current = window.requestAnimationFrame(processMotionLighting);
  }, [processMotionLighting]);

  const resolveTilt = React.useCallback((event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return null;

    const resolvedConfig = configRef.current;
    const maxTilt = Math.max(1, resolvedConfig.maxTilt);
    const rawX = Math.max(-1, Math.min(1, event.gamma / maxTilt));
    const rawY = Math.max(-1, Math.min(1, event.beta / maxTilt));
    const rotated = rotateCartesian(rawX, rawY, getScreenOrientationAngle());
    const magnitude = clamp01(Math.hypot(rotated.x, rotated.y));

    if (magnitude <= 1e-6) return null;

    return {
      x: rotated.x,
      y: rotated.y,
      magnitude,
    };
  }, []);

  React.useEffect(() => {
    if (!config.enabled) {
      latestTiltRef.current = null;
      previousRawTiltAngleRef.current = null;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      writeFallbackScene();
      return;
    }

    const OrientationEventConstructor = getDeviceOrientationEventConstructor();

    if (!OrientationEventConstructor) {
      writeFallbackScene();
      return;
    }

    let cleanupMotionListener: (() => void) | null = null;
    let isDisposed = false;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const tilt = resolveTilt(event);

      if (!tilt) return;

      latestTiltRef.current = tilt;
      scheduleMotionLighting();
    };
    const installMotionListener = () => {
      if (isDisposed || cleanupMotionListener) return;

      cleanupMotionListener = addAnalogDeviceOrientationListener(handleOrientation);
    };
    const requestAndInstall = () => {
      const latestConstructor = getDeviceOrientationEventConstructor();

      if (!latestConstructor) return;

      if (typeof latestConstructor.requestPermission !== 'function') {
        installMotionListener();
        return;
      }

      if (configRef.current.requestPermission === 'none') {
        installMotionListener();
        return;
      }

      void requestAnalogMotionLightingPermission().then((granted) => {
        if (granted) installMotionListener();
      });
    };

    if (
      typeof OrientationEventConstructor.requestPermission === 'function' &&
      config.requestPermission === 'on-interaction'
    ) {
      window.addEventListener('pointerdown', requestAndInstall, { once: true, passive: true });
      window.addEventListener('keydown', requestAndInstall, { once: true });
    } else {
      requestAndInstall();
    }

    scheduleMotionLighting();

    return () => {
      isDisposed = true;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      cleanupMotionListener?.();
      window.removeEventListener('pointerdown', requestAndInstall);
      window.removeEventListener('keydown', requestAndInstall);
    };
  }, [
    config.enabled,
    config.requestPermission,
    resolveTilt,
    scheduleMotionLighting,
    writeFallbackScene,
  ]);

  React.useEffect(() => {
    if (config.enabled) {
      scheduleMotionLighting();
    } else {
      writeFallbackScene();
    }
  });

  return React.useMemo(
    () =>
      config.enabled
        ? {
            sourceAngle: sourceAngleValue,
            power: powerValue,
          }
        : {
            sourceAngle,
            power,
          },
    [config.enabled, power, powerValue, sourceAngle, sourceAngleValue],
  );
}

export function AnalogLightingProvider({
  children,
  baseAngle = 180,
  sourceAngle,
  power = 1,
  materials,
  interactiveLighting,
}: AnalogLightingProviderProps) {
  const interactiveLightingInputs = resolveInteractiveLightingInputs(interactiveLighting);
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
  const sceneSourceAngle = sourceAngle ?? baseAngle;
  const motionLightingScene = useAnalogMotionLighting({
    baseAngle,
    sourceAngle: sceneSourceAngle,
    power,
    motionLighting: interactiveLightingInputs.motion,
  });
  const pointerLightingController = useAnalogPointerLightingController({
    baseAngle,
    sourceAngle: motionLightingScene.sourceAngle,
    power: motionLightingScene.power,
    materials: mergedMaterials,
    pointerLighting: interactiveLightingInputs.pointer,
  });

  const value = React.useMemo(
    () => ({
      baseAngle,
      sourceAngle: motionLightingScene.sourceAngle,
      power: motionLightingScene.power,
      materials: mergedMaterials,
      pointerLighting: pointerLightingController,
    }),
    [
      baseAngle,
      pointerLightingController,
      mergedMaterials,
      motionLightingScene.power,
      motionLightingScene.sourceAngle,
    ],
  );

  return <AnalogLightingContext.Provider value={value}>{children}</AnalogLightingContext.Provider>;
}

export function useAnalogLighting<Channel extends AnalogMaterialChannel>(
  channels: readonly Channel[],
  overrides?: AnalogLightingConfig<Channel>,
  options: UseAnalogLightingOptions = {},
) {
  const environment = useAnalogLightingEnvironment();
  const targetConfigRef = React.useRef<AnalogPointerLightingTargetConfig>({
    channels,
    overrides,
    enabled: false,
  });
  const pointerTargetEnabled =
    options.interactive !== false &&
    overrides?.interactive !== false &&
    environment.pointerLighting !== null;

  targetConfigRef.current = {
    channels,
    overrides,
    enabled: pointerTargetEnabled,
  };

  React.useEffect(() => {
    const element = options.targetRef?.current;

    if (!element || !environment.pointerLighting || !pointerTargetEnabled) return;

    return environment.pointerLighting.registerTarget(element, () => targetConfigRef.current);
  }, [environment.pointerLighting, pointerTargetEnabled, options.targetRef]);

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
