#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Execute the setup-pengeluaran.js script
const scriptPath = path.join(__dirname, 'setup-pengeluaran.js');
const result = childProcess.spawnSync('node', [scriptPath], {
  stdio: 'inherit',
  cwd: __dirname
});

process.exit(result.status || 0);
