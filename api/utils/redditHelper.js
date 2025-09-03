const axios = require('axios');

// Try multiple methods to fetch Reddit data
async function fetchRedditData(username, subreddit = null, limit = 100) {
  const methods = [
    // Method 1: Use proper Reddit API headers
    async () => {
      const url = subreddit 
        ? `https://www.reddit.com/r/${subreddit}.json?limit=${limit}&raw_json=1`
        : `https://www.reddit.com/user/${username}/about.json`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 10000
      });
      
      return response.data;
    },
    
    // Method 2: Use old.reddit.com with browser headers
    async () => {
      const url = subreddit 
        ? `https://old.reddit.com/r/${subreddit}.json?limit=${limit}&raw_json=1`
        : `https://old.reddit.com/user/${username}.json?limit=${limit}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
      });
      
      return response.data;
    },
    
    // Method 3: Try Reddit RSS feed converted to JSON
    async () => {
      try {
        const url = subreddit 
          ? `https://www.reddit.com/r/${subreddit}.rss`
          : `https://www.reddit.com/user/${username}.rss`;
        
        // Note: This would need an RSS to JSON converter
        // For now, fallback to returning empty data
        throw new Error('RSS method not implemented');
      } catch (error) {
        throw error;
      }
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