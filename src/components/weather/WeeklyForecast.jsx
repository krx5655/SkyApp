import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import clearDaySvg from '@bybas/weather-icons/production/fill/all/clear-day.svg'
import clearNightSvg from '@bybas/weather-icons/production/fill/all/clear-night.svg'
import partlyCloudyDaySvg from '@bybas/weather-icons/production/fill/all/partly-cloudy-day.svg'
import cloudySvg from '@bybas/weather-icons/production/fill/all/cloudy.svg'
import rainSvg from '@bybas/weather-icons/production/fill/all/rain.svg'
import thunderstormsRainSvg from '@bybas/weather-icons/production/fill/all/thunderstorms-rain.svg'
import snowSvg from '@bybas/weather-icons/production/fill/all/snow.svg'
import fogSvg from '@bybas/weather-icons/production/fill/all/fog.svg'
import weatherService from '../../services/weather/weatherService'
import { getTemperatureUnit } from '../../services/weather/config'
import { convertTemperature, getTemperatureSymbol } from '../../services/weather/unitConversion'

function WeeklyForecast({ onDaySelect, onForecastLoaded, refreshTrigger }) {
  const [forecast, setForecast] = useState([])
  const [currentWeather, setCurrentWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tempUnit, setTempUnit] = useState('F')
  const [cityName, setCityName] = useState('Unknown Location')

  // Fetch weather data on mount and when location changes
  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true)
        setError(null)

        // Load temperature unit preference
        const unit = getTemperatureUnit()
        setTempUnit(unit)

        // Load city name from stored location
        const location = weatherService.getLocation()
        setCityName(location?.name || 'Unknown Location')

        const [forecastData, current] = await Promise.all([
          weatherService.getWeeklyForecast(),
          weatherService.getCurrentWeather().catch(() => null), // Don't fail if current weather fails
        ])
        setForecast(forecastData)
        setCurrentWeather(current)

        // Notify parent component of forecast data
        if (onForecastLoaded) {
          onForecastLoaded(forecastData)
        }
      } catch (err) {
        console.error('Failed to fetch forecast:', err)
        setError(err.message)
        // Don't set forecast - leave it empty to show error state
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()

    // Auto-refresh every 15 minutes to keep weather data current
    const interval = setInterval(fetchForecast, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshTrigger]) // onForecastLoaded intentionally omitted to prevent infinite loop

  function getWeatherIcon(emoji) {
    const iconMap = {
      '☀️': clearDaySvg,
      '🌙': clearNightSvg,
      '⛅': partlyCloudyDaySvg,
      '☁️': cloudySvg,
      '🌧️': rainSvg,
      '⛈️': thunderstormsRainSvg,
      '❄️': snowSvg,
      '🌫️': fogSvg,
    }
    const src = iconMap[emoji]
    return src
      ? <img src={src} width={52} height={52} alt={emoji} />
      : <span className="text-4xl">{emoji}</span>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="relative">
        {/* Location and current temp stacked in upper left */}
        <div className="absolute left-0 top-0 text-left">
          <p className="text-xl font-semibold text-macos-text-secondary-light dark:text-macos-text-secondary">
            {cityName}
          </p>
          {currentWeather && (
            <div className="text-3xl font-bold">{convertTemperature(currentWeather.temp, tempUnit)}{getTemperatureSymbol(tempUnit)}</div>
          )}
        </div>

        {/* Spacer to maintain layout */}
        <div className="h-16"></div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-macos-text-secondary-light dark:text-macos-text-secondary">
            Loading forecast...
          </div>
        </div>
      ) : error && forecast.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load forecast</div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
              {error}
            </div>
          </div>
        </div>
      ) : null}

      {forecast.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
          {forecast.map((day) => (
            <button
              key={day.id}
              onClick={() => onDaySelect(day)}
              className="touch-target flex-shrink-0 w-32 p-4 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border hover:border-macos-blue-light dark:hover:border-macos-blue transition-all hover:shadow-lg group"
            >
              <div className="text-center space-y-2">
                <div className="font-semibold text-sm">{day.dayName}</div>
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                  {day.shortDate}
                </div>

                <div className="flex justify-center text-macos-blue-light dark:text-macos-blue group-hover:scale-110 transition-transform">
                  {getWeatherIcon(day.icon)}
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{convertTemperature(day.high, tempUnit)}{getTemperatureSymbol(tempUnit)}</div>
                  </div>
                  <div className="text-center text-macos-text-secondary-light dark:text-macos-text-secondary">
                    <div className="text-sm">{convertTemperature(day.low, tempUnit)}{getTemperatureSymbol(tempUnit)}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default WeeklyForecast
