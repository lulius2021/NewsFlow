import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// ─── RSS Feed Sources with Geolocation ───
const FEEDS: {
  url: string;
  source: string;
  country: string;
  topic: string;
  lang: string;
  region: string;
  lat: number;
  lon: number;
}[] = [
  // ── Deutschland ──
  { url: 'https://www.tagesschau.de/xml/rss2/', source: 'Tagesschau', country: 'DE', topic: 'Politik', lang: 'de', region: 'Europe', lat: 52.52, lon: 13.405 },
  { url: 'https://www.spiegel.de/schlagzeilen/index.rss', source: 'Spiegel', country: 'DE', topic: 'Allgemein', lang: 'de', region: 'Europe', lat: 53.55, lon: 9.993 },
  { url: 'https://www.faz.net/rss/aktuell/', source: 'FAZ', country: 'DE', topic: 'Allgemein', lang: 'de', region: 'Europe', lat: 50.11, lon: 8.68 },
  { url: 'https://www.handelsblatt.com/contentexport/feed/top', source: 'Handelsblatt', country: 'DE', topic: 'Wirtschaft', lang: 'de', region: 'Europe', lat: 51.23, lon: 6.78 },
  { url: 'https://www.sportschau.de/index~rss.xml', source: 'Sportschau', country: 'DE', topic: 'Sport', lang: 'de', region: 'Europe', lat: 50.94, lon: 6.96 },
  { url: 'https://www.kicker.de/news/feed.xml', source: 'Kicker', country: 'DE', topic: 'Sport', lang: 'de', region: 'Europe', lat: 49.01, lon: 8.40 },
  { url: 'https://www.heise.de/rss/heise-atom.xml', source: 'Heise', country: 'DE', topic: 'Tech', lang: 'de', region: 'Europe', lat: 52.37, lon: 9.74 },
  { url: 'https://www.n-tv.de/rss', source: 'n-tv', country: 'DE', topic: 'Allgemein', lang: 'de', region: 'Europe', lat: 50.73, lon: 7.10 },
  { url: 'https://www.welt.de/feeds/latest.rss', source: 'Welt', country: 'DE', topic: 'Allgemein', lang: 'de', region: 'Europe', lat: 52.52, lon: 13.405 },

  // ── International Politik ──
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC', country: 'UK', topic: 'Politik', lang: 'en', region: 'Europe', lat: 51.51, lon: -0.12 },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT', country: 'US', topic: 'Politik', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters', country: 'INT', topic: 'Politik', lang: 'en', region: 'Global', lat: 51.51, lon: -0.12 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', country: 'INT', topic: 'Politik', lang: 'en', region: 'Middle East', lat: 25.28, lon: 51.52 },

  // ── USA ──
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYT Politics', country: 'US', topic: 'Politik', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News', country: 'US', topic: 'Politik', lang: 'en', region: 'North America', lat: 40.75, lon: -73.99 },
  { url: 'https://feeds.foxnews.com/foxnews/latest', source: 'Fox News', country: 'US', topic: 'Allgemein', lang: 'en', region: 'North America', lat: 40.75, lon: -73.99 },

  // ── Finance / Wirtschaft ──
  { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GDAXI&region=DE&lang=de-DE', source: 'Yahoo Finance DE', country: 'DE', topic: 'Wirtschaft', lang: 'de', region: 'Europe', lat: 50.11, lon: 8.68 },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', country: 'US', topic: 'Wirtschaft', lang: 'en', region: 'North America', lat: 40.76, lon: -73.98 },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', country: 'US', topic: 'Wirtschaft', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },

  // ── Tech / AI ──
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', country: 'US', topic: 'Tech', lang: 'en', region: 'North America', lat: 37.77, lon: -122.42 },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', country: 'US', topic: 'Tech', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },
  { url: 'https://hnrss.org/frontpage', source: 'Hacker News', country: 'INT', topic: 'Tech', lang: 'en', region: 'Global', lat: 37.77, lon: -122.42 },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica', country: 'US', topic: 'Tech', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },

  // ── Crypto ──
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph', country: 'INT', topic: 'Crypto', lang: 'en', region: 'Global', lat: 51.51, lon: -0.12 },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', country: 'US', topic: 'Crypto', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },

  // ── Sport International ──
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', country: 'US', topic: 'Sport', lang: 'en', region: 'North America', lat: 41.48, lon: -71.31 },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', country: 'UK', topic: 'Sport', lang: 'en', region: 'Europe', lat: 51.51, lon: -0.12 },

  // ── Wissenschaft ──
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'ScienceDaily', country: 'INT', topic: 'Wissenschaft', lang: 'en', region: 'Global', lat: 40.71, lon: -74.01 },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', source: 'NYT Science', country: 'US', topic: 'Wissenschaft', lang: 'en', region: 'North America', lat: 40.71, lon: -74.01 },

  // ── Naher Osten / Geopolitik ──
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', country: 'IL', topic: 'Politik', lang: 'en', region: 'Middle East', lat: 32.08, lon: 34.78 },
  { url: 'https://english.alarabiya.net/tools/rss', source: 'Al Arabiya', country: 'INT', topic: 'Politik', lang: 'en', region: 'Middle East', lat: 24.71, lon: 46.67 },
];

interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  country: string;
  topic: string;
  lang: string;
  importance: 'high' | 'medium' | 'low';
  polymarket: boolean;
  image?: string;
  region: string;
  lat: number;
  lon: number;
}

// Keywords for importance scoring
const HIGH_KEYWORDS = ['krieg', 'war', 'breaking', 'eilmeldung', 'terror', 'crash', 'explosion', 'dead', 'killed', 'sanktion', 'nuclear', 'nato', 'invasion', 'coup', 'resign', 'impeach', 'notstand', 'emergency', 'pandemic', 'recession'];
const POLY_KEYWORDS = ['election', 'wahl', 'trump', 'biden', 'poll', 'vote', 'referendum', 'bitcoin', 'btc', 'eth', 'fed', 'zinsen', 'rate', 'gdp', 'bip', 'championship', 'final', 'finale', 'regulation', 'ban', 'approve', 'genehmig', 'spacex', 'launch', 'ai regulation', 'merger', 'acquisition', 'übernahme', 'impeach', 'resign', 'rücktritt'];

function scoreImportance(title: string, desc: string): 'high' | 'medium' | 'low' {
  const text = `${title} ${desc}`.toLowerCase();
  if (HIGH_KEYWORDS.some(k => text.includes(k))) return 'high';
  if (text.length > 200 || text.includes('exklusiv') || text.includes('exclusive') || text.includes('analyse') || text.includes('analysis')) return 'medium';
  return 'low';
}

function isPolymarketRelevant(title: string, desc: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  return POLY_KEYWORDS.some(k => text.includes(k));
}

function hashId(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsFlow/1.0' },
  maxRedirects: 3,
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
});

async function parseFeed(feed: typeof FEEDS[0]): Promise<NewsItem[]> {
  try {
    const rss = await parser.parseURL(feed.url);
    const items: NewsItem[] = [];

    for (let i = 0; i < Math.min(rss.items.length, 15); i++) {
      const item = rss.items[i];

      // Validate required fields
      if (!item.title || !item.link) continue;

      // Sanitize and validate link
      const link = item.link.trim();
      if (!link.startsWith('http://') && !link.startsWith('https://')) continue;

      // Extract image URL safely
      let image: string | undefined;
      const mediaContent = (item as any)['media:content'];
      const mediaThumbnail = (item as any)['media:thumbnail'];
      const enclosure = (item as any).enclosure;

      if (mediaContent?.$ && mediaContent.$.url) {
        image = mediaContent.$.url;
      } else if (mediaThumbnail?.$ && mediaThumbnail.$.url) {
        image = mediaThumbnail.$.url;
      } else if (enclosure?.url) {
        image = enclosure.url;
      }

      // Validate image URL if present
      if (image && (!image.startsWith('http://') && !image.startsWith('https://'))) {
        image = undefined;
      }

      const description = (item.contentSnippet || item.content || item.summary || '')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 300);

      const pubDate = item.pubDate || item.isoDate || new Date().toISOString();

      items.push({
        id: hashId(link + item.title),
        title: item.title.trim(),
        link,
        description,
        pubDate: new Date(pubDate).toISOString(),
        source: feed.source,
        country: feed.country,
        topic: feed.topic,
        lang: feed.lang,
        importance: scoreImportance(item.title, description),
        polymarket: isPolymarketRelevant(item.title, description),
        image,
        region: feed.region,
        lat: feed.lat,
        lon: feed.lon,
      });
    }

    return items;
  } catch (error) {
    console.error(`Error parsing feed ${feed.source} (${feed.url}):`, error);
    return [];
  }
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 60 requests per minute
    return true;
  }

  if (limit.count >= 60) {
    return false;
  }

  limit.count++;
  return true;
}

