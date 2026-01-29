# API Specification - Complete Documentation

## Overview

This API provides a comprehensive set of endpoints organized into categories, with consistent JSON/text response patterns and function-based validation middleware. The project includes both RESTful API endpoints and a full frontend interface using EJS templating.

## Base URL

- Production: `https://api.casjay.coffee`
- Development: `http://localhost:2000`

## API Version

All endpoints are prefixed with `/api/v1`

## API Root Endpoint

The `/api` endpoint returns comprehensive help with all available routes organized by category:

```bash
curl -q -LSsf https://api.casjay.coffee/api
```

Response includes:
- **Tools**: Base64, Hash, UUID, JWT, QR Code, Color, Lorem, Password, Commit, Markdown, Cron, Regex, Diff, Dictionary
- **Me**: Blog, Domains, Info
- **Data**: Todos, Notes, URLs
- **Fun**: Jokes, Facts, Trivia, Anime
- **Social**: Blogs, GitHub, Reddit
- **World**: Covid, Disease, Closings, Timezones, USA, NYS, ArcGIS
- **Auth**: Login, Register, Profile
- **Server**: Version, Health, Cache, Docs, Debug

## Response Formats

All endpoints support dual response formats:
- **JSON** (default): Returns structured JSON with `success`, `data`, and optional `error` fields
- **Text**: Returns plain text by appending `/text` to most endpoints

### Standard JSON Response Structure

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Route Categories

### 1. Tools (`/api/v1/tools`)

Developer utilities and generators.

#### Base64 Encoding/Decoding
- `POST /api/v1/tools/base64/encode` - Encode text to Base64
- `POST /api/v1/tools/base64/encode/text` - Encode text to Base64 (text response)
- `POST /api/v1/tools/base64/decode` - Decode Base64 to text
- `POST /api/v1/tools/base64/decode/text` - Decode Base64 to text (text response)
- `GET /api/v1/tools/base64/help` - Get help information

#### Hash Generation
- `POST /api/v1/tools/hash/:algorithm` - Generate hash (md5, sha1, sha256, sha512)
- `POST /api/v1/tools/hash/:algorithm/text` - Generate hash (text response)
- `POST /api/v1/tools/hash/:algorithm/verify` - Verify hash
- `POST /api/v1/tools/hash/:algorithm/batch` - Generate hashes for multiple texts
- `GET /api/v1/tools/hash` - Get help information

#### UUID Generation
- `GET /api/v1/tools/uuid/v4` - Generate single UUID v4
- `GET /api/v1/tools/uuid/v4/text` - Generate UUID (text response)
- `GET /api/v1/tools/uuid/generate/:count?` - Generate multiple UUIDs
- `POST /api/v1/tools/uuid/generate` - Generate with options
- `GET /api/v1/tools/uuid/validate/:uuid` - Validate UUID
- `GET /api/v1/tools/uuid` - Get help information

#### JWT Decoder
- `POST /api/v1/tools/jwt/decode` - Decode JWT token
- `POST /api/v1/tools/jwt/decode/text` - Decode JWT (text response)
- `GET /api/v1/tools/jwt` - Get help information

#### QR Code Generation
- `POST /api/v1/tools/qr/generate` - Generate QR code (base64/ascii)
- `POST /api/v1/tools/qr/generate/text` - Generate QR code (ASCII art)
- `GET /api/v1/tools/qr/generate/image/:text` - Generate QR code image
- `GET /api/v1/tools/qr` - Get help information

#### Color Tools
- `POST /api/v1/tools/color/convert` - Convert between color formats
- `POST /api/v1/tools/color/palette` - Generate color palette
- `GET /api/v1/tools/color/info` - Get color information
- `GET /api/v1/tools/color` - Get help information

#### Lorem Ipsum Generator
- `GET /api/v1/tools/lorem/:type?/:count?` - Generate lorem ipsum
- `GET /api/v1/tools/lorem/text/:type?/:count?` - Generate (text response)
- `GET /api/v1/tools/lorem` - Get help information

