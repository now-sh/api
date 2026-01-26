const cheerioLoadWithTimeout = require('../utils/cheerioWithTimeout');
const { getJson } = require('../utils/httpClient');

// URLs for closings data
const ALBANY_CLOSINGS_URL = process.env.ALBANY_CLOSINGS_URL || 'https://wnyt.com/wp-content/uploads/dynamic-assets/schoolalert.html';
const UTICA_CLOSINGS_URL = process.env.UTICA_CLOSINGS_URL || 'https://amb-feeds.s3.amazonaws.com/WKTV_closings.json';

// Types





// Cache structure
let cache = {
  albany: { data: null, timestamp: 0 },
  utica: { data: null, timestamp: 0 },
  combined: { data: null, timestamp: 0 }
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache (closings update frequently)

/**
 * Parse Albany closings from HTML
 */
async function fetchAlbanyClosings() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache.albany.data && (now - cache.albany.timestamp) < CACHE_TTL) {
    return cache.albany.data;
  }
  
  try {
    const $ = await cheerioLoadWithTimeout(ALBANY_CLOSINGS_URL, { timeout: 5000 });
    
    const closings = [];
    const bodyText = $('body').text();
    const lastUpdatedMatch = bodyText.match(/Last Updated:\s*(.+?)(?:\s|$)/);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : null;
    const hasClosings = !bodyText.includes('no reported closings');
    
    if (hasClosings) {
      // Parse closings from WNYT - they use div.everyOther elements
      $('.everyOther').each((i, elem) => {
        const $elem = $(elem);
        // Name is in the <strong> tag
        const name = $elem.find('strong').text().trim();
        // Status/details is the text after the <br> tag
        const fullText = $elem.text().trim();
        const statusMatch = fullText.replace(name, '').trim();

        if (name && name.length > 1) {
          closings.push({
            name: name,
            status: statusMatch || 'Closed',
            region: 'Albany',
            source: 'WNYT'
          });
        }
      });
    }
    
    const result = {
      region: 'Albany',
      source: 'WNYT',
      lastUpdated: lastUpdated,
      count: closings.length,
      hasClosings: hasClosings,
      closings: closings,
      message: hasClosings ? null : 'There are currently no reported closings.'
    };
    
    // Update cache
    cache.albany = {
      data: result,
      timestamp: now
    };
    
    return result;
  } catch (error) {
    console.error('Failed to fetch Albany closings:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return cached data if available
    if (cache.albany.data) {
      return cache.albany.data;
    }
    
    // Return error response
    return {
      region: 'Albany',
      source: 'WNYT',
      error: error instanceof Error ? error.message : 'Unknown error',
      closings: [],
      count: 0,
      hasClosings: false,
      message: null
    };
  }
}

/**
 * Fetch Utica closings metadata from JSON
 * Note: WKTV's JSON only provides count/metadata, not individual closings.
 * Full list is available at their website (loaded via JavaScript).
 */
async function fetchUticaClosings() {
  const now = Date.now();

  // Return cached data if still valid
  if (cache.utica.data && (now - cache.utica.timestamp) < CACHE_TTL) {
    return cache.utica.data;
  }

  try {
    const data = await getJson(UTICA_CLOSINGS_URL, { timeout: 5000 });

    const count = parseInt(data.numClosings) || 0;
    const hasClosings = count > 0;

    const result = {
      region: 'Utica',
      source: 'WKTV',
      title: data.title || 'School and Business Closings',
      count: count,
      hasClosings: hasClosings,
      closings: [], // WKTV JSON doesn't include individual closings
      message: hasClosings
        ? `${count} closings reported. Visit WKTV website for full list.`
        : 'There are currently no reported closings.',
      url: data.closingsURL || 'https://www.wktv.com/weather/closings/',
      note: 'Individual closings list unavailable via API - visit WKTV website for details'
    };

    // Update cache
    cache.utica = {
      data: result,
      timestamp: now
    };

    return result;
  } catch (error) {
    console.error('Failed to fetch Utica closings:', error instanceof Error ? error.message : 'Unknown error');

    // Return cached data if available
    if (cache.utica.data) {
      return cache.utica.data;
    }

    // Return error response
    return {
      region: 'Utica',
      source: 'WKTV',
      error: error instanceof Error ? error.message : 'Unknown error',
      closings: [],
      count: 0,
      hasClosings: false,
      message: null,
      url: 'https://www.wktv.com/weather/closings/'
    };
  }
}

/**
 * Fetch all closings from both sources
 */
async function closings() {
  const now = Date.now();
  
  // Return cached combined data if still valid
  if (cache.combined.data && (now - cache.combined.timestamp) < CACHE_TTL) {
    return cache.combined.data;
  }
  
  try {
    // Fetch both sources in parallel
    const [albanyData, uticaData] = await Promise.all([
      fetchAlbanyClosings(),
      fetchUticaClosings()
    ]);
    
    const result = {
      timestamp: new Date().toISOString(),
      regions: {
        albany: albanyData,
        utica: uticaData
      },
      totalClosings: (albanyData.count || 0) + (uticaData.count || 0),
      hasClosings: albanyData.hasClosings || uticaData.hasClosings,
      sources: {
        albany: ALBANY_CLOSINGS_URL,
        utica: UTICA_CLOSINGS_URL
      }
    };
    
    // Update cache
    cache.combined = {
      data: result,
      timestamp: now
    };
    
    return result;
  } catch (error) {
    console.error('Failed to fetch closings:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return cached data if available
    if (cache.combined.data) {
      return cache.combined.data;
    }
    
    throw error;
  }
}

module.exports = closings;