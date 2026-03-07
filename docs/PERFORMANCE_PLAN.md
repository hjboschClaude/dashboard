# Performance Implementatieplan — Dashboard Gemeente Rotterdam

**Versie:** 0.14.0 → 0.15.0
**Datum:** 2026-03-07
**Scope:** Statische analyse op `dashboard.html` (3.409 regels, vanilla JS)

---

## Inhoudsopgave

1. [Samenvatting](#1-samenvatting)
2. [Huidige situatie](#2-huidige-situatie)
3. [Prioritering](#3-prioritering)
4. [Sprint 1 — Kritieke bugfixes](#4-sprint-1--kritieke-bugfixes)
5. [Sprint 2 — CPU-optimalisaties](#5-sprint-2--cpu-optimalisaties)
6. [Sprint 3 — Laadtijd & rendering](#6-sprint-3--laadtijd--rendering)
7. [Sprint 4 — Performance instrumentatie](#7-sprint-4--performance-instrumentatie)
8. [Sprint 5 — Monitoring & observability](#8-sprint-5--monitoring--observability)
9. [Teststrategie](#9-teststrategie)
10. [Risico's en afhankelijkheden](#10-risicos-en-afhankelijkheden)
11. [Succescriteria](#11-succescriteria)

---

## 1. Samenvatting

Dit plan beschrijft alle verbeteringen die nodig zijn om de dashboardpagina aantoonbaar
sneller, stabieler en observeerbaar te maken. De analyse is uitgevoerd via statische
code-inspectie van `dashboard.html`.

**Kernproblemen:**

| # | Probleem | Ernst |
|---|---|---|
| P1 | Kapotte unique-values cache door `JSON.stringify(Set)` | Kritiek |
| P2 | Synchrone data-initialisatie blokkeert main thread | Hoog |
| P3 | `updateRowHighlights` gebruikt regex op onclick-attribuut | Hoog |
| P4 | `categoricalKeys.includes()` in O(n²) inner loop | Middel |
| P5 | Scroll-listeners zonder `passive: true` | Middel |
| P6 | Google Fonts zonder preconnect/font-display | Laag |
| P7 | Web Performance API marks ontbreken | Laag |

---

## 2. Huidige situatie

### Architectuur

```
dashboard.html (single file, ~3.400 regels)
├── CSS (RODS Rotterdam Design System)
├── HTML (statisch skelet + dynamische tab-containers)
└── JavaScript (vanilla, 174 functies)
    ├── Data-laag       — generateProjectData / generateTeamData (9.000 records)
    ├── State           — AppState singleton + dirty flags
    ├── Compute         — filteredData → sortedData → groupModel (pipeline)
    ├── Render          — virtual scroll, header, aggregatie
    └── UI              — panels, modal, toast, selection
```

### Render-pipeline (huidig)

```
render()
  └── _renderInternal()
        ├── computeFilteredData()     ← dirty.data
        ├── computeSortedData()       ← dirty.sort
        ├── renderHeader()            ← dirty.header
        ├── renderVirtualBody()       ← dirty.body
        │     └── rowHtml() × viewport
        ├── computeAggModel()         ← dirty.agg  (one-pass ✓)
        ├── renderAggFromModel()      ← dirty.agg
        └── syncAggWidths()           ← dirty.widths (via RAF ✓)
```

### Bekende sterktes (niet aanpassen)

- Virtual scrolling met RAF en range-tracking (skip rerender)
- Dirty-flag systeem met targeted invalidation
- Pre-computed search index (`_searchStr`)
- One-pass aggregatie (B1)
- Avatar-cache (Map)
- Lazy XLSX-loading
- Debounced zoekbalk (160ms)

---

## 3. Prioritering

```
Impact  ↑
        │  P2 ●───────────────────┐  hoog impact, hoog werk
        │                          │
        │  P1 ●──────┐  P3 ●──┐   │  hoog impact, laag werk
        │             │         │   │
        │  P4 ●──┐    │         │   │
        │         │   │         │   │
        │  P5 ●   │   │         │   │
        │  P6 ●   │   │         │   │
        │  P7 ●───┘   │         │   │
        └─────────────┴─────────┴───┴──→  Werk
          laag      middel    hoog
```

**Volgorde:** P1 → P3 → P4 → P5 → P6 → P2 → P7

Reden: P1 en P3 zijn bugs die correctheid raken. P2 (async init) vereist de meeste
refactoring en wordt als laatste aangepakt om regressierisico te minimaliseren.

---

## 4. Sprint 1 — Kritieke bugfixes

**Doel:** Repareer fouten die stille performance-degradatie veroorzaken.
**Tijdsinschatting:** Klein (< 1 dag)

### Taak 1.1 — Fix kapotte unique-values cache key (P1)

**Bestand:** `dashboard.html`, functie `_getUniqueCacheKey()` (regel ~1601)

**Probleem:**
`JSON.stringify(colFilters)` waarbij `colFilters` `Set`-objecten bevat.
`JSON.stringify(new Set(['Actief', 'Gepland']))` → `"{}"` → cache-key is altijd
identiek, waardoor de cache **nooit** correct ongeldig wordt gemaakt bij actieve
kolomfilters.

**Huidig:**
```js
function _getUniqueCacheKey() {
  return currentTab + '::' + (_derived.filteredData ? _derived.filteredData.length : '?')
    + '::' + JSON.stringify(colFilters)   // ← BUG: Set → {}
    + '::' + (globalNameFilter || '');
}
```

**Fix:**
```js
function _getUniqueCacheKey() {
  var cfKey = Object.keys(colFilters).sort().map(function(k) {
    return k + '=' + Array.from(colFilters[k]).sort().join(',');
  }).join(';');
  return currentTab
    + '::' + (_derived.filteredData ? _derived.filteredData.length : '?')
    + '::' + cfKey
    + '::' + (globalNameFilter || '');
}
```

**Verificatie:**
1. Open dashboard → zet kolomfilter op `Status = Actief`
2. Open kolomfilter opnieuw → waarden moeten correct geteld zijn
3. Wissel van tab → kolomfilter-panel moet juiste aantallen tonen

---

### Taak 1.2 — Fix `updateRowHighlights` regex op onclick (P3)

**Bestand:** `dashboard.html`, functie `updateRowHighlights()` (regel ~2157)

**Probleem:**
Selectie-update leest `onclick`-attribuut en parst de rij-key via regex.
Dit is fragiel (breekt bij refactor van onclick-string) en trager dan een
data-attribuut lookup.

**Huidig:**
```js
function updateRowHighlights() {
  var rows = tbody.querySelectorAll('tr:not(.v-spacer):not(.group-hdr)');
  for (var i = 0; i < rows.length; i++) {
    var tr = rows[i];
    var onclick = tr.getAttribute('onclick') || '';
    var m = onclick.match(/'([^']+)'/);   // ← regex per rij
    if (m) {
      var key = m[1];
      // ...
    }
  }
}
```

**Fix:**
`rowHtml()` plaatst al `data-row-key` op elke `<tr>` (regel 1750). Gebruik dit:

```js
function updateRowHighlights() {
  var tab = currentTab;
  var tbody = document.getElementById('tbody-' + tab);
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr[data-row-key]');
  for (var i = 0; i < rows.length; i++) {
    var tr = rows[i];
    var key = tr.dataset.rowKey;
    var isSel = selectedRows.has(key);
    tr.classList.toggle('selected', isSel);
    var cb = tr.querySelector('.row-select-cb');
    if (cb) {
      cb.className = 'row-select-cb' + (isSel ? ' checked' : '');
      cb.textContent = isSel ? '✓' : '';
    }
  }
}
```

**Verificatie:**
1. Selecteer meerdere rijen met Ctrl+klik → alle rijen correct gehighlight
2. Shift+klik range-select → range correct
3. "Selecteer alles" → alle zichtbare rijen geselecteerd
4. Wissel tab → selectie van vorige tab blijft behouden

---

## 5. Sprint 2 — CPU-optimalisaties

**Doel:** Verlaag CPU-gebruik bij filter, sort en aggregatie-operaties.
**Tijdsinschatting:** Klein-middel (1–2 dagen)

### Taak 2.1 — Vervang `categoricalKeys.includes()` door Set-lookup (P4)

**Bestand:** `dashboard.html`, functie `computeAggModel()` (regel ~1504)

**Probleem:**
`categoricalKeys.includes(c.key)` is een O(n) array-search die wordt aangeroepen
voor elke kolom × elke rij. Bij 4.500 rijen × 25 kolommen = ~112.500 `.includes()`
calls per aggregatie-run.

**Huidig:**
```js
const categoricalKeys = ['status','priority','directeur', ... ];

cols.forEach(function(c) {
  if (categoricalKeys.includes(c.key)) {        // O(n) per aanroep
    model[c.key] = { type: 'categorical', ... };
  } else if (['progress','capaciteit',...].includes(c.key)) {  // nog een O(n)
    // ...
  }
});
```

**Fix:**
```js
// Eenmalig bij module-init — O(1) lookup
const _categoricalKeySet  = new Set(['status','priority','directeur','aog','pm',
  'cluster','afdeling','functie','locatie','fase','risico','regio','type',
  'documentatie','programma','milieu','contract','team','leidinggevende',
  'opleiding','salSchaal','skills']);
const _averageKeySet = new Set(['progress','capaciteit','budget','kostenRealisatie',
  'beoordeling','fte','stakeholders','uren','projecten','beschikbaarheid',
  'reisafstand','kantoorDagen','certificeringen']);
const _booleanKeySet = new Set(['approved','actief']);

// In computeAggModel():
cols.forEach(function(c) {
  if (_categoricalKeySet.has(c.key)) {
    model[c.key] = { type: 'categorical', unique: {}, count: 0 };
  } else if (_averageKeySet.has(c.key)) {
    model[c.key] = { type: 'average', sum: 0, count: 0 };
  } else if (_booleanKeySet.has(c.key)) {
    model[c.key] = { type: 'boolean', trueCount: 0, total: 0 };
  } else {
    model[c.key] = { type: 'none' };
  }
});
```

**Verwacht effect:** ~30–50% snellere `computeAggModel()` bij volledige dataset.

---

### Taak 2.2 — Voeg `passive: true` toe aan scroll-listeners (P5)

**Bestand:** `dashboard.html`, regels ~1810 en ~1999

**Probleem:**
Scroll-event listeners zonder `{passive: true}` blokkeren de browser bij het
beslissen of `preventDefault()` wordt aangeroepen. Dit veroorzaakt scroll-jank,
zichtbaar als dropped frames bij snel scrollen door 4.500 rijen.

**Huidig:**
```js
container.addEventListener('scroll', function() { ... });
```

**Fix** (op beide locaties):
```js
container.addEventListener('scroll', function() { ... }, { passive: true });
```

**Verificatie:**
- Snel scrollen door volledige dataset → geen scroll-jank
- DevTools → Performance → geen "Violation: 'scroll' handler took Xms"

---

### Taak 2.3 — Cache `getAllUniqueNames()` resultaat (P7 aanverwant)

**Bestand:** `dashboard.html`, functie `getAllUniqueNames()` (regel ~1356)

**Probleem:**
`initGlobalNameFilter()` roept `getAllUniqueNames()` aan bij elke tab-switch en
bij init. Dit itereert 9.000 records voor een resultaat dat nooit verandert
(data is read-only).

**Fix:**
```js
var _cachedUniqueNames = null;

function getAllUniqueNames() {
  if (_cachedUniqueNames) return _cachedUniqueNames;
  var names = new Set();
  getData(0).forEach(function(r) {
    if (r.directeur) names.add(r.directeur);
    if (r.aog)       names.add(r.aog);
    if (r.pm)        names.add(r.pm);
  });
  getData(1).forEach(function(r) {
    if (r.name) names.add(r.name);
  });
  _cachedUniqueNames = Array.from(names).sort();
  return _cachedUniqueNames;
}
```

---

## 6. Sprint 3 — Laadtijd & rendering

**Doel:** Verlaag Time-to-Interactive (TTI) en verbeter visuele stabiliteit.
**Tijdsinschatting:** Middel (2–3 dagen)

### Taak 3.1 — Google Fonts: preconnect + font-display (P6)

**Bestand:** `dashboard.html`, regel 7

**Probleem:**
De Google Fonts link is render-blocking: de browser wacht op het externe
lettertype vóór de eerste paint. Geen `preconnect` hint, geen `font-display`.

**Huidig:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
      rel="stylesheet">
```

**Fix:**
```html
<!-- DNS-prefetch + preconnect voor Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Async font-load met font-display:swap via display=swap parameter -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
      as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
        rel="stylesheet">
</noscript>
```

**Verwacht effect:** Verwijdert render-blocking resource. Eerste paint ~100–300ms
eerder op trage verbindingen.

---

### Taak 3.2 — Asynchrone data-initialisatie (P2)

**Bestand:** `dashboard.html`, functie `initTabDataFromConfig()` (regel ~748)

**Probleem:**
9.000 records worden synchroon gegenereerd + geïndexeerd bij paginaload.
Dit blokkeert de main thread voor ~100–300ms (afhankelijk van apparaat),
waardoor de pagina pas laat interactief wordt.

**Strategie:** Chunked initialisatie via `requestIdleCallback` of `setTimeout(0)`
met een loading-state in de UI.

**Implementatie:**

```js
function initTabDataFromConfig(onComplete) {
  var tabs = dashboardConfig.tabs;
  var idx = 0;

  function processNextTab() {
    if (idx >= tabs.length) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    var tab = tabs[idx++];
    var tabIdx = idx - 1;
    _tabCols[tabIdx] = tab.columns;

    if (tab.dataSource.type === 'embedded' && typeof tab.generateData === 'function') {
      // Genereer data in idle time om main thread niet te blokkeren
      var schedule = window.requestIdleCallback || function(cb) { setTimeout(cb, 0); };
      schedule(function() {
        _tabData[tabIdx] = tab.generateData(tab.defaultRowCount);
        buildSearchIndex(_tabData[tabIdx]);
        processNextTab();
      });
    } else {
      processNextTab();
    }
  }

  // Toon laad-indicator
  showLoadingState();
  processNextTab();
}

function showLoadingState() {
  var host = document.getElementById('tab-host');
  if (host) host.innerHTML = '<div style="display:flex;align-items:center;'
    + 'justify-content:center;height:200px;color:var(--text-muted);font-size:14px;">'
    + '⏳ Data laden\u2026</div>';
}

// Init aanroep wordt asynchroon
initTabDataFromConfig(function() {
  initApp();  // eerste render + UI setup
});
```

**Vereiste refactoring:**
Alle code die direct na `initTabDataFromConfig()` data leest (`initGlobalNameFilter`,
`switchTab`, `render`) moet worden verplaatst naar de `onComplete` callback, of
gecontroleerd worden op `_tabData[idx]` aanwezigheid.

**Risico:** Hoog — raakt initialisatievolgorde van alle tab-gerelateerde functies.
**Mitigatie:** Voeg guard toe: `if (!_tabData[tabIdx] || !_tabData[tabIdx].length) return;`
aan het begin van elke functie die data leest.

---

### Taak 3.3 — Begrens HTML string-building met array join

**Bestand:** `dashboard.html`, `renderVirtualBody()` en `rowHtml()`

**Context:**
String-concatenatie met `+=` in een loop van 4.500 iteraties is suboptimaal.
`Array.push() + join('')` is doorgaans sneller in V8 voor grote strings.

**Huidig patroon (in meerdere functies):**
```js
var html = '';
for (var i = startIdx; i < endIdx; i++) html += rowHtml(data[i], ...);
tbody.innerHTML = html;
```

**Verbeterd patroon:**
```js
var parts = [];
for (var i = startIdx; i < endIdx; i++) parts.push(rowHtml(data[i], ...));
tbody.innerHTML = parts.join('');
```

**Van toepassing op:**
- `renderVirtualBody()` — hoofdloop
- `_renderGroupedVirtual()` — gegroepeerde loop
- `renderHeader()` — kolom-header loop

---

## 7. Sprint 4 — Performance instrumentatie

**Doel:** Maak performance zichtbaar in DevTools en meetbaar in de codebase.
**Tijdsinschatting:** Klein (< 1 dag)

### Taak 4.1 — Upgrade `_measure()` naar Web Performance API

**Bestand:** `dashboard.html`, functie `_measure()` (regel ~963)

**Huidig:**
```js
function _measure(name, fn) {
  if (!_perfDebug) return fn();
  var t0 = performance.now();
  var result = fn();
  var t1 = performance.now();
  console.log('[perf] ' + name + ': ' + (t1 - t0).toFixed(1) + 'ms');
  return result;
}
```

**Verbeterd:** Voeg `performance.mark()` en `performance.measure()` toe zodat
metingen zichtbaar zijn in DevTools → Performance → Timings:

```js
function _measure(name, fn) {
  if (!_perfDebug) return fn();
  var markStart = 'dashboard:' + name + ':start';
  var markEnd   = 'dashboard:' + name + ':end';
  performance.mark(markStart);
  var result = fn();
  performance.mark(markEnd);
  try {
    performance.measure('dashboard:' + name, markStart, markEnd);
  } catch(e) { /* ignore in oudere browsers */ }
  var entries = performance.getEntriesByName('dashboard:' + name);
  var last = entries[entries.length - 1];
  if (last) console.log('[perf] ' + name + ': ' + last.duration.toFixed(1) + 'ms');
  return result;
}
```

---

### Taak 4.2 — First Render & Init timing

**Bestand:** `dashboard.html`, na eerste `render()` aanroep

```js
// Na afronding van initApp() / eerste render:
performance.mark('dashboard:ready');
performance.measure('dashboard:total-init',
  window.performance.timing ? 'navigationStart' : undefined,
  'dashboard:ready'
);
var initEntry = performance.getEntriesByName('dashboard:total-init')[0];
if (initEntry) {
  console.log('[perf] Dashboard klaar in: ' + initEntry.duration.toFixed(0) + 'ms');
}
```

---

### Taak 4.3 — Long Task observer

Detecteert automatisch frames die langer dan 50ms duren (janky frames):

```js
if ('PerformanceObserver' in window) {
  try {
    new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        console.warn('[LongTask] ' + entry.duration.toFixed(0) + 'ms — '
          + 'attributie: ' + (entry.attribution[0] && entry.attribution[0].name || 'onbekend'));
      });
    }).observe({ entryTypes: ['longtask'] });
  } catch(e) { /* longtask niet ondersteund */ }
}
```

**Gebruik:** Open DevTools → Console → filter op `[LongTask]` tijdens interactie.

---

### Taak 4.4 — FPS monitor (development only)

Zichtbaar in console bij lage FPS:

```js
if (_perfDebug) {
  var _fpsFrames = 0, _fpsLast = performance.now();
  (function trackFPS() {
    _fpsFrames++;
    var now = performance.now();
    if (now - _fpsLast >= 1000) {
      var fps = _fpsFrames;
      _fpsFrames = 0;
      _fpsLast = now;
      if (fps < 50) console.warn('[fps] ' + fps + ' fps (onder 50)');
    }
    requestAnimationFrame(trackFPS);
  })();
}
```

---

## 8. Sprint 5 — Monitoring & observability

**Doel:** Structurele zichtbaarheid in productie en tijdens development.

### Taak 5.1 — Performance dashboard (development overlay)

Een optionele overlay rechtsboven die live render-tijden toont:

```js
function initPerfOverlay() {
  if (!_perfDebug) return;
  var el = document.createElement('div');
  el.id = 'perf-overlay';
  el.style.cssText = 'position:fixed;bottom:60px;right:20px;background:rgba(0,0,0,.75);'
    + 'color:#0f0;font-family:monospace;font-size:11px;padding:8px 12px;border-radius:6px;'
    + 'z-index:9999;pointer-events:none;line-height:18px;min-width:180px;';
  document.body.appendChild(el);
  return el;
}

// Bijwerken na elke render():
function _updatePerfOverlay(renderMs, rowCount, colCount) {
  var el = document.getElementById('perf-overlay');
  if (!el) return;
  el.innerHTML =
    'render: <b>' + renderMs.toFixed(1) + 'ms</b><br>'
    + 'rijen: ' + rowCount + ' | kolommen: ' + colCount + '<br>'
    + 'heap: ' + (performance.memory
      ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB'
      : 'n/b');
}
```

---

### Taak 5.2 — Memory leak detectie

Controleer op ongecontroleerde groei van `_avatarCache` en `collapsedGroups`:

```js
// In _renderInternal(), na render-pipeline:
if (_perfDebug) {
  var avatarCacheSize = AppState._cache.avatar.size;
  if (avatarCacheSize > 500) {
    console.warn('[mem] avatarCache groot: ' + avatarCacheSize + ' entries');
  }
  var collapsedSize = collapsedGroups.size;
  if (collapsedSize > 200) {
    console.warn('[mem] collapsedGroups groot: ' + collapsedSize + ' entries');
  }
}
```

---

## 9. Teststrategie

### Unit tests (uitbreiden bestaande `runTests()`)

Voeg toe aan de bestaande test-suite:

```
□ _getUniqueCacheKey() — verschilt bij gewijzigde Set-inhoud (P1 fix)
□ updateRowHighlights() — gebruikt data-row-key, geen onclick-parsing (P3 fix)
□ getAllUniqueNames() — tweede aanroep retourneert gecachte array (P7 fix)
□ computeAggModel() — categoricalKeySet-lookup correct voor alle 20+ keys
□ initTabDataFromConfig() — data beschikbaar na async init
```

### Regressietests (handmatig)

Na elke sprint:

```
□ Zoeken in beide tabs → juiste resultaten
□ Kolomfilter → aantallen correct (P1 fix verificatie)
□ Multi-select Ctrl+klik → correct gehighlight (P3 fix verificatie)
□ Shift+klik range-select → correct bereik
□ Sort + filter combinatie → correcte volgorde
□ Groeperen + collapse/expand → juiste rij-aantallen
□ Export CSV/Excel → bevat alleen gefilterde/zichtbare data
□ Tab-switch → per-tab state behouden
□ Reset weergave → volledig terug naar initiële staat
```

### Performance benchmarks

Meet voor én na elke sprint met de bestaande `_perfDebug` logging:

| Meting | Baseline doel | Meetmethode |
|---|---|---|
| `render() total` bij eerste load | < 100ms | console `[perf]` |
| `computeFilteredData` bij zoeken | < 20ms | console `[perf]` |
| `computeAggModel` | < 15ms | console `[perf]` |
| `renderVirtualBody` | < 10ms | console `[perf]` |
| Scroll FPS | ≥ 55 fps | FPS monitor (taak 4.4) |
| TTI (Time to Interactive) | < 500ms | `dashboard:total-init` mark |

---

## 10. Risico's en afhankelijkheden

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Async init breekt volgorde van UI-setup | Middel | Hoog | Guards in alle data-lezende functies; uitgebreide regressietest |
| `data-row-key` niet aanwezig in oude renders | Laag | Middel | Controleer `rowHtml()` altijd `data-row-key` plaatst |
| `requestIdleCallback` niet beschikbaar (Safari < 16) | Laag | Laag | Fallback naar `setTimeout(0)` al ingebouwd |
| Google Fonts preload niet ondersteund | Laag | Laag | `<noscript>` fallback aanwezig |
| `longtask` PerformanceObserver niet ondersteund | Laag | Nvt | Try-catch aanwezig |

---

## 11. Succescriteria

Het plan is succesvol wanneer:

- [ ] **P1 opgelost:** Kolomfilter-panel toont correcte aantallen bij actieve colFilters
- [ ] **P3 opgelost:** Multi-select werkt correct zonder onclick-parsing
- [ ] **P4 opgelost:** `computeAggModel` is ≥ 30% sneller (meetbaar via `[perf]`)
- [ ] **P5 opgelost:** Geen "scroll handler violation" warnings in DevTools console
- [ ] **P6 opgelost:** Google Fonts laadt non-blocking (Lighthouse: geen render-blocking resources)
- [ ] **P2 opgelost:** Dashboard toont UI binnen 100ms; data klaar binnen 500ms (async)
- [ ] **P7 opgelost:** Render-tijden zichtbaar als blokken in DevTools → Performance → Timings
- [ ] Alle bestaande tests slagen (`runTests()`)
- [ ] Geen regressies in filter, sort, groepeer, export, selectie

---

*Gegenereerd op basis van statische code-analyse van `dashboard.html` v0.14.0*
*Aanbeveling: voer dit plan uit in volgorde Sprint 1 → 5 en meet na elke sprint.*
