#!/usr/bin/env node

import { spawn } from 'child_process';
import nodemon from 'nodemon';

// Function to run the inspector
function startInspector() {
  return spawn('npm', ['run', 'inspect'], {
    stdio: 'inherit',
    shell: true
  });
}

let currentInspector = null;

// Set up nodemon to watch the src directory
nodemon({
  watch: ['src'],
  ext: 'ts',
  exec: 'npm run build'
});

// Handle nodemon events
nodemon
  .on('start', () => {
    console.log('Starting build...');
  })
  .on('restart', () => {
    console.log('Files changed, rebuilding...');
    // Kill existing inspector process if it exists
    if (currentInspector) {
      currentInspector.kill();
    }
  })
  .on('quit', () => {
    console.log('Nodemon stopped');
    process.exit();
  })
  .on('error', (err) => {
    console.error('Nodemon error:', err);
  })
  .on('crash', () => {
    console.error('Application crashed');
  })
  .on('exit', () => {
    // Start or restart the inspector after build completes
    if (currentInspector) {
      currentInspector.kill();
    }
    currentInspector = startInspector();
  });

// Handle process termination
process.on('SIGTERM', () => {
  nodemon.quit();
});

process.on('SIGINT', () => {
  nodemon.quit();
});
