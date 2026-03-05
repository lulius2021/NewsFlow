'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

interface NewsItem {
  id: string; title: string; link: string; description: string; pubDate: string;
  source: string; country: string; topic: string; lang: string;
  importance: 'high' | 'medium' | 'low'; polymarket: boolean; image?: string;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'ticker'>('grid');

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

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setItems(data.items);
      setFilters(data.filters);
      setUpdatedAt(data.updatedAt);
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
};
