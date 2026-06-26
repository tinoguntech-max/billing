@echo off
echo ========================================
echo   BUAT ZIP UNTUK DEPLOY DOMAINESIA
echo ========================================

set ZIP_FILE=billing-tamnet-deploy.zip

echo [1/3] Build frontend Vite...
cd billing-express\frontend
call npm run build
cd ..\..

echo [2/3] Membuat ZIP...
powershell -Command "Compress-Archive -Force -Path @('billing-express\backend\src', 'billing-express\backend\server.js', 'billing-express\backend\package.json', 'billing-express\backend\.env.example', 'billing-express\frontend\dist') -DestinationPath '%ZIP_FILE%'"

echo [3/3] Selesai!
echo File ZIP: %ZIP_FILE%
echo.
echo Isi ZIP:
echo  - server.js (entry point)
echo  - src/ (routes, services, middleware)
echo  - package.json
echo  - .env.example (rename ke .env di hosting)
echo  - dist/ (frontend Vite sudah di-build)

pause
