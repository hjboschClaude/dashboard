# Taakplan Layer 5 — Assembler Layer

Versie: 1.0
Datum: 2026-03-09

---

## 1. Doel

Layer 5 is de **Assembler**: combineert alle bronlagen (Layer 1–4) tot één `dist/*.html` die standalone in de browser draait zonder externe afhankelijkheden.

**Layer 5 is de bouwstap die het platform operationeel maakt.**

### Relatie tot de platformarchitectuur

| Laag | Bestand | Rol |
|------|---------|-----|
| Layer 1 — UX Reference | `ux-reference.html` | UX-patronen, tokens, interactie |
| Layer 2 — Dashboard Engine | `dashboard.html` | Runtime, pipeline, render |
| Layer 3 — CSV Adapter | `src/csv-adapter/` | CSV → datasetContract |
| Layer 4 — Dashboard Spec | `src/dashboard-spec/` | AI-gegenereerde configuratie |
| **→ Layer 5 — Assembler** | `src/assembler/` | **Dit plan** |

### Relatie tot de roadmap-breekpunten

| Breekpunt | Status | Relevant voor Layer 5 |
|-----------|--------|-----------------------|
| **1 — dashboardConfig extraheerbaar** | ✅ Afgerond (v0.44.0) | Basis: config is declaratief JSON |
| **2 — CSV-adapter + eerste AI-spec** | ✅ Afgerond (v0.64.0) | Input voor assembler |
| **3 — Assembler + mappenstructuur** | ✅ Afgerond (v0.65.0) | **Dit plan** |

---

## 2. Wat Layer 5 doet en niet doet

### Wel Layer 5
- Engine HTML inlezen
- Spec JSON inlezen en valideren
- CSV parsen via csv-adapter
- Records injecteren in spec (`dataSource.records`)
- Config-element (`<script id="dashboard-config">`) in engine injecteren
- Geassembleerde single-file HTML aanbieden als download
- Bestandsgrootte en record-aantallen rapporteren

### Niet Layer 5

| Niet Layer 5 | Wel Layer... |
|-------------|-------------|
| CSV parsen (logica) | Layer 3 |
| Config genereren | Layer 4 |
| UX-patronen definiëren | Layer 1 |
| Data renderen | Layer 2 |

---

## 3. Input en output

### Input

```
1. Engine HTML:  dashboard.html  (Layer 2, v0.65.0+ met injectie-ondersteuning)
2. Spec JSON:    dashboard-spec.json  (Layer 4, bijv. projecten-spec.json)
3. CSV data:     *.csv  (Layer 3 input, bijv. projecten.csv)
```

### Output

```
dist/{tabId}-dashboard.html  →  standalone single-file HTML dashboard
```

Het geassembleerde bestand:
- Bevat alle CSS inline (engine + UX tokens)
- Bevat alle JS inline (engine + renderer pipeline)
- Bevat de dashboardConfig als `<script id="dashboard-config">` in `<head>`
- Bevat de records inline in de config (pre-parsed door csv-adapter)
- Heeft geen runtime-afhankelijkheden op externe bestanden

---

## 4. Assembler Injectie-mechanisme

### Wijziging in dashboard.html (v0.65.0)

De engine ondersteunt assembler-injectie via `<script id="dashboard-config" type="application/json">`:

```javascript
const dashboardConfig = (function(){
  var _injEl = document.getElementById('dashboard-config');
  if (_injEl) {
    try { return JSON.parse(_injEl.textContent); }
    catch(e) { console.error('[Assembler] dashboard-config parse error:', e); }
  }
  return { /* ingebouwde ontwikkelconfig */ };
})();
```

- **Zonder injectie:** engine gebruikt de ingebouwde config (bestaand gedrag, alle 241 tests slagen)
- **Met injectie:** engine gebruikt de AI-gegenereerde spec + CSV-data

### Injectie in assembled HTML

```html
<head>
  <script id="dashboard-config" type="application/json">
    { "app": {...}, "tabs": [{ "dataSource": { "type": "dataset", "records": [...] }, ...}], ... }
  </script>
  ...rest van head...
</head>
```

---

## 5. Werkpakketten

```
WP-A ──→ WP-B ──→ WP-C ──→ WP-D
```

| # | Werkpakket | Resultaat | Status |
|---|-----------|-----------|--------|
| WP-A | Engine injectie-ondersteuning | `dashboard.html` IIFE wrapper (v0.65.0) | ✅ v0.65.0 |
| WP-B | Assembler tool bouwen | `src/assembler/assembler.html` | ✅ v0.65.0 |
| WP-C | Mappenstructuur aanmaken | `dashboards/`, `dist/` | ✅ v0.65.0 |
| WP-D | Eerste dist output | `dist/projecten-dashboard.html` | ✅ v0.65.4 |

