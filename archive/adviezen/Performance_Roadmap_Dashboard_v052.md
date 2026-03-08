# Performance Optimalisatie Roadmap — Dashboard Engine v0.52.0

**Analyse-datum:** 2026-03-08  
**Aantal routes:** 25  
**Impactgebieden:** 6 (Render, Filter/Sort, Scroll, Geheugen, Init, Codekwaliteit)  
**Prioriteitsschaal:** 1 (hoogste) t/m 4 (laagste)

---

## 1. Alle routes

### Prioriteit 1 — Quick Wins & High Impact (nu doen)

| Nr | Route | Complexiteit | Geschatte winst | Impactgebieden | Risico |
|----|-------|-------------|----------------|----------------|--------|
| 1 | **_perfDebug uit in productie** | Laag | 5–15% | Render ▲ · Filter/Sort ▲ · Scroll ▲ · Init ▲ · Codekwaliteit ▲ | Laag |
| 2 | **Multi-pass filtering → single-pass** | Middel | 20–40% op filter | Render ▲▲ · Filter/Sort ▲▲▲ · Scroll ▲ · Codekwaliteit ▲▲ | Middel |
| 3 | **Signatures gebruiken voor cache-bailouts** | Middel | 15–30% herhaalde renders | Render ▲▲ · Filter/Sort ▲▲ · Scroll ▲▲ · Codekwaliteit ▲▲ | Laag |
| 4 | **Search incrementeel maken** | Middel | 30–60% op zoek | Filter/Sort ▲▲▲ · Codekwaliteit ▲ | Middel |

**Route 1 — _perfDebug uit in productie.**
`performance.mark/measure` + `console.log` lopen op élk kritisch pad. Uitschakelen bespaart overhead op filter, sort, render, scroll en init. Quick win zonder functioneel risico.

**Route 2 — Multi-pass filtering → single-pass.**
`applyFiltersToData()` doet nu 3 opeenvolgende `.filter()` passes (globalName → colFilters → filterRules). Eén samengesteld predikaat halveert iteraties bij grote datasets. Grootste single-point winst in de derive-pipeline.

**Route 3 — Signatures gebruiken voor cache-bailouts.**
`_derived` heeft al `dataSignature`/`sortSignature`/`groupSignature` slots maar die worden nergens actief vergeleken. Compacte hash van zoekterm+filters+sort+group+tab → skip recompute als signature ongewijzigd. Voorkomt werk bij onnodig aangeroepen `render()`.

**Route 4 — Search incrementeel maken.**
Bij verlenging zoekterm (bijv. `"pro"` → `"proj"`) kan gezocht worden binnen vorige resultaatset i.p.v. full-scan over alle rijen. Vooral bij 500+ rijen en typende gebruiker (160ms debounce) zeer merkbaar.

---

### Prioriteit 2 — Medium Effort, High Return (sprint 1–2)

| Nr | Route | Complexiteit | Geschatte winst | Impactgebieden | Risico |
|----|-------|-------------|----------------|----------------|--------|
| 5 | **Web Worker voor derive-laag** | Hoog | 30–50% main thread | Render ▲▲ · Filter/Sort ▲▲▲ · Scroll ▲▲ · Codekwaliteit ▲▲▲ | Hoog |
| 6 | **computeVisibleCols() echt cachen** | Laag | 2–5% | Render ▲ · Codekwaliteit ▲ | Laag |
| 7 | **Grouped flatten/render incrementeel** | Middel | 10–25% bij grouping | Render ▲▲ · Scroll ▲▲ · Geheugen ▲ · Codekwaliteit ▲▲ | Middel |
| 8 | **Width sync selectiever** | Laag | 3–8% | Render ▲ · Scroll ▲ · Codekwaliteit ▲ | Laag |
| 9 | **Row/cell render hot path verkorten** | Middel | 10–20% op render | Render ▲▲ · Scroll ▲▲ · Codekwaliteit ▲ | Laag |
| 16 | **innerHTML → DOM-recycling in virtual scroll** | Hoog | 20–35% render+scroll | Render ▲▲▲ · Scroll ▲▲▲ · Geheugen ▲ · Codekwaliteit ▲▲ | Hoog |
| 17 | **escapeHtml() optimaliseren** | Middel | 5–12% op render | Render ▲▲ · Filter/Sort ▲ · Scroll ▲ · Codekwaliteit ▲ | Middel |
| 22 | **Debounce adaptief maken** | Laag | 10–20% perceived | Filter/Sort ▲▲ | Laag |
| 24 | **Init scheduling met prioriteit** | Middel | 15–30% op init | Init ▲▲▲ · Codekwaliteit ▲▲ | Middel |

