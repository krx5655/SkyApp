/**
 * Base Radar Adapter
 * Abstract interface that all radar adapters must implement
 */

export class BaseRadarAdapter {
  constructor() {
    if (this.constructor === BaseRadarAdapter) {
      throw new Error('BaseRadarAdapter is abstract and cannot be instantiated directly')
    }
  }

  /**
   * Get the adapter name
   * @returns {string}
   */
  getName() {
    throw new Error('getName() must be implemented by subclass')
  }

  /**
   * Get available radar layer types
   * @returns {string[]} Array of layer type identifiers
   */
  getAvailableLayerTypes() {
    throw new Error('getAvailableLayerTypes() must be implemented by subclass')
  }

  /**
   * Get tile layer configuration for a specific layer type
   * @param {string} layerType - Type of radar layer ('precipitation', 'wind', etc.)
   * @param {number} timestamp - Unix timestamp for time-based layers (optional)
   * @returns {Promise<RadarTileLayer>}
   */
  async getTileLayer(layerType, timestamp = null) {
    throw new Error('getTileLayer() must be implemented by subclass')
  }

  /**
   * Get available time frames for animation
   * @param {number} pastHours - Number of hours in the past to fetch
   * @returns {Promise<RadarFrame[]>} Array of radar frames with timestamps and URLs
   */
  async getTimeFrames(pastHours = 4) {
    throw new Error('getTimeFrames() must be implemented by subclass')
  }

  /**
   * Check if this adapter supports a specific layer type
   * @param {string} layerType - Layer type to check
   * @returns {boolean}
   */
  supportsLayerType(layerType) {
    return this.getAvailableLayerTypes().includes(layerType)
  }

  /**
   * Format timestamp for display
   * @param {Date} timestamp
   * @returns {string}
   */
  formatTimestamp(timestamp) {
    const hours = timestamp.getHours()
    const minutes = timestamp.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes} ${ampm}`
  }
}
