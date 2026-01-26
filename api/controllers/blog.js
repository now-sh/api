const { getText } = require('../utils/httpClient');
const { getHeaders } = require('../middleware/headers');
const { fetchAllGitHubPages } = require('../utils/pagination');
const { getPostDateLabel } = require('../utils/dateUtils');

const githubToken = process.env.GITHUB_API_KEY;
const DEFAULT_REPO_URL = process.env.BLOG_URL || 'https://api.github.com/repos/malaks-us/jason/contents/_posts';

// Cache for blog posts
const blogCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Helper to parse Jekyll frontmatter
 */
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

/**
 * Helper to extract date and slug from filename
 */
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

/**
 * Fetch and process blog posts
 */
async function fetchBlogPosts(repoUrl) {
  const cacheKey = repoUrl;
  const cached = blogCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    // Only return cache if it has actual posts
    if (cached.data && cached.data.length > 0) {
      return cached.data;
    } else {
      // Clear bad cache
      blogCache.delete(cacheKey);
    }
  }
  
  try {
    // Only add auth header if token exists and is not placeholder
    const isValidToken = githubToken && 
                        githubToken.trim() !== '' && 
                        githubToken !== 'myverylonggithubapikey';
    const headers = isValidToken
      ? getHeaders({ 'Authorization': `token ${githubToken}` })
      : getHeaders({});
    
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
        
        const postDate = frontmatter.date || date;
        const dateInfo = getPostDateLabel(postDate);

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
          date: postDate,
          dateFormatted: dateInfo.formatted,
          dateRelative: dateInfo.relative,
          dateLabel: dateInfo.label,
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
    
    // Filter out posts with errors
    const validPosts = posts.filter(post => !post.error);
    
    // Sort by date (newest first)
    validPosts.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01');
      const dateB = new Date(b.date || '1970-01-01');
      return dateB - dateA;
    });
    
    // Cache the results
    blogCache.set(cacheKey, {
      data: validPosts,
      timestamp: Date.now()
    });
    
    return validPosts;
  } catch (error) {
    throw error;
  }
}

/**
 * Get blog posts from default repository
 */
const getBlogPosts = async () => {
  return fetchBlogPosts(DEFAULT_REPO_URL);
};

/**
 * Get single blog post by slug
 */
const getBlogPost = async (slug) => {
  const posts = await getBlogPosts();
  return posts.find(post => post.slug === slug);
};

/**
 * Search blog posts
 */
const searchBlogPosts = async (query) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid search query');
  }
  
  const posts = await getBlogPosts();
  const searchTerm = query.toLowerCase();
  
  return posts.filter(post => {
    const titleMatch = post.title && post.title.toLowerCase().includes(searchTerm);
    const contentMatch = post.content && post.content.toLowerCase().includes(searchTerm);
    const tagsMatch = post.tags && post.tags.toLowerCase().includes(searchTerm);
    const categoriesMatch = post.categories && post.categories.toLowerCase().includes(searchTerm);
    
    return titleMatch || contentMatch || tagsMatch || categoriesMatch;
  });
};

/**
 * Get blog posts from custom repository
 */
const getCustomRepoPosts = async (user, repo) => {
  const repoURL = `https://api.github.com/repos/${user}/${repo}/contents/_posts`;
  return fetchBlogPosts(repoURL);
};

/**
 * Get default repository name
 */
const getDefaultRepo = () => {
  return 'malaks-us/jason';
};

module.exports = {
  getBlogPosts,
  getBlogPost,
  searchBlogPosts,
  getCustomRepoPosts,
  getDefaultRepo,
  clearCache: () => blogCache.clear()
};