@echo off
echo ========================================
echo The Compagnon - Starting Development Server
echo ========================================
echo.

echo Checking if .env exists...
if not exist .env (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

echo Starting development server...
echo Server will run on http://localhost:3000
echo Client will run on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
