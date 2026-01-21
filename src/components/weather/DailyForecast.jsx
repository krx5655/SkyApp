import { format } from 'date-fns'

function DailyForecast({ selectedDay }) {
  // Mock hourly data
  const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    temp: Math.floor(Math.random() * 15) + 55,
    precipitation: Math.floor(Math.random() * 60),
  }))

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

      {/* Current Temperature */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-macos-border-light dark:border-macos-border">
        <div className="text-6xl font-bold mb-2">
          {Math.floor((displayHigh + displayLow) / 2)}°
        </div>
        <div className="text-macos-text-secondary-light dark:text-macos-text-secondary">
          H: {displayHigh}° L: {displayLow}°
        </div>
      </div>

      {/* Hourly Temperature Graph (Simplified) */}
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-lg font-semibold mb-4">Hourly Temperature</h3>
        <div className="h-32 flex items-end justify-between gap-1">
          {mockHourlyData.slice(0, 12).map((data, i) => {
            const height = ((data.temp - 50) / 30) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                  {data.temp}°
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
                  {data.hour}
                </div>
              </div>
            )
          })}
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

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(mockDetails).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center"
          >
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        ))}
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
