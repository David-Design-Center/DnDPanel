// This plugin fixes the @radix-ui/react-icons import issue with React 18

/**
 * Plugin to fix React 18 import issues with @radix-ui/react-icons
 * @returns {import('vite').Plugin}
 */
export function radixIconsShim() {
  const REACT_IMPORT = `import { forwardRef, createElement } from 'react';`;
  const REACT_FIXED_IMPORT = `import React from 'react'; const { forwardRef, createElement } = React;`;

  return {
    name: 'vite-plugin-radix-icons-shim',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('@radix-ui/react-icons') && id.endsWith('.js')) {
        return code.replace(REACT_IMPORT, REACT_FIXED_IMPORT);
      }
      return code;
    },
  };
}
