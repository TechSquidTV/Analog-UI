import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface RegistryItem {
  name: string;
  title: string;
  type: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
}

interface RegistryDocument {
  items: RegistryItem[];
}

const registryPath = fileURLToPath(
  new URL('../../../../packages/analog-ui/registry.json', import.meta.url),
);

const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as RegistryDocument;
const registryItemsByName = new Map(registry.items.map((item) => [item.name, item]));

export function getRegistryItems() {
  return registry.items;
}

export function getRegistryItem(name: string) {
  return registryItemsByName.get(name);
}
