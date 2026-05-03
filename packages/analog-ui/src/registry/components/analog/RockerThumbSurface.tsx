import * as React from 'react';
import { cn } from '../../../lib/utils';

type RockerVariant = 'chrome' | 'black';
type RockerOrientation = 'horizontal' | 'vertical';
type RockerRaisedSide = 'start' | 'end' | 'both';
type RockerSingleSide = Exclude<RockerRaisedSide, 'both'>;

interface RockerThumbSurfaceProps {
  className?: string;
  variant: RockerVariant;
  orientation?: RockerOrientation;
  raisedSide?: RockerRaisedSide;
  children?: React.ReactNode;
  extrusionLayers?: number;
}

const axisGradientAngle = (orientation: RockerOrientation) =>
  orientation === 'horizontal'
    ? 'calc(var(--analog-light-angle-thumb, 180deg) - 90deg)'
    : 'var(--analog-light-angle-thumb, 180deg)';

const axisInset = (
  orientation: RockerOrientation,
  direction: RockerSingleSide,
  distance: number,
  blur: number,
  color: string,
) =>
  orientation === 'horizontal'
    ? `inset ${direction === 'start' ? distance : -distance}px 0 ${blur}px ${color}`
    : `inset 0 ${direction === 'start' ? distance : -distance}px ${blur}px ${color}`;

const axisDrop = (
  orientation: RockerOrientation,
  direction: RockerSingleSide,
  mainOffset: number,
  crossOffset: number,
  blur: number,
  spread: number,
  color: string,
) =>
  orientation === 'horizontal'
    ? `${direction === 'start' ? mainOffset : -mainOffset}px ${crossOffset}px ${blur}px ${spread}px ${color}`
    : `${crossOffset}px ${direction === 'start' ? mainOffset : -mainOffset}px ${blur}px ${spread}px ${color}`;

const singleFaceBackground = (
  variant: RockerVariant,
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
) => {
  const angle = axisGradientAngle(orientation);

  if (variant === 'chrome') {
    return raisedSide === 'start'
      ? `linear-gradient(${angle}, #b5b5b5, #e5e5e5 50%, #8a8a8a)`
      : `linear-gradient(${angle}, #8a8a8a, #e5e5e5 50%, #b5b5b5)`;
  }

  return raisedSide === 'start'
    ? `linear-gradient(${angle}, #242424, #3a3a3a 50%, #151515)`
    : `linear-gradient(${angle}, #151515, #3a3a3a 50%, #242424)`;
};

const singleFaceShadow = (
  variant: RockerVariant,
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
) => {
  const isChrome = variant === 'chrome';
  const drop = axisDrop(
    orientation,
    raisedSide,
    12,
    6,
    15,
    -4,
    isChrome
      ? `rgba(0,0,0,calc(0.7 * var(--analog-light-power, 1)))`
      : `rgba(0,0,0,calc(0.95 * var(--analog-light-power, 1)))`,
  );

  return [
    drop,
    axisInset(
      orientation,
      raisedSide,
      2,
      isChrome ? 6 : 4,
      isChrome
        ? `rgba(255,255,255,calc(1 * var(--analog-light-power, 1)))`
        : `rgba(255,255,255,calc(0.15 * var(--analog-light-power, 1)))`,
    ),
    axisInset(
      orientation,
      raisedSide === 'start' ? 'end' : 'start',
      6,
      12,
      isChrome
        ? `rgba(0,0,0,calc(0.4 * var(--analog-light-power, 1)))`
        : `rgba(0,0,0,calc(0.9 * var(--analog-light-power, 1)))`,
    ),
    `inset 0 1px ${isChrome ? 3 : 2}px ${
      isChrome
        ? `rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1)))`
        : `rgba(255,255,255,calc(0.1 * var(--analog-light-power, 1)))`
    }`,
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
  variant: RockerVariant,
  orientation: RockerOrientation,
  raisedSide: RockerSingleSide,
): React.CSSProperties => ({
  background: singleFaceBackground(variant, orientation, raisedSide),
  boxShadow: singleFaceShadow(variant, orientation, raisedSide),
});

const GripRidges = ({
  isChrome,
  orientation,
  position,
}: {
  isChrome: boolean;
  orientation: RockerOrientation;
  position: 'start' | 'end';
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'absolute pointer-events-none opacity-80 mix-blend-hard-light',
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
    >
      {[...Array(4)].map((_, index) => (
        <div
          key={`${position}-ridge-${index}`}
          className={cn(isHorizontal ? 'h-full w-[2px]' : 'h-[2px] w-full', 'rounded-sm')}
          style={{
            background: isHorizontal
              ? isChrome
                ? 'linear-gradient(to right, #a3a3a3, #f5f5f5 50%, #a3a3a3)'
                : 'linear-gradient(to right, #262626, #5a5a5a 50%, #262626)'
              : isChrome
                ? 'linear-gradient(to bottom, #a3a3a3, #f5f5f5 50%, #a3a3a3)'
                : 'linear-gradient(to bottom, #262626, #5a5a5a 50%, #262626)',
            boxShadow: isHorizontal
              ? isChrome
                ? `1px 0 1px rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1))), -1px 0 1px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1)))`
                : `1px 0 1px rgba(255,255,255,calc(0.3 * var(--analog-light-power, 1))), -1px 0 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1)))`
              : isChrome
                ? `0 1px 1px rgba(255,255,255,calc(0.9 * var(--analog-light-power, 1))), 0 -1px 1px rgba(0,0,0,calc(0.2 * var(--analog-light-power, 1)))`
                : `0 1px 1px rgba(255,255,255,calc(0.3 * var(--analog-light-power, 1))), 0 -1px 2px rgba(0,0,0,calc(0.8 * var(--analog-light-power, 1)))`,
          }}
        />
      ))}
    </div>
  );
};

