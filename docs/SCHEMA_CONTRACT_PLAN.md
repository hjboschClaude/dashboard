# SCHEMA_CONTRACT_PLAN.md — Schema Contract & Feature Gating

Versie: 1.0
Datum: 2026-03-08
Status: ○ Actief — Fase 1 afgerond (v0.56.0), Fase 2 volgt

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

### Fase 2 — Semantic accessors + dual mode (v0.57.0)

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-S7 | Semantic accessor-functies (6 functies) | ○ |
| WP-S8 | Refactor applyFiltersToData() — dual mode | ○ |
| WP-S9 | Refactor condClass() — dual mode | ○ |
| WP-S10 | Refactor rowHtml() — dual mode | ○ |
| WP-S11 | Refactor openModal() + expandRow() — dual mode | ○ |
| WP-S12 | Refactor getAllUniqueNames() — semantic | ○ |
| WP-S13 | Tests A-SEMANTIC suite (≥16 assertions) | ○ |

### Fase 3 — Feature gating actief (v0.58.0)

| WP | Beschrijving | Status |
|----|-------------|--------|
| WP-S14 | resolveFeatureGates() en ContractRegistry | ○ |
| WP-S15 | UI reageert op resolved features | ○ |
| WP-S16 | Declaratief conditional formatting | ○ |
| WP-S17 | Tests A-FEATURE-GATE + A-DEGRADE suites | ○ |
| WP-S18 | Legacy fallbacks verwijderen (optioneel) | ○ |

---

## 4. Afhankelijkheden

```
Fase 1:  S1+S2+S3 (parallel) → S4 → S5 → S6
Fase 2:  S7 → S8+S9+S10+S12 (parallel) → S11 (na S10) → S13
Fase 3:  S14 → S15+S16 (parallel) → S17 → S18 (optioneel)
```

---

## 5. Versienummering

| Versie | Fase | WPs | Impact |
|--------|------|-----|--------|
| v0.56.0 | 1 | S1–S6 | Nul runtime-impact, alleen diagnostiek |
| v0.57.0 | 2 | S7–S13 | Identiek gedrag, generiekere code |
| v0.58.0 | 3 | S14–S17 | Features schakelbaar, UI reageert |
| v0.59.0 | (opt) | S18 | Cleanup, nul hardcoded veldnamen |

---

## 6. Definition of Done

### Fase 1 (v0.56.0)
- [ ] `dashboardConfig.tabs[].schemaContract` aanwezig voor beide tabs
- [ ] `FEATURE_REQUIREMENTS` en `SEMANTIC_ROLE_RULES` constanten aanwezig
- [ ] `validateSchemaAlignment()`, `validateTypeSemantics()`, `validateFeatureRequirements()` bestaan
- [ ] `_validateContractsOnInit()` draait volledige validatieketen
- [ ] A-CONTRACT testsuite met ≥20 assertions
- [ ] Alle bestaande tests groen, geen runtime-gedrag gewijzigd

### Fase 2 (v0.57.0)
- [ ] 6 semantic accessor-functies beschikbaar
- [ ] 5 engine-functies gebruiken semantic pad met legacy fallback
- [ ] A-SEMANTIC testsuite met ≥16 assertions
- [ ] Gedrag identiek aan pre-contract versie

### Fase 3 (v0.58.0)
- [ ] `resolveFeatureGates()` en ContractRegistry op AppState
- [ ] UI verbergt/disablet features bij ontbrekende semantiek
- [ ] `condClass()` volledig declaratief via condFormattingRules
- [ ] A-FEATURE-GATE + A-DEGRADE testsuites
