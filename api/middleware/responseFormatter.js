/**
 * Middleware to format responses based on user agent
 * Returns plain text for CLI tools, JSON for browsers/API clients
 */

const cliUserAgents = [
  'curl',
  'wget',
  'httpie',
  'fetch',
  'node-fetch',
  'axios-cli',
  'postman',
  'insomnia',
  'http',  // HTTPie
  'lwp',   // Perl LWP
  'python-requests',
  'python-urllib',
  'go-http-client',
  'powershell'
];

const isCliClient = (userAgent) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return cliUserAgents.some(cli => ua.includes(cli));
};

const formatResponse = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method
  res.json = function(data) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptHeader = req.headers.accept || '';
    const acceptsJson = acceptHeader.includes('application/json');
    const acceptsText = acceptHeader.includes('text/plain');
    
    // Very selective text formatting:
    // - Only /api/v1/commit root defaults to text for CLI tools (scripting use case)
    // - Everything else defaults to JSON
    // - Accept: text/plain always forces text
    const isCommitRoot = req.path === '/' && req.baseUrl === '/api/v1/commit';
    const isTextEndpoint = isCommitRoot && !req.path.includes('/help');
    
    const shouldReturnText = acceptsText || 
      (isTextEndpoint && !acceptsJson && isCliClient(userAgent));
    
    if (shouldReturnText) {
      res.set('Content-Type', 'text/plain');
      
      // Format response based on endpoint type
      const path = req.path.toLowerCase();
      
      // Special formatting for specific endpoints
      if (path.includes('/version')) {
        return res.send(data.Version || 'Unknown');
      }
      
      if (path.includes('/passwd')) {
        return res.send(data.password || '');
      }
      
      if (path.includes('/uuid')) {
        return res.send(data.uuid || data.data || '');
      }
      
      if (path.includes('/base64')) {
        return res.send(data.result || data.encoded || data.decoded || '');
      }
      
      if (path.includes('/hash')) {
        return res.send(data.hash || data.result || '');
      }
      
      if (path.includes('/ip')) {
        return res.send(data.ip || data.address || req.ip);
      }
      
      if (path.includes('/qr')) {
        // QR codes return binary data, handled separately
        return originalJson.call(this, data);
      }
      
      // Default: try to extract the main value
      if (data.data && typeof data.data === 'string') {
        return res.send(data.data + '\n');
      }
      
      if (data.result && typeof data.result === 'string') {
        return res.send(data.result + '\n');
      }
      
      if (data.message) {
        return res.send(data.message + '\n');
      }
      
      // For commit endpoints specifically - extract message even from /json endpoint
      if (path.includes('/commit') && data.message) {
        return res.send(data.message + '\n');
      }
      
      // For errors
      if (data.error) {
        return res.send(`Error: ${data.error}\n`);
      }
      
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(e => e.msg || e.message).join(', ');
        return res.send(`Error: ${errorMessages}\n`);
      }
      
      // Special handling for help endpoints
      if (path.includes('/help') && typeof data === 'object') {
        const formatHelpText = (obj, indent = '') => {
          const lines = [];
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
              lines.push(`${indent}${key}:`);
              lines.push(formatHelpText(value, indent + '  '));
            } else {
              lines.push(`${indent}${key}: ${value}`);
            }
          }
          return lines.filter(line => line.trim()).join('\n');
        };
        return res.send(formatHelpText(data) + '\n');
      }
      
      // If we can't determine a simple format, return key=value pairs
      if (typeof data === 'object') {
        const pairs = Object.entries(data)
          .filter(([_key, value]) => typeof value !== 'object')
          .map(([k, value]) => `${k}: ${value}`)
          .join('\n');
        return res.send((pairs || JSON.stringify(data)) + '\n');
      }
      
      // Fallback to stringified data
      return res.send(String(data) + '\n');
    }
    
    // Default to JSON with newline for CLI tools
    if (isCliClient(userAgent)) {
      res.set('Content-Type', 'application/json');
      return res.send(JSON.stringify(data) + '\n');
    }
    
    // Default to JSON
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware to add CLI examples to help endpoints
const addCliExamples = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    const userAgent = req.headers['user-agent'] || '';
    
    // Add CLI examples to help responses if accessed from CLI
    if (isCliClient(userAgent) && req.path.includes('/help')) {
      if (data.Usage_Get) {
        data.CLI_Example = data.Usage_Get;
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  formatResponse,
  addCliExamples,
  isCliClient
};