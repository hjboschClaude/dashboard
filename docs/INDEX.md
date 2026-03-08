# Index — Plannen, Sprint-IDs & Documenten

Versie: 2.3
Datum: 2026-03-08

---

## 1. Platformvisie

Dit project evolueert van één dashboard naar een **CSV Dashboard Template Platform**: meerdere CSV-bestanden worden via AI geanalyseerd en omgezet in tailor-made single-file HTML-dashboards. Zie `CLAUDE.md` voor de volledige visie en roadmap.

---

## 2. Architectuurdocumenten

| Document | Scope | Status |
|----------|-------|--------|
| [ARCHITECTUUR.md](ARCHITECTUUR.md) | Doelarchitectuur: 5 lagen (UX, engine, CSV-adapter, dashboard-spec, assembler), contracten, interfaces, synchronisatiemodel | ○ Actief — basis vastgelegd |
| [VERANDERPAD.md](VERANDERPAD.md) | Gefaseerd migratiepad: van huidig single-file naar meerlaags platform | ○ Actief — richting bepaald |
| [TEMPLATE_ONTWERP.md](TEMPLATE_ONTWERP.md) | Technisch ontwerp single-file template: 22 secties, objectstructuren | Referentie |

---

## 3. Actieve plannen

| Document | Scope | Status |
|----------|-------|--------|
| [LAYER1_PLAN.md](LAYER1_PLAN.md) | UX Reference Layer: 12 werkpakketten (WP1–WP12), herpositionering, structuur, PORT THIS/DEMO ONLY, token-alignment, pattern catalog, porting notes | ○ Open — P1 eerst |
| [LAYER2_PLAN.md](LAYER2_PLAN.md) | Dashboard Engine Layer: 13 werkpakketten (WP-A t/m WP-M), 4 fasen (2a–2d), config extraheerbaar, contracts, derive, render, UX hooks | ○ Open — Fase 2a eerst |
| [SCHEMA_CONTRACT_PLAN.md](SCHEMA_CONTRACT_PLAN.md) | Schema Contract & Feature Gating: 20 werkpakketten (WP-P1–P2, WP-S1–S18), 4 fasen, perf quickfixes + semantisch generieke engine | ○ Actief — Fase 1 afgerond (v0.56.0), Fase 1½ volgt |
| [TESTREGISTER.md](TESTREGISTER.md) | Automatische testarchitectuur: 4 suites, 27 performance-metrics, 271 checks | ✅ Fase 1–5 afgerond (v0.42.0), taak 5.6 doorlopend |

---

## 4. Afgeronde plannen (archief)

| Document | Scope | Afgerond |
|----------|-------|----------|
| [IMPLEMENTATIEPLAN.md](IMPLEMENTATIEPLAN.md) | 25 taken over sprints A–F (correctheid, geheugen, a11y, testbaarheid, onderhoudbaarheid, browsercompat) | ✅ v0.31.0 — 24/25 taken |
| [PERFORMANCE_PLAN.md](PERFORMANCE_PLAN.md) | 7 perf-taken over sprints 1–5 (cache, async init, scroll, perf API, overlay) | ✅ v0.25.1 |
| [DESIGN_PLAN.md](DESIGN_PLAN.md) | Visuele redesign: tokens, typografie, kleur, spacing, animaties, iconen | ✅ v0.15.0 |

---

## 5. Kaders en referentiedocumenten

| Document | Doel | Bijwerken |
|----------|------|-----------|
| [TOETSINGSKADER.md](TOETSINGSKADER.md) | 64 bevindingen over 11 dimensies + beoordelingskader 10 domeinen | Per sprint herscoren |
| [TESTPLAN.md](TESTPLAN.md) | Testplan design-wijzigingen (DevTools-based) | Bij testwijziging |
| [BUGS.md](BUGS.md) | Bug tracker (BUG-016+) | Bij nieuwe bug of fix |
| [CHANGELOG.md](CHANGELOG.md) | Chronologisch logboek alle versies (v0.9.0–v0.56.0) | Elke versie |
| [WERKWIJZE_VERSIEBEHEER.md](WERKWIJZE_VERSIEBEHEER.md) | Proces: versienummering, changelog, commits, toetsing | Bij proceswijziging |
| [VOORSTEL_UX_KOLOMMEN.md](VOORSTEL_UX_KOLOMMEN.md) | Kolom drag-drop UX voorstel: visuele feedback combinatie | Referentie |

