import * as React from 'react';
import { cn } from '@/lib/utils';
import type { AnalogOrientation } from './orientation';
import {
  useAnalogMaterialVariant,
  type AnalogMaterialVariant,
} from '../../hooks/analog-material-scope';

type RockerVariant = AnalogMaterialVariant;
type RockerOrientation = AnalogOrientation;
type RockerRaisedSide = 'start' | 'end' | 'both';
type RockerSingleSide = Exclude<RockerRaisedSide, 'both'>;
type RockerSurfaceMode = 'single' | 'dual';
type CssLength = number | string;

const cssVariableBlendMode = (value: `var(${string})`) =>
  value as unknown as React.CSSProperties['mixBlendMode'];

const cssLength = (value: CssLength) => (typeof value === 'number' ? `${value}px` : value);
const negativeCssLength = (value: CssLength) =>
  typeof value === 'number' ? `${-value}px` : `calc(${value} * -1)`;

export interface RockerThumbSurfaceProps {
  className?: string;
  variant?: RockerVariant;
  orientation?: RockerOrientation;
  raisedSide?: RockerRaisedSide;
  children?: React.ReactNode;
  extrusionLayers?: number;
}

const axisGradientAngle = (orientation: RockerOrientation) =>
  orientation === 'horizontal'
    ? 'calc(var(--analog-light-angle-thumb, 180deg) - 90deg)'
    : 'var(--analog-light-angle-thumb, 180deg)';

const crossAxisGradientAngle = (orientation: RockerOrientation) =>
  orientation === 'horizontal'
    ? 'calc(var(--analog-light-angle-thumb, 180deg) - 10deg)'
    : 'calc(var(--analog-light-angle-thumb, 180deg) - 100deg)';

const axisInset = (
  orientation: RockerOrientation,
  direction: RockerSingleSide,
  distance: CssLength,
  blur: CssLength,
  color: string,
) =>
  orientation === 'horizontal'
    ? `inset ${
        direction === 'start' ? cssLength(distance) : negativeCssLength(distance)
      } 0 ${cssLength(blur)} ${color}`
    : `inset 0 ${
        direction === 'start' ? cssLength(distance) : negativeCssLength(distance)
      } ${cssLength(blur)} ${color}`;

const axisDrop = (
  orientation: RockerOrientation,
  direction: RockerSingleSide,
  mainOffset: CssLength,
  crossOffset: CssLength,
  blur: CssLength,
  spread: CssLength,
  color: string,
) =>
  orientation === 'horizontal'
    ? `${
        direction === 'start' ? cssLength(mainOffset) : negativeCssLength(mainOffset)
      } ${cssLength(crossOffset)} ${cssLength(blur)} ${cssLength(spread)} ${color}`
    : `${cssLength(crossOffset)} ${
        direction === 'start' ? cssLength(mainOffset) : negativeCssLength(mainOffset)
      } ${cssLength(blur)} ${cssLength(spread)} ${color}`;

const singleFaceBackground = (
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
  surfaceMode: RockerSurfaceMode,
) => {
  const angle = axisGradientAngle(orientation);
  const leadingTone =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-leading-tone-dual)'
      : 'var(--analog-rocker-leading-tone-single)';
  const centerTone =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-center-tone-dual)'
      : 'var(--analog-rocker-center-tone-single)';
  const trailingTone =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-trailing-tone-dual)'
      : 'var(--analog-rocker-trailing-tone-single)';
  const [startTone, endTone] =
    raisedSide === 'start' ? [leadingTone, trailingTone] : [trailingTone, leadingTone];

  return `linear-gradient(${angle}, ${startTone}, ${centerTone} 50%, ${endTone})`;
};

