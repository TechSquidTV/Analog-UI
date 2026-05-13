import {
  componentCatalog,
  componentCategories,
  type ComponentCategory,
  type ComponentName,
} from '../data/component-catalog';
import { getRegistryItem } from './registry';

interface ComponentEntry {
  name: ComponentName;
  category: ComponentCategory;
  categoryLabel: string;
  order: number;
  title: string;
  description: string;
  summary: string;
  materialLogic: string;
  registryType: string;
  dependencies: string[];
  registryDependencies: string[];
  href: string;
  viewHref: string;
  registryHref: string;
}

function toComponentEntry(name: ComponentName): ComponentEntry {
  const catalogItem = componentCatalog[name];
  const registryItem = getRegistryItem(name);

  if (!registryItem) {
    throw new Error(`Missing registry item for component "${name}".`);
  }

  return {
    name,
    category: catalogItem.category,
    order: catalogItem.order,
    summary: catalogItem.summary,
    materialLogic: catalogItem.materialLogic,
    title: registryItem.title,
    description: registryItem.description,
    registryType: registryItem.type,
    dependencies: registryItem.dependencies ?? [],
    registryDependencies: registryItem.registryDependencies ?? [],
    categoryLabel: componentCategories[catalogItem.category].label,
    href: `/docs/components/${name}`,
    viewHref: `/view/${name}`,
    registryHref: `/r/${name}.json`,
  };
}

export function getAllComponentNames() {
  return Object.keys(componentCatalog) as ComponentName[];
}

export function getComponentEntry(name: string) {
  if (!(name in componentCatalog)) {
    return undefined;
  }

  return toComponentEntry(name as ComponentName);
}

export function getComponentEntries(category?: ComponentCategory) {
  return getAllComponentNames()
    .map((name) => toComponentEntry(name))
    .filter((entry) => (category ? entry.category === category : true))
    .sort((left, right) => left.order - right.order);
}

export function getComponentCategorySections() {
  return (Object.keys(componentCategories) as ComponentCategory[])
    .map((category) => ({
      category,
      label: componentCategories[category].label,
      entries: getComponentEntries(category),
    }))
    .filter((section) => section.entries.length > 0);
}
