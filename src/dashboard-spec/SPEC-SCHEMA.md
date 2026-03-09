# Dashboard Spec — Schemaspecificatie

Versie: 1.0
Datum: 2026-03-09

---

## 1. Inleiding

Een `dashboard-spec.json` beschrijft volledig hoe het dashboard eruitziet en zich gedraagt voor één specifieke dataset. Dit is het formaat dat Layer 4 (AI) genereert en dat de Layer 2 engine (via `validateDashboardSpec()`) valideert en laadt.

**De spec is puur declaratief JSON — geen functies, geen runtime-logica.**

---

## 2. Toplevel structuur

```json
{
  "app": { ... },
  "tabs": [ ... ],
  "domain": { ... }
}
```

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `app` | Object | ja | Dashboardmetadata |
| `tabs` | Array | ja | Minimaal 1 tab met kolommen en instellingen |
| `domain` | Object | nee (aanbevolen) | Categorisatie, kleuren, volgorden |

---

## 3. `app`

```json
"app": {
  "title": "Projectenmonitor Gemeente Rotterdam",
  "version": "1.0.0",
  "defaultTabId": "projecten"
}
```

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `title` | string | ja | Zichtbare naam van het dashboard |
| `version` | string | nee | Versie van de spec (niet de engine) |
| `defaultTabId` | string | ja | `id` van de standaard actieve tab |

---

## 4. `tabs[]`

Elke tab beschrijft één dataset-weergave.

```json
{
  "id": "projecten",
  "label": "Projecten",
  "dataSource": { "type": "dataset" },
  "columns": [ ... ],
  "defaultRowCount": 4500,
  "features": { ... },
  "exports": { ... },
  "defaults": { ... },
  "schemaContract": { ... }
}
```

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | string | ja | Unieke identifier (lowercase, geen spaties) |
| `label` | string | ja | Weergavenaam in tabbar |
| `dataSource` | Object | ja | Zie §4.1 |
| `columns` | Array | ja | Kolomdefinities — zie §5 |
| `defaultRowCount` | number | nee | Aantal rijen voor demo-data; negeer bij echte data |
| `features` | Object | nee | Zie §4.2 |
| `exports` | Object | nee | Zie §4.3 |
| `defaults` | Object | nee | Zie §4.4 |
| `schemaContract` | Object | nee (aanbevolen) | Zie §4.5 |

### 4.1 `dataSource`

| Waarde | Beschrijving |
|--------|--------------|
| `{ "type": "embedded" }` | Data via `generateData()` — alleen voor demo/engine-test |
| `{ "type": "dataset" }` | Data via Layer 3 (CSV-adapter) — gebruik dit voor AI-gegenereerde specs |

### 4.2 `features`

Alle velden zijn optioneel en standaard `true`.

```json
"features": {
  "search": true,
  "filter": true,
  "sort": true,
  "group": true,
  "condFormatting": true,
  "freeze": true,
  "multiSelect": true,
  "contextMenu": true
}
```

### 4.3 `exports`

```json
"exports": {
  "allow": ["csv", "json", "xlsx", "html", "markdown", "png"],
  "defaultScope": "filtered",
  "allowSelectionExport": true
}
```

| `defaultScope` waarden | Beschrijving |
|------------------------|--------------|
| `"filtered"` | Exporteer gefilterde + gesorteerde weergave |
| `"all"` | Exporteer alle rijen ongeacht filter |
| `"selection"` | Exporteer alleen geselecteerde rijen |

### 4.4 `defaults`

```json
"defaults": {
  "rowHeight": "compact",
  "visibleColumns": null,
  "sort": null,
  "grouping": []
}
```

| Veld | Type | Beschrijving |
|------|------|--------------|
| `rowHeight` | `"compact"` \| `"normal"` \| `"relaxed"` | Rijhoogte bij laden |
| `visibleColumns` | `null` \| `string[]` | `null` = alle zichtbaar; array = alleen genoemde keys |
| `sort` | `null` \| `{ key: string, dir: "asc"\|"desc" }` | Standaardsortering |
| `grouping` | `string[]` | Standaard groeperingsvelden (leeg = geen groepering) |

### 4.5 `schemaContract`

Semantische mapping van veldnamen naar betekenis. Wordt gebruikt door engine voor modal-detail, zoekindex en contextmenu.

