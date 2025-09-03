require('dotenv').config();
const express = require('express');
const blogRoute = express.Router();
const cors = require('cors');

const { getText } = require('../utils/httpClient');

const { getHeaders } = require('../middleware/headers');
const { fetchAllGitHubPages } = require('../utils/pagination');
const githubToken = process.env.GITHUB_API_KEY;
const api = 'https://api.github.com/repos/malaks-us/jason/contents/_posts';

// Cache for blog posts
const blogCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const blog = process.env.BLOG_URL || api;

// Helper to parse Jekyll frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content: content.trim() };
  }
  
  const frontmatterText = match[1];
  const mainContent = match[2].trim();
  
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, content: mainContent };
}

// Helper to extract date and slug from filename
function parseFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.*)\.md$/);
  if (match) {
    return {
      date: match[1],
      slug: match[2]
    };
  }
  return {
    date: null,
    slug: filename.replace(/\.md$/, '')
  };
}

// Fetch and process blog posts
async function fetchBlogPosts(repoUrl, headers) {
  const cacheKey = repoUrl;
  const cached = blogCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  try {
    // First, get all file metadata
    const files = await fetchAllGitHubPages(repoUrl, headers);
    
    // Filter to only markdown files
    const mdFiles = files.filter(file => file.name.endsWith('.md'));
    
    // Fetch content for each file
    const postsPromises = mdFiles.map(async (file) => {
      try {
        const content = await getText(file.download_url, { headers });
        
        const { frontmatter, content: postContent } = parseFrontmatter(content);
        const { date, slug } = parseFilename(file.name);
        
        return {
          // File metadata
          filename: file.name,
          path: file.path,
          sha: file.sha,
          size: file.size,
          url: file.url,
          html_url: file.html_url,
          download_url: file.download_url,
          
          // Parsed content
          title: frontmatter.title || slug.replace(/-/g, ' '),
          date: frontmatter.date || date,
          slug: slug,
          author: frontmatter.author || null,
          categories: frontmatter.categories || frontmatter.category || null,
          tags: frontmatter.tags || null,
          excerpt: frontmatter.excerpt || postContent.substring(0, 200) + '...',
          
          // Full content
          frontmatter: frontmatter,
          content: postContent
        };
      } catch (error) {
        console.error(`Error fetching content for ${file.name}:`, error.message);
        return {
          filename: file.name,
          path: file.path,
          error: `Failed to fetch content: ${error.message}`
        };
      }
    });
    
    const posts = await Promise.all(postsPromises);
    
    // Sort by date (oldest first)
    posts.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01');
      const dateB = new Date(b.date || '1970-01-01');
      return dateA - dateB;
    });
    
    // Cache the results
    blogCache.set(cacheKey, {
      data: posts,
      timestamp: Date.now()
    });
    
    return posts;
  } catch (error) {
    throw error;
  }
}

blogRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        endpoints: {
          jason: `${req.protocol}://${req.headers.host}/api/v1/blogs/jason`,
          custom: `${req.protocol}://${req.headers.host}/api/v1/blogs/:user/:repo`
        },
        description: "Fetches and parses Jekyll-style blog posts from GitHub repositories",
        example: `${req.protocol}://${req.headers.host}/api/v1/blogs/jekyll/jekyll`
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/help', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        endpoints: {
          jason: `${req.protocol}://${req.headers.host}/api/v1/blogs/jason`,
          custom: `${req.protocol}://${req.headers.host}/api/v1/blogs/:user/:repo`
        },
        description: "Fetches and parses Jekyll-style blog posts from GitHub repositories",
        example: `${req.protocol}://${req.headers.host}/api/v1/blogs/jekyll/jekyll`,
        response_format: {
          filename: "Original filename",
          title: "Post title from frontmatter or filename",
          date: "Post date from frontmatter or filename",
          author: "Author from frontmatter",
          categories: "Categories from frontmatter",
          tags: "Tags from frontmatter",
          excerpt: "Short excerpt of content",
          content: "Full post content (without frontmatter)",
          frontmatter: "Original frontmatter data",
          url: "GitHub API URL",
          html_url: "GitHub web URL",
          download_url: "Raw content URL"
        }
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/jason', cors(), async (req, res) => {
  try {
    // Only add auth header if token exists and is not placeholder
    const isValidToken = githubToken && 
                        githubToken.trim() !== '' && 
                        githubToken !== 'myverylonggithubapikey';
    const headers = isValidToken
      ? getHeaders({ 'Authorization': `token ${githubToken}` })
      : getHeaders({});
    
    const posts = await fetchBlogPosts(blog, headers);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      repository: "malaks-us/jason",
      total_posts: posts.length,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      repository: "malaks-us/jason"
    });
  }
});

blogRoute.get('/:user/:repo', cors(), async (req, res) => {
  try {
    const { user, repo } = req.params;
    const repoURL = `https://api.github.com/repos/${user}/${repo}/contents/_posts`;
    
    // Only add auth header if token exists and is not placeholder
    const isValidToken = githubToken && 
                        githubToken.trim() !== '' && 
                        githubToken !== 'myverylonggithubapikey';
    const headers = isValidToken
      ? getHeaders({ 'Authorization': `token ${githubToken}` })
      : getHeaders({});

    const posts = await fetchBlogPosts(repoURL, headers);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      repository: `${user}/${repo}`,
      total_posts: posts.length,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      repository: `${req.params.user}/${req.params.repo}`,
      hint: "Make sure the repository exists and has a _posts directory"
    });
  }
});

module.exports = blogRoute;
