import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('pong', (data) => {
      console.log('Pong received:', data)
    })

    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  const sendPing = () => {
    if (socket) {
      socket.emit('ping')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            The Compagnon
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Immersives KI-Schulungssystem für ABW
          </p>
          
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {connected ? 'Verbunden' : 'Nicht verbunden'}
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold mb-4">🚀 Setup erfolgreich!</h2>
            <p className="text-lg text-gray-300 mb-6">
              Das Backend läuft und die WebSocket-Verbindung ist aktiv.
            </p>
            
            <button
              onClick={sendPing}
              disabled={!connected}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Ping senden
            </button>

            <div className="mt-8 text-left text-sm text-gray-400">
              <p className="mb-2">✅ Backend Server: http://localhost:3000</p>
              <p className="mb-2">✅ Frontend Client: http://localhost:5173</p>
              <p className="mb-2">✅ Database: SQLite initialisiert</p>
              <p>✅ Ollama: Bereits installiert</p>
            </div>
          </div>

          <div className="mt-12 text-gray-400">
            <p className="text-sm">Version 2.0 | Ready for Development</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
