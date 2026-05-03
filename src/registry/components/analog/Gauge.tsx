import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { cn } from '@/lib/utils';
import { AnisotropicButton } from './AnisotropicButton';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '@/registry/hooks/use-analog-lighting';

export type GaugeVariant = 'lcd-green' | 'lcd-amber' | 'lcd-blue';

export interface GaugeProps extends React.ComponentPropsWithoutRef<typeof Slider.Root> {
  variant?: GaugeVariant;
  lighting?: AnalogLightingConfig<'surface' | 'pointer'>;
}

export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  ({ className, value, min = 0, max = 100, variant = 'lcd-green', lighting, ...props }, ref) => {
    
    const getVariantColors = (v: GaugeVariant) => {
      switch (v) {
        case 'lcd-amber': return { glow: '#d19324', bg: '#e6a42e' };
        case 'lcd-blue': return { glow: '#3b86e0', bg: '#4d98f0' };
        case 'lcd-green':
        default: return { glow: '#5ca34d', bg: '#67b557' };
      }
    };

    const colors = getVariantColors(variant as GaugeVariant);
    const lightingStyle = useAnalogLighting(['surface', 'pointer'], lighting);

    return (
      <Slider.Root
        ref={ref}
        value={value}
        min={min}
        max={max}
        {...props}
        render={(rootProps, state) => {
          const val = state.values[0] ?? min;
          const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
          const rotationAngle = -135 + (percentage / 100) * 270;

          return (
            <div
              {...rootProps}
              className={cn(
                "relative flex items-center justify-center p-4",
                "w-48 h-48",
                className
              )}
              style={lightingStyle}
            >
              {/* Invisible Linear Slider Control overlaying everything for interaction */}
              <Slider.Control className="absolute inset-4 z-40 touch-none cursor-ew-resize">
                 <Slider.Track className="w-full h-full opacity-0">
                   <Slider.Thumb className="w-8 h-full" />
                 </Slider.Track>
              </Slider.Control>

              <div className="absolute inset-0 pointer-events-none">
                {/* Background Cavity / Track */}
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible p-2">
                   <defs>
                     <filter id="gauge-inset-shadow">
                        <feOffset dx="0" dy="1"/>
                        <feGaussianBlur stdDeviation="1" result="offset-blur"/>
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                        <feFlood floodColor="black" floodOpacity="0.7" result="color"/>
                        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                      </filter>
                     <mask id="gauge-indicator-mask">
                       <circle 
                         cx="50" 
                         cy="50" 
                         r="46" 
                         stroke="white" 
                         strokeWidth="6.5" 
                         fill="none" 
                         pathLength="360" 
                         strokeDasharray={`${(percentage / 100) * 270} 360`} 
                         transform="rotate(135 50 50)" 
                       />
                     </mask>
                   </defs>
                   
                   {/* Track Background */}
                   <circle 
                     cx="50" 
                     cy="50" 
                     r="46" 
                     stroke="#171717" 
                     strokeWidth="6" 
                     fill="none" 
                     pathLength="360" 
                     strokeDasharray="270 360" 
                     transform="rotate(135 50 50)" 
                     filter="url(#gauge-inset-shadow)"
                   />
                   
                   {/* Indicator Glow */}
                   <circle 
                     cx="50" 
                     cy="50" 
                     r="46" 
                     stroke={colors.glow} 
                     strokeWidth="8" 
                     fill="none" 
                     pathLength="360" 
                     strokeDasharray={`${(percentage / 100) * 270} 360`} 
                     transform="rotate(135 50 50)" 
                     style={{
                          filter: 'blur(4px)',
                          opacity: 0.5
                     }}
                   />

                   {/* Indicator Foreground with Noise Masked */}
                   <g mask="url(#gauge-indicator-mask)">
                     <rect x="0" y="0" width="100" height="100" fill={colors.bg} />
                     <image 
                       href="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E" 
                       x="0" 
                       y="0" 
                       width="100" 
                       height="100" 
                       preserveAspectRatio="none" 
                       style={{ mixBlendMode: 'multiply', opacity: 0.3 }} 
                     />
                   </g>
                </svg>

                {/* Reflection on exactly the arc path */}
                <div 
                  className="absolute inset-0 p-2 pointer-events-none"
                  style={{
                    clipPath: `polygon(50% 50%, 85.36% 85.36%, 100% 100%, 100% 0%, 0% 0%, 0% 100%, 14.64% 85.36%)`
                  }}
                >
                   {/* Inner glass reflection matching Meter (radial mapping equivalent) */}
                   <svg viewBox="0 0 100 100" className="w-full h-full mix-blend-soft-light opacity-[0.3]">
                     <circle 
                       cx="50" 
                       cy="50" 
                       r="46" 
                       stroke="url(#arc-reflection)" 
                       strokeWidth="6" 
                       fill="none" 
                       pathLength="360" 
                       strokeDasharray="270 360" 
                       transform="rotate(135 50 50)" 
                     />
                     <defs>
                       {/* This implements the same linear gradient style but in SVG for the arc */}
                       <linearGradient id="arc-reflection" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="50%" stopColor="transparent" />
                          <stop offset="100%" stopColor="#000000" />
                       </linearGradient>
                     </defs>
                   </svg>
                </div>
              </div>

              {/* Central Dial (Anisotropic Indicator) */}
              <div className="absolute inset-6 pointer-events-none">
                 <AnisotropicButton variant="chrome" rotation={rotationAngle} containerClassName="w-full h-full pointer-events-none" className="w-full h-full pointer-events-none" style={{ pointerEvents: "none" }} disabled tabIndex={-1}>
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                    >
                        {/* Dial indicator line */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 rounded-full border border-neutral-600/50"
                          style={{
                            top: '12%',
                            width: '3%',
                            height: '24%',
                            background: `linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - ${rotationAngle}deg - 45deg), #a3a3a3 0%, #737373 40%, #404040 100%)`,
                            boxShadow: `inset 0 1px 2px rgba(255,255,255,calc(0.6 * var(--analog-light-power, 1))), inset 0 -1px 2px rgba(0,0,0,calc(0.5 * var(--analog-light-power, 1))), 0 2px 4px rgba(0,0,0,calc(0.6 * var(--analog-light-power, 1)))`
                          }}
                        >
                           <div 
                            className="absolute rounded-full blur-[0.5px] bg-white"
                            style={{ top: '10%', left: '50%', width: '30%', height: '30%', transform: `translateX(-50%)`, opacity: 0.6 }} 
                          />
                        </div>
                    </div>
                 </AnisotropicButton>
              </div>
            </div>
          );
        }}
      />
    );
  }
);
Gauge.displayName = 'Gauge';