**Route 5 — Web Worker voor derive-laag.**
Filter, sort, group en aggregatie zijn puur en DOM-vrij → ideaal voor Web Worker. Ontlast main thread bij zoek- en sorteeracties. Grootste structurele winst maar ook grootste ingreep. Vereist message-passing protocol en transfer van resultaten.

**Route 6 — computeVisibleCols() echt cachen.**
Wordt nu bij elke render opnieuw berekend via `getCols().filter(c => c.visible)`. Koppel aan eigen dirty-flag (alleen bij kolom-toggle/reorder). Klein per call maar structureel in elke render-cyclus.

**Route 7 — Grouped flatten/render incrementeel.**
`toggleGroupCollapse` hergebruikt al `groupModel` maar `flattenVisibleGroupTree()` herbouwt de hele lijst. Bij toggle: alleen de gewijzigde tak splice'en in de `flatList`. Vooral bij diepe grouping (3+ niveaus) significant.

**Route 8 — Width sync selectiever.**
`syncAggWidths()` meet headerbreedtes met `offsetWidth` (forced reflow). Nu bij elke `_dirty.widths`. Guard: alleen opnieuw meten als kolommen of containerbreedte echt gewijzigd (ResizeObserver of kolomcount-vergelijking).

**Route 9 — Row/cell render hot path verkorten.**
`rowHtml()` + `renderCell()` per cel in virtual window. Twee aanpakken: (a) per kolom renderer pre-binden vóór de lus, (b) vaste HTML-fragmenten per kolomtype template-cachen. Verkort CPU-tijd zonder architectuurbreuk.

**Route 16 — innerHTML → DOM-recycling in virtual scroll.**
`renderVirtualBody()` schrijft volledige `innerHTML` per scroll-frame. Alternatief: pool van TR-elementen recyclen en alleen celinhoud updaten bij scroll. Vermijdt GC-druk van stringconcatenatie en parsing. Grootste render-winst maar vereist fundamentele refactor van `rowHtml()`.

**Route 17 — escapeHtml() optimaliseren of elimineren voor bekende data.**
`escapeHtml()` draait 5 opeenvolgende `.replace()` regexes per cel-waarde. Bij gegenereerde/interne data (geen user-input) kan escaping worden overgeslagen of vervangen door een single-pass escaper. Hot path: elke cel in elke zichtbare rij.

**Route 22 — Debounce adaptief maken.**
160ms debounce is goed maar bij 500+ rijen kan verhoging naar 250ms of adaptief (langer bij grotere dataset) de UI responsiever houden doordat minder incomplete renders plaatsvinden.

**Route 24 — Init scheduling met prioriteit.**
`initTabDataFromConfig()` gebruikt `requestIdleCallback` (of `setTimeout(0)`) per tab. Bij schaalbaarheid naar 5+ tabs wordt init-volgorde belangrijk. `scheduler.postTask()` of expliciete prioriteitswachtrij → voorspelbare first-paint.

---

### Prioriteit 3 — Gerichte verbeteringen (sprint 2–3)

| Nr | Route | Complexiteit | Geschatte winst | Impactgebieden | Risico |
|----|-------|-------------|----------------|----------------|--------|
| 10 | **Legacy aliassen opruimen** | Laag | 2–5% indirect | Render ▲ · Filter/Sort ▲ · Geheugen ▲ · Codekwaliteit ▲▲▲ | Laag |
| 11 | **Search-index per zoekdomein splitsen** | Middel | 10–20% op zoek | Filter/Sort ▲▲ · Geheugen ▲▲ · Codekwaliteit ▲ | Middel |
| 12 | **Search-input uit computeFilteredData() halen** | Laag | 1–3% | Filter/Sort ▲ · Codekwaliteit ▲▲ | Laag |
| 13 | **Comparator-caching voor sorteren** | Middel | 10–25% op sort | Filter/Sort ▲▲ · Geheugen ▲ · Codekwaliteit ▲ | Middel |
| 14 | **Cache flatGroupedItems per collapsed-state** | Middel | 5–15% bij grouping | Render ▲ · Scroll ▲ · Geheugen ▲ · Codekwaliteit ▲ | Middel |
| 15 | **Virtual buffer adaptief maken** | Middel | 5–10% op scroll | Render ▲ · Scroll ▲▲ · Codekwaliteit ▲ | Middel |
| 18 | **avatarCell cache vergroten of slimmer evicten** | Laag | 2–5% | Render ▲ · Scroll ▲ · Geheugen ▲▲ · Codekwaliteit ▲ | Laag |
| 19 | **Event delegation optimaliseren met early-exit** | Laag | 1–3% | Scroll ▲ · Codekwaliteit ▲ | Laag |
| 20 | **getHeaderCheckboxState() versnellen** | Laag | 2–5% bij selectie | Render ▲ · Codekwaliteit ▲ | Laag |
| 21 | **Conditionele formatting pre-compute** | Laag | 1–3% | Render ▲ · Codekwaliteit ▲▲ | Laag |