#### Password Generator
- `GET /api/v1/tools/passwd/:length?` - Generate password
- `GET /api/v1/tools/passwd/:length?/text` - Generate password (text)
- `POST /api/v1/tools/passwd/check` - Check password strength
- `GET /api/v1/tools/passwd/batch/:count/:length?` - Generate multiple
- `GET /api/v1/tools/passwd` - Get help information

#### Commit Message Generator
- `GET /api/v1/tools/commit` - Get random commit message
- `GET /api/v1/tools/commit/text` - Get commit message (text)
- `GET /api/v1/tools/commit/batch/:count` - Get multiple messages
- `GET /api/v1/tools/commit/help` - Get help information

#### Markdown Converter
- `POST /api/v1/tools/markdown/to-html` - Convert markdown to HTML
- `POST /api/v1/tools/markdown/to-markdown` - Convert HTML to markdown
- `POST /api/v1/tools/markdown/preview` - Preview markdown as HTML page
- `GET /api/v1/tools/markdown` - Get help information

### 2. Utilities (`/api/v1/utilities`)

Legacy endpoints maintained for backward compatibility. These proxy to the new `/tools` endpoints.

### 3. Me/Info (`/api/v1/me/info`)

Personal information endpoints. These return raw data without success/error wrappers.

- `GET /api/v1/me/info/profile` - Get profile data from GitHub
- `GET /api/v1/me/info/profile/text` - Get profile (text format)
- `GET /api/v1/me/info/domains` - Get domain list from GitHub
- `GET /api/v1/me/info/domains/text` - Get domains (text format)
- `GET /api/v1/me/info/resume` - Get resume JSON from GitHub
- `GET /api/v1/me/info/resume/text` - Get resume (text format)
- `GET /api/v1/me/info/resume/view` - View resume PDF in browser
- `GET /api/v1/me/info/resume/download` - Download resume PDF
- `GET /api/v1/me/info/github` - Get my GitHub profile (casjay)
- `GET /api/v1/me/info/github/repos` - Get my GitHub repositories
- `GET /api/v1/me/info/github/orgs` - Get my GitHub organizations
- `GET /api/v1/me/info/reddit` - Get my Reddit profile (casjay)
- `GET /api/v1/me/info` - Help/index endpoint

### 4. Data (`/api/v1/data`)

Data storage and retrieval endpoints.

#### Blogs
- `GET /api/v1/data/blogs` - Get all blog posts
- `GET /api/v1/data/blogs/list` - Get all blog posts (with full metadata)
- `GET /api/v1/data/blogs/post/:slug` - Get single blog post with HTML content
- `GET /api/v1/data/blogs/post/:slug/text` - Get blog post as plain text
- `GET /api/v1/data/blogs/search?q=query` - Search blog posts
- `GET /api/v1/data/blogs/help` - Get help information

#### Todos (Authenticated)
- `GET /api/v1/data/todos` - Get user's todos (requires auth)
- `POST /api/v1/data/todos` - Create new todo
- `PUT /api/v1/data/todos/:id` - Update todo
- `DELETE /api/v1/data/todos/:id` - Delete todo
- `GET /api/v1/data/todos/public` - Get public todos

#### Notes (Authenticated)
- `GET /api/v1/data/notes` - Get user's notes (requires auth)
- `GET /api/v1/data/notes/:id` - Get specific note
- `POST /api/v1/data/notes` - Create new note
- `PUT /api/v1/data/notes/:id` - Update note
- `DELETE /api/v1/data/notes/:id` - Delete note
- `GET /api/v1/data/notes/list` - Get public notes list

#### URLs (Authenticated)
- `POST /api/v1/data/urls/shorten` - Create short URL
- `GET /api/v1/data/urls/:code` - Redirect to original URL
- `GET /api/v1/data/urls/stats/:code` - Get URL statistics
- `DELETE /api/v1/data/urls/:code` - Delete short URL
- `GET /api/v1/data/urls` - Get help information

### 5. Fun (`/api/v1/fun`)

