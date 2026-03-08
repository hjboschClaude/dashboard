# Index — Plannen, Sprint-IDs & Documenten

Versie: 1.0
Datum: 2026-03-08

---

## 1. Actieve plannen

| Document | Scope | Status |
|----------|-------|--------|
| [TESTREGISTER.md](TESTREGISTER.md) | Automatische testarchitectuur: 4 suites, 28 performance-budgetten | ○ Actief — fase 1–5 |

## 2. Afgeronde plannen (archief)

| Document | Scope | Afgerond |
|----------|-------|----------|
| [IMPLEMENTATIEPLAN.md](IMPLEMENTATIEPLAN.md) | 25 taken over sprints A–F (correctheid, geheugen, a11y, testbaarheid, onderhoudbaarheid, browsercompat) | v0.31.0 — 24/25 taken |
| [PERFORMANCE_PLAN.md](PERFORMANCE_PLAN.md) | 7 perf-taken over sprints 1–5 (cache, async init, scroll, perf API, overlay) | v0.25.1 |
| [DESIGN_PLAN.md](DESIGN_PLAN.md) | Visuele redesign: tokens, typografie, kleur, spacing, animaties, iconen | v0.15.0 |

## 3. Kaders en referentiedocumenten

| Document | Doel | Bijwerken |
|----------|------|-----------|
| [TOETSINGSKADER.md](TOETSINGSKADER.md) | 64 bevindingen over 11 dimensies + beoordelingskader 10 domeinen | Per sprint herscoren |
| [TESTPLAN.md](TESTPLAN.md) | Testplan design-wijzigingen (DevTools-based) | Bij testwijziging |
| [BUGS.md](BUGS.md) | Bug tracker (BUG-016+) | Bij nieuwe bug of fix |
| [CHANGELOG.md](CHANGELOG.md) | Chronologisch logboek alle versies (v0.9.0+) | Elke versie |
| [WERKWIJZE_VERSIEBEHEER.md](WERKWIJZE_VERSIEBEHEER.md) | Proces: versienummering, changelog, commits, toetsing | Bij proceswijziging |
| [TEMPLATE_ONTWERP.md](TEMPLATE_ONTWERP.md) | Technisch ontwerp single-file template: 22 secties, objectstructuren, sectie-indeling | Bij architectuurwijziging |

## 4. Sprint-ID kruisverwijzing

| Sprint-ID | Bron | Bereik | Status |
|-----------|------|--------|--------|
| **1–5** | PERFORMANCE_PLAN.md | P1 cache-key, P3 onclick-regex, P4 Set-lookup, P5 passive scroll, P6 fonts, P2 async init, P7 perf API | ✓ Afgerond v0.25.1 |
| **A–F** | IMPLEMENTATIEPLAN.md | A: correctheid/beveiliging, B: geheugen/koppeling, C: toegankelijkheid, D: testbaarheid, E: onderhoudbaarheid, F: browsercompat | ✓ 24/25 afgerond v0.31.0 |
| **T1–T7** | DESIGN_PLAN.md / TESTPLAN.md | T1: tokens, T2: typografie, T3: kleur, T4: borders, T5: spacing, T7: iconen | ✓ Afgerond |
| **GATE-1–7** | TESTPLAN.md | Implementatie-gates per designfase | ✓ Afgerond |
| **A-U1–U12** | TESTREGISTER.md | Unit-tests: filter, export, config, viewState, browser-support | ○ Open |
| **B-I1–I24** | TESTREGISTER.md | Integratietests: tabs, filter, sort, groep, selectie, virtualisatie, a11y | ○ Open |
| **VC-1–VC-7** | TESTREGISTER.md | Visual Contracts (samenvoeging T+GATE) | ○ Open |
| **D-P/M/C/L/S** | TESTREGISTER.md | Performance-budgetten: timing, DOM, heap, CSS, latency, stabiliteit | ○ Open |

## 5. Testrapporten

Locatie: `archive/testrapporten/testrapport-v{X.Y.Z}-{YYYY-MM-DD}.md`

Meest recente: [testrapport-v0.35.0-2026-03-08.md](../archive/testrapporten/testrapport-v0.35.0-2026-03-08.md)

## 6. Snapshots

Locatie: `archive/snapshots/dashboard-v{X.Y.Z}.html`

Milestone-snapshots: v0.17.0, v0.24.0, v0.30.0, v0.31.0
