# Dashboard Test Rapport — v0.37.0

| | |
|---|---|
| **Dashboard versie** | `0.37.0` |
| **Datum** | 08-03-2026 14:52:55 |
| **Testplan** | TESTREGISTER.md |
| **Resultaat** | **GESLAAGD MET WAARSCHUWINGEN** |

---

## Samenvatting

| Suite | ✓ Geslaagd | ✗ Mislukt | △ Waarsch. | ○ Skip |
|---|---:|---:|---:|---:|
| Unit (A) | 157 | 0 | 0 | 0 |
| Visual (C) | 32 | 0 | 1 | 0 |
| Performance (D) | 9 | 0 | 2 | 0 |
| **Totaal** | **198** | **0** | **3** | **0** |

---

## Unit (A)

### A-ESC

- ✓ **escapeHtml: null → lege string**
- ✓ **escapeHtml: undefined → lege string**
- ✓ **escapeHtml: < en > worden geescaped**
- ✓ **escapeHtml: & wordt geescaped**
- ✓ **escapeHtml: aanhalingstekens**
- ✓ **escapeAttr: backslash wordt geescaped**

### A-FMT

- ✓ **dateFmt: lege waarde → leeg**
- ✓ **dateFmt: null → leeg**
- ✓ **dateFmt: 2026-03-07 → 2026-03**
- ✓ **budgetFmt: getal formatteert met €**

### A-MATCH

- ✓ **matchRule: contains positief**
- ✓ **matchRule: contains negatief**
- ✓ **matchRule: equals**
- ✓ **matchRule: not_equals**
- ✓ **matchRule: gt numeriek**
- ✓ **matchRule: lt numeriek**
- ✓ **matchRule: gt met NaN → false**
- ✓ **matchRule: empty**
- ✓ **matchRule: not_empty**

### A-COND

- ✓ **condClass: Hoog prioriteit → cond-red**
- ✓ **condClass: On Hold → cond-red**
- ✓ **condClass: Voltooid → cond-green**
- ✓ **condClass: In Review → cond-yellow**
- ✓ **condClass: progress <30 → cond-yellow**
- ✓ **condClass: normaal → leeg**
- ✓ **condClass: uitgeschakeld → leeg**

### A-SORT

- ✓ **sortData: asc sortering**
- ✓ **sortData: desc sortering**
- ✓ **sortData: geen regels → ongewijzigd**

### A-GROUP

- ✓ **groupData: twee groepen**
- ✓ **groupData: groep A heeft 2 rijen**
- ✓ **groupData: geen velden → null**
- ✓ **countLeafRows: telt blad-rijen recursief**

### A-ROW

- ✓ **getRowH: compact → 32**
- ✓ **getRowH: medium → 42**
- ✓ **getRowH: tall → 52**

### A-VAL

- ✓ **plainVal: budget formatteert**
- ✓ **plainVal: true → Ja**
- ✓ **plainVal: false → Nee**
- ✓ **plainVal: date kolom formatteert**
- ✓ **plainVal: budget kolom formatteert**
- ✓ **plainVal: boolean true → Ja**
- ✓ **plainVal: boolean false → Nee**

### A-EXPORT

- ✓ **_formatCSV: bevat header**
- ✓ **_formatCSV: bevat datarij**
- ✓ **_formatJSON: geldig JSON met juiste data**

### A-STATE

- ✓ **AppState: currentTab accessor beschikbaar**
- ✓ **AppState: reset is functie**
- ✓ **AppState: clearCaches is functie**
- ✓ **AppState: _dirty object aanwezig**
- ✓ **AppState: _derived object aanwezig**
- ✓ **addRow verwijderd**
- ✓ **deleteSelected verwijderd**
- ✓ **duplicateRow verwijderd**
- ✓ **resetViewState bestaat**
- ✓ **resetDashboardValues verwijderd**

### A-CONFIG

