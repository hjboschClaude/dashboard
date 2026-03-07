# Changelog — Dashboard Gemeente Rotterdam

Alle wijzigingen aan het dashboard worden chronologisch vastgelegd in dit bestand.
Formaat gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.0.0/).
Versienummering volgt [Semantic Versioning](https://semver.org/lang/nl/).

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
