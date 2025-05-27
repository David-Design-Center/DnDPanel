#!/bin/bash

# This script is used for Netlify builds to work around the React 18 named exports issue

# Fix the @radix-ui/react-icons import issue
echo "Patching @radix-ui/react-icons for React 18 compatibility..."
sed -i 's/import { forwardRef, createElement } from '"'"'react'"'"';/import React from '"'"'react'"'"';\nconst { forwardRef, createElement } = React;/' ./node_modules/@radix-ui/react-icons/dist/react-icons.esm.js

# Run the original build command
echo "Running build command..."
npm run build
