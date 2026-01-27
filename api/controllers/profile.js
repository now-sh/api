const { getJson } = require('../utils/httpClient');
const axios = require('axios');

const PROFILE_URL = process.env.PROFILE_URL || 'https://raw.githubusercontent.com/casjay/public/main/profile.json';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'casjay';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function profileData() {
  const now = Date.now();

  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }

  // Try to fetch from profile JSON first
  let profileDataJson = {};
  try {
    profileDataJson = await getJson(PROFILE_URL);
  } catch {
    console.log('Profile JSON not found, falling back to GitHub API');
  }

  // Fetch GitHub data to fill in missing fields
  let githubData = {};
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        'User-Agent': 'Node.js API Client',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    githubData = response.data;
  } catch (err) {
    console.log('Could not fetch GitHub data:', err.message);
  }

  // Merge data with GitHub data filling in missing fields
  const mergedData = {
    name: profileDataJson.name || githubData.name,
    login: profileDataJson.username || githubData.login,
    bio: profileDataJson.bio || githubData.bio,
    company: profileDataJson.company || githubData.company,
    location: profileDataJson.location || githubData.location,
    email: profileDataJson.email || githubData.email,
    blog: profileDataJson.blog || githubData.blog,
    twitter_username: profileDataJson.twitter_username || githubData.twitter_username,
    followers: githubData.followers,
    following: githubData.following,
    public_repos: githubData.public_repos,
    public_gists: githubData.public_gists,
    avatar_url: githubData.avatar_url,
    html_url: githubData.html_url,
    created_at: githubData.created_at,
    updated_at: githubData.updated_at,
    // Include any additional fields from profile.json
    ...profileDataJson
  };

  cache = mergedData;
  lastCacheTime = now;
  return mergedData;
}

module.exports = profileData;
