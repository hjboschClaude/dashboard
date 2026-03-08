# Template ontwerp — Dashboard

**Aangemaakt:** v0.34.0 — 2026-03-08 | **Bijgewerkt:** v0.34.0 — 2026-03-08

## 1. Doel

Concreet technisch ontwerp voor één HTML-bestand dat dient als herbruikbare template voor meerdere dashboards. Beschrijft sectie-indeling, voorbeeldcommentaar en aanbevolen objectstructuren voor een read-only dashboard met:

- meerdere tabs
- grote datasets
- embedded en importeerbare data
- filters, sortering, grouping en export
- virtualisatie en performancebewaking

Het ontwerp gaat uit van een **strikte interne sectie-indeling** binnen één HTML-bestand.

### Implementatiestatus

| Sectie | Onderwerp | Status |
|--------|-----------|--------|
| §2–3 | Bestandsopbouw & sectienamen | ◐ Deels — secties bestaan maar niet uniform gemarkeerd |
| §4 | Document shell | ✓ Geïmplementeerd |
| §5 | Design tokens | ✓ Geïmplementeerd |
| §6 | Component-CSS | ✓ Geïmplementeerd |
| §7–9 | Template-config, tabs, kolommen | ◐ Deels — `dashboardConfig` bestaat, structuur wijkt af |
| §10–11 | Datasources & adapters | ✓ Geïmplementeerd |
| §12 | AppState | ✓ Geïmplementeerd |
| §13 | Pure helpers | ✓ Geïmplementeerd |
| §14 | Renderers | ✓ Geïmplementeerd |
| §15 | Eventlaag | ◐ Deels — mix van delegation en inline handlers |
| §16 | Invalidation & renderstrategie | ◐ Deels — dirty flags bestaan, niet volledig model |
| §17 | Virtualisatie | ✓ Geïmplementeerd |
| §18 | Importflow | ✓ Geïmplementeerd |
| §19 | Exportflow | ✓ Geïmplementeerd |
| §20 | Tooling & tests | ✓ Geïmplementeerd |
| §21 | Init-sectie | ✓ Geïmplementeerd |

---

## 2. Aanbevolen bestandsopbouw van het HTML-bestand

De aanbevolen volgorde is:

1. document shell
2. design tokens
3. component-CSS
4. template-config
5. sample-data en adapters
6. app state
7. pure helpers
8. renderers
9. eventlaag
10. tooling en tests
11. init

Deze volgorde moet consequent worden aangehouden in elk dashboard dat op de template is gebaseerd.

---

## 3. Sectienamen en voorbeeldcommentaar

Onderstaande commentaarblokken zijn aanbevolen als vaste structuur in het HTML-bestand.

```html
<!-- ======================================== -->
<!-- DOCUMENT SHELL -->
<!-- Statische HTML-structuur van app en panel-hosts -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- DESIGN TOKENS -->
<!-- Centrale kleuren, spacing, typografie, borders, shadows -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- COMPONENT CSS -->
<!-- Topbar, toolbar, tabs, tables, panels, overlays -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- TEMPLATE CONFIG -->
<!-- Declaratieve dashboarddefinitie -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- SAMPLE DATA / DATA ADAPTERS -->
<!-- Embedded datasets, import parsing en normalisatie -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- APP STATE -->
<!-- Centrale runtime-state en caches -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- PURE HELPERS -->
<!-- Generieke hulpfuncties zonder DOM-effecten -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- RENDERERS -->
<!-- Alle DOM-output op basis van state en config -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- EVENTS -->
<!-- Centrale event delegation en dispatch -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- TOOLING / TESTS -->
<!-- Perf overlay, self-tests, debug tools -->
<!-- ======================================== -->
```

```html
<!-- ======================================== -->
<!-- INIT -->
<!-- Opstartflow, initialisatie en eerste render -->
<!-- ======================================== -->
```

---

## 4. Document shell

De document shell bevat alleen de vaste HTML-structuur van de applicatie. Hier hoort geen domeinspecifieke logica te staan.

### Minimale shell-onderdelen

- app-root
- topbar-host
- toolbar-host
- active-filters-host
- panel-host
- tab-host
- modal-host
- overlay-host
- toast-host
- debug-host

### Voorbeeld

```html
<body>
  <div id="app">
    <header id="topbar-host"></header>
    <section id="toolbar-host"></section>
    <section id="active-filters-host"></section>
    <main id="tab-host"></main>
    <aside id="panel-host"></aside>
    <div id="modal-host"></div>
    <div id="overlay-host"></div>
    <div id="toast-host"></div>
    <div id="debug-host"></div>
  </div>
</body>
```

### Ontwerprichtlijn

De shell moet zo “dom” mogelijk blijven. Alle inhoud wordt later gerenderd door de renderlaag.

---

