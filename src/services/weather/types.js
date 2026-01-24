/**
 * Standardized weather data format
 * All adapters must normalize their API responses to match these types
 */

/**
 * @typedef {Object} WeatherCondition
 * @property {string} description - e.g., "Partly Cloudy"
 * @property {string} icon - Weather icon identifier
 * @property {string} shortForecast - Brief description
 */

/**
 * @typedef {Object} DailyForecast
 * @property {string} id - Unique identifier
 * @property {Date} date - Forecast date
 * @property {string} dayName - e.g., "Monday"
 * @property {string} shortDate - e.g., "Jan 15"
 * @property {number} high - High temperature (Fahrenheit)
 * @property {number} low - Low temperature (Fahrenheit)
 * @property {string} condition - Weather condition description
 * @property {string} icon - Weather icon identifier
 * @property {number} precipitationChance - Precipitation chance (0-100)
 * @property {number} windSpeed - Wind speed (mph)
 * @property {string} windDirection - Wind direction (e.g., "NW")
 */

/**
 * @typedef {Object} HourlyForecast
 * @property {number} hour - Hour (0-23)
 * @property {Date} time - Full timestamp
 * @property {number} temp - Temperature (Fahrenheit)
 * @property {number} precipitation - Precipitation chance (0-100)
 * @property {string} condition - Weather condition
 * @property {string} icon - Weather icon identifier
 * @property {number} windSpeed - Wind speed (mph)
 * @property {string} windDirection - Wind direction
 * @property {number} humidity - Humidity percentage (0-100)
 */

/**
 * @typedef {Object} WeatherDetails
 * @property {string} sunrise - Sunrise time (e.g., "6:42 AM")
 * @property {string} sunset - Sunset time (e.g., "7:18 PM")
 * @property {string} wind - Wind description (e.g., "12 mph NW")
 * @property {string} humidity - Humidity percentage (e.g., "65%")
 * @property {number} uvIndex - UV index (0-11+)
 * @property {string} visibility - Visibility (e.g., "10 mi")
 */

export const WeatherIcons = {
  CLEAR_DAY: 'clear-day',
  CLEAR_NIGHT: 'clear-night',
  PARTLY_CLOUDY: 'partly-cloudy',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  SNOW: 'snow',
  THUNDERSTORM: 'thunderstorm',
  FOG: 'fog',
  WIND: 'wind',
}

export default {
  WeatherIcons,
}
