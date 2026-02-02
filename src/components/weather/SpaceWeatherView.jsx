import { useState, useEffect } from 'react'
import spaceWeatherService from '../../services/spaceWeather/spaceWeatherService.js'

function SpaceWeatherView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    kpIndex: null,
    xrayFlux: null,
    solarFlares: [],
    alerts: [],
    sunspotNumber: null,
    enlilAnimation: null,
    lascoImage: null,
    solarWind: null,
    protonFlux: null,
  })

  useEffect(() => {
    loadData()
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const allData = await spaceWeatherService.getAllData()
      setData(allData)
      setError(null)
    } catch (err) {
      console.error('Failed to load space weather data:', err)
      setError('Failed to load space weather data')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data.kpIndex) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">
            Loading space weather data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* KP Index Bar Graph */}
      <KpIndexChart data={data.kpIndex} />

      {/* Active Alerts */}
      <AlertsSection alerts={data.alerts} />

      {/* Solar Activity Stats Grid */}
      <SolarActivityStats
        solarWind={data.solarWind}
        xrayFlux={data.xrayFlux}
        protonFlux={data.protonFlux}
        sunspotNumber={data.sunspotNumber}
      />

      {/* X-ray Flux Chart */}
      <XrayFluxChart data={data.xrayFlux} />

      {/* Recent Solar Flares */}
      <SolarFlaresSection flares={data.solarFlares} />

      {/* WSA-Enlil Animation */}
      <EnlilAnimationPlayer animation={data.enlilAnimation} />

      {/* LASCO C3 Coronograph */}
      <LascoCoronograph imageUrl={data.lascoImage} />
    </div>
  )
}

