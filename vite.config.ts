import react from '@vitejs/plugin-react';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { defineConfig } from 'vite';
// @ts-ignore
import reactImportFixer from './src/lib/vite-react-import-fixer';

export default defineConfig({
  plugins: [
    react(),
    polyfillNode(),
    reactImportFixer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
      buffer: 'buffer',
      // Use alias for React-related paths to help prevent import issues
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime.js'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom/index.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react', 
      'react-dom', 
      'react-router', 
      'react-router-dom'
    ],
    esbuildOptions: {
      define: { global: 'globalThis' },
      plugins: [
        NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    commonjsOptions: {
      // Improve compatibility with CommonJS modules
      transformMixedEsModules: true,
      // Ensure React is properly handled
      include: [/node_modules/],
    },
    // Improve error output during build
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    rollupOptions: {
      plugins: [polyfillNode()],
    },
  },
  define: {
    'process.env': {},
  },
});