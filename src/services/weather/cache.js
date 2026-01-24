/**
 * Simple localStorage-based cache with TTL (Time To Live)
 */

const CACHE_PREFIX = 'weather_cache_'
const DEFAULT_TTL = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Store data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 15 min)
 */
export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Failed to set cache:', error)
  }
}

/**
 * Retrieve data from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
export function getCache(key) {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const { data, timestamp, ttl } = JSON.parse(cached)
    const age = Date.now() - timestamp

    if (age > ttl) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  } catch (error) {
    console.warn('Failed to get cache:', error)
    return null
  }
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key
 */
export function clearCache(key) {
  try {
    const cacheKey = CACHE_PREFIX + key
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

/**
 * Clear all weather caches
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear all cache:', error)
  }
}

export default {
  setCache,
  getCache,
  clearCache,
  clearAllCache,
}
