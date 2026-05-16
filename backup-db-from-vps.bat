@echo off
echo ========================================
echo   BACKUP DATABASE DARI VPS KE PC
echo ========================================

set VPS_USER=root
set VPS_HOST=103.253.212.26
set DB_NAME=billing_internet
set BACKUP_DIR=E:\nodejs\billing-internet\backups

:: Buat folder backup kalau belum ada
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Nama file dengan timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set TANGGAL=%%d-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set JAM=%%a%%b
set FILENAME=backup_%TANGGAL%_%JAM%.sql

echo [1/2] Export database di VPS...
ssh %VPS_USER%@%VPS_HOST% "mysqldump -u root %DB_NAME% --add-drop-table > /root/%FILENAME%"

echo [2/2] Download ke PC...
scp %VPS_USER%@%VPS_HOST%:/root/%FILENAME% "%BACKUP_DIR%\%FILENAME%"

if %errorlevel% equ 0 (
  echo.
  echo Backup berhasil disimpan di:
  echo %BACKUP_DIR%\%FILENAME%
) else (
  echo ERROR: Gagal download backup!
)

pause
