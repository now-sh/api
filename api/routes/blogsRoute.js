const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { setStandardHeaders } = require('../utils/standardHeaders');

const blogsRoute = express.Router();

// Parse Jekyll front matter
const parseFrontMatter = (content) => {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontMatter: {}, content };
  
  const frontMatterText = match[1];
  const postContent = match[2];
  const frontMatter = {};
  
  frontMatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontMatter[key] = value;
    }
  });
  
  return { frontMatter, content: postContent };
};

// Helper function to get GitHub API headers
const getGitHubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Backend-API'
  };
  
  if (process.env.GITHUB_API_KEY) {
    headers['Authorization'] = `token ${process.env.GITHUB_API_KEY}`;
  }
  
  return headers;
};

// Get all blog posts from a Jekyll GitHub repo
blogsRoute.get('/:username/:repo/posts', cors(), async (req, res) => {
  try {
    const { username, repo } = req.params;
    const postsPath = req.query.path || '_posts';
    
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${postsPath}`;
    const response = await axios.get(url, { headers: getGitHubHeaders() });
    
    // Filter only markdown files
    const posts = response.data
      .filter(file => file.name.endsWith('.md') || file.name.endsWith('.markdown'))
      .map(file => {
        // Extract date and slug from Jekyll filename pattern (YYYY-MM-DD-slug.md)
        const match = file.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.(md|markdown)$/);
        if (match) {
          return {
            date: match[1],
            slug: match[2],
            filename: file.name,
            path: file.path,
            url: file.html_url,
            download_url: file.download_url
          };
        }
        return {
          slug: file.name.replace(/\.(md|markdown)$/, ''),
          filename: file.name,
          path: file.path,
          url: file.html_url,
          download_url: file.download_url
        };
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    const data = { posts, count: posts.length };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = { 
      error: error.response?.data?.message || error.message,
      posts: []
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Get a specific blog post
blogsRoute.get('/:username/:repo/post/:filename', cors(), async (req, res) => {
  try {
    const { username, repo, filename } = req.params;
    const postsPath = req.query.path || '_posts';
    
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${postsPath}/${filename}`;
    const response = await axios.get(url, { headers: getGitHubHeaders() });
    
    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const { frontMatter, content: postContent } = parseFrontMatter(content);
    
    const data = {
      filename: response.data.name,
      path: response.data.path,
      url: response.data.html_url,
      frontMatter,
      content: postContent,
      raw: content
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = { 
      error: error.response?.data?.message || error.message 
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Get blog metadata
blogsRoute.get('/:username/:repo', cors(), async (req, res) => {
  try {
    const { username, repo } = req.params;
    
    // Get repo info
    const repoUrl = `https://api.github.com/repos/${username}/${repo}`;
    const repoResponse = await axios.get(repoUrl, { headers: getGitHubHeaders() });
    
    // Try to get _config.yml
    let config = {};
    try {
      const configUrl = `https://api.github.com/repos/${username}/${repo}/contents/_config.yml`;
      const configResponse = await axios.get(configUrl, { headers: getGitHubHeaders() });
      const configContent = Buffer.from(configResponse.data.content, 'base64').toString('utf-8');
      
      // Basic YAML parsing
      configContent.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && !line.trim().startsWith('#')) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          config[key] = value;
        }
      });
    } catch (e) {
      // Config file not found, not critical
    }
    
    const data = {
      name: repoResponse.data.name,
      description: repoResponse.data.description,
      url: repoResponse.data.html_url,
      homepage: repoResponse.data.homepage,
      owner: {
        username: repoResponse.data.owner.login,
        avatar: repoResponse.data.owner.avatar_url,
        url: repoResponse.data.owner.html_url
      },
      config,
      created: repoResponse.data.created_at,
      updated: repoResponse.data.updated_at
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = { 
      error: error.response?.data?.message || error.message 
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Help endpoint
blogsRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Jekyll Blog API',
    message: 'Access Jekyll blogs hosted on GitHub',
    endpoints: {
      blog_info: `${host}/api/v1/blogs/:username/:repo`,
      all_posts: `${host}/api/v1/blogs/:username/:repo/posts`,
      single_post: `${host}/api/v1/blogs/:username/:repo/post/:filename`,
      custom_path: 'Add ?path=custom_posts_folder to use non-standard post directory'
    },
    examples: {
      blog_info: `GET ${host}/api/v1/blogs/jekyll/jekyll`,
      all_posts: `GET ${host}/api/v1/blogs/jekyll/jekyll/posts`,
      single_post: `GET ${host}/api/v1/blogs/jekyll/jekyll/post/2023-01-01-welcome.md`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = blogsRoute;