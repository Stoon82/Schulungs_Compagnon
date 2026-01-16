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
timeout /t 2 /nobreak >nul
start "Ngrok Tunnel" cmd /k "ngrok http 5173 --log=stdout"

echo.
echo All services are starting...
echo - Backend: Check backend window
echo - Frontend: Check frontend window  
echo - Ngrok Tunnel: Check ngrok window for public URL
echo.
echo The ngrok tunnel URL will be automatically detected
echo Close this window when done
pause
