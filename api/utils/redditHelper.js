const axios = require('axios');
const https = require('https');
const fetch = require('node-fetch');

// Reddit configuration
const REDDIT_BASE = 'https://www.reddit.com';
const REDDIT_OAUTH_BASE = 'https://oauth.reddit.com';
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

// Reddit API credentials from environment
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'API:v1.9.4 (by /u/casjay)';

// Default user agent - Windows 11 Edge (best compatibility)
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0';

// Firefox user agent as fallback
const FIREFOX_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0';

// Various user agents to try (Windows 11 Edge first)
const USER_AGENTS = [
  DEFAULT_USER_AGENT,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  FIREFOX_USER_AGENT,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'curl/7.68.0',
  'python-requests/2.31.0'
];

// OAuth token cache
let oauthToken = null;
let tokenExpiry = null;

/**
 * Get OAuth token for Reddit API
 */
async function getOAuthToken() {
  // Check if we have a valid token
  if (oauthToken && tokenExpiry && new Date() < tokenExpiry) {
    return oauthToken;
  }

  // Only try OAuth if credentials are configured
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    return null;
  }

  try {
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(REDDIT_TOKEN_URL, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': REDDIT_USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      }
    );

    if (response.data && response.data.access_token) {
      oauthToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      const expiresIn = response.data.expires_in || 3600;
      tokenExpiry = new Date(Date.now() + (expiresIn - 300) * 1000);
      console.log('✅ Reddit OAuth token obtained');
      return oauthToken;
    }
  } catch (error) {
    console.error('Reddit OAuth error:', error.message);
  }

  return null;
}

/**
 * Try to fetch data using OAuth API
 */
async function fetchWithOAuth(username, subreddit, limit) {
  const token = await getOAuthToken();
  if (!token) return null;

  try {
    const url = subreddit
      ? `${REDDIT_OAUTH_BASE}/r/${subreddit}/hot.json?limit=${limit}`
      : `${REDDIT_OAUTH_BASE}/user/${username}/about.json`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': REDDIT_USER_AGENT,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Reddit OAuth API request successful');
    return response.data;
  } catch (error) {
    console.error('Reddit OAuth API error:', error.message);
    // Clear token on auth errors
    if (error.response && error.response.status === 401) {
      oauthToken = null;
      tokenExpiry = null;
    }
    return null;
  }
}

/**
 * Main function to fetch Reddit data
 */
async function fetchRedditData(username, subreddit = null, limit = 25) {
  console.log(`Fetching Reddit data - ${subreddit ? `subreddit: ${subreddit}` : `user: ${username}`}`);
  
  // First try OAuth if configured
  const skipOAuth = process.env.REDDIT_SKIP_OAUTH === 'true';
  if (!skipOAuth && REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
    const oauthData = await fetchWithOAuth(username, subreddit, limit);
    if (oauthData) {
      console.log('✅ Using Reddit OAuth API data');
      oauthData.source = 'oauth';
      return oauthData;
    }
  }

  // Try direct JSON endpoints with old.reddit.com and reddit.com
  console.log('Trying direct JSON endpoints...');
  const jsonResult = await tryDirectJSONEndpoints(username, subreddit, limit);
  if (jsonResult) {
    console.log('✅ Direct JSON endpoint successful');
    jsonResult.source = 'json';
    return jsonResult;
  }

  // Fallback to RSS approach
  console.log('Using RSS fallback for Reddit data');
  try {
    const result = await fetchViaRSSFeed(username, subreddit, limit);
    if (result && result.data && result.data.children && result.data.children.length > 0) {
      console.log(`✅ RSS fetch successful - got ${result.data.children.length} posts`);
      result.source = 'rss';
      return result;
    }
  } catch (error) {
    console.error('RSS fetch error:', error.message);
  }

  // Final fallback: Try multiple JSON approaches (likely to fail but worth trying)
  console.log('RSS failed, trying JSON fallback methods...');
  try {
    const result = await fetchWithMultipleMethods(username, subreddit, limit);
    result.source = 'fallback';
    return result;
  } catch (error) {
    console.error('All fallback methods failed:', error.message);
    throw new Error(`Unable to fetch Reddit data for ${subreddit || username}. Reddit appears to be blocking API requests.`);
  }
}

