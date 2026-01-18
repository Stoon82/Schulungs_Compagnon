# Setup Notes - The Compagnon

## System Information

- **Ollama:** ✅ Already installed on system (no need to reinstall)
- **Terminal:** Using CMD instead of PowerShell to avoid execution policy issues

## Installation Commands (Run in CMD)

### 1. Install Backend Dependencies
```cmd
cd c:\Users\Acer\CascadeProjects\Compagnon
npm install
```

### 2. Initialize Database
```cmd
npm run db:init
```

### 3. Set up Environment Variables
```cmd
copy .env.example .env
```
Then edit `.env` file with your configuration.

### 4. Initialize React Client
```cmd
cd client
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5. Install Additional Frontend Dependencies
```cmd
cd client
npm install socket.io-client react-router-dom chart.js react-chartjs-2 @monaco-editor/react lucide-react
```

### 6. Start Development Server
```cmd
cd ..
npm run dev
```

## Ollama Configuration

Since Ollama is already installed:
1. Ensure Ollama service is running
2. Default URL: `http://localhost:11434`
3. Model to use: `gemma2:4b` (or `gemma:2b` as fallback)
4. Test connection: `curl http://localhost:11434/api/tags`

## Next Steps After Installation

1. ✅ Dependencies installed
2. ✅ Database initialized
3. ✅ Environment configured
4. ✅ Client set up
5. Start implementing core features:
   - Authentication endpoints
   - Module system
   - Socket.io events
   - Ollama integration
   - Sandbox system

## Troubleshooting

### If npm commands fail in PowerShell:
- Use CMD instead: `cmd.exe`
- Or enable scripts: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### If Ollama connection fails:
- Check if Ollama is running: `ollama list`
- Start Ollama service if needed
- Verify port 11434 is accessible

### If database init fails:
- Check write permissions in database folder
- Ensure sqlite3 is properly installed
- Run manually: `node database/init.js`
