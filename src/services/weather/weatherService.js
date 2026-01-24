import WeatherGovAdapter from './adapters/weatherGovAdapter.js'
import OpenWeatherAdapter from './adapters/openWeatherAdapter.js'
import { getCache, setCache } from './cache.js'
import { weatherConfig, getOpenWeatherApiKey, hasOpenWeatherApiKey } from './config.js'

/**
 * Main Weather Service
 * Provides a unified interface to weather data with caching and fallback support
 * Supports multiple API providers with automatic fallback
 */
class WeatherService {
  constructor() {
    this.initializeAdapters()

    // Default location (can be overridden)
    this.defaultLocation = {
      latitude: 37.7749,  // San Francisco
      longitude: -122.4194,
    }

    // Cache TTL (15 minutes)
    this.cacheTTL = weatherConfig.cacheTTL
  }

  /**
   * Initialize adapters based on configuration and API key availability
   */
  initializeAdapters() {
    // Always initialize weather.gov adapter (no API key required)
    this.weatherGovAdapter = new WeatherGovAdapter()

    // Initialize OpenWeather adapter if API key is available
    const apiKey = getOpenWeatherApiKey()
    this.openWeatherAdapter = apiKey ? new OpenWeatherAdapter(apiKey) : null

    // Set primary adapter based on config and availability
    if (weatherConfig.primaryAdapter === 'openweather' && this.openWeatherAdapter) {
      this.adapter = this.openWeatherAdapter
      this.fallbackAdapter = weatherConfig.enableFallback ? this.weatherGovAdapter : null
      console.log('[WeatherService] Using OpenWeatherMap as primary adapter')
    } else {
      this.adapter = this.weatherGovAdapter
      this.fallbackAdapter = weatherConfig.enableFallback && this.openWeatherAdapter ? this.openWeatherAdapter : null
      console.log('[WeatherService] Using Weather.gov as primary adapter')
    }
  }

  /**
   * Switch to a different adapter
   * @param {string} adapterName - 'openweather' or 'weathergov'
   */
  switchAdapter(adapterName) {
    if (adapterName === 'openweather' && hasOpenWeatherApiKey()) {
      weatherConfig.primaryAdapter = 'openweather'
      this.initializeAdapters()
      console.log('[WeatherService] Switched to OpenWeatherMap adapter')
    } else if (adapterName === 'weathergov') {
      weatherConfig.primaryAdapter = 'weathergov'
      this.initializeAdapters()
      console.log('[WeatherService] Switched to Weather.gov adapter')
    } else {
      console.warn('[WeatherService] Cannot switch to', adapterName, '- API key may be missing')
    }
  }

