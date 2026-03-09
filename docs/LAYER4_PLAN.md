# Taakplan Layer 4 — Dashboard Spec Layer

Versie: 1.0
Datum: 2026-03-09

---

## 1. Doel

Layer 4 is de **AI-configuratiegenerator**: gegeven een CSV-schema (Layer 3 output) en de engine-contracten (Layer 2), genereert Layer 4 een `dashboard-spec.json` die de engine volledig aanstuurt zonder handmatige configuratie.

**Layer 4 is de bron van waarheid voor dashboard-specifieke configuratie.**

### Relatie tot de platformarchitectuur

| Laag | Bestand | Rol |
|------|---------|-----|
| Layer 1 — UX Reference | `ux-reference.html` | UX-patronen, tokens, interactie |
| Layer 2 — Dashboard Engine | `dashboard.html` | Runtime, pipeline, render |
| Layer 3 — CSV Adapter | `src/csv-adapter/` | CSV → datasetContract |
| **→ Layer 4 — Dashboard Spec** | `src/dashboard-spec/` | **Dit plan** |
| Layer 5 — Assembler | Nog niet gebouwd | Bundeling → single HTML |

### Relatie tot de roadmap-breekpunten

| Breekpunt | Status | Relevant voor Layer 4 |
|-----------|--------|-----------------------|
| **1 — dashboardConfig extraheerbaar** | ✅ Afgerond (v0.44.0) | Basis: config is nu puur declaratief JSON |
| **2 — CSV-adapter + eerste AI-spec** | ○ In uitvoering | **WP-A t/m WP-C** |
| **3 — Assembler + mappenstructuur** | ○ Open | WP-D levert input voor assembler |

---

## 2. Wat Layer 4 doet en niet doet

### Wel Layer 4
- Kolomlabels kiezen op basis van veldnamen
- Renderers toewijzen op basis van type + semantiek (name→avatar, voortgang→progress, budget→budget)
- tagColors genereren voor enum-velden
- Ordinal-volgorden definiëren voor geordende enums
- Semantische velden benoemen (primaryLabel, status, priority, progress)
- Conditional formatting regels opstellen
- Tab-structuur bepalen (per CSV of per thema)
- Features en exports configureren
- Kolom-zichtbaarheid en volgorde kiezen

### Niet Layer 4

| Niet Layer 4 | Wel Layer... |
|-------------|-------------|
| CSV parsen | Layer 3 |
| Types infereren | Layer 3 |
| Data renderen | Layer 2 |
| UX-patronen definiëren | Layer 1 |
| Bestanden bundelen | Layer 5 |

---

## 3. Input en output

### Input

```
datasetContract (Layer 3 output):
{
  records: [...],            // steekproef (eerste 50 rijen)
  schema: {
    fields: [
      { name: string, type: 'text'|'number'|'date'|'boolean'|'enum',
        nullable: boolean, enumValues?: string[] }
    ]
  },
  sourceMeta: { filename: string, rowCount: number, parseWarnings: string[] }
}
```

### Output

```
dashboard-spec.json  →  geldig dashboardConfig-object
```

De spec heeft exact de structuur die `validateDashboardSpec()` accepteert (zie `dashboard.html` r.1003–1049), aangevuld met `schemaContract` en `domain`.

---

## 4. Werkpakketten

```
WP-A ──→ WP-B ──→ WP-C ──→ WP-D
```

| # | Werkpakket | Resultaat | Status |
|---|-----------|-----------|--------|
| WP-A | Spec-schema formaliseren | `src/dashboard-spec/SPEC-SCHEMA.md` | ✅ v0.63.0 |
| WP-B | AI-prompt template bouwen | `src/dashboard-spec/spec-generator.md` | ✅ v0.63.0 |
| WP-C | Eerste spec genereren | `src/dashboard-spec/examples/projecten-spec.json` | ✅ v0.63.0 |
| WP-D | Spec → engine integratie | `src/dashboard-spec/test-integration.html` | ✅ v0.64.0 |

---

### WP-A — Spec-schema formaliseren

**Doel:** Exacte documentatie van het dashboard-spec JSON-formaat, zodat AI altijd geldig output genereert.

**Deliverable:** `src/dashboard-spec/SPEC-SCHEMA.md`

**Inhoud:**
- Volledig veldoverzicht met type, verplicht/optioneel, toegestane waarden
- Alle beschikbare renderers met wanneer ze te gebruiken
- Alle tagColor-klassen met semantiek
- Regels voor schemaContract (semanticFields, condFormattingRules)
- Voorbeeld-snippet per sectie

**Acceptatiecriteria:**
- Een AI kan uitsluitend op basis van dit document een geldige spec schrijven
- Alle velden die `validateDashboardSpec()` vereist staan gedocumenteerd

---

### WP-B — AI-prompt template bouwen

**Doel:** Een prompt-template die + CSV-schema → geldige dashboard-spec genereert.

**Deliverable:** `src/dashboard-spec/spec-generator.md`

