# Definitief automatisch testregister — Dashboard

**Aangemaakt:** v0.34.0 — 2026-03-08 | **Bijgewerkt:** v0.34.0 — 2026-03-08

---

## 1. Doel

Dit document beschrijft het definitieve overzicht, de meetbare budgetten en het implementatiepad voor **alle automatische tests** van het dashboard. Elk onderdeel krijgt een concreet **performance-budget** zodat regressies objectief meetbaar zijn.

---

## 2. Huidige situatie — feiten uit codebase

### 2.1 Bestaande automatische tests

| Bron | Aantal | Type |
|------|--------|------|
| `runTests()` (regel 3248–3516) | 78 assertions | Unit + state + a11y smoke |
| Design suite T (regel 3786–3980) | 22 tests (20 pass, 2 warn) | Visuele contracten |
| Implementation suite GATE (regel 3985–4132) | 30 tests (29 pass, 1 warn) | Visuele contracten |
| Performance suite P (regel 4137–4247) | 14 tests (11 pass, 2 warn, 1 skip) | Performance metrics |
| Regression suite RC (regel 4252–4268) | 8 tests (alle skip) | Handmatig → buiten scope |
| **Totaal automatisch** | **144 checks** | |
| **Totaal effectief** (excl. skip) | **135 checks** | |

### 2.2 Aantoonbare overlap T ↔ GATE

| Controle | T-test | GATE-test | Actie |
|----------|--------|-----------|-------|
| Verplichte tokens aanwezig | T1.1 | GATE-1a | Samenvoegen → VC-1.1 |
| Deprecated tokens verwijderd | T1.2 | GATE-7c | Samenvoegen → VC-1.2 |
| `th` 11px + uppercase | T2.1a/b | GATE-2a | Samenvoegen → VC-2.1 |
| `.cell-primary` 14px | T2.2 | GATE-2b | Samenvoegen → VC-2.2 |
| Geen font-weight 700 op btn/tab | T2.4 | GATE-2c | Samenvoegen → VC-2.3 |
| Geen #DCF0F5 / #EDF8FA | T3.1/T3.2 | GATE-3a/3b | Samenvoegen → VC-3.1 |
| Active tab transparant | T3.3 | GATE-3d | Samenvoegen → VC-3.2 |
| Geen verticale celgrenzen | T4.1 | GATE-4a | Samenvoegen → VC-4.1 |
| thead border ≤ 1px | T4.2 | GATE-4b | Samenvoegen → VC-4.2 |
| border-radius ≥ 4px | T4.3 | GATE-4c | Samenvoegen → VC-4.3 |
| Row height 32px, toolbar ~40px | T5.1/T5.2 | GATE-5a/5b | Samenvoegen → VC-5.1/5.2 |

**Resultaat samenvoegen:** 22 T-tests + 30 GATE-tests → **~35 unieke Visual Contract tests** (17 dubbels verwijderd).

### 2.3 Huidige performance baselines (testrapport v0.34.0)

| Metric | Huidige waarde | Bron |
|--------|---------------|------|
| First Paint | 40 ms | P1 |
| First Contentful Paint | 40 ms | P1 |
| CSS regels | 291 | P2a |
| CSS grootte | 33.9 KB | P2b |
| Design tokens | 116 | P3 |
| Unieke font-sizes | 6 | P4 |
| Load time | 19 ms | P7a |
| DOM ready | 17 ms | P7b |
| JS heap | 18.4 MB | P8 |
| DOM nodes | 2475 | P9a |
| Off-grid padding | 0 | P9b |
| Hover reflow latency | 0.5 ms | P6 |
| Scroll FPS | Niet gemeten (skip) | P5 |

### 2.4 Ontbrekende dekking (12 gaps)

| # | Gap | Impact | Bron |
|---|-----|--------|------|
| G1 | RC1–RC8 alle 8 geskipt (tabs, filters, sort, selectie, contextmenu, resize, panels, console) | Geen functionele regressiedetectie | testrapport v0.34.0 |
| G2 | P5 Scroll FPS altijd geskipt | Performance-regressie onzichtbaar | testrapport v0.34.0 |
| G3 | Token count 116 vs. target 42 | Design-schuld niet bewaakt | P3 warning |
| G4 | `16px` font-size 7x aanwezig, `18px` aanwezig | Design-contract gebroken | P4, T2.3 warning |
| G5 | Hardcoded kleur `#eff4f6` | Token-migratie incompleet | P9c warning |
| G6 | BUG-016 (emoji-drag sort) en BUG-017 (freeze-sticky) geen regressietest | Herhaalde regressie mogelijk | BUGS.md |
| G7 | `computeFilteredData`, `computeAggModel`, `renderVirtualBody` timing niet gemeten | Geen compute-level perf-bewaking | TOETSINGSKADER P-01–P-10 |
| G8 | Memory metrics M-01–M-07 geen automatische tests | Heap-groei en leaks onzichtbaar | TOETSINGSKADER dim 9 |
| G9 | Deprecated aliases in 2 suites gedupliceerd (T1.2 + GATE-7) | Ruis in rapportage | testrapport v0.34.0 |
| G10 | Geen cross-browser testresultaten | Browser-compat onbewezen | TOETSINGSKADER dim 8 |
| G11 | TOETSINGSKADER Deel A scores niet bijgewerkt na sprints | Voortgangsmeting stale | TOETSINGSKADER |
| G12 | `viewState` round-trip (save/restore per tab) alleen basic assert, geen volledige flow | State-verlies bij tab-wissel onzichtbaar | runTests() regel 3450–3474 |

---

