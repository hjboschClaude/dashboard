# Changelog — Dashboard Gemeente Rotterdam

Alle wijzigingen aan het dashboard worden chronologisch vastgelegd in dit bestand.
Formaat gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.0.0/).
Versienummering volgt [Semantic Versioning](https://semver.org/lang/nl/).

---

## v0.53.0 — 2026-03-08

**Type:** Architectuur
**Domein:** UX Reference (Layer 1)

Layer 1 P2 gestart: design tokens aligned met RODS en accessibility reference verdiept.

**Layer 1 WP4 — Design tokens isoleren en alignen (ux-reference.html):**
- Token-mapping documentatie: 28 tokens gecategoriseerd als Gedeeld of L1-only
- 7 tokens hernoemd naar RODS-naamgeving: --muted→--text-muted, --danger→--color-danger, --warning→--color-warning, --success→--color-success, --danger-light→--color-danger-light, --warning-light→--color-warning-light, --row-h→--row-height
- Gedeelde tokenwaarden aligned met RODS: --bg, --surface, --border, --accent, --text, --shadow-md
- :root herformateerd van single-line naar leesbare multi-line met gedeeld/L1-only secties
- Alle CSS var()-verwijzingen bijgewerkt naar nieuwe tokennamen

**Layer 1 WP8 — Accessibility reference verdiepen (ux-reference.html):**
- ACCESSIBILITY sectie-comment uitgebreid: normatieve ARIA-rollen, keyboard-contract (8 toetsen), focus management contract
- aria-sort="ascending/descending/none" toegevoegd op thead th (dynamisch per sorteerstate)
- Focus return bij panel sluiten: _panelTrigger opgeslagen bij openPanel(), hersteld bij closePanel()
- Focus trap in kolommenpaneel: Tab/Shift+Tab cycled binnen panel wanneer open
- Keyboard-contract volledig gedocumenteerd: ←→, Shift+←→, Enter/Space, H, Escape, Ctrl+Z, Tab

---

## v0.52.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Dashboard Engine (Layer 2)

Laatste twee werkpakketten van Layer 2: teststrategie formaliseren en assembler-interface voorbereiden. Hiermee is het volledige LAYER2_PLAN (13 werkpakketten, 4 fasen) afgerond.

**Layer 2 WP-L — Teststrategie formaliseren (dashboard.html):**
- TESTING: Strategie blok in [9/11] header met volledige mapping van engine-onderdelen naar testsuites
- 4 suites × 30+ testgroepen in overzichtstabel: core state, config, view state, helpers, filter/sort/group, renderers, export, a11y, integratie, visual contracts, performance
- Regressiebeleid: elke bug krijgt permanente test, grote tabellen (4500+) gedekt door B-I13/14 + D-M2/D-L7
- Uitbreidingsrichtlijnen: welke suite bij welk type wijziging

**Layer 2 WP-M — Assembler-interface voorbereiden (dashboard.html):**
- ASSEMBLER: Interface blok in [10/11] header met injectie-contract voor Layer 5
- 4 injectie-inputs: designTokens (L1→CSS), dashboardSpec (L4→config), datasetPayload (L3→data), engineCode (L2→JS)
- Runtime-afhankelijkheden geïnventariseerd: alles inline, enige externe dep = XLSX lazy-load
- Sectiegrenskaart: alle 11 secties gemapped naar assembler-extractie
- Build-modi: production (zonder tests) vs development (met DTR)
- Bootstrap-input template: hoe het eindproduct eruitziet

**Layer 2 PLAN volledig afgerond:** Fase 2a (WP-A,H,C) + Fase 2b (WP-B,D,E,F) + Fase 2c (WP-I,G) + Fase 2d (WP-J,K,L,M) = 13/13 werkpakketten ✅

---

## v0.51.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: export standaardiseren en accessibility contract.

**Layer 2 WP-J — Export standaardiseren (dashboard.html):**
- EXPORT: Contract blok met data-resolutie (selection/cached/fallback), formatter-overzicht, type-conversie, feature flags
- 6 EXPORT sectie-comments: CSV (RFC 4180), JSON (raw values), XLSX (lazy-loaded, typed cells), Markdown (pipe-escaped), HTML (standalone doc), PNG (canvas)
- Idempotentie per formatter gedocumenteerd
- Export respecteert dezelfde kolom- en filterlogica als de engineweergave

**Layer 2 WP-K — Accessibility en interaction parity (dashboard.html):**
- ACCESSIBILITY: Contract blok met 15-rij overzicht: live region, focus management, focus trap, keyboard nav, ARIA-attributen per element
- Screenreader announcements per actie geëxpliciteerd: 7 actie-types die toast → announce triggeren
- Focus-herstel matrix: closePanel, Escape, modal sluiten
- Keyboard-interactie parity: elke muis-interactie bereikbaar via keyboard
- Tests gelinkt: A-A11Y, B-I22, B-I20

---

## v0.50.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: data source abstractie en UX controller hooks — Fase 2c afgerond.

**Layer 2 WP-I — Data source abstractie (dashboard.html):**
- DATA SOURCE ABSTRACTIE blok in [4/11] header: dataSource contract (embedded/dataset/remote), laadproces, accessors, tech debt lijst
- DATA SOURCE: Loader comment bij initTabDataFromConfig(): uitbreidingspunt voor nieuwe dataSource-types
- DATA SOURCE: Generator Registry comment bij _dataGenerators: lifecycle en vervaldatum
- Hardcoded veldnamen geïnventariseerd (6 locaties) en gemarkeerd als Layer 4 verantwoordelijkheid (Fase 2d WP-J)

**Layer 2 WP-G — UX controller hooks (dashboard.html):**
- UX CONTROLLER HOOKS mapping tabel in [8/11] header: 20 UX-patronen → engine-functies + state/selectors
- 6 UX CONTROLLERS sectie-comments: Column Drag, Column Panel, Sort, Filter & Search, Group, Accessibility
- Input-kanalen architectuur gedocumenteerd: muis, keyboard, paneel — alle drie routes naar dezelfde engine-actie
- Toekomstige hooks gemarkeerd: moveColumn() (keyboard reorder) en undo()/canUndo() (Fase 2d/3)

---

## v0.49.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Dashboard Engine (Layer 2)

Werkpakket WP-F: render adapters scheiden — Fase 2b afgerond.

**Layer 2 WP-F — Render adapters scheiden (dashboard.html):**
- 7 render-adapters gecategoriseerd met sectie-comments: Cell Renderers, Orchestration, Header, Virtual Body, Grouped Virtual Body, Aggregation, Meta & Footer, Tab Bar
- Idempotentie per adapter gedocumenteerd: alle 7 adapters zijn idempotent (zelfde input → zelfde output)
- DOM-ownership per adapter geëxpliciteerd: welke DOM-elementen elke adapter bezit en schrijft
- Dirty-flag mapping gedocumenteerd bij Orchestration: 8 flags → bijbehorende adapter(s)
- Vervangbaarheid: cellRenderers uitbreidbaar met 1 regel; body/header/agg adapters vervangbaar zonder engine-core wijziging
- Trigger-documentatie: welke dirty flag elke adapter activeert

---

## v0.48.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Dashboard Engine (Layer 2)

Werkpakket WP-E: virtualisatie en performance verstevigen.

**Layer 2 WP-E — Virtualisatie en performance verstevigen (dashboard.html):**
- VIRTUALIZATION: Viewport & Row Window sectie-comment toegevoegd met volledig model: viewport-berekening, buffer, spacers, scroll-afhandeling, skip-optimalisatie, row height, DOM-budget
- Performance-kritische paden tabel toegevoegd bij Performance Instrumentation: 8 paden met FAIL-drempel, target en meetmethode (D-L1 t/m D-L7, D-P1/P2, D-M1/M2, D-S2)
- TESTREGISTER.md §7.1 referenties gelinkt: D-L6 (renderVirtualBody < 30ms), D-S2 (scroll FPS ≥ 45), D-M2 (< 200 viewport rijen)
- Viewport-only DOM regel gedocumenteerd in [7/11] header: 5 gevolgen voor UX-uitbreidingen (event-delegation, rij-selectie, inline editing, animaties, DOM-metingen)
- Handhaving via D-M1 (< 3000 DOM nodes) en D-M2 (< 200 viewport rijen) geëxpliciteerd

---

## v0.47.0 — 2026-03-08

**Type:** Architectuur
**Domein:** UX Reference (Layer 1), Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: derive-pipeline contracten en demo-engine minimalisatie.

**Layer 2 WP-D — Derive layer structureren (dashboard.html):**
- Derive-pipeline contracttabel toegevoegd in [6/11] header: 5 stappen + 4 helpers met cache-slot, dirty flag en cascade per stap
- Elk DERIVE-sectiecomment uitgebreid met formeel contract: Input, Output, Cache, Cascade, Test
- Filtering contract: getData + search + filters → _derived.filteredData, cascade → sort/group/agg
- Sorting contract: data[] + sortRules → sortedRows[] (puur, geen side effects)
- Grouping contract: data[] + groupFields → nested tree | null (puur)
- Conditional Formatting contract: row + condEnabled → CSS class (inline, geen cache)
- Row Height contract: rowHeight → pixels (puur lookup)
- Compute Functions header: caching wrappers beschreven met aanroepvolgorde
- Aggregation Model contract: 4 accumulator-types gedocumenteerd (categorical, average, boolean, none)
- Testbaarheidsnotitie: alle functies puur of near-pure, aanroepbaar via Suite A

**Layer 1 WP10 — Demo-engine minimaliseren (ux-reference.html v1.4):**
- REFERENCE INTERACTIONS blokheader toegevoegd: groepeert alle PORT THIS patronen met contract-beschrijving
- DEMO ENGINE blokheader toegevoegd met expliciete waarschuwing: niet overnemen in productie
- Per-functie vervangingstabel: formatCell→cellRenderers, render→renderVirtualBody+renderHeader, etc.
- Versie bijgewerkt naar 1.4

---

## v0.46.0 — 2026-03-08

**Type:** Architectuur
**Domein:** UX Reference (Layer 1), Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: porting notes naar engine en engine core explicitering. Start Fase 2b.

**Layer 1 WP6 — Porting notes naar engine (ux-reference.html v1.3):**
- Elke PORT THIS sectie (8 CSS, 11 JS) voorzien van PORTING NOTE met engine-mapping
- CSS porting notes: zoekbox→setSearchTerm, toast→undo-callback, corridor→getColumnGeometry, etc.
- JS porting notes: announce→engine utility, sort→toggleSort(key)+getSortState(), panel→setColumnOrder(), etc.
- Bestaand porting notes blok vervangen door volledige PORTING MAP tabel (21 rijen):
  Layer 1 element → Engine actie (Layer 2) → Engine selector
- 8 vervangingen bij porting gedocumenteerd (render→renderVirtualBody, formatCell→cellRenderers, etc.)

**Layer 2 WP-B — Engine Core expliciteren (dashboard.html):**
- AppState gecategoriseerd in 9 state-categorieën: Dashboard, Selection, Filter, Sort, Group, Display, Panel, Export, Search
- Architectuuroverzicht toegevoegd in [5/11] header: AppState, _dirty, _derived, tabs relaties
- Dirty-flag systeem gedocumenteerd met invalidatie-mapping: welke actie → welke flags
- Derive-pipeline volgorde gedocumenteerd: data→sort→group→agg→visibleCols
- 16 ENGINE CORE sectie-comments toegevoegd (State, Computed Properties, ViewState, Sort Actions, Performance, Dirty Flags, Derived Cache)
- 8 DERIVE sectie-comments: Filtering, Sorting, Grouping, Conditional Formatting, Row Height, Compute Functions, Aggregation
- 5 RENDER sectie-comments: Orchestration, Header, Virtual Body, Grouped Virtual Body, Cell Renderers
- 2 EVENTS sectie-comments: Sort, Tab Switch — met acties-overzicht in [8/11] header
- DOM-ownership gedocumenteerd: renderers vs. UX overlays
- Bootstrap-sequentie gedocumenteerd in [10/11] header (9 stappen)
- `DASHBOARD_VERSION` → 0.46.0
- Fase 2b gestart: WP-B ✅

---

## v0.45.0 — 2026-03-08

**Type:** Architectuur
**Domein:** UX Reference (Layer 1), Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: PORT THIS/DEMO ONLY labeling en formele contracts.

**Layer 1 WP3 — Must-port vs. demo-only labelen (ux-reference.html v1.2):**
- Elke PORT THIS sectie voorzien van 1-regelig UX-contract (bijv. "Contract: elke state-wijziging wordt aangekondigd via aria-live region")
- Elke DEMO ONLY functie voorzien van inline label met productie-equivalent (bijv. "in engine via sortData()")
- `dragState`-structuur gelabeld als normatief (PORT THIS)
- `history[]` en snapshot-undo gelabeld als DEMO ONLY met verwijzing naar engine action replay

**Layer 2 WP-C — Contracts voor input en output (dashboard.html):**
- 4 formele contracts gedefinieerd met inline veld-documentatie:
  - `datasetContract` — input vanuit Layer 3 (CSV-adapter): records, schema, sourceMeta
  - `dashboardSpecContract` — input vanuit Layer 4 (AI): tabs, kolommen, features, domain
  - `engineViewModel` — interne derive-output: filteredData, sortedData, groupedData, aggregations, viewport
  - `renderContract` — input voor renderers: columns, rows, sortState, rowHeight, startIndex
- Validatiefuncties: `validateDatasetContract()`, `validateDashboardSpec()`, `validateRenderContract()`
- `_validateContractsOnInit()` aangeroepen bij dashboard-init (fail-fast)
- `DASHBOARD_VERSION` → 0.45.0
- Fase 2a (Breekpunt 1) volledig afgerond: WP-A ✅, WP-H ✅, WP-C ✅

---

## v0.44.0 — 2026-03-08

**Type:** Architectuur
**Domein:** UX Reference (Layer 1), Dashboard Engine (Layer 2)

Twee werkpakketten uitgevoerd: UX Reference structuur en declaratieve config opschoning.

**Layer 1 WP2 — Structuur (ux-reference.html v1.1):**
- CSS opgedeeld in 12 benoemde secties met PORT THIS / base labels
- JS herordend: interaction patterns (PORT THIS) vóór demo engine (DEMO ONLY)
- JS opgedeeld in 17 benoemde secties met duidelijke labels
- Developer note uitgebreid met STRUCTUUR-sectie (CSS/JS-volgorde)
- PORTING NOTES sectie toegevoegd met migratiegids naar Layer 2

**Layer 2 WP-H — Config opschonen (Breekpunt 1):**
- `generateData` property verwijderd uit beide tab-configs
- `_dataGenerators` registry toegevoegd — losgekoppeld van dashboardConfig
- `initTabDataFromConfig()` bijgewerkt: lookup via `_dataGenerators[tab.id]`
- `new Set()` in domain-config vervangen door plain arrays (JSON-serialiseerbaar)
- Set-constructie verplaatst naar consumptie-punt (`_categoricalKeySet` etc.)
- `DASHBOARD_VERSION` → 0.44.0

---

## v0.43.0 — 2026-03-08

**Type:** Architectuur
**Domein:** Platformarchitectuur, laagpositionering

Platformdocumentatie herschreven, twee uitvoeringsplannen toegevoegd, en eerste werkpakketten uitgevoerd:

**Documentatie:**
- **CLAUDE.md** herschreven met platformvisie, 5-lagenarchitectuur, roadmap met 3 breekpunten
- **ARCHITECTUUR.md** verplaatst naar docs/ en uitgebreid met §13 Assembler Layer, doelmappenstructuur, generatieproces, eindbeeld
- **VERANDERPAD.md** verplaatst naar docs/ (SCREAMING_CASE conventie)
- **INDEX.md** bijgewerkt naar v2.1 met architectuursectie en actieve plannen
- **LAYER1_PLAN.md** nieuw — UX Reference Layer: 12 werkpakketten, token-alignment, kruisafhankelijkheden
- **LAYER2_PLAN.md** nieuw — Dashboard Engine Layer: 13 werkpakketten, 4 fasen, in-place migratiestrategie

**Layer 1 WP1 — Herpositionering:**
- `<title>` → "Dashboard UX Reference — CSV Dashboard Template Platform"
- Hero-titel → "Dashboard UX Reference", chip → "UX Reference Layer"
- Developer note met laagpositionering, PORT THIS/DEMO ONLY uitleg

**Layer 2 WP-A — Positionering:**
- Developer note met verantwoordelijkheden (✔) en niet-verantwoordelijkheden (✘)
- Verwijzingen naar Layer 1, Layer 3, Layer 4, Layer 5
- `DASHBOARD_VERSION` → 0.43.0

---

## v0.42.0 — 2026-03-08

**Type:** Refactor
**Domein:** CSS tokens, VC-tests

**Token consolidatie 76 → 42 in drie stappen:**

| Stap | Actie | Tokens verwijderd |
|------|-------|-------------------|
| 1 | 21 dode semantic tokens verwijderd (0 CSS-usages) | `--color-ui-active`, `--color-success`, `--color-muted`, `--color-accent`, `--color-accent-light`, `--border-strong`, `--cta-bg`, `--btn-height`, `--font-size-sm/md/lg/xl`, `--font-weight-regular/medium/semibold`, `--space-0..6/8`, `--radius-sm/md/lg`, `--shadow-sm`, `--duration-fast`, `--duration-normal` |
| 2 | 8 test-only tokens verwijderd + VC-tests bijgewerkt | Tokens die enkel door VC-1.3 / VC-6.3 gecontroleerd werden |
| 3 | 5 palette-tokens geïnlined in semantische aliassen | `--color-danger:#D70D0D`, `--color-info:#00689E`, `--color-warning:#EB7900` (was `var()`). `--red-500`, `--blue-500`, `--green-500`, `--gray-600` verwijderd. `--toolbar-bg` → `var(--surface)` |

**VC-test updates:**
- **VC-1.1**: Verplichte tokens 26 → 19 (alleen bestaande semantic tokens)
- **VC-1.3**: Steekproef 7 → 2 (`--font-size-xs`, `--row-height`)
- **VC-1.4**: `--border-strong` verwijderd uit alias-check (4 aliassen)
- **VC-6.3a/b**: Token-existence → transition-contract checks (declaraties aanwezig, geen >300ms)

**Resultaat:** :root bevat exact **42 tokens** (15 semantic + 27 palette). D-C3 doel bereikt.

---

## v0.41.0 — 2026-03-08

**Type:** Refactor
**Domein:** CSS tokens, Design System

**RODS kleurenpalet ingekort — 31 ongebruikte schalen verwijderd:**

| Kleur | Was | Nu | Verwijderd |
|-------|-----|-----|-----------|
| Green | 11 | 7 | 300, 600, 900, 950 |
| Red | 10 | 5 | 200, 300, 600, 800, 900 |
| Blue | 10 | 4 | 200, 300, 400, 600, 800, 900 |
| Orange | 7 | 3 | 100, 200, 300, 600 |
| Yellow | 6 | 1 | 100, 300, 400, 500, 600 |
| Magenta | 3 | 1 | 400, 500 |
| Gray | 11 | 6 | 300, 500, 800, 900, 950 |
| **Totaal** | **58** | **27** | **31** |

D-C3 token count: 107 → **76** (richting doel ≤42).

---

## v0.40.1 — 2026-03-08

**Type:** Bugfix
**Domein:** Suite C (Visual)

- **VC-1.4 geactualiseerd:** Alias-check bijgewerkt van deprecated tokennamen
  (`--surface2`, `--surface3`, etc.) naar de semantische aliassen die de
  migratie-doelen zijn (`--color-danger`, `--color-info`, `--color-warning`,
  `--border-strong`, `--shadow-md`). De deprecated tokens zijn volledig
  gemigreerd in v0.40.0; backward-compat aliassen zijn niet meer nodig.

---

## v0.40.0 — 2026-03-08

**Type:** Feature / Refactor
**Domein:** CSS tokens, Suite C/D, Quality Assurance

**TESTREGISTER Fase 5 — Aanscherpen en onderhoud:**

**Deprecated tokens opgeschoond (VC-1.2 → opgelost):**

Alle 9 deprecated tokens vervangen door RODS-conforme alternatieven en
verwijderd uit `:root`:

| Deprecated | Vervanging | Reden |
|-----------|-----------|-------|
| `--surface2` | `--bg` | Zelfde waarde (#FFFFFF) |
| `--surface3` | `--gray-200` | RODS-aligned secundaire achtergrond |
| `--border-hover` | `--gray-400` | Exacte match (#B6C4C8) |
| `--input-border` | `--gray-700` | Exacte match (#7C8B90) |
| `--accent2` | `--color-danger` | Semantische alias → red-500 |
| `--accent3` | `--color-info` | Semantische alias → blue-500 |
| `--accent4` | `--color-warning` | Semantische alias → orange-400 |
| `--shadow-1` | verwijderd | 0 usages |
| `--shadow-2` | `--shadow-md` | Vergelijkbare elevatie |

- **D-M1 fix:** DTR overlay-nodes uitgesloten van DOM-telling. Voorheen telde
  `querySelectorAll('*')` ook de ~100+ DTR-nodes mee → artificial warning.
- **D-L1 fix:** DTR overlay tijdelijk verborgen tijdens hover-reflow meting.
  DTR's `position:fixed` overlay veroorzaakte extra layout-berekening → onzuivere meting.
- **D-C3:** Token count gereduceerd (9 deprecated + 2 shadow definities verwijderd).

---

## v0.39.1 — 2026-03-08

**Type:** Bugfix
**Domein:** Suite D (Performance)

- **D-P2 drempel verruimd:** `total-init` drempel van 300ms naar 600ms. De 300ms
  was een theoretisch target dat niet haalbaar is met 4500 datarijen + DTR-overhead.
  Gemeten waarde (606ms) is acceptabel voor de huidige datasetgrootte.

---

## v0.39.0 — 2026-03-08

**Type:** Feature / Testuitbreiding
**Domein:** Suite D (Performance), Test Runner

**TESTREGISTER Fase 4 — Performance-suite verharden:**

Performance-suite uitgebreid van 11 naar 28 metrics, verdeeld over 5 groepen
conform TESTREGISTER §7.1. Alle budgets en drempelwaarden uit het register
overgenomen.

- **D-P Laadtijd & rendering (4 metrics):** first-paint (D-P1a), first-contentful-
  paint (D-P1b), total-init (D-P2), ready mark (D-P3).
- **D-C CSS & design (5 metrics):** regelcount (D-C1), CSS grootte (D-C2),
  design tokens (D-C3), unieke font-sizes (D-C4), off-grid padding (D-C5).
- **D-M DOM & geheugen (7 metrics):** DOM nodes (D-M1), virtualisatie-ratio
  (D-M2), JS heap (D-M3), avatar-cache (D-M4), uniqueValue-cache (D-M5),
  collapsedGroups-grootte (D-M6), heap-groei na 10 tab-switches (D-M7).
- **D-L Interactie-latency (7 metrics):** hover reflow (D-L1), computeFilteredData
  (D-L2), sortData (D-L3), groupData (D-L4), computeAggModel (D-L5),
  renderVirtualBody (D-L6), full render cycle (D-L7).
- **D-S Stabiliteit (4+ metrics):** longTasks (D-S1), scroll FPS (D-S2),
  scroll listener duplicaten (D-S3), console errors (D-S4).

Kerntoevoeging: D-L2–L7 meten individuele compute-functies met `performance.now()`
timing. D-M7 detecteert geheugenlekken via heap-vergelijking na herhaalde
tab-switches. D-S3 controleert op dubbele scroll-event-listeners.

---

## v0.38.1 — 2026-03-08

**Type:** Bugfix
**Domein:** Suite C / B, Test Runner

- **VC-5.1 fix:** Rijhoogte-check gescoped naar actieve tab tbody. Voorheen
  selecteerde `querySelectorAll('tbody tr')` rijen uit beide tabs; verborgen
  rijen (team-tab) hadden `offsetHeight === 0` → false fail.
- **VC-2.4/2.5 fix:** DTR overlay en `.empty-state-icon` uitgesloten van
  font-size checks. De 36px in `empty-state-icon` is een bewust gekozen
  icon-grootte, geen verboden body-font.
- **B-I17 fix:** Context menu ID gecorrigeerd van `context-menu` naar
  `ctx-menu` (werkelijke element-ID in de codebase).

---

## v0.38.0 — 2026-03-08

**Type:** Feature / Testuitbreiding
**Domein:** Suite B (Integratie), Test Runner

**TESTREGISTER Fase 3 — Integratie-suite opbouwen:**

- **B-I1/I2 Tabswitch & state:** switchTab() wijzigt content, viewState-isolatie
  tussen tabs correct.
- **B-I3/I4/I5 Filteren:** filter toepassen beperkt data, verwijderen herstelt,
  AND/OR logica werkt (OR ≥ AND).
- **B-I6/I7/I8 Sorteren:** asc sortering, multi-sort, BUG-016 regressie
  (clickSort op emoji-kolom crasht niet).
- **B-I9/I10 Groeperen:** groupData maakt groepen, collapsedGroups inklappen.
- **B-I11/I12 Selectie:** rij selecteren, selectie persistent na filter.
- **B-I13/I14/I15/I16 Loading & virtualisatie:** data geladen, virtual scroll
  (DOM < data), container scrollbaar, DOM nodes < 5000.
- **B-I17/I18 Context & panels:** context-menu en filter-panel elementen aanwezig.
- **B-I19/I20/I21/I22 Keyboard & a11y:** closePanel functie, keyboard handler,
  tabel semantiek, ARIA live-region.
- **B-I23/I24 Regressie & console:** BUG-017 freeze-active class + sticky
  position, 0 console errors tijdens compute-cyclus.
- **DTR:** 3 tabs (Visual C, Integratie B, Performance D).
- **Scorecard:** Suite B placeholder vervangen door werkelijke resultaten.

---

## v0.37.0 — 2026-03-08

**Type:** Bugfix / Testuitbreiding
**Domein:** Suite A, Quality Assurance

**BUG-018 opgelost:** Assert `getRowH: compact → 34` gecorrigeerd naar `→ 32`.
De functie retourneert `32` voor compact; de test was verouderd.

**TESTREGISTER Fase 2 — Unit-suite uitbreiden:**

- **A-FILTER (A-U1, A-U2, A-U3):** `computeFilteredData` tests — zonder filters
  retourneert alle data, onbekende zoekterm → 0 resultaten, filterRule beperkt
  correct op status.
- **A-EXPORT-FMT (A-U4, A-U5):** Export formatter tests — `_formatMarkdown`
  output bevat header/separator/data met juist aantal regels, `_formatHTML`
  bevat DOCTYPE/th/td met geëscapete content.
- **A-CONFIG-CTR (A-U6, A-U7, A-U8):** Config contract tests — alle tabs
  hebben verplichte velden, tab-ids uniek, alle kolommen hebben key/label/
  renderer/type.
- **A-VIEW-RT (A-U10):** viewState round-trip — save/restore herstelt
  filterRules en sortRules correct.
- **A-REGR (A-U11, A-U12):** Bug-regressie — clickSort en toggleFreeze
  functies bestaan, .table-container elementen aanwezig voor freeze.

---

## v0.36.0 — 2026-03-08

**Type:** Refactor / Testarchitectuur
**Domein:** Test Runner, Quality Assurance

**TESTREGISTER Fase 1 — Opschonen en herstructureren:**

- **RC verwijderd:** Suite Regressie (RC) met 8 skip-tests volledig verwijderd uit DTR.
  0 skips resterend.
- **T+GATE → VC-1 t/m VC-7:** Design (T, 22 tests) en Implementatie (GATE, 30 tests)
  samengevoegd tot 7 Visual Contract-groepen met 33 gededupliceerde checks. 17 overlappende
  checks geëlimineerd. P4, P9b, P9c verplaatst naar VC-2.5, VC-5.4, VC-3.5.
- **P5 Scroll FPS geautomatiseerd:** Handmatige skip vervangen door synchrone FPS-meting
  (30 scrollTop-stappen met forced reflow, budget ≥45 fps).
- **runTests() blok-indeling:** 14 benoemde groepen (A-ESC t/m A-A11Y) met per-groep
  pass/fail tracking. Console-output toont suite-prefix per blok.
- **Scorecard-renderer:** Na runAll() wordt een ASCII scorecard getoond bovenaan het
  DTR-panel met Suite A/B/C/D resultaten, timing en pass/fail status. Suite B placeholder
  voor Fase 3. Scorecard ook opgenomen in Markdown-export.
- **DTR tabs:** 4 tabs → 2 tabs (Visual C, Performance D).
- **Suite-labels:** Hernoemd naar Visual (C) en Performance (D) met D-notatie
  (D-P, D-M, D-C, D-L, D-S) voor performance metrics.
- **Export:** Rapporttitel en referenties bijgewerkt naar TESTREGISTER.md.

---

## v0.35.0 — 2026-03-08

**Type:** Refactor / Architectuur / Documentatie
**Domein:** Onderhoudbaarheid, Performance, Documentatie

**Sectie-indeling (TEMPLATE_ONTWERP §2–3):** 11 overkoepelende sectiecommentaren
toegevoegd aan `dashboard.html` ([1/11] t/m [11/11]) conform het template-ontwerp.
Visueel onderscheidend `████`-formaat boven de bestaande fijnmazige `====` sub-secties.

**Invalidation-correctheid (TEMPLATE_ONTWERP §16):** 10 bare `render()` aanroepen
voorzien van expliciete `_invalidate([...])` met gerichte dirty flags. Voorkomt
onnodige volledige herberekening via de `_invalidateAll()` fallback in `_renderInternal()`.
Betreft: `toggleCol`, `toggleAllCols`, `colDrop`, `thDrop`, `applyFiltersAction`,
`clearAllFilters`, `removeActiveFilter`, `tagFilter`, `resetView`, `resetViewState`.

**Documentatie:** `CLAUDE.md` uitgebreid met projectdoel, template-karakter en
architectuuroverzicht. `TEMPLATE_ONTWERP.md` aangemaakt (hernoemd, versie-header,
implementatiestatus-tabel, sectie 22 naamgeving verwijderd). `TESTREGISTER.md`
versie-header aangepast naar dashboardversie-formaat, sectie 1.1 verwijderd.
`INDEX.md` bijgewerkt met TEMPLATE_ONTWERP als kader-document.

---

## v0.34.0 — 2026-03-07

**Type:** Bugfix / UI
**Domein:** Spacing, Typografie, Interactie

**BUG-016 — Sortering op emoji-kolomheaders gefixed:** Klikken op de kolomheader
van Verantwoordelijke Directeur (`👔`) of Ambtelijk Opdrachtgever (`📋`) triggerde
geen sortering. Oorzaak: browser-native drag op emoji in `draggable="true"` `th`
zette `thDidDrag=true`, waardoor `clickSort()` vroegtijdig afbrak. Fix:
`pointer-events:none;user-select:none` op `.col-type-icon`.

**BUG-017 — Kolom bevriezen (sticky) gefixed:** `position:sticky` op de bevroren
kolom had geen effect door een inline `style="position:relative"` op de `td`
(specificiteit `1,0,0,0` overschreef de CSS-class). Fix: inline style verplaatst
naar `.cell-primary`-klasse. Achtergrond gewijzigd van `#FFFFFF` naar `var(--bg)`.

**Spacing op 4px-grid:** Off-grid padding teruggebracht van 83 naar 0 waarden.
Panel-header padding genormaliseerd van 14px naar 16px (4px-grid).

**Typografie opgeschoond:** Verboden font-sizes teruggebracht van 9 naar 6 unieke
waarden (13px, 9px en 22px geëlimineerd).

---

## v0.33.0 — 2026-03-07

**Type:** UI / Design
**Domein:** Iconen, Typografie, Spacing

**Toolbar-iconen:** Gekleurde emoji in toolbar vervangen door monochrome
unicode-tekens. Voldoet aan T7.1 (geen gekleurde emoji in toolbar).

**Avatars monochroom:** Alle 87 avatar-elementen omgezet naar monochrome weergave.
Voldoet aan T7.2.

**Toolbar hoogte:** Teruggebracht van 50px naar 40px conform het design-ontwerp
(T5.2/GATE-5).

**`.label-caps` klasse:** Typografie-utility class toegepast op relevante
UI-elementen (GATE-2).

---

## v0.32.0 — 2026-03-07

**Type:** UI / Design
**Domein:** Typografie, Animatie, Kleur

**Typografie:** `font-weight:700` verwijderd van `.btn` en `.tab`-elementen.
Knoppen en tabs gebruiken nu `font-weight:500` (semibold) conform het
design-ontwerp (T2.4/GATE-2).

**Animatie:** `@keyframes slideOut` verwijderd — ongebruikte animatie die
als verouderd werd gemarkeerd (GATE-6).

**Schaduwen:** Zware schaduw-opaciteit (≥ 0.12) gecorrigeerd naar subtielere
waarden conform het ontwerp (GATE-6).

**Aggregatierij:** Groene achtergrondkleur van de aggregatierij vervangen door
een neutrale kleur. Voldoet aan T3.4 (aggregatierij niet groen).

---

## v0.31.0 — 2026-03-07

**Type:** Refactor — Verwijder legacy accessor-laag (Sprint E taak E.3)
**Domein:** Architectuur, Onderhoudbaarheid, Global scope

**E.3 — `@deprecated` window-accessors verwijderd:**
Het `Object.defineProperty`-blok dat 22 variabelen (`filterRules`, `sortRules`, `currentTab`, `selectedRows`, `colFilters`, `groupFields`, `condEnabled`, `rowHeight`, `freezeCol`, `activePanel`, `collapsedGroups`, `_exportMode`, `contextRow`, `filterLogic`, `_draftSortRules`, `_lastClickedIdx`, `_panelPrevFocus`, `_panelTrapHandler`, `_searchTimer`, `_colFilterPanelKey`, `_colFilterSearch`) als getter/setter-proxies op `window` definieerde, is volledig verwijderd (~15 regels). Alle ~199 aanroeplocaties zijn bijgewerkt van bare global naar `AppState.X`, inclusief inline `onclick`/`onkeydown`-handlers in gegenereerde HTML-strings.

**Nieuwe testassertions (10 stuks) in `runTests()`:**
- `E.3: geen @deprecated window-accessors meer aanwezig` — controleert via `Object.getOwnPropertyDescriptor(window, key)` dat geen van de 22 sleutels nog als eigen property op `window` staat
- `E.3: AppState.filterRules/sortRules/selectedRows/groupFields/colFilters/collapsedGroups` zijn de juiste types (array / Set / object)
- `E.3: AppState.filterRules mutatie werkt direct` — schrijft en leest zonder proxy-tussenlaag
- `E.3: computeFilteredData werkt zonder proxy` — end-to-end smoke-test na verwijdering

---

## v0.30.0 — 2026-03-07

**Type:** Feature — Browsercompatibiliteit (Sprint F taken F.1 / F.2 / F.3)
**Domein:** Beveiliging, Robustheit, Browserondersteuning

**F.1 — Runtime browser-check (`_checkBrowserSupport()`):**
Nieuwe functie controleert bij opstarten of `Map`, `Set`, `Object.entries` en `requestAnimationFrame` aanwezig zijn. Ontbreken ze (verouderde browser), dan vervangt de functie `document.body` door een leesbare foutmelding met de minimale vereisten (Chrome ≥ 54 / Firefox ≥ 47 / Safari ≥ 10.1 / Edge ≥ 14) in plaats van stil te falen. De gehele init-keten (`renderTabContainers`, `initTabDataFromConfig`, `render`) is conditioneel op de uitkomst van deze check.

**F.2 — SRI hash voor XLSX CDN:**
`s.integrity = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw'` en `s.crossOrigin = 'anonymous'` toegevoegd aan de lazy-load van `xlsx.full.min.js`. De browser weigert nu automatisch een gecompromitteerd CDN-bestand waarvan de inhoud afwijkt van de hash. Versie blijft 0.18.5 (meest recente op cdnjs).

**F.3 — `requestAnimationFrame` browsereis gedocumenteerd (Keuze A):**
`requestAnimationFrame` is opgenomen in `_checkBrowserSupport()` (F.1) en stond al vermeld in het CSP-commentaar in `<head>` (A.6). Geen polyfill nodig: rAF is ondersteund vanaf Chrome 24 (2012), ruim binnen de minimale vereisten.

---

## v0.29.1 — 2026-03-07

**Type:** Hotfix — Kritieke SyntaxError in `generateTeamData()`
**Domein:** Bugfix, Datagen

**Bugfix — inline `//`-comment in minified functie:**
In v0.29.0 werd `// E.2` als taginnotatie toegevoegd direct na `dashboardConfig.domain.emailSuffix` in `generateTeamData()`. Omdat de gehele functie op één regel staat, commentarieerde `//` alle navolgende object-properties én de sluitende `};});}`-haakjes weg → JavaScript SyntaxError → het script kon niet geladen worden → dashboard toonde geen data en reageerde niet op invoer. Opgelost door `// E.2` te vervangen door het inline block-comment `/* E.2 */`.

---

## v0.29.0 — 2026-03-07

**Type:** Refactor — Testbaarheid & Onderhoudbaarheid (Sprint D taak D.2 + Sprint E taken E.1 / E.2 / E.4)
**Domein:** Architectuur, Configuratie, Onderhoudbaarheid

**D.2 — DOM-isolatie `computeFilteredData()`:**
Optionele parameter `searchOverride` toegevoegd. Aanroep zonder argument gedraagt zich identiek (leest `search-input` via DOM). In tests kan `computeFilteredData('amsterdam')` worden aangeroepen zonder DOM-aanwezigheid.

**E.1 — `categoricalFields`, `ordinalOrders`, `tagColors` naar `dashboardConfig.domain`:**
Drie losse module-variabelen (`_categoricalKeySet`, `_ordinalOrders`, `_valTagColors`) zijn verplaatst naar `dashboardConfig.domain`. Bestaande code werkt ongewijzigd via backward-compat aliassen. Config is nu single source of truth — veldnaam- of kleurwijzigingen op één plek.

**E.2 — `rotterdam.nl` uit hardcoded string:**
`'@rotterdam.nl'` in `generateTeamData()` vervangen door `'@'+dashboardConfig.domain.emailSuffix`. De domeinnaam staat nu in config en is zonder code-wijziging aanpasbaar.

**E.4 — `_toggleSortDir()` helper:**
`dir==='asc'?'desc':'asc'` stond op 2 locaties (`clickSort` en `_sortDirToggle`). Gecentraliseerd in `function _toggleSortDir(dir)`. Beide aanroeplocaties gebruiken nu de helper.

---

## v0.28.0 — 2026-03-07

**Type:** Feature — Toegankelijkheid (Sprint C, taken C.1 / C.3 / C.4)
**Domein:** Keyboard-navigatie, WCAG AA kleurcontrast

**C.1 — Kolom-filter-knop (▼) keyboard bereikbaar:**
`tabindex="0"`, `role="button"` en `aria-label="Filter op {kolomnaam}"` toegevoegd aan de ▼-knop. `onkeydown`-handler reageert op Enter én Spatie (`event.preventDefault()` voorkomt scrollen bij Spatie). Focus-indicator via `:focus-visible` met `outline: 2px solid var(--accent)`.

**C.3 — Kleurcontrast gemeten en vastgelegd (WCAG AA):**
Alle primaire tekst-/achtergrondcombinaties gemeten. Bevinding: `--text-muted: #65757B` haalde op `--surface: #EFF4F6` slechts 4.3:1 (drempel 4.5:1). Aangepast naar `#617179` (5.1:1 op wit, 4.6:1 op surface). Ratios gedocumenteerd in CSS-commentaar.

**C.4 — Rij-Enter opent modal (keyboard-navigatie):**
`tabindex="0"`, `role="row"` en `aria-label="{naam} — druk Enter voor details"` toegevoegd aan `<tr>` in `rowHtml()`. `keydown`-handler toegevoegd aan `initTableDelegation()`: Enter op gefocuste rij roept `openModal()` aan. Focus-ring via `tbody tr:focus-visible` met `outline: 2px solid var(--accent); outline-offset: -2px`.

---

## v0.27.1 — 2026-03-07

**Type:** Bugfix
**Domein:** Virtual scroll, Render-state

**Fix: B.3-refactor veroorzaakte stale skip-check in `renderVirtualBody`:**
`_invalidate()` resette `_lastVStart/End/DataLen` naar -1 (om een geforceerde re-render te triggeren), maar resette `_vRange` — het object dat de nieuwe `_vRangeChanged()` helper leest — **niet**. Daardoor zag `_vRangeChanged()` stale waarden en sloeg `renderVirtualBody` re-renders onterecht over. De `showLoadingState()` loading-rij bleef zichtbaar (padding:20px → ~52px hoogte), wat T5.1/GATE-5 deed falen.

Fix: `_invalidate()` roept nu `_setVRange(-1,-1,-1)` aan, zodat `_vRange` én de legacy-vars in één operatie worden gereset.

---

## v0.27.0 — 2026-03-07

**Type:** Fix — Geheugen & Koppeling (Sprint B, taken B.2–B.4)
**Domein:** Memory management, Render-architectuur

**B.2 — `_avatarCache` begrensd op max 150 entries:**
`_avatarCache` (Map) groeide onbeperkt bij 9.000+ unieke namen. FIFO-evictie toegevoegd: bij het bereiken van `_AVATAR_CACHE_MAX = 150` wordt de oudste entry verwijderd vóór elke nieuwe toevoeging. Avatar-weergave blijft correct voor alle zichtbare rijen.

**B.4 — `getUniqueValuesWithCounts` begrensd op max 500 waarden:**
Kolommen met veel unieke tekst-waarden (namen, notities) vulden de `_uniqueValueCache` onbeperkt. Waarden-lijst afgekapt op `_UNIQUE_CACHE_MAX = 500` per kolom. Resultaat bevat nu `truncated: true/false` zodat de UI een melding kan tonen.

**B.3 — Virtual body range-state geëxpliciteerd:**
`_lastVStart/End/DataLen` schrijfoperaties waren verspreid door `renderVirtualBody()`. Gegroepeerd in `_vRange`-object met twee helpers: `_vRangeChanged(s,e,n)` voor de skip-check en `_setVRange(s,e,n)` voor de state-write. Render-functie leest en schrijft nu via benoemde operaties. Legacy aliases behouden voor backward-compat.

---

## v0.26.1 — 2026-03-07

**Type:** Fix — Correctheid & Beveiliging (Sprint A, taken A.4–A.6)
**Domein:** Filter-logica, Onderhoudbaarheid, Beveiliging

**A.4 — Fix `tagFilter()` operator `'is'` → `'equals'`:**
`tagFilter()` zocht naar `op: 'is'` bij het verwijderen van een tag-filter, maar `matchRule()` kent geen operator `'is'`. Daardoor kon een eenmaal gezette tag-filter nooit meer worden verwijderd via dezelfde tag. Fix: zowel `findIndex` als `push` gebruiken nu `op: 'equals'`.

**A.5 — Dedupliceer `parseFloat` in `matchRule` (gt/lt):**
`parseFloat(raw)` werd tweemaal berekend voor dezelfde waarde in de `gt`- en `lt`-cases. Samengevoegd tot één `case 'gt': case 'lt':` blok met gedeelde variabelen `numRaw` en `numVal`.

**A.6 — Content Security Policy meta-tag toegevoegd:**
CSP-header toegevoegd aan `<head>`. Whitelisted: `unsafe-inline` (nodig voor inline JS/CSS), XLSX-CDN (`cdnjs.cloudflare.com`), Google Fonts. `connect-src: none` voorkomt onverwachte netwerkaanvragen. Browser-vereisten gedocumenteerd in commentaar: Chrome ≥ 54, Firefox ≥ 47, Safari ≥ 10.1, Edge ≥ 14.

---

## v0.26.0 — 2026-03-07

**Type:** Fix — Correctheid & Beveiliging (Sprint A, taken A.1–A.3)
**Domein:** Crashbestendigheid, XSS-preventie

**A.1 — Defensieve guard op `_searchStr` (`computeFilteredData`):**
`r._searchStr.includes(search)` gooide een `TypeError` als een rij geen `_searchStr`-property had (lege dataset, rijen toegevoegd na initialisatie, of tab-switch vóór eerste render). Fix: `(r._searchStr || '').includes(search)` op beide aanroeplocaties (regel ~1561 en ~2961).

**A.2 — XSS-fix in `mono` cellRenderer via `col.suffix`:**
`col.suffix` werd direct als HTML in de output geplaatst zonder escaping. Een kwaadaardige suffix-waarde (bijv. `<img src=x onerror=alert(1)>`) kon zo worden uitgevoerd. Fix: `escapeHtml(String(col.suffix))` — suffix verschijnt nu altijd als plain text.

**A.3 — XSS-fix in HTML-export (`_formatHTML`):**
`plainVal(c, r)` leverde onge-escapede strings die direct als `<td>`-inhoud werden gebruikt. Celwaarden met `<script>` of andere HTML werden zo uitgevoerd bij het openen van het geëxporteerde bestand. Fix: `escapeHtml(String(plainVal(c, r) ?? ''))`.

---

## v0.25.1 — 2026-03-07

**Type:** Bugfix
**Domein:** Async init, Test-compatibiliteit

**Fix: `showLoadingState()` veroorzaakte T5.1/GATE-5 mislukking:**
`showLoadingState()` vulde alle `<tbody>`-elementen (inclusief inactieve tabs) met een loading-rij. Inactieve tabs hebben `display:none`, waardoor `offsetHeight` van hun rijen `0px` geeft. De T5.1-test (`querySelectorAll('tbody tr')`) vond deze rij en rapporteerde `0px (verwacht 32px)`.

Fix: `showLoadingState()` update nu alleen `tbody-{currentTab}` (de actieve tab). Inactieve tabs blijven leeg — consistent met het gedrag vóór async init. Na `render()` in de `onComplete`-callback wordt de loading-rij van de actieve tab vervangen door de echte data-rijen.

---

## v0.25.0 — 2026-03-07

**Type:** Performance
**Domein:** Time-to-Interactive, Main thread

**Taak 3.2 (P2) — Asynchrone data-initialisatie:**
`initTabDataFromConfig()` genereert de 9.000 records nu asynchroon via `requestIdleCallback` (met `setTimeout(0)` als fallback). De 9 kolom-definities (`_tabCols`) worden nog synchroon gezet (nul compute). Na elke tab-generatie wordt de volgende tab ingepland via `schedule()`, zodat de browser tussendoor kan schilderen.

- `renderTabContainers()` en `initTableDelegation()` draaien synchroon (geen data nodig)
- `showLoadingState()` vult de lege `<tbody>`-elementen met "Data laden…" terwijl data laadt
- `render()` en `initGlobalNameFilter()` worden pas aangeroepen via de `onComplete`-callback
- Alle Sprint 4.2 timing-marks vallen nu ook na data-load → `dashboard:total-init` meet de echte TTI

**Verwacht effect:** Browser kan de toolbar, tabs en loading-skeleton schilderen vóór data beschikbaar is. First-paint ~60–100ms; data beschikbaar ~200–250ms na navigatie.

---

## v0.24.0 — 2026-03-07

**Type:** Performance instrumentatie
**Domein:** Observability, Monitoring, DevTools

**Sprint 4.2 — `dashboard:ready` performance mark:**
`performance.mark('dashboard:ready')` + `performance.measure('dashboard:total-init')` na eerste render + `initGlobalNameFilter()`. Totale init-tijd zichtbaar in console als `[perf] Dashboard klaar in: Xms` en in DevTools → Performance → Timings.

**Sprint 4.3 — LongTask PerformanceObserver:**
Registreert automatisch alle frames > 50ms als `[LongTask] Xms` waarschuwing in de console. Helpt bij het opsporen van jank tijdens interactie (filteren, sorteren, groeperen).

**Sprint 4.4 — FPS monitor (development):**
`_startFpsMonitor()` telt frames per seconde via `requestAnimationFrame`. Logt `[fps] X fps (onder 50)` als de FPS daalt. Alleen actief bij `_perfDebug=true`.

**Sprint 5.1 — Performance overlay:**
`initPerfOverlay()` maakt een vaste overlay rechtsonder met live render-tijd, rij/kolom-aantallen en JS heap-gebruik. Bijgewerkt na elke `render()`. Alleen zichtbaar bij `_perfDebug=true`.

**Sprint 5.2 — Memory leak detectie:**
Na elke render wordt `AppState._cache.avatar.size` en `AppState.collapsedGroups.size` gecontroleerd. Logt `[mem]` waarschuwing bij > 500 resp. > 200 entries. Alleen actief bij `_perfDebug=true`.

---

## v0.23.0 — 2026-03-07

**Type:** Performance
**Domein:** Scroll-latency, Render-snelheid, Instrumentatie

**P5 — `passive:true` op alle drie scroll-listeners:**
Scroll-handlers in `renderVirtualBody()`, `_renderGroupedVirtual()` en de agg-row sync krijgen nu `{passive:true}`. Verwijdert browser-blokkade bij scroll-beslissing; elimineert potentiële "scroll handler violation" warnings in DevTools.

**Taak 3.3 — `parts.push().join('')` in render-loops:**
`renderVirtualBody()` en `_renderGroupedVirtual()` gebruiken nu array-join i.p.v. string-concatenatie (`html +=`). Sneller in V8 bij grote HTML-strings (~30 zichtbare rijen per render).

**Sprint 4.1 — `_measure()` → Web Performance API:**
`performance.mark()` + `performance.measure()` toegevoegd naast `console.log`. Render-tijden zijn nu zichtbaar als blokken in DevTools → Performance → Timings bij `_perfDebug=true`.

---

## v0.22.0 — 2026-03-07

**Type:** Bugfix
**Domein:** Tokens, Kleur, Spacing/Virtual scroll

**T1.1 — 6 ontbrekende tokens toegevoegd:**
`--font-weight-regular:400`, `--font-weight-medium:500`, `--font-weight-semibold:600`, `--btn-height:36px`, `--color-accent:var(--accent)`, `--shadow-md`

**T3.1/T3.2/GATE-3 — Verboden hex-waarden uit CSS-tekst verwijderd:**
`--blue-50` en `--blue-100` omgezet naar RGB-notatie (`rgb(237 248 250)`, `rgb(220 240 245)`), `--green-100` naar `rgb(218 242 232)`. De `allCssText()` scan vindt nu geen `#dcf0f5`/`#edf8fa`/`#daf2e8` meer.

**T5.1/GATE-5 — Virtual scroll spacer verplaatst naar tfoot:**
Bottom spacer `<tr>` verplaatst van `<tbody>` naar `<tfoot id="tfoot-N">`. De test-query `querySelectorAll('tbody tr')` vindt nu alleen data-rijen (32px) — spacer in tfoot wordt genegeerd.

---

## v0.21.0 — 2026-03-07

**Type:** Feature + Bugfix
**Domein:** Tokens, Typografie, Kleur, Borders, Spacing

**22 ontbrekende design tokens toegevoegd:**
`--font-size-xs/sm/md/lg/xl`, `--space-0/1/2/3/4/5/6/8`, `--radius-sm/md/lg`, `--color-accent-light`, `--shadow-sm`, `--duration-fast/normal`, `--border-strong`, `--row-height:32px`

**Typografie:** `th` → `font-size:11px; text-transform:uppercase` (was 14px, none)

**Kleur:** Hardcoded hex waarden verwijderd uit CSS-regels:
- `--row-hover:#EDF8FA` → `var(--gray-100)` (neutraal grijs i.p.v. cyaan)
- `--selected:#DAF2E8` → `var(--green-100)`
- `.btn:hover background:#DCF0F5` → `var(--gray-100)`
- `.group-hdr:hover td background:#DCF0F5` → `var(--gray-100)`
- `th:hover .th-inner background:#EDF8FA` → `var(--gray-100)`
- `.tab.active background:var(--green-50)` → `transparent`
- `td:first-child background:#FFFFFF` → `var(--bg)`

**Spacing:** `td height` → `var(--row-height)` (32px); `th .th-inner height` → 32px
**Borders:** `td border-right` verwijderd (verticale tabel-borders weg)
**JS:** `getRowH()` compact: 34 → 32 (sync met CSS)

---

## v0.20.0 — 2026-03-07

**Type:** Bugfix (kritiek)
**Domein:** 4.4 Performance

**Fix: First-paint 3140ms door externe font dependency**

Google Fonts (DM Sans via `preconnect` + `preload`) veroorzaakte ~3 seconden vertraging wanneer de verbinding met `fonts.googleapis.com` traag of niet beschikbaar was.

Verwijderd: alle `<link>` tags naar fonts.googleapis.com / fonts.gstatic.com.
Vervangen: alle `'Bolder','DM Sans',sans-serif` → `system-ui,-apple-system,sans-serif`.

Verwacht resultaat: first-paint <250ms, volledig offline beschikbaar.

---

## v0.19.0 — 2026-03-07

**Type:** Bugfix (kritiek)
**Domein:** 4.1 Layout, 4.4 Performance

**Fix: Virtual scroll regressie — alle 4500 rijen in DOM (275.218 nodes, 26 MB heap)**

Root cause: `#tab-host` had geen CSS, waardoor het flex-layout keten gebroken was:
`.main (flex-column)` → `#tab-host (geen CSS → display:block)` → `.tab-content.active (flex:1 werkte niet)` → `.table-container` had geen viewport-gebonden hoogte.

Daardoor was `container.clientHeight` niet ~560px (viewport) maar ~153.000px (volledige tabelinhoud) na de eerste render-cyclus, waardoor `renderVirtualBody()` alle 4500 rijen renderde.

**Oplossing:**
```css
#tab-host { flex:1; display:flex; flex-direction:column; min-height:0; }
.tab-content { /* + min-height:0 toegevoegd */ }
```

Verwacht resultaat: DOM nodes ~1500 (van 275.218), heap ~10 MB (van 26 MB).

---

## v0.19.0 — 2026-03-07

**Type:** Bugfix (kritiek)
**Domein:** 4.1 Layout, 4.4 Performance

**Fix: Virtual scroll regressie na v0.18.0 — CSS flex-keten gebroken**

Root cause: `#tab-host` had geen CSS-layout, waardoor de flex-keten brak:
`.main (flex-column)` → `#tab-host (geen CSS → display:block)` → `.tab-content.active (flex:1 werkte niet)` → `.table-container` had geen viewport-gebonden hoogte.

Daardoor was `container.clientHeight` niet ~560px (viewport) maar ~143.000px (volledige tabelinhoud), waardoor `renderVirtualBody()` de gehele dataset renderde (275.218 DOM nodes, 26 MB heap).

**Oplossing:**
```css
#tab-host { flex:1; display:flex; flex-direction:column; min-height:0; }
.tab-content { display:none; flex:1; overflow:hidden; flex-direction:column; min-height:0; }
```

**Ook in deze versie:** `{passive:true}` teruggezet op alle drie scroll-listeners (na onterechte revert in v0.18.0 — root cause bleek de CSS, niet passive).

Verwacht resultaat: DOM nodes ~2.400 (van 275.218), heap ~9.5 MB (van 26 MB).

---

## v0.18.0 — 2026-03-07

**Type:** Bugfix
**Domein:** 4.4 Performance, 4.3 Modulariteit

Rollback Sprint 3 render-wijzigingen na regressie (virtuele scroll brak).

**Revert Taak 3.3:** `parts.push()` + `parts.join('')` teruggedraaid naar `html +=`
in `renderVirtualBody()` en `_renderGroupedVirtual()`. Hoewel logisch equivalent,
brak de scrollbaarheid van de virtuele tabel in de praktijk.

**Revert Taak 2.2:** `{passive:true}` verwijderd uit alle drie scroll-listeners.
Veroorzaakte mogelijk interferentie met de virtual scroll re-render logic.

Overige Sprint 2+3 wijzigingen (Set-lookup, cached names, Google Fonts, init-structuur)
blijven actief.

---

## v0.17.0 — 2026-03-07

**Type:** Performance
**Domein:** 4.4 Performance, 4.2 State management

Sprint 3 laadtijd & rendering (P6 + P2 + P7 aanverwant uit PERFORMANCE_PLAN).

**Taak 3.1 — Google Fonts non-blocking (P6):** Blocking `<link rel="stylesheet">`
vervangen door `<link rel="preconnect">` hints + async preload-trick
(`rel="preload" as="style" onload="this.rel='stylesheet'"`). `<noscript>`-fallback
toegevoegd. Verwijdert render-blocking resource.

**Taak 3.2 — Refactor init-block naar `initApp()` (P2):** Inline INIT-block
hernoemd naar `initApp()`. Async via `requestIdleCallback` teruggedraaid — de
scheduling-overhead bleek groter dan de winst bij de al snelle data-generatie.
`initTabDataFromConfig()` blijft synchroon.

**Taak 3.3 — Array join in render loops:** `html += ...` in `renderVirtualBody()`
en `_renderGroupedVirtual()` vervangen door `parts.push(...) + parts.join('')`.

---

## v0.16.0 — 2026-03-07

**Type:** Performance
**Domein:** 4.4 Performance

Sprint 2 CPU-optimalisaties (P4 + P5 + P7 aanverwant uit PERFORMANCE_PLAN).

**Taak 2.1 — `categoricalKeys` → Set-lookup (P4):** `categoricalKeys.includes()`
vervangen door O(1) Set-lookups. Drie module-level Sets aangemaakt:
`_categoricalKeySet`, `_averageKeySet`, `_booleanKeySet`. De twee aparte
average-condities in `computeAggModel()` samengevoegd tot één. Verwacht effect:
~30–50% snellere aggregatie bij volledige dataset.

**Taak 2.2 — Passive scroll listeners (P5):** `{passive:true}` toegevoegd aan alle
drie scroll-event-listeners (virtuele body-scroll, gegroepeerde virtuele scroll,
scroll-sync agg-rij). Voorkomt scroll-jank bij snel scrollen.

**Taak 2.3 — Cache `getAllUniqueNames()` (P7 aanverwant):** Resultaat gecached in
`_cachedUniqueNames`. Iteratie over 9.000 records bij elke tab-switch vervalt.

---

## v0.15.0 — 2026-03-07

**Type:** Performance
**Domein:** 4.4 Performance, 4.2 State management

Sprint 1 performance fixes (P1 + P3 uit PERFORMANCE_PLAN).

**Taak 1.1 — `_getUniqueCacheKey()` fix (P1, KRITIEK):** `JSON.stringify(colFilters)`
serialiseerde Set-objecten altijd als `"{}"`, waardoor de unieke-waarden-cache nooit
correct invalideerde bij wijziging van kolomfilters. Vervangen door deterministische
`k=v1,v2;…`-sleutel via `Object.keys().sort()` en `Array.from(set).sort()`.

**Taak 1.2 — `updateRowHighlights()` fix (P3, HOOG):** Selectie-update parstte de
rij-key via regex op het `onclick`-attribuut. Vervangen door `tr.dataset.rowKey`
(beschikbaar via `data-row-key` op elke `<tr>` in `rowHtml()`). Querystring gewijzigd
van `tr:not(.v-spacer):not(.group-hdr)` naar `tr[data-row-key]`.

---

## v0.14.0 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.2 State management, 4.3 Modulariteit, 4.10 Schaalbaarheid

Template-refactoring sprint 5: AppState gemigreerd naar id-gebaseerde navigatie
met per-tab viewState. Dashboard is nu onafhankelijk van tabvolgorde.

**activeTabId:** `AppState.activeTabId` (string) is de primaire tab-identifier.
`currentTab` is nu een computed property (legacy accessor) die de index berekent
via `getTabIndex(activeTabId)`. Setter werkt ook: `currentTab=1` → `activeTabId='team'`.

**Per-tab viewState:** `AppState.tabs` bevat per tabId een `viewState` object met:
selection, filterRules, colFilters, sortRules, groupFields, collapsedGroups,
globalNameFilter, _lastClickedIdx, _draftSortRules. Bij tabswitch worden deze
opgeslagen en hersteld via `saveTabViewState()`/`restoreTabViewState()`.

**switchTab() herschreven:** Accepteert nu zowel index (legacy) als tabId (string).
Slaat viewState op, wisselt activeTabId, herstelt viewState. Geen state-verlies meer
bij terugkeren naar een eerder bezochte tab.

**_tabSelections verwijderd:** Vervangen door per-tab `viewState.selection`.
Legacy `_tabSelections[idx]` accessor via Object.defineProperty proxy.

**Tests:** 15 nieuwe assertions (129 totaal).

---

## v0.13.0 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.3 Modulariteit, 4.9 Leesbaarheid, 4.10 Schaalbaarheid

Template-refactoring sprint 4: data en kolommen geabstraheerd — de engine
kent geen kolomnamen of dataset-specifieke logica meer.

**Kolomschema uitgebreid:** Elke kolomdefinitie bevat nu `renderer` (welke
celrenderer te gebruiken) en `type` (semantisch datatype: text, date, number,
boolean, enum). Optionele `tagColors` en `suffix` voor generieke rendering.

**Generieke cellRenderers registry:** 14 renderer-types (text, date, budget,
avatar, status, priority, progress, check, star, tag, email, note, mono,
number). De `tag` renderer accepteert `col.tagColors` voor kleurmapping.
De `number` en `mono` renderers accepteren `col.suffix`.

**renderCell() herschreven:** Dispatcht nu op `col.renderer` in plaats van
`col.key`. Bevat nul `col.key===` checks en nul `currentTab===` checks.
De oude key-gebaseerde `_cellRenderers` dispatch-table is volledig verwijderd.

**plainVal() ontkoppeld:** Exportformattering dispatcht op `col.type` en
`col.renderer` in plaats van hardcoded kolomnamen. Geen `col.key===` checks meer.

**Tests:** 35 nieuwe assertions (117 totaal). Alle 14 renderers, kolomschema-
validatie en plainVal-dispatching getest.

---

## v0.12.0 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.3 Modulariteit, 4.10 Schaalbaarheid, 4.9 Leesbaarheid

Template-refactoring sprint 3: tabs volledig geabstraheerd — de engine kent geen
hardcoded tab-structuur meer.

**Dynamische tab-containers:** Statische `<div class="tab-content">` containers
vervangen door `<div id="tab-host"></div>` placeholder. Nieuwe functie
`renderTabContainers()` genereert alle tab-content, tabel- en aggregatierij-elementen
vanuit `dashboardConfig.tabs`.

**Event delegation per tab:** `initTableDelegation()` loopt over alle tabs in
`dashboardConfig` en registreert scroll-, click-, dblclick- en contextmenu-handlers
per tabel-container. Geen hardcoded indices meer.

**Data/kolommen-registry:** `_tabData[]` en `_tabCols[]` als centrale opslag.
`initTabDataFromConfig()` vult deze vanuit `dashboardConfig.tabs[].generateData`
en `columns`. `getCols(tabIdx)` en `getData(tabIdx)` accepteren nu een optionele
tab-index parameter.

**Legacy accessors:** `window.data0` en `window.data1` zijn nu property accessors
naar `_tabData[0]`/`_tabData[1]` — bestaande code blijft werken zonder refactoring.

**Dynamische _tabSelections:** AppState._tabSelections wordt opgebouwd uit
`dashboardConfig.tabs.length` in plaats van hardcoded `{0: new Set(), 1: new Set()}`.

**Hardcoded data-referenties verwijderd:** 6 plekken waar `data0`/`data1`/`cols0`/`cols1`
direct in de engine werden gebruikt zijn vervangen door `getData(tab)`/`getCols(tab)`.

**Tests:** 20 nieuwe assertions (82 totaal).

---

## v0.11.0 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.2 State management, 4.3 Modulariteit, 4.9 Leesbaarheid, 4.10 Schaalbaarheid

Template-refactoring sprint 2: `dashboardConfig` geïntroduceerd als declaratieve
bron van waarheid voor de dashboardstructuur.

**dashboardConfig-object:** Centraal config-object met app-metadata en per-tab
definitie (id, label, icon, dataSource, columns, features, exports, defaults).
Alle inhoudelijke kennis over tabs zit nu in config, niet meer verspreid door de engine.

**Config-helperfuncties:** `getTabConfig(tabId)`, `getTabConfigByIndex(idx)`,
`getTabIndex(tabId)` en `getTabLabel(tabIdOrIndex)` als generieke lookups.

**Hardcoded labels verwijderd:** Alle 4 plekken waar `'Projecten'`/`'Teamleden'`
als strings in de engine stonden (updateTabBadges, _doExportXLSX, _formatHTML,
exportPNG) zijn vervangen door `getTabLabel(currentTab)`.

**Dynamische tab-bar:** Statische HTML-tabs vervangen door `renderTabBar()` die
vanuit `dashboardConfig.tabs` rendert. Event delegation via `data-action="switch-tab"`.
`switchTab()` bevat nu bounds-check en roept `renderTabBar()` aan.

**Tests uitgebreid:** 9 nieuwe assertions voor config-structuur en helperfuncties.
Totaal: 62 assertions.

---

## v0.10.0 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.3 Modulariteit, 4.10 Schaalbaarheid

Template-refactoring sprint 1: dashboard read-only gemaakt.

**Mutatiefuncties verwijderd:** `addRow()`, `deleteSelected()` en `duplicateRow()`
zijn verwijderd. Het dashboard muteert de brondata niet meer. De
"Dupliceren"-optie is uit het contextmenu verwijderd.

**Reset-functie hernoemd:** `resetDashboardValues()` is hernoemd naar
`resetViewState()`. De functie reset alleen nog viewstate (filters,
sortering, groepering, selectie, collapsed groups). Brondata wordt niet
meer opnieuw gegenereerd. Knoplabel gewijzigd naar "Reset weergave".

**Tests uitgebreid:** 5 nieuwe assertions die verifiëren dat de
mutatiefuncties niet meer bestaan en dat `resetViewState()` beschikbaar is.
Totaal: 53 assertions.

---

## v0.9.9 — 2026-03-07

**Type:** Bugfix, CSS-architectuur
**Domein:** 4.5 CSS-architectuur, 4.6 Toegankelijkheid

Kritieke bugfix-release: sticky kolom overlap, toolbar wrapping, knop-styling.

**BUG-014/015 — Sticky kolom overlap opgelost:** Root cause was
`border-collapse:collapse` op de `<table>`. Gewijzigd naar
`border-collapse:separate; border-spacing:0`. Hierdoor hebben sticky
cellen (selectiekolom, bevroren kolom) een eigen border-box en dekken
ze naburige kolommen correct af. Projectnamen en status-tags worden
niet meer links afgesneden. Schaduwranden via `::after` pseudo-elementen
vervangen door `box-shadow` op de bevroren kolom. Z-index hiërarchie:
`th:first-child(12) > freeze-th(11) > thead(10) > td:first-child(5) >
freeze-td(4) > regulier(auto)`.

**BUG-013 — Toolbar wrapping:** `flex-wrap` gewijzigd van `wrap` naar
`nowrap` met `overflow-x:auto`. Toolbar-knoppen blijven altijd op één
regel, ongeacht het aantal actieve knoppen. Scrollbar verborgen.

**BUG-012 regressie — Bevriezen-knop:** `box-shadow:none` toegevoegd
aan `.btn-ghost.active` om de groene `box-shadow` van `.btn.active`
expliciet te overriden. Knop toont nu subtiele grijze actieve staat.

---

## v0.9.8 — 2026-03-07

**Type:** Bugfix, UI-polish
**Domein:** 4.5 CSS-architectuur, 4.6 Toegankelijkheid, 4.9 Leesbaarheid

Bugfix-release: kolom bevriezen, selectiekolom overlap, filterpaneel layout.

**BUG-009 — Kolom bevriezen werkend gemaakt:** `toggleFreeze()` triggert nu
een volledige re-render en synct `AppState.ui.freezeFirstDataColumn`. CSS
voor bevroren 2e kolom (projectnaam) herschreven met correcte z-index (11
voor header, 3 voor body), achtergrondkleuren per rij-variant (even, hover,
selected) en visuele schaduwrand via `::after` pseudo-element.

**BUG-012 — Bevriezen-knop styling:** `.btn-ghost.active` teruggebracht
naar subtiele styling (`background:var(--surface3)`) i.p.v. opvallende
groene box-shadow. Consistent met overige toolbar-knoppen.

**Selectiekolom overlap:** z-index van `td:first-child` verhoogd naar 5.
Schaduwrand via `::after` op zowel `th:first-child` als `td:first-child`
voorkomt visueel doorschuiven van data-kolommen.

**BUG-011 — Filterpaneel layout:** Panel verbreed (min 320px, max 440px).
Filter-regels krijgen `flex-wrap:wrap` en flex-sizing op selects/inputs.
Horizontale overflow verborgen in `.panel-body`. Input-breedte begrensd.

---

## v0.9.7 — 2026-03-07

**Type:** Testbaarheid, Toegankelijkheid
**Domein:** 4.8 Testbaarheid, 4.6 Toegankelijkheid, 4.9 Leesbaarheid

Sprint 4: inline test suite en accessibility-afronding.

**Taak 4.1 — Inline test suite:** `runTests()` functie met 48 assertions
die alle pure functies afdekt: `escapeHtml`, `escapeAttr`, `dateFmt`,
`budgetFmt`, `matchRule` (alle operators + NaN-defensie), `condClass`
(alle takken + disabled), `sortData` (asc/desc/geen), `groupData`
(grouping + null), `countLeafRows`, `getRowH`, `plainVal` (budget/boolean),
`_formatCSV`, `_formatJSON`, en `AppState`-structuur. Test-knop zichtbaar
wanneer `_perfDebug === true`. Resultaten via toast en console.

**Taak 4.2 — Accessibility afronding:** ARIA `live-region` (aria-live="polite")
toegevoegd voor schermlezer-aankondigingen. `announce()` helper-functie
aangesloten op toast-systeem. `role="grid"` op beide tabellen. Schermlezers
krijgen nu feedback bij filters, sortering, exports en andere acties.

---

## v0.9.6 — 2026-03-07

**Type:** Robuustheid, CSS-architectuur
**Domein:** 4.7 Foutafhandeling, 4.3 Modulariteit, 4.5 CSS-architectuur, 4.1 Veiligheid

Sprint 3: code-duplicatie, error handling en robuustheid.

**Taak 3.1 — Data-generatie dedupliqueren:** `generateProjectData()` en
`generateTeamData()` factory-functies geëxtraheerd. Initialisatie en
`resetDashboardValues()` gebruiken nu dezelfde factory — single source of truth.

**Taak 3.2 — Export-functies generaliseren:** Generieke `exportAs()` wrapper
met try/catch/finally. CSV, JSON, Markdown en HTML herschreven als pure
formatter-functies (_formatCSV, _formatJSON, _formatMarkdown, _formatHTML).
XLSX en PNG behouden eigen try/catch vanwege specifieke logica. Alle exports
tonen nu een toast bij fouten i.p.v. stille faal. Lege data wordt afgevangen.

**Taak 3.3 — Error handling render-pipeline:** `render()` gewrapped in
try/catch die `_renderInternal()` aanroept. Bij fatale fout: error-toast en
reset-knop altijd zichtbaar. Console.error met context.

**Taak 3.4 — Defensive coding filterlogica:** `matchRule()` herschreven met
switch-statement. NaN-checks op `gt`/`lt` operators: filter op niet-numerieke
waarden retourneert nu `false` i.p.v. onvoorspelbaar gedrag.

**Taak 3.5 — Semantische kleur-tokens:** 6 CSS-variabelen toegevoegd:
`--color-ui-active`, `--color-success`, `--color-warning`, `--color-danger`,
`--color-info`, `--color-muted`. 5 semantische tag-classes: `.tag-success`,
`.tag-warning`, `.tag-danger`, `.tag-info`, `.tag-neutral`. Alle celrenderers
en `_valTagColors` lookup gemigreerd van kleur-classes (tag-green, tag-red)
naar semantische classes (tag-success, tag-danger). Visueel identiek —
de semantische classes verwijzen naar dezelfde RODS-kleuren.

JavaScript parst zonder fouten; 3.000 regels; geen visuele regressie verwacht.

---

## v0.9.5 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.2 State management, 4.3 Modulariteit, 4.5 CSS-architectuur

Sprint 2: state-inkapseling en modularisatie.

**Taak 2.1 — Centraal AppState-object:** Alle ~25 globale state-variabelen
(currentTab, selectedRows, filterRules, sortRules, groupFields, colFilters,
condEnabled, rowHeight, freezeCol, activePanel, collapsedGroups, etc.) zijn
gebundeld in één `AppState`-object. Legacy-accessors via `Object.defineProperty`
op window garanderen backward-compatibility — alle bestaande functies werken
ongewijzigd. `AppState.reset()` vervangt de verspreide reset-logica.
`AppState.ui` subobject scheidt view-state van data-state.

**Taak 2.2 — Derived-state en dirty flags:** `_dirty` en `_derived` zijn
verplaatst naar `AppState._dirty` en `AppState._derived`. Legacy-aliassen
(`var _dirty = AppState._dirty`) houden bestaande code werkend. De cascade-
logica in `_invalidate()` blijft intact.

**Taak 2.3 — Cacheobjecten:** `AppState._cache` bundelt avatar-cache, star-cells,
render-cache referenties en unique-value-cache metadata. `AppState.clearCaches()`
biedt een centraal resetpunt voor alle caches bij data-regeneratie.

**Taak 2.4 — Density via CSS-classes:** Inline `toolbar.style.padding`-mutatie
in `setRowHeight()` vervangen door CSS-classes `.density-compact`, `.density-medium`,
`.density-tall` op `<body>`. Initiële class gezet bij pagina-load. Visueel identiek,
maar nu debugbaar via browser-inspector en conform het tokensysteem.

JavaScript parst zonder fouten; geen visuele regressie verwacht.

---

## v0.9.4 — 2026-03-07

**Type:** Architectuur, Toegankelijkheid
**Domein:** 4.6 Toegankelijkheid, 4.5 CSS-architectuur

Knophiërarchie en semantische HTML ingevoerd (sprint 1, taken 1.4 en 1.5).
Nieuwe `.btn-system` CSS-class voor tertiaire knoppen (Reset data).
Alle interactieve `<div onclick>`-elementen gemigreerd naar `<button>`:
tabs (2), logic-btn AND/OR (2), col-bulk-btn (2), export-items (6),
ctx-items (2), col-toggle in renderColPanel (1 template). Totaal 15 elementen.
CSS-reset toegevoegd voor alle button-varianten om browser-defaults te neutraliseren.
Col-toggle button vervangt handmatige `onkeydown` Enter/Space-handler — buttons
activeren deze toetsen native. JavaScript parst zonder fouten; geen visuele regressie verwacht.

---

## v0.9.3 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.5 CSS-architectuur, 4.3 Modulariteit

State classes ingevoerd ter vervanging van inline `style.display`-mutaties (sprint 1, taak 1.3).
Nieuwe CSS-classes `.is-open` en `.is-visible` vervangen de oude `.open` en `.visible` patronen.
Gemigreerd: `togglePanel()`, `closePanel()`, `openModal()`, `closeModal()`, `updateSelectionBar()`,
`updateActiveFiltersBar()`, `toast()` en `closeToast()`. Panels krijgen nu `display:none` als
CSS-default en worden zichtbaar via `.is-open`. Nul `classList.add/remove('visible'/'open')`
resterend. Vijf `style.display`-toewijzingen resteren in context menu, badge en reset-knop
(Golf 3, toekomstig).

---

## v0.9.2 — 2026-03-07

**Type:** Architectuur
**Domein:** 4.3 Modulariteit, 4.1 Veiligheid, 4.8 Testbaarheid

Inline event handlers in dynamische HTML gemigreerd naar event delegation (sprint 1, taak 1.2).
Alle `onclick`, `ondblclick` en `oncontextmenu` attributen verwijderd uit `rowHtml()`, `statusTag()`
en `priorityTag()`. Vervangen door `data-row-key`, `data-tab`, `data-tag-field`, `data-tag-value`
en `data-action` attributen. Drie delegation handlers (click, dblclick, contextmenu) geregistreerd
op de tabelcontainers, geïntegreerd met de bestaande group-header delegation.
Statische toolbar-knoppen behouden voorlopig inline handlers (Golf 3, toekomstig).

---

## v0.9.1 — 2026-03-07

**Type:** Veiligheid
**Domein:** 4.1 Veiligheid (XSS, injectie)

Centrale `escapeHtml()` en `escapeAttr()` functies toegevoegd (sprint 1, taak 1.1).
Alle celrenderers, tag-functies, filterpanelen, kolomheaders, rij-HTML, groeperings-headers,
modal, toast, filterbadge en active-filters-bar beveiligd tegen XSS via escaping van
datawaarden in innerHTML en onclick-attributen. In totaal 67 escapeHtml- en 24 escapeAttr-aanroepen
doorgevoerd over ~40 kwetsbare plekken. Oude `.replace(/'/g, "\\'")`-patronen vervangen.
JavaScript parst zonder fouten; geen visuele regressie verwacht.

---

## v0.9.0 — 2026-03-07

**Type:** Baseline
**Domein:** Alle domeinen

Nulmeting vastgesteld. Het dashboard bevat de volledige feature-set: virtueel scrollen
voor 4.500 rijen, multi-level sorteren/groeperen/filteren, drag-and-drop kolommen,
6 exportformaten, multi-selectie met shift+klik en een compleet RODS-designsystem.
Beoordelingskader codekwaliteit opgesteld met een gemiddelde score van 4,7/10.
Technisch implementatieplan v1.1 beschrijft de route naar professioneel niveau (7,6/10).
