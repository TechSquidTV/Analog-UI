import {
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
    title: 'Install the foundation',
    body: 'Add the shared tokens, material recipes, and lighting defaults, then choose the controls your app needs.',
  },
  {
    href: '/docs/components',
    eyebrow: 'Components',
    title: 'Choose the right controls',
    body: 'Browse dials, faders, switches, trim wheels, meters, lamps, panels, and live examples in one place.',
  },
  {
    href: '/docs/registry',
    eyebrow: 'Registry',
    title: 'Install editable source with shadcn',
    body: 'Use the registry guide when you want Analog UI components copied into your project for local customization.',
  },
] as const;

export default function HomeRouteCards() {
  return (
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
  );
}
