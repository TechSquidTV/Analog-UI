import { useRef } from 'react';

import {
  AnalogLightingProvider,
  usePointerLighting,
} from '../../../../../packages/analog-ui/src/index';
import HomeLaunchPanel from './HomeLaunchPanel';
import HomeRouteCards from './HomeRouteCards';
import HomeVstSurface from './HomeVstSurface';

interface HomePageProps {
  registryUiCount: number;
  registryItemCount: number;
}

export default function HomePage({ registryUiCount, registryItemCount }: HomePageProps) {
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
        <section className="site-frame pt-10 md:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-3xl">
              <div className="eyebrow mb-5">Tactile Interface System</div>
              <h1 className="text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
                UI you can
                <span className="block text-[var(--color-accent)] italic">feel.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#afafaf] md:text-xl">
                Analog UI brings studio hyper-skeuomorphism to the web: machined knobs, dense rack
                panels, jewel lamps, trim wheels, and a shared lighting model that makes surfaces
                react like hardware.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a className="pill-link" href="/docs">
                  Get Started
                </a>
                <a className="pill-link" href="/docs/components">
                  View Components
                </a>
                <a className="pill-link" href="/docs/registry">
                  Registry Guide
                </a>
              </div>
            </div>

            <HomeLaunchPanel
              registryItemCount={registryItemCount}
              registryUiCount={registryUiCount}
            />
          </div>
        </section>

        <section className="site-frame mt-8">
          <HomeRouteCards />
        </section>

        <section className="site-frame mt-16">
          <div className="max-w-3xl">
            <div className="eyebrow mb-4">Complete Assembly</div>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              A full channel strip built from Analog UI.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#a8a8a8]">
              Dials, faders, meters, trim wheels, switches, lamps, and panels work together as one
              production-style interface, with shared lighting that keeps the hardware illusion
              coherent.
            </p>
          </div>

          <div className="mt-8">
            <HomeVstSurface onScrubbingChange={handleScrubbingChange} />
          </div>
        </section>
      </div>
    </AnalogLightingProvider>
  );
}
