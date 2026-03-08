# Taakplan Layer 2 — Dashboard Engine Layer

Versie: 1.0
Datum: 2026-03-08

---

## 1. Doel

Dit taakplan maakt van `dashboard.html` (v0.42.0, ~5000 regels) een **expliciete Dashboard Engine Layer**: de schaalbare, generieke runtime die dashboardgedrag uitvoert op basis van configuratie en genormaliseerde data. De engine is niet de UX-standaard (→ Layer 1), niet de CSV-parser (→ Layer 3) en niet de AI-generator (→ Layer 4).

**Layer 2 is de bron van waarheid voor runtime- en rendergedrag.**

### Relatie tot de platformarchitectuur

| Laag | Bestand | Rol |
|------|---------|-----|
| Layer 1 — UX Reference | `ux-reference.html` | Zie `LAYER1_PLAN.md` |
| **→ Layer 2 — Dashboard Engine** | `dashboard.html` | **Dit plan** |
| Layer 3 — CSV Adapter | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §7 |
| Layer 4 — Dashboard Spec | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §8 |
| Layer 5 — Assembler | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §13 |

### Relatie tot de roadmap-breekpunten

| Breekpunt | Wat | Relevante WPs |
|-----------|-----|---------------|
| **1 — dashboardConfig extraheerbaar** | Runtime-logica uit config halen, puur declaratief JSON | WP-H, WP-C |
| **2 — CSV-adapter + eerste AI-spec** | Adapter bouwt schema, AI genereert spec | WP-I, WP-C |
| **3 — Assembler + mappenstructuur** | Engine extraheren naar src/, assembler bouwt single HTML | WP-M |

---

## 2. Gewenst eindresultaat

Na afronding is Layer 2:

- Rolzuiver gepositioneerd als **engine** (niet als monoliet-dashboard)
- Logisch opgesplitst in **core**, **derive**, **render**, **controllers** en **interfaces**
- Onafhankelijk van demo-data of embedded-only datastructuren
- Koppelbaar aan UX-patterns uit Layer 1 zonder vermenging
- Voorbereid op invoer van meerdere datasets en verschillende dashboard-specs
- Geschikt als bouwsteen voor tailor-made single-file HTML-dashboards
- Voorzien van 241+ geautomatiseerde tests die intact blijven

---

## 3. Hoofdprincipes

1. **Engine is bron van waarheid voor runtimegedrag**
2. **UX komt niet in de engine-core** — UX-patronen worden via controllers aangesloten
3. **CSV-specifieke logica hoort niet in enginecode** — alleen via dataset-contract
4. **Dashboardmaatwerk uit declaratieve spec** — niet uit hardcoded branching
5. **Elke interactie via dezelfde acties en selectors** — muis, keyboard, paneel
6. **Performance is eerste-orde constraint** — 27 budgetten, virtual scroll, dirty flags
7. **Single-file output = builddoel** — geen reden om bronarchitectuur te vervuilen
8. **Tests blijven groen** — elke refactor houdt de 241 bestaande tests intact

---

## 4. Scope

### In scope
- Centrale engine-state en acties
- Selectors en derived state
- Filter-, sorteer-, group- en aggregatielogica
- Virtualisatie en viewportberekening
- Render adapters voor header/body/meta
- UX controllers die engine-acties aanspreken
- Exporthooks
- Interface naar dashboard-spec (Layer 4 contract)
- Interface naar dataset-contract (Layer 3 contract)
- Performance-instrumentatie
- Declaratieve config formalisering

### Buiten scope
- UX-ontwerpkeuzes (→ Layer 1, `LAYER1_PLAN.md`)
- CSV parsing en headernormalisatie (→ Layer 3)
- AI promptontwerp of specgeneratie (→ Layer 4)
- Concrete businessinhoud van individuele dashboards

---

## 5. Doelarchitectuur van Layer 2

### 5.1 Engine Core
- Engine-state (`AppState` + dirty flags)
- Basisacties (tab wisselen, filter instellen, sort toggle, etc.)
- Mutaties / state-updates via herleidbare acties
- Invalidatie via dirty flags met dependency graph
- Lifecycle: dashboard laden → tab wisselen → dataset wisselen → spec toepassen

