#!/bin/bash
# Script deploy otomatis dari GitHub
# Jalankan di server: bash deploy.sh

set -e

APP_DIR="/var/www/billing-internet/billing-express"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "🚀 Starting deployment..."

# 1. Pull latest code dari GitHub
echo "📥 Pulling latest code..."
cd $APP_DIR
git pull origin main

# 2. Install/update backend dependencies
echo "📦 Updating backend dependencies..."
cd $BACKEND_DIR
npm install --production

# 3. Build frontend
echo "🔨 Building frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# 4. Restart backend
echo "🔄 Restarting backend..."
pm2 restart billing-tamnet --update-env

echo ""
echo "✅ Deployment complete!"
echo "🌐 App running at: http://$(curl -s ifconfig.me):5000"
pm2 status
