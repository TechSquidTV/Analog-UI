import { getCollection, type CollectionEntry } from 'astro:content';

import { getComponentEntries } from './components';

type DocEntry = CollectionEntry<'docs'>;

const sectionOrder = {
  introduction: 0,
  'getting-started': 1,
  design: 2,
  reference: 3,
} as const;

const sectionLabels = {
  introduction: 'Introduction',
  'getting-started': 'Getting Started',
  design: 'Design',
  reference: 'Reference',
} as const;

export function getDocHref(entry: DocEntry) {
  return entry.id === 'index' ? '/docs' : `/docs/${entry.id}`;
}

export function getComponentDocHref(name: string) {
  return `/docs/components/${name}`;
}

export async function getDocsEntries() {
  const entries = await getCollection('docs', ({ data }) => !data.draft);

  return entries.sort((left, right) => {
    const leftSection = sectionOrder[left.data.section];
    const rightSection = sectionOrder[right.data.section];

    if (leftSection !== rightSection) {
      return leftSection - rightSection;
    }

    return left.data.order - right.data.order;
  });
}

export async function getDocBySlug(slug?: string) {
  const targetSlug = !slug || slug.length === 0 ? 'index' : slug;
  const entries = await getDocsEntries();
  return entries.find((entry) => entry.id === targetSlug);
}

export async function getDocsNavigation() {
  const entries = await getDocsEntries();
  const entriesBySlug = new Map(entries.map((entry) => [entry.id, entry]));

  const guideGroups = (Object.keys(sectionOrder) as Array<keyof typeof sectionOrder>).flatMap(
    (section) => {
      const items = entries
        .filter((entry) => entry.id !== 'components' && entry.data.section === section)
        .map((entry) => ({
          href: getDocHref(entry),
          label: entry.data.navTitle ?? entry.data.title,
        }));

      return items.length > 0
        ? [
            {
              section: sectionLabels[section],
              items,
            },
          ]
        : [];
    },
  );

  const componentsHub = entriesBySlug.get('components');
  const components = [
    ...(componentsHub
      ? [
          {
            href: getDocHref(componentsHub),
            label: componentsHub.data.navTitle ?? componentsHub.data.title,
          },
        ]
      : []),
    ...getComponentEntries().map((entry) => ({
      href: getComponentDocHref(entry.name),
      label: entry.title,
    })),
  ];

  return [
    ...guideGroups,
    {
      section: 'Components',
      items: components,
    },
  ];
}
