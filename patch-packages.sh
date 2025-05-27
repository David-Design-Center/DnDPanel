#!/bin/bash

# This script patches package.json of key dependencies to work better with Vite
# For use during Netlify build process

# Check if the react directory exists
if [ -d "./node_modules/react" ]; then
  echo "Patching React package.json..."
  
  # Create a patched package.json for React with proper exports
  cat > ./node_modules/react/package.json << 'EOL'
{
  "name": "react",
  "version": "18.2.0",
  "description": "React is a JavaScript library for building user interfaces.",
  "main": "index.js",
  "module": "index.js",
  "exports": {
    ".": {
      "require": "./index.js",
      "import": "./index.js"
    },
    "./jsx-runtime": {
      "require": "./jsx-runtime.js",
      "import": "./jsx-runtime.js"
    },
    "./jsx-dev-runtime": {
      "require": "./jsx-dev-runtime.js",
      "import": "./jsx-dev-runtime.js"
    },
    "./package.json": "./package.json"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/facebook/react.git",
    "directory": "packages/react"
  },
  "license": "MIT"
}
EOL
  echo "React package.json patched!"
fi

# Create a compatibility layer for problematic packages
echo "Creating compatibility layer for @radix-ui/react-icons..."
mkdir -p ./node_modules/@radix-ui/react-icons/compat
cat > ./node_modules/@radix-ui/react-icons/compat/index.js << 'EOL'
import React from 'react';
const { forwardRef, createElement } = React;
export { forwardRef, createElement };
EOL

echo "Creating patches for react-router..."
mkdir -p ./node_modules/react-router/compat
cat > ./node_modules/react-router/compat/index.js << 'EOL'
import React from 'react';
export const {
  createContext,
  useContext,
  useMemo,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  useEffect,
  Fragment,
  createElement,
  Component,
  Children,
  isValidElement,
  memo
} = React;
EOL

echo "All patches applied!"
