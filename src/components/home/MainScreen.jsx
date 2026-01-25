import { useState, useEffect } from 'react'
import Header from '../common/Header'
import weatherService from '../../services/weather/weatherService'
import { getTemperatureUnit } from '../../services/weather/config'
import { convertTemperature, getTemperatureSymbol } from '../../services/weather/unitConversion'

function MainScreen({ onNavigate, onOpenSettings, refreshTrigger }) {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tempUnit, setTempUnit] = useState('F')

  // Fetch current weather on mount and when location changes
  useEffect(() => {
    async function fetchCurrentWeather() {
      try {
        setLoading(true)

        // Load temperature unit preference
        const unit = getTemperatureUnit()
        setTempUnit(unit)

        const weather = await weatherService.getCurrentWeather()
        setCurrentWeather(weather)
      } catch (error) {
        console.error('Failed to fetch current weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentWeather()
  }, [refreshTrigger])

  const apps = [
    {
      id: 'weather',
      name: 'Weather',
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 'sky',
      name: 'Sky',
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
      gradient: 'from-purple-400 to-indigo-600',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSettings={onOpenSettings} />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* App Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Weather & Sky
        </h1>
        <p className="text-macos-text-secondary-light dark:text-macos-text-secondary mb-12 text-center">
          Your personal weather and astronomy companion
        </p>

        {/* App Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onNavigate(app.id)}
              className="group relative touch-target"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 aspect-square flex flex-col items-center justify-center p-8 bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                {/* Icon */}
                <div className={`relative z-10 text-macos-text-light dark:text-macos-text mb-4 group-hover:scale-110 transition-transform`}>
                  {app.icon}
                </div>

                {/* Label */}
                <span className="relative z-10 text-2xl font-semibold">
                  {app.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Weather Summary Widget */}
        <div className="mt-12 p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border max-w-md w-full">
          {loading ? (
            <div className="text-center text-macos-text-secondary-light dark:text-macos-text-secondary">
              Loading weather...
            </div>
          ) : currentWeather ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">Current Weather</p>
                <p className="text-3xl font-bold">{convertTemperature(currentWeather.temp, tempUnit)}{getTemperatureSymbol(tempUnit)}</p>
                <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">{currentWeather.condition}</p>
              </div>
              <div className="text-5xl">
                {currentWeather.icon}
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 text-sm">
              Unable to load current weather
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MainScreen