**Route 10 — Legacy aliassen opruimen.**
`data0/data1`, `_cachedData/_cachedCols/_cachedTab/_cachedHpx`, `_lastVStart/_lastVEnd`, `_uniqueValueCacheKey`. Vermindert cognitieve last, voorkomt bugs en maakt invalidatiepaden scherper. Vooral codekwaliteitswinst.

**Route 11 — Search-index per zoekdomein splitsen.**
`buildSearchIndex()` voegt alle veldwaarden samen in één `_searchStr` per rij. Per tab een compactere index op alleen doorzoekbare velden → minder heap, minder `includes`-werk. Trade-off: complexere indexatie.

**Route 12 — Search-input uit computeFilteredData() halen.**
`computeFilteredData()` leest DOM (`getElementById`) voor zoekwaarde. Zoekterm in AppState opslaan → pure derive-functie, beter testbaar, geen DOM-koppeling in de hot path.

**Route 13 — Comparator-caching voor sorteren.**
`sortData()` doet per vergelijking `toLowerCase()` op strings. Sort keys pre-cachen per rij per actief sorteerveld → geen herhaalde string-operaties tijdens `.sort()`. Helpt vooral bij multi-level sort en grote datasets.

**Route 14 — Cache flatGroupedItems per collapsed-state.**
Bij terugkerende collapsed-states (open/dicht/open) wordt flatten herhaald. Kleine LRU-cache op `groupFields + collapsedGroups` signature → direct hergebruik bij bekende states.

**Route 15 — Virtual buffer adaptief maken.**
`_vBuf=10` is vast. Bij hoge scrollsnelheid meer buffer (minder flicker), bij rustige scroll minder DOM-opbouw. Adaptief op basis van scrollsnelheid of viewporthoogte.

**Route 18 — avatarCell cache vergroten of slimmer evicten.**
`_AVATAR_CACHE_MAX=150` met FIFO-evictie. Bij 3 avatar-kolommen × 50+ unieke namen per viewport → frequent cache-miss. Vergroten naar 300+ of LRU-evictie i.p.v. FIFO → minder HTML-opbouw voor herhaalde namen.

**Route 19 — Event delegation optimaliseren met early-exit.**
`initTableDelegation()` click-handler doet 4 opeenvolgende `closest()` lookups per klik. Early-exit na eerste match + data-attribuut op TR-niveau → minder DOM-traversal per interactie.

**Route 20 — getHeaderCheckboxState() versnellen.**
Itereert over `_cachedData.length` bij elke `updateSelectionUI()`. Counter bijhouden bij toggle (increment/decrement) i.p.v. hertellen → O(1) in plaats van O(n).

**Route 21 — Conditionele formatting pre-compute.**
`condClass()` evalueert 4 if-statements per rij in `rowHtml()`. Alternatief: pre-compute class per rij tijdens filtering (data is toch al beschikbaar) en opslaan als property. Kleine winst maar vermindert werk in de render-hot-path.

---

### Prioriteit 4 — Nice-to-have (backlog)

| Nr | Route | Complexiteit | Geschatte winst | Impactgebieden | Risico |
|----|-------|-------------|----------------|----------------|--------|
| 23 | **updateFilterBadge/Bar samenvoegen** | Laag | <1% | Render ▲ · Codekwaliteit ▲ | Laag |
| 25 | **Typed Arrays voor numerieke aggregatie** | Middel | 3–8% op agg | Filter/Sort ▲ · Geheugen ▲▲ · Codekwaliteit ▲ | Middel |

**Route 23 — updateActiveFiltersBar() en updateFilterBadge() samenvoegen.**
Beide functies itereren apart over `AppState.filterRules.filter(...)`. Samenvoegen tot één pass: filter-badge + chips + active-state in één functie. Microscopisch maar illustreert bredere patroon van dubbel itereren.

