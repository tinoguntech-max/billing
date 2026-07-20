@echo off
echo =======================================================
echo   DEPLOYMENT KE VPS LOKAL (10.10.102.45) - VERSI 2
echo =======================================================

set VPS_IP=10.10.102.45
set VPS_USER=root
set ZIP_FILE=billing-vps-deploy.zip
set REMOTE_DIR=/var/www/billing-internet-v2

echo.
echo [1/4] Membuat ZIP dari Source Code (tanpa node_modules)...
powershell -Command "Compress-Archive -Force -Path src, public, scripts, billing-express, ecosystem-v2.config.js, package.json, tailwind.config.js, next.config.js, postcss.config.js, tsconfig.json, next-env.d.ts, .env.vps -DestinationPath %ZIP_FILE%"
if %ERRORLEVEL% neq 0 (
    echo Gagal membuat file ZIP!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Mengirim ZIP ke VPS %VPS_IP%...
echo (Anda mungkin akan diminta memasukkan password VPS Anda)
scp %ZIP_FILE% %VPS_USER%@%VPS_IP%:%REMOTE_DIR%.zip

echo.
echo [3/4] Eksekusi Setup di VPS...
echo (Anda mungkin akan diminta memasukkan password VPS Anda lagi)
ssh %VPS_USER%@%VPS_IP% "apt-get install -y unzip && rm -rf %REMOTE_DIR% && mkdir -p %REMOTE_DIR% && unzip -o %REMOTE_DIR%.zip -d %REMOTE_DIR% && cd %REMOTE_DIR% && cp .env.vps .env.local && cp billing-express/backend/.env.vps billing-express/backend/.env && npm install && npm run build && cd billing-express/backend && npm install && cd ../.. && pm2 start ecosystem-v2.config.js"

echo.
echo [4/4] Selesai!
echo Silakan cek apakah aplikasi sudah berjalan di http://%VPS_IP%:3005
pause