Entertainment endpoints.

#### Anime Quotes
- `GET /api/v1/fun/anime/quote` - Get random anime quote
- `GET /api/v1/fun/anime/quote/text` - Get quote (text)
- `GET /api/v1/fun/anime/quotes/:count` - Get multiple quotes
- `GET /api/v1/fun/anime` - Get help information

### 6. Social (`/api/v1/social`)

Social media integrations.

#### GitHub
- `GET /api/v1/social/github/user/:username` - Get GitHub user profile
- `GET /api/v1/social/github/user/:username/repos` - Get user's repositories
- `GET /api/v1/social/github/user/:username/orgs` - Get user's organizations
- `GET /api/v1/social/github/repos/:owner/:repo` - Get repository details
- `GET /api/v1/social/github/orgs/:org` - Get organization details
- `GET /api/v1/social/github/orgs/:org/repos` - Get org repositories

#### Reddit
- `GET /api/v1/social/reddit/u/:username` - Get Reddit user posts
- `GET /api/v1/social/reddit/r/:subreddit` - Get subreddit posts
- `GET /api/v1/social/reddit/r/:subreddit/top` - Get top posts

### 7. World (`/api/v1/world`)

Global information endpoints.

#### COVID-19 Statistics
- `GET /api/v1/world/covid` - Get global COVID-19 statistics
- `GET /api/v1/world/covid/countries` - Get all countries data
- `GET /api/v1/world/covid/countries/:country` - Get specific country
- `GET /api/v1/world/covid/usa` - Get USA statistics
- `GET /api/v1/world/covid/usa/:state` - Get state statistics
- `GET /api/v1/world/covid/usa/ny` - Get NY state statistics

#### Timezones
- `GET /api/v1/world/timezones` - Get all timezones
- `GET /api/v1/world/timezones/:timezone` - Get specific timezone
- `GET /api/v1/world/timezones/search/:query` - Search timezones

#### School Closings
- `GET /api/v1/world/closings` - Get school closings
- `GET /api/v1/world/closings/:state` - Get state closings

### 8. Authentication (`/api/v1/auth`)

