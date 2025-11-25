require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');

const meInfoRoute = express.Router();

// URLs for remote data
const URLS = {
  profile: 'https://raw.githubusercontent.com/casjay/public/refs/heads/main/profile.json',
  domains: 'https://raw.githubusercontent.com/casjay/public/refs/heads/main/domains.json',
  resume: 'https://raw.githubusercontent.com/casjay/public/main/Resume-Tech.pdf'
};

/**
 * Fetch data from GitHub raw URL
 */
async function fetchFromGitHub(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Node.js API Client',
        'Accept': 'application/json, application/pdf, text/plain'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

/**
 * Get profile info - JSON response
 */
meInfoRoute.get('/profile', cors(), async (req, res) => {
  try {
    const data = await fetchFromGitHub(URLS.profile);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

/**
 * Get profile info - Text response
 */
meInfoRoute.get('/profile/text', cors(), async (req, res) => {
  try {
    const data = await fetchFromGitHub(URLS.profile);
    const output = [];
    
    if (data.name) output.push(`Name: ${data.name}`);
    if (data.email) output.push(`Email: ${Array.isArray(data.email) ? data.email.join(', ') : data.email}`);
    if (data.bio) output.push(`Bio: ${data.bio}`);
    if (data.location) output.push(`Location: ${data.location}`);
    if (data.company) output.push(`Company: ${data.company}`);
    if (data.blog) output.push(`Blog: ${data.blog}`);
    if (data.social) {
      output.push('\nSocial:');
      Object.entries(data.social).forEach(([platform, url]) => {
        output.push(`  ${platform}: ${url}`);
      });
    }
    
    sendText(res, output.join('\n'));
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Get domains info - JSON response
 */
meInfoRoute.get('/domains', cors(), async (req, res) => {
  try {
    const data = await fetchFromGitHub(URLS.domains);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

/**
 * Get domains info - Text response
 */
meInfoRoute.get('/domains/text', cors(), async (req, res) => {
  try {
    const data = await fetchFromGitHub(URLS.domains);
    const output = ['=== Domains ==='];
    
    if (Array.isArray(data)) {
      data.forEach((domain, index) => {
        if (typeof domain === 'string') {
          output.push(`${index + 1}. ${domain}`);
        } else if (typeof domain === 'object') {
          output.push(`\n${index + 1}. ${domain.name || domain.domain || 'Unknown'}`);
          Object.entries(domain).forEach(([key, value]) => {
            if (key !== 'name' && key !== 'domain') {
              output.push(`   ${key}: ${value}`);
            }
          });
        }
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        output.push(`${key}: ${JSON.stringify(value)}`);
      });
    }
    
    sendText(res, output.join('\n'));
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Get resume - JSON data from GitHub
 */
meInfoRoute.get('/resume', cors(), async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/casjay/public/refs/heads/main/resume.json', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Node.js API Client',
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: `Failed to fetch resume data: ${error.message}` });
  }
});

/**
 * Get resume - Text format
 */
meInfoRoute.get('/resume/text', cors(), async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/casjay/public/refs/heads/main/resume.json', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Node.js API Client',
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    const output = [];
    
    // Personal Info
    output.push(`${data.personalInfo.name}`);
    output.push(`${data.personalInfo.location}`);
    output.push(`Email: ${data.personalInfo.email}`);
    output.push(`Phone: ${data.personalInfo.phone}`);
    output.push('');
    
    // Summary
    output.push('SUMMARY');
    data.summary.highlights.forEach(item => output.push(`• ${item}`));
    output.push('');
    
    // Work Experience
    output.push('WORK EXPERIENCE');
    data.workExperience.forEach(job => {
      output.push(`${job.title} - ${job.company}, ${job.location}`);
      output.push(`${job.startDate} - ${job.endDate}`);
      job.responsibilities.forEach(resp => output.push(`• ${resp}`));
      output.push('');
    });
    
    // Skills
    output.push('TECHNICAL SKILLS');
    output.push(data.skills.technical.join(', '));
    output.push('');
    
    sendText(res, output.join('\n'));
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * View resume - Stream PDF to browser
 */
meInfoRoute.get('/resume/view', cors(), async (req, res) => {
  try {
    const response = await axios.get(URLS.resume, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Node.js API Client'
      }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Resume-Tech.pdf"');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(503).json({ error: `Failed to fetch resume: ${error.message}` });
  }
});

/**
 * Download resume - Force download
 */
meInfoRoute.get('/resume/download', cors(), async (req, res) => {
  try {
    const response = await axios.get(URLS.resume, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Node.js API Client'
      }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Resume-Tech.pdf"');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(503).json({ error: `Failed to fetch resume: ${error.message}` });
  }
});

/**
 * Get resume info - Text response
 */
meInfoRoute.get('/resume/text', cors(), async (req, res) => {
  try {
    const output = [
      '=== Resume ===',
      'Format: PDF',
      'File: Resume-Tech.pdf',
      '',
      'View online: ' + `${req.protocol}://${req.headers.host}/api/v1/me/info/resume/view`,
      'Download: ' + `${req.protocol}://${req.headers.host}/api/v1/me/info/resume/download`,
      '',
      'Note: Resume is available as a PDF document. Use the view or download links to access it.'
    ];
    
    sendText(res, output.join('\n'));
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Help endpoint
 */
meInfoRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  res.json({
    title: 'Personal Information API',
    message: 'Access personal profile, domains, and resume information',
    endpoints: {
      profile: {
        json: `GET ${host}/api/v1/me/info/profile`,
        text: `GET ${host}/api/v1/me/info/profile/text`
      },
      domains: {
        json: `GET ${host}/api/v1/me/info/domains`,
        text: `GET ${host}/api/v1/me/info/domains/text`
      },
      resume: {
        info: `GET ${host}/api/v1/me/info/resume`,
        text: `GET ${host}/api/v1/me/info/resume/text`,
        view: `GET ${host}/api/v1/me/info/resume/view`,
        download: `GET ${host}/api/v1/me/info/resume/download`
      },
      github: {
        user: `GET ${host}/api/v1/me/info/github`,
        repos: `GET ${host}/api/v1/me/info/github/repos`,
        orgs: `GET ${host}/api/v1/me/info/github/orgs`
      },
      reddit: `GET ${host}/api/v1/me/info/reddit`
    },
    sources: {
      profile: 'GitHub: casjay/public/profile.json',
      domains: 'GitHub: casjay/public/domains.json',
      resume: 'GitHub: casjay/public/Resume-Tech.pdf'
    },
    examples: {
      profile: `curl ${host}/api/v1/me/info/profile`,
      domains: `curl ${host}/api/v1/me/info/domains`,
      resumeInfo: `curl ${host}/api/v1/me/info/resume`,
      viewResume: `curl -L ${host}/api/v1/me/info/resume/view -o resume.pdf`
    }
  });
});

/**
 * Get GitHub data - JSON response (casjay)
 */
meInfoRoute.get('/github', cors(), async (req, res) => {
  try {
    const api = 'https://api.github.com/users/casjay';
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Node.js API Client'
    };
    
    // Add GitHub token if available
    const githubToken = process.env.GITHUB_API_KEY;
    if (githubToken && githubToken.trim() !== '' && githubToken !== 'myverylonggithubapikey') {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await axios.get(api, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

/**
 * Get GitHub repos - JSON response (casjay)
 */
meInfoRoute.get('/github/repos', cors(), async (req, res) => {
  try {
    const api = 'https://api.github.com/users/casjay/repos?sort=updated&per_page=50';
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Node.js API Client'
    };
    
    // Add GitHub token if available
    const githubToken = process.env.GITHUB_API_KEY;
    if (githubToken && githubToken.trim() !== '' && githubToken !== 'myverylonggithubapikey') {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await axios.get(api, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

/**
 * Get GitHub orgs - JSON response (casjay)
 */
meInfoRoute.get('/github/orgs', cors(), async (req, res) => {
  try {
    const api = 'https://api.github.com/users/casjay/orgs';
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Node.js API Client'
    };
    
    // Add GitHub token if available
    const githubToken = process.env.GITHUB_API_KEY;
    if (githubToken && githubToken.trim() !== '' && githubToken !== 'myverylonggithubapikey') {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await axios.get(api, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

/**
 * Get Reddit data - JSON response (casjay)
 */
// Import Reddit helper
const { fetchRedditData, fetchRedditUserProfile } = require('../utils/redditHelper');

meInfoRoute.get('/reddit', cors(), async (req, res) => {
  try {
    // Get Reddit PROFILE data (READ-ONLY)
    console.log('Fetching Reddit user PROFILE data (read-only)...');
    const userData = await fetchRedditUserProfile('casjay');

    if (userData && userData.data) {
      const user = userData.data;

      // Return full Reddit user data
      const readOnlyResponse = {
        success: true,
        message: 'Reddit data fetched successfully (read-only)',
        data: {
          // Full user object from Reddit API
          user: {
            // Basic info
            name: user.name,
            id: user.id,
            display_name: user.subreddit?.display_name || user.name,
            display_name_prefixed: user.subreddit?.display_name_prefixed,

            // Description/Bio
            public_description: user.subreddit?.public_description || '',
            description: user.subreddit?.description || '',

            // Karma
            total_karma: user.total_karma || 0,
            link_karma: user.link_karma || 0,
            comment_karma: user.comment_karma || 0,
            awardee_karma: user.awardee_karma || 0,
            awarder_karma: user.awarder_karma || 0,

            // Account status
            created: user.created,
            created_utc: user.created_utc,
            verified: user.verified || false,
            has_verified_email: user.has_verified_email || false,
            is_gold: user.is_gold || false,
            is_mod: user.is_mod || false,
            is_employee: user.is_employee || false,
            accept_followers: user.accept_followers || false,
            has_subscribed: user.has_subscribed || false,

            // Profile images
            icon_img: user.icon_img || user.subreddit?.icon_img,
            snoovatar_img: user.snoovatar_img,
            snoovatar_size: user.snoovatar_size,

            // Subreddit/Profile info
            subreddit: user.subreddit ? {
              name: user.subreddit.name,
              title: user.subreddit.title,
              url: user.subreddit.url,
              subscribers: user.subreddit.subscribers || 0,
              over_18: user.subreddit.over_18 || false,
              banner_img: user.subreddit.banner_img,
              banner_size: user.subreddit.banner_size,
              icon_img: user.subreddit.icon_img,
              icon_size: user.subreddit.icon_size,
              primary_color: user.subreddit.primary_color,
              key_color: user.subreddit.key_color
            } : null,

            // Privacy settings
            hide_from_robots: user.hide_from_robots || false,
            pref_show_snoovatar: user.pref_show_snoovatar || false
          },
          note: 'Reddit data is read-only',
          access_level: 'read-only',
          source: userData.source || 'unknown',
          last_updated: new Date().toISOString()
        }
      };

      res.json(readOnlyResponse);
    } else {
      // Fallback to basic info if data fetch fails
      res.json({
        success: true,
        message: 'Reddit API is read-only (fallback mode)',
        data: {
          user: {
            name: 'casjay',
            display_name: 'Jason M. Hempstead',
            note: 'Reddit data not available - using fallback data'
          },
          access_level: 'read-only-fallback',
          last_updated: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Reddit API Error:', error.message);
    res.status(503).json({ 
      error: 'Reddit API unavailable',
      message: 'Reddit API is read-only and currently unavailable',
      hint: 'Visit https://reddit.com/u/casjay for current data'
    });
  }
});

module.exports = meInfoRoute;