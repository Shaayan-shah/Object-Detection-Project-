@echo off
title ObjectVision - Launcher
color 07

echo ======================================================================
echo           OBJECTVISION - OBJECT DETECTION & CUSTOM MODEL SUITE
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python Dependencies...
pip install -r backend\requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies. Please check your Python installation.
    pause
    exit /b %errorlevel%
)

echo [2/3] Checking Frontend Dependencies...
cd frontend
if not exist node_modules (
    echo Installing npm packages...
    call npm install
)
cd ..

echo [3/3] Launching Backend and Frontend Servers...
start "ObjectVision - Backend (FastAPI + YOLO)" cmd /k "cd backend && python run.py"
start "ObjectVision - Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Opening Web App at: http://localhost:5173
start http://localhost:5173

echo.
echo ======================================================================
echo   ObjectVision is running!
echo   - Backend API: http://localhost:8000
echo   - Web Dashboard: http://localhost:5173
echo ======================================================================
pause
