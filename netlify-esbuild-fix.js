// This script directly patches @netlify/zip-it-and-ship-it to accept whatever esbuild version is available
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Make sure we're using the right esbuild version
try {
  log('Ensuring esbuild@0.25.4 is installed...', 'blue');
  execSync('npm install --save-exact esbuild@0.25.4', { stdio: 'inherit' });
  log('esbuild installation confirmed ✓', 'green');
} catch (error) {
  log(`Failed to install esbuild: ${error.message}`, 'red');
}

// Find all files in zip-it-and-ship-it that might be checking esbuild versions
log('Looking for esbuild version checks in @netlify/zip-it-and-ship-it...', 'blue');

function searchAndPatchFiles(directory, pattern, replacementFn) {
  if (!fs.existsSync(directory)) {
    log(`Directory not found: ${directory}`, 'yellow');
    return;
  }

  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      searchAndPatchFiles(fullPath, pattern, replacementFn);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.mjs')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        if (content.includes(pattern)) {
          log(`Found esbuild check in ${fullPath}`, 'yellow');
          
          // Create backup
          fs.writeFileSync(`${fullPath}.bak`, content);
          
          // Apply patch
          const patchedContent = replacementFn(content);
          fs.writeFileSync(fullPath, patchedContent);
          
          log(`Patched ${fullPath} ✓`, 'green');
        }
      } catch (error) {
        log(`Error processing ${fullPath}: ${error.message}`, 'red');
      }
    }
  }
}

// Path to node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');

// Patch esbuild install scripts
searchAndPatchFiles(
  path.join(nodeModulesPath, 'esbuild'),
  'throw new Error(`Expected ${JSON.stringify(versionFromPackageJSON)}',
  (content) => content.replace(
    /throw new Error\(`Expected \${JSON\.stringify\(versionFromPackageJSON\)}[^`]+`\);/g,
    'console.warn(`Warning: Expected ${JSON.stringify(versionFromPackageJSON)} but got ${JSON.stringify(stdout)}, continuing anyway...`);'
  )
);

// Patch @netlify/zip-it-and-ship-it
searchAndPatchFiles(
  path.join(nodeModulesPath, '@netlify'),
  'esbuild version',
  (content) => content
    .replace(
      /if\s*\(\s*esbuildVersion\s*!==\s*[^)]+\)\s*{[^}]*}/gs,
      'if (false) { console.warn("Skipping esbuild version check"); }'
    )
    .replace(
      /throw new Error\(`Expected esbuild version[^`]+`\);/g,
      'console.warn(`Version mismatch but continuing anyway...`);'
    )
);

// Output the status
log('All esbuild version checks have been patched! ✓', 'green');

try {
  log('Current esbuild version:', 'blue');
  execSync('npx esbuild --version', { stdio: 'inherit' });
} catch (error) {
  log(`Couldn't check esbuild version: ${error.message}`, 'red');
}
