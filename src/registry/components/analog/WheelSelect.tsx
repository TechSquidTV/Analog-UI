import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useWheelScroll } from '@/registry/hooks/use-wheel-scroll';
import {
  useAnalogLighting,
  type AnalogLightingConfig,
} from '@/registry/hooks/use-analog-lighting';

export interface AnalogWheelSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  lighting?: AnalogLightingConfig<'track' | 'wheel'>;
}

export function AnalogWheelSelect({
  options,
  value,
  onValueChange,
  className,
  lighting,
}: AnalogWheelSelectProps) {
  const [internalValue, setInternalValue] = useState(options[0] || '');
  const selectedValue = value !== undefined ? value : internalValue;
  const initialIndex = Math.max(0, options.indexOf(selectedValue));
  
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lightingStyle = useAnalogLighting(['track', 'wheel'], lighting);
  
  // Magic numbers for wheel
  const itemHeight = 36;
  const radius = 100; // Radius of the cylinder
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    return y.on('change', (latest) => {
      let index = Math.round(-latest / itemHeight);
      if (index < 0) index = 0;
      if (index >= options.length) index = options.length - 1;
      setActiveIndex(index);
    });
  }, [y, itemHeight, options.length]);

  // Set initial position based on selected index
  useEffect(() => {
    const targetY = -initialIndex * itemHeight;
    animate(y, targetY, { type: 'spring', stiffness: 300, damping: 30 });
  }, [initialIndex, itemHeight]);

  const handleDragEnd = () => {
    const currentY = y.get();
    let index = Math.round(-currentY / itemHeight);
    
    if (index < 0) index = 0;
    if (index >= options.length) index = options.length - 1;
    
    if (value === undefined) {
      setInternalValue(options[index]);
    }
    
    if (onValueChange) {
      onValueChange(options[index]);
    } else {
      // Snap back if unmanaged
       animate(y, -index * itemHeight, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  useWheelScroll(
    containerRef,
    React.useCallback((e, deltaDirection) => {
      let newIndex = activeIndex + deltaDirection;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= options.length) newIndex = options.length - 1;

      if (newIndex !== activeIndex) {
        animate(y, -newIndex * itemHeight, { type: 'spring', stiffness: 300, damping: 30 });
        if (value === undefined) setInternalValue(options[newIndex]);
        if (onValueChange) onValueChange(options[newIndex]);
      }
    }, [activeIndex, options, value, onValueChange, y, itemHeight])
  );

  return (
    <div 
      className={cn(
        "relative inline-flex p-[var(--spacing-track-padding)] rounded-md analog-surface-recess overflow-hidden",
        className
      )}
      style={lightingStyle}
    >
      <div className="absolute inset-[2px] rounded-[4px] bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,1)]" />
      <div 
        ref={containerRef}
        className={cn(
          "relative w-32 h-48 select-none touch-none overflow-hidden rounded-md", 
          "bg-[#111] shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        )}
        style={{ perspective: 800 }}
      >
        <div className="analog-wheel-lighting" />
        {/* Selection highlight (overlay) */}
        <div className="absolute top-1/2 left-0 right-0 h-[36px] -translate-y-1/2 border-y border-[#333] bg-white/5 z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-2 h-[36px] -translate-y-1/2 bg-[var(--color-amber-bg)] z-10 pointer-events-none shadow-[0_0_10px_var(--color-amber-glow)]" />

        {/* Draggable Cylinder */}
        <motion.div
          drag="y"
          dragConstraints={{ top: -(options.length - 1) * itemHeight, bottom: 0 }}
          dragElastic={0}
          dragMomentum={true}
          onDragEnd={handleDragEnd}
          style={{ y }}
          className="absolute inset-0 w-full h-full preserve-3d opacity-0 z-20 cursor-grab active:cursor-grabbing"
        />

        {/* Rendered Cylinder */}
        <motion.div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ 
            transformStyle: 'preserve-3d',
            rotateX: useTransform(y, latest => (latest / circumference) * 360) 
          }}
        >
          {/* Render 36 ridges around the entire cylinder for realism */}
          {[...Array(36)].map((_, i) => {
            const angle = (i / 36) * 360;
            return (
               <div
                  key={`ridge-${i}`}
                  className="absolute top-1/2 left-0 w-full h-[12px] -translate-y-1/2 flex items-center justify-center select-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    transform: `rotateX(${angle}deg) translateZ(${radius}px)`, 
                  }}
               >
                  <div 
                    className="absolute inset-x-2 inset-y-[1px] rounded-[1.5px] border-b border-[#000]"
                    style={{
                      background: `linear-gradient(calc(var(--analog-light-angle-wheel, 180deg) - 90deg), rgba(42, 42, 42, calc(0.3 + 0.7 * var(--analog-light-power, 1))), rgba(17, 17, 17, 1))`
                    }}
                  />
               </div>
            );
          })}
          
          {/* Render options independently, positioned relative to circumference */}
          {options.map((opt, i) => {
            const angle = (i * itemHeight / circumference) * 360;
            return (
               <div
                  key={opt}
                  className="absolute top-1/2 left-0 w-full h-[36px] -translate-y-1/2 flex items-center justify-center font-mono text-xs leading-none font-bold select-none drop-shadow-md z-10"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    transform: `rotateX(${angle}deg) translateZ(${radius + 2}px)`, // +2px to push it slightly above the ridges
                    color: activeIndex === i ? '#fff' : '#666',
                    textShadow: activeIndex === i ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  }}
               >
                  <span className={cn(
                    "px-2 py-1 rounded transition-colors duration-200",
                    activeIndex === i ? "bg-[#111] border border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : ""
                  )}>{opt}</span>
               </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
