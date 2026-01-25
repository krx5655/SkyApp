import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, useAnimation } from 'framer-motion'
import weatherService from '../../services/weather/weatherService'
import { getTemperatureUnit, getWindSpeedUnit } from '../../services/weather/config'
import { convertTemperature, getTemperatureSymbol, convertWindSpeed, getWindSpeedSymbol, convertWindString } from '../../services/weather/unitConversion'

/**
 * Generate smooth curve path using Catmull-Rom spline
 * @param {Array} points - Array of {x, y} coordinates
 * @param {number} tension - 0 (straight) to 1 (very curved), default 0.5
 * @returns {string} SVG path string
 */
function generateSmoothPath(points, tension = 0.5) {
  if (points.length < 2) return ''

  // Start at first point
  let path = `M ${points[0].x},${points[0].y}`

  // For curves, we need at least 3 points
  if (points.length === 2) {
    return path + ` L ${points[1].x},${points[1].y}`
  }

  // Generate smooth curve through points using Catmull-Rom spline
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    // Calculate control points for cubic bezier
    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return path
}

function DailyForecast({ selectedDay, forecastData = [], onNavigateDay }) {
  const [hourlyData, setHourlyData] = useState([])
  const [weatherDetails, setWeatherDetails] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tempUnit, setTempUnit] = useState('F')
  const [windUnit, setWindUnit] = useState('mph')
  const [hoveredTempHour, setHoveredTempHour] = useState(null)
  const [hoveredPrecipHour, setHoveredPrecipHour] = useState(null)
  const controls = useAnimation()

  // Get next and previous days for swipe navigation
  const getCurrentDayIndex = () => {
    if (!selectedDay || !forecastData.length) return -1
    return forecastData.findIndex(day =>
      new Date(day.date).toDateString() === new Date(selectedDay.date).toDateString()
    )
  }

  const getNextDay = () => {
    const currentIndex = getCurrentDayIndex()
    if (currentIndex === -1 || currentIndex >= forecastData.length - 1) return null
    return forecastData[currentIndex + 1]
  }

  const getPreviousDay = () => {
    const currentIndex = getCurrentDayIndex()
    if (currentIndex === -1 || currentIndex <= 0) return null
    return forecastData[currentIndex - 1]
  }

  // Handle swipe/drag end
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50 // pixels
    const swipeVelocity = 0.5 // velocity threshold

    if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      // Swipe right -> previous day
      const prevDay = getPreviousDay()
      if (prevDay && onNavigateDay) {
        controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.3 } })
          .then(() => {
            onNavigateDay(prevDay)
            controls.set({ x: -window.innerWidth })
            controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } })
          })
      } else {
        // Bounce back - can't go earlier
        controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
      }
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      // Swipe left -> next day
      const nextDay = getNextDay()
      if (nextDay && onNavigateDay) {
        controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.3 } })
          .then(() => {
            onNavigateDay(nextDay)
            controls.set({ x: window.innerWidth })
            controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } })
          })
      } else {
        // Bounce back - can't go later
        controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
      }
    } else {
      // Snap back to center
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
    }
  }

  // Handle mouse move on temperature graph
  const handleTempGraphMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const graphWidth = rect.width

    // Calculate hour from X position (0-23 range)
    const hour = Math.round((x / graphWidth) * 23)
    const clampedHour = Math.max(0, Math.min(23, hour))

    setHoveredTempHour(clampedHour)
  }

  // Handle mouse leave on temperature graph
  const handleTempGraphMouseLeave = () => {
    setHoveredTempHour(null)
  }

  // Handle mouse move on precipitation graph
  const handlePrecipGraphMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const graphWidth = rect.width

    // Calculate hour from X position (0-23 range)
    const hour = Math.round((x / graphWidth) * 23)
    const clampedHour = Math.max(0, Math.min(23, hour))

    setHoveredPrecipHour(clampedHour)
  }

  // Handle mouse leave on precipitation graph
  const handlePrecipGraphMouseLeave = () => {
    setHoveredPrecipHour(null)
  }

  // Fetch hourly data and weather details when selectedDay changes
  useEffect(() => {
    // Load unit preferences (outside async to avoid extra renders)
    const tempUnitPref = getTemperatureUnit()
    const windUnitPref = getWindSpeedUnit()

    async function fetchData() {
      try {
        // Batch initial state updates
        setLoading(true)
        setError(null)
        setTempUnit(tempUnitPref)
        setWindUnit(windUnitPref)

        const date = selectedDay?.date ? new Date(selectedDay.date) : new Date()

        console.log(`[DailyForecast] Fetching data for ${format(date, 'MMM d, yyyy')}`)

        // Check if this is today
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()

        // Fetch hourly forecast, weather details, and current weather (if today) in parallel
        const promises = [
          weatherService.getHourlyForecast(null, null, date),
          weatherService.getWeatherDetails(null, null, date),
        ]

        if (isToday) {
          promises.push(weatherService.getCurrentWeather().catch(() => null))
        }

        const results = await Promise.all(promises)

        const hourly = results[0]
        console.log(`[DailyForecast] Received hourly data:`, {
          totalPoints: hourly.length,
          hours: hourly.map(h => ({ hour: h.hour, temp: h.temp, isPast: h.isPast })),
          hourRange: hourly.length > 0 ? `${hourly[0].hour} to ${hourly[hourly.length - 1].hour}` : 'none'
        })

        // Batch data updates - React 18 will automatically batch these
        setHourlyData(hourly)
        setWeatherDetails(results[1])
        setCurrentWeather(isToday && results[2] ? results[2] : null)
        setLoading(false)
      } catch (error) {
        console.error('[DailyForecast] Failed to fetch daily forecast:', error)
        // Batch error state updates
        setError(error.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDay])

  const displayDate = selectedDay?.date ? new Date(selectedDay.date) : new Date()
  const displayCondition = selectedDay?.condition || ''
  const displayHigh = selectedDay?.high || null
  const displayLow = selectedDay?.low || null
  const currentHour = new Date().getHours()

  // Check if selected day is today
  const now = new Date()
  const isToday = displayDate.toDateString() === now.toDateString()

  // Helper function to convert weather detail values based on unit preferences
  const convertWeatherDetailValue = (key, value) => {
    if (key === 'wind' && typeof value === 'string') {
      return convertWindString(value, windUnit)
    }
    return value
  }

  // Calculate temperature range for Y-axis with ±10° padding
  const allTemps = hourlyData.length > 0 ? hourlyData.map(d => d.temp) : []
  const minTemp = allTemps.length > 0 ? Math.min(...allTemps) : 0
  const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) : 100
  const yAxisMin = minTemp - 10
  const yAxisMax = maxTemp + 10
  const yAxisRange = yAxisMax - yAxisMin

  // For graphing, always use full 0-23 hour range so partial data shows correctly
  // with blank areas before/after the available data
  const minHour = 0
  const maxHour = 23
  const hourRange = 23 // Full day range

  // Track actual data bounds for display purposes
  const dataMinHour = hourlyData.length > 0 ? hourlyData[0].hour : 0
  const dataMaxHour = hourlyData.length > 0 ? hourlyData[hourlyData.length - 1].hour : 23

  console.log(`[DailyForecast] Hourly data points:`, hourlyData.length)
  console.log(`[DailyForecast] Data hour range: ${dataMinHour} to ${dataMaxHour}`)
  console.log(`[DailyForecast] Graph hour range: ${minHour} to ${maxHour} (full day)`)
  console.log(`[DailyForecast] Temp range: ${minTemp}° to ${maxTemp}°`)
  console.log(`[DailyForecast] Y-axis range: ${yAxisMin}° to ${yAxisMax}°`)

  // Calculate precipitation range for Y-axis
  const allPrecip = hourlyData.length > 0 ? hourlyData.map(d => d.precipitation) : []
  const maxPrecip = allPrecip.length > 0 ? Math.max(...allPrecip) : 100
  const precipYMax = Math.ceil(maxPrecip / 20) * 20

  // Always show these hours on X-axis: 12AM, 6AM, 12PM, 6PM
  const displayHours = [0, 6, 12, 18]

  return (
    <motion.div
      className="p-6 space-y-6 touch-pan-y"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
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
              {isToday && currentWeather ? (
                <>
                  <div className="text-3xl font-bold">{convertTemperature(currentWeather.temp, tempUnit)}{getTemperatureSymbol(tempUnit)}</div>
                  <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    H: {convertTemperature(displayHigh, tempUnit)}{getTemperatureSymbol(tempUnit)} L: {convertTemperature(displayLow, tempUnit)}{getTemperatureSymbol(tempUnit)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    H: {convertTemperature(displayHigh, tempUnit)}{getTemperatureSymbol(tempUnit)} L: {convertTemperature(displayLow, tempUnit)}{getTemperatureSymbol(tempUnit)}
                  </div>
                </>
              )}
            </div>

            {/* Graph container */}
            <div className="relative flex mt-16">
              {/* Main graph area */}
              <div
                className="flex-1 relative cursor-crosshair"
                style={{ height: '240px' }}
                onMouseMove={handleTempGraphMouseMove}
                onMouseLeave={handleTempGraphMouseLeave}
              >
                {/* Weather icons row - show at display hours where data exists */}
                <div className="absolute top-0 left-0 right-12 flex justify-between px-2">
                  {displayHours.map((hour) => {
                    const data = hourlyData.find(d => d.hour === hour)
                    return (
                      <div
                        key={hour}
                        className="text-2xl flex-1 text-center drop-shadow-md"
                        title={data?.condition}
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {data?.icon || ''}
                      </div>
                    )
                  })}
                </div>

                {/* SVG for line chart and gradient */}
                <svg
                  className="absolute top-8 left-0 right-12 bottom-8"
                  viewBox="0 0 100 200"
                  preserveAspectRatio="none"
                  style={{ width: '100%', height: 'calc(100% - 64px)' }}
                >
                  <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Create smooth curve points */}
                  {(() => {
                    // Split data into past and future
                    const pastData = hourlyData.filter(d => d.isPast)
                    const futureData = hourlyData.filter(d => !d.isPast)

                    const allPoints = hourlyData.map(data => ({
                      x: (data.hour / hourRange) * 100,
                      y: 200 - ((data.temp - yAxisMin) / yAxisRange * 200),
                      isPast: data.isPast
                    }))

                    // Calculate start and end X positions for the gradient fill
                    const startX = allPoints.length > 0 ? allPoints[0].x : 0
                    const endX = allPoints.length > 0 ? allPoints[allPoints.length - 1].x : 100

                    return (
                      <>
                        {/* Gradient fill under curve - only where data exists */}
                        {allPoints.length > 0 && (
                          <path
                            d={`
                              M ${startX},200
                              L ${startX},${allPoints[0].y}
                              ${generateSmoothPath(allPoints, 0.5).substring(1)}
                              L ${endX},200 Z
                            `}
                            fill="url(#tempGradient)"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Past hours - translucent line */}
                        {pastData.length > 0 && (
                          <path
                            d={generateSmoothPath(
                              pastData.map(data => ({
                                x: (data.hour / hourRange) * 100,
                                y: 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                              })),
                              0.5
                            )}
                            fill="none"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="0.8"
                            opacity="0.3"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Future hours - normal line */}
                        {futureData.length > 0 && (
                          <path
                            d={generateSmoothPath(
                              futureData.map(data => ({
                                x: (data.hour / hourRange) * 100,
                                y: 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                              })),
                              0.5
                            )}
                            fill="none"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="0.8"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}
                      </>
                    )
                  })()}



                  {/* Time indicator - shows hovered hour or current hour */}
                  {(() => {
                    const indicatorHour = hoveredTempHour !== null ? hoveredTempHour : (isToday ? currentHour : null)
                    if (indicatorHour === null) return null

                    return (
                      <>
                        {/* Vertical line - solid */}
                        <line
                          x1={(indicatorHour / hourRange) * 100}
                          y1="0"
                          x2={(indicatorHour / hourRange) * 100}
                          y2="200"
                          stroke="white"
                          strokeWidth="0.5"
                          opacity="0.8"
                        />
                      </>
                    )
                  })()}
                </svg>

                {/* Hover indicator header */}
                {hoveredTempHour !== null && (() => {
                  const hoveredData = hourlyData.find(d => d.hour === hoveredTempHour)
                  if (!hoveredData) return null

                  const timeStr = hoveredData.hour === 0 ? '12:00 AM' :
                    hoveredData.hour === 12 ? '12:00 PM' :
                    hoveredData.hour < 12 ? `${hoveredData.hour}:00 AM` :
                    `${hoveredData.hour - 12}:00 PM`

                  return (
                    <div
                      className="absolute top-0 bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border rounded-lg p-2 shadow-lg z-20 pointer-events-none"
                      style={{
                        left: `${(hoveredData.hour / hourRange) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="text-xs font-semibold mb-1 text-center">{timeStr}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{hoveredData.icon}</div>
                        <div className="text-lg font-bold">{convertTemperature(hoveredData.temp, tempUnit)}{getTemperatureSymbol(tempUnit)}</div>
                      </div>
                    </div>
                  )
                })()}

                {/* Temperature labels - show at display hours where data exists */}
                <div className="absolute top-8 left-0 right-12 bottom-8 pointer-events-none">
                  {displayHours.map((hour) => {
                    const data = hourlyData.find(d => d.hour === hour)
                    if (!data) return null
                    const x = (data.hour / hourRange) * 100
                    const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                    return (
                      <div
                        key={hour}
                        className="absolute text-xs font-semibold"
                        style={{
                          left: `${x}%`,
                          top: `${(y / 200) * 100}%`,
                          transform: 'translate(-50%, -20px)',
                        }}
                      >
                        {convertTemperature(data.temp, tempUnit)}{getTemperatureSymbol(tempUnit)}
                      </div>
                    )
                  })}
                </div>

                {/* Hour labels at bottom - always show 12AM, 6AM, 12PM, 6PM */}
                <div className="absolute bottom-0 left-0 right-12 flex justify-between px-2">
                  {displayHours.map((hour) => {
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
                {isToday ? `${hourlyData.length}-hour forecast` : '24-hour forecast'}
              </div>
            </div>

            {/* Graph container */}
            <div className="relative flex mt-16">
              {/* Main graph area */}
              <div
                className="flex-1 relative cursor-crosshair"
                style={{ height: '240px' }}
                onMouseMove={handlePrecipGraphMouseMove}
                onMouseLeave={handlePrecipGraphMouseLeave}
              >
                {/* Weather icons row - show at display hours where data exists */}
                <div className="absolute top-0 left-0 right-12 flex justify-between px-2">
                  {displayHours.map((hour) => {
                    const data = hourlyData.find(d => d.hour === hour)
                    return (
                      <div
                        key={hour}
                        className="text-2xl flex-1 text-center drop-shadow-md"
                        title={data?.condition}
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {data?.icon || ''}
                      </div>
                    )
                  })}
                </div>

                {/* SVG for line chart and gradient */}
                <svg
                  className="absolute top-8 left-0 right-12 bottom-8"
                  viewBox="0 0 100 200"
                  preserveAspectRatio="none"
                  style={{ width: '100%', height: 'calc(100% - 64px)' }}
                >
                  <defs>
                    <linearGradient id="precipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Create smooth curve points */}
                  {(() => {
                    // Split data into past and future
                    const pastData = hourlyData.filter(d => d.isPast)
                    const futureData = hourlyData.filter(d => !d.isPast)

                    const allPoints = hourlyData.map(data => ({
                      x: (data.hour / hourRange) * 100,
                      y: 200 - ((data.precipitation / 110) * 200),
                      isPast: data.isPast
                    }))

                    // Calculate start and end X positions for the gradient fill
                    const startX = allPoints.length > 0 ? allPoints[0].x : 0
                    const endX = allPoints.length > 0 ? allPoints[allPoints.length - 1].x : 100

                    return (
                      <>
                        {/* Gradient fill under curve - only where data exists */}
                        {allPoints.length > 0 && (
                          <path
                            d={`
                              M ${startX},200
                              L ${startX},${allPoints[0].y}
                              ${generateSmoothPath(allPoints, 0.5).substring(1)}
                              L ${endX},200 Z
                            `}
                            fill="url(#precipGradient)"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Past hours - translucent line */}
                        {pastData.length > 0 && (
                          <path
                            d={generateSmoothPath(
                              pastData.map(data => ({
                                x: (data.hour / hourRange) * 100,
                                y: 200 - ((data.precipitation / 110) * 200)
                              })),
                              0.5
                            )}
                            fill="none"
                            stroke="rgb(6, 182, 212)"
                            strokeWidth="0.8"
                            opacity="0.3"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Future hours - normal line */}
                        {futureData.length > 0 && (
                          <path
                            d={generateSmoothPath(
                              futureData.map(data => ({
                                x: (data.hour / hourRange) * 100,
                                y: 200 - ((data.precipitation / 110) * 200)
                              })),
                              0.5
                            )}
                            fill="none"
                            stroke="rgb(6, 182, 212)"
                            strokeWidth="0.8"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}
                      </>
                    )
                  })()}

                  {/* Time indicator - shows hovered hour or current hour */}
                  {(() => {
                    const indicatorHour = hoveredPrecipHour !== null ? hoveredPrecipHour : (isToday ? currentHour : null)
                    if (indicatorHour === null) return null

                    return (
                      <>
                        {/* Vertical line - solid */}
                        <line
                          x1={(indicatorHour / hourRange) * 100}
                          y1="0"
                          x2={(indicatorHour / hourRange) * 100}
                          y2="200"
                          stroke="white"
                          strokeWidth="0.5"
                          opacity="0.8"
                        />
                      </>
                    )
                  })()}
                </svg>

                {/* Hover indicator header */}
                {hoveredPrecipHour !== null && (() => {
                  const hoveredData = hourlyData.find(d => d.hour === hoveredPrecipHour)
                  if (!hoveredData) return null

                  const timeStr = hoveredData.hour === 0 ? '12:00 AM' :
                    hoveredData.hour === 12 ? '12:00 PM' :
                    hoveredData.hour < 12 ? `${hoveredData.hour}:00 AM` :
                    `${hoveredData.hour - 12}:00 PM`

                  return (
                    <div
                      className="absolute top-0 bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border rounded-lg p-2 shadow-lg z-20 pointer-events-none"
                      style={{
                        left: `${(hoveredData.hour / hourRange) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="text-xs font-semibold text-center">{timeStr}</div>
                      <div className="text-lg font-bold text-center">{hoveredData.precipitation}%</div>
                    </div>
                  )
                })()}

                {/* Precipitation labels - show at display hours where data exists */}
                <div className="absolute top-8 left-0 right-12 bottom-8 pointer-events-none">
                  {displayHours.map((hour) => {
                    const data = hourlyData.find(d => d.hour === hour)
                    if (!data) return null
                    const x = (data.hour / hourRange) * 100
                    const y = 200 - ((data.precipitation / 110) * 200)
                    return (
                      <div
                        key={hour}
                        className="absolute text-xs font-semibold"
                        style={{
                          left: `${x}%`,
                          top: `${(y / 200) * 100}%`,
                          transform: 'translate(-50%, -20px)',
                        }}
                      >
                        {data.precipitation}%
                      </div>
                    )
                  })}
                </div>

                {/* Hour labels at bottom - always show 12AM, 6AM, 12PM, 6PM */}
                <div className="absolute bottom-0 left-0 right-12 flex justify-between px-2">
                  {displayHours.map((hour) => {
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
                  <div className="text-lg font-semibold">{convertWeatherDetailValue(key, value)}</div>
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
            Temperatures will range from {convertTemperature(displayLow, tempUnit)}{getTemperatureSymbol(tempUnit)} in the morning to {convertTemperature(displayHigh, tempUnit)}{getTemperatureSymbol(tempUnit)}
            in the afternoon. Light winds from the northwest.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default DailyForecast
