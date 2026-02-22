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

  // Touch-to-scroll: Electron doesn't translate touch drags into scroll gestures
  // automatically, so we drive scrollTop directly from touch deltas.
  useEffect(() => {
    let startY = 0
    let startX = 0
    let prevY = 0
    let scrollTarget = null
    let directionLocked = null // 'vertical' | 'horizontal' | null

    const findScrollable = (el) => {
      while (el && el !== document.documentElement) {
        const { overflowY } = window.getComputedStyle(el)
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return el
        }
        el = el.parentElement
      }
      return null
    }

    const onTouchStart = (e) => {
      startY = prevY = e.touches[0].clientY
      startX = e.touches[0].clientX
      scrollTarget = findScrollable(e.target)
      directionLocked = null
    }

    const onTouchMove = (e) => {
      if (!scrollTarget) return
      const touch = e.touches[0]

      // Lock scroll direction on the first significant movement
      if (directionLocked === null) {
        const dy = Math.abs(startY - touch.clientY)
        const dx = Math.abs(startX - touch.clientX)
        if (dy < 4 && dx < 4) return
        directionLocked = dy >= dx ? 'vertical' : 'horizontal'
      }

      if (directionLocked !== 'vertical') return

      scrollTarget.scrollTop += prevY - touch.clientY
      prevY = touch.clientY
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

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
