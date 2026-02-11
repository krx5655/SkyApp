/**
 * NOAA SWPC (Space Weather Prediction Center) Adapter
 * Fetches real-time space weather data from NOAA services
 */
class NoaaSpaceWeatherAdapter {
  constructor() {
    this.baseUrl = 'https://services.swpc.noaa.gov'
  }

  /**
   * Helper: Parse NOAA timestamp to UTC Date
   * Some NOAA endpoints include Z suffix, some don't
   * @param {string} timestamp - ISO timestamp string
   * @returns {Date}
   */
  parseUTCDate(timestamp) {
    if (!timestamp) return null
    // If already has Z suffix, use as-is, otherwise add it
    const utcTimestamp = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z'
    return new Date(utcTimestamp)
  }

  /**
   * Fetch data from NOAA API with error handling
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>}
   */
  async fetch(endpoint) {
    const url = `${this.baseUrl}${endpoint}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`[NoaaAdapter] Failed to fetch ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Get KP Index data (last 3 days)
   * @returns {Promise<Array>}
   */
  async getKpIndex() {
    try {
      const data = await this.fetch('/products/noaa-planetary-k-index.json')

      console.log('[NoaaAdapter] Raw KP Index JSON response:', data)
      console.log('[NoaaAdapter] Total rows received:', data?.length)
      console.log('[NoaaAdapter] First 5 rows:', data?.slice(0, 5))

      if (!data || data.length === 0) {
        console.warn('[NoaaAdapter] No KP index data received')
        return []
      }

      // Skip header row (first element is ["time_tag", "Kp", "a_running", "station_count"])
      const dataRows = data.slice(1)

      // Each row is an array: ["2026-02-02 18:00:00.000", "1.33", "5", "8"]
      // [0] = time_tag, [1] = Kp, [2] = a_running, [3] = station_count
      const parsed = dataRows.map(row => ({
        time: this.parseUTCDate(row[0].replace(' ', 'T')), // Convert space to T for ISO format
        kp: parseFloat(row[1]),
        timestamp: row[0]
      }))

      console.log('[NoaaAdapter] Parsed KP data (first 3):', parsed.slice(0, 3))
      console.log('[NoaaAdapter] Parsed KP data (last 3):', parsed.slice(-3))

      return parsed
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get KP index:', error)
      throw error
    }
  }

  /**
   * Get X-Ray Flux data (GOES satellite)
   * @returns {Promise<Array>}
   */
  async getXrayFlux() {
    try {
      const data = await this.fetch('/json/goes/primary/xrays-3-day.json')
      return data.map(item => ({
        time: this.parseUTCDate(item.time_tag),
        flux: parseFloat(item.flux),
        timestamp: item.time_tag,
        satellite: item.satellite || 'unknown'
      }))
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get X-ray flux:', error)
      throw error
    }
  }

  /**
   * Get recent solar flares
   * @returns {Promise<Array>}
   */
  async getSolarFlares() {
    try {
      const data = await this.fetch('/json/goes/primary/xray-flares-latest.json')
      return data.map(item => ({
        beginTime: this.parseUTCDate(item.begin_time),
        maxTime: this.parseUTCDate(item.max_time),
        endTime: this.parseUTCDate(item.end_time),
        classType: item.class_type,
        sourceLocation: item.source_location || 'Unknown',
        activeRegion: item.active_region || null,
        timestamp: item.begin_time
      }))
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get solar flares:', error)
      throw error
    }
  }

  /**
   * Get space weather alerts
   * @returns {Promise<Array>}
   */
  async getAlerts() {
    try {
      const data = await this.fetch('/products/alerts.json')
      return data.map(alert => ({
        issueTime: this.parseUTCDate(alert.issue_datetime),
        message: alert.message,
        product: alert.product_id,
        serial: alert.serial_number,
        timestamp: alert.issue_datetime
      }))
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get alerts:', error)
      throw error
    }
  }

  /**
   * Get sunspot number (current observed)
   * @returns {Promise<Object>}
   */
  async getSunspotNumber() {
    try {
      const data = await this.fetch('/json/solar-cycle/observed-solar-cycle-indices.json')
      // Get the most recent sunspot number
      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        console.log('[NoaaAdapter] Sunspot data structure:', latest)
        return {
          count: Math.round(parseFloat(latest.ssn)),
          smoothedCount: Math.round(parseFloat(latest.smoothed_ssn)),
          date: this.parseUTCDate(latest.time_tag),
          timestamp: latest.time_tag
        }
      }
      throw new Error('No sunspot data available')
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get sunspot number:', error)
      throw error
    }
  }

  /**
   * Get WSA-Enlil animation metadata
   * @returns {Promise<Object>}
   */
  async getEnlilAnimation() {
    try {
      const data = await this.fetch('/products/animations/enlil.json')
      console.log('[NoaaAdapter] Enlil raw response:', data)

      if (!data) {
        return null
      }

      // Handle both array and single object responses
      const enlilData = Array.isArray(data) ? data[0] : data
      console.log('[NoaaAdapter] Enlil data after array check:', enlilData)

      if (!enlilData) {
        return null
      }

      console.log('[NoaaAdapter] Enlil field names:', Object.keys(enlilData))

      return {
        modelCompletionTime: enlilData.model_completion_time,
        imageUrls: enlilData.images?.map(img => `${this.baseUrl}${img}`) || [],
        timestamp: enlilData.model_completion_time
      }
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get Enlil animation:', error)
      // Return null instead of throwing - Enlil data may not always be available
      return null
    }
  }

  /**
   * Get LASCO C3 coronograph image URL
   * @returns {Promise<string>}
   */
  async getLascoC3Image() {
    // Just return the URL directly - CORS prevents HEAD requests
    // The <img> tag will handle loading the image properly
    return `https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg?t=${Date.now()}`
  }

  /**
   * Get solar wind data
   * @returns {Promise<Object>}
   */
  async getSolarWind() {
    try {
      const data = await this.fetch('/json/rtsw/rtsw_mag_1m.json')
      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        console.log('[NoaaAdapter] Solar wind data structure:', latest)
        return {
          speed: parseFloat(latest.speed) || 0,
          density: parseFloat(latest.density) || 0,
          bz: parseFloat(latest.bz_gsm) || 0,
          bt: parseFloat(latest.bt) || 0,
          time: this.parseUTCDate(latest.time_tag),
          timestamp: latest.time_tag
        }
      }
      throw new Error('No solar wind data available')
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get solar wind:', error)
      throw error
    }
  }

  /**
   * Get proton flux
   * @returns {Promise<Object>}
   */
  async getProtonFlux() {
    try {
      const data = await this.fetch('/json/goes/primary/integral-protons-plot-6-hour.json')
      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        return {
          flux: parseFloat(latest.flux) || 0,
          energy: latest.energy,
          time: this.parseUTCDate(latest.time_tag),
          timestamp: latest.time_tag
        }
      }
      throw new Error('No proton flux data available')
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get proton flux:', error)
      throw error
    }
  }
}

export default NoaaSpaceWeatherAdapter
