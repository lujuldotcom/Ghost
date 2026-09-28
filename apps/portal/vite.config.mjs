/* eslint-env node */
import { resolve } from 'path';
import pkg from './package.json';
import { publicAppViteConfig } from '@internal/cfg-vite-public-app';

export default publicAppViteConfig({
  packageRoot: import.meta.dirname,
  packageName: pkg.name,
  entry: 'src/index.jsx',
  cssCodeSplit: false,
  overrides: {
    define: {
      REACT_APP_VERSION: JSON.stringify(pkg.version),
    },
    resolve: {
      dedupe: ['@tryghost/debug'],
      alias: {
        '@tryghost/i18n/registry/portal': resolve(
          import.meta.dirname,
          '../../packages/i18n/src/registry-lujul/portal.ts',
        ),
      },
    },
    build: {
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'ReactJSXRuntime',
          },
        },
      },
    },
    test: {
      setupFiles: './test/setup-tests.js',
      coverage: {
        reporter: ['cobertura', 'text-summary', 'html'],
      },
    },
  },
});
