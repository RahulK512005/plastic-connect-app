@echo off
title Plastic Connect - Backend & Frontend

echo.
echo ===================================
echo   🚀 PLASTIC CONNECT STARTUP
echo ===================================
echo.

echo 📦 Starting Backend (port 5000)...
cd /d "%~dp0backend"
start "Plastic Connect - Backend" cmd /k npm start
timeout /t 3

echo ⚛️  Starting Frontend (port 3000)...
cd /d "%~dp0frontend"
start "Plastic Connect - Frontend" cmd /k npm start

echo.
echo ✅ Plastic Connect Started!
echo.
echo 📱 Frontend:  http://localhost:3000
echo 🔌 Backend:   http://localhost:5000
echo.
echo 🔐 Login with:
echo    Role: Select "Collector" or "Brand"
echo.
pause
