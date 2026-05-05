import { getCollection, type CollectionEntry } from "astro:content";

import { getBlockEntries } from "./blocks";

export type DocEntry = CollectionEntry<"docs">;

const sectionOrder = {
  introduction: 0,
  "getting-started": 1,
  design: 2,
  reference: 3,
} as const;

const guideSlugs = ["index", "getting-started", "design/tokens-and-lighting", "registry"] as const;

const componentNavLabels = {
  dial: "Dial",
  slider: "Slider",
  toggle: "Toggle",
  "square-button": "Square Button",
  "square-toggle": "Square Toggle",
  switch: "Switch",
  "wheel-select": "Wheel Select",
  "wheel-number": "Wheel Number",
  gauge: "Gauge",
  "lcd-display": "LCD Display",
  meter: "Meter",
  indicator: "Indicator",
  panel: "Panel",
  "rocker-thumb-surface": "Rocker Thumb Surface",
} as const;

export function getDocHref(entry: DocEntry) {
  return entry.slug === "index" ? "/docs" : `/docs/${entry.slug}`;
}

export function getComponentDocHref(name: string) {
  return `/docs/components/${name}`;
}

export async function getDocsEntries() {
  const entries = await getCollection("docs", ({ data }) => !data.draft);

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
  const targetSlug = !slug || slug.length === 0 ? "index" : slug;
  const entries = await getDocsEntries();
  return entries.find((entry) => entry.slug === targetSlug);
}

export async function getDocsNavigation() {
  const entries = await getDocsEntries();
  const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));

  const guides = guideSlugs.flatMap((slug) => {
    const entry = entriesBySlug.get(slug);

    if (!entry) {
      return [];
    }

    return [
      {
        href: getDocHref(entry),
        label: entry.data.navTitle ?? entry.data.title,
      },
    ];
  });

  const componentsHub = entriesBySlug.get("components");
  const components = [
    ...(componentsHub
      ? [
          {
            href: getDocHref(componentsHub),
            label: componentsHub.data.navTitle ?? componentsHub.data.title,
          },
        ]
      : []),
    ...getBlockEntries().map((entry) => ({
      href: getComponentDocHref(entry.name),
      label: componentNavLabels[entry.name],
    })),
  ];

  return [
    {
      section: "Getting Started",
      items: guides,
    },
    {
      section: "Components",
      items: components,
    },
  ];
}
