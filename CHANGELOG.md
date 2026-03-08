# Changelog - NewsFlow Security & Bug Fixes

## [1.2.0] - 2026-03-08

### ✨ New Features

#### 🌍 NewsFlowGlob - Geographic News Visualization
- **Interactive World Map** with SVG-based visualization
- **Geographic Filtering** by region (Europe, North America, Middle East, Global, Asia)
- **Live Markers** on map showing news locations
- **Animated Breaking News Markers** with pulsing rings
- **Color-coded importance** (red=breaking, orange=important, gray=normal)
- **30+ RSS feeds** now include geographic coordinates
- **Regional grouping** with article counts per region
- **Hover tooltips** on map markers showing title and source
- **New Globe view mode** accessible via 🌍 button in header

#### Geographic Data Enhancement
- Added `region`, `lat`, `lon` to all news items
- Coordinate data for all RSS feed sources
- Regional clustering and filtering
- Map legend with importance levels

See [GLOBE_FEATURE.md](GLOBE_FEATURE.md) for complete documentation.

---

## [1.1.0] - 2026-03-08

### 🔒 Security Fixes

#### Critical
- **Updated Next.js from 14.2.0 to 16.1.6**
  - Fixed DoS vulnerability in Image Optimizer (GHSA-9g9p-9gw9-jx7f)
  - Fixed HTTP request deserialization DoS (GHSA-h25m-26qc-wcjf)
  - Zero npm audit vulnerabilities after update

#### High Priority
- **Replaced regex-based XML parsing with rss-parser library**
  - Eliminates XML injection risks
  - Proper handling of CDATA sections
  - Better error handling and security
  - Prevents XML entity expansion attacks

- **Restricted image domain whitelist**
  - Removed wildcard `hostname: '**'` configuration
  - Added 40+ trusted news source domains only
  - Prevents loading malicious images from untrusted sources

#### Medium Priority
- **Implemented rate limiting**
  - 60 requests per minute per IP address
  - Returns HTTP 429 with Retry-After header
  - Uses X-Forwarded-For and X-Real-IP headers
  - In-memory rate limit storage

- **Added comprehensive input validation**
  - Topic filter: Whitelist validation
  - Country filter: Whitelist validation
  - Importance filter: Whitelist validation
  - Search query: Max 100 chars, regex validation for safe characters
  - Source filter: Validated against actual sources

#### Low Priority
- **Enhanced URL validation**
  - Validates all URLs start with http:// or https://
  - Validates image URLs before processing
  - Skips invalid entries

- **Improved error handling**
  - Replaced empty catch blocks with proper error logging
  - Added error context (feed source, URL)
  - Better debugging capabilities

### 🐛 Bug Fixes

- **Improved deduplication algorithm**
  - Implemented Levenshtein distance algorithm
  - 85% similarity threshold for detecting duplicates
  - Prevents duplicate articles with slight title variations
  - More accurate than previous 60-char prefix matching

- **Frontend error handling**
  - Added HTTP status code validation
  - Handle rate limit errors (429) gracefully
  - Validate API response structure
  - Better error messages for users

### ✨ Improvements

- **Better RSS feed parsing**
  - Support for both RSS and Atom feeds
  - Proper media content extraction
  - Handles multiple image formats
  - More reliable date parsing

- **Response validation**
  - Validates API response structure
  - Fallback values for missing data
  - Type-safe response handling

### 📝 Documentation

- **Added SECURITY.md**
  - Comprehensive security documentation
  - Testing recommendations
  - Future enhancement suggestions
  - Deployment security checklist

- **Added .env.example**
  - Environment variable templates
  - Configuration documentation
  - Security settings examples

- **Added CHANGELOG.md**
  - Track all changes
  - Security fix documentation
  - Version history

### 🔧 Technical Changes

#### Dependencies
```json
{
  "next": "^14.2.0" → "^16.1.6",
  "rss-parser": "^3.13.0" (now actively used)
}
```

#### Configuration Files
- `next.config.js`: Updated image domains whitelist
- `tsconfig.json`: Auto-updated by Next.js 16
- `.gitignore`: No changes needed

#### Code Structure
- `app/api/news/route.ts`: Complete security overhaul
  - Added rate limiting
  - Added input validation
  - Replaced XML parsing
  - Improved error handling
  - Enhanced deduplication

- `app/page.tsx`: Frontend improvements
  - Better error handling
  - Rate limit handling
  - Response validation

### 🧪 Testing

Tested and verified:
- ✅ Build succeeds without errors
- ✅ TypeScript compilation passes
- ✅ All 30+ RSS feeds still work
- ✅ Rate limiting functions correctly
- ✅ Input validation rejects invalid parameters
- ✅ Image whitelist works properly
- ✅ Deduplication is more accurate

### 📊 Performance

- **No performance degradation**
  - rss-parser is more efficient than regex parsing
  - Levenshtein distance only applied to titles >30 chars
  - Rate limiting adds negligible overhead
  - Build time: ~3 seconds (unchanged)

### 🚀 Deployment Notes

1. Run `npm install` to update dependencies
2. Review SECURITY.md for deployment checklist
3. Configure environment variables (see .env.example)
4. Test rate limiting in production
5. Monitor error logs for feed parsing issues

### ⚠️ Breaking Changes

None. All changes are backward compatible.

### 🔜 Future Enhancements

See SECURITY.md for recommended improvements:
- Persistent rate limiting (Redis)
- Content Security Policy headers
- API authentication
- Automated security scanning
- Enhanced monitoring

---

## [1.0.0] - Initial Release

### Features
- News aggregation from 30+ sources
- Multi-topic filtering (Politik, Sport, Tech, etc.)
- Multi-country support (DE, US, UK, etc.)
- Importance scoring (high, medium, low)
- Polymarket relevance detection
- Search functionality
- Three view modes (grid, list, ticker)
- Auto-refresh every 2 minutes
- Dark theme UI
- Mobile responsive design

---

**Maintainer:** Julius
**Date:** March 8, 2026
**Version:** 1.1.0
