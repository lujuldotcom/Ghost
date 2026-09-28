import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    outDir: resolve(import.meta.dirname, 'umd'),
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: mode === 'production',
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.js'),
      formats: ['iife'],
      name: 'GhostVendor',
      fileName: () => 'vendor.min.js',
    },
  },
}));
