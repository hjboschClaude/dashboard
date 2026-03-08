# Werkwijze versiebeheer en kwaliteitsbewaking dashboard

Versie: 2.0
Datum: 2026-03-08

---

## 1. Doel

Dit document beschrijft hoe het dashboard incrementeel wordt verbeterd, hoe wijzigingen worden vastgelegd en hoe de codekwaliteit periodiek wordt getoetst. Het doel is een herhaalbaar, transparant proces dat voorkomt dat technische schuld ongemerkt groeit.

---

## 2. Versienummering

Het dashboard volgt semantic versioning in de vorm `0.x.y`.

- **0** — het platform is in actieve ontwikkeling (pre-1.0). Versie 1.0.0 wordt bereikt wanneer de Layer 1/Layer 2 werkpakketten zijn afgerond, de CSV-adapter en assembler operationeel zijn, en het beoordelingskader een gemiddelde score van minimaal 7,5 laat zien (zie §7).
- **x** (minor) — wordt verhoogd bij sprint-afrondingen of structurele wijzigingen die de architectuur, veiligheid of het datamodel raken.
- **y** (patch) — wordt verhoogd bij individuele bugfixes, kleine UI-verbeteringen of cosmetische aanpassingen.

Het startpunt is **v0.9.0** (7 maart 2026). Dit reflecteert dat de functionele feature-set nagenoeg compleet is, maar de technische gezondheid nog niet op productieniveau zit.

### Waar staat het versienummer?

Op twee plekken, die altijd synchroon moeten zijn:

1. In het JavaScript bovenaan het script-blok: `const DASHBOARD_VERSION = '0.9.0';`
2. In de CHANGELOG.md als meest recente entry.

---

## 3. Changelog

Het bestand `CHANGELOG.md` in dezelfde map als het dashboard legt elke wijziging vast. Elke entry bevat:

- **Versienummer** en **datum**
- **Type**: Veiligheid, Architectuur, Performance, UI, Bugfix, Documentatie
- **Omschrijving**: wat is gewijzigd en waarom, in twee à drie regels
- **Domein(en)**: welk domein uit het beoordelingskader codekwaliteit wordt geraakt (optioneel, alleen bij relevante wijzigingen)

### Formaat

```markdown
## v0.9.1 — 2026-03-07

**Type:** Veiligheid
**Domein:** 4.1 Veiligheid (XSS, injectie)

Centrale escapeHtml- en escapeAttr-functies toegevoegd. Alle celrenderers
aangepast om datawaarden te escapen voordat ze in innerHTML worden gezet.
```

### Regels

- Schrijf de changelog-entry direct na het doorvoeren van de wijziging, niet achteraf.
- Eén entry per versienummer. Als een sessie meerdere kleine fixes bevat, groepeer ze onder één patch-versie.
- Gebruik de verleden tijd ("toegevoegd", "verwijderd", "aangepast").

---

## 3b. Git commit-conventie

Elke versie krijgt precies één git-commit. Het commit-bericht volgt dit formaat:

```
<type>(v<versie>): <korte samenvatting in het Nederlands>
```

### Types

| Type | Wanneer |
|------|---------|
| `feat` | Nieuwe functionaliteit of tests |
| `fix` | Bugfix |
| `refactor` | Herstructurering zonder gedragswijziging |
| `perf` | Performance-verbetering |
| `test` | Alleen test-toevoegingen/wijzigingen |
| `docs` | Alleen documentatie |

### Voorbeelden

```
feat(v0.35.0): T+GATE samenvoegen tot Visual Contracts, scorecard toevoegen
fix(v0.34.0): BUG-016 emoji-drag sorteerfix, BUG-017 freeze-sticky
refactor(v0.31.0): legacy window-accessors verwijderd, migratie naar AppState
test(v0.36.0): integratietests B-I1 t/m B-I12 toegevoegd
docs(v0.35.1): INDEX.md en CLAUDE.md aangemaakt
```

### Regels

- Eén commit per versienummer — niet meerdere versies in één commit.
- Samenvatting in het Nederlands, verleden tijd.
- Verwijs naar sprint-/taak-IDs waar relevant.
- Co-Authored-By toevoegen als Claude heeft bijgedragen.

---

## 4. Toetsen aan het beoordelingskader

Het beoordelingskader codekwaliteit (10 domeinen, score 1–10) wordt periodiek toegepast om de voortgang meetbaar te maken. De resultaten worden vastgelegd in `toetshistorie_codekwaliteit.md`.

### Wanneer toetsen?

Er zijn drie toetsmomenten:

1. **Na elke sprint** (verhoging van het minor-versienummer). Dit is verplicht. Scoor alle 10 domeinen opnieuw en leg de delta vast.
2. **Bij een milestone**: als een prioriteit-A-domein substantieel verbetert (bijv. veiligheid van 3 naar 7). Dit is optioneel maar aanbevolen.
3. **Als sanity check**: als een refactoring onverwacht veel code raakt of als er twijfel is over regressie. Dit is situationeel.

### Hoe toetsen?

1. Open `TOETSINGSKADER.md`, Deel B (secties 19–28) en loop de beoordelingsvragen per domein door.
2. Scoor elk domein opnieuw op basis van de huidige code.
3. Noteer per gewijzigde score een korte toelichting (wat is verbeterd, wat resteert).
4. Bereken het nieuwe gewogen gemiddelde.
5. Schrijf de resultaten als nieuwe entry in `toetshistorie_codekwaliteit.md`.

