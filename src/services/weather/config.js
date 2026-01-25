/**
 * Weather API Configuration
 */

// Weather API Configuration
export const weatherConfig = {
  // Primary adapter selection: 'openweather' | 'weathergov'
  primaryAdapter: 'openweather',

  // Fallback behavior
  enableFallback: false, // Disabled - user explicitly chooses adapter
  fallbackAdapter: 'weathergov',

  // Cache settings (in milliseconds)
  cacheTTL: 15 * 60 * 1000, // 15 minutes for forecasts
  historicalCacheTTL: 6 * 60 * 60 * 1000, // 6 hours for historical data
}

/**
 * Get the selected weather API provider from localStorage
 * @returns {string} 'openweather' or 'weathergov'
 */
export function getSelectedAdapter() {
  try {
    const stored = localStorage.getItem('weather_adapter')
    if (stored === 'openweather' || stored === 'weathergov') {
      return stored
    }
    // Default to openweather if API key exists, otherwise weathergov
    return hasOpenWeatherApiKey() ? 'openweather' : 'weathergov'
  } catch (error) {
    console.warn('Failed to get selected adapter from localStorage:', error)
    return 'openweather'
  }
}

/**
 * Set the selected weather API provider in localStorage
 * @param {string} adapter - 'openweather' or 'weathergov'
 * @returns {boolean} True if successful
 */
export function setSelectedAdapter(adapter) {
  try {
    if (adapter === 'openweather' || adapter === 'weathergov') {
      localStorage.setItem('weather_adapter', adapter)
      weatherConfig.primaryAdapter = adapter
      return true
    }
    return false
  } catch (error) {
    console.warn('Failed to set selected adapter in localStorage:', error)
    return false
  }
}

/**
 * Get the current adapter name for cache key prefixing
 * @returns {string} Current adapter name
 */
export function getCurrentAdapterName() {
  return weatherConfig.primaryAdapter
}

/**
 * Get OpenWeatherMap API key from localStorage
 * @returns {string|null} API key or null if not set
 */
export function getOpenWeatherApiKey() {
  try {
    return localStorage.getItem('openweather_api_key') || null
  } catch (error) {
    console.warn('Failed to get API key from localStorage:', error)
    return null
  }
}

/**
 * Set OpenWeatherMap API key in localStorage
 * @param {string} key - The API key to store
 * @returns {boolean} True if successful, false otherwise
 */
export function setOpenWeatherApiKey(key) {
  try {
    if (key) {
      localStorage.setItem('openweather_api_key', key)
    } else {
      localStorage.removeItem('openweather_api_key')
    }
    return true
  } catch (error) {
    console.warn('Failed to set API key in localStorage:', error)
    return false
  }
}

/**
 * Check if OpenWeatherMap API key is configured
 * @returns {boolean} True if API key exists
 */
export function hasOpenWeatherApiKey() {
  return !!getOpenWeatherApiKey()
}

/**
 * Clear all weather API configuration
 */
export function clearWeatherConfig() {
  try {
    localStorage.removeItem('openweather_api_key')
    return true
  } catch (error) {
    console.warn('Failed to clear weather config:', error)
    return false
  }
}

/**
 * Get temperature unit preference from localStorage
 * @returns {string} 'F' or 'C' (default: 'F')
 */
export function getTemperatureUnit() {
  try {
    const unit = localStorage.getItem('temperature_unit')
    return unit === 'C' ? 'C' : 'F'
  } catch (error) {
    console.warn('Failed to get temperature unit from localStorage:', error)
    return 'F'
  }
}

/**
 * Set temperature unit preference in localStorage
 * @param {string} unit - 'F' or 'C'
 * @returns {boolean} True if successful
 */
export function setTemperatureUnit(unit) {
  try {
    if (unit === 'F' || unit === 'C') {
      localStorage.setItem('temperature_unit', unit)
      return true
    }
    return false
  } catch (error) {
    console.warn('Failed to set temperature unit in localStorage:', error)
    return false
  }
}

/**
 * Get wind speed unit preference from localStorage
 * @returns {string} 'mph', 'kmh', or 'ms' (default: 'mph')
 */
export function getWindSpeedUnit() {
  try {
    const unit = localStorage.getItem('wind_speed_unit')
    if (unit === 'kmh' || unit === 'ms') {
      return unit
    }
    return 'mph'
  } catch (error) {
    console.warn('Failed to get wind speed unit from localStorage:', error)
    return 'mph'
  }
}

/**
 * Set wind speed unit preference in localStorage
 * @param {string} unit - 'mph', 'kmh', or 'ms'
 * @returns {boolean} True if successful
 */
export function setWindSpeedUnit(unit) {
  try {
    if (unit === 'mph' || unit === 'kmh' || unit === 'ms') {
      localStorage.setItem('wind_speed_unit', unit)
      return true
    }
    return false
  } catch (error) {
    console.warn('Failed to set wind speed unit in localStorage:', error)
    return false
  }
}
