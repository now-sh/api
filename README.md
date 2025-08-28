# 👋 Welcome to the API Project 👋

A comprehensive Express.js API server featuring categorized endpoints,
authentication, todos, notes, URL shortener, and various utility services.

## 📋 Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MongoDB** (local or remote)

### Quick MongoDB Setup

```shell
# Docker (recommended for development)
docker run -p 0.0.0.0:27017:27017 --name mongo-dev -d mongo:latest

# Or use MongoDB Atlas for cloud hosting
```

## 🚀 Quick Start

### Production

```shell
npm install
npm run start
```

### Development

```shell
npm install
npm run dev
```

## ⚙️ Environment Configuration

Copy `.env.sample` to `.env` and configure:

```env
# Server Configuration
PORT=1919
VERSION=1.9.2
TIMEZONE=America/New_York

# Authentication
JWT_SECRET=your-very-long-secret-key

# MongoDB Connections (separate databases for different features)
MONGO_URI_API=mongodb://localhost/api?retryWrites=true&w=majority
MONGO_URI_TODOS=mongodb://localhost/todo?retryWrites=true&w=majority
MONGO_URI_NOTES=mongodb://localhost/notes?retryWrites=true&w=majority
MONGO_URI_SHRTNR=mongodb://localhost/shrtnr?retryWrites=true&w=majority

# External APIs
GITHUB_API_KEY=your-github-token
HEADER_AGENT=YourApp/1.0 (+https://yoursite.com)

# Optional URLs
BLOG_URL=https://api.github.com/repos/user/repo/contents/_posts
DOMAIN_LIST=https://example.com/domains.json
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

# Company services
HEADER_AGENT="AcmeCorp-API/2.1 (+https://api.acmecorp.com)"
```

**Default value:** `API-Server/1.0 (+https://github.com/now-sh/api)`

## 🏗️ Architecture

### MVC Structure

- **Models** (`/models/`) - MongoDB schemas using Mongoose
- **Controllers** (`/controllers/`) - Business logic
- **Routes** (`/routes/`) - API endpoints with categorized structure
- **Middleware** (`/middleware/`) - Authentication, rate limiting, etc.

### Database Architecture

Multiple MongoDB databases for separation of concerns:

- **API Database** - Users, authentication tokens
- **Todos Database** - Todo items and lists
- **Notes Database** - Notes, gists, and documents
- **Shortener Database** - URL shortening service

### Route Organization

API endpoints are organized into logical categories:

- **🔧 Utilities** - Encoding, hashing, UUID, passwords, JWT, QR codes
- **🛠️ Tools** - Commit generators, development utilities  
- **📊 Data** - External APIs, time zones, domains
- **⚕️ Health** - COVID data, monitoring endpoints
- **👤 Personal** - Notes, todos, user management
- **🌐 Services** - URL shortener, authentication

## 🔐 Authentication System

### Token-based Authentication (JWT)

- **Never-expiring tokens** (configurable)
- **Token rotation** for security
- **Revocation support** (individual or all tokens)
- **Database tracking** of all tokens

### Endpoints

```text
GET    /api/v1/auth         # Authentication info
POST   /api/v1/auth/signup  # Create account
POST   /api/v1/auth/login   # Login
GET    /api/v1/auth/me      # Get user info
PUT    /api/v1/auth/update  # Update profile
POST   /api/v1/auth/rotate  # Rotate token
GET    /api/v1/auth/tokens  # List active tokens
POST   /api/v1/auth/revoke  # Revoke token(s)
POST   /api/v1/auth/revoke-all # Revoke all tokens
```

### Usage

```bash
# Sign up
curl -X POST /api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secure123"}'

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" /api/v1/auth/me

# Rotate token for security
curl -X POST /api/v1/auth/rotate \
  -H "Authorization: Bearer YOUR_CURRENT_TOKEN"
```

## 📝 Features

### Todos API (`/api/v1/todos`)

- **Public by default** (can be made private)
- **Authentication required** for creation/modification
- **No auth needed** for reading public todos
- Features: tags, priorities, due dates, completion tracking

### Notes API (`/api/v1/notes`)

- **Google Keep + GitHub Gists style**
- **Public by default** (can be made private)
- **Multiple content types:** text, markdown, code
- Features: syntax highlighting, collaboration, pinning, attachments

### URL Shortener (`/api/v1/url`)

- **Custom aliases** and **expiration dates**
- **Click tracking** and **statistics**
- **Public/private** URLs
- **User-owned** URLs with authentication

### Categorized API Endpoints

#### 🔧 Utilities (`/api/v1/utilities/`)
- **Base64** encode/decode (`/utilities/base64`)
- **Hashing** (MD5, SHA1, SHA256, SHA512) (`/utilities/hash`)
- **UUID** generation (`/utilities/uuid`)
- **Password** generation (`/utilities/passwd`)
- **JWT** decoding/validation (`/utilities/jwt`)
- **QR Code** generation (`/utilities/qr`)
- **Color** conversion (`/utilities/color`)
- **Lorem Ipsum** generation (`/utilities/lorem`)

#### 🛠️ Tools (`/api/v1/tools/`)
- **Commit Generator** (`/tools/commit`)

#### 📊 Data (`/api/v1/data/`)
- **Time zones** (`/data/timezones`)
- **Domains** (`/data/domains`)
- **School closings** (`/data/closings`)

#### ⚕️ Health (`/api/v1/health/`)
- **COVID data** (`/health/disease`)
- **Global stats** (`/health/global`)

#### 👤 Personal (`/api/v1/personal/`)
- **Todos** management (`/personal/todos`)
- **Notes** management (`/personal/notes`)

#### 🌐 Services (`/api/v1/services/`)
- **URL Shortener** (`/services/url`)

### Legacy Compatibility

All original endpoints remain available for backward compatibility:
- `/api/v1/base64` → `/api/v1/utilities/base64`
- `/api/v1/hash` → `/api/v1/utilities/hash`
- *etc.*

### Additional Endpoints

#### Legacy & Special Routes
- **GitHub** integration (`/api/v1/git`)
- **Anime** quotes (`/api/v1/anime`) 
- **Version** info (`/api/v1/version`)
- **API Help** (`/api/help`)

## 🛡️ Security Features

- **Rate limiting** with express-rate-limit
- **Input validation** with express-validator
- **CORS** support
- **Helmet** security headers
- **Password hashing** with bcrypt
- **Token blacklisting/revocation**
- **Request timeout protection**

## 🔧 Development

### Scripts

```shell
npm run start     # Production server
npm run dev       # Development with nodemon
npm run lint      # ESLint code checking
npm run commit    # Automated git commits
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

## 📊 API Documentation

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

## 🔄 Pagination Support

The GitHub API endpoints automatically handle pagination to fetch all results:

- Fetches multiple pages automatically
- Combines results from all pages
- Handles rate limiting appropriately
- Returns complete datasets

## 📦 Deployment

### Environment Setup

1. Set all required environment variables
2. Ensure MongoDB connections are accessible
3. Configure external API keys (GitHub, etc.)

### Production Considerations

- Use **PM2** or similar for process management
- Set up **reverse proxy** (nginx)
- Configure **SSL certificates**
- Monitor **database connections**
- Set up **logging** and **monitoring**

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for new features
3. Add proper error handling
4. Include input validation
5. Update documentation

## 📄 License

MIT

## 👤 Author

Jason Hempstead

---

🔥 **Pro Tip:** Use the `/help` endpoint on any route to see available
options and examples!
