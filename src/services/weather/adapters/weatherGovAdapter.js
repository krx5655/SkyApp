import BaseWeatherAdapter from './baseAdapter.js'
import { WeatherIcons } from '../types.js'
import { format, parseISO, startOfDay, addHours } from 'date-fns'

/**
 * Weather.gov API Adapter
 * Docs: https://www.weather.gov/documentation/services-web-api
 */
class WeatherGovAdapter extends BaseWeatherAdapter {
  constructor() {
    super()
    this.baseUrl = 'https://api.weather.gov'
    this.userAgent = '(SkyApp Weather Display, contact@example.com)' // Required by weather.gov
  }

  /**
   * Fetch wrapper with proper headers
   */
  async fetchWeatherGov(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Weather.gov API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get grid points for a location (required for other API calls)
   */
  async getGridPoints(latitude, longitude) {
    const url = `${this.baseUrl}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`
    const data = await this.fetchWeatherGov(url)

    return {
      gridId: data.properties.gridId,
      gridX: data.properties.gridX,
      gridY: data.properties.gridY,
      forecastUrl: data.properties.forecast,
      forecastHourlyUrl: data.properties.forecastHourly,
      forecastGridDataUrl: data.properties.forecastGridData,
    }
  }

  /**
   * Get weekly forecast (7 days)
   */
  async getWeeklyForecast(latitude, longitude) {
    try {
      const gridPoints = await this.getGridPoints(latitude, longitude)
      const forecastData = await this.fetchWeatherGov(gridPoints.forecastUrl)

      // Weather.gov returns periods (daytime and nighttime), we need to combine them
      const periods = forecastData.properties.periods
      const dailyForecasts = []

      for (let i = 0; i < periods.length; i += 2) {
        const day = periods[i] // Daytime period
        const night = periods[i + 1] // Nighttime period

        if (!day) break
        if (dailyForecasts.length >= 7) break // Limit to 7 days

        const date = parseISO(day.startTime)

        dailyForecasts.push({
          id: day.number.toString(),
          date: date,
          dayName: format(date, 'EEEE'),
          shortDate: format(date, 'MMM d'),
          high: day.temperature,
          low: night ? night.temperature : day.temperature - 10, // Fallback if no night data
          condition: day.shortForecast,
          icon: this.mapConditionToIcon(day.shortForecast),
          precipitationChance: day.probabilityOfPrecipitation?.value || 0,
          windSpeed: this.parseWindSpeed(day.windSpeed),
          windDirection: day.windDirection,
        })
      }

      return dailyForecasts
    } catch (error) {
      console.error('Weather.gov weekly forecast error:', error)
      throw error
    }
  }

  /**
   * Get hourly forecast
   */
  async getHourlyForecast(latitude, longitude, date = new Date()) {
    try {
      const gridPoints = await this.getGridPoints(latitude, longitude)
      const hourlyData = await this.fetchWeatherGov(gridPoints.forecastHourlyUrl)

      const periods = hourlyData.properties.periods
      const targetDay = startOfDay(date)
      const now = new Date()
      const isToday = startOfDay(now).getTime() === targetDay.getTime()

      // Filter periods for the target day
      const dayPeriods = periods.filter(p => {
        const periodTime = parseISO(p.startTime)
        return startOfDay(periodTime).getTime() === targetDay.getTime()
      })

      // If no periods found for target day, it might be too far in future
      if (dayPeriods.length === 0) {
        throw new Error(`No hourly forecast data available for ${format(date, 'MMM d, yyyy')}`)
      }

      // Build 24-hour forecast array
      // Initialize with nulls for all 24 hours
      const hourlyForecasts = Array(24).fill(null)

      // Fill in the hours we have data for
      dayPeriods.forEach(p => {
        const periodTime = parseISO(p.startTime)
        const hour = periodTime.getHours()

        hourlyForecasts[hour] = {
          hour,
          time: periodTime,
          temp: p.temperature,
          precipitation: p.probabilityOfPrecipitation?.value || 0,
          condition: p.shortForecast,
          icon: this.mapConditionToIcon(p.shortForecast),
          windSpeed: this.parseWindSpeed(p.windSpeed),
          windDirection: p.windDirection,
          humidity: p.relativeHumidity?.value || 50,
        }
      })

      // For hours without data, use interpolation from surrounding hours
      for (let hour = 0; hour < 24; hour++) {
        if (!hourlyForecasts[hour]) {
          // Find previous and next non-null hours for interpolation
          let prevHour = hour - 1
          while (prevHour >= 0 && !hourlyForecasts[prevHour]) prevHour--

          let nextHour = hour + 1
          while (nextHour < 24 && !hourlyForecasts[nextHour]) nextHour++

          // If we have surrounding data, interpolate
          if (prevHour >= 0 && nextHour < 24) {
            const prev = hourlyForecasts[prevHour]
            const next = hourlyForecasts[nextHour]
            const ratio = (hour - prevHour) / (nextHour - prevHour)

            hourlyForecasts[hour] = {
              hour,
              time: addHours(targetDay, hour),
              temp: Math.round(prev.temp + (next.temp - prev.temp) * ratio),
              precipitation: Math.round(prev.precipitation + (next.precipitation - prev.precipitation) * ratio),
              condition: prev.condition,
              icon: prev.icon,
              windSpeed: Math.round(prev.windSpeed + (next.windSpeed - prev.windSpeed) * ratio),
              windDirection: prev.windDirection,
              humidity: Math.round(prev.humidity + (next.humidity - prev.humidity) * ratio),
            }
          } else if (prevHour >= 0) {
            // Only have previous data, use it
            hourlyForecasts[hour] = { ...hourlyForecasts[prevHour], hour, time: addHours(targetDay, hour) }
          } else if (nextHour < 24) {
            // Only have next data, use it
            hourlyForecasts[hour] = { ...hourlyForecasts[nextHour], hour, time: addHours(targetDay, hour) }
          } else {
            // No data at all - shouldn't happen, but fallback
            throw new Error('Insufficient forecast data')
          }
        }
      }

      return hourlyForecasts
    } catch (error) {
      console.error('Weather.gov hourly forecast error:', error)
      throw error
    }
  }

  /**
   * Get current weather conditions
   */
  async getCurrentWeather(latitude, longitude) {
    try {
      // Use first period of hourly forecast as current weather
      const hourlyData = await this.getHourlyForecast(latitude, longitude)
      return hourlyData[0] || null
    } catch (error) {
      console.error('Weather.gov current weather error:', error)
      throw error
    }
  }

  /**
   * Get weather details
   * Note: Weather.gov doesn't provide sunrise/sunset, so we'll need to calculate or use placeholder
   */
  async getWeatherDetails(latitude, longitude, date = new Date()) {
    try {
      const current = await this.getCurrentWeather(latitude, longitude)

      // Weather.gov doesn't provide all these details, so some are placeholders
      // In production, you might integrate with a sunrise/sunset API or library
      return {
        sunrise: '6:42 AM', // TODO: Calculate based on lat/long
        sunset: '7:18 PM',  // TODO: Calculate based on lat/long
        wind: `${current?.windSpeed || 0} mph ${current?.windDirection || 'N'}`,
        humidity: `${current?.humidity || 0}%`,
        uvIndex: 3, // TODO: Get from additional API
        visibility: '10 mi', // TODO: Get from grid data
      }
    } catch (error) {
      console.error('Weather.gov details error:', error)
      // Return fallback data
      return {
        sunrise: '6:42 AM',
        sunset: '7:18 PM',
        wind: '10 mph N',
        humidity: '50%',
        uvIndex: 3,
        visibility: '10 mi',
      }
    }
  }

  /**
   * Parse wind speed from weather.gov format (e.g., "10 to 15 mph")
   */
  parseWindSpeed(windSpeedStr) {
    if (!windSpeedStr) return 0
    const match = windSpeedStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Map weather.gov condition to standardized emoji icon
   */
  mapConditionToIcon(condition) {
    if (!condition) return '☁️'

    const lower = condition.toLowerCase()

    // Sun/Clear
    if (lower.includes('sunny') || lower.includes('clear')) {
      return '☀️'
    }
    // Partly Cloudy
    if (lower.includes('partly') || lower.includes('mostly sunny')) {
      return '⛅'
    }
    // Cloudy
    if (lower.includes('cloudy') || lower.includes('overcast')) {
      return '☁️'
    }
    // Rain
    if (lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle')) {
      return '🌧️'
    }
    // Snow
    if (lower.includes('snow') || lower.includes('flurries')) {
      return '❄️'
    }
    // Thunderstorm
    if (lower.includes('thunder') || lower.includes('storm')) {
      return '⛈️'
    }
    // Fog
    if (lower.includes('fog') || lower.includes('mist')) {
      return '🌫️'
    }
    // Wind
    if (lower.includes('wind')) {
      return '💨'
    }

    // Default
    return '☁️'
  }
}

export default WeatherGovAdapter
