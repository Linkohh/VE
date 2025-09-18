import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@fortawesome/svelte-fontawesome': resolve(
        __dirname,
        'src/test/mocks/fontawesome.ts',
      ),
    },
    conditions: ['browser', 'svelte'],
  },
  plugins: [svelte()],
});