function RockerOverlay({
  variant,
  orientation,
  showCenterSeam = true,
  gripPositions = ['start', 'end'],
  children,
}: {
  variant: RockerVariant;
  orientation: RockerOrientation;
  showCenterSeam?: boolean;
  gripPositions?: Array<'start' | 'end'>;
  children?: React.ReactNode;
}) {
  const isChrome = variant === 'chrome';

  return (
    <div className="absolute inset-0 overflow-hidden rounded-sm">
      <div
        className={cn(
          'analog-foil z-[1]',
          isChrome ? 'opacity-40' : 'opacity-30 filter grayscale brightness-50',
        )}
        style={{ backgroundSize: '250%' }}
      />

      {showCenterSeam ? (
        <div
          className={cn(
            'absolute bg-black/20 z-[2]',
            orientation === 'horizontal'
              ? 'top-0 bottom-0 left-1/2 -ml-[1px] w-[2px]'
              : 'left-0 right-0 top-1/2 -mt-[1px] h-[2px]',
          )}
          style={{
            boxShadow:
              orientation === 'horizontal'
                ? `1px 0 0 rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1)))`
                : `0 1px 0 rgba(255,255,255,calc(0.2 * var(--analog-light-power, 1)))`,
          }}
        />
      ) : null}

      {children ? <div className="absolute inset-0 z-[4]">{children}</div> : null}

      <div className="absolute inset-0 z-[3]">
        {gripPositions.includes('start') ? (
          <GripRidges isChrome={isChrome} orientation={orientation} position="start" />
        ) : null}
        {gripPositions.includes('end') ? (
          <GripRidges isChrome={isChrome} orientation={orientation} position="end" />
        ) : null}
      </div>
    </div>
  );
}

function RockerSegment({
  className,
  faceClassName,
  variant,
  orientation,
  raisedSide,
  extrusionLayers,
  style,
  children,
}: {
  className?: string;
  faceClassName?: string;
  variant: RockerVariant;
  orientation: RockerOrientation;
  raisedSide: RockerSingleSide;
  extrusionLayers: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const isChrome = variant === 'chrome';

  return (
    <div className={cn('pointer-events-none', className)} style={style}>
      <div className="relative size-full" style={{ perspective: '800px' }}>
        <div
          className="absolute inset-0 rounded-sm"
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
              className={cn(
                'absolute inset-0 rounded-sm',
                isChrome
                  ? 'bg-neutral-400 border border-neutral-500/30'
                  : 'bg-[#121212] border border-[#222]/50',
              )}
              style={{ transform: `translateZ(-${index + 1}px)` }}
            />
          ))}

          <div
            className={cn('absolute inset-0', faceClassName)}
            style={{
              ...getSingleFaceStyle(variant, orientation, raisedSide),
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
  const isDual = raisedSide === 'both';

  if (!isDual) {
    return (
      <div className={cn('relative pointer-events-none', className)}>
        <RockerSegment
          className="absolute inset-0"
          faceClassName="overflow-hidden rounded-sm"
          variant={variant}
          orientation={orientation}
          raisedSide={raisedSide}
          extrusionLayers={extrusionLayers}
        >
          <RockerOverlay variant={variant} orientation={orientation}>
            {children}
          </RockerOverlay>
        </RockerSegment>
      </div>
    );
  }

  return (
    <div className={cn('relative pointer-events-none', className)}>
      <RockerSegment
        className="absolute inset-0"
        faceClassName="overflow-hidden rounded-sm"
        variant={variant}
        orientation={orientation}
        raisedSide="end"
        extrusionLayers={extrusionLayers}
        style={getDualClipStyle(orientation, 'start')}
      >
        <RockerOverlay
          variant={variant}
          orientation={orientation}
          showCenterSeam={false}
          gripPositions={['start']}
        />
      </RockerSegment>
      <RockerSegment
        className="absolute inset-0"
        faceClassName="overflow-hidden rounded-sm"
        variant={variant}
        orientation={orientation}
        raisedSide="start"
        extrusionLayers={extrusionLayers}
        style={getDualClipStyle(orientation, 'end')}
      >
        <RockerOverlay
          variant={variant}
          orientation={orientation}
          showCenterSeam={false}
          gripPositions={['end']}
        />
      </RockerSegment>
      {children ? (
        <div className="absolute inset-0 z-[4] pointer-events-none">{children}</div>
      ) : null}
    </div>
  );
}
