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
      // Parse actual closings when they exist
      // Look for common patterns like lists, tables, or divs
      $('li, tr, .closing-item, .alert-item').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && !text.includes('Last Updated') && text.length > 3) {
          closings.push({
            name: text,
            status: 'Closed', // Default status
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
 * Parse Utica closings from JSON
 */
async function fetchUticaClosings() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache.utica.data && (now - cache.utica.timestamp) < CACHE_TTL) {
    return cache.utica.data;
  }
  
  try {
    const data = await getJson(UTICA_CLOSINGS_URL, { timeout: 5000 });
    
    const closings = [];
    const hasClosings = parseInt(data.numClosings) > 0;
    
    // Parse closings array if it exists
    if (data.closings && Array.isArray(data.closings)) {
      data.closings.forEach((closing) => {
        closings.push({
          name: closing.name || closing.organization || closing.school || 'Unknown',
          status: closing.status || 'Closed',
          region: 'Utica',
          source: 'WKTV',
          details: closing.details || null
        });
      });
    }
    
    const result = {
      region: 'Utica',
      source: 'WKTV',
      title: data.title,
      count: parseInt(data.numClosings) || 0,
      hasClosings: hasClosings,
      closings: closings,
      message: hasClosings ? null : 'There are currently no reported closings.',
      url: data.closingsURL
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
      message: null
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