### 5.2 Derive Layer
- `computeFilteredData()` — filtering
- `sortData()` — sortering
- `groupData()` — grouping
- `computeAggModel()` — aggregaties
- Zichtbare kolommen en kolomvolgorde
- Selectie-afleidingen
- Zoekindex en search matching
- Viewport-berekeningen

### 5.3 Render Layer
- Header renderer
- Virtual body renderer (`renderVirtualBody()`)
- Grouped body renderer (`_renderGroupedVirtual()`)
- Meta/footer renderer
- Breedtesynchronisatie
- Render orchestration

### 5.4 UX Controller Layer
- Column drag/drop controller
- Column panel controller
- Keyboard controller
- Undo controller
- Accessibility announce controller
- Overlay hooks voor Layer 1

### 5.5 Interface Layer
- Input-contract met Layer 3 (dataset-contract)
- Input-contract met Layer 4 (dashboard-spec)
- Output-contract naar assembler/build
- Gestandaardiseerde hooks voor UX

---

## 6. Migratiestrategie

### Probleem
`dashboard.html` is een monoliet van ~5000 regels. De doelarchitectuur beschrijft een multi-file structuur (`src/core/`, `src/derive/`, etc.), maar de assembler (Layer 5) bestaat nog niet. We kunnen pas naar een multi-file bronstructuur als de assembler het weer kan bundelen.

### Aanpak: in-place refactoring in fasen

**Fase 2a** (Breekpunt 1 — Config extraheerbaar):
- Werk binnen `dashboard.html` als single-file
- Scheid config van runtime-logica
- Formaliseer contracts als documentatie + inline validatie
- **241 tests blijven intact**

**Fase 2b** (Extractie — Engine modulair):
- Werk nog steeds binnen `dashboard.html`
- Voeg sectie-comments toe voor core/derive/render/controllers
- Isoleer functies in logische groepen
- Refactor naar expliciete acties en selectors
- **Tests worden uitgebreid, niet gebroken**

**Fase 2c** (Aansluiting — Hooks en interfaces):
- UX controller hooks toevoegen
- Datasource-interface invoeren
- Export standaardiseren
- **Layer 1 P1 moet afgerond zijn**

**Fase 2d** (Build-ready):
- Assembler-interface documenteren
- Voorbereiden op extractie naar `src/` (pas bij Breekpunt 3)
- Tests + accessibility formaliseren

### Wanneer naar multi-file?
Pas bij **Breekpunt 3** (Assembler operationeel) worden de secties uit `dashboard.html` fysiek geëxtraheerd naar `src/dashboard-engine/`. Tot die tijd blijft alles in één bestand met duidelijke sectie-afbakening.

---

## 7. Werkpakketten

### Uitvoeringsvolgorde en afhankelijkheden

```
Fase 2a (Breekpunt 1):
  WP-A ──→ WP-H ──→ WP-C
                       │
Fase 2b (Extractie):   ▼
  WP-B ──→ WP-D ──→ WP-E ──→ WP-F
                                 │
Fase 2c (Aansluiting):          ▼
  WP-I ──→ WP-G ──→ WP-J ──→ WP-K
            ▲
            │ (vereist Layer 1 P1)
            │
Fase 2d (Build-ready):
  WP-L ──→ WP-M
```

| # | Werkpakket | Fase | Prioriteit | Afhankelijk van |
|---|-----------|------|------------|-----------------|
| WP-A | Positionering en afbakening | 2a | P1 | — |
| WP-H | Declaratieve config opschonen | 2a | P1 | WP-A |
| WP-C | Contracts voor input en output | 2a | P1 | WP-H |
| WP-B | Engine Core expliciteren | 2b | P1 | WP-C |
| WP-D | Derive layer structureren | 2b | P1 | WP-B |
| WP-E | Virtualisatie en performance | 2b | P1 | WP-D |
| WP-F | Render adapters scheiden | 2b | P1 | WP-E |
| WP-I | Data source abstractie | 2c | P2 | WP-F |
| WP-G | UX controller hooks | 2c | P2 | WP-F + **Layer 1 P1** |
| WP-J | Export standaardiseren | 2c | P2 | WP-G |
| WP-K | Accessibility en interaction parity | 2c | P2 | WP-J |
| WP-L | Teststrategie | 2d | P3 | WP-K |
| WP-M | Assembler-interface | 2d | P3 | WP-L |

