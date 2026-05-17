import { defineConfig } from 'tsup';
import { readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const sourceDir = 'src';
const entryExtensions = new Set(['.ts', '.tsx']);
const excludedEntries = new Set(['main.tsx']);

function collectEntries(dir: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      Object.assign(entries, collectEntries(path));
      continue;
    }

    const extension = extname(path);
    const sourcePath = relative(sourceDir, path);

    if (!entryExtensions.has(extension) || excludedEntries.has(sourcePath)) {
      continue;
    }

    entries[sourcePath.slice(0, -extension.length)] = path;
  }

  return entries;
}

export default defineConfig({
  entry: collectEntries(sourceDir),
  format: ['esm'],
  bundle: false,
  dts: true,
  clean: true,
  sourcemap: false,
  external: [
    '@base-ui/react',
    '@base-ui/react/*',
    'clsx',
    'lucide-react',
    'motion/react',
    'react',
    'react-dom',
    'react/jsx-runtime',
    'tailwind-merge',
  ],
});
