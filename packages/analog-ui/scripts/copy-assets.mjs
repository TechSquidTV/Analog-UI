import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const distDir = resolve(packageDir, 'dist');

mkdirSync(distDir, { recursive: true });
copyFileSync(resolve(packageDir, 'src/index.css'), resolve(distDir, 'index.css'));
copyFileSync(resolve(packageDir, 'src/texture.png'), resolve(distDir, 'texture.png'));
