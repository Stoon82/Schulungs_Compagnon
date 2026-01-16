@echo off
echo Starting Frontend Client...
echo Client will run on http://localhost:5173
echo.
cd /d %~dp0..\client
npm run dev
pause
