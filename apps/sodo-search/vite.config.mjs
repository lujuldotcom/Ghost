/* eslint-env node */
import { resolve } from 'path';
import pkg from './package.json';
import { publicAppViteConfig } from '@internal/cfg-vite-public-app';

export default publicAppViteConfig({
  packageRoot: import.meta.dirname,
  packageName: pkg.name,
  entry: 'src/index.jsx',
  sourcemap: false,
  cssCodeSplit: false,
  overrides: {
    resolve: {
      dedupe: ['@tryghost/debug'],
      alias: {
        '@tryghost/i18n/registry/search': resolve(
          import.meta.dirname,
          '../../packages/i18n/src/registry-lujul/search.ts',
        ),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Theme templates reference umd/main.css by name (see
          // ghost/core defaults.json → sodoSearch.styles), so the
          // CSS sibling emitted by Vite must keep that filename.
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'main.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    test: {
      setupFiles: './test/setup-tests.js',
    },
  },
});
