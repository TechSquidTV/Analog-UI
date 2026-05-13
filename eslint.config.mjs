import js from '@eslint/js';
import globals from 'globals';
import astro from 'eslint-plugin-astro';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import analogDesign from './tools/eslint-plugin-analog-design/index.mjs';

const reactFiles = ['apps/www/src/**/*.{jsx,tsx}', 'packages/analog-ui/src/**/*.{jsx,tsx}'];
const analogComponentFiles = ['packages/analog-ui/src/registry/components/analog/**/*.{ts,tsx}'];
const analogThemeFile = fileURLToPath(
  new URL('./packages/analog-ui/src/theme.css', import.meta.url),
);

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    files: reactFiles,
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: reactFiles,
    ...react.configs.flat['jsx-runtime'],
  },
  {
    files: reactFiles,
    plugins: reactHooks.configs.flat.recommended.plugins,
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    files: ['apps/www/src/**/*.{ts,tsx}', 'packages/analog-ui/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: [
      'apps/www/astro.config.mjs',
      'eslint.config.mjs',
      'packages/analog-ui/scripts/**/*.mjs',
      'packages/analog-ui/tsup.config.ts',
      'tools/**/*.mjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: reactFiles,
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: analogComponentFiles,
    plugins: {
      'analog-design': analogDesign,
    },
    rules: {
      'analog-design/no-raw-finish-colors': 'error',
      'analog-design/no-unknown-analog-tokens': ['error', { themeFile: analogThemeFile }],
      'analog-design/require-lighting-for-finish-channels': 'error',
    },
  },
  {
    files: ['packages/analog-ui/src/index.css'],
    plugins: {
      'analog-design': analogDesign,
    },
    processor: analogDesign.processors['css-text'],
    rules: {
      'analog-design/no-raw-finish-colors': 'error',
      'analog-design/no-unknown-analog-tokens': ['error', { themeFile: analogThemeFile }],
      'analog-design/require-lighting-for-finish-channels': 'error',
    },
  },
);