// KP Index Historical Bar Graph
function KpIndexChart({ data }) {
  if (!data || data.length === 0) {
    return <LoadingCard title="KP Index (24 Hours)" />
  }

  console.log('[KpIndexChart] Total data points:', data.length)
  console.log('[KpIndexChart] First 3 items:', data.slice(0, 3))
  console.log('[KpIndexChart] Sample KP values:', data.slice(0, 10).map(d => d.kp))

  // Get last 24 hours of data
  const now = new Date()
  const last24h = data.filter(d => (now - d.time) <= 24 * 60 * 60 * 1000)

  console.log('[KpIndexChart] Last 24h data points:', last24h.length)
  if (last24h.length > 0) {
    console.log('[KpIndexChart] Last 24h KP values:', last24h.slice(0, 10).map(d => d.kp))
  }

  // If no data in last 24h, show error
  if (last24h.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-xl font-semibold mb-2">KP Index (24 Hours)</h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No recent KP index data available
        </p>
      </div>
    )
  }

  // Sample data to show ~12 bars (every 2 hours for 24 hours)
  const sampledData = []
  const step = Math.max(1, Math.floor(last24h.length / 12))
  for (let i = 0; i < last24h.length; i += step) {
    sampledData.push(last24h[i])
  }

  const latestKp = data[data.length - 1]?.kp || 0
  console.log('[KpIndexChart] Latest KP value:', latestKp, 'from item:', data[data.length - 1])

  const getKpColor = (kp) => {
    if (kp <= 2) return 'bg-green-500'
    if (kp <= 4) return 'bg-yellow-500'
    if (kp <= 6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getKpLabel = (kp) => {
    if (kp <= 2) return 'Quiet'
    if (kp <= 4) return 'Unsettled'
    if (kp <= 6) return 'Active'
    if (kp <= 8) return 'Storm'
    return 'Severe Storm'
  }

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">KP Index (24 Hours)</h3>
        <div className="text-right">
          <div className="text-3xl font-bold">{latestKp.toFixed(1)}</div>
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
            {getKpLabel(latestKp)}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-48">
        {sampledData.map((item, idx) => {
          const height = Math.max(8, (item.kp / 9) * 100) // Minimum 8% height for visibility
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div
                  className={`w-full rounded-t ${getKpColor(item.kp)} transition-all`}
                  style={{ height: `${height}%` }}
                  title={`KP ${item.kp.toFixed(1)} at ${item.time.toLocaleTimeString()}`}
                />
              </div>
              <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                {item.time.getHours()}:00
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-macos-text-secondary-light dark:text-macos-text-secondary">Quiet (0-2)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-macos-text-secondary-light dark:text-macos-text-secondary">Unsettled (3-4)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-macos-text-secondary-light dark:text-macos-text-secondary">Active (5-6)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-macos-text-secondary-light dark:text-macos-text-secondary">Storm (7-9)</span>
        </div>
      </div>
    </div>
  )
}

// Active Alerts Section
function AlertsSection({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Active Alerts
        </h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No active space weather alerts
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Active Alerts</h3>
      {alerts.slice(0, 5).map((alert, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                {alert.product}
              </div>
              <p className="text-sm whitespace-pre-wrap">{alert.message}</p>
            </div>
            <div className="text-right text-xs text-macos-text-secondary-light dark:text-macos-text-secondary whitespace-nowrap">
              {alert.issueTime.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Solar Activity Stats
function SolarActivityStats({ solarWind, xrayFlux, protonFlux, sunspotNumber }) {
  console.log('[SolarActivityStats] Solar wind:', solarWind)
  console.log('[SolarActivityStats] Proton flux:', protonFlux)
  console.log('[SolarActivityStats] Sunspot:', sunspotNumber)

  const latestXray = xrayFlux && xrayFlux.length > 0 ? xrayFlux[xrayFlux.length - 1] : null

  // Convert flux to class
  const getXrayClass = (flux) => {
    if (!flux || flux <= 0) return 'A0.0'
    const log = Math.log10(flux)
    if (log < -8) return 'A' + (flux * 1e8).toFixed(1)
    if (log < -7) return 'B' + (flux * 1e7).toFixed(1)
    if (log < -6) return 'C' + (flux * 1e6).toFixed(1)
    if (log < -5) return 'M' + (flux * 1e5).toFixed(1)
    return 'X' + (flux * 1e4).toFixed(1)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Solar Wind"
        value={solarWind?.speed?.toFixed(0) || '--'}
        unit="km/s"
      />
      <StatCard
        title="X-Ray Flux"
        value={latestXray ? getXrayClass(latestXray.flux) : '--'}
        unit="Class"
      />
      <StatCard
        title="Proton Flux"
        value={protonFlux?.flux ? protonFlux.flux.toFixed(1) : '--'}
        unit="pfu"
      />
      <StatCard
        title="Sunspot Number"
        value={sunspotNumber?.count || '--'}
        unit="spots"
      />
    </div>
  )
}

function StatCard({ title, value, unit }) {
  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border text-center">
      <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
        {title}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
        {unit}
      </div>
    </div>
  )
}

// X-ray Flux Chart
function XrayFluxChart({ data }) {
  if (!data || data.length === 0) {
    return <LoadingCard title="X-Ray Flux (6 Hours)" />
  }

  // Sample data to show ~50 points
  const sampledData = []
  const step = Math.max(1, Math.floor(data.length / 50))
  for (let i = 0; i < data.length; i += step) {
    sampledData.push(data[i])
  }

  const maxFlux = Math.max(...sampledData.map(d => d.flux))
  const minFlux = Math.min(...sampledData.map(d => d.flux))

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
      <h3 className="text-xl font-semibold mb-4">X-Ray Flux (6 Hours)</h3>

      <div className="relative h-48">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-blue-500"
            points={sampledData.map((d, i) => {
              const x = (i / (sampledData.length - 1)) * 100
              const y = 100 - ((Math.log10(d.flux) - Math.log10(minFlux)) / (Math.log10(maxFlux) - Math.log10(minFlux))) * 100
              return `${x},${y}`
            }).join(' ')}
          />
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
        <span>{sampledData[0]?.time.toLocaleTimeString()}</span>
        <span>6-Hour History</span>
        <span>{sampledData[sampledData.length - 1]?.time.toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

// Solar Flares Section
function SolarFlaresSection({ flares }) {
  console.log('[SolarFlaresSection] Flares data:', flares)

  if (!flares || flares.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-xl font-semibold mb-2">Recent Solar Flares</h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No recent solar flares detected
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Recent Solar Flares</h3>
      <div className="space-y-3">
        {flares.slice(0, 5).map((flare, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">Class {flare.classType}</div>
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                {flare.sourceLocation}
                {flare.activeRegion && ` • Region ${flare.activeRegion}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {flare.maxTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
                {flare.maxTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// WSA-Enlil Animation Player
function EnlilAnimationPlayer({ animation }) {
  console.log('[EnlilAnimationPlayer] Animation data:', animation)

  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || !animation?.imageUrls?.length) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % animation.imageUrls.length)
    }, 500) // 500ms per frame

    return () => clearInterval(interval)
  }, [playing, animation])

  if (!animation || !animation.imageUrls || animation.imageUrls.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
        <h3 className="text-xl font-semibold mb-2">WSA-Enlil Solar Wind Prediction</h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No active CME predictions available
        </p>
      </div>
    )
  }

  const modelTime = new Date(animation.modelCompletionTime)

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">WSA-Enlil Solar Wind Prediction</h3>
        <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
          Model: {modelTime.toLocaleString()}
        </div>
      </div>

      <div className="relative bg-black rounded-xl overflow-hidden">
        <img
          src={animation.imageUrls[currentFrame]}
          alt={`Enlil frame ${currentFrame + 1}`}
          className="w-full h-auto"
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setPlaying(!playing)}
            className="px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 transition-colors"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <div className="flex-1 text-center text-white text-sm font-medium bg-black/50 rounded px-2 py-1">
            Frame {currentFrame + 1} / {animation.imageUrls.length}
          </div>
        </div>
      </div>
    </div>
  )
}

// LASCO C3 Coronograph
function LascoCoronograph({ imageUrl }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!imageUrl) {
    return <LoadingCard title="LASCO C3 Coronograph" />
  }

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">LASCO C3 Coronograph</h3>
        <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
          SOHO Satellite • Real-time
        </div>
      </div>

      <div className="relative bg-black rounded-xl overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        {imageError ? (
          <div className="aspect-square flex items-center justify-center text-macos-text-secondary-light dark:text-macos-text-secondary">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Failed to load coronograph image</p>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="LASCO C3 Coronograph"
            className="w-full h-auto"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Loading Card Component
function LoadingCard({ title }) {
  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
}

export default SpaceWeatherView