## 5. Design tokens

Design tokens moeten centraal in `:root` staan en nergens worden gedupliceerd.

### Aanbevolen tokenclusters

- kleuren
- surfaces
- borders
- spacing
- radii
- shadows
- typography
- row heights
- z-index
- transitions

### Voorbeeld

```css
:root {
  --bg: #ffffff;
  --surface: #f5f7f8;
  --surface-strong: #e5e5e5;
  --text-body: #1f2933;
  --text-muted: #52606d;
  --border: #cad6da;
  --accent: #00811f;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;

  --radius-1: 4px;
  --radius-2: 8px;

  --row-height: 32px;
  --toolbar-height: 40px;
  --topbar-height: 48px;
}
```

### Ontwerprichtlijn

Gebruik in componenten alleen tokens en geen losse waarden, behalve wanneer een waarde aantoonbaar uniek en lokaal is.

---

## 6. Component-CSS

Component-CSS definieert alleen herbruikbare componenten en states.

### Aanbevolen componentgroepen

- app layout
- topbar
- tabs
- toolbar
- chips
- table container
- table header
- sticky columns
- panels
- modal
- empty/loading/error states
- debug/perf UI

### Richtlijnen

- gebruik class-gebaseerde styling
- vermijd inline style-attributen
- gebruik state-classes zoals `.is-active`, `.is-open`, `.is-selected`
- gebruik modifier classes zoals `.toolbar--compact`, `.panel--floating`

### Voorbeeldcommentaar

```css
/* Tabs */
/* ---------------------------------------- */

.tab {
  display: inline-flex;
  align-items: center;
}

.tab.is-active {
  border-color: var(--accent);
}
```

---

## 7. Template-config

De template-config is de declaratieve beschrijving van het dashboard.

### 7.1 Aanbevolen hoofdstructuur

```js
const dashboardConfig = {
  app: {},
  features: {},
  defaults: {},
  domain: {},
  tabs: []
};
```

### 7.2 Aanbevolen objectstructuur

```js
const dashboardConfig = {
  app: {
    id: 'finance-dashboard-template',
    title: 'Financieel Dashboard',
    version: '1.0.0',
    density: 'compact'
  },

  features: {
    search: true,
    filter: true,
    sort: true,
    group: true,
    selection: true,
    export: true,
    import: true,
    virtualization: true,
    testRunner: true,
    perfOverlay: true
  },

  defaults: {
    activeTabId: 'projects',
    density: 'compact',
    rowHeight: 32
  },

  domain: {
    ordinalOrders: {
      status: ['Nieuw', 'Lopend', 'Afgerond']
    },
    tagColors: {
      Afgerond: 'success',
      Risico: 'danger'
    }
  },

  tabs: []
};
```

### Ontwerprichtlijn

De engine mag zoveel mogelijk alleen naar `dashboardConfig` kijken en niet naar losse globale constants.

---

## 8. Tab-definities

Elke tab moet een volledig beschrijvend object zijn.

### Aanbevolen structuur

```js
{
  id: 'projects',
  label: 'Projecten',
  description: 'Overzicht van projectdata',
  dataSource: {},
  columns: [],
  defaults: {},
  features: {},
  importConfig: {},
  exportConfig: {}
}
```

### Uitgewerkt voorbeeld

```js
{
  id: 'projects',
  label: 'Projecten',
  description: 'Projectoverzicht met financiële en voortgangsinformatie',

  dataSource: {
    type: 'hybrid',
    embeddedKey: 'projectsDemo',
    importEnabled: true,
    replaceOnImport: true
  },

  defaults: {
    sort: [{ key: 'projectnaam', direction: 'asc' }],
    groupBy: [],
    visibleColumns: ['projectnaam', 'status', 'budget', 'einddatum']
  },

  features: {
    search: true,
    filter: true,
    sort: true,
    group: true,
    export: true,
    import: true
  },

  importConfig: {
    acceptedFormats: ['csv'],
    requiredColumns: ['projectnaam', 'status'],
    aliases: {
      project: 'projectnaam',
      naam: 'projectnaam',
      end_date: 'einddatum'
    }
  },

  exportConfig: {
    allowedFormats: ['csv', 'xlsx', 'print']
  },

  columns: []
}
```

---

## 9. Kolomdefinities

Kolomdefinities vormen de kern van de template.

### Minimale structuur

```js
{
  key: 'status',
  label: 'Status',
  type: 'text'
}
```

### Aanbevolen volledige structuur

```js
{
  key: 'status',
  label: 'Status',
  type: 'tag',
  align: 'left',
  width: 140,
  minWidth: 120,
  sortable: true,
  filterable: true,
  groupable: true,
  defaultVisible: true,
  required: false,
  emptyValue: '—',
  aggregate: null,
  renderer: 'tag',
  exportFormatter: 'plainText',
  compareMode: 'ordinal',
  uploadAliases: ['status', 'fase', 'voortgang']
}
```

