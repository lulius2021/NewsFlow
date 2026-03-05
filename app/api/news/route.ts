import { NextRequest, NextResponse } from 'next/server';

// ─── RSS Feed Sources ───
const FEEDS: { url: string; source: string; country: string; topic: string; lang: string }[] = [
  // ── Deutschland ──
  { url: 'https://www.tagesschau.de/xml/rss2/', source: 'Tagesschau', country: 'DE', topic: 'Politik', lang: 'de' },
  { url: 'https://www.spiegel.de/schlagzeilen/index.rss', source: 'Spiegel', country: 'DE', topic: 'Allgemein', lang: 'de' },
  { url: 'https://www.faz.net/rss/aktuell/', source: 'FAZ', country: 'DE', topic: 'Allgemein', lang: 'de' },
  { url: 'https://www.handelsblatt.com/contentexport/feed/top', source: 'Handelsblatt', country: 'DE', topic: 'Wirtschaft', lang: 'de' },
  { url: 'https://www.sportschau.de/index~rss.xml', source: 'Sportschau', country: 'DE', topic: 'Sport', lang: 'de' },
  { url: 'https://www.kicker.de/news/feed.xml', source: 'Kicker', country: 'DE', topic: 'Sport', lang: 'de' },
  { url: 'https://www.heise.de/rss/heise-atom.xml', source: 'Heise', country: 'DE', topic: 'Tech', lang: 'de' },
  { url: 'https://www.n-tv.de/rss', source: 'n-tv', country: 'DE', topic: 'Allgemein', lang: 'de' },
  { url: 'https://www.welt.de/feeds/latest.rss', source: 'Welt', country: 'DE', topic: 'Allgemein', lang: 'de' },

  // ── International Politik ──
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC', country: 'UK', topic: 'Politik', lang: 'en' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT', country: 'US', topic: 'Politik', lang: 'en' },
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters', country: 'INT', topic: 'Politik', lang: 'en' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', country: 'INT', topic: 'Politik', lang: 'en' },

  // ── USA ──
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYT Politics', country: 'US', topic: 'Politik', lang: 'en' },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News', country: 'US', topic: 'Politik', lang: 'en' },
  { url: 'https://feeds.foxnews.com/foxnews/latest', source: 'Fox News', country: 'US', topic: 'Allgemein', lang: 'en' },

  // ── Finance / Wirtschaft ──
  { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GDAXI&region=DE&lang=de-DE', source: 'Yahoo Finance DE', country: 'DE', topic: 'Wirtschaft', lang: 'de' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', country: 'US', topic: 'Wirtschaft', lang: 'en' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', country: 'US', topic: 'Wirtschaft', lang: 'en' },

  // ── Tech / AI ──
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', country: 'US', topic: 'Tech', lang: 'en' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', country: 'US', topic: 'Tech', lang: 'en' },
  { url: 'https://hnrss.org/frontpage', source: 'Hacker News', country: 'INT', topic: 'Tech', lang: 'en' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica', country: 'US', topic: 'Tech', lang: 'en' },

  // ── Crypto ──
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph', country: 'INT', topic: 'Crypto', lang: 'en' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', country: 'US', topic: 'Crypto', lang: 'en' },

  // ── Sport International ──
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', country: 'US', topic: 'Sport', lang: 'en' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', country: 'UK', topic: 'Sport', lang: 'en' },

  // ── Wissenschaft ──
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'ScienceDaily', country: 'INT', topic: 'Wissenschaft', lang: 'en' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', source: 'NYT Science', country: 'US', topic: 'Wissenschaft', lang: 'en' },

  // ── Naher Osten / Geopolitik ──
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', country: 'IL', topic: 'Politik', lang: 'en' },
  { url: 'https://english.alarabiya.net/tools/rss', source: 'Al Arabiya', country: 'INT', topic: 'Politik', lang: 'en' },
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

async function parseFeed(feed: typeof FEEDS[0]): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'NewsFlow/1.0' },
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xml = await res.text();

    // Simple XML parsing without external lib
    const items: NewsItem[] = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 15) {
      const block = match[1] || match[2];

      const titleM = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const linkM = block.match(/<link[^>]*href="([^"]*)"/) || block.match(/<link[^>]*>([\s\S]*?)<\/link>/);
      const descM = block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) ||
                    block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/) ||
                    block.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/);
      const dateM = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) ||
                    block.match(/<published[^>]*>([\s\S]*?)<\/published>/) ||
                    block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/) ||
                    block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/);
      const imgM = block.match(/<media:content[^>]*url="([^"]*)"/) ||
                   block.match(/<enclosure[^>]*url="([^"]*)"/) ||
                   block.match(/<media:thumbnail[^>]*url="([^"]*)"/) ||
                   block.match(/src="(https?:\/\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);

      const title = (titleM?.[1] || '').replace(/<[^>]*>/g, '').trim();
      const link = (linkM?.[1] || '').replace(/<[^>]*>/g, '').trim();
      const desc = (descM?.[1] || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 300);
      const pubDate = dateM?.[1]?.trim() || '';

      if (!title || !link) continue;

      items.push({
        id: hashId(link + title),
        title,
        link,
        description: desc,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: feed.source,
        country: feed.country,
        topic: feed.topic,
        lang: feed.lang,
        importance: scoreImportance(title, desc),
        polymarket: isPolymarketRelevant(title, desc),
        image: imgM?.[1] || undefined,
      });
      count++;
    }

    return items;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const topicFilter = url.searchParams.get('topic');
  const countryFilter = url.searchParams.get('country');
  const importanceFilter = url.searchParams.get('importance');
  const polyFilter = url.searchParams.get('polymarket');
  const sourceFilter = url.searchParams.get('source');
  const searchQuery = url.searchParams.get('q')?.toLowerCase();

  // Fetch all feeds in parallel
  const results = await Promise.all(FEEDS.map(parseFeed));
  let items = results.flat();

  // Deduplicate by similar titles
  const seen = new Set<string>();
  items = items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

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
