import BaseWeatherAdapter from './baseAdapter.js'
import { WeatherEmojis } from '../types.js'
import { format, parseISO, startOfDay, addHours, addDays, startOfHour } from 'date-fns'

/**
 * OpenWeatherMap One Call API 3.0 Adapter
 * Docs: https://openweathermap.org/api/one-call-3
 * Provides historical hourly data for past 5 days + future forecast
 */
class OpenWeatherAdapter extends BaseWeatherAdapter {
  constructor(apiKey) {
    super()
    this.apiKey = apiKey
    this.baseUrl = 'https://api.openweathermap.org/data/3.0/onecall'
  }

  /**
   * Fetch from OpenWeatherMap API
   */
  async fetchOpenWeather(url) {
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid OpenWeatherMap API key')
      } else if (response.status === 429) {
        throw new Error('OpenWeatherMap API rate limit exceeded')
      }
      throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Fetch One Call API (current + hourly + daily forecast)
   */
  async fetchOneCall(latitude, longitude) {
    const url = `${this.baseUrl}?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&exclude=minutely,alerts&units=imperial&appid=${this.apiKey}`
    console.log('[OpenWeatherAdapter] Fetching One Call API...')
    const result = await this.fetchOpenWeather(url)
    console.log('[OpenWeatherAdapter] One Call API success - hourly entries:', result.hourly?.length)
    return result
  }

  /**
   * Fetch historical data for a specific day using timemachine API
   * @param {number} latitude
   * @param {number} longitude
   * @param {Date} date - The day to fetch historical data for
   */
  async fetchTimemachine(latitude, longitude, date) {
    // Convert date to Unix timestamp (seconds)
    const timestamp = Math.floor(date.getTime() / 1000)
    const url = `${this.baseUrl}/timemachine?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&dt=${timestamp}&units=imperial&appid=${this.apiKey}`
    console.log('[OpenWeatherAdapter] Fetching Timemachine API for date:', format(date, 'MMM d, yyyy'), 'timestamp:', timestamp)
    const result = await this.fetchOpenWeather(url)
    console.log('[OpenWeatherAdapter] Timemachine API success - data entries:', result.data?.length)
    return result
  }

  /**
   * Get weekly forecast (7 days)
   */
  async getWeeklyForecast(latitude, longitude) {
    try {
      const data = await this.fetchOneCall(latitude, longitude)

      // Use daily array from One Call API
      const dailyForecasts = data.daily.slice(0, 7).map((day, index) => {
        const date = new Date(day.dt * 1000)

        return {
          id: index.toString(),
          date: date,
          dayName: format(date, 'EEEE'),
          shortDate: format(date, 'MMM d'),
          high: Math.round(day.temp.max),
          low: Math.round(day.temp.min),
          condition: day.weather[0].description,
          icon: this.mapConditionToIcon(day.weather[0].id, day.weather[0].icon),
          precipitationChance: Math.round((day.pop || 0) * 100),
          windSpeed: Math.round(day.wind_speed),
          windDirection: this.degreesToCardinal(day.wind_deg),
        }
      })

      return dailyForecasts
    } catch (error) {
      console.error('OpenWeatherMap weekly forecast error:', error)
      throw error
    }
  }