### Ontwerprichtlijn

Hoe meer gedrag uit kolommetadata volgt, hoe minder dashboardspecifieke logica in de engine hoeft te staan.

---

## 10. Datasource-definities

Datasources moeten expliciet en uniform worden beschreven.

### Embedded datasource

```js
{
  type: 'embedded',
  embeddedKey: 'projectsDemo'
}
```

### Import datasource

```js
{
  type: 'import',
  importEnabled: true,
  acceptedFormats: ['csv']
}
```

### Hybrid datasource

```js
{
  type: 'hybrid',
  embeddedKey: 'projectsDemo',
  importEnabled: true,
  replaceOnImport: true
}
```

### Ontwerprichtlijn

De datasource-definitie beschrijft bron en gedrag, maar bevat niet de parsinglogica zelf. Die hoort in adapters.

---

## 11. Sample-data en data-adapters

Deze sectie bevat alle vervangbare data-implementaties.

### Aanbevolen onderdelen

- embedded datasets
- import parser
- alias mapping
- row normalizer
- validators
- dataset registry

### Voorbeeldcommentaar

```js
/* SAMPLE DATA ONLY */
/* Vervangbaar per dashboard */
```

### Voorbeeld registry

```js
const embeddedDatasets = {
  projectsDemo: generateProjectData(),
  teamDemo: generateTeamData()
};
```

### Voorbeeld normalizer

```js
function normalizeImportedRows(rows, importConfig, columns) {
  return rows.map((row) => normalizeImportedRow(row, importConfig, columns));
}
```

### Aanbevolen normalisatiestappen

1. veldnamen trimmen
2. aliases omzetten naar canonieke keys
3. ontbrekende velden markeren
4. numerieke waarden converteren
5. datums normaliseren
6. lege waarden standaardiseren

---

## 12. AppState

`AppState` bevat alle runtime-state van de applicatie.

### Aanbevolen hoofdstructuur

```js
const AppState = {
  activeTabId: null,
  density: 'compact',
  ui: {},
  tabs: {},
  debug: {}
};
```

### Uitgewerkt voorbeeld

```js
const AppState = {
  activeTabId: 'projects',
  density: 'compact',

  ui: {
    openPanel: null,
    loading: false,
    modal: null,
    toastQueue: []
  },

  tabs: {
    projects: {
      rows: [],
      sourceMeta: {
        type: 'embedded',
        importedAt: null
      },
      viewState: {
        searchQuery: '',
        filters: [],
        sort: [],
        groupBy: [],
        selectedRowIds: new Set(),
        visibleColumns: [],
        scrollTop: 0
      },
      caches: {
        filteredRows: null,
        groupedRows: null,
        visibleSlice: null
      },
      dirty: {
        rows: true,
        view: true,
        render: true
      }
    }
  },

  debug: {
    perfOverlay: false,
    testRunnerOpen: false
  }
};
```

### Ontwerprichtlijn

State moet volledig op `tab.id` gebaseerd zijn. Vermijd indexgebaseerde opslag.

---

## 13. Pure helpers

Pure helpers bevatten logica zonder DOM-side-effects.

### Voorbeelden

- `getTabConfig(tabId)`
- `getCurrentTabId()`
- `getCurrentRows(tabId)`
- `normalizeValue(value, column)`
- `compareValues(a, b, column)`
- `applyFilters(rows, filters, columns)`
- `applySort(rows, sortRules, columns)`
- `buildExportRows(rows, columns)`

### Ontwerprichtlijn

Pure helpers zijn testvriendelijk en moeten zo veel mogelijk losstaan van rendering.

---

## 14. Renderers

Renderers vertalen state en config naar DOM-output.

### Aanbevolen renderfuncties

- `renderAppShell()`
- `renderTopbar()`
- `renderToolbar(tabId)`
- `renderActiveFilters(tabId)`
- `renderTabContainers()`
- `renderTable(tabId)`
- `renderVirtualBody(tabId)`
- `renderPanels(tabId)`
- `renderModal()`
- `renderDebugUi()`

### Richtlijnen

- renderers lezen uit config en state
- renderers muteren geen businesslogica
- renderers gebruiken vaste CSS-classes
- renderers vermijden inline styles
- renderers gebruiken waar mogelijk één renderingconventie

### Voorbeeldcommentaar

```js
/* RENDERERS */
/* Elke renderer vertaalt state + config naar DOM */
/* Geen domeinspecifieke aannames */
```

---

## 15. Eventlaag

De eventlaag handelt alle interactie centraal af.

### Aanbevolen patroon

Gebruik `data-*` attributen in de markup:

- `data-action`
- `data-tab-id`
- `data-col-key`
- `data-panel`
- `data-export-format`