User authentication and management.

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile (requires auth)
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/refresh` - Refresh auth token
- `GET /api/v1/auth` - Get help information

### 9. Server (`/api/v1`)

Server information and health endpoints.

- `GET /api/v1/version` - Get server version and status information
- `GET /api/healthz` - Health check endpoint (always returns 200, status in body)
- `GET /api/v1/cache` - Cache management
- `GET /api/v1/docs` - Swagger documentation
- `GET /api/v1/debug` - Debug information (development only)

### 10. Legacy Git Routes (`/api/v1/git`)

Maintained for backward compatibility with casjay.coffee frontend.

- `GET /api/v1/git` - Proxy to `/api/v1/me/info/github`
- `GET /api/v1/git/jason` - Proxy to `/api/v1/me/info/github`
- `GET /api/v1/git/user/:username` - Proxy to GitHub user endpoint
- `GET /api/v1/git/repos/:username` - Proxy to GitHub repos endpoint
- `GET /api/v1/git/orgs/:username` - Proxy to GitHub orgs endpoint

## Frontend Routes (EJS Views)

The API includes a full frontend interface using EJS templating with Bootstrap 5 (Darkly theme).

### Page Routes
- `/` - Homepage with all service categories ("My Data" section displayed first)
- `/utilities/base64` - Base64 encoder/decoder
- `/utilities/hash` - Hash generator (MD5, SHA1, SHA256, SHA512)
- `/utilities/uuid` - UUID generator
- `/utilities/jwt` - JWT decoder
- `/utilities/qr` - QR code generator
- `/utilities/color` - Color converter
- `/utilities/lorem` - Lorem ipsum generator
- `/utilities/passwd` - Password generator
- `/tools/commit` - Git commit message generator
- `/data/git` - GitHub data viewer
- `/data/reddit` - Reddit activity viewer
- `/data/covid` - COVID-19 statistics
- `/fun/anime` - Anime quotes
- `/data/domains` - Domain list (displays domains and subdomains in separate sections with copy functionality)
- `/data/timezones` - World timezones
- `/data/closings` - School closings
- `/data/blogs` - Blog posts list
- `/data/blogs/:slug` - Single blog post (renders markdown as HTML)
- `/personal/todos` - Todo manager (requires auth)
- `/personal/notes` - Note manager (requires auth)
- `/services/url` - URL shortener (requires auth)
- `/auth` - Authentication page

### Frontend Features
- Consistent layout with navigation menu
- Dark/Light theme toggle with localStorage persistence
- Dark theme default (Bootswatch Darkly)
- Form-based interactions for all tools
- Real-time results display
- Copy-to-clipboard functionality with fallback
- Mobile-responsive design
- **Global JavaScript Utilities (`utils.js`)** - Type-safe helper functions loaded on all pages:
  - `ensureString()`, `ensureArray()` - Type safety
  - `escapeHtml()` - XSS protection
  - `safeGet()` - Safe nested property access
  - `copyToClipboard()` - Clipboard with automatic fallback and feedback
  - `debounce()` - Function call debouncing
  - `formatDate()` - Consistent date formatting
  - `showLoading()`, `showError()`, `showSuccess()` - State management
- Page-specific JavaScript files:
  - `theme.js` - Dark/light theme toggle with localStorage
  - `utility-forms-v2.js` - Handles utility form submissions
  - `data-forms.js` - Handles data viewing forms
  - `base64.js` - Base64 specific functionality
  - `todos.js` - Todo management
  - `copy.js` - Copy to clipboard utility
  - `auth-cookies.js` - Authentication helpers

## Middleware and Utilities

### Response Formatters
- `formatSuccess(data)` - Format successful responses
- `formatError(message, details)` - Format error responses
- `sendJSON(res, data, status)` - Send JSON response
- `sendText(res, text, status)` - Send text response

### Validation Functions
- `validateBase64Input` - Validate base64 encoding/decoding input
- `validateHashInput` - Validate hash generation input
- `validateColorInput` - Validate color conversion input
- `validateQRInput` - Validate QR code generation input
- `validateJWTInput` - Validate JWT decoding input
- `validatePasswordOptions` - Validate password generation options

### Standard Headers
All responses include standard headers for CORS, caching, and security.

## External Data Sources

All personal data is fetched from GitHub repositories. **Important**: Frontend pages fetch from backend API endpoints, NOT directly from GitHub.

- Profile: `https://raw.githubusercontent.com/casjay/public/main/profile.json`
- Domains: `https://raw.githubusercontent.com/casjay/public/main/domains.json`
  - Structure: `{ "domains": [...], "subDomains": [...] }` (note: capital D in subDomains)
- Resume PDF: `https://raw.githubusercontent.com/casjay/public/main/Resume-Tech.pdf`
- Resume JSON: `https://raw.githubusercontent.com/casjay/public/main/resume.json`
- Blogs: `https://api.github.com/repos/malaks-us/jason/contents/_posts` (196 markdown files)
- Git Messages: `https://raw.githubusercontent.com/apimgr/gitmessages/main/src/data/messages.json`
- Timezones: `https://raw.githubusercontent.com/apimgr/timezones/main/src/data/timezones.json`
- Countries: `https://raw.githubusercontent.com/apimgr/countries/main/countries.json`

## Authentication

JWT-based authentication is required for:
- Todo management endpoints
- Note management endpoints  
- URL shortener endpoints
- User profile management

### Authentication Flow
1. Register: `POST /api/v1/auth/register` with username, email, password
2. Login: `POST /api/v1/auth/login` returns JWT token
3. Include token in Authorization header: `Bearer <token>`
4. Tokens expire after 24 hours
5. Refresh token: `POST /api/v1/auth/refresh`

## Rate Limiting

Rate limiting is applied to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Data creation endpoints: 20 requests per minute
- General endpoints: 100 requests per minute

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (external service down)

## Development

### Setup
```bash
npm install
npm run dev
```

