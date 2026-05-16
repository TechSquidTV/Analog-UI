import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const smokeRoot = resolve(packageDir, 'node_modules/.cache/analog-ui-package-smoke');
const packDir = resolve(smokeRoot, 'pack');
const consumerDir = resolve(smokeRoot, 'consumer');
const installDir = resolve(consumerDir, 'node_modules/analog-ui');
const keepSmokeFiles = process.env.ANALOG_UI_KEEP_SMOKE === '1';

const requiredTarballEntries = [
  'package/package.json',
  'package/dist/index.js',
  'package/dist/index.d.ts',
  'package/dist/index.css',
  'package/dist/demo.js',
  'package/dist/demo.d.ts',
  'package/components.json',
  'package/registry.json',
];

function log(message) {
  console.log(`[package-smoke] ${message}`);
}

function run(command, args, { cwd = packageDir, stdio = 'inherit' } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
    stdio,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }

  return result;
}

function assertFileExists(path) {
  if (!existsSync(path)) {
    throw new Error(`Expected file does not exist: ${path}`);
  }
}

function writeRuntimeSmoke() {
  writeFileSync(
    resolve(consumerDir, 'runtime-smoke.mjs'),
    `import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const analogUi = await import('analog-ui');
await import('analog-ui/demo');

for (const subpath of [
  'analog-ui/styles.css',
  'analog-ui/components.json',
  'analog-ui/registry.json',
]) {
  const resolved = require.resolve(subpath);
  if (!existsSync(resolved)) {
    throw new Error(\`Resolved \${subpath} to missing file: \${resolved}\`);
  }
}

const registry = require('analog-ui/registry.json');
if (!Array.isArray(registry.items) || registry.items.length === 0) {
  throw new Error('analog-ui/registry.json did not expose registry items');
}

const exportedComponentNames = [
  ...new Set(
    registry.items
      .flatMap((item) => item.files ?? [])
      .map((file) =>
        file.path?.match(/^src\\/registry\\/components\\/analog\\/([A-Z][^/.]*)\\.(?:ts|tsx)$/)?.[1],
      )
      .filter(Boolean),
  ),
];

const missingComponentExports = exportedComponentNames.filter((name) => !(name in analogUi));
if (missingComponentExports.length > 0) {
  throw new Error(\`Missing component exports: \${missingComponentExports.join(', ')}\`);
}

const requiredExports = [
  'AnalogLightingProvider',
  'useAnalogLighting',
  'usePointerLighting',
  'cn',
];
const missingExports = requiredExports.filter((name) => !(name in analogUi));
if (missingExports.length > 0) {
  throw new Error(\`Missing package exports: \${missingExports.join(', ')}\`);
}

const markup = renderToStaticMarkup(
  React.createElement(
    analogUi.AnalogLightingProvider,
    null,
    React.createElement(analogUi.Dial, {
      'aria-label': 'Package smoke dial',
      defaultValue: 45,
    }),
  ),
);

if (!markup.includes('data-slot="dial-root"')) {
  throw new Error('Server render did not include the expected Dial markup');
}

console.log(
  \`Runtime import smoke passed for \${exportedComponentNames.length} component exports from \${basename(require.resolve('analog-ui/registry.json'))}.\`,
);
`,
  );
}

function writeTypeSmoke() {
  writeFileSync(
    resolve(consumerDir, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }, null, 2),
  );
  writeFileSync(
    resolve(consumerDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          types: [],
        },
        include: ['type-smoke.tsx'],
      },
      null,
      2,
    ),
  );
  writeFileSync(
    resolve(consumerDir, 'type-smoke.tsx'),
    `import type { ReactElement } from 'react';
import {
  AnalogLightingProvider,
  Dial,
  Meter,
  RockerThumbSurface,
  Slider,
  SquarePlunger,
  Switch,
  type AnalogTone,
  type DialProps,
  type RockerThumbSurfaceProps,
  type SliderProps,
} from 'analog-ui';

const tone: AnalogTone = 'primary';
const dialProps: DialProps = { defaultValue: 12, variant: 'chrome' };
const sliderProps: SliderProps = { defaultValue: 30 };
const thumbProps: RockerThumbSurfaceProps = { raisedSide: 'both', variant: 'black' };

const view: ReactElement = (
  <AnalogLightingProvider baseAngle={180}>
    <Dial {...dialProps} />
    <Slider {...sliderProps} />
    <Switch defaultChecked />
    <Meter value={42} />
    <RockerThumbSurface {...thumbProps} />
    <SquarePlunger isPressed={false} variant="rubber" />
  </AnalogLightingProvider>
);

void tone;
void view;
`,
  );
}

function getTscCommand() {
  const executable = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
  return resolve(packageDir, 'node_modules/.bin', executable);
}

try {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(packDir, { recursive: true });
  mkdirSync(installDir, { recursive: true });

  log('Packing analog-ui publish artifact');
  run('pnpm', ['pack', '--pack-destination', packDir]);

  const tarballs = readdirSync(packDir).filter((file) => file.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    throw new Error(`Expected one packed tarball, found ${tarballs.length}`);
  }

  const tarballPath = resolve(packDir, tarballs[0]);
  log(`Inspecting ${basename(tarballPath)}`);
  const tarResult = run('tar', ['-tf', tarballPath], { stdio: 'pipe' });
  const tarballEntries = new Set(tarResult.stdout.trim().split(/\r?\n/));
  const missingTarballEntries = requiredTarballEntries.filter(
    (entry) => !tarballEntries.has(entry),
  );
  if (missingTarballEntries.length > 0) {
    throw new Error(`Packed tarball is missing: ${missingTarballEntries.join(', ')}`);
  }

  log('Unpacking tarball into an isolated consumer fixture');
  run('tar', ['-xzf', tarballPath, '-C', installDir, '--strip-components', '1']);

  for (const entry of requiredTarballEntries.map((entry) => entry.replace(/^package\//, ''))) {
    assertFileExists(resolve(installDir, entry));
  }

  const packageJson = JSON.parse(readFileSync(resolve(installDir, 'package.json'), 'utf8'));
  if (packageJson.name !== 'analog-ui') {
    throw new Error(`Packed package name was ${packageJson.name}, expected analog-ui`);
  }

  writeRuntimeSmoke();
  writeTypeSmoke();

  log('Checking runtime imports through package exports');
  run(process.execPath, [resolve(consumerDir, 'runtime-smoke.mjs')], { cwd: consumerDir });

  log('Checking generated declaration files from a consumer TypeScript project');
  run(getTscCommand(), ['--project', resolve(consumerDir, 'tsconfig.json')], { cwd: consumerDir });

  log('Package smoke test passed');
} finally {
  if (keepSmokeFiles) {
    log(`Kept smoke files at ${smokeRoot}`);
  } else {
    rmSync(smokeRoot, { recursive: true, force: true });
  }
}