/**
 * Primary fallback method: Fetch via RSS/Atom feeds (works reliably)
 */
async function fetchViaRSSFeed(username, subreddit, limit = 25) {
  const endpoints = [
    // RSS endpoints (XML format)
    {
      url: subreddit 
        ? `${REDDIT_BASE}/r/${subreddit}.rss?limit=${limit}`
        : `${REDDIT_BASE}/user/${username}.rss?limit=${limit}`,
      format: 'rss'
    },
    // Atom endpoints  
    {
      url: subreddit
        ? `${REDDIT_BASE}/r/${subreddit}/.rss`
        : `${REDDIT_BASE}/user/${username}/.rss`,
      format: 'atom'
    },
    // XML endpoints
    {
      url: subreddit
        ? `${REDDIT_BASE}/r/${subreddit}.xml?limit=${limit}`
        : `${REDDIT_BASE}/user/${username}.xml?limit=${limit}`,
      format: 'xml'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying RSS/Atom feed: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
        },
        timeout: 10000
      });

      if (!response.ok) {
        console.log(`RSS endpoint returned ${response.status}`);
        continue;
      }

      const text = await response.text();
      
      // Parse the RSS/Atom feed
      const result = parseRedditFeed(text, subreddit);
      if (result && result.data && result.data.children && result.data.children.length > 0) {
        return result;
      }
    } catch (error) {
      console.log(`RSS endpoint failed: ${error.message}`);
    }
  }

  throw new Error('All RSS endpoints failed');
}

/**
 * Parse Reddit RSS/Atom feed into Reddit JSON API format
 */
function parseRedditFeed(feedData, subreddit) {
  try {
    const items = [];
    
    // Check if it's Atom format
    if (feedData.includes('<feed xmlns="http://www.w3.org/2005/Atom"')) {
      // Parse Atom format
      const entryMatches = feedData.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi);
      
      if (entryMatches) {
        console.log(`Found ${entryMatches.length} Atom entries`);
        for (const entry of entryMatches.slice(0, 25)) {
          const title = entry.match(/<title[^>]*>(.*?)<\/title>/i);
          const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/i);
          const updated = entry.match(/<updated[^>]*>(.*?)<\/updated>/i);
          const author = entry.match(/<author[^>]*>[\s\S]*?<name[^>]*>(.*?)<\/name>[\s\S]*?<\/author>/i);
          const content = entry.match(/<content[^>]*>(.*?)<\/content>/is);
          const id = entry.match(/<id[^>]*>(.*?)<\/id>/i);
          
          if (title && link) {
            const titleText = decodeHTMLEntities(title[1]);
            const linkUrl = link[1];
            const authorName = author ? author[1].replace('/u/', '') : 'unknown';
            const postId = id ? id[1].split('/').pop() : null;
            
            items.push({
              kind: 't3',
              data: {
                id: postId,
                title: titleText,
                author: authorName,
                url: linkUrl,
                permalink: linkUrl.replace('https://www.reddit.com', ''),
                subreddit: subreddit || 'unknown',
                created_utc: updated ? Math.floor(new Date(updated[1]).getTime() / 1000) : Date.now() / 1000,
                score: 1, // RSS doesn't provide score
                num_comments: 0, // RSS doesn't provide comment count
                is_self: linkUrl.includes('/comments/'),
                selftext: content ? decodeHTMLEntities(content[1]).substring(0, 500) : ''
              }
            });
          }
        }
      }
    } else {
      // Parse RSS format
      const itemMatches = feedData.match(/<item[^>]*>[\s\S]*?<\/item>/gi);
      
      if (itemMatches) {
        console.log(`Found ${itemMatches.length} RSS items`);
        for (const item of itemMatches.slice(0, 25)) {
          const title = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                        item.match(/<title[^>]*>(.*?)<\/title>/i);
          const link = item.match(/<link[^>]*>(.*?)<\/link>/i);
          const description = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/is) || 
                             item.match(/<description[^>]*>(.*?)<\/description>/is);
          const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
          const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/i);
          
          if (title && link) {
            const titleText = decodeHTMLEntities(title[1]);
            const linkUrl = link[1];
            const postId = guid ? guid[1].split('/').pop() : null;
            
            // Extract author from title if present
            const authorMatch = titleText.match(/by (?:\/u\/)?([^\s\]]+)/i);
            const author = authorMatch ? authorMatch[1] : 'unknown';
            const cleanTitle = titleText.replace(/\s*by\s+(?:\/u\/)?[^\s\]]+.*$/, '').trim();
            
            items.push({
              kind: 't3',
              data: {
                id: postId,
                title: cleanTitle,
                author: author,
                url: linkUrl,
                permalink: linkUrl.replace('https://www.reddit.com', ''),
                subreddit: subreddit || 'unknown',
                created_utc: pubDate ? Math.floor(new Date(pubDate[1]).getTime() / 1000) : Date.now() / 1000,
                score: 1,
                num_comments: 0,
                is_self: linkUrl.includes('/comments/'),
                selftext: description ? decodeHTMLEntities(description[1]).substring(0, 500) : ''
              }
            });
          }
        }
      }
    }
    
    console.log(`Parsed ${items.length} items from feed`);
    return {
      kind: 'Listing',
      data: {
        after: null,
        before: null,
        children: items
      }
    };
  } catch (error) {
    console.log('Feed parsing error:', error.message);
    return null;
  }
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
}

