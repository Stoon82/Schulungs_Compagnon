import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import api from './services/api'
import JoinScreen from './components/JoinScreen'
import ModuleList from './components/ModuleList'
import MoodBarometer from './components/MoodBarometer'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

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

    newSocket.on('module:unlock', (data) => {
      console.log('Module unlocked:', data)
      loadModules()
    })

    newSocket.on('participant:joined', (data) => {
      console.log('Participant joined:', data)
    })

    setSocket(newSocket)

    checkExistingSession()

    return () => newSocket.close()
  }, [])

  const checkExistingSession = async () => {
    const sessionToken = localStorage.getItem('sessionToken')
    
    if (sessionToken) {
      try {
        const result = await api.getSession()
        
        if (result.success) {
          setParticipant(result.data)
          await loadModules()
        }
      } catch (error) {
        console.error('Session recovery failed:', error)
      }
    }
    
    setLoading(false)
  }

  const loadModules = async () => {
    try {
      const result = await api.getModules()
      
      if (result.success) {
        setModules(result.data)
      }
    } catch (error) {
      console.error('Failed to load modules:', error)
    }
  }

  const handleJoin = async (data) => {
    setParticipant(data)
    await loadModules()
  }

  const handleModuleClick = (module) => {
    console.log('Module clicked:', module)
  }

  const handleMoodSelect = async (mood, moduleId) => {
    try {
      const result = await api.sendMood(mood, moduleId)
      
      if (result.success) {
        console.log('Mood recorded:', mood)
      }
    } catch (error) {
      console.error('Failed to record mood:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade...</div>
      </div>
    )
  }

  if (!participant) {
    return <JoinScreen onJoin={handleJoin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                The Compagnon
              </h1>
              <p className="text-gray-300 mt-1">
                Willkommen, {participant.nickname || 'Entdecker:in'}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {connected ? 'Verbunden' : 'Nicht verbunden'}
            </div>
          </div>
        </header>

        <main>
          <div className="mb-8">
            <MoodBarometer onMoodSelect={handleMoodSelect} currentModuleId={null} />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Deine Reise</h2>
            <p className="text-gray-400">
              Folge den Modulen und entdecke die Welt der KI
            </p>
          </div>

          <ModuleList modules={modules} onModuleClick={handleModuleClick} />
        </main>
      </div>
    </div>
  )
}

export default App
