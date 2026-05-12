import { useRef } from 'react';

import {
  AnalogLightingProvider,
  PushButton,
  usePointerLighting,
} from '../../../../../packages/analog-ui/src/index';
import HomeVstSurface from './HomeVstSurface';

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const suspendLightingRef = useRef(false);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.34,
    suspendRef: suspendLightingRef,
    targetRef: pageRef,
  });

  const handleScrubbingChange = (isScrubbing: boolean) => {
    suspendLightingRef.current = isScrubbing;
  };

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <div ref={pageRef}>
        <section className="site-frame pt-10 text-center md:pt-16">
          <div className="mx-auto max-w-3xl">
            <div className="eyebrow mb-5">New UI. Old soul.</div>
            <h1 className="text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
              UI you can
              <span className="block text-[var(--color-accent)] italic">feel.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#afafaf] md:text-xl">
              Studio Hyper-Skeuomorphic React components for tactile controls, and analog
              experiences. TailwindCSS and Shadcn compatible,
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
          <HomeVstSurface onScrubbingChange={handleScrubbingChange} />
        </section>
      </div>
    </AnalogLightingProvider>
  );
}
