#!/bin/bash

# Simple build script that applies fixes for React import issues
set -e # Exit immediately if a command exits with a non-zero status

# Show basic environment info
echo "====== ENVIRONMENT INFO ======"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "=============================="

# Create a patch for the @radix-ui/react-icons library
echo "====== APPLYING REACT IMPORT FIXES ======"

# Find and patch @radix-ui/react-icons module
if [ -f ./node_modules/@radix-ui/react-icons/dist/react-icons.esm.js ]; then
  echo "Patching @radix-ui/react-icons/dist/react-icons.esm.js"
  # Create a backup
  cp ./node_modules/@radix-ui/react-icons/dist/react-icons.esm.js ./node_modules/@radix-ui/react-icons/dist/react-icons.esm.js.bak
  
  # Apply the fix (replace named imports with default import + destructuring)
  sed -i.bak 's/import { forwardRef, createElement } from '"'"'react'"'"';/import React from '"'"'react'"'"';\nconst { forwardRef, createElement } = React;/' ./node_modules/@radix-ui/react-icons/dist/react-icons.esm.js
  
  echo "Patched successfully!"
fi

# Create temporary React shim module
echo "Creating React shim for named imports..."
SHIM_DIR="./node_modules/react-named-exports"
mkdir -p "$SHIM_DIR"

# Create a package.json for the shim
cat > "$SHIM_DIR/package.json" << 'EOL'
{
  "name": "react-named-exports",
  "version": "1.0.0",
  "main": "index.js",
  "module": "index.js",
  "type": "module"
}
EOL

# Create the shim index.js
cat > "$SHIM_DIR/index.js" << 'EOL'
import React from 'react';

// Export all named exports from React
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
  version
} = React;

// Also export as default
export default React;
EOL

# Make a simple vite.config.js that doesn't use TypeScript
echo "Creating simplified Vite config..."
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Simple plugin to fix React imports
function reactImportFixPlugin() {
  return {
    name: 'vite-plugin-react-import-fix',
    transform(code, id) {
      // Only apply to problematic modules
      if (id.includes('node_modules/@radix-ui') || 
          id.includes('node_modules/react-router')) {
        
        // Replace named imports with default import & destructuring
        return code.replace(
          /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/g,
          (match, imports) => {
            return `import React from 'react';\nconst { ${imports} } = React;`;
          }
        );
      }
      return code;
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    reactImportFixPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add alias for React named exports
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime.js'),
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
EOL

# First run TypeScript
echo "====== RUNNING TYPESCRIPT COMPILATION ======"
npx tsc -b

# Then build with vite using the simplified config
echo "====== RUNNING VITE BUILD ======"
npx vite build --config vite.config.js

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  exit 0
else
  echo "❌ Build failed"
  exit 1
fi
