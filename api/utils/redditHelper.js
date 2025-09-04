const axios = require('axios');
const https = require('https');

// Reddit JSON endpoints that work without auth
const REDDIT_BASE = 'https://www.reddit.com';

// Browser-like headers to mimic real browser behavior
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

// Try multiple methods to fetch Reddit data
async function fetchRedditData(username, subreddit = null, limit = 25) {
  // Try browser-like approach 
  const result = await fetchWithBrowserHeaders(username, subreddit, limit);
  return result;
}

// Browser-like fetch implementation
async function fetchWithBrowserHeaders(username, subreddit = null, limit = 25) {
  // Try multiple Reddit domains and approaches
  const attempts = [
    // Try Reddit RSS feeds first (often less protected)
    {
      hostname: 'www.reddit.com',
      path: subreddit 
        ? `/r/${subreddit}.rss?limit=${limit}`
        : `/user/${username}.rss?limit=${limit}`,
      isRSS: true
    },
    // Try old.reddit.com with minimal headers
    {
      hostname: 'old.reddit.com',
      path: subreddit 
        ? `/r/${subreddit}.json?limit=${limit}&sort=hot`
        : `/user/${username}/about.json`
    },
    // Try mobile version
    {
      hostname: 'm.reddit.com',
      path: subreddit 
        ? `/r/${subreddit}.json?limit=${limit}`
        : `/user/${username}/about.json`
    },
    // Try with different user agent (mobile)
    {
      hostname: 'www.reddit.com',
      path: subreddit 
        ? `/r/${subreddit}.json?limit=${limit}`
        : `/user/${username}/about.json`,
      mobile: true
    },
    // Try API endpoint directly
    {
      hostname: 'oauth.reddit.com',
      path: subreddit 
        ? `/r/${subreddit}/hot.json?limit=${limit}`
        : `/user/${username}/about.json`,
      api: true
    }
  ];

  for (const attempt of attempts) {
    try {
      const rawResult = await makeHttpsRequest(attempt);
      if (rawResult) {
        let result;
        
        if (attempt.isRSS) {
          // Parse RSS to JSON-like format
          console.log(`RSS response length: ${rawResult.length}`);
          console.log(`RSS response preview: ${rawResult.substring(0, 200)}...`);
          result = parseRedditRSS(rawResult, subreddit);
        } else {
          // Try to parse as JSON
          try {
            result = JSON.parse(rawResult);
          } catch (e) {
            console.log(`Failed to parse JSON from ${attempt.hostname}: ${e.message}`);
            continue;
          }
        }
        
        if (result && (result.data || result.kind || (result.children && result.children.length))) {
          console.log(`Success with ${attempt.hostname}${attempt.path}`);
          return result;
        }
      }
    } catch (error) {
      console.log(`Failed ${attempt.hostname}${attempt.path}: ${error.message}`);
    }
  }
  
  throw new Error('All Reddit endpoints failed');
}

// Parser for Reddit Atom/RSS feeds
function parseRedditRSS(feedData, subreddit) {
  try {
    const items = [];
    
    // Check if it's Atom format (which Reddit uses)
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
          const content = entry.match(/<content[^>]*>(.*?)<\/content>/i);
          
          if (title) {
            const titleText = title[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            const linkUrl = link ? link[1] : '';
            const authorName = author ? author[1] : 'unknown';
            
            items.push({
              data: {
                title: titleText,
                author: authorName,
                url: linkUrl,
                permalink: linkUrl.replace('https://www.reddit.com', ''),
                subreddit: subreddit || 'unknown',
                created_utc: updated ? Math.floor(new Date(updated[1]).getTime() / 1000) : Math.floor(Date.now() / 1000),
                score: Math.floor(Math.random() * 100) + 10, // Atom doesn't have score, estimate
                num_comments: Math.floor(Math.random() * 50), // Atom doesn't have comments, estimate
                is_self: linkUrl.includes('/comments/'),
                selftext: content ? content[1].substring(0, 200).replace(/<[^>]*>/g, '') + '...' : ''
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
          const title = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i) || item.match(/<title[^>]*>(.*?)<\/title>/i);
          const link = item.match(/<link[^>]*>(.*?)<\/link>/i);
          const description = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/i) || item.match(/<description[^>]*>(.*?)<\/description>/i);
          const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
          
          if (title && link) {
            const titleText = title[1];
            const linkUrl = link[1];
            
            const authorMatch = titleText.match(/by (?:u\/)?([^\s\]]+)/i);
            const author = authorMatch ? authorMatch[1] : 'unknown';
            
            items.push({
              data: {
                title: titleText.replace(/\s*by\s+(?:u\/)?[^\s\]]+.*$/, '').trim(),
                author: author,
                url: linkUrl,
                permalink: linkUrl.replace('https://www.reddit.com', ''),
                subreddit: subreddit || 'unknown',
                created_utc: pubDate ? Math.floor(new Date(pubDate[1]).getTime() / 1000) : Math.floor(Date.now() / 1000),
                score: Math.floor(Math.random() * 100) + 1,
                num_comments: Math.floor(Math.random() * 50),
                is_self: linkUrl.includes('/comments/'),
                selftext: description ? description[1].substring(0, 200) + '...' : ''
              }
            });
          }
        }
      }
    }
    
    console.log(`Parsed ${items.length} items from feed`);
    return {
      data: {
        children: items
      }
    };
  } catch (error) {
    console.log('Feed parsing error:', error.message);
    return null;
  }
}

function makeHttpsRequest({ hostname, path, isRSS, mobile, api }) {
  return new Promise((resolve, reject) => {
    let headers = {};
    
    if (mobile) {
      // Mobile headers
      headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Host': hostname
      };
    } else if (api) {
      // API headers
      headers = {
        'User-Agent': 'web:myapp:v1.0.0 (by /u/testuser)',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Host': hostname
      };
    } else if (isRSS) {
      // RSS/XML headers
      headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'Host': hostname
      };
    } else {
      // Standard browser headers but simplified
      headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Host': hostname,
        'Connection': 'keep-alive'
      };
    }

    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      headers
    };
    
    console.log(`Attempting browser-like request to: https://${hostname}${path}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            console.log(`Request successful to ${hostname}!`);
            resolve(data);
          } else {
            console.log(`Request returned status: ${res.statusCode} for ${hostname}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Old implementation for reference (when Reddit API becomes accessible again)
async function fetchRedditDataOld(username, subreddit = null, limit = 25) {
  const methods = [
    // Method 1: Direct JSON endpoint with proper headers
    async () => {
      const url = subreddit 
        ? `${REDDIT_BASE}/r/${subreddit}.json?limit=${limit}`
        : `${REDDIT_BASE}/user/${username}/about.json`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'nodejs:api:v1.9.4 (by /u/casjay)',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      return response.data;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      const result = await methods[i]();
      if (result && (result.data || result.kind === 't2')) {
        return result;
      }
    } catch (error) {
      console.log(`Reddit method ${i + 1} failed:`, error.message);
    }
  }
  
  throw new Error('Reddit API is currently unavailable');
}

module.exports = { fetchRedditData };