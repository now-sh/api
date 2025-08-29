const { getJson } = require('./httpClient');
const { getHeaders } = require('../middleware/headers');

// Try multiple methods to fetch Reddit data
async function fetchRedditData(username, subreddit = null, limit = 100) {
  const methods = [
    // Method 1: Direct JSON with better headers
    async () => {
      const url = subreddit 
        ? `https://www.reddit.com/r/${subreddit}.json?limit=${limit}`
        : `https://www.reddit.com/user/${username}.json?limit=${limit}`;
      
      return await getJson(url, {
        headers: getHeaders({
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.reddit.com/'
        })
      });
    },
    
    // Method 2: Use old.reddit.com
    async () => {
      const url = subreddit 
        ? `https://old.reddit.com/r/${subreddit}.json?limit=${limit}`
        : `https://old.reddit.com/user/${username}.json?limit=${limit}`;
      
      return await getJson(url, {
        headers: getHeaders({
          'Accept': '*/*'
        })
      });
    },
    
    // Method 3: Use a public Reddit JSON proxy
    async () => {
      // Using a public Reddit viewer API
      const baseUrl = subreddit 
        ? `https://www.reddit.com/r/${subreddit}.json`
        : `https://www.reddit.com/user/${username}.json`;
      
      // Try through a CORS proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(baseUrl + `?limit=${limit}`)}`;
      
      return await getJson(proxyUrl, {
        headers: getHeaders()
      });
    }
  ];
  
  // Try each method with delays
  for (let i = 0; i < methods.length; i++) {
    try {
      // Add delay between attempts
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await methods[i]();
      return result;
    } catch (error) {
      console.log(`Method ${i + 1} failed:`, error.message);
      if (i === methods.length - 1) {
        // All methods failed
        throw new Error('All Reddit fetch methods failed. API may be blocking requests.');
      }
    }
  }
}

module.exports = { fetchRedditData };