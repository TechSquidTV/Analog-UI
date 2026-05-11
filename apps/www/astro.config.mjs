import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeDocsCodeBlocks from './src/lib/rehype-docs-code-blocks.mjs';

export default defineConfig({
  integrations: [react()],
  markdown: {
    rehypePlugins: [rehypeDocsCodeBlocks],
  },
  publicDir: './src/public',
  site: 'https://analogui.com',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../packages/analog-ui/src', import.meta.url)),
      },
    },
  },
});
