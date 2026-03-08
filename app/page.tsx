'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

interface NewsItem {
  id: string; title: string; link: string; description: string; pubDate: string;
  source: string; country: string; topic: string; lang: string;
  importance: 'high' | 'medium' | 'low'; polymarket: boolean; image?: string;
  region: string; lat: number; lon: number;
}

interface Filters { topics: string[]; countries: string[]; sources: string[]; }

const COUNTRY_FLAGS: Record<string, string> = {
  DE: '🇩🇪', US: '🇺🇸', UK: '🇬🇧', INT: '🌍', IL: '🇮🇱', CN: '🇨🇳', RU: '🇷🇺', FR: '🇫🇷', JP: '🇯🇵',
};

const TOPIC_ICONS: Record<string, string> = {
  Politik: '🏛', Sport: '⚽', Tech: '💻', Wirtschaft: '📈', Crypto: '₿', Wissenschaft: '🔬', Allgemein: '📰', AI: '🤖',
};

const IMPORTANCE_COLORS: Record<string, string> = {
  high: '#ef4444', medium: '#f59e0b', low: '#64748b',
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'gerade eben';
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  return `vor ${Math.floor(h / 24)} Tag${Math.floor(h / 24) > 1 ? 'en' : ''}`;
}

export default function Home() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [filters, setFilters] = useState<Filters>({ topics: [], countries: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');

  // Active filters
  const [topic, setTopic] = useState('');
  const [country, setCountry] = useState('');
  const [importance, setImportance] = useState('');
  const [source, setSource] = useState('');
  const [polymarket, setPolymarket] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'ticker' | 'globe'>('grid');
  const [selectedRegion, setSelectedRegion] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchNews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (topic) params.set('topic', topic);
      if (country) params.set('country', country);
      if (importance) params.set('importance', importance);
      if (source) params.set('source', source);
      if (polymarket) params.set('polymarket', 'true');
      if (search) params.set('q', search);

      const res = await fetch(`/api/news?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Validate response structure
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format');
      }

      setItems(data.items);
      setFilters(data.filters || { topics: [], countries: [], sources: [] });
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [topic, country, importance, source, polymarket, search]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    intervalRef.current = setInterval(fetchNews, 120000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setTopic(''); setCountry(''); setImportance(''); setSource('');
    setPolymarket(false); setSearch(''); setSearchInput('');
  };

  const hasActiveFilters = topic || country || importance || source || polymarket || search;
  const highCount = items.filter(i => i.importance === 'high').length;
  const polyCount = items.filter(i => i.polymarket).length;

  return (
    <div style={S.app}>
      {/* ─── HEADER ─── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logoArea}>
            <h1 style={S.logo}>
              <span style={{ color: '#ef4444' }}>News</span>
              <span style={{ color: '#e2e8f0' }}>Flow</span>
            </h1>
            <div style={S.liveBadge}>
              <span style={S.liveDot} />LIVE
            </div>
          </div>

          <div style={S.headerStats}>
            <span style={S.stat}>{items.length} Artikel</span>
            {highCount > 0 && <span style={{ ...S.stat, color: '#ef4444' }}>🔴 {highCount} Breaking</span>}
            {polyCount > 0 && <span style={{ ...S.stat, color: '#8b5cf6' }}>📊 {polyCount} Polymarket</span>}
            {updatedAt && <span style={S.statDim}>Aktualisiert: {new Date(updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>

          <div style={S.headerActions}>
            <button style={viewMode === 'grid' ? S.viewBtnActive : S.viewBtn} onClick={() => setViewMode('grid')}>▦</button>
            <button style={viewMode === 'list' ? S.viewBtnActive : S.viewBtn} onClick={() => setViewMode('list')}>☰</button>
            <button style={viewMode === 'ticker' ? S.viewBtnActive : S.viewBtn} onClick={() => setViewMode('ticker')}>▬</button>
            <button style={viewMode === 'globe' ? S.viewBtnActive : S.viewBtn} onClick={() => setViewMode('globe')} title="NewsFlowGlob">🌍</button>
            <button style={S.refreshBtn} onClick={fetchNews}>↻</button>
          </div>
        </div>

        {/* ─── BREAKING TICKER ─── */}
        {highCount > 0 && (
          <div style={S.ticker}>
            <span style={S.tickerLabel}>BREAKING</span>
            <div style={S.tickerScroll}>
              {items.filter(i => i.importance === 'high').map(i => (
                <a key={i.id} href={i.link} target="_blank" rel="noopener" style={S.tickerItem}>
                  {i.title} <span style={S.tickerSource}>— {i.source}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <div style={S.body}>
        {/* ─── SIDEBAR FILTERS ─── */}
        <aside style={S.sidebar}>
          <form onSubmit={handleSearch} style={S.searchForm}>
            <input style={S.searchInput} placeholder="🔍 Suchen..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </form>

          {hasActiveFilters && (
            <button style={S.clearBtn} onClick={clearFilters}>✕ Filter zurücksetzen</button>
          )}

          {/* Polymarket Toggle */}
          <div style={S.filterSection}>
            <div style={S.filterTitle}>📊 Spezial</div>
            <button
              style={polymarket ? S.polyBtnActive : S.polyBtn}
              onClick={() => setPolymarket(!polymarket)}
            >
              📊 Polymarket-relevant
            </button>
          </div>

          {/* Importance */}
          <div style={S.filterSection}>
            <div style={S.filterTitle}>⚡ Wichtigkeit</div>
            {['high', 'medium', 'low'].map(imp => (
              <button key={imp} style={importance === imp ? S.filterBtnActive : S.filterBtn}
                onClick={() => setImportance(importance === imp ? '' : imp)}>
                <span style={{ ...S.impDot, background: IMPORTANCE_COLORS[imp] }} />
                {imp === 'high' ? '🔴 Breaking' : imp === 'medium' ? '🟡 Wichtig' : '⚪ Normal'}
              </button>
            ))}
          </div>

          {/* Topics */}
          <div style={S.filterSection}>
            <div style={S.filterTitle}>📂 Thema</div>
            {filters.topics.map(t => (
              <button key={t} style={topic === t ? S.filterBtnActive : S.filterBtn}
                onClick={() => setTopic(topic === t ? '' : t)}>
                {TOPIC_ICONS[t] || '📰'} {t}
              </button>
            ))}
          </div>

          {/* Countries */}
          <div style={S.filterSection}>
            <div style={S.filterTitle}>🌍 Land</div>
            {filters.countries.map(c => (
              <button key={c} style={country === c ? S.filterBtnActive : S.filterBtn}
                onClick={() => setCountry(country === c ? '' : c)}>
                {COUNTRY_FLAGS[c] || '🏳'} {c}
              </button>
            ))}
          </div>

          {/* Sources */}
          <div style={S.filterSection}>
            <div style={S.filterTitle}>📡 Quelle</div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filters.sources.map(s => (
                <button key={s} style={source === s ? S.filterBtnActive : S.filterBtn}
                  onClick={() => setSource(source === s ? '' : s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main style={S.main}>
          {loading ? (
            <div style={S.loading}>
              <div style={S.spinner} />
              <span>Lade Nachrichten aus {FEEDS_COUNT}+ Quellen...</span>
            </div>
          ) : items.length === 0 ? (
            <div style={S.empty}>Keine Nachrichten gefunden. Versuche andere Filter.</div>
          ) : viewMode === 'globe' ? (
            <GlobeView items={items} selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
          ) : viewMode === 'grid' ? (
            <div style={S.grid}>
              {items.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
          ) : viewMode === 'list' ? (
            <div style={S.list}>
              {items.map(item => <NewsRow key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={S.tickerView}>
              {items.map(item => <TickerRow key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const FEEDS_COUNT = 30;

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener" style={S.card}>
      {item.image && <div style={{ ...S.cardImg, backgroundImage: `url(${item.image})` }} />}
      <div style={S.cardBody}>
        <div style={S.cardMeta}>
          <span style={{ ...S.impTag, background: IMPORTANCE_COLORS[item.importance] + '22', color: IMPORTANCE_COLORS[item.importance] }}>
            {item.importance === 'high' ? 'BREAKING' : item.importance === 'medium' ? 'WICHTIG' : 'NEWS'}
          </span>
          {item.polymarket && <span style={S.polyTag}>📊 PM</span>}
          <span style={S.countryTag}>{COUNTRY_FLAGS[item.country] || ''} {item.country}</span>
        </div>
        <h3 style={S.cardTitle}>{item.title}</h3>
        {item.description && <p style={S.cardDesc}>{item.description.slice(0, 150)}...</p>}
        <div style={S.cardFooter}>
          <span style={S.cardSource}>{TOPIC_ICONS[item.topic] || ''} {item.source}</span>
          <span style={S.cardTime}>{timeAgo(item.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener" style={S.row}>
      <span style={{ ...S.rowDot, background: IMPORTANCE_COLORS[item.importance] }} />
      <span style={S.rowTime}>{timeAgo(item.pubDate)}</span>
      <span style={S.rowCountry}>{COUNTRY_FLAGS[item.country] || ''}</span>
      <span style={S.rowTitle}>{item.title}</span>
      {item.polymarket && <span style={S.polyTagSm}>PM</span>}
      <span style={S.rowSource}>{item.source}</span>
    </a>
  );
}

function TickerRow({ item }: { item: NewsItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener" style={S.tickerRowItem}>
      <span style={{ ...S.rowDot, background: IMPORTANCE_COLORS[item.importance] }} />
      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.title}</span>
      <span style={{ color: '#475569', marginLeft: 8, fontSize: 12 }}>{item.source} · {timeAgo(item.pubDate)}</span>
    </a>
  );
}

function GlobeView({ items, selectedRegion, onRegionSelect }: { items: NewsItem[]; selectedRegion: string; onRegionSelect: (region: string) => void }) {
  // Group items by region
  const regionGroups = items.reduce((acc, item) => {
    if (!acc[item.region]) acc[item.region] = [];
    acc[item.region].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  const regions = Object.keys(regionGroups).sort();

  // Region colors
  const REGION_COLORS: Record<string, string> = {
    'Europe': '#3b82f6',
    'North America': '#10b981',
    'Middle East': '#f59e0b',
    'Global': '#8b5cf6',
    'Asia': '#ef4444',
  };

  const filteredItems = selectedRegion ? items.filter(i => i.region === selectedRegion) : items;

  return (
    <div style={S.globeContainer}>
      {/* World Map with Markers */}
      <div style={S.mapContainer}>
        <h2 style={S.globeTitle}>🌍 NewsFlowGlob - Nachrichten weltweit</h2>

        {/* Region Filters */}
        <div style={S.regionFilters}>
          <button
            style={!selectedRegion ? S.regionBtnActive : S.regionBtn}
            onClick={() => onRegionSelect('')}
          >
            🌍 Alle Regionen ({items.length})
          </button>
          {regions.map(region => (
            <button
              key={region}
              style={{
                ...(selectedRegion === region ? S.regionBtnActive : S.regionBtn),
                borderColor: REGION_COLORS[region] || '#64748b',
              }}
              onClick={() => onRegionSelect(selectedRegion === region ? '' : region)}
            >
              <span style={{ color: REGION_COLORS[region] || '#64748b', fontSize: 16 }}>●</span>
              {region} ({regionGroups[region].length})
            </button>
          ))}
        </div>

        {/* Simple Map Visualization */}
        <div style={S.worldMap}>
          <svg width="100%" height="400" viewBox="0 0 800 400" style={{ background: '#0d1220', borderRadius: 12 }}>
            {/* Simplified world map background */}
            <rect width="800" height="400" fill="#0a0e1a" />

            {/* Grid lines */}
            {[...Array(8)].map((_, i) => (
              <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="400" stroke="#1e2a42" strokeWidth="1" />
            ))}
            {[...Array(4)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="#1e2a42" strokeWidth="1" />
            ))}

            {/* News markers on map */}
            {filteredItems.slice(0, 50).map((item, idx) => {
              // Convert lat/lon to SVG coordinates (simplified projection)
              const x = ((item.lon + 180) / 360) * 800;
              const y = ((90 - item.lat) / 180) * 400;

              const color = IMPORTANCE_COLORS[item.importance];
              const size = item.importance === 'high' ? 8 : item.importance === 'medium' ? 6 : 4;

              return (
                <g key={item.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={color}
                    opacity="0.8"
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{item.title} - {item.source}</title>
                  </circle>
                  {item.importance === 'high' && (
                    <circle
                      cx={x}
                      cy={y}
                      r={size + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        from={size}
                        to={size + 8}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={S.mapLegend}>
            <div style={S.legendItem}>
              <span style={{ ...S.legendDot, background: '#ef4444' }} /> Breaking News
            </div>
            <div style={S.legendItem}>
              <span style={{ ...S.legendDot, background: '#f59e0b' }} /> Wichtig
            </div>
            <div style={S.legendItem}>
              <span style={{ ...S.legendDot, background: '#64748b' }} /> Normal
            </div>
          </div>
        </div>

        {/* News List by Region */}
        <div style={S.regionNewsList}>
          {selectedRegion && (
            <h3 style={S.regionNewsTitle}>
              Nachrichten aus {selectedRegion} ({filteredItems.length})
            </h3>
          )}
          <div style={S.list}>
            {filteredItems.map(item => <NewsRow key={item.id} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───
const S: Record<string, React.CSSProperties> = {
  app: { background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", margin: 0 },
  header: { borderBottom: '1px solid #1e2a42', background: '#0d1220', position: 'sticky' as const, top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: 6, letterSpacing: 1 },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' },
  headerStats: { display: 'flex', alignItems: 'center', gap: 14 },
  stat: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  statDim: { fontSize: 11, color: '#475569' },
  headerActions: { display: 'flex', gap: 4 },
  viewBtn: { background: '#111827', border: '1px solid #1e2a42', color: '#64748b', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  viewBtnActive: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  refreshBtn: { background: '#111827', border: '1px solid #1e2a42', color: '#64748b', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' },

  ticker: { display: 'flex', alignItems: 'center', background: 'rgba(239,68,68,0.06)', borderTop: '1px solid rgba(239,68,68,0.15)', padding: '6px 20px', overflow: 'hidden' },
  tickerLabel: { background: '#ef4444', color: 'white', fontWeight: 800, fontSize: 10, padding: '3px 8px', borderRadius: 4, marginRight: 12, flexShrink: 0, letterSpacing: 1 },
  tickerScroll: { display: 'flex', gap: 30, overflow: 'hidden', whiteSpace: 'nowrap' as const },
  tickerItem: { color: '#fca5a5', fontSize: 12, fontWeight: 500, textDecoration: 'none', flexShrink: 0 },
  tickerSource: { color: '#64748b' },

  body: { display: 'flex', maxWidth: 1600, margin: '0 auto', minHeight: 'calc(100vh - 100px)' },

  sidebar: { width: 240, flexShrink: 0, borderRight: '1px solid #1e2a42', padding: 16, overflowY: 'auto' as const, height: 'calc(100vh - 100px)', position: 'sticky' as const, top: 100 },
  searchForm: { marginBottom: 12 },
  searchInput: { width: '100%', background: '#111827', border: '1px solid #1e2a42', borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  clearBtn: { width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, marginBottom: 12, fontFamily: 'inherit' },
  filterSection: { marginBottom: 16 },
  filterTitle: { fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 6 },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'transparent', border: 'none', color: '#94a3b8', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, textAlign: 'left' as const, fontFamily: 'inherit' },
  filterBtnActive: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'rgba(239,68,68,0.08)', border: 'none', color: '#ef4444', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, textAlign: 'left' as const, fontWeight: 600, fontFamily: 'inherit' },
  polyBtn: { width: '100%', background: '#111827', border: '1px solid #1e2a42', color: '#94a3b8', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', textAlign: 'left' as const },
  polyBtnActive: { width: '100%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left' as const },
  impDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },

  main: { flex: 1, padding: 16, overflowY: 'auto' as const },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 60, color: '#64748b', fontSize: 14 },
  spinner: { width: 20, height: 20, border: '2px solid #1e2a42', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin .6s linear infinite' },
  empty: { textAlign: 'center' as const, padding: 60, color: '#475569' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 },

  card: { display: 'flex', flexDirection: 'column' as const, background: '#111827', border: '1px solid #1e2a42', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'border-color .15s' },
  cardImg: { height: 140, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid #1e2a42' },
  cardBody: { padding: 14, flex: 1, display: 'flex', flexDirection: 'column' as const },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const },
  impTag: { fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5 },
  polyTag: { fontSize: 9, fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 6px', borderRadius: 4 },
  polyTagSm: { fontSize: 9, fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 4px', borderRadius: 3, marginLeft: 'auto', flexShrink: 0 },
  countryTag: { fontSize: 10, color: '#64748b' },
  cardTitle: { fontSize: 14, fontWeight: 700, lineHeight: '1.35', margin: '0 0 6px', color: '#e2e8f0' },
  cardDesc: { fontSize: 12, color: '#64748b', lineHeight: '1.5', margin: '0 0 10px', flex: 1 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardSource: { fontSize: 11, color: '#475569' },
  cardTime: { fontSize: 11, color: '#475569' },

  list: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: 'inherit', fontSize: 13 },
  rowDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  rowTime: { fontSize: 11, color: '#475569', minWidth: 70, flexShrink: 0 },
  rowCountry: { fontSize: 13, flexShrink: 0 },
  rowTitle: { flex: 1, fontWeight: 500, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  rowSource: { fontSize: 11, color: '#475569', flexShrink: 0 },

  tickerView: { display: 'flex', flexDirection: 'column' as const, gap: 1 },
  tickerRowItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', textDecoration: 'none', color: 'inherit', fontSize: 13, borderBottom: '1px solid #111827' },

  // Globe View Styles
  globeContainer: { width: '100%', padding: 20 },
  mapContainer: { maxWidth: 1200, margin: '0 auto' },
  globeTitle: { fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#e2e8f0', textAlign: 'center' as const },
  regionFilters: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 20, justifyContent: 'center' },
  regionBtn: { background: '#111827', border: '2px solid #1e2a42', color: '#94a3b8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  regionBtnActive: { background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  worldMap: { background: '#0d1220', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e2a42' },
  mapLegend: { display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center', padding: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' },
  legendDot: { width: 8, height: 8, borderRadius: '50%' },
  regionNewsList: { marginTop: 20 },
  regionNewsTitle: { fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#e2e8f0', paddingBottom: 8, borderBottom: '1px solid #1e2a42' },
};
