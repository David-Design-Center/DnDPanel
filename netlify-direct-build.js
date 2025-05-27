// This file provides a direct fix for the React import issues in Netlify builds
// If the Netlify build fails, add this to your package.json: 
// "build": "node ./netlify-direct-build.js"

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Make sure the node_modules directory exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  log('Installing dependencies first...', 'yellow');
  execSync('npm install', { stdio: 'inherit' });
}

// Fix React imports in problematic files
function fixReactImports() {
  log('Starting React import fixes...', 'blue');
  
  // Find and fix @radix-ui/react-icons
  const radixPath = path.join(process.cwd(), 'node_modules/@radix-ui/react-icons/dist/react-icons.esm.js');
  if (fs.existsSync(radixPath)) {
    log('Fixing @radix-ui/react-icons...', 'cyan');
    let content = fs.readFileSync(radixPath, 'utf-8');
    content = content.replace(
      "import { forwardRef, createElement } from 'react';",
      "import React from 'react';\nconst { forwardRef, createElement } = React;"
    );
    fs.writeFileSync(radixPath, content);
    log('Fixed @radix-ui/react-icons ✓', 'green');
  } else {
    log('Could not find @radix-ui/react-icons module', 'yellow');
  }
  
  // Check for other potential problematic files
  ['react-router', 'react-router-dom'].forEach(module => {
    const modulePath = path.join(process.cwd(), `node_modules/${module}/dist/index.js`);
    if (fs.existsSync(modulePath)) {
      log(`Fixing ${module}...`, 'cyan');
      let content = fs.readFileSync(modulePath, 'utf-8');
      content = content.replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/g,
        (match, namedImports) => `import React from 'react';\nconst { ${namedImports} } = React;`
      );
      fs.writeFileSync(modulePath, content);
      log(`Fixed ${module} ✓`, 'green');
    }
  });
}

async function buildProject() {
  try {
    // Fix React imports
    fixReactImports();
    
    // Run TypeScript compiler
    log('Running TypeScript compiler...', 'blue');
    execSync('npx tsc -b', { stdio: 'inherit' });
    log('TypeScript compilation completed ✓', 'green');
    
    // Run Vite build
    log('Running Vite build...', 'blue');
    execSync('npx vite build', { stdio: 'inherit' });
    log('Build completed successfully! ✓', 'green');
    
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, 'red');
    return false;
  }
}

// Run the build
buildProject().then(success => {
  process.exit(success ? 0 : 1);
});
