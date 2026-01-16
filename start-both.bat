@echo off
echo ========================================
echo Starting The Compagnon
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Starting servers in separate windows...
echo Press Ctrl+C in each window to stop
echo.

start "Compagnon Backend" cmd /k "cd /d %~dp0 && node server/src/index.js"
timeout /t 3 /nobreak >nul
start "Compagnon Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Both servers are starting...
echo Check the new windows for server output
echo.
echo Close this window when done
pause