**Inhoud:**
- Taakbeschrijving voor de AI
- Volledige SPEC-SCHEMA als context
- Renderer-beslisboom (type + semantiek → renderer-keuze)
- tagColor-beslisregels (positief/negatief/neutraal → tag-klasse)
- Instructies voor ordinal-volgorden
- Instructies voor conditionele opmaak
- Output-eisen (geldig JSON, geen commentaar, exact schema)

**Acceptatiecriteria:**
- Invullen van `{{SCHEMA_JSON}}` + `{{SAMPLE_RECORDS_JSON}}` levert direct een geldige spec
- Spec passeert `validateDashboardSpec()` zonder fouten

---

### WP-C — Eerste spec genereren

**Doel:** Concrete `dashboard-spec.json` voor `projecten.csv` als eerste bewijs van het platform.

**Deliverable:** `src/dashboard-spec/examples/projecten-spec.json`

**Aanpak:**
1. CSV-schema van `projecten.csv` (na Layer 3 verwerking) als input
2. AI-prompt template invullen
3. Dashboard-spec genereren
4. Handmatig controleren op correctheid en volledigheid

**Acceptatiecriteria:**
- `validateDashboardSpec(spec)` retourneert `[]` (0 fouten)
- Alle 18 velden uit `projecten.csv` zijn geconfigureerd
- Renderers zijn semantisch correct (voortgang → progress, budget → budget, etc.)
- tagColors zijn ingesteld voor alle enum-velden

---

### WP-D — Spec → engine integratie (end-to-end)

**Doel:** Bewijzen dat een AI-gegenereerde spec + CSV-data het dashboard volledig aanstuurt.

**Aanpak:**
1. CSV-adapter parseert `projecten.csv` → `datasetContract`
2. `projecten-spec.json` wordt geladen als `dashboardConfig`
3. Engine laadt dataset via `dataSource: { type: 'dataset', records: [...] }`
4. Dashboard rendert op basis van de spec — geen handmatige aanpassing

**Deliverables:**
- Testpagina in `src/dashboard-spec/test-integration.html`
- Of: integratie als test-tab in de CSV-adapter `test.html`

**Acceptatiecriteria:**
- Dashboard laadt en rendert volledig op basis van spec + CSV-data
- Filter, sort, group werken op alle kolommen
- Export genereert correcte output
- Alle 241 engine-tests blijven slagen

---

## 5. Mappenstructuur

```
src/dashboard-spec/
├── SPEC-SCHEMA.md            # Volledige specificatie van het dashboard-spec formaat
├── spec-generator.md         # AI-prompt template voor spec-generatie
├── test-integration.html     # End-to-end integratie test (WP-D)
└── examples/
    ├── projecten-spec.json   # Eerste gegenereerde spec (uit projecten.csv)
    └── teamleden-spec.json   # (toekomstig — uit teamleden.csv)
```

---

## 6. Renderer-keuzematrix

| Veldtype | Semantiek | Renderer | Voorbeeld |
|----------|-----------|----------|-----------|
| text | naam/label | text | projectnaam |
| text | persoonsnaam | avatar | directeur, pm |
| text | e-mailadres | email | email |
| text | telefoonnummer | mono | telefoon |
| number | voortgang 0–100 | progress | voortgang, capaciteit |
| number | geldbedrag | budget | budget, kostenRealisatie |
| number | sterrenscore 1–5 | star | beoordeling |
| number | gewoon getal | number | stakeholders, fte |
| number | getal met suffix | number + suffix | uren, reisafstand |
| date | datum | date | deadline, startdatum |
| boolean | aan/uit | check | goedgekeurd, actief |
| enum | categorie | tag | status, cluster, fase |

---

## 7. tagColor-semantiek

| CSS-klasse | Semantiek | Gebruik |
|------------|-----------|---------|
| `tag-success` | Positief, actief, compleet | Actief, Compleet, Laag (risico) |
| `tag-warning` | Aandacht, matig, in uitvoering | Middel, Incompleet, On Hold |
| `tag-danger` | Kritiek, negatief, hoog risico | Hoog (risico), Kritiek, Negatief |
| `tag-info` | Informatief, in review, neutraal | In Review, Gepland |
| `tag-purple` | Afgerond, senior niveau, speciaal | Voltooid, WO, Detachering |
| `tag-neutral` | Geen kleurcodering | Overige categorieën |

---

## 8. Versioning

| Fase | Werkpakketten | Versie |
|------|--------------|--------|
| Spec-schema + prompt + eerste spec | WP-A + WP-B + WP-C | v0.63.0 |
| End-to-end integratie | WP-D | v0.64.0 |

---

## 9. Definition of Done

Layer 4 is gereed wanneer:

- [x] Het spec-formaat is volledig gedocumenteerd (SPEC-SCHEMA.md) — WP-A (v0.63.0)
- [x] Een AI-prompt template bestaat die schema → spec genereert — WP-B (v0.63.0)
- [x] De eerste `projecten-spec.json` is gegenereerd en valideert foutloos — WP-C (v0.63.0)
- [x] Een end-to-end test bewijst dat spec + CSV-data koppelen (35 checks, 0 fails) — WP-D (v0.64.0)