---

### WP-A — Positionering en afbakening

**Doel:** `dashboard.html` expliciet positioneren als engine-template.

**Fase:** 2a (Breekpunt 1)

**Taken:**
1. Voeg bovenaan `dashboard.html` een HTML-commentaar toe:
   ```html
   <!-- ═══════════════════════════════════════════════════════
        DASHBOARD ENGINE LAYER — CSV Dashboard Template Platform
        Dit bestand is de schaalbare runtime voor alle dashboards.
        UX-standaard: zie ux-reference.html (Layer 1)
        ═══════════════════════════════════════════════════════ -->
   ```
2. Documenteer in comments welke verantwoordelijkheden exclusief bij Layer 2 horen:
   - State management (AppState, dirty flags)
   - Data pipeline (filter → sort → group → aggregate)
   - Virtual scroll rendering
   - Export (CSV, JSON)
   - Tab management
   - Performance instrumentatie
3. Documenteer wat **niet** bij Layer 2 hoort:
   - UX-patronen (drag preview, corridor, panel) → Layer 1
   - CSV parsing → Layer 3
   - Dashboard-specifieke config → Layer 4
4. Maak een inventarislijst van huidige onderdelen die in andere lagen thuishoren

**Acceptatiecriteria:**
- Het is in de source duidelijk wat Layer 2 wel en niet is
- Een ontwikkelaar kan zonder twijfel bepalen of nieuwe logica in Layer 2 thuishoort

---

### WP-H — Declaratieve config opschonen

**Doel:** Het configuratiemodel geschikt maken als target voor AI-gegenereerde dashboard-specs.

**Fase:** 2a (Breekpunt 1) — **Dit is het strategisch belangrijkste werkpakket.**

**Taken:**
1. Analyseer huidige `dashboardConfig` en identificeer:
   - Declaratieve delen (tabs, kolommen, labels, features, exports, defaults) → **behouden**
   - Runtime-logica (`generateData()`, inline functies) → **extraheren**
2. Verwijder `generateData()` uit config — data moet via dataset-contract binnenkomen
3. Definieer een formeel JSON-schema voor dashboard-config:
   ```
   dashboardConfig: {
     title, version, tabs: [{
       id, label, dataSource, defaultSort, defaultGroup,
       columns: [{
         id, sourceField, label, type, renderer,
         width, defaultVisible, sortable, filterable,
         groupable, aggregatable, exportFormatter
       }],
       features: { search, export, grouping, columnPanel },
       exports: [{ format, scope, filename }]
     }]
   }
   ```
4. Definieer standaardwaarden (defaults) voor alle optionele velden
5. Maak voorbeeldconfigs voor minimaal twee dashboardtypen

**Huidige staat:** `dashboardConfig` bevat al tabs, kolommen, features, exports en defaults. Het is ~70% declaratief. De `generateData()` functies en sommige inline renderers zijn de runtime-vervuiling.

**Acceptatiecriteria:**
- `dashboardConfig` bevat **geen** runtime-logica meer
- Layer 4 (AI) kan één gestandaardiseerd JSON-formaat genereren
- Handmatig maatwerk kan zonder enginecodewijziging worden toegevoegd
- Alle 241 bestaande tests blijven slagen

---

### WP-C — Contracts voor input en output

**Doel:** Layer 2 laten werken op formele contracts.

**Fase:** 2a (Breekpunt 1)

**Taken:**
1. Definieer `datasetContract` — input vanuit Layer 3:
   ```
   { records: [...], schema: { fields: [{name, type, nullable}] },
     sourceMeta: { filename, rowCount, parseWarnings } }
   ```
2. Definieer `dashboardSpecContract` — input vanuit Layer 4:
   - Verwijst naar het schema uit WP-H
3. Definieer `engineViewModel` — interne output van derive-stappen:
   - filteredData, sortedData, groupedData, aggregations, visibleColumns, viewportWindow
4. Definieer `renderContract` — input voor renderers:
   - columns, rows, sortState, groupState, rowHeight, viewport
