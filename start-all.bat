@echo off
echo.
echo ====================================
echo AI Question Answering System Startup
echo ====================================
echo.

REM Check if backend/.env exists
if not exist "backend\.env" (
    echo ❌ ERROR: backend/.env not found!
    echo.
    echo Please run setup first:
    echo 1. cd backend
    echo 2. cp .env.example .env
    echo 3. Edit .env and add your ANTHROPIC_API_KEY
    echo 4. cd ..
    pause
    exit /b 1
)

echo Starting Backend Server...
start cmd /k "cd backend && npm install && npm run dev"
timeout /t 3 /nobreak

echo.
echo Starting Frontend Development Server...
start cmd /k "npm install && npm run dev"

echo.
echo ====================================
echo ✅ Both servers are starting!
echo ====================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5000
echo.
echo Press any key to close this window...
pause
