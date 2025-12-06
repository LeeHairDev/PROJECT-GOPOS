@echo off
REM GoPOS Quick Start Script - Windows

echo.
echo 🚀 GoPOS - Quick Start
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js is installed: %NODE_VERSION%

REM Backend Setup
echo.
echo 📦 Setting up Backend...
cd Backend
call npm install
echo ✅ Backend dependencies installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/gopos
        echo JWT_SECRET=your_secret_key_here_change_in_production
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created. Please update MONGODB_URI if needed.
)

cd ..

REM Frontend Setup
echo.
echo 🎨 Setting up Frontend...
cd Frontend
call npm install
echo ✅ Frontend dependencies installed

cd ..

REM Success message
echo.
echo ======================================
echo ✅ Setup Complete!
echo ======================================
echo.
echo 📝 Next Steps:
echo 1. Make sure MongoDB is running
echo 2. Open two terminals (Command Prompt or PowerShell)
echo.
echo Terminal 1 - Backend:
echo   cd Backend
echo   npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd Frontend
echo   npm run dev
echo.
echo 🌐 Access the app at http://localhost:5173
echo.
echo 👤 Default Login:
echo   1. Create account via Register
echo   2. Or create admin via MongoDB
echo.
echo 📚 Documentation:
echo   - README.md - Full documentation
echo   - API_TESTING.md - API testing guide
echo   - DEVELOPMENT.md - Development guide
echo   - FEATURES_SUMMARY.md - Features list
echo.
pause
