import NoaaSpaceWeatherAdapter from './noaaAdapter.js'
import { getCache, setCache, clearAllCache } from './cache.js'

/**
 * Space Weather Service
 * Provides a unified interface to space weather data with caching
 */
class SpaceWeatherService {
  constructor() {
    this.adapter = new NoaaSpaceWeatherAdapter()

    // Cache TTLs
    this.cacheTTL = {
      data: 5 * 60 * 1000,      // 5 minutes for data
      images: 15 * 60 * 1000,    // 15 minutes for images
      animation: 30 * 60 * 1000  // 30 minutes for animation metadata
    }
  }

  /**
   * Get KP Index historical data
   */
  async getKpIndex() {
    const cacheKey = 'kp_index'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached KP index')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching KP index from API')
    const data = await this.adapter.getKpIndex()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get X-Ray Flux data
   */
  async getXrayFlux() {
    const cacheKey = 'xray_flux'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached X-ray flux')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching X-ray flux from API')
    const data = await this.adapter.getXrayFlux()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get recent solar flares
   */
  async getSolarFlares() {
    const cacheKey = 'solar_flares'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached solar flares')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching solar flares from API')
    const data = await this.adapter.getSolarFlares()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get space weather alerts
   */
  async getAlerts() {
    const cacheKey = 'alerts'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached alerts')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching alerts from API')
    const data = await this.adapter.getAlerts()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get current sunspot number
   */
  async getSunspotNumber() {
    const cacheKey = 'sunspot_number'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached sunspot number')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching sunspot number from API')
    const data = await this.adapter.getSunspotNumber()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get WSA-Enlil animation data
   */
  async getEnlilAnimation() {
    const cacheKey = 'enlil_animation'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached Enlil animation')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching Enlil animation from API')
    const data = await this.adapter.getEnlilAnimation()
    if (data) {
      setCache(cacheKey, data, this.cacheTTL.animation)
    }
    return data
  }

  /**
   * Get LASCO C3 coronograph image URL
   */
  async getLascoC3Image() {
    const cacheKey = 'lasco_c3'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached LASCO C3 URL')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching LASCO C3 image URL')
    const url = await this.adapter.getLascoC3Image()
    setCache(cacheKey, url, this.cacheTTL.images)
    return url
  }

  /**
   * Get solar wind data
   */
  async getSolarWind() {
    const cacheKey = 'solar_wind'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached solar wind')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching solar wind from API')
    const data = await this.adapter.getSolarWind()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get proton flux
   */
  async getProtonFlux() {
    const cacheKey = 'proton_flux'
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[SpaceWeatherService] Using cached proton flux')
      return cached
    }

    console.log('[SpaceWeatherService] Fetching proton flux from API')
    const data = await this.adapter.getProtonFlux()
    setCache(cacheKey, data, this.cacheTTL.data)
    return data
  }

  /**
   * Get all space weather data at once
   * Useful for initial load
   */
  async getAllData() {
    try {
      const [
        kpIndex,
        xrayFlux,
        solarFlares,
        alerts,
        sunspotNumber,
        enlilAnimation,
        lascoImage,
        solarWind,
        protonFlux
      ] = await Promise.allSettled([
        this.getKpIndex(),
        this.getXrayFlux(),
        this.getSolarFlares(),
        this.getAlerts(),
        this.getSunspotNumber(),
        this.getEnlilAnimation(),
        this.getLascoC3Image(),
        this.getSolarWind(),
        this.getProtonFlux()
      ])

      return {
        kpIndex: kpIndex.status === 'fulfilled' ? kpIndex.value : null,
        xrayFlux: xrayFlux.status === 'fulfilled' ? xrayFlux.value : null,
        solarFlares: solarFlares.status === 'fulfilled' ? solarFlares.value : [],
        alerts: alerts.status === 'fulfilled' ? alerts.value : [],
        sunspotNumber: sunspotNumber.status === 'fulfilled' ? sunspotNumber.value : null,
        enlilAnimation: enlilAnimation.status === 'fulfilled' ? enlilAnimation.value : null,
        lascoImage: lascoImage.status === 'fulfilled' ? lascoImage.value : null,
        solarWind: solarWind.status === 'fulfilled' ? solarWind.value : null,
        protonFlux: protonFlux.status === 'fulfilled' ? protonFlux.value : null,
      }
    } catch (error) {
      console.error('[SpaceWeatherService] Error fetching all data:', error)
      throw error
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    clearAllCache()
  }
}

// Export singleton instance
const spaceWeatherService = new SpaceWeatherService()
export default spaceWeatherService