```json
"schemaContract": {
  "primaryKey": "id",
  "semanticFields": {
    "primaryLabel": "projectnaam",
    "secondaryLabel": "cluster",
    "owner": "directeur",
    "status": "status",
    "priority": "prioriteit",
    "progress": "voortgang",
    "activeFlag": null,
    "detailTitle": "projectnaam",
    "searchTextFields": ["projectnaam", "directeur", "cluster"]
  },
  "condFormattingRules": [ ... ]
}
```

| `semanticFields` veld | Beschrijving |
|----------------------|--------------|
| `primaryLabel` | Belangrijkste tekst-identificator (naam/titel) |
| `secondaryLabel` | Tweede identifier (categorie/afdeling) |
| `owner` | Verantwoordelijk persoon |
| `status` | Statusveld voor kleurcodering |
| `priority` | Prioriteitsveld |
| `progress` | Voortgangsveld (number 0–100) |
| `activeFlag` | Boolean veld dat 'actief' aangeeft (`null` als niet van toepassing) |
| `detailTitle` | Veld voor modal-detailtitel |
| `searchTextFields` | Extra velden die in de zoekindex worden opgenomen |

#### `condFormattingRules`

Regels voor rijkleuring op basis van veldwaarden.

```json
"condFormattingRules": [
  { "field": "prioriteit", "op": "eq", "value": "Hoog", "cssClass": "cond-red" },
  { "field": "status", "op": "eq", "value": "Voltooid", "cssClass": "cond-green" },
  { "field": "voortgang", "op": "lt", "value": 30, "cssClass": "cond-yellow" }
]
```

| `op` waarde | Betekenis |
|-------------|-----------|
| `"eq"` | Gelijk aan (`===`) |
| `"ne"` | Niet gelijk aan (`!==`) |
| `"lt"` | Kleiner dan (`<`) |
| `"gt"` | Groter dan (`>`) |
| `"lte"` | Kleiner dan of gelijk (`<=`) |
| `"gte"` | Groter dan of gelijk (`>=`) |

| `cssClass` waarde | Kleur | Gebruik |
|-------------------|-------|---------|
| `"cond-red"` | Rood | Kritiek, hoog risico, negatief |
| `"cond-yellow"` | Geel | Aandacht vereist, in review, laag voortgang |
| `"cond-green"` | Groen | Voltooid, positief, laag risico |

---

## 5. `columns[]`

Elke kolom definieert hoe één veld wordt weergegeven.

```json
{
  "key": "status",
  "label": "Status",
  "visible": true,
  "type": "enum",
  "renderer": "tag",
  "tagColors": {
    "Actief": "tag-success",
    "In Review": "tag-info",
    "Voltooid": "tag-purple",
    "On Hold": "tag-warning",
    "Gepland": "tag-neutral"
  }
}
```

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `key` | string | ja | Veldnaam in de data (camelCase, matcht schema) |
| `label` | string | ja | Zichtbare kolomkop |
| `visible` | boolean | nee (default: true) | Of kolom standaard zichtbaar is |
| `type` | string | ja | `text` \| `number` \| `date` \| `boolean` \| `enum` |
| `renderer` | string | ja | Zie §5.1 |
| `tagColors` | Object | nee | Alleen bij `renderer: "tag"` — zie §5.2 |
| `suffix` | string | nee | Achtervoegsel bij number-renderer (bijv. `" km"`, `"u"`) |
| `width` | number | nee | Breedte in pixels (default: automatisch) |

### 5.1 Renderers

| Renderer | Gebruik bij type | Beschrijving |
|----------|-----------------|--------------|
| `text` | text | Eenvoudige tekstcel |
| `avatar` | text | Initialen-avatar + naam (voor persoonsnamen) |
| `email` | text | Klikbare mailto-link |
| `mono` | text, number | Monospace lettertype (telefoonnr, codes) |
| `tag` | enum | Gekleurde badge |
| `number` | number | Geformateerd getal (duizendpunten, optioneel suffix) |
| `budget` | number | Europese valutanotatie (€ 1.234.567) |
| `progress` | number | Voortgangsbalk (0–100) |
| `star` | number | Sterrenbeoordeling (1–5) |
| `date` | date | Datum in NL-formaat (dd-mm-yyyy) |
| `check` | boolean | Vinkje / kruis |
| `note` | text | Tekstcel met truncatie en tooltip |

**Renderer-beslisregels (voor AI):**

