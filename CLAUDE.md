# Dashboard — Gemeente Rotterdam

## Project

Interactief overzichtsdashboard voor projecten en teamleden binnen de Gemeente Rotterdam. Toont status, voortgang en KPI's in filterbare, sorteerbare tabellen met groepering en aggregatie.

Het dashboard is bewust opgebouwd als **één enkel HTML-bestand** (`dashboard.html`, ~4500 regels, vanilla JS/CSS) zonder externe dependencies. Dit bestand dient als **template**: door alleen `dashboardConfig` aan te passen kan het hergebruikt worden voor andere dashboards binnen de gemeente.

Versie: pre-1.0 (actieve ontwikkeling).

## Conventies

### Taal
- Documentatie, changelog, comments: **Nederlands**
- Code (variabelen, functies): Engels
- Commit-berichten: Nederlands

### Versienummering
- Semantic versioning: `0.x.y`
- Versienummer op **twee plekken** synchroon houden:
  1. `const DASHBOARD_VERSION = 'x.y.z';` in `dashboard.html`
  2. Meest recente entry in `docs/CHANGELOG.md`

### Changelog-formaat
```markdown
## v0.X.Y — YYYY-MM-DD

**Type:** <Veiligheid|Architectuur|Performance|UI|Bugfix|Feature|Refactor|Documentatie|Testbaarheid>
**Domein:** <domeinreferentie uit TOETSINGSKADER.md>

<Beschrijving in verleden tijd, 2-3 regels>
```

### Git commit-formaat
```
<type>(v<versie>): <korte samenvatting in het Nederlands>
```
Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`
Eén commit per versienummer.

### Bestandsnamen
- Plannen/kaders in `docs/`: `SCREAMING_CASE.md`
- Testrapporten: `archive/testrapporten/testrapport-v{X.Y.Z}-{YYYY-MM-DD}.md`
- Snapshots: `archive/snapshots/dashboard-v{X.Y.Z}.html`
- Nooit spaties in bestandsnamen
- Alleen `dashboard.html` en `CLAUDE.md` in de root

## Workflow per sessie

1. Kies taak uit actief plan (zie `docs/INDEX.md` voor overzicht)
2. Implementeer in `dashboard.html`
3. Test in browser (visueel + `runTests()` + test runner Alt+Shift+T)
4. Bump `DASHBOARD_VERSION` in `dashboard.html`
5. Schrijf changelog-entry in `docs/CHANGELOG.md`
6. Commit: `<type>(v<versie>): <samenvatting>`
7. Optioneel: toets tegen `docs/TOETSINGSKADER.md` bij sprint-afronding

## Architectuur

- **`dashboardConfig`** — centrale configuratie: tabs (projecten/team), kolomdefinities, domeinen, kleuren
- **`AppState`** — singleton state-object met dirty flags en derived-state cache; alle UI-state loopt via AppState
- **Virtual scroll** — `renderVirtualBody()` en `_renderGroupedVirtual()` met `_vBuf` buffer-rijen; DOM bevat alleen zichtbare rijen
- **`cellRenderers`** — object met per-kolom render-functies voor tabelcellen
- **Filter/sort/groepeer** — `computeFilteredData()` → `sortData()` → `groupData()` → `computeAggModel()` pipeline
- **Test runner** — ingebouwd in dashboard, activeer met `runTests()` of Alt+Shift+T; suites: Unit, Integratie, Visual Contracts, Performance
- **Performance-instrumentatie** — `performance.mark/measure`, FPS-monitor, LongTask observer, heap-meting

## Documentenstructuur

Zie `docs/INDEX.md` voor de volledige kruisverwijzing van alle plannen, sprint-IDs en documenten.

## Kwaliteitscriteria

- Elke opgeloste bug krijgt een permanente regressietest
- Performance-budgetten staan in `docs/TESTREGISTER.md`
- Geen code committen met bekende test-failures
- v1.0.0 vereist: gemiddelde toetsingsscore ≥ 7.5, geen domein < 6
