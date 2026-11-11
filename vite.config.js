import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the production build also works when served
  // from a subdirectory (e.g. GitHub Pages).
  base: './',
});