1. Veld is een persoonsnaam → `avatar`
2. Veld is een e-mailadres → `email`
3. Veld is een telefoonnummer of code → `mono`
4. Type `enum` → `tag` (altijd)
5. Type `boolean` → `check` (altijd)
6. Type `date` → `date` (altijd)
7. Type `number`, grote bedragen (budget, kosten, realisatie) → `budget`
8. Type `number`, percentage of voortgang (0–100) → `progress`
9. Type `number`, sterrenscore (1–5) → `star`
10. Type `number`, overig → `number`
11. Type `text`, overig → `text`

### 5.2 tagColors

Koppelt enum-waarden aan CSS-klassen. Ontbrekende waarden krijgen `tag-neutral`.

```json
"tagColors": {
  "WaardeA": "tag-success",
  "WaardeB": "tag-warning",
  "WaardeC": "tag-danger"
}
```

| CSS-klasse | Kleur | Semantiek |
|------------|-------|-----------|
| `tag-success` | Groen | Positief, actief, compleet, laag risico |
| `tag-warning` | Oranje | Aandacht, matig, tijdelijk, hoog (minder dan kritiek) |
| `tag-danger` | Rood | Kritiek, negatief, hoog risico, ontbreekt |
| `tag-info` | Blauw | Informatief, in uitvoering, gepland |
| `tag-purple` | Paars | Afgerond, senior, speciaal |
| `tag-neutral` | Grijs | Geen specifieke betekenis |

---

## 6. `domain`

Domein-brede configuratie voor aggregaties, kleuren en sorteringen.

```json
"domain": {
  "categoricalFields": ["status", "prioriteit", "cluster", "fase"],
  "averageFields": ["voortgang", "budget", "kostenRealisatie", "stakeholders"],
  "booleanFields": ["goedgekeurd"],
  "ordinalOrders": {
    "prioriteit": ["Hoog", "Middel", "Laag"],
    "fase": ["Initiatief", "Definitie", "Ontwerp", "Realisatie", "Afsluiting"]
  },
  "tagColors": {
    "status": { "Actief": "tag-success", "Voltooid": "tag-purple" },
    "prioriteit": { "Hoog": "tag-danger", "Middel": "tag-warning", "Laag": "tag-success" }
  }
}
```

| Veld | Type | Beschrijving |
|------|------|--------------|
| `categoricalFields` | string[] | Enum-velden geschikt voor groepering en filtering |
| `averageFields` | string[] | Numerieke velden voor gemiddelde-aggregaties |
| `booleanFields` | string[] | Booleaanse velden |
| `ordinalOrders` | Object | Geordende volgorde per enum-veld (voor sortering) |
| `tagColors` | Object | tagColor-mappings per veld (kan ook per kolom worden opgegeven) |

**Noot:** `tagColors` op kolomniveau (`columns[].tagColors`) heeft voorrang boven `domain.tagColors`.

---

## 7. Volledig minimaal voorbeeld

```json
{
  "app": {
    "title": "Mijn Dashboard",
    "version": "1.0.0",
    "defaultTabId": "data"
  },
  "tabs": [
    {
      "id": "data",
      "label": "Data",
      "dataSource": { "type": "dataset" },
      "columns": [
        { "key": "naam", "label": "Naam", "type": "text", "renderer": "text" },
        { "key": "status", "label": "Status", "type": "enum", "renderer": "tag",
          "tagColors": { "Actief": "tag-success", "Inactief": "tag-neutral" } },
        { "key": "budget", "label": "Budget", "type": "number", "renderer": "budget" }
      ],
      "features": { "search": true, "filter": true, "sort": true, "group": true },
      "exports": { "allow": ["csv", "json"], "defaultScope": "filtered" },
      "defaults": { "rowHeight": "compact", "sort": null, "grouping": [] }
    }
  ],
  "domain": {
    "categoricalFields": ["status"],
    "averageFields": ["budget"],
    "booleanFields": []
  }
}
```

---

## 8. Validatieregels

Een spec is geldig wanneer `validateDashboardSpec(spec)` in de engine `[]` retourneert.

**Verplichte velden (validatiefout als ontbrekend):**
- `app.title`
- `app.defaultTabId`
- `tabs` (minimaal 1 element)
- Per tab: `id`, `label`, `columns` (minimaal 1)
- Per kolom: `key`, `label`, `type`, `renderer`

**Beperkingen:**
- Tab `id`-waarden moeten uniek zijn
- `app.defaultTabId` moet overeenkomen met een bestaande tab `id`
- `type` moet zijn: `text` | `number` | `date` | `boolean` | `enum`
- `renderer` moet een van de gedefinieerde renderertypes zijn (zie §5.1)