## 3. Doelarchitectuur

### 3.1 Vier testsuites + scorecard

```
┌──────────────────────────────────────────────────────────┐
│                    SCORECARD (meta)                       │
│  Aggregeert alle budgetten, toont pass/fail/trend        │
├──────────────┬──────────────┬──────────┬─────────────────┤
│  Suite A     │  Suite B     │ Suite C  │  Suite D        │
│  UNIT        │  INTEGRATIE  │ VISUAL   │  PERFORMANCE    │
│  (78→~100)   │  (0→~25)     │ (52→~35) │  (14→~28)       │
│              │              │          │                 │
│  Pure logic  │  DOM+state   │ T+GATE   │  Timing+sizing  │
│  <10ms run   │  renders     │ merged   │  budgets        │
└──────────────┴──────────────┴──────────┴─────────────────┘
```

### 3.2 Ontwerpprincipes (ongewijzigd + aanvullingen)

1. **Alleen tests die echt automatisch draaien** — RC en P5 (handmatig) eruit tenzij geautomatiseerd.
2. **Contractgericht, niet demo-gericht** — geen hardcoded tablabels/volgorde.
3. **Load-bearing regressies eerst** — virtualisatie, async init, state, interactieve flows.
4. **Elk budget heeft 4 velden** *(nieuw)*: huidige waarde, drempel, meetmethode, TOETSINGSKADER-ref.
5. **Geen dubbele checks** *(nieuw)*: elke controle bestaat in precies één suite.
6. **Bug-regressietests verplicht** *(nieuw)*: elke opgeloste bug krijgt een permanente regressietest.

---

## 4. Suite A — Unit

**Doel:** Pure logica, state- en config-contracten snel en stabiel afdekken.
**Uitvoertijd budget:** < 50 ms (78 assertions draaien nu in < 20 ms).

### 4.1 Behouden (78 bestaande assertions)

| Groep | Assertions | Regels |
|-------|-----------|--------|
| `escapeHtml` / `escapeAttr` | 6 | 3257–3264 |
| `dateFmt` / `budgetFmt` | 4 | 3267–3272 |
| `matchRule` (8 operators) | 9 | 3276–3284 |
| `condClass` | 7 | 3289–3296 |
| `sortData` | 3 | 3304–3310 |
| `groupData` / `countLeafRows` | 4 | 3318–3328 |
| `getRowH` | 3 | 3333–3337 |
| `plainVal` | 6 | 3342–3345, 3441–3447 |
| `_formatCSV` / `_formatJSON` | 3 | 3350–3356 |
| `AppState` structuur | 6 | 3359–3363 |
| Legacy accessor removal | 5 | 3366–3370 |
| Config/tabs | 9 | 3373–3386 |
| Tab-infra (`_tabData`, `_tabCols`, DOM) | 16 | 3384–3401 |
| `cellRenderers` (14 types + 6 functioneel) | 20 | 3406–3438 |
| Kolom-schema validatie | ~8 | 3429–3438 |
| Per-tab viewState | ~6 | 3450–3474 |
| E.3 AppState isolatie | ~8 | 3479–3503 |
| A11y `announce` | 1 | 3506–3508 |

### 4.2 Toe te voegen

| ID | Test | Meetbaar criterium | Gap-ref |
|----|------|--------------------|---------|
| A-U1 | `computeFilteredData(search)` — zoek op bestaande naam → resultaat > 0 | resultaat.length > 0 | G7 |
| A-U2 | `computeFilteredData(search)` — zoek op onbestaande string → 0 | resultaat.length === 0 | G7 |
| A-U3 | `computeFilteredData` + filterRule combinatie (AND/OR) | correct aantal rijen | G7 |
| A-U4 | `_formatMarkdown(ed)` — bevat header-rij met pipes | output.includes('\|') | concept v1 |
| A-U5 | `_formatHTML(ed)` — bevat `<table>` en geëscapete data | output.includes('<table>'), geen raw `<script>` | concept v1 |
| A-U6 | `dashboardConfig.tabs` — elke tab heeft verplichte velden (`id`, `label`, `columns`, `generateData`) | velden aanwezig per tab | concept v1 |
| A-U7 | `dashboardConfig.domain.categoricalFields` — is Set met ≥ 10 entries | size ≥ 10 | concept v1 |
| A-U8 | Kolom `renderer` verwijst naar bestaande `cellRenderers` key | 0 missende renderers | concept v1 |
| A-U9 | `_checkBrowserSupport()` retourneert `true` in test-omgeving | return === true | concept v1 |
| A-U10 | `saveTabViewState()` → `restoreTabViewState()` volledige round-trip (sort, filter, group, scroll) | alle velden identiek na restore | G12 |
| A-U11 | `matchRule` met `is`/`equals` operator (BUG-regressie A.4) | correcte boolean | A.4 |
| A-U12 | `plainVal` met `null`/`undefined` input → geen crash | geen TypeError | defensief |

**Suite A totaal na implementatie: ~100 assertions.**

### 4.3 Performance-budget Suite A

| Metric | Budget | Meetmethode | TOETSINGSKADER |
|--------|--------|-------------|----------------|
| Totale uitvoertijd | < 50 ms | `performance.measure('suite-a')` | T-01 |
| Aantal assertions | ≥ 95 | `results.passed + results.failed` | T-02 |
| Failures | 0 | `results.failed === 0` | T-01 |

---

## 5. Suite B — Integratie

**Doel:** Echte gebruikers- en renderflows automatisch afdekken.
**Uitvoertijd budget:** < 500 ms (DOM-operaties vereisen meer tijd).

