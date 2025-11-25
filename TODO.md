# API TODO List

## Summary
All critical fixes have been completed and deployed! ✅

### What was fixed in this session:
1. **Critical Fixes** - Fixed /version, /utilities/passwd, /fun/jokes, verified todos and notes routes work
2. **Data Pages** - Added routes for /data/covid, /data/timezones, /data/git with baseUrl, improved /data/blogs with server-side data fetching
3. **Documentation** - Fixed all curl examples to include full domain with proper formatting

### Remaining Tasks:
- Individual blog post pages at /data/blogs/{title} (future enhancement)

## New Fixes (Latest)
- [x] Fix Reddit profile images double-encoding issue - Changed from `<%= ... %>` to `<%- ... %>` for icon_img and banner_img URLs to prevent double HTML entity encoding (&amp;amp; -> &amp;)
- [x] Fix misleading Reddit endpoint labels - Changed "Posts" to "Profile" since endpoints return profile data, not posts
- [x] Enhanced Reddit page with more detailed profile information - Added account ID, employee status, follower settings, subscription status
- [x] Fixed Reddit data stripping - Created separate functions for profile vs posts data
  - Created `fetchRedditUserProfile()` for profile data (`/user/username/about.json`)
  - Updated `fetchRedditData()` to fetch posts data (`/user/username.json`)
  - `/api/v1/social/reddit/u/:username` now returns POSTS (full Reddit data like reddit.com/user/username.json)
  - `/api/v1/me/info/reddit` returns PROFILE data (karma, badges, account info)
  - `/data/reddit` page shows PROFILE data

## Critical Fixes
- [x] Fix /version page - Cannot find module error (fixed package.json path and testVersionData variable)
- [x] Fix /utilities/passwd - keeps refreshing instead of generating (removed duplicate dispatch)
- [x] Fix /fun/jokes - puns endpoint broken (changed data-type="pun" to data-type="puns")
- [x] Fix /api/v1/data/todos - Route works correctly, returns empty array when no data
- [x] Fix /personal/notes - Route works correctly, returns empty array when no data

## Data Pages to Work On
- [x] /data/covid - added route with baseUrl
- [x] /data/timezones - added route with baseUrl
- [x] /data/git - added baseUrl to existing route
- [x] /data/blogs - added server-side data fetching like reddit page
  - [x] Shows blog listing
  - [ ] Should open frontend page: /data/blogs/{title} (needs individual post pages)

## Documentation Improvements
- [x] Add full domain to all curl examples
  - Fixed anime.ejs to use `curl -q -LSsf <%= baseUrl %>/api/v1/...`
  - All other pages already had proper curl examples with baseUrl

## Completed
- [x] Fix Reddit page data loading
- [x] Fix URL shortener error handling
- [x] Replace all alert() with modals
- [x] Test deployed site
