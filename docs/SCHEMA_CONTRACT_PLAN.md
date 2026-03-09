# SCHEMA_CONTRACT_PLAN.md — Schema Contract & Feature Gating

Versie: 1.4
Datum: 2026-03-09
Status: ✅ Fase 3 afgerond (v0.58.0) — Engine volledig generiek
Bronnen: `advies stable row identity.md` (v1.1), `Performance_Roadmap_Dashboard_v052.md` (v1.2)

---

## 1. Doel

Dit plan maakt de dashboard engine **semantisch generiek**. Vijf functies bevatten nog hardcoded veldnamen die vervangen worden door een drielaags contractsysteem:

1. **Schema contract per tab** — declareert welke velden welke semantische rol spelen
2. **Feature requirements** — declareert welke semantiek elke feature nodig heeft
3. **Semantic role rules** — valideert dat semantische mappings type-correct zijn

Na afronding kan elke dataset met willekeurige veldnamen een volledig werkend dashboard aandrijven.

---

## 2. Probleemanalyse

### 2.1 Hardcoded veldnamen in engine-functies

| Functie | Hardcoded referenties | Semantic rol |
|---------|-----------------------|-------------|
| `applyFiltersToData()` | `r.directeur`, `r.aog`, `r.pm`, `r.name`, `currentTab===0` | searchTextFields, primaryLabel |
| `condClass()` | `r.priority`, `r.status`, `r.actief`, `r.progress` | priority, status, activeFlag, progress |
| `rowHtml()` | `r.id`, `r.name`, `c.key==='name'` | primaryKey, primaryLabel |
| `openModal()` | `x.id`, `r.name` | primaryKey, detailTitle |
| `getAllUniqueNames()` | `r.directeur`, `r.aog`, `r.pm`, `r.name` | searchTextFields |

### 2.2 Feature flags niet actief

`dashboardConfig.tabs[].features` (8 flags) worden **nergens gelezen** door de engine.

### 2.3 Functies die al generiek zijn (geen wijziging nodig)

`matchRule()`, `sortData()`, `groupData()`, `renderCell()`, `buildSearchIndex()` — gebruiken dynamische veldnamen.

### 2.4 Row identity kwetsbaarheden

De huidige row-identity is fragiel en hardcoded:

| Locatie | Probleem | Risico |
|---------|----------|--------|
| `expandRow()` | `parseInt(el.id.split('-')[1])` — breekt bij string-keys (bijv. `"P-1042"`) | Crash / verkeerde rij |
| `openModal()` | `x.id === id` — hardcoded veldnaam `id` | Niet-generiek |
| `selectedRows` Set | Bevat `"tab-id"` strings — tab-index afhankelijk | Stale na tab-herordening |
| `contextRow` / `showCtx()` | Wordt geparsed met `split('-')` — fragiel bij samengestelde keys | Verkeerde context |

Oplossingsrichting: drielaags identity model (business key → engine row key → row reference), geïntegreerd in Fase 2 accessors.

### 2.5 Items voor Layer 3 (buiten scope dit plan)

De volgende items vallen buiten Fase 1–3 maar moeten bij Layer 3 (CSV-adapter) opgepakt worden:

- **Stale selection reconciliation** — na CSV reload kunnen `selectedRowKeys` verwijzen naar verwijderde records; `reconcileSelectionForTab(tabId, newData)` functie nodig
- **Cross-tab selection persistence** — bij tab-switch moeten selecties bewaard blijven via rowKey (niet index)

---

## 3. Werkpakketten

### Fase 1 — Contractlaag toevoegen (v0.56.0)

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-S1 | SchemaContract toevoegen aan beide tabs in dashboardConfig | ✅ |
| WP-S2 | FEATURE_REQUIREMENTS constante toevoegen | ✅ |
| WP-S3 | SEMANTIC_ROLE_RULES constante toevoegen | ✅ |
| WP-S4 | Drie nieuwe validatorfuncties | ✅ |
| WP-S5 | _validateContractsOnInit() uitbreiden | ✅ |
| WP-S6 | Unit tests A-CONTRACT suite (≥20 assertions) | ✅ |

### Fase 1½ — Performance quickfixes (v0.56.1)

Bron: `Performance_Roadmap_Dashboard_v052.md` — routes 1, 6 (prio 1/2, nul risico).

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-P1 | `_perfDebug` guard: `performance.mark/measure` + `console.log` alleen als `_perfDebug=true`; standaard uit in productie (Route 1) | ✅ |
| WP-P2 | `computeVisibleCols()` cachen: dirty flag `_dirty.cols`, alleen herberekenen bij kolom-toggle/reorder (Route 6) | ✅ |

