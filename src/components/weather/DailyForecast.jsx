import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import weatherService from '../../services/weather/weatherService'

function DailyForecast({ selectedDay }) {
  const [hourlyData, setHourlyData] = useState([])
  const [weatherDetails, setWeatherDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  // Fetch hourly data and weather details when selectedDay changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const date = selectedDay?.date || new Date()

        // Fetch hourly forecast and weather details in parallel
        const [hourly, details] = await Promise.all([
          weatherService.getHourlyForecast(null, null, date),
          weatherService.getWeatherDetails(null, null, date),
        ])

        setHourlyData(hourly)
        setWeatherDetails(details)
      } catch (error) {
        console.error('Failed to fetch daily forecast:', error)
        setError(error.message)
        // Don't set data - leave empty to show error state
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDay])

  const displayDate = selectedDay?.date || new Date()
  const displayCondition = selectedDay?.condition || ''
  const displayHigh = selectedDay?.high || null
  const displayLow = selectedDay?.low || null
  const currentTemp = displayHigh && displayLow ? Math.floor((displayHigh + displayLow) / 2) : null
  const currentHour = new Date().getHours()

  // Calculate temperature range for Y-axis
  const allTemps = hourlyData.length > 0 ? hourlyData.map(d => d.temp) : []
  const minTemp = allTemps.length > 0 ? Math.min(...allTemps) : 0
  const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) : 100
  const tempRange = maxTemp - minTemp
  const yAxisMin = Math.floor(minTemp / 10) * 10
  const yAxisMax = Math.ceil(maxTemp / 10) * 10
  const yAxisRange = yAxisMax - yAxisMin

  // Calculate precipitation range for Y-axis
  const allPrecip = hourlyData.length > 0 ? hourlyData.map(d => d.precipitation) : []
  const maxPrecip = allPrecip.length > 0 ? Math.max(...allPrecip) : 100
  const precipYMax = Math.ceil(maxPrecip / 20) * 20

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {format(displayDate, 'EEEE, MMMM d')}
        </h2>
        <p className="text-lg text-macos-text-secondary-light dark:text-macos-text-secondary">
          {displayCondition || 'Loading...'}
        </p>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-macos-text-secondary-light dark:text-macos-text-secondary">
            Loading hourly forecast...
          </div>
        </div>
      )}

      {error && hourlyData.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load hourly forecast</div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Grid Container - 12 columns */}
      {hourlyData.length > 0 && (
      <div className="grid grid-cols-12 gap-4">
        {/* Temperature Graph - 6/12 columns (50%) */}
        <div className="col-span-6 relative p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border overflow-hidden">
          {/* Temperature overlay in top-left */}
          <div className="absolute top-6 left-6 z-10">
            <div className="text-4xl font-bold">{currentTemp}°</div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
              H: {displayHigh}° L: {displayLow}°
            </div>
          </div>

          {/* Graph container */}
          <div className="relative flex mt-16">
            {/* Main graph area */}
            <div className="flex-1 relative" style={{ height: '240px' }}>
              {/* Weather icons row - show every 6 hours */}
              <div className="absolute top-0 left-0 right-12 flex justify-between px-2">
                {[0, 6, 12, 18].map((hour) => {
                  const data = hourlyData[hour]
                  return (
                    <div key={hour} className="text-lg flex-1 text-center">
                      {data.condition}
                    </div>
                  )
                })}
              </div>

              {/* SVG for line chart and gradient */}
              <svg className="absolute top-8 left-0 right-12 bottom-8" width="100%" height="calc(100% - 64px)" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Create path for gradient fill */}
                <path
                  d={`
                    M 0,${200 - ((hourlyData[0].temp - yAxisMin) / yAxisRange * 200)}
                    ${hourlyData.map((data, i) => {
                      const x = (i / 23) * 100
                      const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                      return `L ${x},${y}`
                    }).join(' ')}
                    L 100,200 L 0,200 Z
                  `}
                  fill="url(#tempGradient)"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Line connecting points */}
                <polyline
                  points={hourlyData.map((data, i) => {
                    const x = (i / 23) * 100
                    const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Dots at key points (every 6 hours) */}
                {[0, 6, 12, 18, 23].map((i) => {
                  const data = hourlyData[i]
                  const x = (i / 23) * 100
                  const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="white"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                    />
                  )
                })}

                {/* Current time indicator */}
                {currentHour >= 0 && currentHour < 24 && (
                  <line
                    x1={`${(currentHour / 23) * 100}%`}
                    y1="0"
                    x2={`${(currentHour / 23) * 100}%`}
                    y2="100%"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </svg>

              {/* Temperature labels - show every 6 hours */}
              <div className="absolute top-8 left-0 right-12 bottom-8 pointer-events-none">
                {[0, 6, 12, 18, 23].map((i) => {
                  const data = hourlyData[i]
                  const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                  return (
                    <div
                      key={i}
                      className="absolute text-xs font-semibold"
                      style={{
                        left: `${(i / 23) * 100}%`,
                        top: `${(y / 200) * 100}%`,
                        transform: 'translate(-50%, -20px)',
                      }}
                    >
                      {data.temp}°
                    </div>
                  )
                })}
              </div>

              {/* Hour labels at bottom - every 6 hours */}
              <div className="absolute bottom-0 left-0 right-12 flex justify-between px-2">
                {[0, 6, 12, 18].map((hour) => {
                  const label = hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour < 12 ? `${hour}AM` : `${hour - 12}PM`
                  return (
                    <div key={hour} className="flex-1 text-center text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Y-axis temperature scale */}
            <div className="w-12 relative flex flex-col justify-between text-xs text-macos-text-secondary-light dark:text-macos-text-secondary py-8">
              <div>{yAxisMax}°</div>
              <div>{Math.floor((yAxisMax + yAxisMin) / 2)}°</div>
              <div>{yAxisMin}°</div>
            </div>
          </div>
        </div>

        {/* Precipitation Graph - 6/12 columns (50%) */}
        <div className="col-span-6 relative p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border overflow-hidden">
          {/* Precipitation title overlay in top-left */}
          <div className="absolute top-6 left-6 z-10">
            <div className="text-2xl font-bold">Precipitation</div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
              24-hour forecast
            </div>
          </div>

          {/* Graph container */}
          <div className="relative flex mt-16">
            {/* Main graph area */}
            <div className="flex-1 relative" style={{ height: '240px' }}>
              {/* Weather icons row - show every 6 hours */}
              <div className="absolute top-0 left-0 right-12 flex justify-between px-2">
                {[0, 6, 12, 18].map((hour) => {
                  const data = hourlyData[hour]
                  return (
                    <div key={hour} className="text-lg flex-1 text-center">
                      {data.condition}
                    </div>
                  )
                })}
              </div>

              {/* SVG for line chart and gradient */}
              <svg className="absolute top-8 left-0 right-12 bottom-8" width="100%" height="calc(100% - 64px)" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="precipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Create path for gradient fill */}
                <path
                  d={`
                    M 0,${200 - ((hourlyData[0].precipitation / 100) * 200)}
                    ${hourlyData.map((data, i) => {
                      const x = (i / 23) * 100
                      const y = 200 - ((data.precipitation / 100) * 200)
                      return `L ${x},${y}`
                    }).join(' ')}
                    L 100,200 L 0,200 Z
                  `}
                  fill="url(#precipGradient)"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Line connecting points */}
                <polyline
                  points={hourlyData.map((data, i) => {
                    const x = (i / 23) * 100
                    const y = 200 - ((data.precipitation / 100) * 200)
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="rgb(6, 182, 212)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Dots at key points (every 6 hours) */}
                {[0, 6, 12, 18, 23].map((i) => {
                  const data = hourlyData[i]
                  const x = (i / 23) * 100
                  const y = 200 - ((data.precipitation / 100) * 200)
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="white"
                      stroke="rgb(6, 182, 212)"
                      strokeWidth="2"
                    />
                  )
                })}

                {/* Current time indicator */}
                {currentHour >= 0 && currentHour < 24 && (
                  <line
                    x1={`${(currentHour / 23) * 100}%`}
                    y1="0"
                    x2={`${(currentHour / 23) * 100}%`}
                    y2="100%"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </svg>

              {/* Precipitation labels - show every 6 hours */}
              <div className="absolute top-8 left-0 right-12 bottom-8 pointer-events-none">
                {[0, 6, 12, 18, 23].map((i) => {
                  const data = hourlyData[i]
                  const y = 200 - ((data.precipitation / 100) * 200)
                  return (
                    <div
                      key={i}
                      className="absolute text-xs font-semibold"
                      style={{
                        left: `${(i / 23) * 100}%`,
                        top: `${(y / 200) * 100}%`,
                        transform: 'translate(-50%, -20px)',
                      }}
                    >
                      {data.precipitation}%
                    </div>
                  )
                })}
              </div>

              {/* Hour labels at bottom - every 6 hours */}
              <div className="absolute bottom-0 left-0 right-12 flex justify-between px-2">
                {[0, 6, 12, 18].map((hour) => {
                  const label = hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour < 12 ? `${hour}AM` : `${hour - 12}PM`
                  return (
                    <div key={hour} className="flex-1 text-center text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Y-axis precipitation scale */}
            <div className="w-12 relative flex flex-col justify-between text-xs text-macos-text-secondary-light dark:text-macos-text-secondary py-8">
              <div>100%</div>
              <div>50%</div>
              <div>0%</div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Grid Container for smaller cards */}
      {weatherDetails && (
        <div className="grid grid-cols-12 gap-4">
          {/* Weather Details - 3/12 columns (25%) */}
          <div className="col-span-3 p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
            <h3 className="text-lg font-semibold mb-4">Weather Details</h3>
            <div className="space-y-4">
              {Object.entries(weatherDetails).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-lg font-semibold">{value}</div>
              </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weather Summary */}
      {displayCondition && displayHigh && displayLow && (
        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-macos-text-secondary-light dark:text-macos-text-secondary leading-relaxed">
            Expect {displayCondition.toLowerCase()} conditions throughout the day.
            Temperatures will range from {displayLow}°F in the morning to {displayHigh}°F
            in the afternoon. Light winds from the northwest.
          </p>
        </div>
      )}
    </div>
  )
}

export default DailyForecast
