@echo off
echo Starting Backend Server...
echo Server will run on http://localhost:3000
echo.
cd /d %~dp0..
node server/src/index.js
pause
