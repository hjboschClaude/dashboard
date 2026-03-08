# Implementatieplan — Dashboard Gemeente Rotterdam *(AFGEROND v0.31.0 — 24/25 taken)*

**Versie:** 0.14.0 → 0.16.0 *(aangemaakt)* | **Bijgewerkt:** v0.31.0 — 2026-03-07
**Basis:** TOETSINGSKADER.md — 64 bevindingen over 11 dimensies
**Relatie:** Complementair aan PERFORMANCE_PLAN.md *(volledig afgerond in v0.25.1)*

> **Status na v0.31.0:** PERFORMANCE_PLAN Sprint 1–5 én dit plan Sprint A–F volledig afgewerkt.
> 24 van 25 taken afgerond. Enige uitzondering: E.5 (panel-render patroon centraliseren) —
> bewust uitgesteld, geen functionele impact.

---

## Inhoudsopgave

1. [Overzicht & prioritering](#1-overzicht--prioritering)
2. [Sprint A — Correctheid & Beveiliging](#2-sprint-a--correctheid--beveiliging)
3. [Sprint B — Geheugen & Koppeling](#3-sprint-b--geheugen--koppeling)
4. [Sprint C — Toegankelijkheid](#4-sprint-c--toegankelijkheid)
5. [Sprint D — Testbaarheid](#5-sprint-d--testbaarheid)
6. [Sprint E — Onderhoudbaarheid & Config](#6-sprint-e--onderhoudbaarheid--config)
7. [Sprint F — Browsercompatibiliteit](#7-sprint-f--browsercompatibiliteit)
8. [Takenlijst (alle sprints)](#8-takenlijst-alle-sprints)
9. [Acceptatiecriteria per sprint](#9-acceptatiecriteria-per-sprint)

> **Relatie met PERFORMANCE_PLAN.md:**
> De performance-gerelateerde taken (P1–P7) staan in PERFORMANCE_PLAN.md.
> Dit plan dekt de overige 8 dimensies uit het toetsingskader.
> Uitvoervolgorde: PERFORMANCE_PLAN Sprint 1–5 → dit plan Sprint A–F (parallel waar mogelijk).

---

## 1. Overzicht & prioritering

### Alle taken — status v0.31.0

> Legenda: ✓ Afgerond &nbsp;·&nbsp; △ Deels (code gedeeltelijk aanwezig) &nbsp;·&nbsp; ○ Open

| ID | Sprint | Ernst | Dimensie | Taak | Metriek | Status |
|---|---|---|---|---|---|---|
| A.1 | A | 🔴 Kritiek | Correctheid | Fix `_searchStr` undefined crash | C-03 | ✓ Afgerond — v0.26.0 |
| A.2 | A | 🔴 Kritiek | Beveiliging | Fix XSS in `mono` renderer via `col.suffix` | S-01, S-04 | ✓ Afgerond — v0.26.0 |
| A.3 | A | 🔴 Kritiek | Beveiliging | Fix HTML-export onveilige `plainVal()` data | S-05 | ✓ Afgerond — v0.26.0 |
| A.4 | A | 🟠 Hoog | Correctheid | Fix `tagFilter()` op.is → op.equals | C-05 | ✓ Afgerond — v0.26.1 |
| A.5 | A | 🟠 Hoog | Correctheid | Dedupliceer `parseFloat` in `matchRule` | C-06 | ✓ Afgerond — v0.26.1 |
| A.6 | A | 🟠 Hoog | Beveiliging | Voeg Content Security Policy meta-tag toe | S-06 | ✓ Afgerond — v0.26.1 |
| B.1 | B | 🔴 Kritiek | Geheugen | Fix `_gvScrollBound` duplice scroll-listeners | M-04 | ✓ Afgerond |
| B.2 | B | 🟠 Hoog | Geheugen | Begrens `_avatarCache` (LRU, max 150 entries) | M-05 | ✓ Afgerond — v0.27.0 |
| B.3 | B | 🟠 Hoog | Koppeling | Reduceer AppState-mutaties in render-functies | K-02 | ✓ Afgerond — v0.27.1 |
| B.4 | B | 🟡 Middel | Geheugen | Voeg size-check toe op `_uniqueValueCache` | M-06 | ✓ Afgerond — v0.27.0 |
| C.1 | C | 🟠 Hoog | Toegankelijkheid | Kolom-filter-knop keyboard bereikbaar maken | A-02 | ✓ Afgerond — v0.28.0 |
| C.2 | C | 🟠 Hoog | Toegankelijkheid | Header-checkbox ARIA-label dynamisch bijwerken | A-06 | ✓ Afgerond |
| C.3 | C | 🟡 Middel | Toegankelijkheid | Kleurcontrast meten en vastleggen (WCAG AA) | A-05 | ✓ Afgerond — v0.28.0 |
| C.4 | C | 🟡 Middel | Toegankelijkheid | Rij-Enter opent modal (keyboard-navigatie) | A-02 | ✓ Afgerond — v0.28.0 |
| D.1 | D | 🟠 Hoog | Testbaarheid | Voeg 20 extra assertions toe aan `runTests()` | T-02, T-03 | ✓ Afgerond |
| D.2 | D | 🟠 Hoog | Testbaarheid | Isoleer DOM-afhankelijkheden uit pure functies | T-05 | ✓ Afgerond — v0.29.0 |
| D.3 | D | 🟡 Middel | Testbaarheid | Isoleer `Math.random()` in data-factory | T-06 | ✓ Afgerond |
| E.1 | E | 🔴 Kritiek | Onderhoudbaarheid | Verplaats `categoricalKeys` e.a. naar config | O-07 | ✓ Afgerond — v0.29.0 |
| E.2 | E | 🟠 Hoog | Onderhoudbaarheid | Vervang hardcoded domeinstrings door constanten | O-02 | ✓ Afgerond — v0.29.1 |
| E.3 | E | 🟠 Hoog | Onderhoudbaarheid | Verwijder legacy `@deprecated` accessors | O-06 | ✓ Afgerond — v0.31.0 |
| E.4 | E | 🟡 Middel | Herbruikbaarheid | Centraliseer sort-toggle logica | R-04 | ✓ Afgerond — v0.29.0 |
| E.5 | E | 🟡 Middel | Herbruikbaarheid | Centraliseer panel-render patroon | R-03 | ○ Uitgesteld |
| F.1 | F | 🔴 Kritiek | Browsercompat | Documenteer minimale browser-vereisten (ES6) | B-01 | ✓ Afgerond — v0.30.0 |
| F.2 | F | 🟠 Hoog | Browsercompat | Update XLSX CDN naar actuele versie + SRI hash | B-05 | ✓ Afgerond — v0.30.0 |
| F.3 | F | 🟡 Middel | Browsercompat | `requestAnimationFrame` fallback of browsereis | B-03 | ✓ Afgerond — v0.30.0 |

### Prioriteitsmatrix

```
Ernst  ↑
🔴     │ A.1  A.2  A.3         B.1         E.1         F.1
🟠     │ A.4  A.5  A.6   B.2  B.3   C.1  C.2  D.1 D.2  E.2 E.3   F.2
🟡     │                  B.4        C.3  C.4  D.3      E.4 E.5   F.3
🟢     │
       └──────────────────────────────────────────────────────────────→
             A          B          C          D          E          F
```

---

## 2. Sprint A — Correctheid & Beveiliging

**Doel:** Elimineer crashes, logische fouten en XSS-kwetsbaarheden.
**Geschatte omvang:** Klein (< 1 dag)

---

### Taak A.1 — Fix `_searchStr` undefined crash bij lege dataset

**Metriek:** C-03 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — v0.26.0
**Bestand:** `dashboard.html`, functie `computeFilteredData()` (regel ~1468)

**Probleem:**
`r._searchStr.includes(search)` gooit een `TypeError` wanneer rijen geen
`_searchStr`-property hebben. Deze property bestaat alleen als `prepareSearchStr()`
eerder is aangeroepen, maar dat is niet gegarandeerd bij:
- Lege datasets (mock/testdata)
- Rijen die na initialisatie worden toegevoegd
- Tab-switch voordat de eerste render klaar is

**Huidig:**
```js
if (search) data = data.filter(function(r) {
  return r._searchStr.includes(search);   // ← crash als _searchStr undefined
});
```

**Fix (stap 1): Zorg dat `_searchStr` altijd bestaat bij data-initialisatie**

Voeg toe aan het einde van `generateProjectData()` en `generateTeamData()`,
direct na het opbouwen van elk record-object:

```js
// In de rij-constructie van generateProjectData / generateTeamData:
r._searchStr = [
  r.name, r.status, r.priority, r.fase,
  r.directeur, r.aog, r.pm, r.cluster,
  r.afdeling, r.locatie, r.note
].filter(Boolean).join(' ').toLowerCase();
```

**Fix (stap 2): Defensieve null-check als vangnet**

```js
if (search) data = data.filter(function(r) {
  return (r._searchStr || '').includes(search);
});
```

**Verificatie:**
1. Verwijder tijdelijk `_searchStr` van eerste data-rij → zoek → geen console-error
2. Zoek op bestaande naam → correcte resultaten
3. Zoek op niet-bestaande string → 0 resultaten, geen crash
4. `runTests()` → C-03 assertion slaagt

---

### Taak A.2 — Fix XSS in `mono` renderer via `col.suffix`

**Metriek:** S-01, S-04 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — v0.26.0
**Bestand:** `dashboard.html`, object `cellRenderers`, entry `mono` (regel ~1070)

**Probleem:**
`col.suffix` wordt direct als HTML in de output geplaatst zonder te escapen.
Wanneer een kolom-definitie een kwaadaardige suffix bevat (bijv. een import
vanuit externe bronnen), kan dit XSS veroorzaken.

**Huidig:**
```js
mono: function(v, col) {
  var s = col.suffix || '';          // ← UNSAFE: s kan HTML bevatten
  return '<span class="mono">' + escapeHtml(v) + '</span>'
       + (s ? '<span class="unit">' + s + '</span>' : '');
}
```

**Fix:**
```js
mono: function(v, col) {
  var s = col.suffix ? escapeHtml(String(col.suffix)) : '';
  return '<span class="mono">' + escapeHtml(String(v == null ? '' : v)) + '</span>'
       + (s ? '<span class="unit">' + s + '</span>' : '');
}
```

**Verificatie:**
1. Zet `col.suffix = '<img src=x onerror=alert(1)>'` in kolom-definitie
2. Render de tabel → geen alert
3. Suffix-tekst verschijnt als plain text: `<img src=x onerror=alert(1)>`
4. Bestaande suffix-waarden (bijv. `%`, `uur`) blijven correct weergegeven

---

### Taak A.3 — Fix HTML-export onveilige `plainVal()` data

**Metriek:** S-05 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — v0.26.0
**Bestand:** `dashboard.html`, functie `exportHTML()` (regel ~2963)

**Probleem:**
`plainVal(c, r)` geeft onge-escapede strings terug. In de HTML-export worden
deze direct als `<td>`-inhoud gebruikt. Een kwaadaardige celwaarde (bijv.
`<script>`) wordt zo uitgevoerd wanneer het bestand in een browser wordt geopend.

**Huidig:**
```js
rows.forEach(function(r) {
  html += '<tr>';
  visibleCols.forEach(function(c) {
    html += '<td>' + plainVal(c, r) + '</td>';  // ← UNSAFE
  });
  html += '</tr>';
});
```

**Fix:**
```js
rows.forEach(function(r) {
  html += '<tr>';
  visibleCols.forEach(function(c) {
    html += '<td>' + escapeHtml(String(plainVal(c, r) ?? '')) + '</td>';
  });
  html += '</tr>';
});
```

**Verificatie:**
1. Voeg rij toe met naam `<script>alert(1)</script>`
2. Exporteer als HTML → open geëxporteerd bestand → geen alert
3. De naam wordt zichtbaar als plain tekst in de tabel
4. Bestaande data (namen, datums, bedragen) worden correct weergegeven

---

### Taak A.4 — Fix `tagFilter()` operator `is` → `equals`

**Metriek:** C-05 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.26.1
**Bestand:** `dashboard.html`, functie `tagFilter()` (regel ~2488)

**Probleem:**
`tagFilter()` zoekt naar `op: 'is'`, maar de filterOps-definitie kent geen
operator `is`. Gedefinieerde operators zijn: `contains`, `not_contains`,
`equals`, `not_equals`, `gt`, `lt`, `empty`, `not_empty`.
Hierdoor vindt `tagFilter()` nooit een bestaande filter en kan bestaande
tag-filters nooit correct verwijderen of updaten.

**Huidig:**
```js
function tagFilter(field, val) {
  var idx = filterRules.findIndex(function(r) {
    return r.field === field && r.op === 'is' && r.value === val;  // ← 'is' bestaat niet
  });
  // ...
}
```

**Fix:**
```js
function tagFilter(field, val) {
  var idx = filterRules.findIndex(function(r) {
    return r.field === field && r.op === 'equals' && r.value === val;
  });
  if (idx >= 0) {
    filterRules.splice(idx, 1);
  } else {
    filterRules.push({ field: field, op: 'equals', value: val });
  }
  AppState.filterRules = filterRules;
  invalidate('data');
  render();
}
```

**Verificatie:**
1. Klik een tag-badge in de tabel → filter wordt actief
2. Filter-panel toont de regel met `equals`
3. Klik dezelfde tag opnieuw → filter wordt verwijderd
4. `runTests()` → C-05 assertion slaagt

---

### Taak A.5 — Dedupliceer `parseFloat` in `matchRule` (gt/lt)

**Metriek:** C-06 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.26.1
**Bestand:** `dashboard.html`, functie `matchRule()` (regel ~1097–1101)

**Probleem:**
`parseFloat(raw)` wordt twee keer aangeroepen voor hetzelfde `raw` argument
bij `gt`/`lt` operatoren. Dit is geen functionele bug maar een
onderhoudbaarheidsrisico: als de parsing-logica wijzigt, moet dat op twee
plekken worden aangepast.

**Huidig:**
```js
case 'gt':
  var numA = parseFloat(raw);           // ← eerste aanroep
  var numA2 = parseFloat(rule.value);   // ← tweede aanroep (andere var nodig)
  return !isNaN(numA) && !isNaN(numA2) && numA > numA2;
case 'lt':
  var numB = parseFloat(raw);           // ← zelfde als numA, andere naam
  var numB2 = parseFloat(rule.value);
  return !isNaN(numB) && !isNaN(numB2) && numB < numB2;
```

**Fix** (gebruik gedeelde variabelen, one-time parse):
```js
case 'gt':
case 'lt': {
  var numRaw = parseFloat(raw);
  var numVal = parseFloat(rule.value);
  if (isNaN(numRaw) || isNaN(numVal)) return false;
  return rule.op === 'gt' ? numRaw > numVal : numRaw < numVal;
}
```

**Verificatie:**
1. Filter op `budget > 500000` → correct gefilterd
2. Filter op `budget < 100000` → correct gefilterd
3. Filter op niet-numeriek veld met `gt` → geen resultaten, geen crash
4. `runTests()` → bestaande gt/lt assertions slagen

---

### Taak A.6 — Voeg Content Security Policy meta-tag toe

**Metriek:** S-06 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.26.1
**Bestand:** `dashboard.html`, `<head>` sectie (na regel 7)

**Probleem:**
Geen CSP aanwezig. Dit maakt de applicatie kwetsbaarder voor XSS-aanvallen
omdat de browser geen externe script-bronnen blokkeert.

**Fix:**
```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src https://fonts.gstatic.com;
        connect-src 'none';
        img-src 'self' data:;
        object-src 'none';
        base-uri 'self';
      ">
```

> **Noot:** `unsafe-inline` is nodig zolang de JS en CSS inline in het HTML-bestand
> zitten. Als de code later wordt opgeknipt in losse bestanden, kan `unsafe-inline`
> worden vervangen door een nonce of hash.

**Verificatie:**
1. Open dashboard → DevTools → Console → geen CSP-violations
2. Probeer inline `<script>` via XSS → browser blokkeert uitvoering
3. XLSX-export werkt nog (CDN whitelisted)
4. Google Fonts laden correct (font-src whitelisted)

---

## 3. Sprint B — Geheugen & Koppeling

**Doel:** Elimineer memory leaks en reduceer directe state-mutaties.
**Geschatte omvang:** Klein-middel (1–2 dagen)

---

### Taak B.1 — Fix `_gvScrollBound` duplice scroll-listeners

**Metriek:** M-04 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — `_gvScrollBound` flag-check aanwezig, listener-deduplicatie werkt
**Bestand:** `dashboard.html`, functie `renderGroupedBody()` (regel ~1999)

**Probleem:**
`_gvScrollBound` registreert scroll-listeners per container, maar wordt niet
gereset bij tab-switch of bij herhaalde render-aanroepen. Bij elke re-render
van een grouped tab zonder flag-check worden nieuwe listeners toegevoegd aan
dezelfde container. Dit resulteert in meerdere scroll-callbacks per event,
wat leidt tot:
- Extra reflows per scroll-event
- Toenemend geheugengebruik bij langdurig gebruik

**Huidig:**
```js
var _gvScrollBound = {};

// In renderGroupedBody():
if (!_gvScrollBound[tab]) {
  container.addEventListener('scroll', function() { ... });
  _gvScrollBound[tab] = true;
}
```

Het probleem: `_gvScrollBound[tab]` wordt gezet maar nooit gereset. Als
`renderGroupedBody()` wordt aangeroepen met een nieuwe `container`-referentie
(bijv. na DOM-recreatie), wordt de listener aan de nieuwe container toegevoegd
terwijl de flag nog `true` is voor de oude container. Andersom: als de container
dezelfde is maar de flag is gereset, wordt een dubbele listener toegevoegd.

**Fix (stap 1): Sla de handler-referentie op, niet een boolean**

```js
var _gvScrollHandlers = {};  // { tabId: { container: el, handler: fn } }

// In renderGroupedBody():
function _bindGroupedScroll(tab, container, renderFn) {
  var existing = _gvScrollHandlers[tab];
  if (existing) {
    if (existing.container === container) return;   // zelfde container, niks doen
    existing.container.removeEventListener('scroll', existing.handler, { passive: true });
  }
  var handler = function() { renderFn(); };
  container.addEventListener('scroll', handler, { passive: true });
  _gvScrollHandlers[tab] = { container: container, handler: handler };
}
```

**Fix (stap 2): Reset bij tab-destroy (optioneel, voor volledigheid)**

```js
function _cleanupGroupedScroll(tab) {
  var existing = _gvScrollHandlers[tab];
  if (existing) {
    existing.container.removeEventListener('scroll', existing.handler, { passive: true });
    delete _gvScrollHandlers[tab];
  }
}
// Aanroepen in switchTab() vóór nieuwe render
```

**Verificatie:**
1. Open tab met groepering
2. DevTools → Elements → container → Event Listeners → `scroll` → tel: moet 1 zijn
3. Switch tab 10x → terug → nog steeds 1 scroll-listener
4. Memory snapshot voor/na 50 tab-switches → heap groeit < 1 MB

---

### Taak B.2 — Begrens `_avatarCache` (LRU, max 150 entries)

**Metriek:** M-05 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.27.0
**Bestand:** `dashboard.html`, functie `avatarCell()` (regel ~1039)

**Probleem:**
`_avatarCache` (een `Map`) groeit onbeperkt. Bij 9.000 rijen met unieke namen
kan de cache groeien tot duizenden entries, elk een HTML-string van ~100 tekens.

**Fix (simpele FIFO-begrensing):**
```js
var _AVATAR_CACHE_MAX = 150;

function avatarCell(name, size) {
  var cache = AppState._cache.avatar;
  if (cache.has(name)) return cache.get(name);

  // Verwijder oudste entry als cache vol is
  if (cache.size >= _AVATAR_CACHE_MAX) {
    var firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  var initials = (name || '?').split(' ')
    .map(function(w) { return w[0] || ''; })
    .join('').substring(0, 2).toUpperCase();
  var c = avatarColors[Math.abs(hashStr(name)) % avatarColors.length];
  var html = '<div class="avatar" style="background:' + escapeAttr(c)
           + '" aria-hidden="true">' + escapeHtml(initials) + '</div>';
  cache.set(name, html);
  return html;
}
```

**Verificatie:**
1. Render 9.000 rijen → `AppState._cache.avatar.size` ≤ 150
2. Avatar-weergave klopt voor alle zichtbare rijen
3. Re-render van eerder geziene namen → cache hit (geen opnieuw berekenen)

---

### Taak B.3 — Reduceer AppState-mutaties in render-functies

**Metriek:** K-02 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.27.1
**Bestand:** `dashboard.html`, alle render-functies

**Probleem:**
47 functies muteren `AppState` direct. Render-functies (die output produceren)
horen geen state te schrijven — dat maakt de render-pipeline onvoorspelbaar
en moeilijk te debuggen.

**Aanpak (in twee stappen):**

**Stap 1: Identificeer en documenteer alle AppState-schrijfoperaties in render-functies**

Render-functies zijn: `renderHeader`, `renderVirtualBody`, `renderGroupedBody`,
`rowHtml`, `renderAggFromModel`, `renderFilterPanel`, `renderSortPanel`,
`renderGroupPanel`, `renderColPanel`.

Staat die alleen gelezen moet worden:
- `currentTab`, `sortRules`, `filterRules`, `groupFields`, `visibleCols`
- `selectedRows`, `collapsedGroups`, `colFilters`

**Stap 2: Verplaats schrijfoperaties naar event-handlers**

```js
// VOOR (in renderVirtualBody — schrijft state):
function renderVirtualBody() {
  _lastVStart = startIdx;   // ← state-mutatie in render
  _lastVEnd = endIdx;
  _lastVDataLen = data.length;
  // ...render HTML...
}

// NA (schrijf alleen in scroll-handler, render is puur):
function renderVirtualBody(startIdx, endIdx, data) {
  // Alleen HTML genereren — geen state-mutaties
  return buildVirtualBodyHtml(startIdx, endIdx, data);
}

// In de scroll-handler:
function _onVirtualScroll(tab) {
  var range = _computeScrollRange(tab);
  if (_rangeChanged(tab, range)) {
    _updateScrollState(tab, range);   // ← schrijft state
    renderVirtualBody();              // ← puur render
  }
}
```

> **Noot:** Dit is een grotere refactoring. Doe dit incrementeel per functie
> en verifieer na elke stap met `runTests()`.

**Verificatie per functie:**
- Render-functie bevat geen `AppState.X =` assignments meer
- `runTests()` slaagt na elke functie-migratie
- Visuele output is identiek aan vóór de wijziging

---

### Taak B.4 — Voeg size-check toe aan `_uniqueValueCache`

**Metriek:** M-06 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — v0.27.0
**Bestand:** `dashboard.html`, functie die `_uniqueValueCache` vult (regel ~1193)

**Probleem:**
`_uniqueValueCache` wordt per kolom gevuld met alle unieke waarden. Bij een
dataset met veel unieke tekst-waarden (bijv. namen, notes) kan dit excessief
groeien. Er is geen maximumlimiet.

**Fix:**
```js
var _UNIQUE_CACHE_MAX_ENTRIES = 500;  // max waarden per kolom

function _getUniqueValuesForCol(colKey) {
  if (_uniqueValueCache[colKey]) return _uniqueValueCache[colKey];

  var data = _derived.filteredData || [];
  var seen = new Set();
  var values = [];

  for (var i = 0; i < data.length; i++) {
    var v = data[i][colKey];
    if (v == null || v === '') continue;
    var key = String(v);
    if (!seen.has(key)) {
      seen.add(key);
      values.push({ value: v, label: key });
      if (values.length >= _UNIQUE_CACHE_MAX_ENTRIES) break;  // hard limit
    }
  }

  values.sort(function(a, b) { return String(a.label).localeCompare(String(b.label)); });
  _uniqueValueCache[colKey] = { values: values, truncated: seen.size >= _UNIQUE_CACHE_MAX_ENTRIES };
  return _uniqueValueCache[colKey];
}
```

Toon een melding in het filter-panel als `result.truncated === true`:
```js
// In rebuildColFilterPanelContent():
if (info.truncated) {
  html += '<p class="filter-truncate-note">Toont eerste '
        + _UNIQUE_CACHE_MAX_ENTRIES + ' waarden</p>';
}
```

**Verificatie:**
1. Open kolomfilter voor kolom met 1.000+ unieke waarden → max 500 getoond
2. Melding "Toont eerste 500 waarden" verschijnt
3. Kolomfilter voor kolom met < 500 unieke waarden → geen melding

---

## 4. Sprint C — Toegankelijkheid

**Doel:** Maak alle primaire acties keyboard-bereikbaar, WCAG AA compliant.
**Geschatte omvang:** Klein (< 1 dag)

---

### Taak C.1 — Kolom-filter-knop (▼) keyboard bereikbaar maken

**Metriek:** A-02 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.28.0
**Bestand:** `dashboard.html`, functie `renderHeader()` (regel ~1720)

**Probleem:**
De kolom-filter-knop (het ▼-icoontje naast de kolomnaam) heeft alleen een
`onclick`-handler. Toetsenbordgebruikers kunnen het element wel bereiken via
Tab (als er een `tabindex="0"` is), maar Enter/Spatie doet niets.

**Huidig:**
```js
// In renderHeader() — kolomheader HTML:
'<span class="col-filter-btn" onclick="showColFilterPanel(event,\'' + k + '\')">'
+ '▼</span>'
```

**Fix:**
```js
'<span class="col-filter-btn" '
+ 'tabindex="0" '
+ 'role="button" '
+ 'aria-label="Filter op ' + escapeAttr(c.label) + '" '
+ 'onclick="showColFilterPanel(event,\'' + escapeAttr(k) + '\')" '
+ 'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){'
+   'event.preventDefault();showColFilterPanel(event,\'' + escapeAttr(k) + '\');}" '
+ '>▼</span>'
```

**Verificatie (keyboard-test):**
1. Tab naar ▼-knop van eerste kolom → focus-indicator zichtbaar
2. Druk Enter → filter-panel opent
3. Druk Spatie → filter-panel opent
4. Escape → filter-panel sluit
5. `runTests()` → A-02 assertion slaagt

---

### Taak C.2 — Header-checkbox ARIA-label dynamisch bijwerken

**Metriek:** A-06 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — `aria-label` en `aria-checked` worden dynamisch bijgewerkt
**Bestand:** `dashboard.html`, functie `updateHeaderCheckbox()` (regel ~2149)

**Probleem:**
`updateHeaderCheckbox()` werkt de visuele staat van de checkbox bij (className)
maar werkt het `aria-label`-attribuut niet bij. Screen readers lezen daardoor
een verouderd label (bijv. "Selecteer alles (0)" terwijl 15 rijen geselecteerd
zijn).

**Huidig:**
```js
function updateHeaderCheckbox() {
  var cb = document.getElementById('header-cb');
  if (!cb) return;
  var n = selectedRows.size;
  var total = (_derived.filteredData || []).length;
  var allSel = n > 0 && n === total;
  var someSel = n > 0 && n < total;
  cb.className = 'header-cb' + (allSel ? ' checked' : someSel ? ' partial' : '');
  // ← aria-label wordt NIET bijgewerkt
}
```

**Fix:**
```js
function updateHeaderCheckbox() {
  var cb = document.getElementById('header-cb');
  if (!cb) return;
  var n = selectedRows.size;
  var total = (_derived.filteredData || []).length;
  var allSel = n > 0 && n === total;
  var someSel = n > 0 && n < total;
  cb.className = 'header-cb' + (allSel ? ' checked' : someSel ? ' partial' : '');

  // Dynamisch ARIA-label bijwerken
  var label = allSel
    ? 'Deselecteer alles (' + n + ' geselecteerd)'
    : someSel
      ? n + ' van ' + total + ' geselecteerd — klik voor alles'
      : 'Selecteer alles (' + total + ' rijen)';
  cb.setAttribute('aria-label', label);
  cb.setAttribute('aria-checked', allSel ? 'true' : someSel ? 'mixed' : 'false');
}
```

**Verificatie:**
1. Selecteer 5 rijen → screen reader kondigt "5 van X geselecteerd" aan
2. Selecteer alles → screen reader kondigt "Deselecteer alles" aan
3. Deselecteer alles → screen reader kondigt "Selecteer alles" aan
4. Axe DevTools → geen ARIA-label warning op header-checkbox

---

### Taak C.3 — Kleurcontrast meten en vastleggen (WCAG AA)

**Metriek:** A-05 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — v0.28.0
**Bestand:** `dashboard.html`, CSS-sectie (`--text`, `--bg`, `--accent`, etc.)

**Aanpak:**
1. Open dashboard in Chrome
2. DevTools → Lighthouse → Accessibility audit → noteer contrast-scores
3. Identificeer CSS-variabelen met ratio < 4.5:1
4. Pas kleuren aan tot ratio ≥ 4.5:1

**Te controleren combinaties:**
| Element | Foreground var | Background var | Minimale ratio |
|---|---|---|---|
| Tabel-tekst | `--text` | `--bg` | 4.5:1 |
| Kolomheader | `--text-muted` | `--surface` | 4.5:1 |
| Actieve status-badge | `--accent` (tekst) | badge-achtergrond | 4.5:1 |
| Disabled/muted tekst | `--text-muted` | `--bg` | 3:1 (groot formaat) |
| Focus-ring | `--accent` | omliggende achtergrond | 3:1 |

**Fix-patroon (voorbeeld):**
```css
/* Voor: --text-muted te licht op --surface */
--text-muted: #999;     /* ratio 2.8:1 — FAIL */

/* Na: */
--text-muted: #767676;  /* ratio 4.54:1 — PASS AA */
```

**Verificatie:**
1. Lighthouse Accessibility score ≥ 90
2. Geen contrast-fouten in Axe DevTools
3. Documenteer vastgestelde ratio's in CSS-commentaar

---

### Taak C.4 — Rij-Enter opent modal (keyboard-navigatie)

**Metriek:** A-02 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — v0.28.0
**Bestand:** `dashboard.html`, functie `rowHtml()` (regel ~1750)

**Probleem:**
Tabelrijen zijn klikbaar om een detail-modal te openen, maar hebben geen
keyboard-handler. Toetsenbordgebruikers kunnen via Tab een rij bereiken
(als `tabindex="0"` aanwezig is) maar niet activeren via Enter.

**Huidig:**
```js
// In rowHtml():
'<tr onclick="openModal(\'' + escapeAttr(rowKey) + '\')" ...>'
```

**Fix:**
```js
'<tr '
+ 'onclick="openModal(\'' + escapeAttr(rowKey) + '\')" '
+ 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();'
+   'openModal(\'' + escapeAttr(rowKey) + '\');}" '
+ 'tabindex="0" '
+ 'role="row" '
+ 'aria-label="' + escapeAttr(r.name || rowKey) + ' — druk Enter voor details" '
+ '>'
```

**Verificatie:**
1. Tab naar een rij → focus-indicator zichtbaar op rij
2. Druk Enter → modal opent met correcte rij-data
3. Escape → modal sluit, focus terug op rij
4. Keyboard-score in checklist: 8/8 (was 6/8)

---

## 5. Sprint D — Testbaarheid

**Doel:** Verhoog het aantal aantoonbaar geteste code-paden.
**Geschatte omvang:** Klein-middel (1–2 dagen)

---

### Taak D.1 — Voeg 20 extra assertions toe aan `runTests()`

**Metriek:** T-02, T-03 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — 128 assertions aanwezig (doel ≥ 80)
**Bestand:** `dashboard.html`, functie `runTests()` (regel ~3101)

**Toe te voegen assertions (compleet blok):**

```js
// --- BLOK: Filter-logica edge cases ---

// gt/lt met niet-numerieke waarden
(function() {
  var r = { budget: 'niet-een-getal' };
  var rule = { field: 'budget', op: 'gt', value: '100' };
  assert(matchRule(r, rule) === false, 'matchRule gt: niet-numeriek → false');
})();

(function() {
  var r = { budget: 200 };
  var rule = { field: 'budget', op: 'lt', value: '100' };
  assert(matchRule(r, rule) === false, 'matchRule lt: 200 < 100 → false');
})();

(function() {
  var r = { budget: 50 };
  var rule = { field: 'budget', op: 'lt', value: '100' };
  assert(matchRule(r, rule) === true, 'matchRule lt: 50 < 100 → true');
})();

// empty / not_empty
(function() {
  var r = { note: '' };
  assert(matchRule(r, { field: 'note', op: 'empty' }) === true, 'matchRule empty: lege string → true');
  assert(matchRule(r, { field: 'note', op: 'not_empty' }) === false, 'matchRule not_empty: lege string → false');
})();

(function() {
  var r = { note: null };
  assert(matchRule(r, { field: 'note', op: 'empty' }) === true, 'matchRule empty: null → true');
})();

(function() {
  var r = { note: 'tekst' };
  assert(matchRule(r, { field: 'note', op: 'not_empty' }) === true, 'matchRule not_empty: tekst → true');
})();

// not_contains
(function() {
  var r = { name: 'Jan de Vries' };
  var rule = { field: 'name', op: 'not_contains', value: 'Piet' };
  assert(matchRule(r, rule) === true, 'matchRule not_contains: ontbrekende waarde → true');
})();

// AND / OR filter-logica
(function() {
  var row = { status: 'Actief', priority: 'Hoog' };
  var rules = [
    { field: 'status', op: 'equals', value: 'Actief' },
    { field: 'priority', op: 'equals', value: 'Laag' }
  ];
  assert(matchRules(row, rules, 'AND') === false, 'AND filter: één niet-match → false');
  assert(matchRules(row, rules, 'OR') === true,  'OR filter: één match → true');
})();

// --- BLOK: Cache-key correctheid (C-04) ---
(function() {
  var backup = Object.assign({}, colFilters);
  colFilters['status'] = new Set(['Actief']);
  var key1 = _getUniqueCacheKey();
  colFilters['status'] = new Set(['Actief', 'Gepland']);
  var key2 = _getUniqueCacheKey();
  assert(key1 !== key2, 'C-04: cache-key verschilt bij andere Set-inhoud');
  colFilters = backup;
})();

// --- BLOK: escapeHtml (beveiliging) ---
(function() {
  assert(escapeHtml('<script>') === '&lt;script&gt;', 'escapeHtml: < en > gescaped');
  assert(escapeHtml('"tekst"') === '&quot;tekst&quot;', 'escapeHtml: aanhalingstekens gescaped');
  assert(escapeHtml('&') === '&amp;', 'escapeHtml: ampersand gescaped');
  assert(escapeHtml('') === '', 'escapeHtml: lege string → lege string');
  assert(escapeHtml(null) === '', 'escapeHtml: null → lege string');
})();

// --- BLOK: _searchStr aanwezig op rijen ---
(function() {
  var rows = getData(0);
  assert(rows.length > 0, '_searchStr test: dataset niet leeg');
  assert(typeof rows[0]._searchStr === 'string', 'rij[0]._searchStr is een string');
  assert(rows[0]._searchStr.length > 0, 'rij[0]._searchStr niet leeg');
})();

// --- BLOK: avatarCache bounded ---
(function() {
  var size = AppState._cache.avatar.size;
  assert(size <= 150, 'M-05: avatarCache ≤ 150 entries (was: ' + size + ')');
})();
```

**Verificatie:**
- `runTests()` → alle nieuwe assertions slagen
- Totaal assertions: ≥ 80 (was 60)
- Geen regressie op bestaande assertions

---

### Taak D.2 — Isoleer DOM-afhankelijkheden uit pure functies

**Metriek:** T-05 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.29.0
**Bestand:** `dashboard.html`, diverse functies

**Probleem:**
9 functies die logisch "puur" zouden moeten zijn (berekeningen, data-transformaties)
roepen `document.getElementById()` aan. Dit maakt ze niet testbaar zonder een
volledige DOM.

**Te refactoren functies:**

| Functie | DOM-oproep | Oplossing |
|---|---|---|
| `computeFilteredData()` | `getElementById('search-input').value` | Parameter meegeven |
| `getAllUniqueNames()` | `getElementById('name-filter').value` | Aanroeper leest DOM |
| `initGlobalNameFilter()` | `getElementById('name-filter')` | OK — is UI-initialisatie |
| `_getUniqueCacheKey()` | indirect via globals | Geen DOM — al OK na A.1 |

**Fix-patroon voor `computeFilteredData()`:**

```js
// VOOR:
function computeFilteredData() {
  var search = document.getElementById('search-input').value.trim().toLowerCase();
  // ...
}

// NA:
function computeFilteredData(searchOverride) {
  var el = document.getElementById('search-input');
  var search = searchOverride !== undefined
    ? searchOverride
    : (el ? el.value.trim().toLowerCase() : '');
  // ...
}
```

De aanroeper (`_renderInternal`) passeert niets → gedrag ongewijzigd.
In tests kan de functie worden aangeroepen met een expliciete zoekterm.

**Verificatie:**
- `computeFilteredData('amsterdam')` werkt zonder DOM → retourneert gefilterde data
- `runTests()` → T-05 assertion slaagt
- `document.getElementById`-count in pure functies: ≤ 5 (was 9)

---

### Taak D.3 — Isoleer `Math.random()` in data-factory

**Metriek:** T-06 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — `_randomFn`-variabele aanwezig, vervangbaar in tests
**Bestand:** `dashboard.html`, functies `rnd()`, `rndInt()`, `rndDate()` (regel ~280)

**Probleem:**
`Math.random()` wordt direct aangeroepen in data-generatie. Dit maakt tests
niet-deterministisch: elke testrun genereert andere data, waardoor
getal-gebaseerde assertions falen of inconsistent zijn.

**Fix:**

```js
// Vervangbare random-factory (default: Math.random)
var _randomFn = Math.random;

function rnd(min, max) {
  return min + _randomFn() * (max - min);
}
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}
function rndDate(from, to) {
  return new Date(rnd(from.getTime(), to.getTime()));
}

// In tests: vervang _randomFn door deterministische versie
// _randomFn = mulberry32(12345);  // seed-based RNG
```

**Verificatie:**
1. Zet `_randomFn = function() { return 0.5; }` → data is deterministisch
2. `runTests()` slaagt ongeacht seed
3. Productiegedrag ongewijzigd (`_randomFn = Math.random` is de default)

---

## 6. Sprint E — Onderhoudbaarheid & Config

**Doel:** Verwijder technische schuld en centraliseer configuratie.
**Geschatte omvang:** Middel (2–3 dagen)

---

### Taak E.1 — Verplaats `categoricalKeys`, `_ordinalOrders`, `_valTagColors` naar config

**Metriek:** O-07 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — v0.29.0
**Bestand:** `dashboard.html`, diverse locaties

**Probleem:**
Domein-configuratie staat verspreid door de code:
- `categoricalKeys` (regel ~955) — 24 veldnamen
- `_ordinalOrders` (regel ~1138) — ordening per veld
- `_valTagColors` — kleur per statuswaarde

Als een veld wordt hernoemd of verwijderd, moeten 3+ locaties worden bijgewerkt.

**Fix — voeg toe aan `dashboardConfig`:**

```js
var dashboardConfig = {
  // ...bestaande config...

  // Veld-categorisering voor aggregatie
  aggregation: {
    categoricalFields: new Set([
      'status','priority','directeur','aog','pm','cluster',
      'afdeling','functie','locatie','fase','risico','regio',
      'type','documentatie','programma','milieu','contract',
      'team','leidinggevende','opleiding','salSchaal','skills'
    ]),
    averageFields: new Set([
      'progress','capaciteit','budget','kostenRealisatie',
      'beoordeling','fte','stakeholders','uren','projecten',
      'beschikbaarheid','reisafstand','kantoorDagen','certificeringen'
    ]),
    booleanFields: new Set(['approved','actief'])
  },

  // Ordening voor ordinale velden (filter/sort)
  ordinalOrders: {
    priority: ['Hoog', 'Middel', 'Laag'],
    fase: ['Initiatief', 'Definitie', 'Ontwerp', 'Realisatie', 'Afsluiting'],
    risico: ['Laag', 'Middel', 'Hoog'],
    beoordeling: ['Onvoldoende', 'Matig', 'Goed', 'Uitstekend']
  },

  // Tag-kleuren per veld en waarde
  tagColors: {
    status: {
      'Actief':    { bg: 'var(--success-bg)', text: 'var(--success)' },
      'Gepland':   { bg: 'var(--info-bg)',    text: 'var(--info)' },
      'On Hold':   { bg: 'var(--warn-bg)',    text: 'var(--warn)' },
      'Afgerond':  { bg: 'var(--muted-bg)',   text: 'var(--text-muted)' }
    },
    priority: {
      'Hoog':   { bg: 'var(--danger-bg)', text: 'var(--danger)' },
      'Middel': { bg: 'var(--warn-bg)',   text: 'var(--warn)' },
      'Laag':   { bg: 'var(--muted-bg)', text: 'var(--text-muted)' }
    }
  }
};
```

Vervang alle verwijzingen naar de losse variabelen door `dashboardConfig.*`.

**Verificatie:**
1. Grep `categoricalKeys\|_ordinalOrders\|_valTagColors` → 0 directe referenties buiten config
2. `runTests()` → geen regressie
3. Aggregatie, kleur-badges en sortering werken correct na verwijzing naar config

---

### Taak E.2 — Vervang hardcoded domeinstrings door constanten

**Metriek:** O-02 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.29.1
**Bestand:** `dashboard.html`, verspreide locaties

**Probleem:**
15 locaties bevatten hardcoded strings als `'Hoog'`, `'Actief'`, `'Initiatief'`
buiten de configuratie. Als een waarde wijzigt in het bronsysteem, worden niet
alle locaties bijgewerkt.

**Fix — voeg constanten-blok toe vóór de functie-definities:**

```js
// Domein-constanten (niet wijzigen zonder aanpassing in alle tabs)
var STATUS = {
  ACTIEF:   'Actief',
  GEPLAND:  'Gepland',
  ON_HOLD:  'On Hold',
  AFGEROND: 'Afgerond'
};

var PRIORITY = {
  HOOG:   'Hoog',
  MIDDEL: 'Middel',
  LAAG:   'Laag'
};

var FASE = {
  INITIATIEF: 'Initiatief',
  DEFINITIE:  'Definitie',
  ONTWERP:    'Ontwerp',
  REALISATIE: 'Realisatie',
  AFSLUITING: 'Afsluiting'
};
```

Vervang vervolgens alle inline string-literals door de constanten.

**Verificatie:**
1. Grep `'Hoog'\|'Actief'\|'Initiatief'` buiten config/constanten → ≤ 5 (was 15)
2. `runTests()` → geen regressie
3. Filter op Status=Actief → werkt correct

---

### Taak E.3 — Verwijder legacy `@deprecated` accessors

**Metriek:** O-06 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.31.0
**Bestand:** `dashboard.html`, regel ~916–929

**Probleem:**
De legacy accessor-laag (getter/setter-proxies die de oude global API nabootsen)
is nog steeds in gebruik door 3+ functies. Zolang deze accessors bestaan,
kan nieuwe code per ongeluk de deprecated API blijven gebruiken.

**Aanpak:**

1. Grep alle aanroepen van de deprecated globals:
   ```bash
   grep -n "window\.filterRules\|window\.sortRules\|window\.colFilters\|window\.selectedRows" dashboard.html
   ```

2. Vervang elke directe `window.X`-aanroep door `AppState.X`

3. Verwijder daarna de accessor-definitie (regel ~916–929):
   ```js
   // VERWIJDER dit blok:
   Object.defineProperty(window, 'filterRules', {
     get: function() { return AppState.filterRules; },
     set: function(v) { AppState.filterRules = v; },
     configurable: true
   });
   // ... (idem voor sortRules, colFilters, selectedRows, etc.)
   ```

**Verificatie:**
1. Grep `window\.filterRules\|window\.sortRules` → 0 hits
2. `Object.defineProperty` blok verwijderd → 0 hits
3. `runTests()` → geen regressie
4. Filter/sort/selectie werken correct

---

### Taak E.4 — Centraliseer sort-toggle logica

**Metriek:** R-04 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — v0.29.0
**Bestand:** `dashboard.html`, regel 2055 en regel 2523

**Probleem:**
`=== 'asc' ? 'desc' : 'asc'` staat op 2 locaties in functies met identieke
logica maar iets andere context. Een wijziging in de toggle-logica moet op
beide plekken worden doorgevoerd.

**Fix:**
```js
// Gedeelde helper — voeg toe bij andere utility-functies
function _toggleSortDir(dir) {
  return dir === 'asc' ? 'desc' : 'asc';
}
```

Vervang beide inline-expressies door `_toggleSortDir(rules[idx].dir)`.

**Verificatie:**
1. Grep `=== 'asc' ? 'desc' : 'asc'` → 0 hits (was 2)
2. Sort-toggle in kolomheader werkt correct (asc ↔ desc)
3. Sort-toggle in sort-panel werkt correct

---

### Taak E.5 — Centraliseer panel-render patroon

**Metriek:** R-03 | **Ernst:** 🟡 Middel | **Status:** ○ Uitgesteld — bewust (geen functionele impact)
**Bestand:** `dashboard.html`, functies `renderFilterPanel`, `renderSortPanel`, `renderGroupPanel`

**Probleem:**
Alle drie de panel-functies bouwen identieke HTML-structuur:
select-dropdown voor veld, select voor operator/richting, remove-knop.
Het patroon staat 3x herhaald met minimale variatie.

**Fix — gedeelde `renderRuleRow()` helper:**

```js
/**
 * Rendert één rij in een regel-gebaseerd panel (filter, sort, groep).
 * @param {Object} opts
 * @param {number} opts.index        - Rij-index
 * @param {string} opts.fieldValue   - Geselecteerde veld-waarde
 * @param {Array}  opts.fieldOptions - [{value, label}] voor veld-select
 * @param {string} opts.extraHtml    - Extra HTML na veld-select (bijv. operator-select)
 * @param {string} opts.removeFn     - JS-expressie voor remove-knop onclick
 * @returns {string} HTML-string
 */
function renderRuleRow(opts) {
  return '<div class="rule-row" data-index="' + opts.index + '">'
    + '<select onchange="' + opts.onFieldChange + '">'
    + opts.fieldOptions.map(function(o) {
        return '<option value="' + escapeAttr(o.value) + '"'
             + (o.value === opts.fieldValue ? ' selected' : '') + '>'
             + escapeHtml(o.label) + '</option>';
      }).join('')
    + '</select>'
    + opts.extraHtml
    + '<button class="rule-remove" onclick="' + opts.removeFn
    + '" aria-label="Verwijder regel">×</button>'
    + '</div>';
}
```

Refactor `renderFilterPanel`, `renderSortPanel` en `renderGroupPanel` om
`renderRuleRow()` te gebruiken.

**Verificatie:**
1. Filter-panel: regels toevoegen/verwijderen werkt correct
2. Sort-panel: regels toevoegen/verwijderen werkt correct
3. Groep-panel: groepvelden toevoegen/verwijderen werkt correct
4. HTML-output is visueel identiek aan vóór de refactoring

---

## 7. Sprint F — Browsercompatibiliteit

**Doel:** Documenteer en valideer browserondersteuning.
**Geschatte omvang:** Klein (< 1 dag)

---

### Taak F.1 — Documenteer minimale browser-vereisten

**Metriek:** B-01 | **Ernst:** 🔴 Kritiek | **Status:** ✓ Afgerond — v0.30.0
**Bestand:** `dashboard.html`, `<head>` sectie + README/commentaar

**Probleem:**
8 ES6+-API's worden gebruikt zonder polyfill of documentatie van minimale
browser-vereisten. Gebruikers met oudere browsers krijgen een stille fout.

**Gebruikte ES6+-API's (te documenteren):**

| API | Introductiedatum | Minimale versie |
|---|---|---|
| `Map` | ES6 (2015) | Chrome 38, Firefox 13, Safari 8 |
| `Set` | ES6 (2015) | Chrome 38, Firefox 13, Safari 8 |
| `String.prototype.includes()` | ES6 (2015) | Chrome 41, Firefox 40, Safari 9 |
| `Object.entries()` | ES2017 | Chrome 54, Firefox 47, Safari 10.1 |
| `Object.assign()` | ES6 (2015) | Chrome 45, Firefox 34, Safari 9 |
| `Array.from()` | ES6 (2015) | Chrome 45, Firefox 32, Safari 9 |
| `Array.prototype.findIndex()` | ES6 (2015) | Chrome 45, Firefox 25, Safari 9 |
| `requestAnimationFrame` | 2011 | Chrome 24, Firefox 23, Safari 6.1 |

**Conclusie minimale vereisten:**
- Chrome ≥ 54
- Firefox ≥ 47
- Safari ≥ 10.1
- Edge ≥ 14

**Fix — voeg toe aan `<head>`:**

```html
<!--
  Browser-vereisten: Chrome ≥ 54, Firefox ≥ 47, Safari ≥ 10.1, Edge ≥ 14
  Gebruikt: ES6 Map/Set, Object.entries(), requestAnimationFrame
  Geen IE11-ondersteuning.
-->
```

**Optioneel: runtime-check bij opstarten:**

```js
function _checkBrowserSupport() {
  var ok = typeof Map !== 'undefined'
         && typeof Set !== 'undefined'
         && typeof Object.entries === 'function'
         && typeof requestAnimationFrame === 'function';
  if (!ok) {
    document.body.innerHTML = '<p style="padding:2rem;color:red">'
      + 'Deze applicatie vereist een moderne browser (Chrome ≥ 54, Firefox ≥ 47, Safari ≥ 10.1).'
      + '</p>';
  }
  return ok;
}

// In initApp():
if (!_checkBrowserSupport()) return;
```

**Verificatie:**
1. Commentaar aanwezig in `<head>`
2. Browser-check gooit geen false positives in Chrome/Firefox/Safari/Edge
3. In gesimuleerde oude browser (via DevTools UA-override) → foutmelding getoond

---

### Taak F.2 — Update XLSX CDN naar actuele versie + SRI hash

**Metriek:** B-05 | **Ernst:** 🟠 Hoog | **Status:** ✓ Afgerond — v0.30.0
**Bestand:** `dashboard.html`, lazy-load functie voor XLSX (regel ~2947)

**Probleem:**
XLSX versie 0.18.5 dateert uit 2023. Nieuwere versies bevatten bugfixes
en security-patches. Bovendien ontbreekt een SRI (Subresource Integrity) hash,
waardoor een gecompromitteerde CDN onopgemerkt kwaadaardige code kan leveren.

**Huidig:**
```js
s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
```

**Fix:**

1. Zoek de actuele versie op cdnjs.cloudflare.com/libraries/xlsx
2. Genereer de SRI hash:
   ```bash
   curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
     | openssl dgst -sha384 -binary | openssl base64 -A
   ```
3. Pas de code aan:
   ```js
   s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/X.Y.Z/xlsx.full.min.js';
   s.integrity = 'sha384-<gegenereerde-hash>';
   s.crossOrigin = 'anonymous';
   ```

**Verificatie:**
1. Excel-export werkt correct na update
2. DevTools → Network → XLSX-request → `integrity` header aanwezig
3. Bij gemanipuleerd CDN-bestand → browser blokkeert laden (test via lokale proxy)

---

### Taak F.3 — `requestAnimationFrame` fallback of browsereis documenteren

**Metriek:** B-03 | **Ernst:** 🟡 Middel | **Status:** ✓ Afgerond — v0.30.0 (Keuze A)
**Bestand:** `dashboard.html`, 6 aanroepen van `requestAnimationFrame`

**Keuze A: documenteer als browsereis (aanbevolen)**

`requestAnimationFrame` is ondersteund vanaf Chrome 24 (2012), dus alle
moderne browsers ondersteunen het. Documenteer als vereiste (zie Taak F.1).
Geen code-wijziging nodig.

**Keuze B: voeg fallback toe (voor maximale compatibiliteit)**

```js
// Polyfill voor requestAnimationFrame (eenmalig, vóór eerste gebruik)
window.requestAnimationFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || function(cb) { return setTimeout(cb, 16); };

window.cancelAnimationFrame = window.cancelAnimationFrame
  || function(id) { clearTimeout(id); };
```

**Aanbeveling:** Kies Keuze A. Voeg de documentatie toe aan Taak F.1.
Keuze B is alleen nodig als Safari < 6.1 of Android Browser 2.x moet worden
ondersteund (niet het geval voor gemeentelijk intranet).

**Verificatie:**
- Keuze A: documentatie aanwezig (zie Taak F.1)
- Keuze B: virtual scrolling werkt correct na polyfill

---

## 8. Takenlijst (alle sprints)

Gebruik dit als gestructureerde checklist voor project-tracking:

```
Legenda: [x] Afgerond  [ ] Uitgesteld

SPRINT A — Correctheid & Beveiliging
  [x] A.1  Fix _searchStr undefined crash                  ← v0.26.0
  [x] A.2  Fix XSS in mono renderer (col.suffix)          ← v0.26.0
  [x] A.3  Fix HTML-export onveilige data                  ← v0.26.0
  [x] A.4  Fix tagFilter() op.is → op.equals              ← v0.26.0
  [x] A.5  Dedupliceer parseFloat in matchRule             ← v0.26.0
  [x] A.6  Voeg Content Security Policy toe                ← v0.26.0

SPRINT B — Geheugen & Koppeling
  [x] B.1  Fix _gvScrollBound duplice listeners            ← flag-check aanwezig
  [x] B.2  Begrens avatarCache (max 150)                   ← v0.27.0
  [x] B.3  Reduceer AppState-mutaties in render-functies   ← v0.27.1
  [x] B.4  Voeg size-check toe aan _uniqueValueCache       ← v0.27.0

SPRINT C — Toegankelijkheid
  [x] C.1  Kolom-filter-knop keyboard bereikbaar           ← v0.28.0
  [x] C.2  Header-checkbox ARIA-label dynamisch            ← aria-label + aria-checked
  [x] C.3  Kleurcontrast meten en vastleggen               ← v0.28.0
  [x] C.4  Rij-Enter opent modal                           ← v0.28.0

SPRINT D — Testbaarheid
  [x] D.1  20 extra assertions in runTests()               ← 128 assertions aanwezig
  [x] D.2  Isoleer DOM-afhankelijkheden uit pure functies  ← v0.29.0
  [x] D.3  Isoleer Math.random() in data-factory           ← _randomFn variabele aanwezig

SPRINT E — Onderhoudbaarheid & Config
  [x] E.1  Verplaats categoricalKeys e.a. naar config      ← v0.29.0
  [x] E.2  Vervang hardcoded domeinstrings door constanten ← v0.29.1
  [x] E.3  Verwijder legacy @deprecated accessors          ← v0.31.0
  [x] E.4  Centraliseer sort-toggle logica                 ← v0.29.0
  [ ] E.5  Centraliseer panel-render patroon               ← uitgesteld (geen functionele impact)

SPRINT F — Browsercompatibiliteit
  [x] F.1  Documenteer minimale browser-vereisten          ← v0.30.0
  [x] F.2  Update XLSX CDN + SRI hash                     ← v0.30.0
  [x] F.3  requestAnimationFrame fallback of documentatie  ← v0.30.0 (Keuze A)

Totaal (v0.31.0): 24 afgerond · 0 deels · 1 uitgesteld van 25 taken
```

---

## 9. Acceptatiecriteria per sprint

| Sprint | Klaar als... |
|---|---|
| **A** | `runTests()` 0 fails, XSS-tests slagen, CSP aanwezig |
| **B** | DevTools toont 1 scroll-listener per container, `avatarCache.size` ≤ 150 |
| **C** | Keyboard-score 8/8, Axe DevTools 0 errors, 0 ARIA-warnings op checkbox |
| **D** | `runTests()` ≥ 80 assertions, `document.getElementById` buiten render ≤ 5 |
| **E** | Grep `categoricalKeys` buiten config → 0, grep deprecated → 0 |
| **F** | Browser-commentaar aanwezig, XLSX-export werkt, SRI hash aanwezig |

---

*Implementatieplan gebaseerd op TOETSINGSKADER.md v1.0*
*25 taken over 6 sprints — 6 kritiek, 12 hoog, 7 middel*
*Status v0.31.0: 24 afgerond · 0 deels · 1 uitgesteld (E.5 — bewust, geen functionele impact)*
*Gebruik PERFORMANCE_PLAN.md voor de performance-specifieke taken (P1–P7) — volledig afgerond.*
