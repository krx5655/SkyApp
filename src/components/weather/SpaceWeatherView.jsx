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

      {/* Charts Row: KP Index + Solar X-ray Flux side by side */}
      <div className="flex gap-4 flex-wrap">
        <KpIndexChart data={data.kpIndex} />
        <SolarXrayFluxChart data={data.xrayFlux} />
      </div>

      {/* Solar Activity Stats Grid */}
      <SolarActivityStats
        solarWind={data.solarWind}
        xrayFlux={data.xrayFlux}
        protonFlux={data.protonFlux}
        sunspotNumber={data.sunspotNumber}
      />

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
    return <LoadingCard title="Geomagnetic Activity" />
  }

  // Get last 3 days (72 hours) of data
  const now = new Date()
  const last72h = data.filter(d => (now - d.time) <= 72 * 60 * 60 * 1000)

  // If no data in last 72h, show error
  if (last72h.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex-1 min-w-0">
        <h3 className="text-xl font-semibold mb-2">Geomagnetic Activity</h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No recent KP index data available
        </p>
      </div>
    )
  }

  // Sample data to show ~24 bars (8 per day for 3 days)
  const sampledData = []
  const step = Math.max(1, Math.floor(last72h.length / 24))
  for (let i = 0; i < last72h.length; i += step) {
    sampledData.push(last72h[i])
  }

  // Compute day boundaries for vertical gridlines and date labels
  const kpDayBoundaries = []
  let currentKpDay = null
  sampledData.forEach((item, idx) => {
    const dayStr = item.time.toDateString()
    if (dayStr !== currentKpDay) {
      currentKpDay = dayStr
      kpDayBoundaries.push({
        idx,
        xPct: (idx / sampledData.length) * 100,
        label: item.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }
  })

  // Returns Kp notation with +/- suffix for values >= 4
  const getKpNotation = (kp) => {
    const base = Math.floor(kp)
    const frac = kp - base
    if (frac <= 0.2) return `${base}`
    if (frac <= 0.7) return `${base}+`
    return `${base + 1}-`
  }

  const latestKp = data[data.length - 1]?.kp || 0

  // Get G-scale color based on KP value (NOAA standard)
  const getKpColor = (kp) => {
    if (kp >= 9) return '#c00000'  // G5: Dark red
    if (kp >= 8) return '#ff0000'  // G4: Red
    if (kp >= 7) return '#ed7d31'  // G3: Dark orange
    if (kp >= 6) return '#ffc000'  // G2: Light orange
    if (kp >= 5) return '#ffff00'  // G1: Yellow
    return '#92d050'               // G0: Light green
  }

  const getKpLabel = (kp) => {
    if (kp <= 2) return 'Quiet'
    if (kp <= 4) return 'Unsettled'
    if (kp <= 6) return 'Active'
    if (kp <= 8) return 'Storm'
    return 'Severe Storm'
  }

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Geomagnetic Activity</h3>
        <div className="text-right">
          <div className="text-3xl font-bold">{latestKp.toFixed(1)}</div>
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
            {getKpLabel(latestKp)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-start">
        {/* Vertical "Kp Index" label */}
        <div className="flex items-center justify-center h-48" style={{ width: '20px' }}>
          <span className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary whitespace-nowrap transform -rotate-90">
            Kp Index
          </span>
        </div>

        {/* Y-axis labels (1-9) — absolutely positioned to align with gridlines */}
        <div className="relative h-48 text-xs text-macos-text-secondary-light dark:text-macos-text-secondary pr-2" style={{ width: '14px' }}>
          {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((val) => (
            <span
              key={val}
              className="absolute"
              style={{ top: `${(1 - val / 9) * 100}%`, transform: 'translateY(-50%)' }}
            >
              {val}
            </span>
          ))}
        </div>

        {/* Chart area + date labels below */}
        <div className="flex-1 relative">
          {/* Chart - fixed height */}
          <div className="relative h-48">
            {/* Bars - in background */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {sampledData.map((item, idx) => {
                const height = (item.kp / 9) * 100
                const barColor = getKpColor(item.kp)
                return (
                  <div key={idx} className="flex-1 h-full flex flex-col justify-end relative">
                    {item.kp >= 4 && (
                      <div
                        className="absolute left-0 right-0 text-center text-[11px] font-bold text-gray-900 dark:text-white leading-none"
                        style={{ bottom: `calc(${height}% + 4px)` }}
                      >
                        {getKpNotation(item.kp)}
                      </div>
                    )}
                    <div
                      className="w-full transition-all"
                      style={{ height: `${height}%`, backgroundColor: barColor }}
                      title={`KP ${item.kp.toFixed(1)} at ${item.time.toLocaleString()}`}
                    />
                  </div>
                )
              })}
            </div>

            {/* Horizontal gridlines and vertical day separators — foreground */}
            <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
              {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((val) => (
                <div
                  key={val}
                  className="absolute left-0 right-0 border-t border-gray-300 dark:border-gray-600"
                  style={{ top: `${(1 - val / 9) * 100}%`, opacity: 0.3 }}
                />
              ))}
              {kpDayBoundaries.slice(1).map(({ xPct, label }) => (
                <div
                  key={label}
                  className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600"
                  style={{ left: `${xPct}%`, opacity: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Date labels — aligned with vertical day gridlines */}
          <div className="relative h-5 mt-1">
            {kpDayBoundaries.map(({ xPct, label }) => (
              <div
                key={label}
                className="absolute text-[10px] text-macos-text-secondary-light dark:text-macos-text-secondary whitespace-nowrap"
                style={{ left: `${xPct}%`, transform: 'translateX(-50%)' }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* G-scale (geomagnetic storm scale) - aligned with gridlines */}
        <div className="flex flex-col h-48 w-12 ml-2">
          <div className="flex items-center justify-center text-[10px] font-semibold text-white border border-gray-400/20" style={{ backgroundColor: '#c00000', height: '11.11%' }}>G5</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-white border border-gray-400/20" style={{ backgroundColor: '#ff0000', height: '11.11%' }}>G4</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-white border border-gray-400/20" style={{ backgroundColor: '#ed7d31', height: '11.11%' }}>G3</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-black border border-gray-400/20" style={{ backgroundColor: '#ffc000', height: '11.11%' }}>G2</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-black border border-gray-400/20" style={{ backgroundColor: '#ffff00', height: '11.11%' }}>G1</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-black border border-gray-400/20" style={{ backgroundColor: '#92d050', height: '44.44%' }}>G0</div>
        </div>
      </div>
    </div>
  )
}

// Solar Activity Stats
function SolarActivityStats({ solarWind, xrayFlux, protonFlux, sunspotNumber }) {
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

// Solar X-ray Flux Chart (NOAA-style, replaces old XrayFluxChart)
function SolarXrayFluxChart({ data }) {
  const MIN_LOG = -9  // 10^-9 W/m² (below A class)
  const MAX_LOG = -2  // 10^-2 W/m² (above X20)
  const LOG_RANGE = MAX_LOG - MIN_LOG // 7 decades

  // Helper: log-scale y position (0% = top = highest flux, 100% = bottom = lowest)
  const fluxToY = (flux) => {
    const logFlux = Math.log10(Math.max(flux, Math.pow(10, MIN_LOG)))
    return Math.max(0, Math.min(100, ((MAX_LOG - logFlux) / LOG_RANGE) * 100))
  }

  // Flare class label from flux
  const getFluxClass = (flux) => {
    if (!flux || flux <= 0) return '--'
    const log = Math.log10(flux)
    if (log < -8) return `A${(flux * 1e8).toFixed(1)}`
    if (log < -7) return `B${(flux * 1e7).toFixed(1)}`
    if (log < -6) return `C${(flux * 1e6).toFixed(1)}`
    if (log < -5) return `M${(flux * 1e5).toFixed(1)}`
    return `X${(flux * 1e4).toFixed(1)}`
  }

  const getFluxLabel = (flux) => {
    if (!flux || flux <= 0) return 'No data'
    const log = Math.log10(flux)
    if (log < -7) return 'Normal'
    if (log < -6) return 'Moderate'
    if (log < -5) return 'Active'
    if (log < -4) return 'M-class flare'
    return 'X-class flare'
  }

  if (!data || data.length === 0) {
    return <LoadingCard title="Solar X-ray Flux" />
  }

  // Filter to last 72 hours
  const now = new Date()
  const last72h = data.filter(d => (now - d.time) <= 72 * 60 * 60 * 1000)

  if (last72h.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex-1 min-w-0">
        <h3 className="text-xl font-semibold mb-2">Solar X-ray Flux</h3>
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          No recent X-ray flux data available
        </p>
      </div>
    )
  }

  // Sample to ~300 points for smooth SVG rendering
  const sampledData = []
  const step = Math.max(1, Math.floor(last72h.length / 300))
  for (let i = 0; i < last72h.length; i += step) {
    sampledData.push(last72h[i])
  }

  // Build SVG points
  const svgPoints = sampledData.map((item, idx) => ({
    x: (idx / Math.max(sampledData.length - 1, 1)) * 100,
    y: fluxToY(item.flux),
    time: item.time
  }))

  // SVG path strings
  const linePath = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const fillPath = linePath +
    ` L ${svgPoints[svgPoints.length - 1].x},100 L ${svgPoints[0].x},100 Z`

  // Find day boundaries for date labels and vertical lines
  const dayBoundaries = []
  let currentDay = null
  sampledData.forEach((item, idx) => {
    const dayStr = item.time.toDateString()
    if (dayStr !== currentDay) {
      currentDay = dayStr
      dayBoundaries.push({
        idx,
        xPct: (idx / Math.max(sampledData.length - 1, 1)) * 100,
        label: item.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }
  })

  const latestFlux = last72h[last72h.length - 1]?.flux || 0

  // Gradient color stops (y% from top = high flux to bottom = low flux)
  // R5/R4 boundary (X20 = 10^-2.699):  y = 9.99%
  // R4/R3 boundary (X10 = 10^-3):      y = 14.29%
  // R3/R2 boundary (X1  = 10^-4):      y = 28.57%
  // R2/R1 boundary (M5  = 10^-4.301):  y = 32.87%
  // R1/R0 boundary (M1  = 10^-5):      y = 42.86%

  // R-scale box heights (proportional to log-scale ranges)
  // R5: 9.99% | R4: 4.30% | R3: 14.28% | R2: 4.30% | R1: 9.99% | R0: 57.14%

  return (
    <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Solar X-ray Flux</h3>
        <div className="text-right">
          <div className="text-3xl font-bold">{getFluxClass(latestFlux)}</div>
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
            {getFluxLabel(latestFlux)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        {/* Vertical "Flare Class" label */}
        <div className="flex items-center justify-center h-48" style={{ width: '20px' }}>
          <span className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary whitespace-nowrap transform -rotate-90">
            Flare Class
          </span>
        </div>

        {/* Y-axis labels: X, M, C, B, A — bordered boxes aligned to log-scale, NOAA-style */}
        <div className="relative h-48" style={{ width: '16px' }}>
          {[
            { label: 'X', logTop: -2, logBottom: -4 },
            { label: 'M', logTop: -4, logBottom: -5 },
            { label: 'C', logTop: -5, logBottom: -6 },
            { label: 'B', logTop: -6, logBottom: -7 },
            { label: 'A', logTop: -7, logBottom: -8 },
          ].map(({ label, logTop, logBottom }) => {
            const top = ((MAX_LOG - logTop) / LOG_RANGE) * 100
            const height = ((logTop - logBottom) / LOG_RANGE) * 100
            return (
              <div
                key={label}
                className="absolute flex items-center justify-center text-[9px] font-bold border border-gray-400/30 text-macos-text-secondary-light dark:text-macos-text-secondary"
                style={{ top: `${top}%`, height: `${height}%`, width: '100%' }}
              >
                {label}
              </div>
            )
          })}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative h-48">
          {/* SVG: filled area + line */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="xrayFillGradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c00000" />
                <stop offset="9.99%" stopColor="#ff0000" />
                <stop offset="14.29%" stopColor="#ed7d31" />
                <stop offset="28.57%" stopColor="#ffc000" />
                <stop offset="32.87%" stopColor="#ffff00" />
                <stop offset="42.86%" stopColor="#92d050" />
                <stop offset="100%" stopColor="#92d050" />
              </linearGradient>
            </defs>
            {/* Filled area */}
            <path d={fillPath} fill="url(#xrayFillGradient)" opacity="0.85" />
            {/* Line on top */}
            <path d={linePath} fill="none" stroke="#1a1a1a" strokeWidth="0.3" />
          </svg>

          {/* Gridlines — foreground */}
          <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
            {/* Horizontal gridlines at each log decade */}
            {[-8, -7, -6, -5, -4, -3].map((logVal) => (
              <div
                key={logVal}
                className="absolute left-0 right-0 border-t border-gray-300 dark:border-gray-600"
                style={{ top: `${((MAX_LOG - logVal) / LOG_RANGE) * 100}%`, opacity: 0.3 }}
              />
            ))}
            {/* Additional R-scale boundary gridlines: R5/R4 (X20) and R2/R1 (M5) */}
            {[9.99, 32.87].map((topPct) => (
              <div
                key={topPct}
                className="absolute left-0 right-0 border-t border-gray-300 dark:border-gray-600"
                style={{ top: `${topPct}%`, opacity: 0.3 }}
              />
            ))}
            {/* Vertical day separators */}
            {dayBoundaries.slice(1).map(({ xPct, label }) => (
              <div
                key={label}
                className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600"
                style={{ left: `${xPct}%`, opacity: 0.3 }}
              />
            ))}
          </div>

          {/* X-axis date labels */}
          {dayBoundaries.map(({ xPct, label }) => (
            <div
              key={label}
              className="absolute text-[10px] text-macos-text-secondary-light dark:text-macos-text-secondary whitespace-nowrap"
              style={{ left: `${xPct}%`, bottom: '-20px', transform: 'translateX(-50%)' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* R-scale — aligned with log-scale gridlines */}
        <div className="flex flex-col h-48 w-12 ml-2">
          <div className="flex items-center justify-center text-[10px] font-semibold text-white border border-gray-400/20" style={{ backgroundColor: '#c00000', height: '9.99%' }}>R5</div>
          <div className="border border-gray-400/20" style={{ backgroundColor: '#ff0000', height: '4.30%' }}></div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-white border border-gray-400/20" style={{ backgroundColor: '#ed7d31', height: '14.28%' }}>R3</div>
          <div className="border border-gray-400/20" style={{ backgroundColor: '#ffc000', height: '4.30%' }}></div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-black border border-gray-400/20" style={{ backgroundColor: '#ffff00', height: '9.99%' }}>R1</div>
          <div className="flex items-center justify-center text-[10px] font-semibold text-black border border-gray-400/20" style={{ backgroundColor: '#92d050', height: '57.14%' }}>R0</div>
        </div>
      </div>
    </div>
  )
}

// Solar Flares Section
function SolarFlaresSection({ flares }) {
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
