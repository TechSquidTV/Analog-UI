import {
  blockCatalog,
  blockCategories,
  type BlockCategory,
  type BlockName,
} from '../data/block-catalog';
import { getRegistryItem } from './registry';

interface BlockEntry {
  name: BlockName;
  category: BlockCategory;
  categoryLabel: string;
  order: number;
  title: string;
  description: string;
  summary: string;
  registryType: string;
  dependencies: string[];
  registryDependencies: string[];
  href: string;
  viewHref: string;
  registryHref: string;
}

function toBlockEntry(name: BlockName): BlockEntry {
  const catalogItem = blockCatalog[name];
  const registryItem = getRegistryItem(name);

  if (!registryItem) {
    throw new Error(`Missing registry item for block "${name}".`);
  }

  return {
    name,
    category: catalogItem.category,
    order: catalogItem.order,
    summary: catalogItem.summary,
    title: registryItem.title,
    description: registryItem.description,
    registryType: registryItem.type,
    dependencies: registryItem.dependencies ?? [],
    registryDependencies: registryItem.registryDependencies ?? [],
    categoryLabel: blockCategories[catalogItem.category].label,
    href: `/docs/components/${name}`,
    viewHref: `/view/${name}`,
    registryHref: `/r/${name}.json`,
  };
}

export function getAllBlockNames() {
  return Object.keys(blockCatalog) as BlockName[];
}

export function getBlockEntry(name: string) {
  if (!(name in blockCatalog)) {
    return undefined;
  }

  return toBlockEntry(name as BlockName);
}

export function getBlockEntries(category?: BlockCategory) {
  return getAllBlockNames()
    .map((name) => toBlockEntry(name))
    .filter((entry) => (category ? entry.category === category : true))
    .sort((left, right) => left.order - right.order);
}
