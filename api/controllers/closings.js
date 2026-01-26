const cheerioLoadWithTimeout = require('../utils/cheerioWithTimeout');
const { getDateAsFriendlyLabel, getDayNameAsFriendlyLabel, formatLastUpdated } = require('../utils/dateUtils');
const { getErrorMessage, logError } = require('../utils/errorUtils');

// URLs for closings data
const ALBANY_CLOSINGS_URL = process.env.ALBANY_CLOSINGS_URL || 'https://wnyt.com/wp-content/uploads/dynamic-assets/schoolalert.html';
const UTICA_WKTV_URL = 'https://ftp2.wktv.com/CGSXML/All%20Active.html';
const UTICA_CNYCENTRAL_URL = 'https://cnycentral.com/resources/ftptransfer/wstm/closings/closings.htm';

// Cache structure
let cache = {
  albany: { data: null, timestamp: 0 },
  utica: { data: null, timestamp: 0 },
  combined: { data: null, timestamp: 0 }
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Infer category from organization name
 */
function inferCategory(name) {
  const lower = name.toLowerCase();
  if (/school|csd|\bsd\b|boces|academy|elementary|middle|high school|nursery|preschool|kindergarten/i.test(lower)) return 'Schools';
  if (/college|university|suny|mvcc|utica college/i.test(lower)) return 'Colleges';
  if (/church|parish|cathedral|temple|mosque|synagogue/i.test(lower)) return 'Churches';
  if (/library/i.test(lower)) return 'Public';
  if (/county|city of|town of|village of|court|dmv|social security|post office/i.test(lower)) return 'Govt';
  if (/ymca|ywca|senior center|food pantry|salvation army|arc |red cross|united way/i.test(lower)) return 'Organizations';
  return 'Business';
}

/**
 * Normalize organization name for deduplication
 */
function normalizeOrgName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(school|schools|district|csd|central|city|county|of|the|co|inc|llc|public|parochial)\b/g, '')
    .replace(/s\b/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Parse Albany closings from WNYT HTML
 */
async function fetchAlbanyClosings() {
  const now = Date.now();

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
      $('.everyOther').each((i, elem) => {
        const $elem = $(elem);
        const name = $elem.find('strong').text().trim();
        const fullText = $elem.text().trim();
        const status = fullText.replace(name, '').trim() || 'Closed';

        if (name && name.length > 1) {
          closings.push({
            category: inferCategory(name),
            name: name,
            status: status
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

    cache.albany = { data: result, timestamp: now };
    return result;
  } catch (error) {
    logError('fetchAlbanyClosings', error);

    if (cache.albany.data) {
      return cache.albany.data;
    }

    return {
      region: 'Albany',
      source: 'WNYT',
      error: getErrorMessage(error),
      closings: [],
      count: 0,
      hasClosings: false,
      message: null
    };
  }
}

/**
 * Fetch WKTV closings
 */
async function fetchWKTVClosings() {
  try {
    const $ = await cheerioLoadWithTimeout(UTICA_WKTV_URL, {
      timeout: 5000,
      fetchOptions: {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }
    });

    const closings = [];
    const msgs = [];
    $('.msg').each((i, el) => msgs.push($(el).text().trim()));
    const lastUpdated = msgs[1] || null;

    $('table.tableborder').each((i, table) => {
      const $table = $(table);
      const category = $table.find('.cat, .catdark').text().trim();
      const name = $table.find('.org, .orgdark').text().trim();
      const status = $table.find('.sts, .stsdark').text().trim();

      if (name) {
        closings.push({
          category: category || inferCategory(name),
          name: name,
          status: status || 'Closed'
        });
      }
    });

    return { closings, lastUpdated, error: null };
  } catch (error) {
    logError('fetchWKTVClosings', error);
    return { closings: [], lastUpdated: null, error: error.message };
  }
}

/**
 * Fetch CNY Central closings
 */
async function fetchCNYCentralClosings() {
  try {
    const $ = await cheerioLoadWithTimeout(UTICA_CNYCENTRAL_URL, { timeout: 5000 });

    const closings = [];
    const lastUpdatedText = $('.timestamp').text().trim();
    const lastUpdated = lastUpdatedText.replace(/^UPDATED\s*/i, '') || null;

    $('tr').each((i, row) => {
      const $row = $(row);
      const name = $row.find('.orgname').text().trim();
      const status = $row.find('.status').text().trim();

      if (name && status) {
        closings.push({
          category: inferCategory(name),
          name: name,
          status: status
        });
      }
    });

    return { closings, lastUpdated, error: null };
  } catch (error) {
    logError('fetchCNYCentralClosings', error);
    return { closings: [], lastUpdated: null, error: error.message };
  }
}

/**
 * Fetch Utica closings from WKTV + CNY Central (merged & deduplicated)
 */
async function fetchUticaClosings() {
  const now = Date.now();

  if (cache.utica.data && (now - cache.utica.timestamp) < CACHE_TTL) {
    return cache.utica.data;
  }

  try {
    const [wktvResult, cnycResult] = await Promise.all([
      fetchWKTVClosings(),
      fetchCNYCentralClosings()
    ]);

    const seenNames = new Set();
    const closings = [];

    // Add WKTV closings first (primary source)
    for (const closing of wktvResult.closings) {
      const normalized = normalizeOrgName(closing.name);
      if (!seenNames.has(normalized)) {
        seenNames.add(normalized);
        closings.push(closing);
      }
    }

    // Add CNY Central closings that aren't duplicates
    for (const closing of cnycResult.closings) {
      const normalized = normalizeOrgName(closing.name);
      if (!seenNames.has(normalized)) {
        seenNames.add(normalized);
        closings.push(closing);
      }
    }

    // Sort alphabetically by name
    closings.sort((a, b) => a.name.localeCompare(b.name));

    const hasClosings = closings.length > 0;
    const lastUpdated = wktvResult.lastUpdated || cnycResult.lastUpdated;

    const result = {
      region: 'Utica',
      source: 'WKTV + CNY Central',
      lastUpdated: lastUpdated,
      count: closings.length,
      hasClosings: hasClosings,
      closings: closings,
      message: hasClosings ? null : 'There are currently no reported closings.'
    };

    cache.utica = { data: result, timestamp: now };
    return result;
  } catch (error) {
    logError('fetchUticaClosings', error);

    if (cache.utica.data) {
      return cache.utica.data;
    }

    return {
      region: 'Utica',
      source: 'WKTV + CNY Central',
      error: getErrorMessage(error),
      closings: [],
      count: 0,
      hasClosings: false,
      message: null
    };
  }
}

/**
 * Normalize status to show friendly date labels
 */
function normalizeStatus(status) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const todayDateStr = `${todayMonth}/${todayDay}`;

  if (!status) return `Closed Today(${todayDateStr})`;

  // Match date patterns like "1/26/2026", "1/26", "Monday, 1/26/2026", etc.
  const datePattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/;
  const match = status.match(datePattern);

  if (match) {
    const statusMonth = parseInt(match[1], 10);
    const statusDay = parseInt(match[2], 10);
    const statusYear = match[3] ? parseInt(match[3], 10) : null;

    const friendlyLabel = getDateAsFriendlyLabel(statusMonth, statusDay, statusYear);

    let newStatus = status
      .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/gi, '')
      .replace(datePattern, friendlyLabel)
      .replace(/\s*-\s*(Today|Tomorrow)/, ' $1')
      .replace(/\s+/g, ' ')
      .trim();
    return newStatus;
  }

  // No numeric date - try to parse day name
  const dayPattern = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i;
  const dayMatch = status.match(dayPattern);

  if (dayMatch) {
    const friendlyLabel = getDayNameAsFriendlyLabel(dayMatch[1]);

    let newStatus = status
      .replace(dayPattern, friendlyLabel)
      .replace(/\s+/g, ' ')
      .trim();
    return newStatus;
  }

  // No date or day found - assume today
  if (/closed|closing/i.test(status)) {
    return status.replace(/\b(closed|closing)\b/i, `$1 Today(${todayDateStr})`).replace(/\s+/g, ' ').trim();
  }

  return `${status} Today(${todayDateStr})`.replace(/\s+/g, ' ').trim();
}

/**
 * Fetch all closings from both regions and group by category
 */
async function closings() {
  const now = Date.now();

  if (cache.combined.data && (now - cache.combined.timestamp) < CACHE_TTL) {
    return cache.combined.data;
  }

  try {
    const [albanyData, uticaData] = await Promise.all([
      fetchAlbanyClosings(),
      fetchUticaClosings()
    ]);

    // Format lastUpdated for each region
    const albanyLastUpdated = formatLastUpdated(albanyData.lastUpdated);
    const uticaLastUpdated = formatLastUpdated(uticaData.lastUpdated);

    // Combine all closings from both regions
    const allClosings = [
      ...(albanyData.closings || []).map(c => ({ ...c, region: 'Albany', lastUpdated: albanyLastUpdated })),
      ...(uticaData.closings || []).map(c => ({ ...c, region: 'Utica', lastUpdated: uticaLastUpdated }))
    ];

    // Group by category
    const grouped = {
      schools: [],
      colleges: [],
      churches: [],
      government: [],
      public: [],
      organizations: [],
      business: []
    };

    for (const closing of allClosings) {
      const category = (closing.category || 'Business').toLowerCase();
      const entry = {
        name: closing.name,
        status: normalizeStatus(closing.status),
        region: closing.region,
        lastUpdated: closing.lastUpdated
      };

      if (category === 'schools') grouped.schools.push(entry);
      else if (category === 'colleges') grouped.colleges.push(entry);
      else if (category === 'churches') grouped.churches.push(entry);
      else if (category === 'govt' || category === 'government') grouped.government.push(entry);
      else if (category === 'public') grouped.public.push(entry);
      else if (category === 'organizations') grouped.organizations.push(entry);
      else grouped.business.push(entry);
    }

    // Sort each category alphabetically by name
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Use most recent formatted lastUpdated for top-level
    const lastUpdated = albanyLastUpdated || uticaLastUpdated;

    const result = {
      lastUpdated: lastUpdated,
      closures: allClosings.length,
      ...grouped
    };

    cache.combined = { data: result, timestamp: now };
    return result;
  } catch (error) {
    logError('closings', error);

    if (cache.combined.data) {
      return cache.combined.data;
    }

    throw error;
  }
}

module.exports = closings;