- ✓ **config: tabs array aanwezig**
- ✓ **config: eerste tab is projects**
- ✓ **config: tweede tab is team**
- ✓ **getTabLabel(0) geeft Projecten**
- ✓ **getTabLabel("team") geeft Teamleden**
- ✓ **getTabConfig("projects") heeft kolommen**
- ✓ **getTabIndex("team")===1**
- ✓ **getTabConfigByIndex(0).icon is 📋**
- ✓ **renderTabBar bestaat**
- ✓ **_tabData is array met 2 entries**
- ✓ **_tabCols is array met 2 entries**
- ✓ **_tabData[0] bevat projectdata**
- ✓ **_tabData[1] bevat teamdata**
- ✓ **_tabCols[0] === cols0**
- ✓ **_tabCols[1] === cols1**
- ✓ **getData() retourneert huidige tab-data**
- ✓ **getData(0) retourneert projectdata**
- ✓ **getData(1) retourneert teamdata**
- ✓ **getCols(0) retourneert projectkolommen**
- ✓ **getCols(1) retourneert teamkolommen**
- ✓ **legacy data0 accessor werkt**
- ✓ **legacy data1 accessor werkt**
- ✓ **initTabDataFromConfig bestaat**
- ✓ **renderTabContainers bestaat**
- ✓ **initTableDelegation bestaat**
- ✓ **_tabSelections dynamisch (2 tabs)**
- ✓ **tab-host element bestaat**
- ✓ **content-0 element bestaat**
- ✓ **content-1 element bestaat**

### A-RENDER

- ✓ **cellRenderers is object**
- ✓ **cellRenderers.text is functie**
- ✓ **cellRenderers.date is functie**
- ✓ **cellRenderers.budget is functie**
- ✓ **cellRenderers.avatar is functie**
- ✓ **cellRenderers.status is functie**
- ✓ **cellRenderers.priority is functie**
- ✓ **cellRenderers.progress is functie**
- ✓ **cellRenderers.check is functie**
- ✓ **cellRenderers.star is functie**
- ✓ **cellRenderers.tag is functie**
- ✓ **cellRenderers.email is functie**
- ✓ **cellRenderers.note is functie**
- ✓ **cellRenderers.mono is functie**
- ✓ **cellRenderers.number is functie**
- ✓ **cellRenderers.text escapet HTML**
- ✓ **cellRenderers.date formatteert datum**
- ✓ **cellRenderers.tag met tagColors gebruikt kleur**
- ✓ **cellRenderers.tag zonder tagColors default tag-info**
- ✓ **cellRenderers.number met suffix toont suffix**
- ✓ **cellRenderers.mono met suffix toont suffix**
- ✓ **cols0[0] heeft renderer**
- ✓ **cols0[0] heeft type**
- ✓ **cols1[0] heeft renderer**
- ✓ **cols1[0].renderer is avatar**
- ✓ **alle cols0 hebben renderer en type**
- ✓ **alle cols1 hebben renderer en type**
- ✓ **alle col.renderer verwijzen naar bestaande renderer**

### A-VIEW

- ✓ **AppState.activeTabId bestaat**
- ✓ **AppState.activeTabId default is projects**
- ✓ **AppState.tabs object bestaat**
- ✓ **AppState.tabs.projects bestaat**
- ✓ **AppState.tabs.team bestaat**
- ✓ **AppState.tabs.projects.viewState.selection is Set**
- ✓ **AppState.tabs.team.viewState.selection is Set**
- ✓ **AppState.tabs.projects.viewState.filterRules is array**
- ✓ **currentTab computed property werkt**
- ✓ **currentTab setter → activeTabId=team**
- ✓ **currentTab setter → activeTabId=projects**
- ✓ **saveTabViewState is functie**
- ✓ **restoreTabViewState is functie**
- ✓ **restoreTabViewState herstelt filterRules**
- ✓ **E.3: geen @deprecated window-accessors meer aanwezig**
- ✓ **E.3: AppState.filterRules is array**
- ✓ **E.3: AppState.sortRules is array**
- ✓ **E.3: AppState.selectedRows is Set**
- ✓ **E.3: AppState.groupFields is array**
- ✓ **E.3: AppState.colFilters is object**
- ✓ **E.3: AppState.collapsedGroups is Set**
- ✓ **E.3: AppState.filterRules mutatie werkt direct**
- ✓ **E.3: computeFilteredData werkt zonder proxy**

### A-A11Y

- ✓ **announce: live-region element bestaat**

### A-FILTER

- ✓ **A-U1: computeFilteredData zonder filters retourneert data**
- ✓ **A-U2: computeFilteredData met onbekende zoekterm → 0 resultaten**
- ✓ **A-U3: computeFilteredData met filterRule beperkt data**
- ✓ **A-U3b: alle gefilterde rijen hebben status Actief**

### A-EXPORT-FMT

- ✓ **A-U4: _formatMarkdown bevat header**
- ✓ **A-U4b: _formatMarkdown bevat separator**
- ✓ **A-U4c: _formatMarkdown bevat datarij**
- ✓ **A-U4d: _formatMarkdown heeft juist aantal regels**
- ✓ **A-U5: _formatHTML bevat DOCTYPE**
- ✓ **A-U5b: _formatHTML bevat th headers**
- ✓ **A-U5c: _formatHTML bevat td data**
- ✓ **A-U5d: _formatHTML heeft geëscapete content**

