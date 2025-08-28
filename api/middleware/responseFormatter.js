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
    const acceptsText = req.accepts('text/plain');
    const forceJson = req.query.json === 'true';
    const forcePlain = req.query.plain === 'true';
    
    // Force plain text if requested
    if (forcePlain || (isCliClient(userAgent) && !forceJson && acceptsText)) {
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
        return res.send(data.data);
      }
      
      if (data.result && typeof data.result === 'string') {
        return res.send(data.result);
      }
      
      if (data.message) {
        return res.send(data.message);
      }
      
      // For errors
      if (data.error) {
        return res.send(`Error: ${data.error}`);
      }
      
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(e => e.msg || e.message).join(', ');
        return res.send(`Error: ${errorMessages}`);
      }
      
      // If we can't determine a simple format, return key=value pairs
      if (typeof data === 'object') {
        const pairs = Object.entries(data)
          .filter(([key, value]) => typeof value !== 'object')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        return res.send(pairs || JSON.stringify(data));
      }
      
      // Fallback to stringified data
      return res.send(String(data));
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