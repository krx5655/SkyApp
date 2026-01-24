import { format } from 'date-fns'

function DailyForecast({ selectedDay }) {
  // Mock hourly data with weather conditions
  const mockHourlyData = Array.from({ length: 24 }, (_, i) => {
    const conditions = ['☀️', '⛅', '☁️', '🌧️']
    return {
      hour: i,
      temp: Math.floor(Math.random() * 15) + 55,
      precipitation: Math.floor(Math.random() * 60),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    }
  })

  const mockDetails = {
    sunrise: '6:42 AM',
    sunset: '7:18 PM',
    wind: '12 mph NW',
    humidity: '65%',
    uvIndex: 6,
    visibility: '10 mi',
  }

  const displayDate = selectedDay?.date || new Date()
  const displayCondition = selectedDay?.condition || 'Partly Cloudy'
  const displayHigh = selectedDay?.high || 72
  const displayLow = selectedDay?.low || 58
  const currentTemp = Math.floor((displayHigh + displayLow) / 2)
  const currentHour = new Date().getHours()

  // Calculate temperature range for Y-axis
  const allTemps = mockHourlyData.map(d => d.temp)
  const minTemp = Math.min(...allTemps)
  const maxTemp = Math.max(...allTemps)
  const tempRange = maxTemp - minTemp
  const yAxisMin = Math.floor(minTemp / 10) * 10
  const yAxisMax = Math.ceil(maxTemp / 10) * 10
  const yAxisRange = yAxisMax - yAxisMin

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {format(displayDate, 'EEEE, MMMM d')}
        </h2>
        <p className="text-lg text-macos-text-secondary-light dark:text-macos-text-secondary">
          {displayCondition}
        </p>
      </div>

      {/* Apple-Style Hourly Temperature Graph */}
      <div className="relative p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border overflow-hidden">
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
            {/* Weather icons row */}
            <div className="absolute top-0 left-0 right-12 flex justify-between px-2">
              {mockHourlyData.map((data, i) => (
                <div key={i} className="text-lg" style={{ width: `${100/24}%`, textAlign: 'center' }}>
                  {i % 3 === 0 ? data.condition : ''}
                </div>
              ))}
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
                  M 0,${200 - ((mockHourlyData[0].temp - yAxisMin) / yAxisRange * 200)}
                  ${mockHourlyData.map((data, i) => {
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
                points={mockHourlyData.map((data, i) => {
                  const x = (i / 23) * 100
                  const y = 200 - ((data.temp - yAxisMin) / yAxisRange * 200)
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {/* Dots at each point */}
              {mockHourlyData.map((data, i) => {
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

            {/* Temperature labels above points */}
            <div className="absolute top-8 left-0 right-12 bottom-8 pointer-events-none">
              {mockHourlyData.map((data, i) => {
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

            {/* Hour labels at bottom */}
            <div className="absolute bottom-0 left-0 right-12 flex justify-between px-2">
              {mockHourlyData.map((data, i) => {
                const hour = data.hour === 0 ? '12AM' : data.hour === 12 ? '12PM' : data.hour < 12 ? `${data.hour}AM` : `${data.hour - 12}PM`
                return (
                  <div
                    key={i}
                    className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary"
                    style={{ width: `${100/24}%`, textAlign: 'center' }}
                  >
                    {i % 3 === 0 ? hour : ''}
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

      {/* Precipitation */}
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-lg font-semibold mb-4">Precipitation Chance</h3>
        <div className="h-24 flex items-end justify-between gap-1">
          {mockHourlyData.slice(0, 12).map((data, i) => {
            const height = data.precipitation
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                  {data.precipitation}%
                </div>
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t"
                  style={{ height: `${height}%` }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Weather Details - Combined Card */}
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-lg font-semibold mb-4">Weather Details</h3>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(mockDetails).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Summary */}
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-macos-text-secondary-light dark:text-macos-text-secondary leading-relaxed">
          Expect {displayCondition.toLowerCase()} conditions throughout the day.
          Temperatures will range from {displayLow}°F in the morning to {displayHigh}°F
          in the afternoon. Light winds from the northwest.
        </p>
      </div>
    </div>
  )
}

export default DailyForecast
