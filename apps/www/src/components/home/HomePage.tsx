import { useRef } from 'react';

import { AnalogLightingProvider, PushButton } from '../../../../../packages/analog-ui/src/index';
import HomeVstSurface from './HomeVstSurface';

interface HomePageProps {
  componentCountLabel: string;
}

export default function HomePage({ componentCountLabel }: HomePageProps) {
  const homeRef = useRef<HTMLDivElement>(null);

  return (
    <AnalogLightingProvider
      baseAngle={180}
      power={1}
      interactiveLighting={{
        pointer: {
          enabled: true,
          surfaceRef: homeRef,
          strength: 0.62,
          radius: 0.16,
          innerRadius: 0.28,
          minRadius: 1.4,
          maxRadius: 3.2,
        },
        motion: { enabled: true, strength: 0.46 },
      }}
    >
      <div ref={homeRef}>
        <section className="site-frame pt-10 text-center md:pt-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex flex-col items-center gap-3">
              <div className="eyebrow">New UI. Old soul.</div>
              <span
                className="inline-flex rounded-[var(--analog-radius-window)] border px-2.5 py-1 text-[9px] font-semibold uppercase leading-none tracking-[0.24em]"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklch, var(--color-chart-2) 26%, transparent), color-mix(in oklch, var(--color-accent) 14%, transparent))',
                  borderColor:
                    'color-mix(in oklch, var(--color-chart-2) 56%, var(--color-accent) 44%)',
                  boxShadow:
                    '0 0 18px color-mix(in oklch, var(--color-chart-2) 24%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: 'color-mix(in oklch, var(--color-chart-2) 76%, white)',
                }}
              >
                pre-release
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
              UI you can
              <span className="block text-[var(--color-accent)] italic">feel.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#afafaf] md:text-xl">
              A growing set of {componentCountLabel} Studio Hyper-Skeuomorphic React components for
              tactile controls and analog experiences. Tailwind CSS and shadcn-compatible.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PushButton href="/docs" width="7.5rem" height="2.5rem">
                Get Started
              </PushButton>
              <PushButton href="/docs/components" width="10rem" height="2.5rem" variant="black">
                View Components
              </PushButton>
              <PushButton href="/docs/registry" width="9rem" height="2.5rem" variant="black">
                Registry Guide
              </PushButton>
            </div>
          </div>
        </section>

        <section className="site-frame mt-12 md:mt-16">
          <HomeVstSurface />
        </section>
      </div>
    </AnalogLightingProvider>
  );
}