const singleFaceShadow = (
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
  surfaceMode: RockerSurfaceMode,
) => {
  const dropAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-drop-alpha-dual)'
      : 'var(--analog-rocker-drop-alpha-single)';
  const oppositeShadowAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-opposite-shadow-alpha-dual)'
      : 'var(--analog-rocker-opposite-shadow-alpha-single)';
  const drop = axisDrop(
    orientation,
    raisedSide,
    'calc(var(--analog-bevel-width, 4px) * 3)',
    'calc(var(--analog-bevel-width, 4px) * 1.5)',
    'calc(var(--analog-bevel-width, 4px) * 3.75)',
    'calc(var(--analog-bevel-width, 4px) * -1)',
    `rgba(0,0,0,calc(${dropAlpha} * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
  );

  return [
    drop,
    axisInset(
      orientation,
      raisedSide,
      'calc(var(--analog-bevel-width, 4px) * 0.5)',
      'calc(var(--analog-bevel-width, 4px) * 1.5)',
      `rgba(255,255,255,calc(var(--analog-rocker-highlight-alpha) * var(--analog-light-power, 1)))`,
    ),
    axisInset(
      orientation,
      raisedSide === 'start' ? 'end' : 'start',
      'calc(var(--analog-bevel-width, 4px) * 1.5)',
      'calc(var(--analog-bevel-width, 4px) * 3)',
      `rgba(0,0,0,calc(${oppositeShadowAlpha} * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
    ),
    `inset 0 calc(var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.75) rgba(255,255,255,calc(var(--analog-rocker-top-highlight-alpha) * var(--analog-light-power, 1)))`,
  ].join(', ');
};

const getContainerTransform = (orientation: RockerOrientation, raisedSide: RockerSingleSide) => {
  if (orientation === 'horizontal') {
    return raisedSide === 'start'
      ? 'translateZ(2px) rotateY(-18deg)'
      : 'translateZ(2px) rotateY(18deg)';
  }

  return raisedSide === 'start'
    ? 'translateZ(2px) rotateX(18deg)'
    : 'translateZ(2px) rotateX(-18deg)';
};

const getSingleFaceStyle = (
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
  surfaceMode: RockerSurfaceMode,
): React.CSSProperties => ({
  background: singleFaceBackground(orientation, raisedSide, surfaceMode),
  boxShadow: singleFaceShadow(orientation, raisedSide, surfaceMode),
});

const GripRidges = ({
  orientation,
  position,
  surfaceMode,
}: {
  orientation: RockerOrientation;
  position: 'start' | 'end';
  surfaceMode: RockerSurfaceMode;
}) => {
  const isHorizontal = orientation === 'horizontal';
  const ridgeOpacity =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-ridge-opacity-dual)'
      : 'var(--analog-rocker-ridge-opacity-single)';
  const ridgeHighlightAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-ridge-highlight-alpha-dual)'
      : 'var(--analog-rocker-ridge-highlight-alpha-single)';
  const ridgeShadowAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-ridge-shadow-alpha-dual)'
      : 'var(--analog-rocker-ridge-shadow-alpha-single)';

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        'mix-blend-soft-light',
        isHorizontal
          ? 'top-1/2 -translate-y-1/2 flex h-[56%] gap-[4px] px-1'
          : 'left-1/2 -translate-x-1/2 flex w-[56%] flex-col gap-[4px] py-1',
        isHorizontal
          ? position === 'start'
            ? 'left-[18%]'
            : 'right-[18%]'
          : position === 'start'
            ? 'top-[18%]'
            : 'bottom-[18%]',
      )}
      style={{ opacity: ridgeOpacity }}
    >
      {[...Array(4)].map((_, index) => (
        <div
          key={`${position}-ridge-${index}`}
          className={cn(
            isHorizontal ? 'h-full w-[2px]' : 'h-[2px] w-full',
            'rounded-[var(--analog-radius-micro)]',
          )}
          style={{
            background: `linear-gradient(${isHorizontal ? 'to right' : 'to bottom'}, var(--analog-rocker-ridge-edge-tone), var(--analog-rocker-ridge-center-tone) 50%, var(--analog-rocker-ridge-edge-tone))`,
            boxShadow: isHorizontal
              ? `calc(var(--analog-bevel-width, 4px) * 0.25) 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgba(255,255,255,calc(${ridgeHighlightAlpha} * var(--analog-light-power, 1))), calc(var(--analog-bevel-width, 4px) * -0.25) 0 calc(var(--analog-bevel-width, 4px) * 0.5) rgba(0,0,0,calc(${ridgeShadowAlpha} * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`
              : `0 calc(var(--analog-bevel-width, 4px) * 0.25) calc(var(--analog-bevel-width, 4px) * 0.25) rgba(255,255,255,calc(${ridgeHighlightAlpha} * var(--analog-light-power, 1))), 0 calc(var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.5) rgba(0,0,0,calc(${ridgeShadowAlpha} * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1)))`,
          }}
        />
      ))}
    </div>
  );
};