### Environment Variables
See `.env.sample` for complete list. Key variables:

- `PORT` - Server port (default: 2000)
- `HOSTNAME` - Server hostname (default: localhost)
- `VERSION` - API version (default: 1.9.4)
- `TIMEZONE` - Server timezone (default: America/New_York)
- `MONGODB_URI` - MongoDB connection string (optional)
- `JWT_SECRET` - JWT signing secret (required for auth features)
- `NODE_ENV` - Environment (development/production)
- `GITHUB_API_KEY` - GitHub token for API access (optional but recommended)
- `REDDIT_CLIENT_ID` - Reddit client ID (optional)
- `REDDIT_CLIENT_SECRET` - Reddit client secret (optional)
- `PROFILE_URL` - Profile JSON URL (default: GitHub raw)
- `BLOG_URL` - Blog posts URL (default: malaks-us/jason/_posts)
- `DOMAIN_LIST` - Domains JSON URL (default: GitHub raw)
- `GIT_MESSAGE_URL` - Commit messages JSON URL
- `TIMEZONE_URL` - Timezones JSON URL
- `COUNTRIES_URL` - Countries JSON URL

### Project Structure
```
api/
├── api/
│   ├── index.js          # Main server file
│   ├── routes/           # All route handlers
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB models
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── views/           # EJS templates
│   │   ├── layouts/     # Layout templates
│   │   ├── pages/       # Page templates
│   │   └── partials/    # Reusable components
│   └── public/          # Static assets
│       ├── css/         # Stylesheets
│       ├── js/          # Client-side JavaScript
│       └── images/      # Images
├── package.json
├── now.json            # Vercel configuration
└── SPEC.md            # This specification

casjay.coffee/         # Separate Vue.js frontend
├── src/
├── dist/
└── package.json
```

### Testing
```bash
npm test
npm run test:endpoints
```

### Deployment
- Vercel: `vercel deploy`
- Docker: `docker-compose up`

## Vercel Configuration

The project uses Vercel for deployment with the following configuration:
- Builder: `@vercel/node` (updated from deprecated `@now/node`)
- Configuration file: `now.json` (do NOT use both `now.json` and `vercel.json`)
- Output directory: `api`
- MongoDB connection handled via environment variables
- Automatic SSL/HTTPS
- Recent deployment: `https://api-ozmpeipy0-casjaysdev.vercel.app`

## Security Considerations

1. **Input Validation**: All user inputs are validated using dedicated validation functions
2. **SQL Injection Prevention**: Using parameterized queries with MongoDB
3. **XSS Prevention**: Input sanitization and output encoding
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Applied on sensitive endpoints
6. **JWT Security**: Tokens expire after 24 hours
7. **Password Security**: Passwords hashed using bcrypt (10 rounds)
8. **HTTPS**: Enforced in production via Vercel
9. **Headers**: Security headers set via middleware
10. **Environment Variables**: Sensitive data stored in environment variables

## API Patterns

### Consistent Function-Based Validation
All routes use function-based validation middleware:
```javascript
router.post('/endpoint', validateInput, async (req, res) => {
  // Handler logic
});
```

### Dual Response Format Pattern
All endpoints support both JSON and text responses:
```javascript
// JSON endpoint
router.get('/data', async (req, res) => {
  sendJSON(res, formatSuccess(data));
});

// Text endpoint
router.get('/data/text', async (req, res) => {
  sendText(res, formatDataAsText(data));
});
```

### Error Handling Pattern
Consistent error handling across all endpoints:
```javascript
try {
  // Logic
} catch (error) {
  sendJSON(res, formatError(error.message), 500);
}
```

## Recent Updates

### January 2026 - Server Terminology and Theme Toggle

1. **Server Terminology**:
   - Changed "System" to "Server" throughout (we are a server, not a system/OS)
   - Changed "Hostname" to "FQDN" (Fully Qualified Domain Name)
   - Updated version page, API responses, and documentation

