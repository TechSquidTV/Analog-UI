import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const distIndex = resolve(packageDir, 'dist/index.js');

const maxPackedBytes = readBudget('ANALOG_UI_MAX_PACKED_BYTES', 180_000);
const maxUnpackedBytes = readBudget('ANALOG_UI_MAX_UNPACKED_BYTES', 700_000);

function readBudget(name, fallback) {
  const value = process.env[name];

  if (value == null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive byte count, got ${value}`);
  }

  return parsed;
}

function formatBytes(bytes) {
  const kib = bytes / 1024;
  return `${bytes.toLocaleString()} B (${kib.toFixed(1)} KiB)`;
}

function parsePackJson(stdout) {
  const jsonStart = stdout.indexOf('[');

  if (jsonStart === -1) {
    throw new Error(`npm pack did not return JSON:\n${stdout}`);
  }

  const packages = JSON.parse(stdout.slice(jsonStart));
  if (!Array.isArray(packages) || packages.length !== 1) {
    throw new Error(`Expected one packed package, received ${packages.length}`);
  }

  return packages[0];
}

function runPackDryRun() {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageDir,
    env: {
      ...process.env,
      npm_config_cache: process.env.npm_config_cache ?? resolve(tmpdir(), 'analog-ui-npm-cache'),
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`npm pack failed:\n${result.stderr || result.stdout}`);
  }

  return parsePackJson(result.stdout);
}

if (!existsSync(distIndex)) {
  throw new Error(
    'dist/index.js does not exist. Run `pnpm run build` before checking package size.',
  );
}

const pack = runPackDryRun();
const files = Array.isArray(pack.files) ? pack.files : [];
const sourceMapFiles = files.filter((file) => file.path.endsWith('.map'));
const failures = [];

if (pack.size > maxPackedBytes) {
  failures.push(
    `packed size ${formatBytes(pack.size)} exceeds budget ${formatBytes(maxPackedBytes)}`,
  );
}

if (pack.unpackedSize > maxUnpackedBytes) {
  failures.push(
    `unpacked size ${formatBytes(pack.unpackedSize)} exceeds budget ${formatBytes(maxUnpackedBytes)}`,
  );
}

if (sourceMapFiles.length > 0) {
  failures.push(
    `package includes sourcemaps: ${sourceMapFiles.map((file) => file.path).join(', ')}`,
  );
}

console.log(`[package-size] ${pack.name}@${pack.version}`);
console.log(`[package-size] packed: ${formatBytes(pack.size)} / ${formatBytes(maxPackedBytes)}`);
console.log(
  `[package-size] unpacked: ${formatBytes(pack.unpackedSize)} / ${formatBytes(maxUnpackedBytes)}`,
);
console.log(`[package-size] entries: ${pack.entryCount}`);

if (files.length > 0) {
  const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 8);
  console.log('[package-size] largest files:');
  for (const file of largestFiles) {
    console.log(`  ${formatBytes(file.size)}  ${file.path}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[package-size] ${failure}`);
  }

  process.exit(1);
}

console.log('[package-size] Package size check passed.');
