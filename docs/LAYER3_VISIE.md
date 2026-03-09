# Layer 3 — CSV Adapter: Visie & Totaalbeeld

Versie: 1.0
Datum: 2026-03-09

---

## 1. Positie in de architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: ASSEMBLER                                             │
│  Combineert alle bronnen → single-file HTML dashboard           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Layer 1  │  │ Layer 2  │  │ Layer 3  │  │ Layer 4  │       │
│  │ UX Ref   │  │ Engine   │  │ CSV      │  │ Dashboard│       │
│  │          │  │          │  │ Adapter  │  │ Spec (AI)│       │
│  │ tokens,  │  │ runtime, │  │ parsing, │  │ config   │       │
│  │ patronen,│  │ pipeline,│  │ typing,  │  │ generatie│       │
│  │ CSS-stubs│  │ render,  │  │ schema,  │  │ per CSV  │       │
│  │          │  │ export   │  │ validatie│  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│        │              ▲            │              │              │
│        │              │            │              │              │
│        │         ╔════╧════════════╧══════════════╝              │
│        │         ║  dashboardConfig (JSON)                       │
│        │         ║  = spec + data + schema                       │
│        │         ╚══════════════════════════════════             │
│        │                     │                                   │
│        └─────────────────────┘                                   │
│                              ↓                                   │
│                    dist/{naam}.html                               │
└─────────────────────────────────────────────────────────────────┘
```

Layer 3 is de **brug tussen de fysieke wereld (CSV-bestanden) en de logische wereld (engine-consumeerbare data)**. Zonder Layer 3 moet elke dataset handmatig worden omgevormd tot JavaScript-objecten met correcte types. Met Layer 3 wordt dat geautomatiseerd, gevalideerd en reproduceerbaar.

---

## 2. Kernfunctie

Layer 3 heeft precies één verantwoordelijkheid:

> **CSV-bestanden omzetten naar een gevalideerd `datasetContract`-object dat de engine direct kan consumeren.**

Dat klinkt simpel, maar omvat vijf niet-triviale deelproblemen:

| Deelprobleem | Waarom niet-triviaal |
|-------------|---------------------|
| **Parsing** | CSV is geen standaard. Delimiters variëren (`,` `;` `\t`), quoting is inconsistent, regeleinden variëren (LF/CRLF), encoding variëert (UTF-8/Latin-1). |
| **Typing** | CSV is typeless — alles is string. De adapter moet detecteren of `"42"` een getal is, `"2026-03-09"` een datum, `"true"` een boolean, en `"Actief"` een enum-waarde. |
| **Normalisatie** | Headers bevatten spaties, hoofdletters, speciale tekens. Lege cellen, `NULL`, `N/A`, `"-"` moeten uniform worden behandeld. |
| **Schema-inferentie** | De adapter moet niet alleen records opleveren, maar ook een schema: welke velden bestaan, welk type hebben ze, welke unieke waarden komen voor bij enums, welke velden zijn nullable. |
| **Validatie** | De adapter moet fouten signaleren: ontbrekende verplichte kolommen, type-conflicten, onparseerbare waarden, lege bestanden. |

---

## 3. Input en output

### Input

```
CSV-bestand(en)
├── headers (eerste rij)
├── datarijen (rest)
├── delimiter (auto-detect: , ; \t)
├── encoding (UTF-8, aanname)
└── optioneel: hints (type-overrides, verplichte velden)
```

### Output: `datasetContract`

Dit contract is al gedefinieerd in de engine (dashboard.html r.982-1001):

```javascript
{
  records: [                    // Array<Object> — verplicht
    { id: 1, name: "Project Alpha", budget: 150000, status: "Actief", ... },
    { id: 2, name: "Project Beta",  budget: 230000, status: "Voltooid", ... }
  ],
  schema: {                     // Object — optioneel maar sterk aanbevolen
    fields: [
      { name: "id",     type: "number",  nullable: false },
      { name: "name",   type: "text",    nullable: false },
      { name: "budget", type: "number",  nullable: true  },
      { name: "status", type: "enum",    nullable: false,
        enumValues: ["Actief","In Review","Voltooid","On Hold","Gepland"] }
    ]
  },
  sourceMeta: {                 // Object — optioneel, voor traceerbaarheid
    filename: "projecten.csv",
    rowCount: 4500,
    parseWarnings: ["Rij 234: kolom 'budget' bevat niet-numerieke waarde 'n.v.t.'"]
  }
}
```

De engine valideert dit contract via `validateDatasetContract()` en laadt het via `dataSource.type: 'dataset'` + `dataSource.records`.

---

## 4. Relatie met elke andere layer

### 4.1 Layer 3 → Layer 2 (Engine): data-leverancier

Dit is de **primaire relatie**. Layer 3 levert wat de engine consumeert.

```
Layer 3 output          →  Layer 2 consumptie
─────────────────────      ──────────────────────────
records[]               →  _tabData[idx]
schema.fields[].type    →  col.type (text/number/date/boolean/enum)
schema.fields[].name    →  col.key
schema.enumValues       →  domain.categoricalFields, tagColors kandidaten
sourceMeta.parseWarnings→  console warnings bij laden
```

**Het contract is al klaar.** De engine heeft `validateDatasetContract()` (r.988) en `initTabDataFromConfig()` (r.1386) die `dataSource.type === 'dataset'` accepteren. Layer 3 hoeft alleen het juiste formaat op te leveren.

**Wat de engine NIET doet en Layer 3 WEL moet doen:**
- CSV parsen (de engine kent geen CSV)
- Types detecteren (de engine verwacht getypte waarden, geen strings)
- Headers normaliseren (de engine verwacht camelCase keys)
- Lege waarden uniform maken (de engine verwacht `null`, niet `""` of `"N/A"`)
- Enum-waarden inventariseren (de engine toont ze in filters/grouping)

### 4.2 Layer 3 → Layer 4 (Dashboard Spec / AI): schema-leverancier

Dit is de **tweede cruciale relatie**. Layer 4 (AI) kan geen slimme configuratie genereren zonder het schema te kennen.

```
Layer 3 output          →  Layer 4 consumptie
─────────────────────      ──────────────────────────
schema.fields[].name    →  AI kiest kolomlabels, volgorde, zichtbaarheid
schema.fields[].type    →  AI kiest renderer (text→text, number→budget, enum→tag)
schema.enumValues       →  AI genereert tagColors mapping
schema.fields[].nullable→  AI bepaalt of veld in zoekindex hoort
sourceMeta.rowCount     →  AI kiest virtualisatie-defaults
records (steekproef)    →  AI leidt semantiek af (primaryLabel, searchTextFields)
```

**Layer 3 is de ogen van Layer 4.** De AI ziet nooit de ruwe CSV — alleen het genormaliseerde schema + een steekproef van records. Daardoor:
- Kan de AI geen parse-fouten maken
- Werkt de AI altijd met correcte types
- Zijn de veldnamen al genormaliseerd
- Zijn enum-waarden compleet beschikbaar

### 4.3 Layer 3 ← Layer 1 (UX Reference): geen directe relatie

Layer 1 en Layer 3 raken elkaar niet. Layer 1 definieert hoe het dashboard eruitziet en zich gedraagt; Layer 3 gaat over data. Ze ontmoeten elkaar pas in Layer 5 (Assembler) waar tokens en data samen in één HTML komen.

### 4.4 Layer 3 → Layer 5 (Assembler): data-injectie

De Assembler gebruikt de Layer 3 output als bron voor de inline dataset:

```
Layer 3 output          →  Layer 5 verwerking
─────────────────────      ──────────────────────────
records[]               →  Inline als JSON in <script>
schema                  →  Gemerged met spec in dashboardConfig
sourceMeta              →  Optioneel als comment in output HTML
```

---

## 5. Wat Layer 3 NIET doet

Grenzen zijn even belangrijk als verantwoordelijkheden:

| Niet Layer 3 | Wel Layer... | Reden |
|-------------|-------------|-------|
| Kolomlabels bepalen | Layer 4 (AI) | Labels zijn semantisch, niet technisch |
| Renderers kiezen | Layer 4 (AI) | Renderer is een UX-beslissing |
| tagColors toewijzen | Layer 4 (AI) | Kleurkeuze is domein+UX |
| Kolom-volgorde bepalen | Layer 4 (AI) | Volgorde is gebruikskeuze |
| Features aan/uit zetten | Layer 4 (AI) | Features zijn dashboard-specifiek |
| Data renderen | Layer 2 (Engine) | Rendering is runtime-logica |
| Data filteren/sorteren | Layer 2 (Engine) | Pipeline is runtime-logica |
| CSS/tokens definiëren | Layer 1 (UX Ref) | Visuele standaard is UX |
| Bundelen tot HTML | Layer 5 (Assembler) | Packaging is build-concern |

**De vuistregel:** Layer 3 levert *feiten* over de data (types, waarden, structuur). Layer 4 geeft daar *betekenis* aan (labels, renderers, kleuren). Layer 2 *voert uit* (filteren, renderen, exporteren).

---

## 6. De zes stappen van Layer 3

```
CSV-bestand
    │
    ▼
