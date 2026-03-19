const fs = require('fs');
const path = require('path');

const dirs = [
  'e:\\nodejs\\billing-internet\\src\\app\\pengeluaran',
  'e:\\nodejs\\billing-internet\\src\\app\\api\\pengeluaran'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Created: ${dir}`);
});

console.log('All directories created successfully');
