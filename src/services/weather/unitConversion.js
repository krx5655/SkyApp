/**
 * Unit Conversion Utilities
 */

/**
 * Convert temperature from Fahrenheit to Celsius
 * @param {number} fahrenheit
 * @returns {number}
 */
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * (5 / 9)
}

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius
 * @returns {number}
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32
}

/**
 * Convert temperature based on target unit
 * @param {number} temp - Temperature value (assumed to be in Fahrenheit from API)
 * @param {string} targetUnit - 'F' or 'C'
 * @returns {number} Converted temperature
 */
export function convertTemperature(temp, targetUnit) {
  if (targetUnit === 'C') {
    return Math.round(fahrenheitToCelsius(temp))
  }
  return Math.round(temp)
}

/**
 * Get temperature unit symbol
 * @param {string} unit - 'F' or 'C'
 * @returns {string} '°F' or '°C'
 */
export function getTemperatureSymbol(unit) {
  return unit === 'C' ? '°C' : '°F'
}

/**
 * Convert wind speed from mph to target unit
 * @param {number} mph - Wind speed in miles per hour
 * @param {string} targetUnit - 'mph', 'kmh', or 'ms'
 * @returns {number} Converted wind speed
 */
export function convertWindSpeed(mph, targetUnit) {
  switch (targetUnit) {
    case 'kmh':
      return Math.round(mph * 1.60934)
    case 'ms':
      return Math.round(mph * 0.44704)
    default:
      return Math.round(mph)
  }
}

/**
 * Get wind speed unit symbol
 * @param {string} unit - 'mph', 'kmh', or 'ms'
 * @returns {string} Unit symbol
 */
export function getWindSpeedSymbol(unit) {
  switch (unit) {
    case 'kmh':
      return 'km/h'
    case 'ms':
      return 'm/s'
    default:
      return 'mph'
  }
}

/**
 * Parse and convert a wind string (e.g., "12 mph NW")
 * @param {string} windString - Wind string from API (e.g., "12 mph NW")
 * @param {string} targetUnit - 'mph', 'kmh', or 'ms'
 * @returns {string} Converted wind string (e.g., "19 km/h NW")
 */
export function convertWindString(windString, targetUnit) {
  if (!windString) return windString

  // Parse the wind string: "12 mph NW" -> [12, "NW"]
  const match = windString.match(/^(\d+)\s*mph\s*(.*)$/)
  if (!match) return windString

  const speedInMph = parseInt(match[1], 10)
  const direction = match[2].trim()

  // Convert speed to target unit
  const convertedSpeed = convertWindSpeed(speedInMph, targetUnit)
  const unitSymbol = getWindSpeedSymbol(targetUnit)

  // Rebuild string
  return direction ? `${convertedSpeed} ${unitSymbol} ${direction}` : `${convertedSpeed} ${unitSymbol}`
}
