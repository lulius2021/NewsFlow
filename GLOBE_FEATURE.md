# NewsFlowGlob - Geografische Nachrichten-Visualisierung

## 🌍 Übersicht

NewsFlowGlob ist ein neues Feature, das eine interaktive Weltkarte bereitstellt, um Nachrichten nach geografischen Regionen zu filtern und zu visualisieren.

## ✨ Features

### 1. Interaktive Weltkarte
- **SVG-basierte Weltkarte** mit geografischer Projektion
- **Live-Marker** für alle Nachrichten mit Geo-Koordinaten
- **Animierte Breaking-News-Marker** mit pulsierenden Ringen
- **Farb-Kodierung** nach Wichtigkeit:
  - 🔴 Rot = Breaking News (high)
  - 🟠 Orange = Wichtig (medium)
  - ⚪ Grau = Normal (low)

### 2. Regionen-Filter
Das System gruppiert Nachrichten in folgende Regionen:

- **🌍 Global** - Internationale & weltweite Nachrichten
- **🇪🇺 Europe** - Europäische Nachrichten (DE, UK, FR, etc.)
- **🇺🇸 North America** - USA & Kanada
- **🕌 Middle East** - Naher Osten (IL, Saudi-Arabien, Katar)
- **🌏 Asia** - Asiatische Nachrichten (CN, JP, etc.)

### 3. Geo-Daten pro Nachricht
Jede Nachricht enthält jetzt:
```typescript
interface NewsItem {
  // ... existing fields
  region: string;  // z.B. "Europe", "North America"
  lat: number;     // Breitengrad
  lon: number;     // Längengrad
}
```

### 4. RSS-Feed-Quellen mit Koordinaten
Alle 30+ RSS-Feeds haben jetzt:
- **Region**: Geografische Region
- **Koordinaten**: Exakte Standorte der Nachrichtenquellen

Beispiel:
```typescript
{
  source: 'Tagesschau',
  region: 'Europe',
  lat: 52.52,    // Berlin
  lon: 13.405
}
```

## 🎨 Benutzeroberfläche

### Navigation
- Neuer **🌍 Globe-Button** in der Header-Navigation
- Wechselt zwischen Grid, List, Ticker und **Globe** Ansichten

### Karten-Ansicht
1. **Regionen-Filter-Buttons** oben
   - Zeigt Anzahl der Nachrichten pro Region
   - Farbcodiert nach Region
   - Klick zum Filtern

2. **Weltkarte**
   - Punktmarker für jede Nachricht
   - Größe und Animation basierend auf Wichtigkeit
   - Tooltip beim Hovern (Titel + Quelle)
   - Gitter-Linien zur Orientierung

3. **Legende**
   - Breaking News (rot)
   - Wichtig (orange)
   - Normal (grau)

4. **Nachrichten-Liste**
   - Gefilterte Nachrichten unter der Karte
   - Gleiche List-View wie in der normalen Ansicht
   - Zeigt Region in der Überschrift

## 📊 Technische Details

### Koordinaten-Projektion
```typescript
// Lat/Lon → SVG Koordinaten
const x = ((lon + 180) / 360) * 800;
const y = ((90 - lat) / 180) * 400;
```

### Breaking News Animation
```svg
<animate
  attributeName="r"
  from={size}
  to={size + 8}
  dur="2s"
  repeatCount="indefinite"
/>
```

### Region-Gruppierung
```typescript
const regionGroups = items.reduce((acc, item) => {
  if (!acc[item.region]) acc[item.region] = [];
  acc[item.region].push(item);
  return acc;
}, {} as Record<string, NewsItem[]>);
```

## 🎯 Use Cases

### 1. Regionale Nachrichten-Überwachung
- "Zeige mir alle Breaking News aus dem Nahen Osten"
- "Was passiert gerade in Europa?"

### 2. Geo-Trend-Analyse
- Welche Regionen haben die meisten Breaking News?
- Wo sind Polymarket-relevante Ereignisse?

### 3. Visuelle Nachrichten-Exploration
- Schneller Überblick über globale Ereignisse
- Geografische Verteilung von Nachrichten erkennen

## 🚀 Nutzung

### Als Benutzer
1. Klicke auf den **🌍 Globe**-Button im Header
2. Wähle eine Region aus den Filter-Buttons
3. Hover über Marker auf der Karte für Details
4. Scrolle nach unten für die vollständige Nachrichtenliste

### Als Entwickler
```typescript
// Region-Filter State
const [selectedRegion, setSelectedRegion] = useState('');

// Gefilterte Items
const filteredItems = selectedRegion
  ? items.filter(i => i.region === selectedRegion)
  : items;

// Render Globe View
<GlobeView
  items={items}
  selectedRegion={selectedRegion}
  onRegionSelect={setSelectedRegion}
/>
```

## 🎨 Styling

### Region-Farben
```typescript
const REGION_COLORS = {
  'Europe': '#3b82f6',        // Blau
  'North America': '#10b981', // Grün
  'Middle East': '#f59e0b',   // Orange
  'Global': '#8b5cf6',        // Lila
  'Asia': '#ef4444',          // Rot
};
```

### Dark Theme
- Dunkler Hintergrund (#0a0e1a)
- Karte mit Gitter-Linien (#1e2a42)
- Hover-Effekte und Übergänge

## 📈 Performance

- **Marker-Limit**: Max 50 Marker auf der Karte (zur Performance)
- **SVG-Rendering**: Leichtgewichtig, keine externen Bibliotheken
- **Animations-Optimierung**: Nur für Breaking News

## 🔮 Zukünftige Verbesserungen

### Geplant
1. **3D-Globe** mit WebGL (Three.js oder Globe.gl)
2. **Zoom & Pan** auf der Karte
3. **Cluster-Marker** für dichte Bereiche
4. **Heatmap-Overlay** für Nachrichten-Dichte
5. **Zeitreihen-Animation** (Nachrichten über Zeit)
6. **Stadt-Level-Filter** (nicht nur Regionen)
7. **Länder-Grenzen** auf der Karte zeichnen
8. **Live-Updates** mit WebSocket für Echtzeit-Marker

### Vorgeschlagen
- **Geo-Suche**: "Zeige Nachrichten im Umkreis von 500km"
- **Routen-Visualisierung**: Wie verbreiten sich Nachrichten?
- **Satelliten-Kartenansicht** (OpenStreetMap Integration)
- **Export-Funktion**: Karte als PNG/SVG speichern

## 🐛 Bekannte Einschränkungen

1. **Vereinfachte Projektion**: Keine echte Mercator-Projektion
2. **Statische Karte**: Kein Zoom/Pan (noch)
3. **Marker-Überlappung**: Bei vielen Nachrichten am gleichen Ort
4. **Mobile Optimierung**: Karte könnte auf kleinen Bildschirmen besser sein

## 📝 Changelog

### Version 1.1.0 (2026-03-08)
- ✅ Initiales Release von NewsFlowGlob
- ✅ 5 Regionen mit 30+ geo-kodierten Quellen
- ✅ Interaktive SVG-Weltkarte
- ✅ Region-basiertes Filtern
- ✅ Breaking-News-Animationen
- ✅ Responsive Design

---

**Entwickelt für:** NewsFlow
**Version:** 1.1.0
**Datum:** 8. März 2026
**Feature by:** Claude (mit Julius)