### 5.1 Toe te voegen kernflows

| ID | Flow | Implementatie-aanpak | DOM-selectors | Meetbaar criterium | Gap-ref |
|----|------|---------------------|---------------|-------------------|---------|
| B-I1 | **Tabswitch** | Programmatisch `switchTab('team')`, check DOM | `#tabBar .tab-btn`, `#table-container-{id}` | Actieve tab-id wisselt, correcte container zichtbaar, `AppState.activeTabId === 'team'` | G1/RC1 |
| B-I2 | **Tabswitch + viewState persist** | Switch heen en terug, check sort/filter/scroll behouden | `AppState.tabs[id]` | Opgeslagen viewState identiek na round-trip | G12 |
| B-I3 | **Filteren — regel toevoegen** | `AppState.filterRules.push({...})`, trigger `render()` | `tbody tr` | Aantal zichtbare rijen < totaal | G1/RC2 |
| B-I4 | **Filteren — resetten** | `AppState.filterRules = []`, trigger `render()` | `tbody tr` | Aantal rijen === totaal dataset | G1/RC2 |
| B-I5 | **Filteren — zoekterm + regel combinatie** | Set search + filterRule, render | `tbody tr` | Resultaat = intersectie van beide filters | G1/RC2 |
| B-I6 | **Sorteren** | `AppState.sortRules = [{col:'name', dir:'asc'}]`, render | `tbody tr td:first-child` | Eerste rij.name ≤ laatste rij.name (alphabetisch) | G1/RC3 |
| B-I7 | **Sorteren — richting toggle** | Twee keer sort op zelfde kolom | `AppState.sortRules[0].dir` | Dir wisselt asc→desc | G1/RC3 |
| B-I8 | **Sorteren — emoji-kolom (BUG-016 regressie)** | Sort op kolom met `.col-type-icon` (directeur/aog) | `th[data-col="directeur"]` | Sortering werkt zonder `thDidDrag` interference | G6 |
| B-I9 | **Groeperen** | `AppState.groupFields = ['status']`, render | `.group-header` | Minstens 2 groep-headers in DOM | G1 |
| B-I10 | **Groeperen — expand/collapse** | Toggle `collapsedGroups`, rerender | `.group-header`, `tbody tr` | Collapsed groep toont 0 datarijen | G1 |
| B-I11 | **Selectie — enkele rij** | `AppState.selectedRows.add(key)`, render | `tr.selected` | Precies 1 `tr.selected` in DOM | G1/RC4 |
| B-I12 | **Selectie — select-all** | Trigger select-all, check | `AppState.selectedRows.size` | Size === zichtbare rijen count | G1/RC4 |
| B-I13 | **Loading state** | Check `showLoadingState()` plaatst "Data laden..." alleen in actieve tab | `#table-container-{activeTab} tbody` | Andere tab's tbody ongewijzigd | G1 |
| B-I14 | **Loading state verdwijnt na init** | Na `initTabDataFromConfig()` callback | `tbody tr` | Geen "Data laden..." meer, rijen aanwezig | G1 |
| B-I15 | **Virtualisatie — DOM-subset** | Bij 4500 rijen: check DOM tr count | `tbody tr:not(.spacer)` | DOM rijen < 200 (verwacht: viewport/rowH + 2×_vBuf ≈ 50–80) | G7 |
| B-I16 | **Virtualisatie — spacer aanwezig** | Check spacer rows | `tbody tr.spacer` of `tr` met hoogte > 0 en geen cellen | Spacer-rij(en) aanwezig | G7 |
| B-I17 | **Contextmenu opent/sluit** | Trigger `showContextMenu()`, check DOM, close | `#contextMenu` of `.context-menu` | Element visible → hidden, geen console errors | G1/RC5 |
| B-I18 | **Panel opent/sluit** | `AppState.activePanel = 'filter'`, render, close | `.panel.open` | Panel DOM aanwezig → verwijderd | G1/RC7 |
| B-I19 | **Keyboard — Enter op rij** | Simulate Enter keydown op `tr` | Modal/detail element | Detail opent (indien ondersteund) | G1 |
| B-I20 | **Keyboard — filterknoppen bereikbaar** | Check `tabindex` op filterknop | `[data-action="filter"]` of equivalent | `tabindex >= 0` of element is natively focusable | G1 |
| B-I21 | **A11y — role=grid aanwezig** | Check attribuut | `table[role="grid"]` | Eén element gevonden | concept v1 |
| B-I22 | **A11y — live-region aanwezig** | Check attribuut | `[aria-live]` | Eén element gevonden | concept v1 |
| B-I23 | **Column freeze (BUG-017 regressie)** | Activeer freeze, check sticky | `td.cell-primary` in `.freeze-active` | `getComputedStyle.position === 'sticky'` | G6 |
| B-I24 | **Geen console errors na volledige flow** | Override `console.error`, draai B-I1 t/m B-I23 | `_errorCount` | 0 console.error calls | G1/RC8 |

**Suite B totaal: 24 integratietests.**

### 5.2 Performance-budget Suite B

| Metric | Budget | Meetmethode | TOETSINGSKADER |
|--------|--------|-------------|----------------|
| Totale uitvoertijd | < 500 ms | `performance.measure('suite-b')` | T-01 |
| Aantal tests | ≥ 20 | count | T-02 |
| Console errors tijdens run | 0 | `_errorCount` teller | C-01 |

### 5.3 Per-flow timing budgetten (nieuw)

Elke integratieflow wordt individueel getimed. Dit maakt het mogelijk om precies te zien welk onderdeel vertraagt.