  /**
   * Execute adapter method with fallback support
   * @param {string} methodName - Name of the adapter method to call
   * @param {Array} args - Arguments to pass to the method
   * @returns {Promise} Result from adapter
   */
  async executeWithFallback(methodName, ...args) {
    try {
      return await this.adapter[methodName](...args)
    } catch (error) {
      console.warn(`[WeatherService] Primary adapter (${this.adapter.constructor.name}) failed:`, error.message)

      if (this.fallbackAdapter) {
        console.log(`[WeatherService] Trying fallback adapter (${this.fallbackAdapter.constructor.name})`)
        try {
          return await this.fallbackAdapter[methodName](...args)
        } catch (fallbackError) {
          console.error('[WeatherService] Fallback adapter also failed:', fallbackError.message)
          throw new Error(`Both adapters failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`)
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Get location from localStorage or use default
   */
  getLocation() {
    try {
      const stored = localStorage.getItem('weather_location')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to get stored location:', error)
    }
    return this.defaultLocation
  }

  /**
   * Set location in localStorage
   */
  setLocation(latitude, longitude) {
    try {
      localStorage.setItem('weather_location', JSON.stringify({ latitude, longitude }))
    } catch (error) {
      console.warn('Failed to set location:', error)
    }
  }

  /**
   * Get weekly forecast with caching
   */
  async getWeeklyForecast(latitude = null, longitude = null) {
    const location = latitude && longitude
      ? { latitude, longitude }
      : this.getLocation()

    const cacheKey = `weekly_${location.latitude}_${location.longitude}`

    // Try cache first
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('Using cached weekly forecast')
      return cached
    }

    // Fetch from API with fallback
    console.log('Fetching weekly forecast from API')
    const data = await this.executeWithFallback(
      'getWeeklyForecast',
      location.latitude,
      location.longitude
    )

    // Cache the result
    setCache(cacheKey, data, this.cacheTTL)

    return data
  }

  /**
   * Get hourly forecast with caching
   */
  async getHourlyForecast(latitude = null, longitude = null, date = new Date()) {
    const location = latitude && longitude
      ? { latitude, longitude }
      : this.getLocation()

    const dateStr = date.toISOString().split('T')[0]
    const cacheKey = `hourly_${location.latitude}_${location.longitude}_${dateStr}`

    // Try cache first
    const cached = getCache(cacheKey)
    if (cached) {
      console.log(`[WeatherService] Using cached hourly forecast for ${dateStr}`)
      return cached
    }

    // Fetch from API with fallback
    console.log(`[WeatherService] Fetching hourly forecast from API for ${dateStr}`)
    console.log(`[WeatherService] Using adapter: ${this.adapter.constructor.name}`)

    const data = await this.executeWithFallback(
      'getHourlyForecast',
      location.latitude,
      location.longitude,
      date
    )

    console.log(`[WeatherService] Received ${data.length} hourly data points for ${dateStr}`)

    // Cache the result
    setCache(cacheKey, data, this.cacheTTL)

    return data
  }

  /**
   * Get current weather
   */
  async getCurrentWeather(latitude = null, longitude = null) {
    const location = latitude && longitude
      ? { latitude, longitude }
      : this.getLocation()

    const cacheKey = `current_${location.latitude}_${location.longitude}`

    // Try cache first (shorter TTL for current weather)
    const cached = getCache(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from API with fallback
    const data = await this.executeWithFallback(
      'getCurrentWeather',
      location.latitude,
      location.longitude
    )

    // Cache for 5 minutes
    setCache(cacheKey, data, 5 * 60 * 1000)

    return data
  }

  /**
   * Get weather details
   */
  async getWeatherDetails(latitude = null, longitude = null, date = new Date()) {
    const location = latitude && longitude
      ? { latitude, longitude }
      : this.getLocation()

    const dateStr = date.toISOString().split('T')[0]
    const cacheKey = `details_${location.latitude}_${location.longitude}_${dateStr}`

    // Try cache first
    const cached = getCache(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from API with fallback
    const data = await this.executeWithFallback(
      'getWeatherDetails',
      location.latitude,
      location.longitude,
      date
    )

    // Cache the result
    setCache(cacheKey, data, this.cacheTTL)

    return data
  }

  /**
   * Mock data fallbacks
   */
  getMockWeeklyForecast() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const conditions = ['☀️', '⛅', '☁️', '🌧️']
    const today = new Date()

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      return {
        id: (i + 1).toString(),
        date: date,
        dayName: i === 0 ? 'Today' : days[date.getDay()],
        shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        high: Math.floor(Math.random() * 20) + 65,
        low: Math.floor(Math.random() * 15) + 50,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        icon: conditions[Math.floor(Math.random() * conditions.length)],
        precipitationChance: Math.floor(Math.random() * 60),
        windSpeed: Math.floor(Math.random() * 15) + 5,
        windDirection: 'NW',
      }
    })
  }

  getMockHourlyForecast() {
    const conditions = ['☀️', '⛅', '☁️', '🌧️']

    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      time: new Date(),
      temp: Math.floor(Math.random() * 15) + 55,
      precipitation: Math.floor(Math.random() * 60),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      icon: conditions[Math.floor(Math.random() * conditions.length)],
      windSpeed: Math.floor(Math.random() * 15) + 5,
      windDirection: 'NW',
      humidity: Math.floor(Math.random() * 30) + 50,
    }))
  }

  getMockWeatherDetails() {
    return {
      sunrise: '6:42 AM',
      sunset: '7:18 PM',
      wind: '12 mph NW',
      humidity: '65%',
      uvIndex: 6,
      visibility: '10 mi',
    }
  }
}

// Export singleton instance
const weatherService = new WeatherService()
export default weatherService
