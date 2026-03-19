@echo off
echo 🚀 Building TamNet Billing System...

REM Build frontend
echo 📦 Building frontend...
cd frontend
call npm install
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo ✅ Frontend build successful!

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd ..\backend
call npm install --production

if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    exit /b 1
)

echo ✅ Backend dependencies installed!
echo.
echo ✅ Build complete!
echo.
echo Next steps:
echo 1. Configure .env file in backend\
echo 2. Initialize database: node backend\scripts\init-db.js
echo 3. Start server: cd backend ^&^& npm start
echo 4. Or use PM2: pm2 start backend\server.js --name billing-tamnet

cd ..
