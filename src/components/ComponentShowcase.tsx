import React from 'react';
import { Panel } from '@/registry/components/analog/Panel';

export interface Spec {
  label: string;
  value: React.ReactNode;
}

export interface ComponentShowcaseProps {
  title: string;
  description: React.ReactNode;
  specs: Spec[];
  children: React.ReactNode;
}

export function ComponentShowcase({ title, description, specs, children }: ComponentShowcaseProps) {
  return (
    <div className="flex flex-col mb-24">
      <div className="mb-12 md:mb-16 max-w-xl text-left">
        <h2 className="text-[32px] font-extralight tracking-[-0.02em] mb-4">
          {title}
        </h2>
        <div className="text-[#a0a0a0] font-sans text-[15px] leading-relaxed">
          {description}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-12">
        <Panel variant="rack" screws={false} className="p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
          {children}

          <div style={{ position: 'absolute', bottom: '24px', left: '24px' }} className="hidden md:grid grid-cols-8 gap-1 opacity-20 pointer-events-none">
            <div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div><div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </Panel>

        <div className="flex flex-col gap-8">
          <Panel variant="rack" screws={false} className="p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2">Component Specs</div>
            {specs.map((spec, idx) => (
              <div 
                key={idx} 
                className="flex justify-between mb-3 text-xs border-b border-[#222] pb-2"
                style={idx === specs.length - 1 ? { border: 'none', paddingBottom: 0, marginBottom: 0 } : undefined}
              >
                <span>{spec.label}</span>
                <span className="font-mono text-[var(--color-accent)]">{spec.value}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
