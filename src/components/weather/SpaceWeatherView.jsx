function SpaceWeatherView() {
  // Mock data
  const kpIndex = 4 // 0-9 scale
  const solarWindSpeed = 425 // km/s
  const xrayFlux = 'M2.1'
  const protonFlux = 0.5

  const noaaScales = [
    {
      type: 'R',
      name: 'Radio Blackout',
      level: 'R2',
      severity: 'Moderate',
      color: 'yellow',
      description: 'Limited HF radio blackout',
    },
    {
      type: 'S',
      name: 'Solar Radiation',
      level: 'S1',
      severity: 'Minor',
      color: 'green',
      description: 'Minor impacts on satellites',
    },
    {
      type: 'G',
      name: 'Geomagnetic Storm',
      level: 'G3',
      severity: 'Strong',
      color: 'orange',
      description: 'Aurora visible at mid-latitudes',
    },
  ]

  const recentFlares = [
    { time: '14:32 UTC', class: 'M2.1', region: '3590' },
    { time: '11:15 UTC', class: 'C8.4', region: '3592' },
    { time: '08:45 UTC', class: 'M1.5', region: '3590' },
  ]

  const getKpColor = (kp) => {
    if (kp <= 2) return 'from-green-400 to-green-600'
    if (kp <= 4) return 'from-yellow-400 to-yellow-600'
    if (kp <= 6) return 'from-orange-400 to-orange-600'
    return 'from-red-400 to-red-600'
  }

  const getKpLabel = (kp) => {
    if (kp <= 2) return 'Quiet'
    if (kp <= 4) return 'Unsettled'
    if (kp <= 6) return 'Active'
    if (kp <= 8) return 'Storm'
    return 'Severe Storm'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}


      {/* KP Index Gauge */}
      <div className="max-w-md mx-auto">
        <div className={`p-8 rounded-2xl bg-gradient-to-br ${getKpColor(kpIndex)} text-white text-center`}>
          <div className="text-sm font-medium mb-2 opacity-90">KP Index</div>
          <div className="text-6xl font-bold mb-2">{kpIndex}</div>
          <div className="text-xl font-semibold">{getKpLabel(kpIndex)}</div>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <div
                key={level}
                className={`w-8 h-2 rounded ${level <= kpIndex ? 'bg-white' : 'bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* NOAA Space Weather Scales */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">NOAA Space Weather Scales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {noaaScales.map((scale) => (
            <div
              key={scale.type}
              className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`text-3xl font-bold ${scale.color === 'green'
                      ? 'text-green-500'
                      : scale.color === 'yellow'
                        ? 'text-yellow-500'
                        : scale.color === 'orange'
                          ? 'text-orange-500'
                          : 'text-red-500'
                    }`}
                >
                  {scale.level}
                </div>
                <div
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${scale.color === 'green'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : scale.color === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : scale.color === 'orange'
                          ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                >
                  {scale.severity}
                </div>
              </div>
              <div className="font-semibold mb-2">{scale.name}</div>
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                {scale.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solar Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
            Solar Wind
          </div>
          <div className="text-3xl font-bold">{solarWindSpeed}</div>
          <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
            km/s
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
            X-Ray Flux
          </div>
          <div className="text-3xl font-bold">{xrayFlux}</div>
          <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
            Class
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
            Proton Flux
          </div>
          <div className="text-3xl font-bold">{protonFlux}</div>
          <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
            pfu
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
            Bz Component
          </div>
          <div className="text-3xl font-bold">-2.3</div>
          <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
            nT
          </div>
        </div>
      </div>

      {/* Recent Solar Flares */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Recent Solar Flares</h3>
        <div className="space-y-3">
          {recentFlares.map((flare, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">Class {flare.class}</div>
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Region {flare.region}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{flare.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aurora Forecast */}
      <div className="max-w-2xl mx-auto">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-400/10 to-blue-400/10 border border-green-500/30">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Aurora Forecast
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
                Visibility
              </div>
              <div className="text-2xl font-bold text-green-500">High</div>
              <div className="text-sm mt-1">Northern tier states</div>
            </div>
            <div>
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
                Peak Time
              </div>
              <div className="text-2xl font-bold">22:00-02:00</div>
              <div className="text-sm mt-1">Local time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Note */}
      <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-2xl mx-auto">
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          This is placeholder data. Real-time space weather data will be integrated from NOAA SWPC API in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default SpaceWeatherView
