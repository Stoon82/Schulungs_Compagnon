@echo off
echo ========================================
echo Starting The Compagnon Development Server
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

start "Compagnon Backend" cmd /k "cd /d %~dp0.. && node server/src/index.js"
timeout /t 3 /nobreak >nul
start "Compagnon Frontend" cmd /k "cd /d %~dp0..\client && npm run dev"

echo.
echo Servers starting in separate windows...
echo.
pause