### A-CONFIG-CTR

- ✓ **A-U6: alle tabs hebben verplichte velden (id,label,icon,columns,features)**
- ✓ **A-U7: tab-ids zijn uniek**
- ✓ **A-U8: alle kolommen hebben key, label, renderer, type**

### A-VIEW-RT

- ✓ **A-U10a: viewState round-trip herstelt filterRules**
- ✓ **A-U10b: viewState round-trip herstelt sortRules**

### A-REGR

- ✓ **A-U11: clickSort functie bestaat**
- ✓ **A-U12: toggleFreeze functie bestaat**
- ✓ **A-U12b: .table-container elementen bestaan voor freeze**

## Visual (C)

### VC-1 — Tokens

- ✓ **VC-1.1 Verplichte tokens aanwezig** — `26 tokens`
- △ **VC-1.2 Verouderde tokens nog aanwezig** — `--surface2, --surface3, --border-hover, --input-border, --accent2, --accent3, --accent4, --shadow-1, --shadow-2`
- ✓ **VC-1.3 Token waarden correct** — `7 gecontroleerd`
- ✓ **VC-1.4 Backward-compat aliassen aanwezig**
- ✓ **VC-1.5 Stylesheet geladen**

### VC-2 — Typografie

- ✓ **VC-2.1 th: 11px uppercase semibold**
- ✓ **VC-2.2 .cell-primary 14px**
- ✓ **VC-2.3 Geen font-weight 700 op btn/tab**
- ✓ **VC-2.4 Geen verboden font-sizes**
- ✓ **VC-2.5 Unieke font-sizes ≤ 6** — `11px, 12px, 14px, 18px, 20px`
- ✓ **VC-2.6 Body font-size 14px**
- ✓ **VC-2.7 .label-caps in gebruik**

### VC-3 — Kleur

- ✓ **VC-3.1 Geen verboden hex-kleuren**
- ✓ **VC-3.2 Actieve tab transparant**
- ✓ **VC-3.3 Aggregatierij niet groen**
- ✓ **VC-3.4 --row-hover niet cyan** — `#E4EEF1`
- ✓ **VC-3.5 Geen hardcoded accentkleuren**

### VC-4 — Borders & lijnen

- ✓ **VC-4.1 Geen verticale celgrenzen**
- ✓ **VC-4.2 thead border-bottom ≤ 1px** — `0px`
- ✓ **VC-4.3 Border-radius ≥ 4px**
- ✓ **VC-4.4 Geen zichtbare .vsep**

### VC-5 — Spacing

- ✓ **VC-5.1 Rijhoogte 32px** — `29 rijen`
- ✓ **VC-5.2 Toolbar hoogte ~40px** — `40px`
- ✓ **VC-5.3 Panel-header padding symmetrisch** — `L/R: 16px`
- ✓ **VC-5.4 Spacing op 4px-grid** — `0 off-grid waarden`

### VC-6 — Schaduwen & animaties

- ✓ **VC-6.1 @keyframes slideOut verwijderd**
- ✓ **VC-6.2 Geen zware schaduw-opaciteit**
- ✓ **VC-6.3a --duration-fast** — `100ms`
- ✓ **VC-6.3b --duration-normal** — `150ms`

### VC-7 — Iconen & regressie

- ✓ **VC-7.1 Geen gekleurde emoji in toolbar**
- ✓ **VC-7.2 Avatars monochroom** — `87 avatars`
- ✓ **VC-7.3 Regressie: th uppercase**
- ✓ **VC-7.4 Regressie: geen td border-left**

## Performance (D)

### D-P — Laadtijd & CSS metrics

- ✓ **D-P1 first-paint: 356ms** — `budget: <500ms`
- ✓ **D-P1 first-contentful-paint: 356ms** — `budget: <500ms`
- ✓ **D-C1 CSS regelcount** — `293 regels`
- ✓ **D-C2 CSS grootte** — `34 KB`
- △ **D-C3 Design tokens** — `116 (doel: ≤42)`

### D-M — DOM & geheugen

- ✓ **D-P2a Load tijd** — `371ms`
- ✓ **D-P2b DOM gereed** — `370ms`
- ✓ **D-M3 JS heap** — `11.3 MB`
- ✓ **D-M1 DOM nodes** — `2392 nodes`

### D-L — Interactie & stabiliteit

- △ **D-L1 Hover reflow latency** — `7.4ms (drempel: <2ms)`
- ✓ **D-S2 Scroll FPS** — `50000 fps (budget: ≥45)`

---

*Gegenereerd door Dashboard Test Runner — v0.37.0*