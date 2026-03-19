@echo off
setlocal enabledelayedexpansion

REM Create directories
mkdir "e:\nodejs\billing-internet\src\app\pengeluaran" 2>nul
mkdir "e:\nodejs\billing-internet\src\app\api\pengeluaran" 2>nul

echo Directories created!
echo.
echo Directory listing:
dir "e:\nodejs\billing-internet\src\app\pengeluaran"
dir "e:\nodejs\billing-internet\src\app\api\pengeluaran"
