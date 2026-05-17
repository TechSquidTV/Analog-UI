import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = resolve(fileURLToPath(import.meta.url), '..');
const packageDir = resolve(scriptsDir, '..');
const distDir = resolve(packageDir, 'dist');
const importExportPattern =
  /((?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"])(\.[^'"]+?)(['"])/g;

function hasKnownExtension(specifier) {
  return extname(specifier) !== '';
}

function fixSpecifier(specifier) {
  if (!specifier.startsWith('.') || hasKnownExtension(specifier)) {
    return specifier;
  }

  return `${specifier}.js`;
}

function fixFile(path) {
  const source = readFileSync(path, 'utf8');
  const nextSource = source.replace(importExportPattern, (match, prefix, specifier, suffix) => {
    const fixedSpecifier = fixSpecifier(specifier);

    return fixedSpecifier === specifier ? match : `${prefix}${fixedSpecifier}${suffix}`;
  });

  if (nextSource !== source) {
    writeFileSync(path, nextSource);
  }
}

function walk(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      walk(path);
      continue;
    }

    if (path.endsWith('.js')) {
      fixFile(path);
    }
  }
}

walk(distDir);
console.log(
  `[fix-esm-extensions] Added .js extensions to relative ESM imports in ${relative(packageDir, distDir)}.`,
);
