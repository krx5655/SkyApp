/**
 * Base adapter interface
 * All weather API adapters must extend this class and implement these methods
 */
class BaseWeatherAdapter {
  /**
   * Get weekly forecast (7 days)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<DailyForecast[]>}
   */
  async getWeeklyForecast(latitude, longitude) {
    throw new Error('getWeeklyForecast must be implemented')
  }

  /**
   * Get hourly forecast for a specific day
   * @param {number} latitude
   * @param {number} longitude
   * @param {Date} date - The day to get hourly forecast for
   * @returns {Promise<HourlyForecast[]>}
   */
  async getHourlyForecast(latitude, longitude, date = new Date()) {
    throw new Error('getHourlyForecast must be implemented')
  }

  /**
   * Get current weather conditions
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>}
   */
  async getCurrentWeather(latitude, longitude) {
    throw new Error('getCurrentWeather must be implemented')
  }

  /**
   * Get weather details (sunrise, sunset, etc.)
   * @param {number} latitude
   * @param {number} longitude
   * @param {Date} date
   * @returns {Promise<WeatherDetails>}
   */
  async getWeatherDetails(latitude, longitude, date = new Date()) {
    throw new Error('getWeatherDetails must be implemented')
  }

  /**
   * Helper: Map weather condition to standardized icon
   * @param {string} condition - API-specific condition string
   * @returns {string} Standardized icon identifier
   */
  mapConditionToIcon(condition) {
    throw new Error('mapConditionToIcon must be implemented')
  }
}

export default BaseWeatherAdapter
