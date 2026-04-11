#!/bin/bash
set -e

echo "========================================"
echo "  DEPLOY KE VPS"
echo "========================================"

PROJECT_DIR="/var/www/billing-internet"
BACKEND_DIR="$PROJECT_DIR/billing-express/backend"

cd $PROJECT_DIR

echo "📥 Pull dari GitHub..."
git pull origin main

echo "📦 Install dependencies frontend..."
npm install

echo "🔨 Build frontend..."
npm run build

echo "📦 Install dependencies backend..."
cd $BACKEND_DIR
npm install
cd $PROJECT_DIR

echo "🔄 Restart PM2..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

echo ""
echo "✅ Deploy selesai!"
pm2 status
