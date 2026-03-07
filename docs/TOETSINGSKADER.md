# Toetsingskader — Nulmetingen & Impactmetingen
## Dashboard Gemeente Rotterdam v0.14.0

**Datum:** 2026-03-07
**Basis:** Statische code-analyse over 10 dimensies (64 bevindingen)
**Doel:** Objectief meten van de begintoestand (nulmeting) en de impact van
elke codewijziging (impactmeting), zodat regressie én verbetering aantoonbaar zijn.

---

## Inhoudsopgave

1. [Structuur van het kader](#1-structuur-van-het-kader)
2. [Dimensie 1 — Correctheid](#2-dimensie-1--correctheid)
3. [Dimensie 2 — Complexiteit](#3-dimensie-2--complexiteit)
4. [Dimensie 3 — Koppeling & Cohesie](#4-dimensie-3--koppeling--cohesie)
5. [Dimensie 4 — Herbruikbaarheid](#5-dimensie-4--herbruikbaarheid)
6. [Dimensie 5 — Testbaarheid](#6-dimensie-5--testbaarheid)
7. [Dimensie 6 — Beveiliging](#7-dimensie-6--beveiliging)
8. [Dimensie 7 — Toegankelijkheid](#8-dimensie-7--toegankelijkheid)
9. [Dimensie 8 — Browsercompatibiliteit](#9-dimensie-8--browsercompatibiliteit)
10. [Dimensie 9 — Geheugen](#10-dimensie-9--geheugen)
11. [Dimensie 10 — Onderhoudbaarheid](#11-dimensie-10--onderhoudbaarheid)
12. [Dimensie 11 — Performance (runtime)](#12-dimensie-11--performance-runtime)
13. [Gecombineerde scoringsmatrix](#13-gecombineerde-scoringsmatrix)
14. [Meetprotocol](#14-meetprotocol)
15. [Automatiseringsadvies](#15-automatiseringsadvies)

---

## 1. Structuur van het kader

Elke dimensie heeft:

| Onderdeel | Beschrijving |
|---|---|
| **Metriek** | Wat wordt gemeten |
| **Methode** | Hoe de meting wordt uitgevoerd |
| **Nulmeting** | Huidige waarde (v0.14.0) |
| **Drempelwaarde** | Minimaal acceptabel niveau |
| **Streefwaarde** | Gewenst niveau na implementatie |
| **Meetmoment** | Wanneer meten (voor/na commit, per sprint) |

### Ernst-schaal

| Code | Label | Definitie |
|---|---|---|
| 🔴 | Kritiek | Incorrecte output, security-risico, crash |
| 🟠 | Hoog | Significante degradatie, gebruikerszichtbaar |
| 🟡 | Middel | Technische schuld, beperkte impact |
| 🟢 | Laag | Stijl, naamgeving, kleine inconsistenties |

---

## 2. Dimensie 1 — Correctheid

> *"Doet de code wat het hoort te doen, ook in randgevallen?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| C-01 | Falende assertions in `runTests()` | Uitvoeren in browser console | **0 / 60+ tests** | 0 fails | 0 fails |
| C-02 | Bekende logische bugs (gedocumenteerd) | Handmatige code-review + issue-lijst | **5 open bugs** (BUG-011 t/m BUG-015) | ≤ 2 | 0 |
| C-03 | `_searchStr` undefined-errors bij zoeken | Zoeken met lege dataset → geen throw | **Niet getest** | 0 throws | 0 throws |
| C-04 | Cache-key collision (Set-serialisatie bug) | Kolomfilter instellen → aantallen kloppen | **Bug aanwezig** (regel 1602) | Geen collision | Geen collision |
| C-05 | `tagFilter()` op niet-bestaand operator `is` | Filter op tag instellen → resultaat klopt | **Mogelijk verkeerd** | Correct filter | Correct filter |
| C-06 | `matchRule` duplice parseFloat (gt/lt) | Code-inspectie regel 1097–1101 | **Dubbel aanwezig** | 0 duplicaten | 0 duplicaten |

### Meetprocedure

```
Nulmeting:
  1. Open dashboard in browser
  2. Open DevTools Console
  3. Klik "🧪 Tests" knop (btn-test, verborgen in productie → toon via resetView())
  4. Noteer: X van Y tests geslaagd
  5. Test C-04: Zet kolomfilter Status=Actief → open filter opnieuw → tel aantallen
  6. Test C-03: Wis alle data van tab (mock) → zoek → geen console-error

Impactmeting (na elke commit):
  - Herhaal stap 1–6
  - Vergelijk met nulmeting
  - Regressie = meer fails dan nulmeting
```

---

## 3. Dimensie 2 — Complexiteit

> *"Hoe moeilijk is de code te begrijpen en aan te passen?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| X-01 | Gemiddelde functielengte (regels) | `grep -n "^function\|= function" \| wc -l` + totale JS-regels | **~19 regels/functie** | ≤ 25 | ≤ 15 |
| X-02 | Langste functie (regels) | Handmatige inspectie top-5 | **`_renderInternal`: 83 regels** | ≤ 60 | ≤ 40 |
| X-03 | Maximale nesting-diepte | Code-inspectie | **5 niveaus** (`flattenVisibleGroupTree`) | ≤ 5 | ≤ 4 |
| X-04 | Aantal functies > 40 regels | Grep + tel | **8 functies** | ≤ 5 | ≤ 3 |
| X-05 | McCabe complexiteit top-3 functies | Handmatig tellen branches | `renderVirtualBody`: ~5, `_renderInternal`: ~8, `flattenVisibleGroupTree`: ~6 | Max 10 per functie | Max 7 |
| X-06 | Hardcoded getallen zonder constante | Grep op `[0-9]\+px\|[0-9]\+ms` | **23 gevallen** | ≤ 10 | ≤ 5 |

### Meetprocedure

```bash
# Nulmeting X-01: gemiddelde functielengte
grep -c "^function \|= function(" dashboard.html   # aantal functies
wc -l < <(sed -n '/<script>/,/<\/script>/p' dashboard.html)  # JS-regels

# Nulmeting X-04: functies > 40 regels (handmatig top-N)
# Tel regels tussen "function naam" en de sluitende "}" op hetzelfde niveau

# Nulmeting X-06: magische getallen
grep -oE '[0-9]+px|[0-9]+ms' dashboard.html | wc -l
```

---

## 4. Dimensie 3 — Koppeling & Cohesie

> *"Hoe sterk zijn onderdelen van elkaar afhankelijk?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| K-01 | Aantal directe global-state reads per functie (top-5) | Code-inspectie | **Gem. 6 globals/functie** | ≤ 4 | ≤ 2 |
| K-02 | Aantal functies die `AppState` direct muteren | Grep `AppState\.[a-z]` in assignments | **47 functies** | ≤ 30 | ≤ 20 |
| K-03 | State-dubbeling: per-tab viewState vs. AppState | Inspectie `saveTabViewState` | **10 properties dubbel opgeslagen** | ≤ 6 | ≤ 3 |
| K-04 | Functies met > 1 verantwoordelijkheid (SRP-schendingen) | Handmatige review | **12 functies** | ≤ 6 | ≤ 3 |
| K-05 | Aantal scroll-listeners per tab-container | DevTools → Event Listeners tab | **2 per container** (flat + grouped) | ≤ 2 | 1 |

### Meetprocedure

```bash
# Nulmeting K-02
grep -c "AppState\.[a-zA-Z_]*\s*=" dashboard.html

# Nulmeting K-01 (handmatig voorbeeld voor applyFiltersToData):
# Tel: globalNameFilter, currentTab, colFilters, filterRules, filterLogic = 5 globals

# Nulmeting K-05 (in browser):
# DevTools → Elements → selecteer #tc-0 → Event Listeners tab → tel scroll-entries
```

---

## 5. Dimensie 4 — Herbruikbaarheid

> *"Hoeveel code is meerdere keren geschreven?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| R-01 | Duplice codeblokken (≥ 5 regels identiek) | Handmatige inspectie + grep | **6 patronen** | ≤ 3 | 0 |
| R-02 | Inline HTML-string building functies | Grep `html\s*+=\|html\s*=\s*'` | **14 locaties** | ≤ 8 | ≤ 4 |
| R-03 | Panel-render functies zonder gedeeld template | Inspectie renderFilterPanel, renderSortPanel, renderGroupPanel | **3 identieke patronen** | ≤ 1 | 0 |
| R-04 | Sorteer-toggle logica duplicaat | Grep `=== 'asc' ? 'desc' : 'asc'` | **2 locaties** (regel 2055 + 2523) | ≤ 1 | 1 (gecentraliseerd) |
| R-05 | Cell-render dispatch buiten `cellRenderers` registry | Grep `col.renderer\|col.key` buiten cellRenderers | **2 locaties** (`renderCell` + `plainVal`) | ≤ 1 | 1 (gedeeld) |

### Meetprocedure

```bash
# Nulmeting R-04
grep -n "=== 'asc' ? 'desc' : 'asc'" dashboard.html

# Nulmeting R-02
grep -n "html\s*+=" dashboard.html | wc -l

# Nulmeting R-03 (handmatig)
# Tel regels in renderFilterPanel, renderSortPanel, renderGroupPanel
# die structureel identiek zijn (select-building, remove-button, apply-button)
```

---

## 6. Dimensie 5 — Testbaarheid

> *"Hoe eenvoudig is het om gedrag te verifiëren?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| T-01 | Aantal testbare pure functies (geen DOM, geen globals) | Handmatige inspectie | **~18 functies** | ≥ 25 | ≥ 40 |
| T-02 | Aantal `runTests()` assertions | Tel in `runTests()` functie | **60 assertions** | ≥ 60 | ≥ 80 |
| T-03 | Test-coverage van filter-logica | Assertions voor `matchRule` edge cases | **4 cases** (contains, equals, gt, lt) | ≥ 8 | ≥ 12 |
| T-04 | Test-coverage van render-pipeline | Assertions die `render()` aanroepen | **0** (render vereist DOM) | ≥ 3 (mock DOM) | ≥ 10 |
| T-05 | Functies met hidden DOM-dependency | Grep `document.getElementById` in niet-render functies | **9 functies** | ≤ 5 | ≤ 3 |
| T-06 | Functies met `Math.random()` (niet-deterministisch) | Grep `Math.random` | **2 data-generator functies** | ≤ 2 (geïsoleerd) | Geïsoleerd in factory |

### Meetprocedure

```bash
# Nulmeting T-01: pure functies (geen document., geen AppState, geen globals)
# Handmatig: escapeHtml, escapeAttr, dateFmt, budgetFmt, matchRule, sortData,
#            groupData, condClass, getRowH, rnd, rndInt, rndDate = 12 pure
# + cellRenderers functies = +6 = 18 totaal

# Nulmeting T-02
grep -c "assert\|assertEqual\|assertTrue" dashboard.html

# Nulmeting T-05
grep -c "document\.getElementById" dashboard.html
```

---

## 7. Dimensie 6 — Beveiliging

> *"Kan kwaadaardige input de applicatie of gebruiker schaden?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| S-01 | Cell renderers die `escapeHtml` missen | Inspectie `cellRenderers` object (14 entries) | **1 renderer** (`mono` col.suffix) | 0 | 0 |
| S-02 | `innerHTML` assignments zonder escaping | Grep `innerHTML\s*=` zonder voorafgaande `escapeHtml` | **3 directe** (panel.innerHTML in rebuildColFilter, agg.innerHTML, modal) | 0 directe | 0 |
| S-03 | Inline event handlers met `escapeAttr` | Grep `onclick=".*escapeAttr` | **11 handlers** (juist gescaped) | 100% gescaped | 100% gescaped |
| S-04 | CSS-suffix injection in renderers | Inspectie col.suffix handling | **1 ongescaped** (mono renderer) | 0 | 0 |
| S-05 | Export-functies met onveilige data | Inspectie `plainVal()` in exporters | **HTML-export** onveilig | 0 | 0 |
| S-06 | Content Security Policy aanwezig | Inspectie `<meta http-equiv="CSP">` | **Geen CSP** | CSP aanwezig | Strict CSP |

### Meetprocedure

```bash
# Nulmeting S-01: cel-renderers zonder escaping
# Handmatig: inspecteer alle 14 entries in cellRenderers object
# Let op: mono renderer retourneert col.suffix direct

# Nulmeting S-02
grep -n "\.innerHTML\s*=" dashboard.html | grep -v "escapeHtml"

# Nulmeting S-03
grep -c 'onclick=".*escapeAttr' dashboard.html

# Nulmeting S-06
grep -c 'Content-Security-Policy' dashboard.html
```

### Testcases XSS (handmatig)

```
Nulmeting XSS-test:
  1. Voeg in data een naam toe: <img src=x onerror=alert(1)>
  2. Zoek ernaar → wordt het uitgevoerd?
  3. Filter op die naam → modal openen → XSS?
  4. Exporteer als HTML → open bestand → XSS?

Resultaat nulmeting: [ ] XSS-vrij  [X] Gedeeltelijk (export HTML onveilig)
```

---

## 8. Dimensie 7 — Toegankelijkheid

> *"Kan iedereen de applicatie gebruiken, ook met hulptech­nologie?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| A-01 | ARIA-labels op interactieve elementen | Axe DevTools audit | **3 warnings** | 0 errors, ≤ 3 warnings | 0 errors, 0 warnings |
| A-02 | Keyboard-navigatie compleet | Handmatige Tab/Enter/Escape test | **Panels bereikbaar**, filter-knop per kolom **niet keyboard** | Alle primaire acties | Alle acties |
| A-03 | Focus-trap werkt in open panels | Tab door open panel → focust niet buiten | **Geïmplementeerd** (regel 2260) | Correcte trap | Correcte trap + visuele focus-indicator |
| A-04 | Live-region aankondigingen | Screen reader test op zoeken/filteren | **Toast en ARIA-live aanwezig** | Alle state-changes | Alle state-changes |
| A-05 | Kleurcontrast ratio (WCAG AA) | Browser DevTools accessibility audit | **Niet gemeten** | ≥ 4.5:1 voor tekst | ≥ 4.5:1 |
| A-06 | Header-checkbox ARIA-label dynamisch | Inspectie `updateHeaderCheckbox()` | **Niet bijgewerkt** na state-change (regel 2149–2155) | Dynamisch bijgewerkt | Dynamisch bijgewerkt |

### Meetprocedure

```
Nulmeting A-02 (keyboard-navigatie checklist):
  [ ] Tab naar zoekbalk → werkt
  [ ] Tab naar filter-knop → Enter → panel opent
  [ ] Tab door filter-panel → alle velden bereikbaar
  [ ] Escape → panel sluit
  [ ] Tab naar kolomheader → Enter → sort toggle
  [ ] Tab naar kolom-filter-knop (▼) → Enter → filter panel
  [ ] Tab naar rij → Enter → modal opent
  [ ] Escape → modal sluit

Score nulmeting: 6/8 (2 falen: kolom-filter-knop, rij-enter)
```

---

## 9. Dimensie 8 — Browsercompatibiliteit

> *"Werkt de applicatie in alle beoogde browsers?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| B-01 | ES6+ API gebruik zonder polyfill | Grep `new Map\|new Set\|\.includes\|\.entries\|Object\.assign` | **8 API's** zonder polyfill | Gedocumenteerde browsereis | Expliciet in README |
| B-02 | `requestIdleCallback` zonder fallback | Grep `requestIdleCallback` | **0** (niet gebruikt) | Fallback aanwezig | Fallback aanwezig |
| B-03 | `requestAnimationFrame` zonder fallback | Grep `requestAnimationFrame` | **6 aanroepen**, geen fallback | Fallback of `>= Chrome 24` | Fallback of documentatie |
| B-04 | Externe CDN-afhankelijkheden | Tel `<script src=` en `<link href=http` | **2** (Google Fonts + XLSX CDN) | ≤ 2 met versie-pinning | ≤ 2, versie gepind, SRI hash |
| B-05 | XLSX CDN versie actueel | Inspectie `xlsx.full.min.js` versie | **0.18.5** (2023) | Actueel ± 1 minor | Meest recent + SRI |
| B-06 | `performance.memory` zonder guard | Grep `performance.memory` | **0** (niet gebruikt) | Guard aanwezig indien gebruikt | N.v.t. |

### Meetprocedure

```bash
# Nulmeting B-01: ES6 API's zonder polyfill
grep -n "new Map()\|new Set()\|\.includes(\|Object\.assign\|Object\.entries\|\.findIndex\|\.from(" dashboard.html \
  | grep -v "polyfill\|// " | wc -l

# Nulmeting B-04
grep -c "cdnjs\|googleapis\|gstatic" dashboard.html

# Nulmeting B-05
grep -o "xlsx/[0-9.]*/" dashboard.html
```

### Browser-testmatrix

| Browser | Versie | Status nulmeting | Methode |
|---|---|---|---|
| Chrome | Laatste | ✅ Werkend | Handmatig |
| Firefox | Laatste | Niet getest | Handmatig |
| Safari | Laatste | Niet getest | Handmatig |
| Edge | Laatste | Niet getest | Handmatig |
| Safari iOS | 16+ | Niet getest | Handmatig op device |

---

## 10. Dimensie 9 — Geheugen

> *"Lekt de applicatie geheugen bij langdurig gebruik?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| M-01 | JS heap na initialisatie | `performance.memory.usedJSHeapSize` | **Niet gemeten** | < 80 MB | < 50 MB |
| M-02 | JS heap na 100 tab-switches | Measure na 100x tab-switch | **Niet gemeten** | Groei < 5 MB | Geen groei |
| M-03 | `_vScrollBound` entries na tab-switches | `Object.keys(_vScrollBound).length` | **Groeit niet** (max 2 tabs = 2 entries) | ≤ tabs count | = tabs count |
| M-04 | `_gvScrollBound` duplice scroll-listeners | DevTools → tab-container event listeners | **Mogelijke duplicaten** | 1 per container | 1 per container |
| M-05 | `_avatarCache` grootte na full render | `AppState._cache.avatar.size` | **Niet gemeten** (~30–50 unieke namen) | < 200 | < 100 |
| M-06 | `_uniqueValueCache` grootte na filters | `Object.keys(_uniqueValueCache).length` | **Niet gemeten** | ≤ 25 (= kolom-count) | ≤ 25 |
| M-07 | Event listeners totaal op document | DevTools → Elements → `#document` event listeners | **Niet gemeten** | < 20 | < 10 |

### Meetprocedure

```javascript
// Nulmeting M-01 t/m M-06 (plak in DevTools Console na paginaload):
(function measureMemory() {
  console.log('=== GEHEUGEN NULMETING ===');
  if (performance.memory) {
    console.log('Heap (MB):', (performance.memory.usedJSHeapSize / 1048576).toFixed(2));
  }
  console.log('avatarCache size:', AppState._cache.avatar.size);
  console.log('_vScrollBound entries:', Object.keys(_vScrollBound).length);
  console.log('_gvScrollBound entries:', Object.keys(_gvScrollBound).length);
  console.log('_uniqueValueCache keys:', Object.keys(_uniqueValueCache).length);
  console.log('collapsedGroups size:', AppState.collapsedGroups.size);
  console.log('selectedRows size:', AppState.selectedRows.size);
})();

// Herhaal na 50 tab-switches en vergelijk:
var switchCount = 0;
var interval = setInterval(function() {
  switchTab(switchCount % 2);
  switchCount++;
  if (switchCount >= 50) {
    clearInterval(interval);
    measureMemory(); // vergelijk met nulmeting
  }
}, 50);
```

---

## 11. Dimensie 10 — Onderhoudbaarheid

> *"Hoe eenvoudig is de code te begrijpen en uit te breiden?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| O-01 | Magische getallen (getal zonder named constant) | Grep `[^=!<>][0-9]\{2,\}[^px%ms"]` in JS | **23 gevallen** | ≤ 10 | ≤ 5 |
| O-02 | Magische strings (hardcoded domein-waarden) | Grep `'Hoog'\|'Actief'\|'Initiatief'` buiten config | **15 locaties** | ≤ 5 | 0 (config-driven) |
| O-03 | `TODO`/`FIXME`/`BUG-` comments | Grep `TODO\|FIXME\|BUG-` | **7 open issues** (BUG-009 t/m BUG-015) | ≤ 5 | ≤ 2 |
| O-04 | Gemiddelde commentaar-dichtheid | Regels met `//` / totale JS-regels | **~18%** | ≥ 15% | ≥ 20% |
| O-05 | Inconsistente naamgeving (camelCase vs anderen) | Grep `_[a-z][A-Z]\|[a-z]-[a-z]` in functienamen | **2 inconsistenties** (`_cfRefresh`, `_vBuf`) | ≤ 2 | 0 |
| O-06 | `@deprecated` functies in gebruik | Grep `@deprecated` + check aanroepen | **Legacy accessors in gebruik** (regel 916–929) | Geen gebruik | Verwijderd |
| O-07 | Configuratie buiten `dashboardConfig` | Hardcoded kolom-info buiten config | **`categoricalKeys`, `_ordinalOrders`, `_valTagColors`** buiten config | 0 | 0 |

### Meetprocedure

```bash
# Nulmeting O-01
grep -oE '\b[0-9]{2,}\b' dashboard.html | grep -v "^0\." | wc -l

# Nulmeting O-02
grep -n "'Hoog'\|'Middel'\|'Laag'\|'Actief'\|'Initiatief'" dashboard.html \
  | grep -v "cols0\|cols1\|_ordinalOrders\|dashboardConfig" | wc -l

# Nulmeting O-03
grep -c "TODO\|FIXME\|BUG-" dashboard.html

# Nulmeting O-04
COMMENT=$(grep -c "^\s*//" dashboard.html)
TOTAL=$(grep -c "." dashboard.html)
echo "Commentaar: $(echo "scale=2; $COMMENT/$TOTAL*100" | bc)%"

# Nulmeting O-07
grep -n "categoricalKeys\|_ordinalOrders\|_valTagColors" dashboard.html | head -5
```

---

## 12. Dimensie 11 — Performance (runtime)

> *"Hoe snel reageert de applicatie op gebruikersinteracties?"*

### Metrieken

| ID | Metriek | Methode | Nulmeting | Drempel | Streef |
|---|---|---|---|---|---|
| P-01 | Totale `render()` tijd (volledig) | `[perf] render() total` in console | **Niet gemeten** | < 100 ms | < 50 ms |
| P-02 | `computeFilteredData` bij lege zoekterm | Console `[perf]` | **Niet gemeten** | < 20 ms | < 10 ms |
| P-03 | `computeFilteredData` bij actieve zoekterm | Console `[perf]` | **Niet gemeten** | < 30 ms | < 15 ms |
| P-04 | `computeAggModel` over 4500 rijen | Console `[perf]` | **Niet gemeten** | < 15 ms | < 8 ms |
| P-05 | `renderVirtualBody` (viewport ~20 rijen) | Console `[perf]` | **Niet gemeten** | < 10 ms | < 5 ms |
| P-06 | Scroll FPS bij 4500 rijen | FPS-monitor (taak 4.4 PERFORMANCE_PLAN) | **Niet gemeten** | ≥ 55 fps | ≥ 60 fps |
| P-07 | Time-to-Interactive (TTI) | `dashboard:total-init` mark | **Niet gemeten** | < 500 ms | < 200 ms |
| P-08 | `computeAggModel` versnelling na Set-fix | Vergelijk voor/na taak 2.1 | **Baseline = huidige** | ≥ 20% sneller | ≥ 40% sneller |
| P-09 | Scroll-jank (dropped frames) | DevTools Performance → Frames | **Niet gemeten** | 0 dropped frames/s | 0 dropped frames/s |
| P-10 | Geheugengroei per render-cyclus | `performance.memory` voor en na 10 renders | **Niet gemeten** | < 1 MB groei | Stabiel |

### Meetprocedure

```javascript
// Nulmeting P-01 t/m P-05: zet _perfDebug = true (staat al op true)
// Open browser → open Console → filter op "[perf]"
// Doe de volgende acties en noteer tijden:

// P-01: Klik op tab → noteer "render() total"
// P-02: Geen zoekterm → noteer "computeFilteredData"
// P-03: Type "Amsterdam" → noteer "computeFilteredData"
// P-04: Noteer "computeAggModel"
// P-05: Scroll naar onder → noteer "renderVirtualBody"

// P-07 TTI meten (plak voor eerste render-aanroep):
performance.mark('page:start');
// ...na initApp():
performance.mark('page:ready');
performance.measure('TTI', 'page:start', 'page:ready');
console.log('TTI:', performance.getEntriesByName('TTI')[0].duration.toFixed(0) + 'ms');

// P-06 Scroll FPS (zie PERFORMANCE_PLAN.md taak 4.4)
```

---

## 13. Gecombineerde scoringsmatrix

### Nulmeting scorecard (v0.14.0)

| # | Dimensie | Score | Issues K | Issues H | Issues M | Issues L | Trend |
|---|---|---|---|---|---|---|---|
| 1 | Correctheid | 🟡 **6/10** | 1 | 4 | 0 | 1 | — |
| 2 | Complexiteit | 🟠 **5/10** | 2 | 3 | 1 | 0 | — |
| 3 | Koppeling & Cohesie | 🟡 **5/10** | 1 | 3 | 2 | 0 | — |
| 4 | Herbruikbaarheid | 🟡 **5/10** | 2 | 3 | 2 | 0 | — |
| 5 | Testbaarheid | 🟠 **4/10** | 2 | 3 | 2 | 0 | — |
| 6 | Beveiliging | 🟡 **6/10** | 1 | 3 | 2 | 1 | — |
| 7 | Toegankelijkheid | 🟢 **7/10** | 0 | 2 | 3 | 2 | — |
| 8 | Browsercompat | 🟠 **5/10** | 2 | 2 | 2 | 0 | — |
| 9 | Geheugen | 🟠 **5/10** | 2 | 2 | 2 | 1 | — |
| 10 | Onderhoudbaarheid | 🟡 **6/10** | 2 | 2 | 2 | 1 | — |
| 11 | Performance | ⚪ **?/10** | — | — | — | — | Niet gemeten |
| | **Totaal** | **🟡 54/100** | **15** | **27** | **18** | **6** | |

### Score-definitie

| Score | Label | Beschrijving |
|---|---|---|
| 8–10 | 🟢 Goed | Voldoet aan industriestandaard |
| 6–7 | 🟡 Acceptabel | Verbeterpunten aanwezig, geen blokkers |
| 4–5 | 🟠 Aandacht | Significante issues, aanpak vereist |
| 1–3 | 🔴 Kritiek | Blokkeert kwaliteit of veiligheid |

### Streefscores per sprint

| Sprint | Doeldimensies | Verwachte score-toename |
|---|---|---|
| Sprint 1 (bugfixes) | Correctheid, Beveiliging | +2 punten elk |
| Sprint 2 (CPU) | Performance, Herbruikbaarheid | +2 punten elk |
| Sprint 3 (laadtijd) | Performance, Browsercompat | +2 punten elk |
| Sprint 4 (instrumentatie) | Performance, Testbaarheid | +1 punt elk |
| Sprint 5 (monitoring) | Onderhoudbaarheid, Geheugen | +1 punt elk |
| **Na alle sprints** | **Totaal** | **54 → 68+ / 100** |

---

## 14. Meetprotocol

### Wanneer meten

```
┌─────────────────────────────────────────────────────────────────────┐
│  MEETMOMENT                  │  METRIEKEN                           │
├──────────────────────────────┼──────────────────────────────────────┤
│  Nulmeting (eenmalig)        │  Alle dimensies 1–11                 │
│  Vóór elke sprint            │  Relevante dimensies voor die sprint  │
│  Na elke commit              │  C-01 (tests), S-02 (XSS)            │
│  Na elke sprint              │  Alle dimensies in die sprint         │
│  Kwartaal review             │  Alle dimensies 1–11                  │
└──────────────────────────────┴──────────────────────────────────────┘
```

### Nulmeting-procedure (stap voor stap)

```
VOORBEREIDING
  1. Checkout main branch (v0.14.0)
  2. Open dashboard.html lokaal in Chrome
  3. Open DevTools (F12)

STAP 1 — Automatische checks (5 min)
  Console:
    > runTests()                          → noteer X/Y geslaagd
    > AppState._cache.avatar.size         → noteer waarde
    > Object.keys(_vScrollBound).length   → noteer waarde

STAP 2 — Performance baseline (10 min)
  Console → filter op "[perf]":
    > Klik tab Projecten                  → noteer render() total
    > Type "Rotterdam" in zoekbalk        → noteer computeFilteredData
    > Activeer groepering op Status       → noteer computeGroupModel
    > Klik "Kolommen" → wissel 3 kolommen → noteer renderHeader
    > Scroll naar rij 3000                → noteer renderVirtualBody

STAP 3 — Security spot-check (5 min)
  > Zoek op: <img src=x onerror=alert(1)>
    → Wordt alert uitgevoerd? [ja/nee]
  > Tel: grep "innerHTML" | grep -v escapeHtml

STAP 4 — Accessibility check (5 min)
  > Keyboard-navigatie checklist (zie Dimensie 7)
  > Voer Tab door toolbar → tel niet-bereikbare elementen

STAP 5 — Memory snapshot (5 min)
  Console:
    > Plak measureMemory() snippet (zie Dimensie 9)
    > Doe 20 tab-switches
    > Plak measureMemory() opnieuw
    → Verschil heap in MB?

STAP 6 — Statische metrics (10 min)
  Terminal:
    > grep -c "BUG-\|TODO\|FIXME" dashboard.html
    > grep -c "innerHTML" dashboard.html
    > grep -c "new Map\|new Set" dashboard.html

TOTALE TIJD: ~35 minuten
```

### Impactmeting-procedure (na elke commit)

```
MINIMALE CHECK (5 min):
  1. runTests() → 0 nieuwe fails?
  2. Render-tijden gelijk of beter?
  3. Geen nieuwe console-errors?

VOLLEDIGE CHECK (20 min, na sprint-afsluiting):
  1. Herhaal Stap 1–6 van nulmeting-procedure
  2. Vergelijk elke metriek met nulmeting-waarde
  3. Vul scoringsmatrix in
  4. Documenteer in git commit message
```

### Regressie-detectie

Een commit wordt **geblokkers** bij:

- C-01: Meer test-fails dan nulmeting
- S-01: Nieuwe XSS-kwetsbaarheid geïntroduceerd
- P-01: `render()` > 150ms (50% boven drempel)
- M-04: Meer dan 2 scroll-listeners per container
- A-02: Eerder werkende keyboard-navigatie nu gebroken

---

## 15. Automatiseringsadvies

### Fase 1 — Direct uitvoerbaar (geen tooling)

```javascript
// dashboard.html: voeg toe aan runTests()

// Metriek C-04: cache-key correctheid
(function testCacheKey() {
  var colFiltersBackup = Object.assign({}, colFilters);
  colFilters['status'] = new Set(['Actief']);
  var key1 = _getUniqueCacheKey();
  colFilters['status'] = new Set(['Actief', 'Gepland']);
  var key2 = _getUniqueCacheKey();
  assert(key1 !== key2, 'C-04: cache-key verschilt bij verschillende Set-inhoud');
  colFilters = colFiltersBackup;
})();

// Metriek M-05: avatar cache bounded
(function testAvatarCacheBounded() {
  var size = AppState._cache.avatar.size;
  assert(size < 200, 'M-05: avatarCache onder 200 entries (was: ' + size + ')');
})();

// Metriek X-06: render tijden gelogd
(function testPerfLogging() {
  var logs = [];
  var orig = console.log;
  console.log = function(msg) { if (String(msg).startsWith('[perf]')) logs.push(msg); orig.apply(console, arguments); };
  render();
  console.log = orig;
  assert(logs.length >= 3, 'X-06: minimaal 3 perf-logs per render()');
})();
```

### Fase 2 — Playwright / Puppeteer E2E tests

```javascript
// tests/performance.spec.js (Playwright)
test('render binnen 100ms', async ({ page }) => {
  await page.goto('file:///path/to/dashboard.html');
  const renderTime = await page.evaluate(() => {
    return new Promise(resolve => {
      var t0 = performance.now();
      render();
      requestAnimationFrame(() => resolve(performance.now() - t0));
    });
  });
  expect(renderTime).toBeLessThan(100);
});

test('geen XSS via zoekbalk', async ({ page }) => {
  await page.goto('file:///path/to/dashboard.html');
  let alertFired = false;
  page.on('dialog', () => { alertFired = true; });
  await page.fill('#search-input', '<img src=x onerror=alert(1)>');
  await page.waitForTimeout(500);
  expect(alertFired).toBe(false);
});

test('runTests slaagt volledig', async ({ page }) => {
  await page.goto('file:///path/to/dashboard.html');
  const result = await page.evaluate(() => {
    return runTests(); // geeft { passed, failed } terug
  });
  expect(result.failed).toBe(0);
});
```

### Fase 3 — CI/CD integratie

```yaml
# .github/workflows/quality-check.yml
name: Dashboard kwaliteitscheck

on: [push, pull_request]

jobs:
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Controleer magische strings
        run: |
          COUNT=$(grep -c "'Hoog'\|'Actief'\|'Initiatief'" dashboard.html || echo 0)
          echo "Magische strings: $COUNT"
          [ "$COUNT" -le 15 ] || exit 1

      - name: Controleer open bugs
        run: |
          COUNT=$(grep -c "BUG-" dashboard.html)
          echo "Open BUG-referenties: $COUNT"
          [ "$COUNT" -le 7 ] || exit 1

      - name: Controleer innerHTML zonder escaping
        run: |
          COUNT=$(grep -n "\.innerHTML\s*=" dashboard.html | grep -v "escapeHtml" | wc -l)
          echo "Onveilige innerHTML: $COUNT"
          [ "$COUNT" -le 3 ] || exit 1

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install playwright
      - run: npx playwright test tests/
```

---

## Bijlage A — Metriek-index

| ID | Dimensie | Metriek | Nulmeting |
|---|---|---|---|
| C-01 | Correctheid | Test-fails | 0/60+ |
| C-02 | Correctheid | Open bugs | 5 |
| C-03 | Correctheid | _searchStr undefined | Niet getest |
| C-04 | Correctheid | Cache-key collision | Bug aanwezig |
| X-01 | Complexiteit | Gem. functielengte | ~19 regels |
| X-02 | Complexiteit | Langste functie | 83 regels |
| X-03 | Complexiteit | Max nesting | 5 niveaus |
| X-04 | Complexiteit | Functies > 40 regels | 8 |
| K-01 | Koppeling | Globals per functie | Gem. 6 |
| K-02 | Koppeling | AppState-mutaties | 47 functies |
| R-01 | Herbruikbaarheid | Duplice codeblokken | 6 patronen |
| R-04 | Herbruikbaarheid | Sort-toggle duplicaat | 2 locaties |
| T-01 | Testbaarheid | Pure functies | ~18 |
| T-02 | Testbaarheid | runTests assertions | 60 |
| T-05 | Testbaarheid | DOM-afhankelijke functies | 9 |
| S-01 | Beveiliging | Renderers zonder escaping | 1 |
| S-06 | Beveiliging | CSP aanwezig | Nee |
| A-02 | Toegankelijkheid | Keyboard-score | 6/8 |
| B-01 | Browsercompat | ES6 zonder polyfill | 8 API's |
| M-01 | Geheugen | Heap na init | Niet gemeten |
| M-04 | Geheugen | Scroll-listener duplicaten | Mogelijk |
| O-01 | Onderhoudbaarheid | Magische getallen | 23 |
| O-03 | Onderhoudbaarheid | BUG-/TODO comments | 7 |
| O-07 | Onderhoudbaarheid | Config buiten dashboardConfig | 3 objecten |
| P-01 | Performance | render() totaal | Niet gemeten |
| P-07 | Performance | TTI | Niet gemeten |

---

*Toetsingskader gebaseerd op statische analyse van dashboard.html v0.14.0*
*64 bevindingen over 10 dimensies — 9 kritiek, 25 hoog, 17 middel, 6 laag*
*Gebruik dit document als startpunt bij elke codewijziging.*
