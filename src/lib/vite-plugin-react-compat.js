// Vite plugin to fix React 18 named exports for various libraries
import fs from 'fs';
import path from 'path';

/**
 * This plugin patches imports in node_modules that expect specific named exports from React
 * but don't work with React 18's ESM exports when bundled by Vite.
 */
export function reactCompatPlugin() {
  const reactShim = `
import * as React from 'react';
export const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React;
export default React;
`;

  return {
    name: 'vite-plugin-react-compat',
    enforce: 'pre',
    resolveId(id) {
      // Create a virtual module for our shim
      if (id === 'virtual:react-compat') {
        return '\0virtual:react-compat';
      }
      return null;
    },
    load(id) {
      // Return the content of our virtual module
      if (id === '\0virtual:react-compat') {
        return reactShim;
      }
      return null;
    },
    transform(code, id) {
      // List of problematic modules that need fixing
      const modulesToFix = [
        '@radix-ui/react-icons', 
        'react-router',
        'react-router-dom',
        '@radix-ui'
      ];

      // Check if the current file is from one of the modules we want to fix
      const shouldFix = modulesToFix.some(module => id.includes(module)) && 
                        (id.endsWith('.js') || id.endsWith('.mjs') || id.endsWith('.tsx') || id.endsWith('.ts'));

      if (shouldFix) {
        // Replace direct named imports from react with our shim
        return code.replace(
          /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/g, 
          `import { $1 } from 'virtual:react-compat'`
        );
      }

      return null;
    }
  };
}
