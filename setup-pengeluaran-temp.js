const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
  'e:\\nodejs\\billing-internet\\src\\app\\pengeluaran',
  'e:\\nodejs\\billing-internet\\src\\app\\api\\pengeluaran'
];

dirs.forEach(dir => {
  try {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  } catch (err) {
    console.error(`Error creating ${dir}:`, err.message);
  }
});

// Verify directories exist
console.log('\n=== Verification ===');
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✓ Directory exists: ${dir}`);
    console.log(`  Contents:`, fs.readdirSync(dir));
  } else {
    console.log(`✗ Directory does NOT exist: ${dir}`);
  }
});
