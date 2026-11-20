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

      if (!data || data.length === 0) {
        console.warn('[NoaaAdapter] No KP index data received')
        return []
      }

      // NOAA changed their API: now returns array of objects with no header row.
      // New: [{"time_tag":"2026-04-16T00:00:00","Kp":0.67,...}, ...]
      // Old: [["time_tag","Kp",...], ["2026-02-02 18:00:00.000","1.33",...], ...]
      const isObjectFormat = !Array.isArray(data[0])
      const rows = isObjectFormat ? data : data.slice(1)

      return rows.map(row => {
        const timeRaw = isObjectFormat ? row.time_tag : row[0]
        const kpRaw = isObjectFormat ? row.Kp : row[1]
        return {
          time: this.parseUTCDate(String(timeRaw).replace(' ', 'T')),
          kp: parseFloat(kpRaw),
          timestamp: timeRaw
        }
      }).filter(p => p.time instanceof Date && !isNaN(p.time) && !isNaN(p.kp))
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
      // Filter to the long channel (0.1-0.8nm) used for NOAA flare classification.
      // The API returns both the long channel and the short channel (0.05-0.4nm),
      // which has values ~10x smaller and would shift data 1-2 flare classes too low.
      const longChannel = data.filter(item => item.energy === '0.1-0.8nm')
      return longChannel.map(item => ({
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
   * Get recent solar flares (last 7 days, newest first)
   * @returns {Promise<Array>}
   */
  async getSolarFlares() {
    try {
      // xray-flares-latest.json only holds the current event and has no class field;
      // the 7-day list has every flare with its peak class (max_class), oldest first.
      const data = await this.fetch('/json/goes/primary/xray-flares-7-day.json')
      return data
        .filter(item => item.max_time && item.max_class)
        .map(item => ({
          beginTime: this.parseUTCDate(item.begin_time),
          maxTime: this.parseUTCDate(item.max_time),
          endTime: this.parseUTCDate(item.end_time),
          classType: item.max_class,
          timestamp: item.begin_time
        }))
        .sort((a, b) => b.maxTime - a.maxTime)
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
   * Get sunspot number (SWPC daily observed)
   * @returns {Promise<Object>}
   */
  async getSunspotNumber() {
    try {
      // Daily values, oldest first: [{"Obsdate":"2026-11-19T00:00:00","swpc_ssn":80}, ...]
      // (observed-solar-cycle-indices.json is monthly, so it lagged by a month.)
      const data = await this.fetch('/json/solar-cycle/swpc_observed_ssn.json')
      const valid = (data || []).filter(d => d.Obsdate && Number.isFinite(parseFloat(d.swpc_ssn)))
      if (valid.length > 0) {
        const latest = valid[valid.length - 1]
        return {
          count: Math.round(parseFloat(latest.swpc_ssn)),
          date: this.parseUTCDate(latest.Obsdate),
          timestamp: latest.Obsdate
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
      // Format: [{"url":"/images/animations/enlil/enlil_com2_58627_20261116T180000.jpg"}, ...]
      // one entry per frame; the frame's UTC time is encoded at the end of the file name.
      const data = await this.fetch('/products/animations/enlil.json')
      if (!Array.isArray(data) || data.length === 0) {
        return null
      }

      const frames = data.filter(item => item && item.url)
      const frameTimes = frames.map(item => {
        const m = item.url.match(/_(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.\w+$/)
        return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null
      })

      return {
        imageUrls: frames.map(item => `${this.baseUrl}${item.url}`),
        frameTimes,
        timestamp: frameTimes[0]
      }
    } catch (error) {
      console.error('[NoaaAdapter] Failed to get Enlil animation:', error)
      // Return null instead of throwing - Enlil data may not always be available
      return null
    }
  }

  /**
   * Get solar wind data
   * @returns {Promise<Object>}
   */
  async getSolarWind() {
    try {
      // Plasma (speed/density) is in rtsw_wind_1m; magnetic field (Bz/Bt) is in rtsw_mag_1m.
      // Both files mix several spacecraft and are newest-first; only `active` rows are the
      // spacecraft NOAA is currently using.
      const [wind, mag] = await Promise.all([
        this.fetch('/json/rtsw/rtsw_wind_1m.json'),
        this.fetch('/json/rtsw/rtsw_mag_1m.json').catch(() => [])
      ])
      const newestActive = (rows, field) => (rows || [])
        .filter(r => r.active && r[field] != null)
        .reduce((best, r) => (!best || r.time_tag > best.time_tag ? r : best), null)

      const latest = newestActive(wind, 'proton_speed')
      if (latest) {
        const latestMag = newestActive(mag, 'bz_gsm')
        return {
          speed: parseFloat(latest.proton_speed),
          density: latest.proton_density != null ? parseFloat(latest.proton_density) : null,
          bz: latestMag ? parseFloat(latestMag.bz_gsm) : null,
          bt: latestMag ? parseFloat(latestMag.bt) : null,
          source: latest.source,
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
      // The file holds four energy channels; NOAA's S-scale (radiation storms) uses >=10 MeV.
      const tenMeV = (data || []).filter(item => item.energy === '>=10 MeV')
      if (tenMeV.length > 0) {
        const latest = tenMeV.reduce((best, r) => (r.time_tag > best.time_tag ? r : best))
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
