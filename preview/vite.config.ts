import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '../dist/preview',
    emptyOutDir: true
  },
  root: __dirname
});