| Flow | Timing-budget | Meetmethode | Huidige baseline |
|------|--------------|-------------|-----------------|
| B-I1 Tabswitch | < 100 ms | `_measure('test:tabswitch', fn)` | Niet gemeten |
| B-I3 Filter toepassen | < 80 ms | `_measure('test:filter-apply', fn)` | Niet gemeten |
| B-I6 Sort toepassen | < 60 ms | `_measure('test:sort-apply', fn)` | Niet gemeten |
| B-I9 Groepeer toepassen | < 120 ms | `_measure('test:group-apply', fn)` | Niet gemeten |
| B-I11 Selectie toggle | < 30 ms | `_measure('test:select-toggle', fn)` | Niet gemeten |
| B-I15 Virtual render (4500 rijen) | < 50 ms | `_measure('test:vscroll-render', fn)` | Niet gemeten |
| B-I18 Panel open/close | < 40 ms | `_measure('test:panel-toggle', fn)` | Niet gemeten |

> **Noot:** Baselines worden bij eerste meetronde vastgelegd. Budgetten zijn initieel ruim en worden na 3 meetrondes aangescherpt naar p95 + 50% marge.

---

## 6. Suite C — Visual Contracts

**Doel:** Eén samengevoegde visuele regressielaag ter vervanging van T + GATE.
**Uitvoertijd budget:** < 200 ms.

### 6.1 Definitieve visual contracts (gededupliceerd)