function RockerOverlay({
  orientation,
  showCenterSeam = true,
  gripPositions = ['start', 'end'],
  surfaceMode,
  children,
}: {
  orientation: RockerOrientation;
  showCenterSeam?: boolean;
  gripPositions?: Array<'start' | 'end'>;
  surfaceMode: RockerSurfaceMode;
  children?: React.ReactNode;
}) {
  const foilOpacity =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-foil-opacity-dual)'
      : 'var(--analog-rocker-foil-opacity-single)';
  const glareCoreAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-glare-core-alpha-dual)'
      : 'var(--analog-rocker-glare-core-alpha-single)';
  const glareMidAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-glare-mid-alpha-dual)'
      : 'var(--analog-rocker-glare-mid-alpha-single)';
  const glareEdgeAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-glare-edge-alpha-dual)'
      : 'var(--analog-rocker-glare-edge-alpha-single)';
  const sheenHighlightAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-sheen-highlight-alpha-dual)'
      : 'var(--analog-rocker-sheen-highlight-alpha-single)';
  const sheenShadowAlpha =
    surfaceMode === 'dual'
      ? 'var(--analog-rocker-sheen-shadow-alpha-dual)'
      : 'var(--analog-rocker-sheen-shadow-alpha-single)';

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[var(--analog-radius-window)]">
      <div
        className="analog-foil z-[1]"
        style={{
          backgroundSize: '250%',
          opacity: foilOpacity,
          mixBlendMode: cssVariableBlendMode('var(--analog-rocker-foil-blend)'),
          filter: 'var(--analog-rocker-foil-filter)',
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `linear-gradient(${axisGradientAngle(orientation)}, rgba(255,255,255,calc(${sheenHighlightAlpha} * var(--analog-light-power, 1))) 0%, rgba(255,255,255,0.02) 38%, rgba(255,255,255,0) 56%, rgba(0,0,0,calc(${sheenShadowAlpha} * var(--analog-light-power, 1))) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          mixBlendMode: cssVariableBlendMode('var(--analog-rocker-glare-blend)'),
          background: `linear-gradient(${crossAxisGradientAngle(orientation)}, transparent 4%, rgba(255,255,255,calc(${glareEdgeAlpha} * 0.85 * var(--analog-light-power, 1))) 24%, rgba(255,255,255,calc(${glareMidAlpha} * var(--analog-light-power, 1))) 40%, rgba(255,255,255,calc(${glareCoreAlpha} * 0.72 * var(--analog-light-power, 1))) 50%, rgba(255,255,255,calc(${glareMidAlpha} * var(--analog-light-power, 1))) 60%, rgba(255,255,255,calc(${glareEdgeAlpha} * 0.85 * var(--analog-light-power, 1))) 76%, transparent 96%), radial-gradient(110% 72% at 50% 24%, rgba(255,255,255,calc(${glareMidAlpha} * var(--analog-light-power, 1))) 0%, rgba(255,255,255,calc(${glareEdgeAlpha} * var(--analog-light-power, 1))) 42%, transparent 78%)`,
          filter: 'blur(calc(var(--analog-bevel-width, 4px) * 0.3375))',
        }}
      />

      {showCenterSeam ? (
        <div
          className={cn(
            'absolute z-[4]',
            'bg-black/10',
            orientation === 'horizontal'
              ? 'top-0 bottom-0 left-1/2 -ml-[1px] w-[2px]'
              : 'left-0 right-0 top-1/2 -mt-[1px] h-[2px]',
          )}
          style={{
            boxShadow:
              orientation === 'horizontal'
                ? `1px 0 0 rgba(255,255,255,calc(0.1 * var(--analog-light-power, 1)))`
                : `0 1px 0 rgba(255,255,255,calc(0.1 * var(--analog-light-power, 1)))`,
          }}
        />
      ) : null}

      {children ? <div className="absolute inset-0 z-[6]">{children}</div> : null}

      <div className="absolute inset-0 z-[5]">
        {gripPositions.includes('start') ? (
          <GripRidges orientation={orientation} position="start" surfaceMode={surfaceMode} />
        ) : null}
        {gripPositions.includes('end') ? (
          <GripRidges orientation={orientation} position="end" surfaceMode={surfaceMode} />
        ) : null}
      </div>
    </div>
  );
}

function RockerSegment({
  className,
  faceClassName,
  orientation,
  raisedSide,
  extrusionLayers,
  surfaceMode,
  style,
  children,
}: {
  className?: string;
  faceClassName?: string;
  orientation: RockerOrientation;
  raisedSide: RockerSingleSide;
  extrusionLayers: number;
  surfaceMode: RockerSurfaceMode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('pointer-events-none', className)} style={style}>
      <div className="relative size-full" style={{ perspective: '800px' }}>
        <div
          className="absolute inset-0 rounded-[var(--analog-radius-window)]"
          style={{
            transformOrigin: 'center',
            transform: getContainerTransform(orientation, raisedSide),
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s cubic-bezier(1, 0, 1, 1)',
          }}
        >
          {[...Array(extrusionLayers)].map((_, index) => (
            <div
              key={`extrusion-${raisedSide}-${index}`}
              className="absolute inset-0 rounded-[var(--analog-radius-window)] border"
              style={{
                transform: `translateZ(-${index + 1}px)`,
                backgroundColor: 'var(--analog-material-mid)',
                borderColor: 'var(--analog-material-border)',
              }}
            />
          ))}

          <div
            className={cn('absolute inset-0', faceClassName)}
            style={{
              ...getSingleFaceStyle(orientation, raisedSide, surfaceMode),
              transformStyle: 'preserve-3d',
              transition: 'all 0.3s cubic-bezier(1, 0, 1, 1)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const getDualClipStyle = (orientation: RockerOrientation, visibleSide: RockerSingleSide) => {
  if (orientation === 'horizontal') {
    return {
      clipPath:
        visibleSide === 'start' ? 'inset(-24px 49% -24px -24px)' : 'inset(-24px -24px -24px 49%)',
    } satisfies React.CSSProperties;
  }

  return {
    clipPath:
      visibleSide === 'start' ? 'inset(-24px -24px 49% -24px)' : 'inset(49% -24px -24px -24px)',
  } satisfies React.CSSProperties;
};

export function RockerThumbSurface({
  className,
  variant,
  orientation = 'horizontal',
  raisedSide = 'start',
  children,
  extrusionLayers = 24,
}: RockerThumbSurfaceProps) {
  const resolvedVariant = useAnalogMaterialVariant(variant);
  const isDual = raisedSide === 'both';
  const surfaceMode: RockerSurfaceMode = isDual ? 'dual' : 'single';

  if (!isDual) {
    return (
      <div
        data-analog-variant={resolvedVariant}
        className={cn('relative pointer-events-none', className)}
      >
        <RockerSegment
          className="absolute inset-0"
          faceClassName="overflow-hidden rounded-[var(--analog-radius-window)]"
          orientation={orientation}
          raisedSide={raisedSide}
          extrusionLayers={extrusionLayers}
          surfaceMode={surfaceMode}
        >
          <RockerOverlay orientation={orientation} surfaceMode={surfaceMode}>
            {children}
          </RockerOverlay>
        </RockerSegment>
      </div>
    );
  }

  return (
    <div
      data-analog-variant={resolvedVariant}
      className={cn('relative pointer-events-none', className)}
    >
      <RockerSegment
        className="absolute inset-0"
        faceClassName="overflow-hidden rounded-[var(--analog-radius-window)]"
        orientation={orientation}
        raisedSide="end"
        extrusionLayers={extrusionLayers}
        surfaceMode={surfaceMode}
        style={getDualClipStyle(orientation, 'start')}
      >
        <RockerOverlay
          orientation={orientation}
          showCenterSeam={false}
          gripPositions={['start']}
          surfaceMode={surfaceMode}
        />
      </RockerSegment>
      <RockerSegment
        className="absolute inset-0"
        faceClassName="overflow-hidden rounded-[var(--analog-radius-window)]"
        orientation={orientation}
        raisedSide="start"
        extrusionLayers={extrusionLayers}
        surfaceMode={surfaceMode}
        style={getDualClipStyle(orientation, 'end')}
      >
        <RockerOverlay
          orientation={orientation}
          showCenterSeam={false}
          gripPositions={['end']}
          surfaceMode={surfaceMode}
        />
      </RockerSegment>
      {children ? (
        <div className="absolute inset-0 z-[4] pointer-events-none">{children}</div>
      ) : null}
    </div>
  );
}
