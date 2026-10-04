@echo off
title Pet Adoption and Management System - BCA Project Launcher
color 0A
echo ========================================================
echo    PET ADOPTION AND MANAGEMENT SYSTEM - BCA PROJECT
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "Backend Server (Port 5000)" /min cmd /c "cd backend && node src/server.js"

echo [2/3] Starting Frontend Dev Server (Port 5173)...
start "Frontend Dev Server (Port 5173)" /min cmd /c "cd frontend && node dev-server.cjs"

echo.
echo Waiting 2 seconds for servers to initialize...
timeout /t 2 /nobreak >nul

echo [3/3] Opening Pet Adoption System in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo SYSTEM READY!
echo - Web Application URL: http://localhost:5173
echo - Backend API Server:  http://localhost:5000
echo - Demo Credentials:
echo     * Admin:      admin / Admin@123
echo     * Doctor:     dr.sharma / Staff@123
echo     * Adopter:    anita.adopter / User@123
echo ========================================================
echo.
echo Keep this window open. Press any key to stop all servers and exit...
pause >nul

echo Stopping servers...
taskkill /f /im node.exe >nul 2>&1
echo Done.
