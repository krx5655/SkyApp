/**
 * NOAA Radar Adapter
 * Uses NOAA's Multi-Radar/Multi-Sensor (MRMS) system for radar data
 */

import { BaseRadarAdapter } from './baseRadarAdapter.js'
import { RADAR_LAYER_TYPES } from '../types.js'

export class NoaaRadarAdapter extends BaseRadarAdapter {
  constructor() {
    super()
    this.name = 'NOAA'

    // NOAA MRMS Radar services
    this.services = {
      precipitation: {
        // Base reflectivity - time-enabled
        url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
        exportUrl: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer/exportImage',
        timestampsUrl: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
      },
      wind: {
        // Radar velocity (if needed in future)
        url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_velocity_time/ImageServer',
        exportUrl: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_velocity_time/ImageServer/exportImage',
      },
    }

    // Cache for time frames to avoid repeated API calls
    this.timeFramesCache = null
    this.timeFramesCacheTime = null
    this.cacheValidityMs = 5 * 60 * 1000 // 5 minutes
  }

  getName() {
    return this.name
  }

  getAvailableLayerTypes() {
    return [RADAR_LAYER_TYPES.PRECIPITATION] // Wind can be added later
  }

  /**
   * Get available timestamps from NOAA ImageServer
   * @returns {Promise<number[]>} Array of Unix timestamps (milliseconds)
   */
  async getAvailableTimestamps() {
    try {
      const url = `${this.services.precipitation.timestampsUrl}?f=json`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`NOAA API request failed: ${response.status}`)
      }

      const data = await response.json()

      // NOAA returns time info in the service metadata
      // The time extent is in the format: [startTime, endTime]
      // We need to query the multidimensional info for available times
      const mdInfoUrl = `${this.services.precipitation.timestampsUrl}/multidimensionalInfo?f=json`
      const mdResponse = await fetch(mdInfoUrl)

      if (!mdResponse.ok) {
        // If multidimensional info not available, use current time
        return [Date.now()]
      }

      const mdData = await mdResponse.json()

      // Extract available timestamps from multidimensional info
      if (mdData.multidimensionalInfo?.variables) {
        const variable = mdData.multidimensionalInfo.variables[0]
        if (variable?.dimensions) {
          const timeDim = variable.dimensions.find(d => d.name === 'StdTime')
          if (timeDim?.values) {
            // Convert NOAA timestamps to JavaScript timestamps
            return timeDim.values.map(t => parseInt(t))
          }
        }
      }

      // Fallback: generate timestamps for past 4 hours at 10-minute intervals
      const now = Date.now()
      const timestamps = []
      for (let i = 0; i < 24; i++) {
        timestamps.unshift(now - (i * 10 * 60 * 1000))
      }
      return timestamps

    } catch (error) {
      console.warn('Failed to get NOAA timestamps, using fallback:', error)

      // Fallback: generate reasonable timestamps
      const now = Date.now()
      const timestamps = []
      for (let i = 0; i < 24; i++) {
        timestamps.unshift(now - (i * 10 * 60 * 1000))
      }
      return timestamps
    }
  }

  /**
   * Get tile layer configuration for NOAA radar
   * @param {string} layerType - 'precipitation' or 'wind'
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @returns {Promise<RadarTileLayer>}
   */
  async getTileLayer(layerType, timestamp = null) {
    if (!this.supportsLayerType(layerType)) {
      throw new Error(`Layer type ${layerType} not supported by NOAA adapter`)
    }

    const service = this.services[layerType]
    const time = timestamp || Date.now()

    // NOAA uses ArcGIS ImageServer tile format
    // We'll use the export endpoint to get tiles
    const tileUrl = this.buildTileUrl(service.exportUrl, time)

    return {
      url: tileUrl,
      maxZoom: 10,
      minZoom: 3,
      attribution: 'NOAA/NWS Radar',
      opacity: 0.7,
      zIndex: 200,
    }
  }

  /**
   * Build tile URL for NOAA radar
   * Note: This returns a special URL that will be processed by our custom tile loader
   * @param {string} baseUrl - Base export URL
   * @param {number} timestamp - Unix timestamp
   * @returns {string}
   */
  buildTileUrl(baseUrl, timestamp) {
    // For NOAA, we'll use a special format that our custom tile loader will understand
    // The actual tile fetching will happen in the component
    return `${baseUrl}?time=${timestamp}`
  }

  /**
   * Get radar frames for animation
   * @param {number} pastHours - Number of hours in the past
   * @returns {Promise<RadarFrame[]>}
   */
  async getTimeFrames(pastHours = 4) {
    // Check cache first
    const now = Date.now()
    if (this.timeFramesCache &&
        this.timeFramesCacheTime &&
        (now - this.timeFramesCacheTime) < this.cacheValidityMs) {
      return this.timeFramesCache
    }

    try {
      const timestamps = await this.getAvailableTimestamps()

      // Filter to only include timestamps within the requested time range
      const cutoffTime = now - (pastHours * 60 * 60 * 1000)
      const filteredTimestamps = timestamps.filter(t => t >= cutoffTime && t <= now)

      // Sort timestamps (most recent last)
      filteredTimestamps.sort((a, b) => a - b)

      // Create frames
      const frames = filteredTimestamps.map(ts => ({
        timestamp: new Date(ts),
        url: this.services.precipitation.exportUrl,
        time: ts,
        timeString: this.formatTimestamp(new Date(ts)),
      }))

      // Cache the results
      this.timeFramesCache = frames
      this.timeFramesCacheTime = now

      return frames

    } catch (error) {
      console.error('Failed to get NOAA time frames:', error)

      // Return a single frame for current time as fallback
      return [{
        timestamp: new Date(now),
        url: this.services.precipitation.exportUrl,
        time: now,
        timeString: this.formatTimestamp(new Date(now)),
      }]
    }
  }

  /**
   * Clear the time frames cache (called when switching layers or refreshing)
   */
  clearCache() {
    this.timeFramesCache = null
    this.timeFramesCacheTime = null
  }
}
