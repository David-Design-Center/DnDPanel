// This file will be applied as a patch to fix the React icons issue using patch-package
// To create the patch:
// 1. Save this file as a reference
// 2. Modify @radix-ui/react-icons/dist/react-icons.esm.js manually
// 3. Run npx patch-package @radix-ui/react-icons
// 4. The patch will be applied during build

// Modified version of react-icons.esm.js:
// Replace:
// import { forwardRef, createElement } from 'react';
// With:
// import React from 'react';
// const { forwardRef, createElement } = React;
