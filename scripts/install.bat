@echo off
echo ========================================
echo The Compagnon - Installation Script
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Initializing database...
call npm run db:init
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

echo.
echo [3/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please configure it before running the server
) else (
    echo .env file already exists
)

echo.
echo [4/5] Setting up client directory...
cd client
if not exist package.json (
    echo Initializing React client with Vite...
    call npm create vite@latest . -- --template react
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize React client
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo [5/5] Installing client dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)

echo Installing additional frontend packages...
call npm install socket.io-client react-router-dom chart.js react-chartjs-2 @monaco-editor/react lucide-react
call npm install -D tailwindcss postcss autoprefixer

echo Initializing Tailwind CSS...
call npx tailwindcss init -p

cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure .env file with your settings
echo 2. Ensure Ollama is running (already installed)
echo 3. Run: npm run dev
echo.
pause