5. Schrijf inline validatiefuncties voor contracts (fail-fast bij ongeldige input)
6. Documenteer verplichte vs. optionele velden

**Acceptatiecriteria:**
- Layer 2 kan draaien op contractinput zonder knowledge van CSV-bron of AI-prompts
- Ongeldige invoer levert duidelijke validatiefouten op
- Contracts zijn gedocumenteerd als inline comments + aparte doc

---

### WP-B — Engine Core expliciteren

**Doel:** De kern van state en runtimegedrag losmaken van rendering en UX.

**Fase:** 2b

**Taken:**
1. Identificeer alle globale state in `AppState` en categoriseer:
   - Dashboard state (activeTab, config)
   - Data state (dataset, filteredData, sortedData, groupedData)
   - Column state (columnOrder, hiddenColumns, columnWidths)
   - Sort state (sortKey, sortDir)
   - Search state (searchTerm, searchIndex)
   - Group state (groupKey, expandedGroups)
   - Selection state (selectedRows)
   - Render state (viewport, scrollTop, _vBuf)
   - Performance state (marks, measures)
2. Documenteer het bestaande dirty-flag systeem:
   - Welke actie invalideert welke flags?
   - Welke derive-stap herberekent bij welke dirty flag?
3. Voeg sectie-comments toe in de code:
   ```javascript
   // ══ ENGINE CORE: State & Actions ══
   // ══ ENGINE CORE: Dirty Flags & Invalidation ══
   ```
4. Zorg dat elke state-mutatie via een herkenbare actie loopt (geen losse property-sets)

**Acceptatiecriteria:**
- Alle primaire runtime-state is gecentraliseerd en gecategoriseerd
- Elke mutatie loopt via een herkenbare actie
- Dirty-invalidatie is herleidbaar

---

### WP-D — Derive layer structureren

**Doel:** Alle afgeleide-data berekeningen modulair maken.

**Fase:** 2b

**Taken:**
1. Voeg sectie-comments toe per derive-stap:
   ```javascript
   // ══ DERIVE: Filtering ══
   // ══ DERIVE: Sorting ══
   // ══ DERIVE: Grouping ══
   // ══ DERIVE: Aggregation ══
   // ══ DERIVE: Visible Columns ══
   // ══ DERIVE: Viewport ══
   ```
2. Documenteer input/output van elke derive-stap:
   ```
   computeFilteredData(allData, searchTerm, filters) → filteredRows[]
   sortData(rows, sortKey, sortDir) → sortedRows[]
   groupData(rows, groupKey) → groupedStructure
   computeAggModel(rows, columns) → aggregations{}
   ```
3. Definieer welke derive-resultaten cachebaar zijn (huidige derived-state cache)
4. Definieer wanneer elke stap opnieuw moet worden uitgevoerd (dirty-flag mapping)
5. Zorg dat elke derive-functie apart aanroepbaar en testbaar is

**Acceptatiecriteria:**
- De derive-pipeline is leesbaar als opeenvolgende, testbare stappen
- Elke stap kan apart getest en geprofileerd worden

---

### WP-E — Virtualisatie en performance verstevigen

**Doel:** De schaalvoordelen expliciet borgen.

**Fase:** 2b

**Taken:**
1. Documenteer het huidige virtualisatiemodel:
   - `renderVirtualBody()` — flat virtual scroll
   - `_renderGroupedVirtual()` — grouped virtual scroll
   - `_vBuf` — buffer-rijen boven/onder viewport
   - Row height: `getRowH()` → vast of computed
2. Voeg sectie-comment toe:
   ```javascript
   // ══ VIRTUALIZATION: Viewport & Row Window ══
   ```
3. Documenteer performance-kritische paden:
   - Zoekactie → filter → render (~ms budget)
   - Sorteeractie → sort → render (~ms budget)
   - Tabwissel → full pipeline (~ms budget)
   - Scroll → virtualization update (~ms budget)
4. Verwijs naar bestaande performance-budgetten in `TESTREGISTER.md` §D
5. Zorg dat UX-uitbreidingen later alleen op zichtbare DOM werken (documenteer de regel)