┌─ STAP 1: PARSING ──────────────────────────────────┐
│  • Delimiter auto-detect (; , \t)                   │
│  • Quote-handling (RFC 4180)                        │
│  • Encoding normalisatie                            │
│  • Output: string[][] (rijen × kolommen)            │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─ STAP 2: HEADER NORMALISATIE ───────────────────────┐
│  • Whitespace trim                                   │
│  • camelCase conversie ("Kosten Realisatie" → kostenRealisatie) │
│  • Duplicaat-detectie (name, name_2, name_3)         │
│  • BOM-verwijdering                                  │
│  • Output: string[] (genormaliseerde kolomnamen)     │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─ STAP 3: TYPE INFERENTIE ──────────────────────────┐
│  • Per kolom: scan eerste N rijen (of alle)          │
│  • Detectie: number, date, boolean, enum, text       │
│  • Drempelwaarden: ≥80% match → type toekennen       │
│  • Enum-detectie: ≤30 unieke waarden + type text     │
│  • Output: fieldType per kolom + enumValues           │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─ STAP 4: WAARDE-CONVERSIE ─────────────────────────┐
│  • Strings → Number (locale-aware: 1.234,56)         │
│  • Strings → Date (ISO 8601 + NL-formaten)           │
│  • Strings → Boolean ("ja"/"nee", "true"/"false")    │
│  • Lege/null → null                                  │
│  • Output: Object[] (getypte records)                │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─ STAP 5: SCHEMA GENERATIE ─────────────────────────┐
│  • Per veld: { name, type, nullable, enumValues? }   │
│  • Statistieken: min, max, uniques, nullCount         │
│  • Output: schema object                             │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─ STAP 6: VALIDATIE & OUTPUT ───────────────────────┐
│  • validateDatasetContract() toepassen               │
│  • Waarschuwingen verzamelen                         │
│  • Output: { records, schema, sourceMeta }           │
└─────────────────────────────────────────────────────┘
```

---

## 7. Wat er vandaag al bestaat

De engine (v0.61.0) heeft al voorbereidingen voor Layer 3:

| Component | Locatie | Status |
|-----------|---------|--------|
| `datasetContract` definitie | r.982-1001 | ✅ Klaar |
| `validateDatasetContract()` | r.988-1001 | ✅ Klaar |
| `dashboardSpecContract` definitie | r.1003-1049 | ✅ Klaar |
| `validateDashboardSpec()` | r.1024-1049 | ✅ Klaar |
| `dataSource.type: 'dataset'` support | r.1387 | ✅ Klaar |
| `dataSource.records` laden | r.1388 | ✅ Klaar |
| `dataSource.schema` (optioneel) | r.1377 | ✅ Gedefinieerd |
| Schema-typed kolommen (col.type) | alle kolommen | ✅ Klaar |
| Type-based dispatch in engine | v0.60.0+ | ✅ Klaar |
| Test voor dataset-loading | r.5163 (B3) | ✅ Klaar |

**Wat ontbreekt:** de daadwerkelijke CSV→datasetContract transformatie. De engine kan het *consumeren*; Layer 3 moet het *produceren*.

---

## 8. Ontwerpkeuze: waar draait Layer 3?

Er zijn twee opties:

### Optie A: Build-time (aanbevolen)

```
CSV-bestand → [Layer 3] → datasetContract JSON → [Assembler] → inline in HTML
```

Layer 3 draait als **build-stap** voordat de Assembler het dashboard bouwt. De getypte records worden als JSON geïnjecteerd in het output-HTML bestand. De browser hoeft nooit CSV te parsen.

**Voordelen:**
- Geen CSV-parser nodig in de browser
- Geen parse-latency bij openen dashboard
- Dashboard HTML is zelfstandig (geen externe bestanden)
- Parse-fouten worden bij build gedetecteerd, niet bij gebruik

### Optie B: Runtime (optioneel, later)

```
CSV-bestand → browser fetch → [Layer 3 in browser] → datasetContract → engine
```

Layer 3 draait **in de browser** en parst CSV op runtime. Nuttig voor dashboards die live CSV-bestanden laden (bijv. via URL).

**Voordelen:**
- Dashboard kan dynamisch updaten
- Geen rebuild nodig bij data-update

**Aanbeveling:** Start met Optie A (build-time). De engine accepteert al `dataSource.type: 'dataset'` met pre-loaded records. Optie B kan later worden toegevoegd als `dataSource.type: 'csv-url'` zonder de engine te wijzigen.

---

## 9. De complete keten: van CSV tot dashboard

```
                AUTEUR                          BUILD                        GEBRUIKER
                ──────                          ─────                        ─────────

  ① CSV-bestand     ② Layer 3            ③ Layer 4 (AI)        ④ Layer 5        ⑤ Browser
  (fysiek bestand)   (CSV Adapter)         (Dashboard Spec)      (Assembler)       (runtime)

  projecten.csv ──→ parseCSV() ──→ schema ──→ AI analyseert  ──→ bundel:       ──→ engine
                     typeInfer()    records    schema+steekproef   tokens (L1)      laadt
                     normalize()    meta       ↓                   engine (L2)      dashboardConfig
                     validate()               genereert:           data (L3)        ↓
                                               tabs[]              spec (L4)        rendert
                                               columns[]           ↓                filtert
                                               features{}         output:           sorteert
                                               tagColors{}        dashboard.html    exporteert
                                               schemaContract
                                               ↓
                                              dashboardConfig.json