---

## 6. Sprint-ID kruisverwijzing

| Sprint-ID | Bron | Bereik | Status |
|-----------|------|--------|--------|
| **1–5** | PERFORMANCE_PLAN.md | P1 cache-key, P3 onclick-regex, P4 Set-lookup, P5 passive scroll, P6 fonts, P2 async init, P7 perf API | ✅ Afgerond v0.25.1 |
| **A–F** | IMPLEMENTATIEPLAN.md | A: correctheid/beveiliging, B: geheugen/koppeling, C: toegankelijkheid, D: testbaarheid, E: onderhoudbaarheid, F: browsercompat | ✅ 24/25 afgerond v0.31.0 |
| **T1–T7** | DESIGN_PLAN.md / TESTPLAN.md | T1: tokens, T2: typografie, T3: kleur, T4: borders, T5: spacing, T7: iconen | ✅ Afgerond |
| **GATE-1–7** | TESTPLAN.md | Implementatie-gates per designfase | ✅ Afgerond |
| **A-U1–U12** | TESTREGISTER.md | Unit-tests: filter, export, config, viewState, browser-support | ✅ v0.37.0 |
| **B-I1–I24** | TESTREGISTER.md | Integratietests: tabs, filter, sort, groep, selectie, virtualisatie, a11y | ✅ v0.38.0 |
| **VC-1–VC-7** | TESTREGISTER.md | Visual Contracts (samenvoeging T+GATE), 33 checks | ✅ v0.36.0 (bijgewerkt v0.42.0) |
| **D-P/M/C/L/S** | TESTREGISTER.md | Performance-budgetten: timing, DOM, heap, CSS, latency, stabiliteit, 27 metrics | ✅ v0.39.0 |
| **L1-WP1–WP12** | LAYER1_PLAN.md | UX Reference: herpositionering, structuur, labels, tokens, patterns, porting, a11y, review | ○ Open |
| **L2-WP-A–M** | LAYER2_PLAN.md | Engine: positionering, config, contracts, core, derive, virtualisatie, render, hooks, export, a11y, tests, assembler | ○ Open |
| **WP-P1–P2** | SCHEMA_CONTRACT_PLAN.md | Performance quickfixes: _perfDebug guard, computeVisibleCols() cache | ○ Open (v0.56.1) |
| **WP-S1–S18** | SCHEMA_CONTRACT_PLAN.md | Schema contracts, semantic accessors, feature gating, declaratief condFormatting | ○ Fase 1 afgerond (v0.56.0) |

---

## 7. Testrapporten

Locatie: `archive/testrapporten/testrapport-v{X.Y.Z}-{YYYY-MM-DD}.md`

Totaal: 36 rapporten (v0.14.0–v0.56.0)
Meest recente: [testrapport-v0.56.0-2026-03-08.md](../archive/testrapporten/testrapport-v0.56.0-2026-03-08.md)

---

## 8. Adviesdocumenten (archief)

Locatie: `archive/adviezen/`

| Document | Scope | Verwerkt in |
|----------|-------|-------------|
| advies.md | Algemeen architectuuradvies | Diverse plannen |
| advies schema contract en feature gating.md | Analyse hardcoded veldnamen, feature flags | SCHEMA_CONTRACT_PLAN.md |
| advies stable row identity.md | Row identity model, rowKey, stale selection | SCHEMA_CONTRACT_PLAN.md v1.1 |
| Performance_Roadmap_Dashboard_v052.md/.xlsx | 25 perf-routes, 4 prioriteiten, 5 fasen | SCHEMA_CONTRACT_PLAN.md v1.2 (routes 1, 2, 6) |
| black swan en blindspot analyse.md | Risico-analyse, edge cases, blinde vlekken | Referentie |

---

## 9. Snapshots

Locatie: `archive/snapshots/dashboard-v{X.Y.Z}.html`

Milestone-snapshots: v0.17.0, v0.24.0, v0.30.0, v0.31.0
