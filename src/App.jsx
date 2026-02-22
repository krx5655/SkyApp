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
  const [locationRefreshTrigger, setLocationRefreshTrigger] = useState(0)

  // Show scrollbar while scrolling, then fade it out 500ms after scrolling stops
  useEffect(() => {
    const scrollTimers = new Map()

    const handleScroll = (e) => {
      const el = e.target
      if (!(el instanceof Element)) return

      el.classList.add('is-scrolling')

      if (scrollTimers.has(el)) {
        clearTimeout(scrollTimers.get(el))
      }

      scrollTimers.set(el, setTimeout(() => {
        el.classList.remove('is-scrolling')
        scrollTimers.delete(el)
      }, 500))
    }

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      scrollTimers.forEach(timer => clearTimeout(timer))
    }
  }, [])

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

  const handleLocationChange = () => {
    // Trigger refresh by updating timestamp
    setLocationRefreshTrigger(Date.now())
  }

  return (
    <div className="min-h-screen bg-macos-bg-light dark:bg-macos-bg text-macos-text-light dark:text-macos-text transition-colors duration-300">
      {currentApp === 'home' && (
        <MainScreen
          onNavigate={navigateToApp}
          onOpenSettings={() => setShowSettings(true)}
          refreshTrigger={locationRefreshTrigger}
        />
      )}
      {currentApp === 'weather' && (
        <WeatherApp
          onNavigateHome={navigateHome}
          onOpenSettings={() => setShowSettings(true)}
          refreshTrigger={locationRefreshTrigger}
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
          onLocationChange={handleLocationChange}
        />
      )}
    </div>
  )
}

export default App
