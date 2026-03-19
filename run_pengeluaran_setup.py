import subprocess
import os

os.chdir('e:\\nodejs\\billing-internet')
result = subprocess.run(['node', 'setup-pengeluaran.js'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)
print("Return code:", result.returncode)