### Centrale listeners

```js
document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
document.addEventListener('keydown', handleKeydown);
```

### Voorbeeld dispatch

```js
function handleClick(event) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;

  switch (action) {
    case 'switch-tab':
      return onSwitchTab(actionEl.dataset.tabId);
    case 'open-panel':
      return onOpenPanel(actionEl.dataset.panel);
    case 'export':
      return onExport(actionEl.dataset.exportFormat);
  }
}
```

### Ontwerprichtlijn

Inline event handlers moeten worden vermeden om de template rustiger, testbaarder en uitbreidbaarder te maken.

---

## 16. Invalidation en renderstrategie

Voor performance moet de renderstrategie expliciet zijn.

### Aanbevolen aanpak

Werk met een invalidation-model:

- rows dirty
- filters dirty
- sort dirty
- grouping dirty
- render dirty

### Voorbeeld

```js
function invalidate(tabId, keys = []) {
  const tabState = AppState.tabs[tabId];
  keys.forEach((key) => {
    tabState.dirty[key] = true;
  });
}
```

### Richtlijn

De renderpipeline moet zoveel mogelijk toestandsgedreven zijn. Post-render noodreparaties moeten uitzondering blijven.

---

## 17. Virtualisatie

Virtualisatie is verplicht voor grote datasets.

### Doel

Niet alle rijen tegelijk renderen, maar alleen het zichtbare deel plus buffer.

### Aanbevolen componenten

- container height calculation
- row height token
- visible start/end index
- overscan buffer
- spacer elements of translate-offset

### Voorbeeldfuncties

- `computeVisibleSlice()`
- `renderVirtualBody()`
- `syncScrollState()`

### Ontwerprichtlijn

Virtualisatie moet een engine-capability zijn, niet een dashboardspecifieke uitbreiding.

---

## 18. Importflow

De importflow moet generiek zijn.

### Stappen

1. gebruiker kiest bestand
2. parser leest ruwe data
3. rows worden genormaliseerd
4. validatie wordt uitgevoerd
5. datasource-meta wordt bijgewerkt
6. state wordt ververst
7. renderpipeline draait opnieuw

### Aanbevolen functies

- `parseImportedFile(file)`
- `mapImportedColumns(rows, importConfig)`
- `normalizeImportedRows(rows, importConfig, columns)`
- `validateImportedRows(rows, importConfig)`
- `commitImportedRows(tabId, rows, meta)`

### Ontwerprichtlijn

De importflow moet onafhankelijk zijn van het specifieke dashboarddomein.

---

## 19. Exportflow

De exportflow moet centraal en generiek zijn.

### Aanbevolen functies

- `buildExportDataset(tabId)`
- `exportCsv(tabId)`
- `exportXlsx(tabId)`
- `exportPrintView(tabId)`

### Richtlijn

Export gebruikt de actuele zicht- en filtertoestand van de tab, tenzij expliciet anders geconfigureerd.

---

## 20. Tooling en tests

De template moet interne tooling bevatten.

### Aanbevolen tooling

- perf overlay
- first render timing
- scroll timing
- self-test runner
- config validator
- import validator

### Aanbevolen testgroepen

- template integrity
- engine integrity
- performance integrity
- dashboard-specific integrity

### Voorbeeldcommentaar

```js
/* TOOLING / TESTS */
/* Template-validatie en performancebewaking */
```

---

## 21. Init-sectie

De init-sectie is verantwoordelijk voor het opstarten van het dashboard.

### Aanbevolen opstartvolgorde

1. browser checks
2. config validatie
3. app state initialiseren
4. embedded data laden
5. tabstate initialiseren
6. events registreren
7. eerste render uitvoeren
8. perf monitoring starten
9. optionele tests beschikbaar maken

### Voorbeeld

```js
function initApp() {
  validateConfig(dashboardConfig);
  initializeAppStateFromConfig(dashboardConfig);
  initializeEmbeddedDatasets();
  bindGlobalEvents();
  renderApp();
  startPerfMonitoring();
}
```

---

## 22. Samenvattend technisch eindbeeld

Het gewenste eindbeeld is een single-file HTML-dashboard waarin:

- de shell statisch en generiek is
- design tokens centraal zijn gedefinieerd
- component-CSS class-gebaseerd is
- `dashboardConfig` het dashboard declaratief beschrijft
- embedded en importeerbare datasets beide ondersteund worden
- `AppState` alle runtime-state per `tab.id` bewaart
- renderers de DOM genereren op basis van state en config
- events centraal worden afgehandeld
- virtualisatie standaard onderdeel van de engine is
- import, export, performance en tests generiek zijn georganiseerd

De template is dan geen losse pagina meer, maar een **herbruikbare dashboard-engine in één HTML-bestand**.