**Acceptatiecriteria:**
- Virtualisatiegedrag is gedocumenteerd en reproduceerbaar
- Performance-budgetten zijn gelinkt aan TESTREGISTER.md
- De "viewport-only DOM" regel is vastgelegd

---

### WP-F — Render adapters scheiden

**Doel:** Rendering modulair maken.

**Fase:** 2b

**Taken:**
1. Identificeer de bestaande render-functies en categoriseer:
   - Header render (thead opbouwen)
   - Body render (`renderVirtualBody`)
   - Grouped body render (`_renderGroupedVirtual`)
   - Meta/footer render (result count, sort indicator, tab bar)
   - Cell renderers (`cellRenderers` object)
2. Voeg sectie-comments toe:
   ```javascript
   // ══ RENDER: Header ══
   // ══ RENDER: Virtual Body ══
   // ══ RENDER: Grouped Body ══
   // ══ RENDER: Meta & Footer ══
   // ══ RENDER: Cell Renderers ══
   // ══ RENDER: Orchestration ══
   ```
3. Documenteer welke renderers idempotent zijn (opnieuw aanroepen = zelfde output)
4. Documenteer DOM-ownership: welke DOM-elementen door renderers worden beheerd vs. door UX overlays

**Acceptatiecriteria:**
- Een renderer kan later vervangen of uitgebreid worden zonder engine-core te wijzigen
- DOM-ownership is duidelijk gedocumenteerd

---

### WP-I — Data source abstractie

**Doel:** Layer 2 losmaken van embedded data.

**Fase:** 2c

**Taken:**
1. Identificeer alle plekken waar de engine uitgaat van embedded datasets:
   - `dashboardConfig.tabs[].data` met `generateData()`
   - Inline `rows[]` arrays
   - Hardcoded veldnamen
2. Introduceer een `dataSource` interface:
   ```javascript
   // dataSource contract:
   // { type: 'embedded'|'dataset', records: [...], schema: {...} }
   ```
3. Maak onderscheid tussen:
   - Embedded source (huidige situatie, voor backwards compat)
   - Dataset source (via Layer 3 contract)
4. Definieer hoe tabs datasets selecteren
5. Zorg dat Layer 2 alleen met gestandaardiseerde dataset-input werkt

**Acceptatiecriteria:**
- Nieuwe databronnen kunnen worden aangesloten zonder renderlogica te wijzigen
- Bestaande embedded data werkt nog (backwards compatible)

---

### WP-G — UX controller hooks voor Layer 1

**Doel:** Layer 2 structureren zodat UX-patterns uit Layer 1 gecontroleerd kunnen landen.

**Fase:** 2c

**Vereiste:** Layer 1 P1 (WP1–WP3 + WP6 + WP10) moet afgerond zijn.

**Taken:**
1. Definieer engine-acties op basis van Layer 1 porting-mapping (Layer 1 WP6):

   | UX-patroon (Layer 1) | Engine-actie (Layer 2) | Selector |
   |---------------------|----------------------|----------|
   | Column drag | `beginColumnDrag()`, `updateColumnDrag()`, `commitColumnMove()`, `cancelColumnDrag()` | `getColumnGeometry()` |
   | Column panel | `togglePanel()`, `setColumnOrder()`, `setHiddenColumns()`, `setAllColumnsVisible()` | `getPanelItems()` |
   | Keyboard reorder | `moveColumn(key, direction)` | `getVisibleColumns()` |
   | Hide column | `hideColumn(key)` | `getHiddenColumns()` |
   | Sort toggle | `toggleSort(key)` | `getSortState()` |
   | Undo | `undo()` | `canUndo()` |
   | Search | `setSearchTerm(term)` | `getFilteredCount()` |
   | Announce | `announce(message)` | — |

2. Voeg sectie-comment toe:
   ```javascript
   // ══ UX CONTROLLERS: Column Drag ══
   // ══ UX CONTROLLERS: Column Panel ══
   // ══ UX CONTROLLERS: Keyboard ══
   // ══ UX CONTROLLERS: Undo ══
   // ══ UX CONTROLLERS: Accessibility ══
   ```
3. Zorg dat dezelfde actie via muis, keyboard en paneel kan worden aangeroepen
4. Ontwerp overlay-hooks voor drag preview en drop corridor

