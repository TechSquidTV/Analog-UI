import { getCollection, type CollectionEntry } from "astro:content";

export type DocEntry = CollectionEntry<"docs">;

const sectionOrder = {
  introduction: 0,
  "getting-started": 1,
  design: 2,
  reference: 3,
} as const;

const sectionLabel = {
  introduction: "Introduction",
  "getting-started": "Getting Started",
  design: "Design System",
  reference: "Reference",
} as const;

export function getDocHref(entry: DocEntry) {
  return entry.slug === "index" ? "/docs" : `/docs/${entry.slug}`;
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
  const groups = new Map<string, Array<{ href: string; label: string }>>();

  for (const entry of entries) {
    const label = sectionLabel[entry.data.section];
    const items = groups.get(label) ?? [];
    items.push({
      href: getDocHref(entry),
      label: entry.data.navTitle ?? entry.data.title,
    });
    groups.set(label, items);
  }

  return Array.from(groups.entries()).map(([section, items]) => ({
    section,
    items,
  }));
}
