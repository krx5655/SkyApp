/**
 * Geocoding Service
 * Uses OpenStreetMap Nominatim API for free geocoding
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

/**
 * Search for locations by city name
 * @param {string} query - City name to search for
 * @returns {Promise<Array>} Array of location results
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const url = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
    })

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SkyApp Weather Display',
      },
    })

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const results = await response.json()

    // Format results
    return results.map(result => ({
      id: result.place_id,
      name: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || result.name,
      state: result.address?.state || '',
      country: result.address?.country || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}

/**
 * Reverse geocode coordinates to location name
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Location object
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?` + new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
    })

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SkyApp Weather Display',
      },
    })

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }

    const result = await response.json()

    return {
      name: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || result.name,
      state: result.address?.state || '',
      country: result.address?.country || '',
      latitude,
      longitude,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    throw error
  }
}

export default {
  searchCities,
  reverseGeocode,
}
