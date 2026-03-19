#!/bin/bash

echo "🚀 Building TamNet Billing System..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install --production

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed!"
else
    echo "❌ Backend installation failed!"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file in backend/"
echo "2. Initialize database: node backend/scripts/init-db.js"
echo "3. Start server: cd backend && npm start"
echo "4. Or use PM2: pm2 start backend/server.js --name billing-tamnet"
