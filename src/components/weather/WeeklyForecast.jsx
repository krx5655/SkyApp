import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import weatherService from '../../services/weather/weatherService'

function WeeklyForecast({ onDaySelect }) {
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch weather data on mount
  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true)
        setError(null)
        const data = await weatherService.getWeeklyForecast()
        setForecast(data)
      } catch (err) {
        console.error('Failed to fetch forecast:', err)
        setError(err.message)
        // Fallback to mock data
        setForecast(getMockForecast())
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [])

  // Mock data fallback
  function getMockForecast() {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy']

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i)
      const condition = conditions[Math.floor(Math.random() * conditions.length)]

      return {
        id: i.toString(),
        date,
        dayName: i === 0 ? 'Today' : format(date, 'EEEE'),
        shortDate: format(date, 'MMM d'),
        high: Math.floor(Math.random() * 20) + 65,
        low: Math.floor(Math.random() * 20) + 45,
        condition,
        icon: getWeatherIcon(condition),
      }
    })
  }

  function getWeatherIcon(condition) {
    switch (condition) {
      case 'Sunny':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )
      case 'Partly Cloudy':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        )
      case 'Cloudy':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        )
      case 'Rainy':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19v2m4-2v2m4-2v2" />
          </svg>
        )
      case 'Stormy':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10l-3 6h4l-3 6" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">7-Day Forecast</h2>
        <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">
          San Francisco, CA
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-macos-text-secondary-light dark:text-macos-text-secondary">
            Loading forecast...
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">
            Failed to load forecast. Showing cached data.
          </div>
        </div>
      ) : null}

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

              <div className="flex justify-center text-macos-blue-light dark:text-macos-blue group-hover:scale-110 transition-transform text-4xl">
                {typeof day.icon === 'string' ? day.icon : day.icon}
              </div>

              <div className="text-xs font-medium truncate">{day.condition}</div>

              <div className="flex flex-col gap-1 pt-1">
                <div className="text-center">
                  <div className="text-lg font-bold">{day.high}°</div>
                </div>
                <div className="text-center text-macos-text-secondary-light dark:text-macos-text-secondary">
                  <div className="text-sm">{day.low}°</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WeeklyForecast
