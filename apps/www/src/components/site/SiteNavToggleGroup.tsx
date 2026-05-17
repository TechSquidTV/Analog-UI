import { navigate } from 'astro:transitions/client';
import { StarIcon } from 'lucide-react';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import {
  AnalogLightingProvider,
  PushButton,
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
  githubHref: string;
}

const navPressDelayMs = 140;

export default function SiteNavToggleGroup({
  links,
  activeHref,
  githubHref,
}: SiteNavToggleGroupProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const navigationTimeoutRef = useRef<number | undefined>(undefined);
  const [selectedHref, setSelectedHref] = useState(activeHref);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.5,
    targetRef: navRef,
  });

  useEffect(() => {
    setSelectedHref(activeHref);
  }, [activeHref]);

  useEffect(
    () => () => {
      if (navigationTimeoutRef.current !== undefined) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    },
    [],
  );

  const handleNavigate = (event: MouseEvent<HTMLElement>, href: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    if (href === activeHref) {
      setSelectedHref(activeHref);
      return;
    }

    setSelectedHref(href);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReducedMotion ? 0 : navPressDelayMs;

    if (navigationTimeoutRef.current !== undefined) {
      window.clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = window.setTimeout(() => {
      navigate(href, { sourceElement: event.currentTarget });
    }, delay);
  };

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <div ref={navRef} className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        <ToggleButtonGroup
          value={selectedHref}
          aria-label="Primary navigation"
          itemHeight="2.5rem"
          indicatorTone="success"
        >
          {links.map((link) => {
            const isActive = activeHref === link.href;
            const isSelected = selectedHref === link.href;

            return (
              <ToggleButtonGroupItem
                key={link.href}
                href={link.href}
                value={link.href}
                width={link.width}
                height="2.5rem"
                pressed={isSelected}
                variant={isSelected ? 'chrome' : 'black'}
                onClick={(event) => handleNavigate(event, link.href)}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </ToggleButtonGroupItem>
            );
          })}
        </ToggleButtonGroup>
        <PushButton
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          height="2.5rem"
          width="9rem"
          variant="black"
          aria-label="Star Analog UI on GitHub"
        >
          <span className="flex items-center gap-1.5">
            <StarIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[var(--analog-tone-success)]"
              strokeWidth={2.35}
            />
            <span className="tracking-[0.14em]">GitHub</span>
          </span>
        </PushButton>
      </div>
    </AnalogLightingProvider>
  );
}
