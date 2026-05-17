import { rmSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const cacheDir = resolve(packageDir, 'node_modules/.cache/analog-ui-treeshaking');
const rootOverheadBudgetBytes = readBudget('ANALOG_UI_TREESHAKE_ROOT_OVERHEAD_BYTES', 128);
const viteOverheadBudgetBytes = readBudget('ANALOG_UI_TREESHAKE_VITE_OVERHEAD_BYTES', 128);

const externalRuntimeDeps = [
  '@base-ui/react',
  '@base-ui/react/*',
  'clsx',
  'lucide-react',
  'motion/react',
  'react',
  'react-dom',
  'react/jsx-runtime',
  'tailwind-merge',
];

const reactOnlyExternalDeps = ['react', 'react-dom', 'react/jsx-runtime'];

const componentNames = [
  'SurfaceButton',
  'RockerThumbSurface',
  'SquarePlunger',
  'Dial',
  'Gauge',
  'RotarySwitch',
  'Indicator',
  'LCDDisplay',
  'Meter',
  'NeedleGauge',
  'Panel',
  'Slider',
  'Switch',
  'Toggle',
  'RockerSwitchGroup',
  'PushButton',
  'PushToggle',
  'ToggleButtonGroup',
  'Checkbox',
  'WheelNumber',
  'WheelSelect',
];

const exportCases = [
  ...componentNames.map((name) => ({
    name,
    subpath: `./dist/registry/components/analog/${name}.js`,
  })),
  {
    name: 'useAnalogLighting',
    subpath: './dist/registry/hooks/use-analog-lighting.js',
  },
  {
    name: 'usePointerLighting',
    subpath: './dist/registry/hooks/use-pointer-lighting.js',
  },
  {
    name: 'useWheelInput',
    subpath: './dist/registry/hooks/use-wheel-input.js',
  },
  {
    name: 'cn',
    subpath: './dist/lib/utils.js',
  },
];

const dependencyIncludedCases = ['Slider', 'NeedleGauge', 'ToggleButtonGroup'];
const viteCases = ['Slider', 'NeedleGauge', 'ToggleButtonGroup'];

function readBudget(name, fallback) {
  const value = process.env[name];

  if (value == null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative byte count, got ${value}`);
  }

  return parsed;
}

function formatBytes(bytes) {
  const kib = bytes / 1024;
  return `${bytes.toLocaleString()} B (${kib.toFixed(1)} KiB)`;
}

function formatBundle(bundle) {
  return `${formatBytes(bundle.bytes)}, gzip ${formatBytes(bundle.gzipBytes)}`;
}

function normalizeInput(input) {
  const normalized = input.replaceAll('\\', '/');
  const normalizedPackageDir = packageDir.replaceAll('\\', '/');

  if (normalized.startsWith(`${normalizedPackageDir}/`)) {
    return normalized.slice(normalizedPackageDir.length + 1);
  }

  return normalized;
}

function getOutputMeta(metafile) {
  const output = Object.values(metafile.outputs)[0];

  if (!output) {
    throw new Error('esbuild did not produce output metadata');
  }

  return output;
}

function getActiveDistInputs(metafile) {
  const activeInputs = new Map();
  const output = getOutputMeta(metafile);

  for (const [input, data] of Object.entries(output.inputs)) {
    const normalizedInput = normalizeInput(input);

    if (normalizedInput.startsWith('dist/') && data.bytesInOutput > 0) {
      activeInputs.set(normalizedInput, data.bytesInOutput);
    }
  }

  return activeInputs;
}

function assertBuiltPackage() {
  const distIndex = resolve(packageDir, 'dist/index.js');

  try {
    statSync(distIndex);
  } catch {
    throw new Error(
      'dist/index.js does not exist. Run `pnpm run build` before checking treeshaking.',
    );
  }
}

async function bundleWithEsbuild({ label, source, external }) {
  const result = await esbuild({
    stdin: {
      contents: source,
      loader: 'js',
      resolveDir: packageDir,
      sourcefile: `${label}.js`,
    },
    outfile: resolve(cacheDir, 'esbuild', `${label}.js`),
    bundle: true,
    format: 'esm',
    minify: true,
    treeShaking: true,
    external,
    metafile: true,
    write: false,
    logLevel: 'silent',
  });

  const output = result.outputFiles.find((file) => file.path.endsWith('.js'));

  if (!output) {
    throw new Error(`esbuild did not produce a JS output for ${label}`);
  }

  return {
    bytes: output.contents.byteLength,
    gzipBytes: gzipSync(output.contents, { mtime: 0 }).byteLength,
    activeDistInputs: getActiveDistInputs(result.metafile),
  };
}

function assertRootMatchesSubpath({ name, root, subpath, budget }) {
  const byteDelta = root.bytes - subpath.bytes;

  if (byteDelta > budget) {
    throw new Error(
      `${name} root import is ${formatBytes(byteDelta)} larger than subpath import, budget ${formatBytes(
        budget,
      )}`,
    );
  }

  const allowedRootOnlyInputs = new Set(['dist/index.js']);
  const subpathInputs = new Set(subpath.activeDistInputs.keys());
  const unexpectedInputs = [...root.activeDistInputs.keys()].filter(
    (input) => !subpathInputs.has(input) && !allowedRootOnlyInputs.has(input),
  );

  if (unexpectedInputs.length > 0) {
    throw new Error(
      `${name} root import rendered unexpected dist modules: ${unexpectedInputs.join(', ')}`,
    );
  }
}

async function runEsbuildMatrix() {
  console.log('[treeshake] esbuild root named import vs direct subpath matrix');

  for (const testCase of exportCases) {
    const root = await bundleWithEsbuild({
      label: `root-${testCase.name}`,
      source: `import { ${testCase.name} } from './dist/index.js'; console.log(${testCase.name});`,
      external: externalRuntimeDeps,
    });
    const subpath = await bundleWithEsbuild({
      label: `subpath-${testCase.name}`,
      source: `import { ${testCase.name} } from '${testCase.subpath}'; console.log(${testCase.name});`,
      external: externalRuntimeDeps,
    });

    assertRootMatchesSubpath({
      name: testCase.name,
      root,
      subpath,
      budget: rootOverheadBudgetBytes,
    });

    console.log(`  ${testCase.name}: root ${formatBundle(root)}; subpath ${formatBundle(subpath)}`);
  }
}

async function runDependencyIncludedEsbuildChecks() {
  console.log('[treeshake] esbuild selected checks with package dependencies included');

  for (const name of dependencyIncludedCases) {
    const root = await bundleWithEsbuild({
      label: `deps-root-${name}`,
      source: `import { ${name} } from './dist/index.js'; console.log(${name});`,
      external: reactOnlyExternalDeps,
    });
    const subpath = await bundleWithEsbuild({
      label: `deps-subpath-${name}`,
      source: `import { ${name} } from './dist/registry/components/analog/${name}.js'; console.log(${name});`,
      external: reactOnlyExternalDeps,
    });

    assertRootMatchesSubpath({
      name: `${name} with dependencies`,
      root,
      subpath,
      budget: rootOverheadBudgetBytes,
    });

    console.log(`  ${name}: root ${formatBundle(root)}; subpath ${formatBundle(subpath)}`);
  }
}

function externalizeRuntimeDependency(id) {
  return externalRuntimeDeps.some((dependency) => {
    if (dependency.endsWith('/*')) {
      return id.startsWith(dependency.slice(0, -1));
    }

    return id === dependency || id.startsWith(`${dependency}/`);
  });
}

function findOnlyJsFile(dir) {
  const jsFiles = readdirSync(dir).filter((file) => file.endsWith('.js'));

  if (jsFiles.length !== 1) {
    throw new Error(`Expected one Vite JS output in ${dir}, found ${jsFiles.length}`);
  }

  return resolve(dir, jsFiles[0]);
}

async function bundleWithVite({ label, source }) {
  const root = resolve(cacheDir, 'vite', label);
  const outDir = resolve(root, 'dist');
  const entry = resolve(root, 'entry.js');

  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  writeFileSync(entry, source);

  await viteBuild({
    root: packageDir,
    logLevel: 'silent',
    configFile: false,
    build: {
      emptyOutDir: true,
      lib: {
        entry,
        formats: ['es'],
        fileName: () => 'bundle.js',
      },
      minify: 'esbuild',
      outDir,
      sourcemap: false,
      rollupOptions: {
        external: externalizeRuntimeDependency,
      },
    },
  });

  const bundlePath = findOnlyJsFile(outDir);
  const contents = readFileSync(bundlePath);

  return {
    bytes: contents.byteLength,
    gzipBytes: gzipSync(contents, { mtime: 0 }).byteLength,
  };
}

async function runViteChecks() {
  console.log('[treeshake] Vite/Rollup package export checks');

  for (const name of viteCases) {
    const root = await bundleWithVite({
      label: `root-${name}`,
      source: `import { ${name} } from 'analog-ui'; console.log(${name});`,
    });
    const subpath = await bundleWithVite({
      label: `subpath-${name}`,
      source: `import { ${name} } from 'analog-ui/components/${name}'; console.log(${name});`,
    });
    const byteDelta = root.bytes - subpath.bytes;

    if (byteDelta > viteOverheadBudgetBytes) {
      throw new Error(
        `${name} Vite root import is ${formatBytes(byteDelta)} larger than subpath import, budget ${formatBytes(
          viteOverheadBudgetBytes,
        )}`,
      );
    }

    console.log(`  ${name}: root ${formatBundle(root)}; subpath ${formatBundle(subpath)}`);
  }
}

assertBuiltPackage();
rmSync(cacheDir, { recursive: true, force: true });
mkdirSync(cacheDir, { recursive: true });

await runEsbuildMatrix();
await runDependencyIncludedEsbuildChecks();
await runViteChecks();

console.log(
  `[treeshake] Checks passed. Root named imports stayed within ${formatBytes(
    rootOverheadBudgetBytes,
  )} of direct subpaths.`,
);