### Formaat toetshistorie

Elke entry bevat een scoretabel, het gemiddelde, het oordeel en een korte samenvatting van wat er is veranderd ten opzichte van de vorige toetsing.

---

## 5. Werkwijze per sessie

Een typische verbeteringssessie verloopt als volgt:

1. **Kies een taak** uit het actieve plan (zie `docs/INDEX.md` §3 voor overzicht Layer 1/Layer 2 werkpakketten).
2. **Voer de wijziging door** in het relevante bronbestand (`dashboard.html`, `ux-reference.html`, of documentatie in `docs/`).
3. **Test de wijziging** visueel en functioneel in de browser (+ `runTests()` + test runner Alt+Shift+T bij `dashboard.html`-wijzigingen).
4. **Verhoog het versienummer** in de `DASHBOARD_VERSION`-constante in `dashboard.html`.
5. **Schrijf een changelog-entry** in `docs/CHANGELOG.md`.
6. **Commit** met `<type>(v<versie>): <samenvatting>` (zie §3b).
7. **Optioneel**: als het een sprint-afronding of milestone betreft, toets aan het beoordelingskader en update `toetshistorie_codekwaliteit.md`.

### Backups

Maak geen kopie van het dashboard bij elke versie — de changelog en toetshistorie zijn voldoende. De enige uitzondering: maak een backup (`dashboard_backup_vX.Y.Z.html`) vóór een grote, risicovolle sprint. Verwijder de backup zodra de sprint succesvol is afgerond.

---

## 6. Overzicht bestanden

| Bestand | Doel | Wanneer bijwerken |
|---|---|---|
| `dashboard.html` | Dashboard Engine Layer, met versienummer in de code | Elke versie |
| `ux-reference.html` | UX Reference Layer — normatieve referentie voor UX-patronen | Bij UX-patroonwijziging |
| `CLAUDE.md` | AI-assistentinstructies met platformvisie, conventies en workflow | Bij proceswijziging |
| `docs/CHANGELOG.md` | Chronologisch logboek van alle wijzigingen | Elke versie |
| `docs/INDEX.md` | Kruisverwijzing alle plannen, sprint-IDs en documenten | Bij nieuw plan/document |
| `docs/ARCHITECTUUR.md` | Doelarchitectuur: 5 lagen, contracten, interfaces, eindbeeld | Bij architectuurwijziging |
| `docs/VERANDERPAD.md` | Gefaseerd migratiepad van huidig naar doelarchitectuur | Bij routewijziging |
| `docs/LAYER1_PLAN.md` | UX Reference Layer: 12 werkpakketten (WP1–WP12) | Bij WP-wijziging |
| `docs/LAYER2_PLAN.md` | Dashboard Engine Layer: 13 werkpakketten (WP-A t/m WP-M), 4 fasen | Bij WP-wijziging |
| `docs/TESTREGISTER.md` | Automatisch testregister met 4 suites en 27 performance-budgetten | Bij suite-wijziging |
| `docs/TOETSINGSKADER.md` | Beoordelingskader codekwaliteit: 10 domeinen, score 1–10 | Per sprint herscoren |
| `docs/TEMPLATE_ONTWERP.md` | Technisch ontwerp single-file template structuur | Referentie |
| `docs/TESTPLAN.md` | Testplan design-wijzigingen (DevTools-based) | Bij testwijziging |
| `docs/BUGS.md` | Actieve en opgeloste bugs | Bij nieuwe bug of fix |
| `docs/VOORSTEL_UX_KOLOMMEN.md` | Kolom drag-drop UX voorstel: visuele feedback combinatie | Referentie |
| `docs/WERKWIJZE_VERSIEBEHEER.md` | Dit document — beschrijft het proces | Bij proceswijziging |
| `docs/IMPLEMENTATIEPLAN.md` | 25 taken over 6 sprints *(afgerond v0.31.0)* | Archief |
| `docs/PERFORMANCE_PLAN.md` | 7 perf-taken over 5 sprints *(afgerond v0.25.1)* | Archief |
| `docs/DESIGN_PLAN.md` | Visuele redesign *(afgerond v0.15.0)* | Archief |

### Naamconventies

| Type | Conventie | Voorbeeld |
|------|-----------|-----------|
| Plannen, kaders, logs in `docs/` | `SCREAMING_CASE.md` | `TESTREGISTER.md` |
| Testrapporten | `testrapport-v{X.Y.Z}-{YYYY-MM-DD}.md` | `testrapport-v0.35.0-2026-03-08.md` |
| Snapshots | `dashboard-v{X.Y.Z}.html` | `dashboard-v0.35.0.html` |
| Nooit spaties in bestandsnamen | — | — |
| Alleen `dashboard.html`, `ux-reference.html` en `CLAUDE.md` in de root | — | — |

---

## 7. Criterium voor v1.0.0

Het platform bereikt versie 1.0.0 wanneer aan alle volgende voorwaarden is voldaan:

- Alle werkpakketten uit LAYER1_PLAN.md (WP1–WP12) en LAYER2_PLAN.md (WP-A t/m WP-M) zijn afgerond.
- De CSV-adapter (Layer 3) en assembler (Layer 5) zijn operationeel.
- Minimaal één AI-gegenereerd dashboard is succesvol geassembleerd.
- Het gemiddelde in het beoordelingskader codekwaliteit is minimaal 7,5.
- Geen enkel domein scoort lager dan 6.
- De domeinen Veiligheid en Testbaarheid scoren minimaal 7.
