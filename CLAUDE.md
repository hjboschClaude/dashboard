# CSV Dashboard Template Platform — Gemeente Rotterdam

## Visie

Een platformfamilie waarmee op basis van **CSV-bestanden** via **generatieve AI** automatisch maatwerk-dashboards worden gebouwd. Elk einddashboard is één enkel HTML-bestand (vanilla JS/CSS, zero dependencies) dat direct in de browser draait.

**De keten:**

```
CSV-bestanden → CSV-adapter → schema → AI → dashboard-spec → assembler → single HTML
```

Meerdere CSV-bestanden worden door AI geanalyseerd en omgezet in een compleet, tailor-made dashboard — zonder handmatig coderen van de configuratie.

## Huidige staat

Het eerste dashboard (`dashboard.html`, v0.42.0, ~5000 regels) is operationeel en dient als **proof-of-concept en bronarchitectuur** voor het platform. Het bevat:

- **241 geautomatiseerde tests** (0 fails, 4 suites)
- **42 RODS design tokens** (15 semantic + 27 palette)
- **27 performance-metrics** met harde budgetten
- Declaratief configuratiemodel (`dashboardConfig`)
- Virtual scroll voor grote datasets (4500+ rijen)
- Ingebouwde test runner (Alt+Shift+T)

## Doelarchitectuur — 5 lagen

De bronarchitectuur bestaat uit vijf lagen die samen één HTML-dashboard genereren:

| Laag | Rol | Bron van waarheid voor |
|------|-----|------------------------|
| **UX Reference** | Gedrag, states, styling, tokens | Hoe dashboards eruitzien en zich gedragen |
| **Dashboard Engine** | Runtime: filtering, sorting, grouping, virtualisatie, export, state | Schaalbare dataverwerking en rendering |
| **CSV Adapter** | Parsing, normalisatie, schema inference, validatie | Betrouwbare en uniforme data |
| **Dashboard Spec** | Per-dashboard configuratie (AI-gegenereerd) | Tabs, kolommen, labels, defaults, formattering |
| **Assembler** | Bundelt alle lagen tot één HTML-bestand | Het bouwproces van bron naar eindproduct |

**Centrale ontwerpregel:** Eén bron van waarheid per concern. Zodra twee lagen hetzelfde probleem oplossen, ontstaat drift.

### Doelmappenstructuur

```
dashboard-template-platform/
├── CLAUDE.md
├── docs/
├── src/
│   ├── ux-reference/        # Design tokens, interaction patterns, overlays
│   ├── dashboard-engine/    # AppState, pipeline, renderers, virtual scroll
│   ├── csv-adapter/         # Parsing, typing, schema, validatie
│   ├── dashboard-spec/      # AI-outputformaat, spec-schema, transformaties
│   └── assembler/           # CSS/JS bundelen, config injecteren, minify
├── dashboards/              # Per dashboard: spec.json + CSV-bronbestanden
│   ├── project-monitor/
│   ├── finance-overview/
│   └── subsidy-dashboard/
├── dist/                    # Geassembleerde single-file HTML dashboards
└── archive/
```

### AI-generatieproces

1. **CSV aanleveren** — een of meer bronbestanden per dashboard
2. **CSV-adapter** — genormaliseerde velden, schema, datakwaliteitssignalen
3. **AI analyseert** — schema + businessregels → genereert `dashboard-spec.json`
4. **Assembler combineert** — UX reference + engine + data + spec → single HTML
5. **Output** — één tailor-made `dashboard.html` per use case

## Omgevingsbeperkingen

- **Geen Python** beschikbaar op deze Windows-laptop — gebruik geen Python-scripts of pip-commando's
- **Geen Node.js / npx** beschikbaar — gebruik geen npm, npx of Node-scripts
- **Geen Chrome/browser-test** mogelijk vanuit CLI — visuele verificatie en testruns gebeuren door de gebruiker in de browser
- **Geen preview_start** mogelijk — er is geen runtime om een dev-server te starten; sla verificatiestappen via preview-tools over

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
- Alleen `dashboard.html`, `ux-reference.html` en `CLAUDE.md` in de root

## Workflow per sessie

1. Kies taak uit actief plan (zie `docs/INDEX.md` voor overzicht)
2. Implementeer in `dashboard.html` (of relevante bronlaag)
3. Test in browser (visueel + `runTests()` + test runner Alt+Shift+T)
4. Bump `DASHBOARD_VERSION` in `dashboard.html`
5. Schrijf changelog-entry in `docs/CHANGELOG.md`
6. Commit: `<type>(v<versie>): <samenvatting>`
7. Optioneel: toets tegen `docs/TOETSINGSKADER.md` bij sprint-afronding

## Architectuur — huidige implementatie (v0.59.0)

De huidige `dashboard.html` bevat de engine-laag en UX-laag nog in één bestand:

- **`dashboardConfig`** — declaratieve configuratie: tabs, kolomdefinities, domeinen, kleuren, features, exports
- **`AppState`** — singleton state-object met dirty flags en derived-state cache; alle UI-state loopt via AppState
- **Engine pipeline** — `computeFilteredData()` → `sortData()` → `groupData()` → `computeAggModel()` → `renderVirtualBody()`
- **Virtual scroll** — `renderVirtualBody()` en `_renderGroupedVirtual()` met `_vBuf` buffer-rijen; DOM bevat alleen zichtbare rijen
- **`cellRenderers`** — object met per-kolom render-functies voor tabelcellen
- **Design tokens** — 42 tokens in `:root` (15 semantic + 27 RODS palette)
- **Test runner (DTR)** — ingebouwd, 4 suites: Unit (A), Integratie (B), Visual Contracts (C), Performance (D)
- **Performance-instrumentatie** — `performance.mark/measure`, FPS-monitor, LongTask observer, heap-meting

## Roadmap — drie breekpunten

| # | Breekpunt | Wat | Resultaat |
|---|-----------|-----|-----------|
| 1 | **dashboardConfig extraheerbaar** | Runtime-logica (`generateData()`) uit config halen, puur declaratief JSON maken | Dashboard wordt AI-ready |
| 2 | **CSV-adapter + eerste AI-spec** | Adapter bouwt schema uit CSV, AI genereert eerste `dashboard-spec.json` | Eerste AI-gegenereerd dashboard |
| 3 | **Assembler + mappenstructuur** | Engine/tokens/UX extraheren naar src/, assembler bouwt single HTML | Platform operationeel |

## Documentenstructuur

Zie `docs/INDEX.md` voor de volledige kruisverwijzing van alle plannen, sprint-IDs en documenten.

### Kerndocumenten platformarchitectuur

| Document | Doel |
|----------|------|
| [ARCHITECTUUR.md](docs/ARCHITECTUUR.md) | Doelarchitectuur: 5 lagen, contracten, interfaces, eindbeeld |
| [VERANDERPAD.md](docs/VERANDERPAD.md) | Gefaseerd migratiepad van huidig naar doelarchitectuur |
| [TEMPLATE_ONTWERP.md](docs/TEMPLATE_ONTWERP.md) | Technisch ontwerp single-file template structuur |

## Kwaliteitscriteria

- Elke opgeloste bug krijgt een permanente regressietest
- Performance-budgetten staan in `docs/TESTREGISTER.md`
- Geen code committen met bekende test-failures
- v1.0.0 vereist: gemiddelde toetsingsscore ≥ 7.5, geen domein < 6
- Elke laag krijgt eigen testsoort (zie `docs/TESTREGISTER.md` §12)
