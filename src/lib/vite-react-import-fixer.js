/**
 * Vite plugin to fix issues with React imports
 * This plugin handles named imports from 'react' in ESM builds
 */

/**
 * @typedef {import('vite').Plugin} Plugin
 * @returns {Plugin}
 */
export default function reactImportFixer() {
  return {
    name: 'vite-plugin-react-import-fixer',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'virtual:react-compat') {
        return '\0virtual:react-compat';
      }
    },
    load(id) {
      if (id === '\0virtual:react-compat') {
        return `
          import React from 'react';
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
      }
    },
    transform(code, id) {
      // Only transform node_modules code that imports from React
      if (id.includes('node_modules') && 
          (id.includes('@radix-ui') || 
           id.includes('react-router') || 
           id.includes('react-router-dom'))) {
        
        // Detect React named imports
        if (code.includes("from 'react'") || code.includes('from "react"')) {
          console.log('Fixing React imports in:', id);
          
          // Replace named imports with our virtual module
          return code
            .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/g, 
                     `import { $1 } from 'virtual:react-compat'`)
            .replace(/import\s+React\s+from\s+['"]react['"]/g,
                     `import React from 'virtual:react-compat'`);
        }
      }
    }
  };
}
