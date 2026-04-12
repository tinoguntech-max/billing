@echo off
echo ========================================
echo   SYNC DATABASE KE VPS
echo ========================================

set MYSQLDUMP=C:\xampp\mysql\bin\mysqldump.exe
set DB_NAME=billing_internet
set DB_USER=root
set DB_PASS=
set VPS_USER=root
set VPS_HOST=103.253.212.26
set VPS_DB_USER=root
set BACKUP_FILE=billing_backup.sql

echo [1/3] Export database lokal...
%MYSQLDUMP% -u %DB_USER% --add-drop-table --add-drop-trigger --single-transaction %DB_NAME% > %BACKUP_FILE%

if %errorlevel% neq 0 (
  echo ERROR: Gagal export database!
  pause
  exit /b 1
)
echo OK - Export selesai: %BACKUP_FILE%

echo [2/3] Upload ke VPS...
scp %BACKUP_FILE% %VPS_USER%@%VPS_HOST%:/root/%BACKUP_FILE%

if %errorlevel% neq 0 (
  echo ERROR: Gagal upload ke VPS!
  pause
  exit /b 1
)
echo OK - Upload selesai

echo [3/3] Import di VPS...
ssh %VPS_USER%@%VPS_HOST% "mysql -u %VPS_DB_USER% %DB_NAME% < /root/%BACKUP_FILE% && echo Import berhasil!"

echo.
echo Selesai! Database VPS sudah disync.
pause