  /**
   * Get hourly forecast for a specific day
   * For today: merges historical (past hours) + future hours with isPast flag
   * For future days: uses forecast data
   * For past days: uses timemachine API
   */
  async getHourlyForecast(latitude, longitude, date = new Date()) {
    try {
      const targetDay = startOfDay(date)
      const now = new Date()
      const today = startOfDay(now)
      const isToday = targetDay.getTime() === today.getTime()
      const isPast = targetDay < today
      const daysDiff = Math.floor((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      console.log(`[openWeatherAdapter] Fetching hourly forecast for ${format(date, 'MMM d, yyyy')}`)
      console.log(`[openWeatherAdapter] isToday: ${isToday}, isPast: ${isPast}, daysDiff: ${daysDiff}`)

      if (isToday) {
        // For today: merge historical (past hours) + future hours
        return this.getTodayHourlyForecast(latitude, longitude, now)
      } else if (isPast) {
        // For past days: use timemachine API
        return this.getPastDayHourlyForecast(latitude, longitude, targetDay)
      } else {
        // For future days: use forecast data
        return this.getFutureDayHourlyForecast(latitude, longitude, targetDay, daysDiff)
      }
    } catch (error) {
      console.error('OpenWeatherMap hourly forecast error:', error)
      throw error
    }
  }

  /**
   * Get today's hourly forecast (merge past + future with isPast flag)
   * Always returns 24 hours of data, interpolating missing hours if needed
   */
  async getTodayHourlyForecast(latitude, longitude, now) {
    const currentHour = now.getHours()
    const todayStart = startOfDay(now)

    console.log(`[OpenWeatherAdapter] getTodayHourlyForecast - Current hour: ${currentHour}`)

    // Fetch future data first (we always need this)
    console.log(`[OpenWeatherAdapter] Fetching future forecast data...`)
    const forecastData = await this.fetchOneCall(latitude, longitude)

    // Get today's daily data for interpolation
    const todayDailyData = forecastData.daily.find(d => {
      const dayTime = new Date(d.dt * 1000)
      return startOfDay(dayTime).getTime() === todayStart.getTime()
    }) || forecastData.daily[0]

    console.log(`[OpenWeatherAdapter] Daily data for today - High: ${Math.round(todayDailyData.temp.max)}°, Low: ${Math.round(todayDailyData.temp.min)}°`)

    // Extract future hours for today from One Call API
    const futureHours = forecastData.hourly
      .filter(h => {
        const hourTime = new Date(h.dt * 1000)
        return startOfDay(hourTime).getTime() === todayStart.getTime()
      })
      .map(h => this.parseHourlyData(h, false))

    console.log(`[OpenWeatherAdapter] ✓ Fetched ${futureHours.length} future hours from One Call API`)
    if (futureHours.length > 0) {
      console.log(`[OpenWeatherAdapter] Future hours: ${futureHours.map(h => h.hour).join(', ')}`)
    }

    // Fetch historical data for past hours (midnight to current hour)
    let pastHours = []
    if (currentHour > 0) {
      try {
        console.log(`[OpenWeatherAdapter] Attempting to fetch historical data for hours 0-${currentHour - 1}...`)
        const historicalData = await this.fetchTimemachine(latitude, longitude, todayStart)

        console.log(`[OpenWeatherAdapter] Timemachine returned ${historicalData.data?.length || 0} data points`)

        if (historicalData.data && historicalData.data.length > 0) {
          // Log all hours returned from timemachine
          const allHistoricalHours = historicalData.data.map(h => new Date(h.dt * 1000).getHours())
          console.log(`[OpenWeatherAdapter] Timemachine hours available: ${allHistoricalHours.join(', ')}`)

          pastHours = historicalData.data
            .filter(h => {
              const hourTime = new Date(h.dt * 1000)
              const hour = hourTime.getHours()
              // Include all hours before current hour
              return hour < currentHour
            })
            .map(h => this.parseHourlyData(h, true))

          console.log(`[OpenWeatherAdapter] ✓ Filtered to ${pastHours.length} historical hours (before hour ${currentHour})`)
          if (pastHours.length > 0) {
            console.log(`[OpenWeatherAdapter] Historical hours: ${pastHours.map(h => h.hour).join(', ')}`)
          }
        }
      } catch (error) {
        console.error('[OpenWeatherAdapter] ✗ Failed to fetch historical data:', error.message)
        console.warn('[OpenWeatherAdapter] Will interpolate missing past hours using daily data')
      }
    } else {
      console.log(`[OpenWeatherAdapter] Current hour is 0 (midnight), no historical data needed`)
    }

    // Merge past and future hours
    const allHours = [...pastHours, ...futureHours]
    console.log(`[OpenWeatherAdapter] Merging ${pastHours.length} past + ${futureHours.length} future = ${allHours.length} total hours`)

    // Create hour map and deduplicate (keep future data for current hour)
    const hourlyMap = new Map()
    allHours.forEach(h => {
      if (!hourlyMap.has(h.hour) || !h.isPast) {
        hourlyMap.set(h.hour, h)
      }
    })

    // Check for missing hours and interpolate if needed
    const missingHours = []
    for (let hour = 0; hour < 24; hour++) {
      if (!hourlyMap.has(hour)) {
        missingHours.push(hour)
      }
    }

    if (missingHours.length > 0) {
      console.log(`[OpenWeatherAdapter] Missing hours: ${missingHours.join(', ')}`)
      console.log(`[OpenWeatherAdapter] Interpolating ${missingHours.length} missing hours using daily data`)

      // Interpolate missing hours using daily data
      missingHours.forEach(hour => {
        const interpolated = this.interpolateHour(hour, todayStart, todayDailyData, hour < currentHour)
        hourlyMap.set(hour, interpolated)
      })
    }

    const sortedHours = Array.from(hourlyMap.values()).sort((a, b) => a.hour - b.hour)

    console.log(`[OpenWeatherAdapter] ✓ Final data: ${sortedHours.length} hours`)
    console.log(`[OpenWeatherAdapter] Final hours: ${sortedHours.map(h => h.hour).join(', ')}`)
    const pastCount = sortedHours.filter(h => h.isPast).length
    const futureCount = sortedHours.filter(h => !h.isPast).length
    const interpolatedCount = sortedHours.filter(h => h.isInterpolated).length
    console.log(`[OpenWeatherAdapter] Breakdown: ${pastCount} past, ${futureCount} future, ${interpolatedCount} interpolated`)

    return sortedHours
  }

  /**
   * Interpolate a single hour's data using daily high/low
   */
  interpolateHour(hour, dayStart, dailyData, isPast) {
    const dailyHigh = Math.round(dailyData.temp.max)
    const dailyLow = Math.round(dailyData.temp.min)
    const dailyCondition = dailyData.weather[0].description
    const dailyIcon = this.mapConditionToIcon(dailyData.weather[0].id, dailyData.weather[0].icon)

    // Temperature curve: low at 6am, high at 3pm (hour 15)
    // Using a sine curve that peaks at 3pm
    const tempFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5
    const temp = Math.round(dailyLow + (dailyHigh - dailyLow) * tempFactor)

    return {
      hour,
      time: addHours(dayStart, hour),
      temp,
      precipitation: Math.round((dailyData.pop || 0) * 100),
      condition: dailyCondition,
      icon: dailyIcon,
      windSpeed: Math.round(dailyData.wind_speed),
      windDirection: this.degreesToCardinal(dailyData.wind_deg),
      humidity: dailyData.humidity,
      isPast,
      isInterpolated: true, // Mark as interpolated for debugging
    }
  }

  /**
   * Get past day's hourly forecast using timemachine API
   */
  async getPastDayHourlyForecast(latitude, longitude, targetDay) {
    const daysDiff = Math.floor((new Date().getTime() - targetDay.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 5) {
      throw new Error('OpenWeatherMap free tier only provides historical data for past 5 days')
    }

    const historicalData = await this.fetchTimemachine(latitude, longitude, targetDay)

    const hourlyForecasts = historicalData.data.map(h => this.parseHourlyData(h, true))

    console.log(`[openWeatherAdapter] Past day forecast - ${hourlyForecasts.length} hours`)

    return hourlyForecasts
  }

  /**
   * Get future day's hourly forecast
   */
  async getFutureDayHourlyForecast(latitude, longitude, targetDay, daysDiff) {
    if (daysDiff > 7) {
      throw new Error('OpenWeatherMap hourly forecast only available for next 48 hours, using daily data for interpolation')
    }

    const forecastData = await this.fetchOneCall(latitude, longitude)

    // Extract hourly data for target day
    const targetDayHours = forecastData.hourly
      .filter(h => {
        const hourTime = new Date(h.dt * 1000)
        return startOfDay(hourTime).getTime() === targetDay.getTime()
      })
      .map(h => this.parseHourlyData(h, false))

    console.log(`[openWeatherAdapter] Future day forecast - ${targetDayHours.length} hours from API`)

    // If we have less than 24 hours, interpolate using daily data
    if (targetDayHours.length < 24) {
      const dailyData = forecastData.daily.find(d => {
        const dayTime = new Date(d.dt * 1000)
        return startOfDay(dayTime).getTime() === targetDay.getTime()
      })

      if (dailyData) {
        return this.interpolate24Hours(targetDayHours, dailyData, targetDay)
      }
    }

    return targetDayHours
  }

  /**
   * Parse hourly data from OpenWeatherMap format
   */
  parseHourlyData(hourData, isPast = false) {
    const time = new Date(hourData.dt * 1000)
    const weather = hourData.weather[0]

    return {
      hour: time.getHours(),
      time: time,
      temp: Math.round(hourData.temp),
      precipitation: Math.round((hourData.pop || 0) * 100),
      condition: weather.description,
      icon: this.mapConditionToIcon(weather.id, weather.icon),
      windSpeed: Math.round(hourData.wind_speed),
      windDirection: this.degreesToCardinal(hourData.wind_deg),
      humidity: hourData.humidity,
      isPast: isPast, // Mark if this is historical data
    }
  }

  /**
   * Interpolate missing hours to create full 24-hour array
   */
  interpolate24Hours(existingHours, dailyData, targetDay) {
    const hourlyArray = Array(24).fill(null).map((_, hour) => ({
      hour,
      time: addHours(targetDay, hour),
      temp: null,
      precipitation: null,
      condition: null,
      icon: null,
      windSpeed: null,
      windDirection: null,
      humidity: null,
      isPast: false,
    }))

    // Fill in existing hours
    existingHours.forEach(h => {
      hourlyArray[h.hour] = h
    })

    // Interpolate missing hours using daily data
    const dailyHigh = Math.round(dailyData.temp.max)
    const dailyLow = Math.round(dailyData.temp.min)
    const dailyCondition = dailyData.weather[0].description
    const dailyIcon = this.mapConditionToIcon(dailyData.weather[0].id, dailyData.weather[0].icon)

    for (let hour = 0; hour < 24; hour++) {
      if (hourlyArray[hour].temp === null) {
        // Simple temperature curve: low at 6am, high at 3pm
        const tempFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5
        hourlyArray[hour].temp = Math.round(dailyLow + (dailyHigh - dailyLow) * tempFactor)
        hourlyArray[hour].precipitation = Math.round((dailyData.pop || 0) * 100)
        hourlyArray[hour].condition = dailyCondition
        hourlyArray[hour].icon = dailyIcon
        hourlyArray[hour].windSpeed = Math.round(dailyData.wind_speed)
        hourlyArray[hour].windDirection = this.degreesToCardinal(dailyData.wind_deg)
        hourlyArray[hour].humidity = dailyData.humidity
      }
    }

    console.log(`[openWeatherAdapter] Interpolated full 24 hours`)

    return hourlyArray
  }

  /**
   * Get current weather conditions
   */
  async getCurrentWeather(latitude, longitude) {
    try {
      const data = await this.fetchOneCall(latitude, longitude)
      const current = data.current

      return {
        temp: Math.round(current.temp),
        feelsLike: Math.round(current.feels_like),
        condition: current.weather[0].description,
        icon: this.mapConditionToIcon(current.weather[0].id, current.weather[0].icon),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_speed),
        windDirection: this.degreesToCardinal(current.wind_deg),
        pressure: current.pressure,
        visibility: Math.round(current.visibility / 1609.34), // Convert meters to miles
        uvIndex: Math.round(current.uvi),
        cloudiness: current.clouds,
      }
    } catch (error) {
      console.error('OpenWeatherMap current weather error:', error)
      throw error
    }
  }

  /**
   * Get weather details (sunrise, sunset, etc.)
   */
  async getWeatherDetails(latitude, longitude, date = new Date()) {
    try {
      const data = await this.fetchOneCall(latitude, longitude)

      // Find the daily data for the target date
      const targetDay = startOfDay(date)
      const dailyData = data.daily.find(d => {
        const dayTime = new Date(d.dt * 1000)
        return startOfDay(dayTime).getTime() === targetDay.getTime()
      }) || data.daily[0]

      return {
        sunrise: format(new Date(dailyData.sunrise * 1000), 'h:mm a'),
        sunset: format(new Date(dailyData.sunset * 1000), 'h:mm a'),
        wind: `${Math.round(dailyData.wind_speed)} mph ${this.degreesToCardinal(dailyData.wind_deg)}`,
        humidity: `${dailyData.humidity}%`,
        uvIndex: Math.round(dailyData.uvi),
        visibility: `${Math.round((data.current.visibility || 10000) / 1609.34)} mi`,
      }
    } catch (error) {
      console.error('OpenWeatherMap weather details error:', error)
      throw error
    }
  }

  /**
   * Map OpenWeatherMap weather codes to emoji icons
   * @param {number} weatherCode - OWM weather condition code
   * @param {string} icon - OWM icon code (e.g., "01d", "01n")
   * @returns {string} Emoji icon
   */
  mapConditionToIcon(weatherCode, icon = '') {
    const isNight = icon.endsWith('n')

    // Thunderstorm (200-232)
    if (weatherCode >= 200 && weatherCode < 300) {
      return WeatherEmojis.STORMY
    }

    // Drizzle (300-321)
    if (weatherCode >= 300 && weatherCode < 400) {
      return WeatherEmojis.RAINY
    }

    // Rain (500-531)
    if (weatherCode >= 500 && weatherCode < 600) {
      return WeatherEmojis.RAINY
    }

    // Snow (600-622)
    if (weatherCode >= 600 && weatherCode < 700) {
      return WeatherEmojis.SNOWY
    }

    // Atmosphere (701-781) - mist, fog, etc.
    if (weatherCode >= 700 && weatherCode < 800) {
      return WeatherEmojis.FOGGY
    }

    // Clear (800)
    if (weatherCode === 800) {
      return isNight ? WeatherEmojis.MOON : WeatherEmojis.SUNNY
    }

    // Clouds (801-804)
    if (weatherCode === 801 || weatherCode === 802) {
      return WeatherEmojis.PARTLY_CLOUDY
    }

    if (weatherCode === 803 || weatherCode === 804) {
      return WeatherEmojis.CLOUDY
    }

    // Default
    return WeatherEmojis.CLOUDY
  }

  /**
   * Convert wind degrees to cardinal direction
   */
  degreesToCardinal(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }
}

export default OpenWeatherAdapter