### Fase 2 — Semantic accessors + dual mode (v0.57.0)

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-S7 | Semantic accessor-functies (9 functies): 6 bestaand + `normalizeRecordId(value)`, `makeRowKey(tabId, recordId)`, `parseRowKey(rowKey)` | ✅ |
| WP-S8 | Refactor applyFiltersToData() — dual mode + single-pass filtering: 3 `.filter()` passes → 1 samengesteld predikaat (Perf Route 2, 20–40% winst op filter) | ✅ |
| WP-S9 | Refactor condClass() — dual mode | ✅ |
| WP-S10 | Refactor rowHtml() — dual mode + `data-row-key` attribuut op elke `<tr>` via `makeRowKey()` | ✅ |
| WP-S11 | Refactor openModal() + expandRow() — dual mode + `_tabIndexById` Map per tab voor O(1) lookup, `getRecordByKey()`, `showCtx()` bewaart full rowKey | ✅ |
| WP-S12 | Refactor getAllUniqueNames() — semantic | ✅ |
| WP-S13 | Tests A-SEMANTIC suite (≥26 assertions): accessor bestaan (5), retourwaarden (6), identity (7), composite keys (2), DOM integratie (2), _tabIndexById (2), dual mode (2) | ✅ |

### Fase 3 — Feature gating actief (v0.58.0)

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-S14 | resolveFeatureGates() + isFeatureEnabled() + AppState opslag | ✅ |
| WP-S15 | UI reageert op resolved features (CSS gating + guards + rowHtml/renderHeader) | ✅ |
| WP-S16 | Declaratief conditional formatting (condFormattingRules + evaluateCondRule) | ✅ |
| WP-S17 | Tests A-FEATURE-GATE (20) + A-DEGRADE (10) suites | ✅ |
| WP-S18 | Legacy cleanup: `selectedRows` → `selectedRowKeys`, `contextRow` → `contextRowKey`, makeRowKey migratie, dupe-key validatie | ✅ |

---

## 4. Afhankelijkheden

```
Fase 1:   S1+S2+S3 (parallel) → S4 → S5 → S6
Fase 1½:  P1+P2 (parallel, onafhankelijk)
Fase 2:   S7 → S8+S9+S10+S12 (parallel) → S11 (na S10) → S13
Fase 3:   S14 → S15+S16 (parallel) → S17 → S18 (optioneel)
```

---

## 5. Versienummering

| Versie | Fase | WPs | Impact |
|--------|------|-----|--------|
| v0.56.0 | 1 | S1–S6 | Nul runtime-impact, alleen diagnostiek |
| v0.56.1 | 1½ | P1–P2 | Performance quickfixes, nul functionele impact |
| v0.57.0 | 2 | S7–S13 | Identiek gedrag, generiekere code + single-pass filter |
| v0.58.0 | 3 | S14–S18 | Features schakelbaar, UI reageert, declaratief condFormatting, legacy cleanup |

---

## 6. Definition of Done

### Fase 1 (v0.56.0)
- [ ] `dashboardConfig.tabs[].schemaContract` aanwezig voor beide tabs
- [ ] `FEATURE_REQUIREMENTS` en `SEMANTIC_ROLE_RULES` constanten aanwezig
- [ ] `validateSchemaAlignment()`, `validateTypeSemantics()`, `validateFeatureRequirements()` bestaan
- [ ] `_validateContractsOnInit()` draait volledige validatieketen
- [ ] A-CONTRACT testsuite met ≥20 assertions
- [ ] Alle bestaande tests groen, geen runtime-gedrag gewijzigd

### Fase 1½ (v0.56.1)
- [ ] `_perfDebug` guard: `performance.mark/measure` alleen bij `_perfDebug=true`
- [ ] `computeVisibleCols()` gecached met dirty flag
- [ ] Alle bestaande tests groen, geen functioneel verschil

### Fase 2 (v0.57.0)
- [ ] 9 semantic accessor-functies beschikbaar (incl. `normalizeRecordId()`, `makeRowKey()`, `parseRowKey()`)
- [ ] 5 engine-functies gebruiken semantic pad met legacy fallback
- [ ] Alle `<tr>` elementen hebben `data-row-key` attribuut via `makeRowKey()`
- [ ] `_tabIndexById` Map actief per tab, O(1) record lookup in `openModal()` / `expandRow()`
- [ ] Event handlers lezen rowKey uit DOM i.p.v. index-parse
- [ ] A-SEMANTIC testsuite met ≥24 assertions (incl. identity round-trip tests)
- [ ] Gedrag identiek aan pre-contract versie

### Fase 3 (v0.58.0)
- [ ] `resolveFeatureGates()` en ContractRegistry op AppState
- [ ] UI verbergt/disablet features bij ontbrekende semantiek
- [ ] `condClass()` volledig declaratief via condFormattingRules
- [ ] A-FEATURE-GATE + A-DEGRADE testsuites
