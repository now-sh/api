const express = require('express');
const cors = require('cors');
const { marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const DOMPurify = require('isomorphic-dompurify');
const hljs = require('highlight.js');
const { setStandardHeaders } = require('../utils/standardHeaders');

const markdownRoute = express.Router();

// Configure marked with highlight extension
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (_err) {
        // Fall through to auto-highlight
      }
    }
    return hljs.highlightAuto(code).value;
  }
}));

marked.use({
  breaks: true,
  gfm: true
});

/**
 * Convert markdown to HTML
 */
function markdownToHtml(markdown, options = {}) {
  const html = marked.parse(markdown);
  
  if (options.sanitize !== false) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: options.allowedTags || [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div'
      ],
      ALLOWED_ATTR: options.allowedAttributes || [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height'
      ],
      ALLOW_DATA_ATTR: false
    });
  }
  
  return html;
}

/**
 * Extract metadata from markdown
 */
function extractMetadata(markdown) {
  const metadata = {
    title: null,
    headings: [],
    links: [],
    images: [],
    codeBlocks: 0,
    wordCount: 0,
    characterCount: markdown.length
  };
  
  // Extract headings
  const headingRegex = /^#+\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[0].match(/^#+/)[0].length;
    const text = match[1];
    metadata.headings.push({ level, text });
    
    if (level === 1 && !metadata.title) {
      metadata.title = text;
    }
  }
  
  // Extract links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(markdown)) !== null) {
    metadata.links.push({ text: match[1], url: match[2] });
  }
  
  // Extract images
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = imageRegex.exec(markdown)) !== null) {
    metadata.images.push({ alt: match[1], url: match[2] });
  }
  
  // Count code blocks
  metadata.codeBlocks = (markdown.match(/```/g) || []).length / 2;
  
  // Word count
  const words = markdown.replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/[#*`[\]()!]/g, '') // Remove markdown syntax
    .split(/\s+/)
    .filter(word => word.length > 0);
  metadata.wordCount = words.length;
  
  return metadata;
}

/**
 * Generate table of contents from headings
 */
function generateTOC(headings) {
  if (!headings || headings.length === 0) return null;
  
  let toc = '## Table of Contents\n\n';
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    const anchor = heading.text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    toc += `${indent}- [${heading.text}](#${anchor})\n`;
  });
  
  return toc;
}

// Convert markdown to HTML
markdownRoute.post('/to-html', cors(), express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { 
      markdown, 
      sanitize = true,
      includeMetadata = false,
      includeTOC = false
    } = req.body;
    
    if (!markdown) {
      const data = { error: 'Markdown content is required' };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    const html = markdownToHtml(markdown, { sanitize });
    const response = { html };
    
    if (includeMetadata) {
      response.metadata = extractMetadata(markdown);
    }
    
    if (includeTOC && response.metadata) {
      response.toc = generateTOC(response.metadata.headings);
      response.tocHtml = markdownToHtml(response.toc);
    }
    
    setStandardHeaders(res, response);
    res.json(response);
  } catch (error) {
    const data = { 
      error: 'Failed to convert markdown',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Convert HTML to markdown (basic implementation)
markdownRoute.post('/to-markdown', cors(), express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { html } = req.body;
    
    if (!html) {
      const data = { error: 'HTML content is required' };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    // Basic HTML to Markdown conversion
    let markdown = html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      // Text formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
      .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
      // Links and images
      .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]+src="([^"]*)"[^>]*>/gi, '![]($1)')
      // Lists
      .replace(/<ul[^>]*>\s*(.*?)<\/ul>/gis, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
      })
      .replace(/<ol[^>]*>\s*(.*?)<\/ol>/gis, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
          return `${counter++}. $1\n`;
        }) + '\n';
      })
      // Code
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n')
      // Blockquote
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.trim().split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
      })
      // Paragraphs and breaks
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<hr[^>]*>/gi, '---\n\n')
      // Remove remaining tags
      .replace(/<[^>]+>/g, '')
      // Clean up
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    const data = { markdown };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to convert HTML to markdown',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Preview markdown (returns styled HTML page)
markdownRoute.post('/preview', cors(), express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { markdown } = req.body;
    
    if (!markdown) {
      const data = { error: 'Markdown content is required' };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    const html = markdownToHtml(markdown);
    const metadata = extractMetadata(markdown);
    
    const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || 'Markdown Preview'}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #f6f8fa;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <article class="markdown-body">
    ${html}
  </article>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(previewHtml);
  } catch (error) {
    const data = { 
      error: 'Failed to generate preview',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Help endpoint
markdownRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Markdown Converter API',
    message: 'Convert between Markdown and HTML',
    endpoints: {
      toHtml: `POST ${host}/api/v1/tools/markdown/to-html`,
      toMarkdown: `POST ${host}/api/v1/tools/markdown/to-markdown`,
      preview: `POST ${host}/api/v1/tools/markdown/preview`
    },
    parameters: {
      markdown: 'Markdown content to convert (for to-html and preview)',
      html: 'HTML content to convert (for to-markdown)',
      sanitize: 'Whether to sanitize HTML output (default: true)',
      includeMetadata: 'Include metadata analysis (default: false)',
      includeTOC: 'Include table of contents (default: false)',
      theme: 'Preview theme (default: github)'
    },
    features: [
      'GitHub Flavored Markdown support',
      'Syntax highlighting for code blocks',
      'HTML sanitization with DOMPurify',
      'Metadata extraction (headings, links, word count)',
      'Table of contents generation',
      'Live preview with styling'
    ]
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = markdownRoute;