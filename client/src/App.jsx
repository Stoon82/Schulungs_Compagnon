import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Languages } from 'lucide-react'
import api from './services/api'
import JoinScreen from './components/JoinScreen'
import ModuleList from './components/ModuleList'
import FloatingMoodBar from './components/FloatingMoodBar'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import AdminProjectorView from './components/AdminProjectorView'
import QRCodeButton from './components/QRCodeButton'
import MainApp from './components/MainApp'
import { useLanguage } from './contexts/LanguageContext'
import AccessibilityControls from './components/AccessibilityControls'
import UpdateNotification from './components/UpdateNotification'
import './App.css'
import './styles/accessibility.css'

function App() {
  // Check if we should use the new session management system
  const useNewSystem = true; // Set to false to use old system
  
  if (useNewSystem) {
    return <MainApp />;
  }
  
  // Old system below (for backwards compatibility)
  const { t, language, toggleLanguage } = useLanguage()
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminMode, setAdminMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showFullDashboard, setShowFullDashboard] = useState(false)

  // Apply theme function
  const applyTheme = (theme) => {
    if (!theme) return
    
    const root = document.documentElement
    root.style.setProperty('--primary-color', theme.primaryColor)
    root.style.setProperty('--secondary-color', theme.secondaryColor)
    root.style.setProperty('--accent-color', theme.accentColor)
    root.style.setProperty('--bg-color', theme.backgroundColor)
    root.style.setProperty('--text-color', theme.textColor)
    
    // Apply background gradient
    if (theme.backgroundGradientStart) {
      root.style.setProperty('--bg-gradient-start', theme.backgroundGradientStart)
    }
    if (theme.backgroundGradientMiddle) {
      root.style.setProperty('--bg-gradient-middle', theme.backgroundGradientMiddle)
    }
    if (theme.backgroundGradientEnd) {
      root.style.setProperty('--bg-gradient-end', theme.backgroundGradientEnd)
    }
    
    if (theme.fontFamily) {
      root.style.fontFamily = theme.fontFamily
    }
    
    if (theme.fontSize) {
      const size = theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px'
      root.style.fontSize = size
    }
    
    // Force re-render by toggling a data attribute
    root.setAttribute('data-theme-updated', Date.now().toString())
  }

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('compagnon_theme')
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        applyTheme(theme)
      } catch (error) {
        console.error('Failed to load saved theme:', error)
      }
    }
  }, [])

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      path: '/socket.io'
    })
    
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

    newSocket.on('design:update', (data) => {
      console.log('Design update received:', data)
      const { theme, scope } = data
      
      // Check if this update applies to current context
      const isAdminContext = window.location.pathname.includes('admin') || adminMode
      const shouldApply = 
        scope === 'all' || 
        (scope === 'admin' && isAdminContext) || 
        (scope === 'client' && !isAdminContext)
      
      if (shouldApply) {
        // Save theme to localStorage
        localStorage.setItem('compagnon_theme', JSON.stringify(theme))
        localStorage.setItem('compagnon_theme_scope', scope)
        
        // Apply theme immediately without reload
        applyTheme(theme)
        
        // Show notification
        console.log('🎨 Design updated and applied!')
      }
    })

    setSocket(newSocket)

    checkExistingSession()

    return () => newSocket.close()
  }, [])

  const checkExistingSession = async () => {
    const sessionToken = localStorage.getItem('sessionToken')
    const adminToken = api.getAdminToken()
    
    if (adminToken) {
      // Validate admin token by trying to fetch stats
      try {
        const statsResult = await api.getAdminStats()
        if (statsResult.success) {
          setIsAdmin(true)
          setAdminMode(true)
        } else {
          // Token invalid, clear it
          api.clearAdminToken()
          console.log('Admin token expired, please login again')
        }
      } catch (error) {
        // Token invalid or server error, clear it
        api.clearAdminToken()
        console.log('Admin session invalid, please login again')
      }
    }
    
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
    
    // Apply saved theme on join
    const savedTheme = localStorage.getItem('compagnon_theme')
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        applyTheme(theme)
      } catch (error) {
        console.error('Failed to apply saved theme on join:', error)
      }
    }
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

  const handleAdminLogin = (data) => {
    setIsAdmin(true)
    setAdminMode(true)
    setShowFullDashboard(false)
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    setAdminMode(false)
    setShowFullDashboard(false)
  }

  const handleBackToProjector = () => {
    setShowFullDashboard(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    setParticipant(null)
    setModules([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('app.loading')}</div>
      </div>
    )
  }

  if (adminMode) {
    if (!isAdmin) {
      return <AdminLogin onLogin={handleAdminLogin} />
    }
    
    // Show full dashboard if requested, otherwise show projector view
    if (showFullDashboard) {
      return <AdminDashboard onLogout={handleAdminLogout} onBackToProjector={handleBackToProjector} />
    }
    
    // Default admin view: Projector mode with admin sidebar
    return (
      <AdminProjectorView
        participant={participant}
        modules={modules}
        onLogout={handleAdminLogout}
        onDashboard={() => setShowFullDashboard(true)}
      />
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
                {t('app.title')}
              </h1>
              <p className="text-gray-300 mt-1">
                {t('app.welcome')}, {participant.nickname || 'Entdecker:in'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <QRCodeButton isAdmin={false} />
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {connected ? t('app.connected') : t('app.disconnected')}
              </div>
              
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
              >
                <Languages size={16} />
                {language.toUpperCase()}
              </button>
              
              <button
                onClick={() => setAdminMode(true)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium"
              >
                {t('app.admin')}
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm font-medium"
              >
                {t('app.logout')}
              </button>
            </div>
          </div>
        </header>

        <main>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{t('app.yourJourney')}</h2>
            <p className="text-gray-400">
              {t('app.journeyDescription')}
            </p>
          </div>

          <ModuleList modules={modules} onModuleClick={handleModuleClick} />
        </main>
      </div>
      
      <FloatingMoodBar onMoodSelect={handleMoodSelect} currentModuleId={null} />
      <AccessibilityControls />
      <UpdateNotification />
    </div>
  )
}

export default App
