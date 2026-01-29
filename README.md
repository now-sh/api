# API Server

A comprehensive Express.js API server featuring categorized endpoints,
authentication, todos, notes, URL shortener, and various utility services.

## Official Site

- **Live API**: [https://api.casjay.coffee](https://api.casjay.coffee)
- **API Documentation**: [https://api.casjay.coffee/api/docs](https://api.casjay.coffee/api/docs)
- **Version Info**: [https://api.casjay.coffee/version](https://api.casjay.coffee/version)

## Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MongoDB** (local or remote)

## Installation

```shell
# Clone the repository
git clone https://github.com/casjay/api.git
cd api

# Install dependencies
npm install

# Copy and configure environment
cp .env.sample .env
# Edit .env with your settings
```

## Production

### Quick Start

```shell
npm install --production
npm run start
```

### Using PM2 (Recommended)

```shell
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start api/index.js --name "api-server"

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Docker

```shell
# Build the image
docker build -t api-server .

# Run the container
docker run -d \
  --name api-server \
  -p 1919:1919 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/api \
  -e JWT_SECRET=your-secret-key \
  api-server
```

### Production Considerations

- Use **PM2** or similar for process management
- Set up **reverse proxy** (nginx/caddy)
- Configure **SSL certificates**
- Monitor **database connections**
- Set up **logging** and **monitoring**

## Environment Configuration

Copy `.env.sample` to `.env` and configure:

```env
# Server Configuration
PORT=1919
HOSTNAME=api.example.com
VERSION=1.9.4
TIMEZONE=America/New_York

# Authentication
JWT_SECRET=your-very-long-secret-key

# MongoDB Connection
MONGODB_URI=mongodb://your-mongo-host:27017/api?retryWrites=true&w=majority

# External APIs
GITHUB_API_KEY=your-github-token
GITHUB_USERNAME=your-github-username
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
HEADER_AGENT=YourApp/1.0 (+https://yoursite.com)

# Data Sources (optional - defaults provided)
BLOG_URL=https://api.github.com/repos/user/repo/contents/_posts
DOMAINS_URL=https://example.com/domains.json
```

### HEADER_AGENT Configuration

The `HEADER_AGENT` environment variable sets the User-Agent header for
external API requests.

**Why needed:**

- Many APIs require User-Agent identification
- Used for rate limiting and monitoring
- Prevents blocked requests
- Good API etiquette

**Recommended formats:**

```env
# Standard format
HEADER_AGENT="MyAPI/1.0 (+https://myapi.com)"

# GitHub Apps
HEADER_AGENT="MyGitHubApp/1.0"

# Personal projects
HEADER_AGENT="JohnsAPI/1.0 (john@example.com)"
```

## CLI Usage

### Health Check

```shell
curl -q -LSsf https://api.casjay.coffee/api/v1/version
```

### Authentication

```shell
# Sign up
curl -q -LSsf -X POST https://api.casjay.coffee/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secure123"}'

# Login
curl -q -LSsf -X POST https://api.casjay.coffee/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123"}'

# Use token in requests
curl -q -LSsf -H "Authorization: Bearer YOUR_TOKEN" https://api.casjay.coffee/api/v1/auth/me
```

## API Endpoints

### Authentication (`/api/v1/auth`)

```text
GET    /api/v1/auth         # Authentication info
POST   /api/v1/auth/signup  # Create account
POST   /api/v1/auth/login   # Login
GET    /api/v1/auth/me      # Get user info
PUT    /api/v1/auth/update  # Update profile
POST   /api/v1/auth/rotate  # Rotate token
GET    /api/v1/auth/tokens  # List active tokens
POST   /api/v1/auth/revoke  # Revoke token(s)
```

### Tools (`/api/v1/tools/`)

- **Base64** encode/decode (`/tools/base64`)
- **Hashing** (MD5, SHA1, SHA256, SHA512) (`/tools/hash`)
- **UUID** generation (`/tools/uuid`)
- **Password** generation (`/tools/passwd`)
- **JWT** decoding/validation (`/tools/jwt`)
- **QR Code** generation (`/tools/qr`)
- **Color** conversion (`/tools/color`)
- **Lorem Ipsum** generation (`/tools/lorem`)
- **Commit** message generator (`/tools/commit`)
- **Markdown** preview (`/tools/markdown`)
- **Cron** expression parser (`/tools/cron`)
- **Regex** tester (`/tools/regex`)
- **Diff** comparison (`/tools/diff`)
- **Dictionary** lookup (`/tools/dictionary`)

### Data (`/api/v1/data/`)

- **Todos** management (`/data/todos`)
- **Notes** management (`/data/notes`)
- **URLs** shortener (`/data/urls`)

### World (`/api/v1/world/`)

- **COVID** data (`/world/covid`)
- **Disease** statistics (`/world/disease`)
- **Timezones** (`/world/timezones`)
- **School Closings** (`/world/closings`)
- **USA** data (`/world/usa`)
- **NYS** data (`/world/nys`)

### Social (`/api/v1/social/`)

- **GitHub** integration (`/social/github`)
- **Reddit** integration (`/social/reddit`)
- **Blogs** (`/social/blogs`)

### Fun (`/api/v1/fun/`)

- **Jokes** (`/fun/jokes`)
- **Facts** (`/fun/facts`)
- **Trivia** (`/fun/trivia`)
- **Anime** quotes (`/fun/anime`)

### Personal (`/api/v1/me/`)

- **Info** (`/me/info`)
- **Domains** (`/me/domains`)
- **Blog** (`/me/blog`)

## Features

### Todos API

- **Public by default** (can be made private)
- **Authentication required** for creation/modification
- Features: tags, priorities, due dates, completion tracking

### Notes API

- **Google Keep + GitHub Gists style**
- **Multiple content types:** text, markdown, code
- Features: syntax highlighting, pinning, attachments

### URL Shortener

- **Custom aliases** and **expiration dates**
- **Click tracking** and **statistics**
- **Public/private** URLs

## Architecture

### MVC Structure

- **Models** (`/models/`) - MongoDB schemas using Mongoose
- **Controllers** (`/controllers/`) - Business logic
- **Routes** (`/routes/`) - API endpoints with categorized structure
- **Middleware** (`/middleware/`) - Authentication, rate limiting, etc.

### Route Organization

API endpoints are organized into logical categories:

- **Tools** - Developer tools and utilities
- **Data** - Data storage and management
- **World** - Global information and statistics
- **Social** - Social media integrations
- **Fun** - Entertainment APIs
- **Me** - Personal data endpoints

## Security Features

- **Rate limiting** with express-rate-limit
- **Input validation** with express-validator
- **CORS** support
- **Helmet** security headers
- **Password hashing** with bcrypt
- **Token blacklisting/revocation**
- **Request timeout protection**

## Development

### Quick Start

```shell
npm install
npm run dev
```

### Scripts

```shell
npm run start     # Production server
npm run dev       # Development with nodemon
npm run lint      # ESLint code checking
npm run commit    # Automated git commits
```

### MongoDB Setup for Development

```shell
# Docker (recommended)
docker run -d \
  --name mongo-dev \
  -p 27017:27017 \
  mongo:latest

# Or use MongoDB Atlas for cloud hosting
```

### Code Organization

- **JavaScript** codebase with CommonJS modules
- **Express.js** with modular router architecture
- **VS Code** integration with proper settings
- **ESLint** for code quality and consistency

### Testing External APIs

All external requests include 5-second timeouts and proper error handling:

- **GitHub API** - with pagination support
- **Cheerio scraping** - with timeout wrapper
- **Axios/Fetch** - with timeout utilities

## API Documentation

Visit `/api/docs` for interactive Swagger documentation when the server is running.

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "errors": []
}
```

### Error Handling

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Update documentation

## License

MIT

## Author

Jason Hempstead

---

**Pro Tip:** Use the `/help` endpoint on any route to see available options and examples!