**Route 25 — Typed Arrays voor numerieke aggregatie.**
`computeAggModel()` itereert over alle rijen met object-property access. Bij puur numerieke velden (budget, progress, fte) kan een `Float64Array` pre-extractie de V8 JIT beter optimaliseren en cache-lines beter benutten.

---

## 2. Impactgebieden

### Render (ms)

- **Definitie:** Totale duur van `_renderInternal()`: dirty-flag check → derive → DOM-schrijf
- **Meetmethode:** `_measure("render")` en performance overlay
- **Budget:** D-L7: FAIL < 200ms, Target < 80ms
- **Waarom kritiek:** Dit is het pad dat gebruikers direct voelen bij elke interactie. Elke ms hier is zichtbaar.
- **Relevante routes:** 1, 2, 3, 6, 7, 8, 9, 10, 16, 17, 21, 23

### Filter/Sort (ms)

- **Definitie:** Duur van `computeFilteredData()` + `computeSortedData()` + `computeAggModel()`
- **Meetmethode:** `_measure('computeFiltered')`, `_measure('computeSorted')`
- **Budget:** D-L2: Filter < 50ms (target 20ms) · D-L3: Sort < 40ms (target 15ms)
- **Waarom kritiek:** Dominant bij zoekacties, filterwijzigingen en sorteertoggles. Bij 200+ rijen meetbaar; bij 1000+ kritiek.
- **Relevante routes:** 2, 3, 4, 5, 11, 12, 13, 17, 22, 25

### Scroll (fps)

- **Definitie:** Frame rate tijdens continu scrollen via rAF-based FPS monitor
- **Meetmethode:** `_startFpsMonitor()`, D-S2 test
- **Budget:** D-S2: FAIL < 45 fps, Target ≥ 55 fps · D-L6: renderVirtualBody < 30ms (target 15ms)
- **Waarom kritiek:** Bepaalt de "vloeiendheid" van de applicatie. `innerHTML` per frame is de bottleneck; DOM-recycling is de structurele oplossing.
- **Relevante routes:** 1, 3, 7, 8, 9, 15, 16, 17, 18, 19

### Geheugen (heap)

- **Definitie:** JS heap-gebruik: `_searchStr` per rij, avatarCache, `_derived` caches, `flatGroupedItems`, DOM-nodes
- **Meetmethode:** `performance.memory`
- **Budget:** Geen formeel budget; indicatief < 50MB bij 500 rijen
- **Waarom kritiek:** Beïnvloedt GC-pauzes (jank) en langetermijnstabiliteit. Vooral relevant bij langdurige sessies met veel tab-wissels.
- **Relevante routes:** 5, 7, 10, 11, 14, 18, 25

### Init (ms)

- **Definitie:** Tijd van DOMContentLoaded tot `dashboard:ready` mark
- **Meetmethode:** `performance.measure('dashboard:total-init')`
- **Budget:** D-P2: FAIL < 300ms, Target < 100ms · D-P1a: First Paint < 500ms (target 100ms)
- **Waarom kritiek:** Eerste indruk van de gebruiker. Bij embedded data is dit snel; bij toekomstige Layer 3 CSV-datasets wordt init kritischer.
- **Relevante routes:** 1, 24

### Codekwaliteit

- **Definitie:** Onderhoudbaarheid, testbaarheid, cognitieve complexiteit
- **Meetmethode:** Aantal legacy-aliassen, pure vs impure functies, DOM-koppeling in derive-layer
- **Budget:** Geen numeriek budget
- **Waarom kritiek:** Schonere code → scherper invalidatiepaden → minder onnodig werk. Direct effect op bugpreventie en snelheid van toekomstige optimalisaties.
- **Relevante routes:** 2, 3, 5, 6, 9, 10, 12, 21, 23, 24

---

## 3. Implementatie Roadmap

### Fase 0 — Onmiddellijk (< 1 dag)

| Route | Doorlooptijd | Afhankelijkheid | Kernaanpak |
|-------|-------------|-----------------|------------|
| Route 1: _perfDebug uit | < 2 uur | Geen | Eén variabele toggle + conditionele overlay-init |
| Route 12: Search-input uit derive | < 2 uur | Geen | `AppState.searchTerm` toevoegen, `onSearchInput()` bijwerken |
| Route 6: computeVisibleCols() cachen | < 2 uur | Geen | Dirty flag `_dirty.cols` + guard in `computeVisibleCols()` |

### Fase 1 — Quick Wins (1–3 dagen)

