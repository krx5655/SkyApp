import { useState, useEffect } from 'react'
import { searchCities } from '../../services/geocoding/geocodingService'
import weatherService from '../../services/weather/weatherService'
import { clearAllCache } from '../../services/weather/cache'
import { getOpenWeatherApiKey, setOpenWeatherApiKey, getSelectedAdapter, setSelectedAdapter, hasOpenWeatherApiKey, getTemperatureUnit, setTemperatureUnit, getWindSpeedUnit, setWindSpeedUnit, getRadarProvider, setRadarProvider } from '../../services/weather/config'
import radarService from '../../services/radar/radarService'

const CATEGORIES = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'location',
    label: 'Location',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'units',
    label: 'Units',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    id: 'updates',
    label: 'Updates',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'exit',
    label: 'Exit',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  },
]

function SettingsModal({ onClose, theme, onToggleTheme, onLocationChange }) {
  const [activeCategory, setActiveCategory] = useState('appearance')
  const [citySearch, setCitySearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [updatingLocation, setUpdatingLocation] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyStatus, setApiKeyStatus] = useState('')
  const [selectedApi, setSelectedApi] = useState('openweather')
  const [temperatureUnit, setTemperatureUnitState] = useState('F')
  const [windSpeedUnit, setWindSpeedUnitState] = useState('mph')
  const [radarProvider, setRadarProviderState] = useState('noaa')
  const [updateStatus, setUpdateStatus] = useState('idle') // idle | checking | up-to-date | available | updating | error
  const [updateCommitCount, setUpdateCommitCount] = useState(0)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    const location = weatherService.getLocation()
    setCurrentLocation(location)

    const savedKey = getOpenWeatherApiKey()
    if (savedKey) {
      setApiKey(savedKey)
      setApiKeyStatus('saved')
    }

    const adapter = getSelectedAdapter()
    setSelectedApi(adapter)

    const tempUnit = getTemperatureUnit()
    setTemperatureUnitState(tempUnit)

    const windUnit = getWindSpeedUnit()
    setWindSpeedUnitState(windUnit)

    const radar = getRadarProvider()
    setRadarProviderState(radar)
  }, [])

  useEffect(() => {
    if (citySearch.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true)
        const results = await searchCities(citySearch)
        setSearchResults(results)
      } catch (error) {
        console.error('City search error:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [citySearch])

  async function selectLocation(location) {
    setUpdatingLocation(true)
    weatherService.setLocation(location.latitude, location.longitude, location.city)
    setCurrentLocation({ latitude: location.latitude, longitude: location.longitude, name: location.city })
    setCitySearch('')
    setSearchResults([])
    clearAllCache()
    if (onLocationChange) onLocationChange()
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUpdatingLocation(false)
  }

  function saveApiKey() {
    if (apiKey.trim()) {
      const success = setOpenWeatherApiKey(apiKey.trim())
      if (success) {
        setApiKeyStatus('success')
        weatherService.initializeAdapters()
        clearAllCache()
        if (onLocationChange) onLocationChange()
        setTimeout(() => setApiKeyStatus('saved'), 2000)
      } else {
        setApiKeyStatus('error')
      }
    }
  }

  function removeApiKey() {
    setOpenWeatherApiKey(null)
    setApiKey('')
    setApiKeyStatus('')
    setSelectedApi('weathergov')
    setSelectedAdapter('weathergov')
    weatherService.switchAdapter('weathergov')
    clearAllCache()
    if (onLocationChange) onLocationChange()
  }

  function handleApiProviderChange(provider) {
    setSelectedApi(provider)
    setSelectedAdapter(provider)
    weatherService.switchAdapter(provider)
    clearAllCache()
    if (onLocationChange) onLocationChange()
  }

  function handleTemperatureUnitChange(unit) {
    setTemperatureUnitState(unit)
    setTemperatureUnit(unit)
    if (onLocationChange) onLocationChange()
  }

  function handleWindSpeedUnitChange(unit) {
    setWindSpeedUnitState(unit)
    setWindSpeedUnit(unit)
    if (onLocationChange) onLocationChange()
  }

  function handleRadarProviderChange(provider) {
    setRadarProviderState(provider)
    setRadarProvider(provider)
    radarService.switchProvider(provider)
    radarService.refresh()
  }

  async function handleCheckForUpdates() {
    setUpdateStatus('checking')
    try {
      const result = await window.electron.checkForUpdates()
      if (result.error) {
        setUpdateError(result.error)
        setUpdateStatus('error')
      } else if (result.hasUpdates) {
        setUpdateCommitCount(result.commitCount)
        setUpdateStatus('available')
      } else {
        setUpdateStatus('up-to-date')
      }
    } catch (err) {
      setUpdateError('Update check failed. Is the app running in Electron?')
      setUpdateStatus('error')
    }
  }

  async function handlePerformUpdate() {
    setUpdateStatus('updating')
    try {
      const result = await window.electron.performUpdate()
      if (!result.success) {
        setUpdateError(result.error)
        setUpdateStatus('error')
      }
    } catch (err) {
      setUpdateError('Update failed unexpectedly.')
      setUpdateStatus('error')
    }
  }

  function renderContent() {
    switch (activeCategory) {
      case 'appearance':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="touch-target px-4 py-2 rounded-lg bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white hover:opacity-90 transition-opacity"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-4">
            {updatingLocation && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <div className="text-blue-600 dark:text-blue-400 font-medium">Updating weather...</div>
              </div>
            )}

            {currentLocation && (
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="font-medium mb-1">Current Location</div>
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  {currentLocation.name || 'Custom Location'}
                </div>
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
                  {currentLocation.latitude.toFixed(4)}° N, {Math.abs(currentLocation.longitude).toFixed(4)}° {currentLocation.longitude < 0 ? 'W' : 'E'}
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Search for a city..."
                className="w-full px-4 py-3 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted"
              />
              {(searching || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-56 overflow-y-auto rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border shadow-xl z-10">
                  {searching ? (
                    <div className="p-4 text-center text-macos-text-secondary-light dark:text-macos-text-secondary">
                      Searching...
                    </div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => selectLocation(result)}
                        className="w-full p-4 text-left hover:bg-macos-bg-light dark:hover:bg-macos-bg transition-colors border-b border-macos-border-light dark:border-macos-border last:border-b-0"
                      >
                        <div className="font-medium">{result.city}</div>
                        <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                          {result.state && `${result.state}, `}{result.country}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'units':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Temperature</span>
                <select
                  value={temperatureUnit}
                  onChange={(e) => handleTemperatureUnitChange(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted"
                >
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="C">Celsius (°C)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Wind Speed</span>
                <select
                  value={windSpeedUnit}
                  onChange={(e) => handleWindSpeedUnitChange(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted"
                >
                  <option value="mph">Miles per hour (mph)</option>
                  <option value="kmh">Kilometers per hour (km/h)</option>
                  <option value="ms">Meters per second (m/s)</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'weather':
        return (
          <div className="space-y-4">
            {/* Weather API */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">Weather API</h3>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Provider</span>
                  <select
                    value={selectedApi}
                    onChange={(e) => handleApiProviderChange(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted"
                  >
                    <option value="openweather">
                      OpenWeatherMap {!hasOpenWeatherApiKey() && '(API key required)'}
                    </option>
                    <option value="weathergov">Weather.gov</option>
                  </select>
                </div>

                {selectedApi === 'openweather' && (
                  <div className="pt-2 border-t border-macos-border-light dark:border-macos-border space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value)
                          setApiKeyStatus('')
                        }}
                        placeholder="Enter your API key"
                        className="flex-1 px-4 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted text-sm"
                      />
                      <button
                        onClick={saveApiKey}
                        disabled={!apiKey.trim()}
                        className="px-4 py-2 rounded-lg bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Save
                      </button>
                    </div>
                    {apiKeyStatus === 'success' && (
                      <div className="text-sm text-green-600 dark:text-green-400">✓ API key saved successfully!</div>
                    )}
                    {apiKeyStatus === 'saved' && (
                      <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">API key configured</div>
                    )}
                    {apiKeyStatus === 'error' && (
                      <div className="text-sm text-red-600 dark:text-red-400">Failed to save API key</div>
                    )}
                    {apiKey && (
                      <button onClick={removeApiKey} className="text-sm text-red-600 dark:text-red-400 hover:underline">
                        Remove API key
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Radar Provider */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">Radar Provider</h3>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Radar Data Source</div>
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">Choose your radar provider</div>
                  </div>
                  <select
                    value={radarProvider}
                    onChange={(e) => handleRadarProviderChange(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-muted-light dark:focus:ring-macos-blue-muted"
                  >
                    <option value="noaa">NOAA (US Only)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'updates':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-3">
              <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                Pull the latest version from GitHub
              </div>

              {updateStatus === 'idle' && (
                <button
                  onClick={handleCheckForUpdates}
                  className="px-4 py-2 rounded-lg bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Check for Updates
                </button>
              )}

              {updateStatus === 'checking' && (
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Checking for updates...
                </div>
              )}

              {updateStatus === 'up-to-date' && (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 dark:text-green-400">✓ App is up to date</div>
                  <button onClick={() => setUpdateStatus('idle')} className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary hover:underline">
                    Check again
                  </button>
                </div>
              )}

              {updateStatus === 'available' && (
                <div className="space-y-3">
                  <div className="text-sm text-macos-blue-muted-light dark:text-macos-blue-muted">
                    Update available ({updateCommitCount} new {updateCommitCount === 1 ? 'commit' : 'commits'}). Install now?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePerformUpdate}
                      className="px-4 py-2 rounded-lg bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Yes, Update
                    </button>
                    <button
                      onClick={() => setUpdateStatus('idle')}
                      className="px-4 py-2 rounded-lg bg-macos-border-light dark:bg-macos-border hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              )}

              {updateStatus === 'updating' && (
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Updating... The app will restart automatically when complete.
                </div>
              )}

              {updateStatus === 'error' && (
                <div className="space-y-2">
                  <div className="text-sm text-red-600 dark:text-red-400">{updateError}</div>
                  <button onClick={() => setUpdateStatus('idle')} className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary hover:underline">
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Severe Weather Alerts</div>
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                      Get notified of dangerous weather
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Astronomical Events</div>
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                      Meteor showers, eclipses, etc.
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )

      case 'exit':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">Data & Cache</h3>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-3">
                  Clear cached weather data to force a fresh refresh
                </div>
                <button
                  onClick={() => {
                    clearAllCache()
                    alert('Cache cleared successfully')
                  }}
                  className="px-4 py-2 rounded-lg bg-macos-border-light dark:bg-macos-border hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">Application</h3>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-3">
                  Quit SkyApp
                </div>
                <button
                  onClick={() => window.electron?.exitApp()}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Exit App
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-macos-card-light dark:bg-macos-card rounded-3xl shadow-2xl border border-macos-border-light dark:border-macos-border overflow-hidden flex flex-col" style={{ height: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-macos-border-light dark:border-macos-border shrink-0">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg hover:bg-macos-border-light dark:hover:bg-macos-border transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 min-h-0">

          {/* Left Sidebar */}
          <nav className="w-44 shrink-0 border-r border-macos-border-light dark:border-macos-border py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden bg-macos-bg-light/50 dark:bg-macos-bg/50">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                  activeCategory === cat.id
                    ? 'bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white'
                    : 'text-macos-text-light dark:text-macos-text hover:bg-macos-border-light dark:hover:bg-macos-border'
                } ${cat.id === 'exit' ? 'mt-auto' : ''}`}
                style={cat.id === 'exit' ? { marginTop: 'auto' } : {}}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Right Content */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderContent()}
            </div>

            {/* Footer with Done button */}
            <div className="shrink-0 px-5 py-3 border-t border-macos-border-light dark:border-macos-border flex justify-end bg-macos-card-light dark:bg-macos-card">
              <button
                onClick={onClose}
                className="touch-target px-6 py-2 rounded-xl bg-macos-blue-muted-light dark:bg-macos-blue-muted text-white font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SettingsModal
