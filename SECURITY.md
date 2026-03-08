# Security Improvements - NewsFlow

## Overview
This document outlines the security improvements made to the NewsFlow application.

## Critical Vulnerabilities Fixed

### 1. ✅ Next.js Security Vulnerabilities (HIGH)
**Issue:** Outdated Next.js version (14.2.0) with known DoS vulnerabilities
- GHSA-9g9p-9gw9-jx7f: DoS via Image Optimizer remotePatterns
- GHSA-h25m-26qc-wcjf: HTTP request deserialization DoS

**Fix:** Updated to Next.js 16.1.6
```bash
npm audit fix --force
```

### 2. ✅ XML Injection Vulnerability (MODERATE)
**Issue:** Custom regex-based XML parsing vulnerable to malformed XML and edge cases

**Original Code:**
```typescript
// Unsafe regex-based parsing
const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
```

**Fix:** Implemented robust `rss-parser` library
```typescript
const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsFlow/1.0' },
  maxRedirects: 3,
});
const rss = await parser.parseURL(feed.url);
```

**Benefits:**
- Proper XML/RSS parsing with security built-in
- Handles CDATA sections correctly
- Prevents XML entity expansion attacks
- Better error handling

### 3. ✅ Unrestricted Image Sources (MODERATE)
**Issue:** Allowed loading images from ANY HTTPS domain (`hostname: '**'`)

**Original Code:**
```javascript
images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
```

**Fix:** Whitelisted only trusted news source domains
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'www.tagesschau.de' },
    { protocol: 'https', hostname: 'cdn.tagesschau.de' },
    // ... 40+ trusted domains only
  ]
}
```

**Benefits:**
- Prevents loading malicious images
- Reduces attack surface
- Better performance (fewer external requests)

### 4. ✅ Missing Rate Limiting (MODERATE)
**Issue:** No rate limiting on API endpoint, vulnerable to abuse

**Fix:** Implemented in-memory rate limiter
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 60) return false;
  limit.count++;
  return true;
}
```

**Configuration:**
- 60 requests per minute per IP
- Returns HTTP 429 with Retry-After header
- Uses X-Forwarded-For and X-Real-IP headers

### 5. ✅ Input Validation Missing (LOW-MODERATE)
**Issue:** No validation of query parameters

**Fix:** Added comprehensive input validation
```typescript
function validateFilterParam(value: string | null, allowedValues: string[]): string | null {
  if (!value) return null;
  return allowedValues.includes(value) ? value : null;
}

function validateSearchQuery(query: string | null): string | null {
  if (!query) return null;
  const sanitized = query.trim().slice(0, 100);
  return /^[\w\s\-.,!?äöüßÄÖÜ]+$/.test(sanitized) ? sanitized : null;
}
```

**Validated Parameters:**
- `topic`: Whitelist of valid topics
- `country`: Whitelist of valid country codes
- `importance`: Whitelist of valid importance levels
- `q` (search): Max 100 chars, alphanumeric + common punctuation only

### 6. ✅ Weak Deduplication Algorithm (LOW)
**Issue:** Simple string matching could miss duplicates

**Original Code:**
```typescript
const key = item.title.toLowerCase().slice(0, 60);
if (seen.has(key)) return false;
```

**Fix:** Implemented Levenshtein distance algorithm
```typescript
function levenshteinDistance(a: string, b: string): number {
  // Matrix-based edit distance calculation
}

// 85% similarity threshold for deduplication
if (similarity > 0.85) {
  isDuplicate = true;
}
```

**Benefits:**
- Catches similar titles with slight variations
- Reduces duplicate news items
- Better user experience

### 7. ✅ Poor Error Handling (LOW)
**Issue:** Silent failures with empty catch blocks

**Original Code:**
```typescript
catch {
  return [];
}
```

**Fix:** Added proper error logging
```typescript
catch (error) {
  console.error(`Error parsing feed ${feed.source} (${feed.url}):`, error);
  return [];
}
```

### 8. ✅ URL Validation Missing (LOW)
**Issue:** No validation of URLs from RSS feeds

