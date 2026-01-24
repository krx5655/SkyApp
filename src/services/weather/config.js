/**
 * Weather API Configuration
 */

// Weather API Configuration
export const weatherConfig = {
  // Primary adapter selection: 'openweather' | 'weathergov'
  primaryAdapter: 'openweather',

  // Fallback behavior
  enableFallback: true,
  fallbackAdapter: 'weathergov',

  // Cache settings (in milliseconds)
  cacheTTL: 15 * 60 * 1000, // 15 minutes for forecasts
  historicalCacheTTL: 6 * 60 * 60 * 1000, // 6 hours for historical data
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
