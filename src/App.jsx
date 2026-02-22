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

  // Pointer-driven scroll: the touchscreen emits pointer/mouse events, not touch
  // events, so we drive scrollTop manually from pointer deltas. This also works
  // for regular mouse drag in the browser. Text selection is suppressed while a
  // vertical drag is in progress.
  useEffect(() => {
    let startY = 0
    let startX = 0
    let prevY = 0
    let scrollTarget = null
    let directionLocked = null // 'vertical' | 'horizontal' | null
    let isScrollDragging = false

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

    const onPointerDown = (e) => {
      if (e.button !== 0) return
      const target = findScrollable(e.target)
      if (!target) return

      // Skip clicks inside the scrollbar gutter (rightmost 15px of the container)
      const rect = target.getBoundingClientRect()
      if (e.clientX > rect.right - 15) return

      startY = prevY = e.clientY
      startX = e.clientX
      scrollTarget = target
      directionLocked = null
      isScrollDragging = false
    }

    const onPointerMove = (e) => {
      if (!scrollTarget) return

      // Lock direction on the first significant movement (4px threshold)
      if (directionLocked === null) {
        const dy = Math.abs(startY - e.clientY)
        const dx = Math.abs(startX - e.clientX)
        if (dy < 4 && dx < 4) return
        directionLocked = dy >= dx ? 'vertical' : 'horizontal'
      }

      if (directionLocked !== 'vertical') return

      // Suppress text selection the moment we commit to a vertical scroll drag
      if (!isScrollDragging) {
        isScrollDragging = true
        document.documentElement.style.userSelect = 'none'
      }

      scrollTarget.scrollTop += prevY - e.clientY
      prevY = e.clientY
    }

    const onPointerUp = () => {
      if (isScrollDragging) {
        document.documentElement.style.userSelect = ''
      }
      scrollTarget = null
      directionLocked = null
      isScrollDragging = false
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerUp)
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
