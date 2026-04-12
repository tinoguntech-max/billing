@echo off
:: Start PM2 dengan ecosystem
call pm2 start E:\nodejs\billing-internet\billing-express\ecosystem.config.js
call pm2 save

:: Start Cloudflare Tunnel (background)
start "" /B cloudflared tunnel --config E:\nodejs\billing-internet\billing-express\cloudflare-tunnel\config.yml run billing-tamnet

exit
