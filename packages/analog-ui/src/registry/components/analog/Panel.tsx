import * as React from 'react';
import { cn } from '../../../lib/utils';
import { AnisotropicButton } from './AnisotropicButton';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

const variantStyles = {
  default:
    'bg-[radial-gradient(circle_at_center,#111_0%,var(--color-background)_70%)] border-[var(--color-surface-1)] shadow-sm',
  rack: 'border-[#2a2a2a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] bg-[#121212]',
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rack';
  screws?: boolean;
  screwVariant?: 'chrome' | 'black';
  screwHole?: 'none' | 'slot' | 'cross' | 'star';
  lighting?: AnalogLightingConfig<'panel' | 'screw'>;
}

const Screw = ({
  className,
  rotation,
  variant = 'chrome',
  hole = 'none',
}: {
  className?: string;
  rotation?: number;
  variant?: 'chrome' | 'black';
  hole?: 'none' | 'slot' | 'cross' | 'star';
}) => {
  const holeColor = variant === 'black' ? '#090909' : '#1a1a1a';
  const shadowColor = variant === 'black' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)';

  const filterStyle = {
    filter: `drop-shadow(calc(sin(var(--analog-light-angle-screw, 180deg)) * 1px) calc(cos(var(--analog-light-angle-screw, 180deg)) * -1px) 0px ${shadowColor})`,
    color: holeColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'absolute w-4 h-4 flex items-center justify-center pointer-events-none z-10',
        className,
      )}
      style={
        { '--analog-light-angle-surface': 'var(--analog-light-angle-screw)' } as React.CSSProperties
      }
    >
      <AnisotropicButton
        variant={variant}
        rotation={rotation}
        containerClassName="w-full h-full"
        className="!p-0 w-full h-full min-h-[0px] min-w-[0px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_6px_rgba(0,0,0,0.8)] no-chamfer"
      >
        {hole === 'slot' && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={filterStyle}
          >
            <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] absolute">
              <g transform={`rotate(${(rotation || 0) - 45} 12 12)`}>
                <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="currentColor" />
              </g>
            </svg>
          </div>
        )}
        {hole === 'cross' && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={filterStyle}
          >
            <svg viewBox="0 0 24 24" className="w-[50%] h-[50%] absolute">
              <g transform={`rotate(${(rotation || 0) - 45} 12 12)`}>
                <rect x="10.5" y="2" width="3" height="20" rx="1.5" fill="currentColor" />
                <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="currentColor" />
              </g>
            </svg>
          </div>
        )}
        {hole === 'star' && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={filterStyle}
          >
            <svg viewBox="0 0 24 24" className="w-[55%] h-[55%] absolute">
              <g transform={`rotate(${(rotation || 0) - 45} 12 12)`}>
                <path
                  d="M 12 3 L 14.64 8.36 L 20.56 9.22 L 16.28 13.39 L 17.29 19.28 L 12 16.5 L 6.71 19.28 L 7.72 13.39 L 3.44 9.22 L 9.36 8.36 Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        )}
      </AnisotropicButton>
    </div>
  );
};

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      variant = 'default',
      screws = true,
      screwVariant = 'chrome',
      screwHole = 'none',
      lighting,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const lightingStyle = useAnalogLighting(['panel', 'screw'], lighting);

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border relative overflow-hidden text-white',
          variantStyles[variant],
          className,
        )}
        style={{
          ...lightingStyle,
          ...style,
          ...(variant === 'rack'
            ? {
                background: `linear-gradient(calc(var(--analog-light-angle-panel, 180deg) - 90deg), rgba(255,255,255,calc(0.03 * var(--analog-light-power, 1))), rgba(255,255,255,0) 45%, rgba(0,0,0,calc(0.22 * var(--analog-light-power, 1)))), #121212`,
                boxShadow: `inset 0 1px 1px rgba(255, 255, 255, calc(0.07 * var(--analog-light-power, 1))), 0 4px 12px rgba(0, 0, 0, 0.5)`,
              }
            : {}),
        }}
        {...props}
      >
        {screws && (
          <>
            <Screw
              variant={screwVariant as 'chrome' | 'black'}
              hole={screwHole as 'none' | 'slot' | 'cross' | 'star'}
              className="top-5 left-5"
              rotation={45}
            />
            <Screw
              variant={screwVariant as 'chrome' | 'black'}
              hole={screwHole as 'none' | 'slot' | 'cross' | 'star'}
              className="top-5 right-5"
              rotation={45}
            />
            <Screw
              variant={screwVariant as 'chrome' | 'black'}
              hole={screwHole as 'none' | 'slot' | 'cross' | 'star'}
              className="bottom-5 left-5"
              rotation={45}
            />
            <Screw
              variant={screwVariant as 'chrome' | 'black'}
              hole={screwHole as 'none' | 'slot' | 'cross' | 'star'}
              className="bottom-5 right-5"
              rotation={45}
            />
          </>
        )}
        {children}
      </div>
    );
  },
);
Panel.displayName = 'Panel';

const PanelHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-12', className)} {...props} />
  ),
);
PanelHeader.displayName = 'PanelHeader';

const PanelTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  ),
);
PanelTitle.displayName = 'PanelTitle';

const PanelDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[#a0a0a0]', className)} {...props} />
));
PanelDescription.displayName = 'PanelDescription';

const PanelAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />,
);
PanelAction.displayName = 'PanelAction';

const PanelContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-12 pb-12', className)} {...props} />
  ),
);
PanelContent.displayName = 'PanelContent';

const PanelFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center px-12 pb-12 pt-0', className)} {...props} />
  ),
);
PanelFooter.displayName = 'PanelFooter';

export { Panel, PanelHeader, PanelTitle, PanelDescription, PanelAction, PanelContent, PanelFooter };
