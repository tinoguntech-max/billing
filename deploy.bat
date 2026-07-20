@echo off
echo ========================================
echo   DEPLOY KE VPS billing.tamanet.site
echo ========================================

set VPS_USER=root
set VPS_HOST=103.253.212.26
set VPS_PATH=/root/billing-internet

echo.
echo [1/4] Upload file ke VPS via rsync/scp...
echo        (menggunakan git push + pull di VPS)

ssh %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && git pull origin main"

echo.
echo [2/4] Install dependencies backend...
ssh %VPS_USER%@%VPS_HOST% "cd %VPS_PATH%/billing-express/backend && npm install --production"

echo.
echo [3/4] Build Next.js frontend...
ssh %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && npm install && npm run build"

echo.
echo [4/4] Restart PM2...
ssh %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && pm2 reload ecosystem.config.js --update-env && pm2 save"

echo.
echo ========================================
echo   DEPLOY SELESAI!
echo   Cek: https://billing.tamanet.site
echo ========================================
pause
