import { useRef } from 'react';

import {
  AnalogLightingProvider,
  ToggleButtonGroup,
  ToggleButtonGroupItem,
  usePointerLighting,
} from '../../../../../packages/analog-ui/src/index';

interface SiteNavLink {
  href: string;
  label: string;
  width: string;
}

interface SiteNavToggleGroupProps {
  links: SiteNavLink[];
  activeHref?: string;
}

export default function SiteNavToggleGroup({ links, activeHref }: SiteNavToggleGroupProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.5,
    targetRef: navRef,
  });

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <div ref={navRef} className="flex flex-wrap items-center">
        <ToggleButtonGroup
          value={activeHref}
          aria-label="Primary navigation"
          itemHeight="2.5rem"
          indicatorTone="success"
        >
          {links.map((link) => {
            const isActive = activeHref === link.href;

            return (
              <ToggleButtonGroupItem
                key={link.href}
                href={link.href}
                value={link.href}
                width={link.width}
                height="2.5rem"
                pressed={isActive}
                variant={isActive ? 'chrome' : 'black'}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </ToggleButtonGroupItem>
            );
          })}
        </ToggleButtonGroup>
      </div>
    </AnalogLightingProvider>
  );
}