2. **Dark/Light Theme Toggle**:
   - Added theme toggle button in navbar (moon/sun icon)
   - Persists preference in localStorage
   - Respects system `prefers-color-scheme` preference
   - Light theme CSS variables for all components
   - No flash of wrong theme on page load

3. **API Root Endpoint**:
   - `/api` now returns comprehensive help with all available routes
   - Routes organized by category: Tools, Me, Data, Fun, Social, World, Auth, Server
   - Fixed route ordering so `/api` works before mainRoute catch-all

4. **Health Endpoint**:
   - Health endpoint always returns HTTP 200
   - Health status (healthy/degraded) returned in response body
   - Allows monitoring tools to parse status from body

5. **Blog Posts Frontend**:
   - `/data/blogs/:slug` now renders blog posts as HTML pages
   - Markdown converted to HTML using `marked` library
   - "Read Post" links to frontend instead of GitHub
   - API endpoint `/api/v1/data/blogs/post/:slug` returns `contentHtml`
   - Full blog post view with breadcrumbs, metadata, and styling

### December 2024 - Data Source Fixes and Frontend Enhancements

1. **Global JavaScript Utilities**:
   - Created `utils.js` with type-safe helper functions
   - Loaded globally on all pages via main layout
   - Fixes common JavaScript errors like "text.replace is not a function"
   - Provides consistent clipboard, type checking, and HTML escaping utilities
   - Documented in `/api/public/js/README.md`

2. **Fixed Broken External Data URLs**:
   - Updated Git Messages URL: `gitmessages/main/src/data/messages.json` (repo renamed from Commitmessages)
   - Fixed Timezone URL: Removed invalid `refs/heads/main` path segment
   - Fixed Countries URL: Updated to use correct raw.githubusercontent.com format
   - **Important**: Always use `raw.githubusercontent.com` format, NOT `github.com/repo/raw`

2. **Vercel Deployment Fixes**:
   - Fixed "Cannot find module 'dotenv'" error
   - Updated `now.json` to use `@vercel/node` builder instead of deprecated `@now/node`
   - Removed conflicting `vercel.json` file (cannot use both now.json and vercel.json)
   - Successfully deployed to production

3. **Domains Frontend Enhancement**:
   - Updated domain controller to properly read `domains` and `subDomains` keys from JSON source
   - Fixed template to handle both `subDomains` (capital D) and `subdomains` naming conventions
   - Implemented separate card sections for domains and subdomains on frontend
   - Added visual copy feedback: green highlight, checkmark, and "✓ Copied!" message
   - Filter out empty subdomain entries from display
   - Removed conflicting route handler (mainRoute.js already handles /data/domains)

4. **Frontend Architecture Clarification**:
   - Frontend pages (`/data/*`) fetch data from backend API endpoints
   - Backend API endpoints fetch from external sources (GitHub, etc.)
   - Frontend NEVER fetches directly from GitHub or external sources
   - Example flow: `/data/domains` → `/api/v1/me/info/domains` → GitHub raw URL

5. **Route Reorganization** (Previous):
   - Moved all utility endpoints from `/utilities` to `/tools`
   - Created proper categories (tools, data, fun, social, world)
   - Implemented `/me/info` for personal data

6. **Frontend Implementation** (Previous):
   - Created EJS views for all endpoints
   - Implemented consistent theming with Bootstrap 5
   - Added interactive forms for all tools
   - Updated JavaScript to use new API routes

7. **Backward Compatibility** (Previous):
   - Maintained `/api/v1/git` routes for casjay.coffee
   - Legacy `/utilities` routes proxy to new `/tools` endpoints

8. **Resume Enhancement** (Previous):
   - Added JSON resume endpoint fetching from GitHub
   - Text format endpoint for resume
   - PDF view/download remain unchanged

## Versioning

This API follows semantic versioning. The current version is v1.
Breaking changes will result in a new version (v2).

## Support

- GitHub Issues: https://github.com/now-sh/api/issues
- Documentation: https://docs.casjay.coffee
- Contact: casjay@yahoo.com

## License

This project is licensed under the MIT License.