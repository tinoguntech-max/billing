const { execSync } = require('child_process');

try {
  const output = execSync('node setup-pengeluaran.js', {
    cwd: 'e:\\nodejs\\billing-internet',
    stdio: 'pipe',
    encoding: 'utf8'
  });
  console.log(output);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