/**
 * Try direct JSON endpoints with different Reddit domains and user agents
 */
async function tryDirectJSONEndpoints(username, subreddit, limit) {
  const domains = ['reddit.com', 'www.reddit.com', 'old.reddit.com'];
  
  // Try each domain with each user agent
  for (const domain of domains) {
    for (const userAgent of USER_AGENTS) {
      try {
        const url = subreddit 
          ? `https://${domain}/r/${subreddit}.json?limit=${limit}`
          : `https://${domain}/user/${username}/about.json`;
        
        console.log(`[Reddit] Trying ${domain} with ${userAgent.substring(0, 30)}...`);
        
        // First try with minimal headers (like curl)
        let response = await fetch(url, {
          headers: {
            'User-Agent': userAgent
          },
          timeout: 3000
        });
        
        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const data = JSON.parse(text);
            if (data && (data.data || data.kind)) {
              console.log(`✅ SUCCESS with ${domain} using minimal headers`);
              return data;
            }
          }
        }
        
        // Try with browser headers
        response = await fetch(url + '&raw_json=1', {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 3000
        });
        
        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const data = JSON.parse(text);
            if (data && (data.data || data.kind)) {
              console.log(`✅ SUCCESS with ${domain} using browser headers`);
              return data;
            }
          }
        }
      } catch (error) {
        // Continue trying
      }
    }
  }
  
  return null;
}

/**
 * Fallback: Try multiple JSON methods (these typically fail due to blocking)
 */
async function fetchWithMultipleMethods(username, subreddit, limit) {
  const methods = [
    // Method 1: node-fetch with browser headers
    async () => {
      const url = subreddit 
        ? `${REDDIT_BASE}/r/${subreddit}.json?limit=${limit}`
        : `${REDDIT_BASE}/user/${username}/about.json`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    },
    
    // Method 2: axios with minimal headers
    async () => {
      const url = subreddit 
        ? `${REDDIT_BASE}/r/${subreddit}.json?limit=${limit}`
        : `${REDDIT_BASE}/user/${username}/about.json`;
        
      const response = await axios.get(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT
        },
        timeout: 10000
      });
      
      return response.data;
    },
    
    // Method 3: Native HTTPS with browser simulation
    async () => {
      return new Promise((resolve, reject) => {
        const url = subreddit 
          ? `/r/${subreddit}.json?limit=${limit}`
          : `/user/${username}/about.json`;
          
        const options = {
          hostname: 'www.reddit.com',
          port: 443,
          path: url,
          method: 'GET',
          headers: {
            'User-Agent': DEFAULT_USER_AGENT,
            'Accept': 'application/json',
            'Host': 'www.reddit.com',
            'Connection': 'keep-alive'
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Invalid JSON'));
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        req.end();
      });
    }
  ];

  let lastError;
  for (let i = 0; i < methods.length; i++) {
    try {
      const result = await methods[i]();
      if (result) {
        console.log(`Method ${i + 1} successful`);
        return result;
      }
    } catch (error) {
      lastError = error;
      console.log(`Method ${i + 1} failed: ${error.message}`);
    }
  }
  
  throw lastError || new Error('All methods failed');
}

module.exports = { fetchRedditData };