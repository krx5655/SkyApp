import { useState, useEffect } from 'react'
import { searchCities } from '../../services/geocoding/geocodingService'
import weatherService from '../../services/weather/weatherService'
import { clearAllCache } from '../../services/weather/cache'
import { getOpenWeatherApiKey, setOpenWeatherApiKey, getSelectedAdapter, setSelectedAdapter, hasOpenWeatherApiKey, getTemperatureUnit, setTemperatureUnit, getWindSpeedUnit, setWindSpeedUnit, getRadarProvider, setRadarProvider } from '../../services/weather/config'
import radarService from '../../services/radar/radarService'

function SettingsModal({ onClose, theme, onToggleTheme, onLocationChange }) {
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

  // Load current location, API key, and selected adapter
  useEffect(() => {
    const location = weatherService.getLocation()
    setCurrentLocation(location)

    // Load saved API key
    const savedKey = getOpenWeatherApiKey()
    if (savedKey) {
      setApiKey(savedKey)
      setApiKeyStatus('saved')
    }

    // Load selected adapter
    const adapter = getSelectedAdapter()
    setSelectedApi(adapter)

    // Load unit preferences
    const tempUnit = getTemperatureUnit()
    setTemperatureUnitState(tempUnit)

    const windUnit = getWindSpeedUnit()
    setWindSpeedUnitState(windUnit)

    // Load radar provider
    const radar = getRadarProvider()
    setRadarProviderState(radar)
  }, [])

  // Search cities
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
    }, 500) // Debounce

    return () => clearTimeout(timer)
  }, [citySearch])

  // Select location
  async function selectLocation(location) {
    setUpdatingLocation(true)
    weatherService.setLocation(location.latitude, location.longitude, location.city)
    setCurrentLocation({ latitude: location.latitude, longitude: location.longitude, name: location.city })
    setCitySearch('')
    setSearchResults([])

    // Clear cache to force refetch with new location
    clearAllCache()

    // Trigger refresh in parent components
    if (onLocationChange) {
      onLocationChange()
    }

    // Show updating state for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUpdatingLocation(false)
  }

  // Save OpenWeatherMap API key
  function saveApiKey() {
    if (apiKey.trim()) {
      const success = setOpenWeatherApiKey(apiKey.trim())
      if (success) {
        setApiKeyStatus('success')
        // Reinitialize adapters with new API key
        weatherService.initializeAdapters()
        // Clear cache to force refetch with new adapter
        clearAllCache()
        // Trigger refresh
        if (onLocationChange) {
          onLocationChange()
        }
        setTimeout(() => setApiKeyStatus('saved'), 2000)
      } else {
        setApiKeyStatus('error')
      }
    }
  }

  // Remove API key
  function removeApiKey() {
    setOpenWeatherApiKey(null)
    setApiKey('')
    setApiKeyStatus('')
    // Switch back to weather.gov
    setSelectedApi('weathergov')
    setSelectedAdapter('weathergov')
    weatherService.switchAdapter('weathergov')
    clearAllCache()
    if (onLocationChange) {
      onLocationChange()
    }
  }

  // Change API provider
  function handleApiProviderChange(provider) {
    if (provider === 'openweather' && !hasOpenWeatherApiKey()) {
      // Can't switch to OpenWeatherMap without API key
      alert('Please enter an OpenWeatherMap API key first')
      return
    }

    setSelectedApi(provider)
    setSelectedAdapter(provider)
    weatherService.switchAdapter(provider)
    clearAllCache()
    if (onLocationChange) {
      onLocationChange()
    }
  }

  // Change temperature unit
  function handleTemperatureUnitChange(unit) {
    setTemperatureUnitState(unit)
    setTemperatureUnit(unit)
    // Trigger refresh to update all temperature displays
    if (onLocationChange) {
      onLocationChange()
    }
  }

  // Change wind speed unit
  function handleWindSpeedUnitChange(unit) {
    setWindSpeedUnitState(unit)
    setWindSpeedUnit(unit)
    // Trigger refresh to update all wind speed displays
    if (onLocationChange) {
      onLocationChange()
    }
  }

  // Change radar provider
  function handleRadarProviderChange(provider) {
    setRadarProviderState(provider)
    setRadarProvider(provider)
    radarService.switchProvider(provider)
    radarService.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-macos-card-light dark:bg-macos-card rounded-3xl shadow-2xl border border-macos-border-light dark:border-macos-border">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-macos-card-light dark:bg-macos-card border-b border-macos-border-light dark:border-macos-border">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg hover:bg-macos-border-light dark:hover:bg-macos-border transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Updating Location Indicator */}
          {updatingLocation && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                Updating weather...
              </div>
            </div>
          )}

          {/* Theme */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
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
                  className="touch-target px-4 py-2 rounded-lg bg-macos-blue-light dark:bg-macos-blue text-white hover:opacity-90 transition-opacity"
                >
                  Toggle
                </button>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="space-y-3">
              {currentLocation && (
                <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                  <div className="font-medium mb-2">Current Location</div>
                  <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    {currentLocation.name || 'Custom Location'}
                  </div>
                  <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
                    {currentLocation.latitude.toFixed(4)}° N, {Math.abs(currentLocation.longitude).toFixed(4)}° {currentLocation.longitude < 0 ? 'W' : 'E'}
                  </div>
                </div>
              )}

              {/* City Search */}
              <div className="relative">
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search for a city..."
                  className="w-full px-4 py-3 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue"
                />

                {/* Search Results */}
                {(searching || searchResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border shadow-xl z-10">
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
          </section>

          {/* Weather API */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Weather API</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-4">
              {/* API Provider Selection */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Weather Provider</span>
                <select
                  value={selectedApi}
                  onChange={(e) => handleApiProviderChange(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue"
                >
                  <option value="openweather" disabled={!hasOpenWeatherApiKey()}>
                    OpenWeatherMap {!hasOpenWeatherApiKey() && '(API key required)'}
                  </option>
                  <option value="weathergov">Weather.gov</option>
                </select>
              </div>

              {/* OpenWeatherMap API Key - Only show when openweather is selected or being configured */}
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
                      className="flex-1 px-4 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue text-sm"
                    />
                    <button
                      onClick={saveApiKey}
                      disabled={!apiKey.trim()}
                      className="px-4 py-2 rounded-lg bg-macos-blue-light dark:bg-macos-blue text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>

                  {apiKeyStatus === 'success' && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ API key saved successfully!
                    </div>
                  )}
                  {apiKeyStatus === 'saved' && (
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                      API key configured
                    </div>
                  )}
                  {apiKeyStatus === 'error' && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Failed to save API key
                    </div>
                  )}

                  {apiKey && (
                    <button
                      onClick={removeApiKey}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove API key
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Radar Provider */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Radar Provider</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Radar Data Source</div>
                  <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    Choose your radar provider
                  </div>
                </div>
                <select
                  value={radarProvider}
                  onChange={(e) => handleRadarProviderChange(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue"
                >
                  <option value="noaa">NOAA (US Only)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Units */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Units</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Temperature</span>
                <select
                  value={temperatureUnit}
                  onChange={(e) => handleTemperatureUnitChange(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue"
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
                  className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border focus:outline-none focus:ring-2 focus:ring-macos-blue-light dark:focus:ring-macos-blue"
                >
                  <option value="mph">Miles per hour (mph)</option>
                  <option value="kmh">Kilometers per hour (km/h)</option>
                  <option value="ms">Meters per second (m/s)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
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
          </section>

          {/* Data & Cache */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Data & Cache</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
                  Clear cached weather data to force refresh
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
          </section>

          {/* About */}
          <section>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Version:</span> 0.1.0 (MVP)</div>
                <div>
                  <span className="font-medium">Weather API:</span> {apiKey ? 'OpenWeatherMap (with Weather.gov fallback)' : 'Weather.gov'}
                </div>
                <div className="pt-2 text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Weather & Sky App for Raspberry Pi
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-macos-card-light dark:bg-macos-card border-t border-macos-border-light dark:border-macos-border">
          <button
            onClick={onClose}
            className="w-full touch-target px-6 py-3 rounded-xl bg-macos-blue-light dark:bg-macos-blue text-white font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
