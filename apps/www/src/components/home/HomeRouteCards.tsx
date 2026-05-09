import {
  AnalogLightingProvider,
  Panel,
  PanelHeader,
  PanelContent,
  PanelDescription,
  PanelTitle,
} from '../../../../../packages/analog-ui/src/index';

const cards = [
  {
    href: '/docs',
    eyebrow: 'Get Started',
    title: 'Install the foundation and wire the lighting model',
    body: 'Start with the docs flow people expect: introduction, installation, tokens, and registry setup before you pull components into an app.',
  },
  {
    href: '/docs/components',
    eyebrow: 'Components',
    title: 'Browse every public control in one place',
    body: 'Use the hub page and per-component docs routes for install commands, dependencies, previews, and quick jumps into the examples.',
  },
  {
    href: '/blocks',
    eyebrow: 'Blocks',
    title: 'See the examples grouped by family',
    body: '`/blocks` remains the examples surface: category pages, broader demos, and install-adjacent browsing for design review.',
  },
] as const;

export default function HomeRouteCards() {
  return (
    <AnalogLightingProvider baseAngle={180} power={0.96}>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <a key={card.href} href={card.href} className="group block h-full">
            <Panel
              className="flex h-full flex-col transition-transform duration-200 group-hover:-translate-y-px"
              screwHole="slot"
              variant="rack"
            >
              <PanelHeader className="gap-3 p-5 pb-0">
                <div className="eyebrow">{card.eyebrow}</div>
                <PanelTitle className="text-2xl font-semibold leading-tight text-white">
                  {card.title}
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="flex flex-1 flex-col px-5 pb-5 pt-4">
                <PanelDescription className="text-sm leading-7 text-[#959595]">
                  {card.body}
                </PanelDescription>
              </PanelContent>
            </Panel>
          </a>
        ))}
      </div>
    </AnalogLightingProvider>
  );
}
