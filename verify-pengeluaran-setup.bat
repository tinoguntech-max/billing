@echo off
setlocal enabledelayedexpansion

cd /d "e:\nodejs\billing-internet"

echo Running setup-pengeluaran.js...
echo.

node setup-pengeluaran.js

echo.
echo.
echo === VERIFICATION WITH DIR ===
echo.
echo --- Directory: src\app\pengeluaran ---
if exist "src\app\pengeluaran\" (
    dir "src\app\pengeluaran\"
) else (
    echo Directory does not exist!
)

echo.
echo --- Directory: src\app\api\pengeluaran ---
if exist "src\app\api\pengeluaran\" (
    dir "src\app\api\pengeluaran\"
) else (
    echo Directory does not exist!
)

echo.
echo --- File: src\app\pengeluaran\page.tsx ---
if exist "src\app\pengeluaran\page.tsx" (
    echo File exists - SIZE: 
    for %%A in ("src\app\pengeluaran\page.tsx") do echo %%~zA bytes
) else (
    echo File does not exist!
)

echo.
echo --- File: src\app\api\pengeluaran\route.ts ---
if exist "src\app\api\pengeluaran\route.ts" (
    echo File exists - SIZE:
    for %%A in ("src\app\api\pengeluaran\route.ts") do echo %%~zA bytes
) else (
    echo File does not exist!
)