```

**Elke layer raakt alleen zijn buren:**
- Layer 3 kent Layer 2's contract (datasetContract) maar niet de engine-internals
- Layer 4 kent Layer 3's output (schema) en Layer 2's contract (dashboardSpecContract)
- Layer 5 kent alle outputs maar niet de interne logica van 1-4
- Layer 2 kent alleen dashboardConfig — onwetend over hoe die is ontstaan

---

## 10. Testbaarheid van Layer 3

Layer 3 is **volledig testbaar in isolatie** — geen browser nodig, geen engine nodig.

| Test-categorie | Wat | Voorbeeld |
|---------------|-----|-----------|
| **Parsing** | Delimiter-detectie, quoting, edge cases | `"a;b;c"` vs `"a,b,c"` |
| **Header-normalisatie** | Spaties, casing, duplicaten | `"Kosten Realisatie"` → `"kostenRealisatie"` |
| **Type-inferentie** | Number, date, boolean, enum detectie | Kolom met 80% getallen → type `number` |
| **Waarde-conversie** | String→typed waarden | `"1.234,56"` → `1234.56` |
| **Schema-generatie** | Correcte fields output | enum met ≤30 unieke waarden |
| **Validatie** | Contract-conformiteit | Ontbrekende verplichte kolommen |
| **Round-trip** | CSV→datasetContract→engine load | Records tellen na laden |

---

## 11. Risico's en mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Encoding-problemen** | Verkeerde tekens (é → Ã©) | UTF-8 aannemen, BOM-detectie, fallback Latin-1 |
| **Ambigue types** | "123" kan getal of postcode zijn | Configureerbare type-hints naast auto-detect |
| **Locale-afhankelijke getallen** | `1.234,56` (NL) vs `1,234.56` (EN) | NL-locale als default, override mogelijk |
| **Grote bestanden** | >100.000 rijen, traag in browser | Build-time verwerking (Optie A), streaming parser |
| **Multi-CSV joins** | Twee bestanden linken op gedeeld veld | Fase 2 feature, niet in eerste versie |

---

## 12. Fasering

### Fase 1: Core CSV Adapter (minimum viable)

- [ ] CSV parsing met delimiter auto-detect
- [ ] Header normalisatie (trim, camelCase, dedup)
- [ ] Type inferentie (number, date, boolean, enum, text)
- [ ] Waarde conversie (string → typed)
- [ ] Null-normalisatie
- [ ] Schema generatie
- [ ] `datasetContract` output
- [ ] Validatie + warnings
- [ ] Test suite

### Fase 2: Geavanceerd (later)

- [ ] Multi-CSV support (meerdere bestanden → meerdere tabs)
- [ ] Type-hints (overschrijf auto-detect per kolom)
- [ ] Statistische metadata (min, max, stddev, null-percentage)
- [ ] Runtime-modus (browser-side parsing via `dataSource.type: 'csv-url'`)
- [ ] Encoding-detectie (UTF-8 / Latin-1 / Windows-1252)
- [ ] Streaming parser voor bestanden >50MB

---

## 13. Samenvatting

Layer 3 is het **ontbrekende schakelpunt** in de architectuur. Zonder Layer 3:
- Moet elke dataset handmatig naar JavaScript worden vertaald
- Kan Layer 4 (AI) geen schema analyseren
- Is het platform geen platform, maar een template met hardcoded demo-data

Met Layer 3:
- Levert elke CSV automatisch een gevalideerd, getypt datasetContract
- Heeft Layer 4 (AI) een formele basis voor configuratie-generatie
- Is de keten CSV → schema → spec → dashboard volledig geautomatiseerd
- Verdwijnt de laatste domein-specifieke code (data generators) uit de engine

**Layer 3 maakt van "een generiek dashboard-template" een "CSV Dashboard Platform".**
