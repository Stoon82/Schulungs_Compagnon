@echo off
echo ========================================
echo Installing Client Dependencies
echo ========================================
echo.

cd client

echo Installing React and dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Client Installation Complete!
echo ========================================
echo.
echo You can now run: npm run dev
echo.
pause
