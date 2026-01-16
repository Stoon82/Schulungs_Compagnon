# Quick Start Guide - The Compagnon

## ✅ Installation Complete!

All dependencies are installed and the project is ready to run.

## 🚀 Starting the Application

### Option 1: Start Both Servers (Recommended)

Open **two separate Command Prompt (CMD)** windows:

**Window 1 - Backend Server:**
```cmd
cd c:\Users\Acer\CascadeProjects\Compagnon
scripts\start-backend.bat
```

**Window 2 - Frontend Client:**
```cmd
cd c:\Users\Acer\CascadeProjects\Compagnon
scripts\start-frontend.bat
```

### Option 2: Manual Start

**Backend:**
```cmd
cd c:\Users\Acer\CascadeProjects\Compagnon
node server/src/index.js
```

**Frontend:**
```cmd
cd c:\Users\Acer\CascadeProjects\Compagnon\client
npm run dev
```

## 🌐 Access the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## ✅ What's Working

- ✅ Backend server with Express + Socket.io
- ✅ Frontend React app with Vite + Tailwind CSS
- ✅ SQLite database initialized
- ✅ WebSocket real-time communication
- ✅ All dependencies installed (786 total packages)

## 🎯 Test the Connection

Open http://localhost:5173 in your browser. You should see:
- "The Compagnon" title
- Connection status indicator (should show green "Verbunden")
- "Test Ping senden" button to test WebSocket communication

## 📋 Next Steps

Now that the infrastructure is running, you can start implementing:
1. Authentication system (POST /api/join)
2. Module management system
3. Real-time mood tracking
4. Ollama AI integration
5. Sandbox code playground
6. Admin dashboard

## 🔧 Troubleshooting

**If backend won't start:**
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`

**If frontend won't start:**
- Check if port 5173 is already in use
- Verify npm is working: `npm --version`

**If WebSocket won't connect:**
- Ensure backend is running first
- Check browser console for errors
- Verify CORS settings in `.env`

## 📝 Configuration

Edit `.env` file to configure:
- Port numbers
- Ollama connection (already installed on your system)
- Database path
- Admin credentials

## 🎉 You're Ready!

The foundation is complete. Start building the features from the checklist!