| Route | Doorlooptijd | Afhankelijkheid | Kernaanpak |
|-------|-------------|-----------------|------------|
| Route 2: Single-pass filtering | 4–6 uur | Geen | Samengesteld predikaat bouwen, 3 passes → 1 pass |
| Route 3: Signature cache-bailouts | 4–6 uur | Route 12 (zoekterm in state) | Hash van zoekterm+filters+sort+group+tab → bailout |
| Route 4: Incrementele search | 3–4 uur | Route 12 | Vorige resultaatset als input bij zoektermverlenging |
| Route 22: Adaptieve debounce | 1–2 uur | Geen | Debounce-ms berekenen op basis van datasetgrootte |
| Route 20: Header checkbox counter | 1–2 uur | Geen | `selectedCount` bijhouden bij toggle |
| Route 8: Width sync selectiever | 2–3 uur | Geen | Guard: alleen meten als kolom-count of container-breedte wijzigt |

### Fase 2 — Render Optimalisaties (1–2 weken)

| Route | Doorlooptijd | Afhankelijkheid | Kernaanpak |
|-------|-------------|-----------------|------------|
| Route 9: Row/cell hot path | 1–2 dagen | Geen | Pre-bind renderers, template-cache per kolomtype |
| Route 17: escapeHtml() optimaliseren | 4–6 uur | Geen | Single-pass escaper of trusted-data bypass |
| Route 7: Grouped flatten incrementeel | 1–2 dagen | Geen | Splice gewijzigde tak in flatList |
| Route 13: Comparator-caching | 4–6 uur | Geen | Sort keys pre-cachen per rij per actief veld |
| Route 15: Adaptieve virtual buffer | 3–4 uur | Geen | Buffer o.b.v. scrollsnelheid of viewport |
| Route 18: Avatar cache vergroten | 1–2 uur | Geen | LRU-evictie, max naar 300+ |

### Fase 3 — Architecturele Verbeteringen (2–4 weken)

| Route | Doorlooptijd | Afhankelijkheid | Kernaanpak |
|-------|-------------|-----------------|------------|
| Route 16: DOM-recycling virtual scroll | 3–5 dagen | Route 9 (hot path basis) | TR-pool met cel-update i.p.v. innerHTML |
| Route 5: Web Worker derive-laag | 5–8 dagen | Routes 2, 3, 4 (geoptimaliseerde derive) | Message-passing protocol, transferable objects |
| Route 24: Init scheduling | 2–3 dagen | Geen | `scheduler.postTask()` of eigen priority queue |
| Route 10: Legacy opruimen | 2–3 dagen | Na Fase 2 stabilisatie | Aliassen verwijderen, tests aanpassen |
| Route 11: Search-index per domein | 2–3 dagen | Route 12 | Per-tab index met veld-selectie |

### Fase 4 — Fijntuning & Backlog (doorlopend)

| Route | Doorlooptijd | Afhankelijkheid | Kernaanpak |
|-------|-------------|-----------------|------------|
| Route 14: flatGroupedItems state-cache | 3–4 uur | Route 7 | LRU op collapsed-state signature |
| Route 19: Event delegation early-exit | 1–2 uur | Geen | Data-attribuut op TR, early return |
| Route 21: Cond formatting pre-compute | 2–3 uur | Route 2 (single-pass) | Class toevoegen tijdens filter-pass |
| Route 23: FilterBadge/Bar merge | 1–2 uur | Geen | Eén iteratie, twee outputs |
| Route 25: Typed Arrays aggregatie | 3–5 uur | Geen | Float64Array extractie voor numerieke kolommen |

---

## 4. Samenvatting

De engine is al slim ontworpen met dirty flags, derived-state cache, virtual scroll, rAF-throttled scroll handlers, lazy data-init en lazy XLSX loading. De grootste kansen zitten in vier gebieden:

1. **Minder vaak rekenen** — signatures, cache-bailouts, incrementele search (routes 3, 4, 14)
2. **Minder vaak full-scan filteren** — single-pass filtering, zoekdomein-index (routes 2, 11)
3. **Minder main-thread werk** — Web Worker, adaptieve debounce (routes 5, 22)
4. **Minder onnodige re-renders** — DOM-recycling, hot path verkorten, width sync guard (routes 16, 9, 8)

De verwachte cumulatieve winst bij volledige implementatie van Fase 0–2 is **40–60% op de render-cyclus** en **50–70% op filter/sort-operaties**, met een geschatte doorlooptijd van 2–3 weken.