**Acceptatiecriteria:**
- Layer 1 kan worden aangesloten zonder duplicatie van businesslogica
- Dezelfde actie is bereikbaar via drie input-kanalen (muis, keyboard, paneel)

---

### WP-J — Export standaardiseren

**Doel:** Exportmogelijkheden engine-owned maken.

**Fase:** 2c

**Taken:**
1. Analyseer huidige `_formatCSV()` en `_formatJSON()`
2. Definieer export-contract:
   - Welke databasis: rauw, gefilterd, zichtbare kolommen, gegroepeerd?
   - Export formattering rules per kolomtype
   - Feature flags per dashboard/tab
3. Voeg sectie-comment toe:
   ```javascript
   // ══ EXPORT: CSV ══
   // ══ EXPORT: JSON ══
   // ══ EXPORT: Contract ══
   ```
4. Koppel exportrechten aan feature flags uit config

**Acceptatiecriteria:**
- Exportgedrag is consistent en spec-gedreven
- Export volgt dezelfde kolom- en filterlogica als de engineweergave

---

### WP-K — Accessibility en interaction parity

**Doel:** Toegankelijkheid ingebouwd in engineinterfaces.

**Fase:** 2c

**Taken:**
1. Definieer welke engine-events screenreader announcements triggeren
2. Definieer standaard focusherstel na acties (focus return)
3. Leg vast hoe sort state, group state en column visibility semantisch worden ontsloten (`aria-sort`, etc.)
4. Voorzie render adapters van ARIA-state inputs
5. Maak accessibility-contract tussen UX controllers en render layer

**Acceptatiecriteria:**
- Toegankelijkheid is ingebouwd, niet ad-hoc
- Elke interactie is bereikbaar via keyboard en gemeld aan screenreaders

---

### WP-L — Teststrategie formaliseren

**Doel:** De engine betrouwbaar en wijzigbaar houden.

**Fase:** 2d

**Taken:**
1. Documenteer teststrategie per onderdeel:
   - Core state → unit tests (Suite A uitbreiden)
   - Derive modules → unit tests per stap
   - Render adapters → integratie tests (Suite B uitbreiden)
   - UX controllers → interaction tests
   - Performance → Suite D budgetten
2. Breid bestaande tests uit waar nodig na refactoring
3. Definieer regressietestcases voor grote tabellen (4500+ rijen)
4. Zorg dat de DTR (test runner) alle nieuwe tests integreert

**Huidige staat:** 241 tests in 4 suites (A=157, B=25, C=33, D=27). Deze moeten na elke WP nog slagen.

**Acceptatiecriteria:**
- Kernfunctionaliteit is automatisch toetsbaar
- Refactors kunnen worden uitgevoerd zonder blind risico
- Testcount is ≥ 241 na afronding

---

### WP-M — Assembler-interface voorbereiden

**Doel:** Layer 2 compatibel maken met de latere buildstap.

**Fase:** 2d

**Taken:**
1. Identificeer runtime-afhankelijkheden die single-file output bemoeilijken
2. Documenteer welke onderdelen inline injecteerbaar moeten zijn:
   - Config (dashboard-spec JSON)
   - Data (getransformeerde dataset)
   - Design tokens (uit Layer 1)
3. Definieer bootstrap-input voor een einddashboard:
   ```javascript
   // De assembler injecteert:
   // 1. dashboardSpec (JSON) — vanuit Layer 4
   // 2. datasetPayload (JSON) — vanuit Layer 3
   // 3. designTokens (CSS) — vanuit Layer 1
   // 4. engineCode (JS) — vanuit Layer 2
   // → Eén zelfstandig HTML-bestand
   ```
4. Documenteer hoe Layer 2 als bronlaag aan de assembler wordt aangeboden

**Acceptatiecriteria:**
- Layer 2 kan zonder structurele aanpassing worden ingebed in één HTML-build
- De assembler-interface is gedocumenteerd

---

## 8. Kruisafhankelijkheden

### Layer 2 → Layer 1

| Layer 2 WP | Vereist van Layer 1 | Layer 1 WP |
|------------|--------------------|-----------:|
| WP-G (UX hooks) | PORT THIS labels, porting-mapping | WP3, WP6 |
| WP-G (UX hooks) | Pattern catalog | WP5 |
| WP-K (A11y) | Accessibility reference | WP8 |
| WP-M (Assembler) | Token-alignment, build-notities | WP4, WP11 |