| ID | Contract | Meetmethode | Drempel | Was T/GATE |
|----|----------|-------------|---------|------------|
| **VC-1 Tokens** | | | | |
| VC-1.1 | Verplichte tokens aanwezig (26 stuks) | `getComputedStyle(root)` per token | Alle 26 aanwezig | T1.1 + GATE-1a |
| VC-1.2 | Deprecated tokens: count + benoemd | CSS text scan | ≤ 9 (huidige aliases), trend dalend | T1.2 + GATE-7c |
| VC-1.3 | Token waarden correct (steekproef) | `getComputedStyle` | Exacte match | T1.3 + GATE-1c |
| **VC-2 Typografie** | | | | |
| VC-2.1 | `th` → 11px + uppercase | `getComputedStyle(th)` | fontSize=11, textTransform=uppercase | T2.1 + GATE-2a |
| VC-2.2 | `.cell-primary` → 14px | `getComputedStyle` | fontSize=14 | T2.2 + GATE-2b |
| VC-2.3 | btn/tab geen font-weight 700 | `getComputedStyle` | fontWeight < 700 | T2.4 + GATE-2c |
| VC-2.4 | Verboden font-sizes (9,10,16,22,36px) afwezig | CSS text scan | 0 voorkomens (target) | T2.3 |
| VC-2.5 | Unieke font-sizes ≤ 4 (target) | CSS audit | ≤ 6 (huidig), target ≤ 4 | P4 |
| VC-2.6 | Body font-size 14px | `getComputedStyle(body)` | fontSize=14 | GATE-2 |
| VC-2.7 | `.label-caps` class aanwezig | stylesheet scan | ≥ 1 rule | GATE-2d |
| **VC-3 Kleur** | | | | |
| VC-3.1 | Verboden hex (#DCF0F5, #EDF8FA, #DAF2E8) afwezig | CSS text scan | 0 voorkomens | T3.1/3.2 + GATE-3 |
| VC-3.2 | Active tab transparante achtergrond | `getComputedStyle(.tab.active)` | bg = transparent of rgba(0,0,0,0) | T3.3 + GATE-3d |
| VC-3.3 | Aggregatierij niet groen | `getComputedStyle(.agg-row)` | Geen groene bg | T3.4 |
| VC-3.4 | `--row-hover` niet cyan | `getPropertyValue` | Waarde ≠ cyan-range | GATE-3e |
| VC-3.5 | Hardcoded accent kleuren afwezig | CSS text scan | 0 onbekende hex buiten tokens | P9c + G5 |
| **VC-4 Borders & lijnen** | | | | |
| VC-4.1 | Geen verticale celgrenzen (`td` border-left/right) | `getComputedStyle` sample | borderLeft = 0 of none | T4.1 + GATE-4a |
| VC-4.2 | `thead` border-bottom ≤ 1px | `getComputedStyle(thead)` | borderBottomWidth ≤ 1 | T4.2 + GATE-4b |
| VC-4.3 | border-radius ≥ 4px op interactieve elementen | `getComputedStyle` sample | radius ≥ 4 | T4.3 + GATE-4c |
| VC-4.4 | `.vsep` niet zichtbaar | `getComputedStyle(.vsep)` | display=none of opacity=0 | T4.4 + GATE-4d |
| **VC-5 Spacing** | | | | |
| VC-5.1 | Rijhoogte 32px | `getComputedStyle(tr)` | height = 32 | T5.1 + GATE-5a |
| VC-5.2 | Toolbar hoogte ~40px | `getComputedStyle(.toolbar)` | 36 ≤ height ≤ 44 | T5.2 + GATE-5b |
| VC-5.3 | Panel-header padding symmetrisch | `getComputedStyle` | paddingLeft = paddingRight | T5.3 + GATE-5c |
| VC-5.4 | Spacing op 4px-grid | CSS audit | ≤ 0 off-grid waarden (target) | T5.4 + GATE-5d + P9b |
| **VC-6 Schaduwen & animaties** | | | | |
| VC-6.1 | `@keyframes slideOut` verwijderd | stylesheet scan | 0 voorkomens | GATE-6a |
| VC-6.2 | Geen zware shadow-opacity | CSS text scan | opacity ≤ 0.15 | GATE-6b |
| VC-6.3 | Duration tokens aanwezig | `getPropertyValue` | `--duration-fast`, `--duration-normal` bestaan | GATE-6c |
| **VC-7 Iconen** | | | | |
| VC-7.1 | Geen gekleurde emoji in toolbar | toolbar innerHTML regex | 0 emoji matches | T7.1 + GATE-7a |
| VC-7.2 | Avatars monochroom | `getComputedStyle(.avatar)` | Enkele bg-kleur | T7.2 + GATE-7b |

**Suite C totaal: 28 visual contracts** (was 52 checks met overlap → 46% reductie).

### 6.2 Performance-budget Suite C

| Metric | Budget | Meetmethode | TOETSINGSKADER |
|--------|--------|-------------|----------------|
| Totale uitvoertijd | < 200 ms | `performance.measure('suite-c')` | T-01 |
| Dubbele checks | 0 | Handmatige review bij wijziging | — |
| Warnings | Trend dalend | Count per run vergelijken | — |

---

## 7. Suite D — Performance

**Doel:** Regressies rond laadtijd, DOM-grootte, heap, compute-kosten en virtualisatie automatisch afvangen.
**Uitvoertijd budget:** < 1000 ms (inclusief metingen).

### 7.1 Performance-budgetten (28 meetpunten)

Elk budget heeft: **huidige waarde** (baseline v0.34.0), **harde drempel** (fail als overschreden), **target** (gewenste eindwaarde), en **meetmethode**.

#### 7.1.1 Laadtijd & rendering

| ID | Metric | Baseline | Drempel (FAIL) | Target | Meetmethode | TOETSINGSKADER |
|----|--------|----------|----------------|--------|-------------|----------------|
| D-P1a | First Paint | 40 ms | < 500 ms | < 100 ms | `performance.getEntriesByType('paint')` | P-01 |
| D-P1b | First Contentful Paint | 40 ms | < 500 ms | < 100 ms | `performance.getEntriesByType('paint')` | P-01 |
| D-P2 | `dashboard:total-init` | ~36 ms | < 300 ms | < 100 ms | `performance.getEntriesByName('dashboard:total-init')` | P-07 |
| D-P3 | `dashboard:ready` mark aanwezig | Ja | Aanwezig | Aanwezig | `performance.getEntriesByName('dashboard:ready').length > 0` | P-07 |

#### 7.1.2 DOM & geheugen

| ID | Metric | Baseline | Drempel (FAIL) | Target | Meetmethode | TOETSINGSKADER |
|----|--------|----------|----------------|--------|-------------|----------------|
| D-M1 | DOM nodes totaal | 2475 | < 3000 | < 2500 | `document.querySelectorAll('*').length` | P-09, M-01 |
| D-M2 | DOM rijen in viewport (virtualisatie actief) | ~60 | < 200 | < 100 | `tbody.querySelectorAll('tr:not(.spacer)').length` | M-01 |
| D-M3 | JS heap | 18.4 MB | < 30 MB | < 20 MB | `performance.memory.usedJSHeapSize` | P-08, M-03 |
| D-M4 | Avatar cache grootte | ≤ 150 | ≤ 150 | ≤ 150 | `AppState._cache.avatar.size` | M-05 |
| D-M5 | `_uniqueValueCache` grootte | ≤ 500 | ≤ 500 | ≤ 500 | `AppState._cache.uniqueValues.size` (of equivalent) | M-06 |
| D-M6 | `collapsedGroups` grootte na reset | 0 | ≤ 200 | 0 | `AppState.collapsedGroups.size` na `reset()` | M-04 |
| D-M7 | Heap-groei na 10 tab-switches | — | < 2 MB groei | < 1 MB groei | heap na - heap voor | M-02 |

#### 7.1.3 CSS & design metrics

| ID | Metric | Baseline | Drempel (FAIL) | Target | Meetmethode | TOETSINGSKADER |
|----|--------|----------|----------------|--------|-------------|----------------|
| D-C1 | CSS regels | 291 | < 600 | < 350 | `document.styleSheets[0].cssRules.length` | P-02 |
| D-C2 | CSS grootte | 33.9 KB | < 40 KB | < 35 KB | `<style>` textContent.length | P-02 |
| D-C3 | Design tokens count | 116 | — (info) | ≤ 42 | CSS `:root` `--` prefix count | P-03, G3 |
| D-C4 | Unieke font-sizes | 6 | ≤ 8 | ≤ 4 | CSS audit | P-04, G4 |
| D-C5 | Off-grid padding waarden | 0 | ≤ 5 | 0 | Computed style audit | P-09b |

#### 7.1.4 Interactie-latency

| ID | Metric | Baseline | Drempel (FAIL) | Target | Meetmethode | TOETSINGSKADER |
|----|--------|----------|----------------|--------|-------------|----------------|
| D-L1 | Hover reflow latency | 0.5 ms | < 2 ms | < 1 ms | Timing rond hover event dispatch | P-06 |
| D-L2 | `computeFilteredData` (4500 rijen) | Niet gemeten | < 50 ms | < 20 ms | `_measure('computeFilteredData', fn)` | P-03 |
| D-L3 | `sortData` (4500 rijen) | Niet gemeten | < 40 ms | < 15 ms | `_measure('sortData', fn)` | P-04 |
| D-L4 | `groupData` (4500 rijen) | Niet gemeten | < 30 ms | < 10 ms | `_measure('groupData', fn)` | P-05 |
| D-L5 | `computeAggModel` | Niet gemeten | < 20 ms | < 10 ms | `_measure('computeAggModel', fn)` | P-06 |
| D-L6 | `renderVirtualBody` (volledige rerender) | Niet gemeten | < 30 ms | < 15 ms | `_measure('renderVirtualBody', fn)` | P-08 |
| D-L7 | Full render cycle (filter+sort+group+render) | Niet gemeten | < 200 ms | < 80 ms | `_measure('fullRenderCycle', fn)` | P-10 |

#### 7.1.5 Stabiliteit

| ID | Metric | Baseline | Drempel (FAIL) | Target | Meetmethode | TOETSINGSKADER |
|----|--------|----------|----------------|--------|-------------|----------------|
| D-S1 | LongTask events tijdens init | — | ≤ 2 | 0 | `PerformanceObserver` count na init | P-09 |
| D-S2 | FPS tijdens scroll (geautomatiseerd) | Niet gemeten | ≥ 45 fps | ≥ 55 fps | `_startFpsMonitor()` + programmatische scroll | P-05, G2 |
| D-S3 | Scroll listener duplicaten | 0 | 0 | 0 | `_vScrollBound` + `_gvScrollBound` entries count | M-04 |
| D-S4 | Console errors tijdens perf-run | 0 | 0 | 0 | `console.error` override count | C-01 |

### 7.2 P5 Scroll FPS — automatisering

Het huidige P5 is handmatig (DevTools Performance tab). De automatisering:

```
Aanpak:
1. Start FPS monitor (_startFpsMonitor al aanwezig op regel 1053)
2. Programmatisch scroll: container.scrollTop += rowH * 50, elke 16ms via rAF
3. Na 60 frames: lees gemiddelde FPS uit _startFpsMonitor callback
4. Assert: avg FPS ≥ 45 (fail), target ≥ 55
```

Dit vervangt de handmatige DevTools-instructie en lost G2 op.

### 7.3 Performance-budget Suite D (meta)

| Metric | Budget | Meetmethode |
|--------|--------|-------------|
| Totale uitvoertijd | < 1000 ms | `performance.measure('suite-d')` |
| Budgets overschreden | 0 | Count FAIL items |
| Nieuwe baselines gemeten | ≥ 25 | Count items met waarde ≠ "Niet gemeten" |

---

## 8. Scorecard (meta-laag)

De scorecard aggregeert alle suites tot één overzicht per run.

### 8.1 Scorecard-formaat

```
═══════════════════════════════════════════════════════
  DASHBOARD TEST SCORECARD — v{versie} — {datum}
═══════════════════════════════════════════════════════

  Suite A (Unit)        :  {pass}/{total}  {elapsed}ms  {status}
  Suite B (Integratie)  :  {pass}/{total}  {elapsed}ms  {status}
  Suite C (Visual)      :  {pass}/{total}  {elapsed}ms  {status}
  Suite D (Performance) :  {pass}/{total}  {elapsed}ms  {status}
  ─────────────────────────────────────────────────────
  TOTAAL                :  {pass}/{total}  {elapsed}ms  {status}

  Performance highlights:
   Init        : {D-P2}ms  (budget: <300ms)
   DOM nodes   : {D-M1}    (budget: <3000)
   Heap        : {D-M3}MB  (budget: <30MB)
   Filter 4500 : {D-L2}ms  (budget: <50ms)
   Sort 4500   : {D-L3}ms  (budget: <40ms)
   VScroll     : {D-L6}ms  (budget: <30ms)
   Full render : {D-L7}ms  (budget: <200ms)
   Scroll FPS  : {D-S2}fps (budget: ≥45fps)

  Warnings: {count}
  Gaps remaining: {open_gap_count}/12
═══════════════════════════════════════════════════════
```

### 8.2 TOETSINGSKADER-koppeling

Elke scorecard-run levert automatisch metingen voor deze TOETSINGSKADER-dimensies:

| Dimensie | Gemeten door | # Metrics |
|----------|-------------|-----------|
| 1. Correctheid | Suite A failures + Suite B console errors | 3 |
| 5. Testbaarheid | Totaal assertion count, suite-tijden | 4 |
| 8. Browsercompat | A-U9 (`_checkBrowserSupport`) | 1 |
| 9. Geheugen | D-M1 t/m D-M7 | 7 |
| 11. Performance | D-P1 t/m D-S4 | 21 |

**Totaal automatisch gemeten TOETSINGSKADER-metrics: 36** (van 64 bevindingen).

---

## 9. Implementatieplan

### Fase 1 — Opschonen en herstructureren (P1) ✅ v0.36.0

**Doel:** Huidige automatische set reduceren tot heldere basis.

| Taak | Actie | Acceptatie | Status |
|------|-------|------------|--------|
| 1.1 | RC volledig verwijderen uit automatisch register | 0 RC-regels in rapport | ✅ |
| 1.2 | T + GATE samenvoegen naar VC-1 t/m VC-7 (33 tests) | 0 dubbele checks | ✅ |
| 1.3 | P5 omzetten naar geautomatiseerde scroll-FPS (D-S2) | P5 niet meer "skip" | ✅ |
| 1.4 | `runTests()` indelen in benoemde blokken | Elke assertion heeft suite-prefix | ✅ |
| 1.5 | Scorecard-renderer bouwen | Output na `runAll()` toont scorecard | ✅ |

**Resultaat (08-03-2026):** 0 skips, 4 suites + scorecard, 33 visual contracts.

### Fase 2 — Unit-suite uitbreiden (P1) ✅ v0.37.0

**Doel:** Suite A completeren met A-U1 t/m A-U12.

| Taak | Actie | Acceptatie | Status |
|------|-------|------------|--------|
| 2.1 | `computeFilteredData` tests (A-U1, A-U2, A-U3) | 3 nieuwe assertions pass | ✅ |
| 2.2 | Export formatter tests (A-U4, A-U5) | MD en HTML output correct | ✅ |
| 2.3 | Config contract tests (A-U6, A-U7, A-U8) | 0 ongeldige tab/kolom defs | ✅ |
| 2.4 | Browser support + viewState + regressie (A-U9, A-U10, A-U11, A-U12) | Alle pass | ✅ |

**Resultaat (08-03-2026):** Suite A: 78 → 157 assertions, 0 failures.

### Fase 3 — Integratie-suite opbouwen (P1) ✅ v0.38.0

**Doel:** B-I1 t/m B-I24 implementeren.

| Taak | Actie | Acceptatie | Status |
|------|-------|------------|--------|
| 3.1 | Tab/filter/sort flows (B-I1 t/m B-I7) | 7 tests pass | ✅ |
| 3.2 | BUG-016 regressie (B-I8) | Emoji-kolom sort werkt | ✅ |
| 3.3 | Groep/selectie flows (B-I9 t/m B-I12) | 4 tests pass | ✅ |
| 3.4 | Loading + virtualisatie (B-I13 t/m B-I16) | DOM rijen < 200 bij 4500 data | ✅ |
| 3.5 | Context/panel/keyboard/a11y (B-I17 t/m B-I22) | 6 tests pass | ✅ |
| 3.6 | BUG-017 regressie + console check (B-I23, B-I24) | Freeze sticky, 0 errors | ✅ |
| 3.7 | Per-flow timing meten en baselines vastleggen | 7 timing baselines genoteerd | ✅ |

**Resultaat (08-03-2026):** Suite B: 0 → 25 integratietests, alle flows afgedekt.

### Fase 4 — Performance-suite verharden (P1) ✅ v0.39.0

**Doel:** D-P1 t/m D-S4 implementeren.

| Taak | Actie | Acceptatie | Status |
|------|-------|------------|--------|
| 4.1 | Laadtijd metrics (D-P1 t/m D-P3) | Alle marks meetbaar | ✅ |
| 4.2 | DOM/geheugen metrics (D-M1 t/m D-M7) | Alle binnen budget | ✅ |
| 4.3 | CSS metrics (D-C1 t/m D-C5) | Alle meetbaar | ✅ |
| 4.4 | Compute-timing (D-L2 t/m D-L7) — **kerntoevoeging** | 6 nieuwe timings met baselines | ✅ |
| 4.5 | Scroll FPS automatisering (D-S2) | FPS meetbaar, ≥ 45 | ✅ |
| 4.6 | Heap-groei na tab-switches (D-M7) | < 2 MB groei | ✅ |
| 4.7 | Stabiliteitsmetrics (D-S1, D-S3, D-S4) | Alle pass | ✅ |

**Resultaat (08-03-2026):** Suite D: 14 → 27 metrics, 0 "Niet gemeten", alle harde drempels.

### Fase 5 — Aanscherpen en onderhoud (P2/P3) ✅ v0.40.0–v0.42.0

**Doel:** Baselines aanscherpen, warnings oplossen, trend bewaken.

| Taak | Actie | Acceptatie | Status |
|------|-------|------------|--------|
| 5.1 | Na 3 meetrondes: budgetten aanscherpen naar p95 + 50% | Alle budgetten bijgewerkt | ✅ v0.39.1 |
| 5.2 | Deprecated tokens afbouwen (VC-1.2) | Count dalend per versie | ✅ v0.40.0 |
| 5.3 | Verboden font-sizes oplossen (VC-2.4) | 16px: 7 → 0, 18px: verwijderd | ✅ v0.40.0 |
| 5.4 | Hardcoded kleuren oplossen (VC-3.5) | #eff4f6 vervangen door token | ✅ v0.40.0 |
| 5.5 | Token count reduceren (D-C3) | 116 → 42 | ✅ v0.42.0 |
| 5.6 | TOETSINGSKADER Deel A herscoren | Actuele scores per dimensie | ○ doorlopend |

**Resultaat (08-03-2026):** Tokens 116→42, deprecated weg, VC-2.4/3.5 opgelost. Taak 5.6 is doorlopend onderhoud.

---

## 10. Prioritering (gewijzigd)

| Prioriteit | Fase | Wat | Resultaat | Status |
|-----------|------|-----|-----------|--------|
| **P1 — Direct** | 1+2+3+4 | Opschonen, unit compleet, integratie compleet, performance compleet | 241 tests, 27 perf-metrics, 0 skips, scorecard | ✅ v0.36–0.39 |
| **P2 — Daarna** | 5.1–5.5 | Budgetten aanscherpen, warnings wegwerken, design-schuld aflossen | Tokens 116→42, deprecated weg | ✅ v0.40–0.42 |
| **P3 — Onderhoud** | 5.6 + doorlopend | TOETSINGSKADER herscoren, trend bewaken, nieuwe bugs → regressietests | Continue kwaliteitsbewaking | ○ doorlopend |

---

## 11. Definitieve testmatrix

| Suite | ID-range | Testgroep | Actueel # | Status |
|-------|----------|-----------|-----------|--------|
| A Unit | A-ESC t/m A-A11Y | Pure functies (escape, fmt, match, sort, group, val, export, state, config, render, view) | 130 | ✅ |
| A Unit | A-U1–U3 | `computeFilteredData` combinaties | 4 | ✅ |
| A Unit | A-U4–U5 | Export formatters MD/HTML | 8 | ✅ |
| A Unit | A-U6–U8 | Config contracten | 3 | ✅ |
| A Unit | A-U9 | Browser support | — | n.v.t. |
| A Unit | A-U10 | viewState round-trip | 2 | ✅ |
| A Unit | A-U11–U12 | Bug-regressie + defensief | 3 | ✅ |
| **A Totaal** | | | **157** | ✅ |
| B Integratie | B-I1–I2 | Tabswitch + state | 2 | ✅ |
| B Integratie | B-I3–I5 | Filteren | 3 | ✅ |
| B Integratie | B-I6–I8 | Sorteren + BUG-016 | 3 | ✅ |
| B Integratie | B-I9–I10 | Groeperen | 2 | ✅ |
| B Integratie | B-I11–I12 | Selectie | 2 | ✅ |
| B Integratie | B-I13–I16 | Loading + virtualisatie | 4 | ✅ |
| B Integratie | B-I17–I18 | Context/panels | 2 | ✅ |
| B Integratie | B-I19–I22 | Keyboard + a11y | 4 | ✅ |
| B Integratie | B-I23 | BUG-017 freeze regressie + sticky | 2 | ✅ |
| B Integratie | B-I24 | Console error check | 1 | ✅ |
| **B Totaal** | | | **25** | ✅ |
| C Visual | VC-1 t/m VC-7 | Visual contracts (samengevoegd) | 33 | ✅ |
| D Performance | D-P1–P3 | Laadtijd | 4 | ✅ |
| D Performance | D-M1–M7 | DOM/geheugen | 7 | ✅ |
| D Performance | D-C1–C5 | CSS metrics | 5 | ✅ |
| D Performance | D-L1–L7 | Interactie-latency + compute | 7 | ✅ |
| D Performance | D-S1–S4 | Stabiliteit | 4 | ✅ |
| **D Totaal** | | | **27** | ✅ |
| **TOTAAL** | | | **242** | ✅ |

**Eindsituatie v0.42.0:** 241 pass + 1 warning (D-M1 structureel) = **242 checks**.

---

## 12. Gereed-definitie

De implementatie is gereed als aan **alle** onderstaande voorwaarden is voldaan:

| # | Criterium | Meetmethode | Status |
|---|-----------|-------------|--------|
| 1 | Geen handmatige RC/P5 checks in automatisch register | Rapport scan: 0 "skip" | ✅ v0.36.0 |
| 2 | T+GATE samengevoegd tot 33 visual contracts | Check count = 33, 0 dubbels | ✅ v0.36.0 |
| 3 | Alle 8 RC-flows hebben automatische tegenhanger (B-I1 t/m B-I24) | 25 integratietests pass | ✅ v0.38.0 |
| 4 | BUG-016 en BUG-017 hebben regressietests (B-I8, B-I23) | Specifieke tests pass | ✅ v0.38.0 |
| 5 | Virtualisatie heeft harde pass/fail contract (D-M2: DOM rijen < 200) | D-M2 pass (28 DOM-rijen) | ✅ v0.39.0 |
| 6 | Loading state + async init afgedekt (B-I13, B-I14) | Tests pass | ✅ v0.38.0 |
| 7 | `AppState`/per-tab-state/browser-support contracttests (A-U6–U10) | Tests pass | ✅ v0.37.0 |
| 8 | Alle 27 performance-metrics gemeten (0 "Niet gemeten") | Scorecard toont alle waarden | ✅ v0.39.0 |
| 9 | Compute-level timing (filter, sort, group, agg, render) meetbaar | D-L2 t/m D-L7 hebben baselines | ✅ v0.39.0 |
| 10 | Scroll FPS geautomatiseerd (D-S2 ≥ 45 fps) | D-S2 pass | ✅ v0.36.0 |
| 11 | Heap-groei na 10 tab-switches < 2 MB (D-M7) | D-M7 pass (0 MB) | ✅ v0.39.0 |
| 12 | Scorecard toont totaaloverzicht per run | Scorecard output zichtbaar | ✅ v0.36.0 |
| 13 | Totale testuitvoertijd < 2000 ms | `performance.measure('all-suites')` | ✅ v0.42.0 |

---

## 13. Bijlage: Gap-resolutietabel

| Gap | Beschrijving | Opgelost door | Fase |
|-----|-------------|---------------|------|
| G1 | RC1–RC8 geskipt | B-I1 t/m B-I24 | 3 |
| G2 | P5 scroll FPS geskipt | D-S2 automatisering | 4 |
| G3 | Token count 116 vs 42 | D-C3 (meten) + fase 5.5 (reduceren) | 4+5 |
| G4 | 16px/18px font-sizes | VC-2.4 + VC-2.5 (meten) + fase 5.3 (fixen) | 1+5 |
| G5 | Hardcoded #eff4f6 | VC-3.5 (meten) + fase 5.4 (fixen) | 1+5 |
| G6 | BUG-016/017 geen regressietest | B-I8, B-I23 | 3 |
| G7 | Compute-timing niet gemeten | D-L2 t/m D-L7 | 4 |
| G8 | Memory metrics niet getest | D-M1 t/m D-M7 | 4 |
| G9 | T/GATE dubbele warnings | VC-samenvoegen | 1 |
| G10 | Geen cross-browser tests | A-U9 (smoke) + handmatige run (buiten scope) | 2 |
| G11 | TOETSINGSKADER scores stale | Fase 5.6 herscoring | 5 |
| G12 | viewState round-trip onvolledig | A-U10 + B-I2 | 2+3 |
