import os

# Create directories
dir1 = r"e:\nodejs\billing-internet\src\app\pengeluaran"
dir2 = r"e:\nodejs\billing-internet\src\app\api\pengeluaran"

os.makedirs(dir1, exist_ok=True)
os.makedirs(dir2, exist_ok=True)

print("Directories created successfully")
print(f"✓ {dir1}")
print(f"✓ {dir2}")
