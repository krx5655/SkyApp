import { useState, useEffect } from 'react'
import MainScreen from './components/home/MainScreen'
import WeatherApp from './components/weather/WeatherApp'
import SkyApp from './components/sky/SkyApp'
import SettingsModal from './components/common/SettingsModal'

function App() {
  const [currentApp, setCurrentApp] = useState('home') // 'home', 'weather', 'sky'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [showSettings, setShowSettings] = useState(false)

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const navigateToApp = (app) => {
    setCurrentApp(app)
  }

  const navigateHome = () => {
    setCurrentApp('home')
  }

  return (
    <div className="min-h-screen bg-macos-bg-light dark:bg-macos-bg text-macos-text-light dark:text-macos-text transition-colors duration-300">
      {currentApp === 'home' && (
        <MainScreen
          onNavigate={navigateToApp}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      {currentApp === 'weather' && (
        <WeatherApp
          onNavigateHome={navigateHome}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      {currentApp === 'sky' && (
        <SkyApp
          onNavigateHome={navigateHome}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}

export default App
