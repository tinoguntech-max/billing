@echo off
echo ========================================
echo   PUSH KE GITHUB
echo ========================================

git add .
git status

set /p msg="Pesan commit (Enter untuk default): "
if "%msg%"=="" set msg=Update aplikasi

git commit -m "%msg%"
git push origin main

if %errorlevel% equ 0 (
  echo.
  echo ✅ Berhasil push ke GitHub!
  echo.
  echo Sekarang jalankan di VPS:
  echo   cd /path/to/project
  echo   git pull origin main
  echo   npm install
  echo   npm run build
  echo   pm2 restart all
) else (
  echo ❌ Gagal push. Cek error di atas.
)

pause