### Layer 2 → andere lagen

| Layer 2 WP | Levert op | Voor welke laag |
|------------|-----------|-----------------|
| WP-C | Dataset-contract | Layer 3 (CSV Adapter) |
| WP-C + WP-H | Dashboard-spec contract | Layer 4 (AI Spec) |
| WP-M | Assembler-interface | Layer 5 (Assembler) |

### Kritiek pad

```
Layer 1 P1 ──→ Layer 2 Fase 2a ──→ Fase 2b ──→ Fase 2c ──→ Fase 2d
(WP1-3,6,10)   (WP-A,H,C)         (WP-B,D,E,F)  (WP-I,G,J,K)  (WP-L,M)
```

Layer 1 P1 en Layer 2 Fase 2a kunnen **parallel** worden uitgevoerd. Layer 2 Fase 2c vereist Layer 1 P1.

---

## 9. Risico's en maatregelen

| # | Risico | Maatregel |
|---|--------|-----------|
| 1 | UX-logica sluipt de engine-core in | UX alleen via controllers en hooks toelaten |
| 2 | CSV-aannames verankerd in engine | Alleen dataset-contracten accepteren, nooit ruwe parser-output |
| 3 | Dashboard-spec te los of impliciet | Formeel schema en validatie verplicht (WP-H, WP-C) |
| 4 | Performance achteruit bij UX-uitbreiding | Performance-budgetten + viewport-only DOM-regels |
| 5 | Single-file build leidt tot bronvervuiling | Assembler-interface documenteren, build-logica uit engine houden |
| 6 | 241 tests breken bij refactoring | Elke WP eindigt met `runTests()` = 0 fails |
| 7 | Multi-file structuur zonder assembler | In-place refactoring tot assembler er is (Fase 2a-2c in single file) |

---

## 10. Versioning

| Fase | Werkpakketten | Versie |
|------|--------------|--------|
| 2a | WP-A + WP-H + WP-C | v0.44.0 |
| 2b | WP-B + WP-D + WP-E + WP-F | v0.45.0 |
| 2c | WP-I + WP-G + WP-J + WP-K | v0.46.0 |
| 2d | WP-L + WP-M | v0.47.0 |

Elke fase krijgt:
- Version bump in `DASHBOARD_VERSION`
- Changelog-entry in `docs/CHANGELOG.md`
- Testrapport in `archive/testrapporten/`
- Alle tests groen (≥241)

---

## 11. Definition of Done

Layer 2 is gereed wanneer:

- [ ] De engine heeft een expliciete scope-afbakening in de source
- [ ] State, derive, render en controllers zijn logisch gescheiden (sectie-comments)
- [ ] Input vanuit dataset en dashboard-spec verloopt via formele contracts
- [ ] `dashboardConfig` bevat geen runtime-logica meer (puur declaratief JSON)
- [ ] Virtualisatie en performance-grenzen zijn gedocumenteerd
- [ ] UX-patterns uit Layer 1 kunnen via hooks worden aangesloten
- [ ] Embedded demo-aannames zijn geïsoleerd van engine-logica
- [ ] De engine is voorbereid op assembler en single-file build
- [ ] Tests dekken de kritieke runtimefuncties af (≥241 tests, 0 fails)
- [ ] Alle performance-budgetten uit TESTREGISTER.md §D worden gehaald

---

## 12. Samenvatting

De kern van dit taakplan is dat Layer 2 **rolzuiver gemaakt wordt als dashboard-engine**. De aanpak is: **in-place refactoring** in vier fasen, startend met Breekpunt 1 (config extraheerbaar). Contracts eerst, dan core, dan derive, dan render, dan UX hooks. De 241 bestaande tests blijven na elke fase groen. Pas bij Breekpunt 3 (assembler operationeel) wordt de code fysiek geëxtraheerd naar `src/dashboard-engine/`. Het resultaat is een stabiele bronlaag die niet zelf het eindproduct is, maar de technische ruggengraat van elk tailor-made single-file dashboard.