**Fix:** Added URL validation
```typescript
// Validate link
const link = item.link.trim();
if (!link.startsWith('http://') && !link.startsWith('https://')) continue;

// Validate image URL
if (image && (!image.startsWith('http://') && !image.startsWith('https://'))) {
  image = undefined;
}
```

## Additional Security Features

### Frontend Security Enhancements
- Added response validation in `fetchNews()`
- Handle rate limit errors (HTTP 429)
- Validate API response structure
- Better error messages for users

### Existing Security Features (Maintained)
- ✅ React auto-escapes content (XSS prevention)
- ✅ External links use `rel="noopener"` (prevents tabnabbing)
- ✅ TypeScript strict mode enabled
- ✅ No API keys or secrets in code
- ✅ HTTPS-only for all feeds
- ✅ HTML stripping from RSS content
- ✅ No `dangerouslySetInnerHTML` usage

## Security Best Practices Applied

1. **Defense in Depth**: Multiple layers of validation (input, parsing, output)
2. **Principle of Least Privilege**: Only allow whitelisted domains and parameters
3. **Fail Securely**: Invalid input is rejected, not processed
4. **Input Validation**: All user input is validated and sanitized
5. **Rate Limiting**: Prevents abuse and DoS attacks
6. **Dependency Management**: Keep dependencies updated
7. **Error Handling**: Proper logging without exposing sensitive data

## Testing Recommendations

### Security Testing Checklist
- [ ] Test rate limiting (>60 requests/minute)
- [ ] Test invalid query parameters
- [ ] Test XSS payloads in search
- [ ] Test SQL injection patterns (should be harmless but test anyway)
- [ ] Test long search queries (>100 chars)
- [ ] Test special characters in search
- [ ] Test invalid image URLs
- [ ] Test malformed RSS feeds
- [ ] Test HTTPS enforcement
- [ ] Load test with concurrent requests

### Manual Testing Commands
```bash
# Test rate limiting
for i in {1..65}; do curl http://localhost:3000/api/news; done

# Test invalid parameters
curl "http://localhost:3000/api/news?topic=INVALID"
curl "http://localhost:3000/api/news?country=XX"

# Test search validation
curl "http://localhost:3000/api/news?q=<script>alert('xss')</script>"
curl "http://localhost:3000/api/news?q=$(python -c 'print("A"*1000)')"

# Test valid requests
curl "http://localhost:3000/api/news?topic=Tech&country=DE"
```

## Monitoring Recommendations

1. **Setup Error Tracking**: Integrate Sentry or similar
2. **Monitor Rate Limits**: Track 429 responses
3. **Log Suspicious Activity**: Failed validations, unusual patterns
4. **Monitor Feed Failures**: Track RSS parsing errors
5. **Performance Metrics**: API response times, cache hit rates

## Future Security Enhancements

### Recommended Improvements
1. **Persistent Rate Limiting**: Use Redis instead of in-memory Map
2. **Content Security Policy (CSP)**: Add strict CSP headers
3. **CORS Configuration**: Restrict allowed origins
4. **API Authentication**: Add API key for frontend (if needed)
5. **Request Signing**: Prevent replay attacks
6. **Automated Security Scanning**: Integrate SAST/DAST tools
7. **Dependency Scanning**: Use Dependabot or Snyk
8. **Security Headers**: Add HSTS, X-Frame-Options, etc.

### Next.js Security Headers Example
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Deployment Security Checklist

- [ ] Enable HTTPS (required for Vercel)
- [ ] Set environment variables securely
- [ ] Configure Vercel security headers
- [ ] Enable Vercel Web Application Firewall (if available)
- [ ] Review Vercel deployment logs
- [ ] Setup monitoring and alerts
- [ ] Regular dependency updates (`npm audit` weekly)
- [ ] Backup rate limit data (if using persistent storage)

## Contact

For security issues, please report to the project maintainer.

**Last Updated:** March 8, 2026
**Security Review Date:** March 8, 2026
**Next Review Date:** April 8, 2026
