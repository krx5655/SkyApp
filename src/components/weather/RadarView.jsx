import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import radarService from '../../services/radar/radarService'
import weatherService from '../../services/weather/weatherService'
import { RADAR_LAYER_TYPES, DEFAULT_RADAR_CENTER, DEFAULT_ANIMATION_SPEED } from '../../services/radar/types'

// Component to handle map updates
function MapController({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center && zoom) {
      map.setView([center.lat, center.lon], zoom)
    }
  }, [center, zoom, map])

  return null
}

// Custom radar overlay component that updates with animation
function RadarOverlay({ frame, layerType }) {
  const map = useMap()
  const [bounds, setBounds] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (!map) return

    // Get current map bounds
    const mapBounds = map.getBounds()
    const bounds = [
      [mapBounds.getSouth(), mapBounds.getWest()],
      [mapBounds.getNorth(), mapBounds.getEast()],
    ]
    setBounds(bounds)

    // Build NOAA image export URL
    if (frame && frame.url) {
      const bbox = `${mapBounds.getWest()},${mapBounds.getSouth()},${mapBounds.getEast()},${mapBounds.getNorth()}`
      const size = `${map.getSize().x},${map.getSize().y}`

      const params = new URLSearchParams({
        bbox: bbox,
        bboxSR: '4326',
        size: size,
        imageSR: '4326',
        time: frame.time || Date.now(),
        format: 'png',
        pixelType: 'U8',
        noData: '0',
        noDataInterpretation: 'esriNoDataMatchAny',
        interpolation: '+RSP_BilinearInterpolation',
        compression: '',
        compressionQuality: '',
        bandIds: '',
        mosaicRule: '',
        renderingRule: '',
        f: 'image',
        transparent: 'true',
      })

      const url = `${frame.url}?${params.toString()}`
      setImageUrl(url)
    }
  }, [frame, map])

  if (!bounds || !imageUrl) return null

  return <ImageOverlay url={imageUrl} bounds={bounds} opacity={0.7} zIndex={200} />
}

function RadarView() {
  const [frames, setFrames] = useState([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [layerType, setLayerType] = useState(RADAR_LAYER_TYPES.PRECIPITATION)
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_ANIMATION_SPEED)
  const [mapCenter, setMapCenter] = useState(DEFAULT_RADAR_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_RADAR_CENTER.zoom)
  const animationTimerRef = useRef(null)

  // Load user's location for map center
  useEffect(() => {
    const location = weatherService.getLocation()
    if (location && location.latitude && location.longitude) {
      setMapCenter({
        lat: location.latitude,
        lon: location.longitude,
        zoom: 7,
      })
      setMapZoom(7)
    }
  }, [])

  // Load radar frames
  const loadRadarFrames = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const radarFrames = await radarService.getTimeFrames(4) // 4 hours of history

      if (radarFrames && radarFrames.length > 0) {
        setFrames(radarFrames)
        setCurrentFrameIndex(radarFrames.length - 1) // Start with most recent
      } else {
        setError('No radar data available')
      }
    } catch (err) {
      console.error('Failed to load radar frames:', err)
      setError('Failed to load radar data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRadarFrames()
  }, [loadRadarFrames])

  // Animation loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const intervalMs = 1000 / animationSpeed
      animationTimerRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = prevIndex + 1
          // Loop back to start when reaching the end
          return nextIndex >= frames.length ? 0 : nextIndex
        })
      }, intervalMs)

      return () => {
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current)
        }
      }
    }
  }, [isPlaying, frames.length, animationSpeed])

  // Handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevFrame = () => {
    setIsPlaying(false)
    setCurrentFrameIndex((prevIndex) => {
      const newIndex = prevIndex - 1
      return newIndex < 0 ? frames.length - 1 : newIndex
    })
  }

  const handleNextFrame = () => {
    setIsPlaying(false)
    setCurrentFrameIndex((prevIndex) => {
      const newIndex = prevIndex + 1
      return newIndex >= frames.length ? 0 : newIndex
    })
  }

  const handleLayerTypeChange = (newLayerType) => {
    setLayerType(newLayerType)
    radarService.setLayerType(newLayerType)
    loadRadarFrames()
  }

  const handleSpeedChange = (speed) => {
    setAnimationSpeed(parseFloat(speed))
  }

  const handleRefresh = () => {
    radarService.refresh()
    loadRadarFrames()
  }

  const currentFrame = frames[currentFrameIndex]
  const availableLayerTypes = radarService.getAvailableLayerTypes()

  return (
    <div className="p-6 space-y-6">
      {/* Layer Type Toggle */}
      {availableLayerTypes.length > 1 && (
        <div className="flex justify-center gap-2">
          {availableLayerTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleLayerTypeChange(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                layerType === type
                  ? 'bg-macos-blue-light dark:bg-macos-blue text-white'
                  : 'bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border hover:bg-macos-bg-light dark:hover:bg-macos-bg'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Radar Map */}
      <div className="relative rounded-2xl overflow-hidden bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border aspect-video max-w-4xl mx-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-macos-bg-light dark:bg-macos-bg z-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-macos-blue-light dark:border-macos-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">Loading radar...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-macos-bg-light dark:bg-macos-bg z-50">
            <div className="text-center text-red-600 dark:text-red-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-macos-blue-light dark:bg-macos-blue text-white rounded-lg hover:opacity-90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <MapContainer
            center={[mapCenter.lat, mapCenter.lon]}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Base map tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.6}
            />

            {/* Radar overlay */}
            {currentFrame && <RadarOverlay frame={currentFrame} layerType={layerType} />}
          </MapContainer>
        )}

        {/* Radar Controls */}
        {!isLoading && !error && frames.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={handlePrevFrame}
                className="touch-target p-3 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
                aria-label="Previous frame"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                className="touch-target p-3 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextFrame}
                className="touch-target p-3 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
                aria-label="Next frame"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-lg font-medium min-w-[140px] text-center">
                {currentFrame?.timeString || 'Now'}
              </div>

              <button
                onClick={handleRefresh}
                className="touch-target p-3 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
                aria-label="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-white text-sm bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">Speed:</span>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={animationSpeed}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="w-32"
              />
              <span className="text-white text-sm bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg min-w-[60px] text-center">
                {animationSpeed}x
              </span>
            </div>

            {/* Timeline */}
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max={frames.length - 1}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false)
                  setCurrentFrameIndex(parseInt(e.target.value))
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {layerType === RADAR_LAYER_TYPES.PRECIPITATION && (
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { label: 'Light', color: 'bg-green-400' },
            { label: 'Moderate', color: 'bg-yellow-400' },
            { label: 'Heavy', color: 'bg-orange-400' },
            { label: 'Severe', color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-center text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
        <p>Radar data provided by {radarService.getProviderName()}</p>
        <p className="mt-1">Showing {frames.length} frames from the past 4 hours</p>
      </div>
    </div>
  )
}

export default RadarView
