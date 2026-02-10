/**
 * Radar service type definitions
 */

/**
 * Radar layer types
 * @typedef {'precipitation' | 'wind'} RadarLayerType
 */

/**
 * Radar frame timestamp and URL
 * @typedef {Object} RadarFrame
 * @property {Date} timestamp - The time of this radar frame
 * @property {string} url - URL pattern for tile fetching (may contain {z}/{x}/{y} placeholders)
 * @property {string} timeString - Formatted time string for display
 */

/**
 * Radar tile layer configuration
 * @typedef {Object} RadarTileLayer
 * @property {string} url - Tile URL pattern with {z}/{x}/{y} placeholders
 * @property {number} maxZoom - Maximum zoom level
 * @property {number} minZoom - Minimum zoom level
 * @property {string} attribution - Attribution text for the layer
 * @property {number} opacity - Layer opacity (0-1)
 * @property {number} zIndex - Z-index for layer ordering
 */

/**
 * Animation state
 * @typedef {Object} AnimationState
 * @property {boolean} isPlaying - Whether animation is currently playing
 * @property {number} currentFrameIndex - Index of currently displayed frame
 * @property {number} speed - Animation speed (frames per second)
 */

export const RADAR_LAYER_TYPES = {
  PRECIPITATION: 'precipitation',
  WIND: 'wind',
}

export const DEFAULT_ANIMATION_SPEED = 2 // frames per second
export const MIN_ANIMATION_SPEED = 0.5
export const MAX_ANIMATION_SPEED = 10

// NOAA radar update interval (approximately 10 minutes)
export const RADAR_UPDATE_INTERVAL = 10 * 60 * 1000

// Number of past frames to fetch for animation (4 hours = 24 frames at 10-min intervals)
export const RADAR_PAST_FRAMES = 24

// Default radar map center for US (geographic center)
export const DEFAULT_RADAR_CENTER = {
  lat: 39.8283,
  lon: -98.5795,
  zoom: 4,
}