---

### WP-A — Engine injectie-ondersteuning

**Doel:** dashboard.html ondersteunt config-injectie via `<script id="dashboard-config">`.

**Wijziging:** `dashboardConfig = {...}` → IIFE wrapper die `#dashboard-config` checkt.

**Acceptatiecriteria:**
- Zonder `#dashboard-config` element: engine werkt exact als voor v0.65.0
- Alle 241 engine-tests blijven slagen
- Met `#dashboard-config` element: engine gebruikt geïnjecteerde config

---

### WP-B — Assembler tool

**Doel:** Browser-based tool die 3 bestanden assembleert tot 1 dashboard HTML.

**Deliverable:** `src/assembler/assembler.html`

**Features:**
- 3 file inputs: engine, spec, CSV
- Visuele statusfeedback per input (geladen / fout)
- Pipeline-diagram (Layer 2 + 3 + 4 → Layer 5)
- Assemblage-log met stap-voor-stap feedback
- Auto-download van geassembleerd bestand
- Samenvatting: records, kolommen, tabs, bestandsgrootte

**Acceptatiecriteria:**
- Werkt op file:// protocol (geen server vereist)
- Detecteert engine zonder injectie-ondersteuning (toont foutmelding)
- Valideert spec JSON (tabs[], columns[])
- Rapporteert parse-warnings uit csv-adapter

---

### WP-C — Mappenstructuur

**Doel:** Doelarchitectuur per ARCHITECTUUR.md aanmaken.

**Deliverables:**
- `dashboards/projecten-monitor/dashboard-spec.json`
- `dashboards/projecten-monitor/source/projecten.csv`
- `dist/` (leeg, gevuld door assembler)

---

### WP-D — Eerste dist output (user-actie)

**Doel:** Bewijzen dat de assembler werkt door `dist/projecten-dashboard.html` te produceren.

**Aanpak:**
1. Open `src/assembler/assembler.html` in de browser
2. Selecteer `dashboard.html` als engine
3. Selecteer `dashboards/projecten-monitor/dashboard-spec.json` als spec
4. Selecteer `dashboards/projecten-monitor/source/projecten.csv` als data
5. Klik "Assembleer Dashboard"
6. Sla op als `dist/projecten-dashboard.html`

**Acceptatiecriteria:**
- Dashboard laadt en rendert volledig op basis van spec + CSV-data
- Filter, sort, group werken op alle kolommen
- Export genereert correcte output
- Bestand is standalone (geen externe bestanden vereist)

---

## 6. Mappenstructuur

```
src/assembler/
└── assembler.html            # Browser-based assembler tool (WP-B)

dashboards/                   # Per-dashboard: spec + brondata
└── projecten-monitor/
    ├── dashboard-spec.json   # Layer 4 output (AI-gegenereerde spec)
    └── source/
        └── projecten.csv     # Layer 3 input (CSV brondata)

dist/                         # Geassembleerde single-file dashboards
└── projecten-dashboard.html  # (aangemaakt door assembler — WP-D)
```

---

## 7. Assembler Gebruik — Stappenplan

```
1. Open src/assembler/assembler.html in de browser (dubbelklikken)

2. Engine:  selecteer dashboard.html
           → Status toont bestandsgrootte (~370 KB)

3. Spec:   selecteer dashboards/projecten-monitor/dashboard-spec.json
           → Status toont: "1 tab(s), 18 kolommen"

4. Data:   selecteer dashboards/projecten-monitor/source/projecten.csv
           → Status toont: "~15 rijen"

5. Klik "Assembleer Dashboard"
           → Log toont stap-voor-stap voortgang
           → Auto-download van projecten-dashboard.html

6. Sla op in dist/projecten-dashboard.html
           → Open in browser — dashboard draait standalone
```

---

## 8. Versioning

| Fase | Werkpakketten | Versie |
|------|--------------|--------|
| Engine-injectie + assembler + mappenstructuur | WP-A + WP-B + WP-C | v0.65.0 |
| Eerste dist output | WP-D | User-actie |

---

## 9. Definition of Done

Layer 5 is gereed wanneer:

- [x] Engine ondersteunt `#dashboard-config` injectie — WP-A (v0.65.0)
- [x] Assembler tool werkt op file:// zonder server — WP-B (v0.65.0)
- [x] Mappenstructuur `dashboards/` en `dist/` aangemaakt — WP-C (v0.65.0)
- [x] `dist/projecten-dashboard.html` geproduceerd en werkend — WP-D (v0.65.4)
