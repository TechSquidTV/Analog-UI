import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  publicDir: './src/public',
  vite: {
    plugins: [tailwindcss()],
  },
});