// Validate and sanitize input parameters
function validateFilterParam(value: string | null, allowedValues: string[]): string | null {
  if (!value) return null;
  return allowedValues.includes(value) ? value : null;
}

function validateSearchQuery(query: string | null): string | null {
  if (!query) return null;
  // Limit length and remove potentially dangerous characters
  const sanitized = query.trim().slice(0, 100);
  // Only allow alphanumeric, spaces, and common punctuation
  return /^[\w\s\-.,!?äöüßÄÖÜ]+$/.test(sanitized) ? sanitized : null;
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const url = new URL(req.url);

  // Validate input parameters
  const VALID_TOPICS = ['Politik', 'Sport', 'Tech', 'Wirtschaft', 'Crypto', 'Wissenschaft', 'Allgemein'];
  const VALID_COUNTRIES = ['DE', 'US', 'UK', 'INT', 'IL', 'CN', 'RU', 'FR', 'JP'];
  const VALID_IMPORTANCE = ['high', 'medium', 'low'];

  const topicFilter = validateFilterParam(url.searchParams.get('topic'), VALID_TOPICS);
  const countryFilter = validateFilterParam(url.searchParams.get('country'), VALID_COUNTRIES);
  const importanceFilter = validateFilterParam(url.searchParams.get('importance'), VALID_IMPORTANCE);
  const polyFilter = url.searchParams.get('polymarket');
  const sourceFilter = url.searchParams.get('source'); // Will be validated against actual sources
  const searchQuery = validateSearchQuery(url.searchParams.get('q'))?.toLowerCase();

  // Fetch all feeds in parallel
  const results = await Promise.all(FEEDS.map(parseFeed));
  let items = results.flat();

  // Improved deduplication using Levenshtein distance
  function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Deduplicate by similar titles using both exact match and similarity score
  const deduplicatedItems: NewsItem[] = [];
  const titleSet = new Set<string>();

  for (const item of items) {
    const normalizedTitle = item.title.toLowerCase().trim();

    // Check exact match first (faster)
    if (titleSet.has(normalizedTitle)) continue;

    // Check similarity with existing titles (only for titles > 30 chars to avoid false positives)
    let isDuplicate = false;
    if (normalizedTitle.length > 30) {
      for (const existingTitle of titleSet) {
        if (existingTitle.length > 30) {
          const distance = levenshteinDistance(
            normalizedTitle.slice(0, 100),
            existingTitle.slice(0, 100)
          );
          const similarity = 1 - distance / Math.max(normalizedTitle.length, existingTitle.length);

          // If titles are more than 85% similar, consider it a duplicate
          if (similarity > 0.85) {
            isDuplicate = true;
            break;
          }
        }
      }
    }

    if (!isDuplicate) {
      deduplicatedItems.push(item);
      titleSet.add(normalizedTitle);
    }
  }

  items = deduplicatedItems;

  // Apply filters
  if (topicFilter) items = items.filter(i => i.topic === topicFilter);
  if (countryFilter) items = items.filter(i => i.country === countryFilter);
  if (importanceFilter) items = items.filter(i => i.importance === importanceFilter);
  if (polyFilter === 'true') items = items.filter(i => i.polymarket);
  if (sourceFilter) items = items.filter(i => i.source === sourceFilter);
  if (searchQuery) items = items.filter(i => `${i.title} ${i.description}`.toLowerCase().includes(searchQuery));

  // Sort by date (newest first)
  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Get available filter options
  const allItems = results.flat();
  const topics = [...new Set(allItems.map(i => i.topic))].sort();
  const countries = [...new Set(allItems.map(i => i.country))].sort();
  const sources = [...new Set(allItems.map(i => i.source))].sort();

  return NextResponse.json({
    items: items.slice(0, 200),
    total: items.length,
    filters: { topics, countries, sources },
    updatedAt: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
  });
}
