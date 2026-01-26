/**
 * Radar Service
 * Main service for managing radar data providers and layers
 */

import { NoaaRadarAdapter } from './adapters/noaaRadarAdapter.js'
import { getRadarProvider } from '../weather/config.js'
import { RADAR_LAYER_TYPES, RADAR_PAST_FRAMES } from './types.js'

class RadarService {
  constructor() {
    this.adapters = new Map()
    this.currentAdapter = null
    this.currentLayerType = RADAR_LAYER_TYPES.PRECIPITATION
    this.initialize()
  }

  /**
   * Initialize radar adapters
   */
  initialize() {
    // Initialize NOAA adapter (always available, no API key needed)
    const noaaAdapter = new NoaaRadarAdapter()
    this.adapters.set('noaa', noaaAdapter)

    // Set current adapter based on user preference
    const selectedProvider = getRadarProvider()
    this.currentAdapter = this.adapters.get(selectedProvider) || noaaAdapter
  }

  /**
   * Get current radar adapter
   * @returns {BaseRadarAdapter}
   */
  getCurrentAdapter() {
    return this.currentAdapter
  }

  /**
   * Switch to a different radar provider
   * @param {string} providerName - 'noaa' (more can be added later)
   */
  switchProvider(providerName) {
    const adapter = this.adapters.get(providerName)
    if (adapter) {
      this.currentAdapter = adapter
      // Clear cache when switching providers
      if (adapter.clearCache) {
        adapter.clearCache()
      }
      return true
    }
    console.warn(`Radar provider ${providerName} not found`)
    return false
  }

  /**
   * Get available layer types for current adapter
   * @returns {string[]}
   */
  getAvailableLayerTypes() {
    return this.currentAdapter.getAvailableLayerTypes()
  }

  /**
   * Set current layer type
   * @param {string} layerType - 'precipitation' or 'wind'
   */
  setLayerType(layerType) {
    if (this.currentAdapter.supportsLayerType(layerType)) {
      this.currentLayerType = layerType
      return true
    }
    return false
  }

  /**
   * Get current layer type
   * @returns {string}
   */
  getLayerType() {
    return this.currentLayerType
  }

  /**
   * Get tile layer configuration for current settings
   * @param {number} timestamp - Optional timestamp for time-based layers
   * @returns {Promise<RadarTileLayer>}
   */
  async getTileLayer(timestamp = null) {
    return await this.currentAdapter.getTileLayer(this.currentLayerType, timestamp)
  }

  /**
   * Get time frames for radar animation
   * @param {number} pastHours - Number of hours in the past (default: 4)
   * @returns {Promise<RadarFrame[]>}
   */
  async getTimeFrames(pastHours = 4) {
    return await this.currentAdapter.getTimeFrames(pastHours)
  }

  /**
   * Get radar provider name
   * @returns {string}
   */
  getProviderName() {
    return this.currentAdapter.getName()
  }

  /**
   * Refresh/clear caches
   */
  refresh() {
    if (this.currentAdapter.clearCache) {
      this.currentAdapter.clearCache()
    }
  }
}

// Export singleton instance
export const radarService = new RadarService()
export default radarService
