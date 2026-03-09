# Dashboard Spec Generator — AI-Prompt Template

Versie: 1.0
Datum: 2026-03-09

---

## Gebruik

Vervang `{{SCHEMA_JSON}}`, `{{SAMPLE_RECORDS_JSON}}` en `{{DASHBOARD_TITLE}}` door de werkelijke waarden en stuur de prompt naar Claude.

De output is een compleet, geldig `dashboard-spec.json` dat direct door de engine kan worden geladen.

---

## Prompt Template

```
Je bent een expert in het ontwerpen van data-dashboards voor overheidsorganisaties.

Je taak: genereer een `dashboard-spec.json` op basis van het onderstaande CSV-schema en voorbeeldrecords.

---

## Regels

1. Output is ALLEEN geldig JSON — geen uitleg, geen commentaar, geen markdown-opmaak.
2. De spec voldoet exact aan SPEC-SCHEMA.md (zie §Schemaregels hieronder).
3. Elke kolom uit het schema krijgt een entry in `columns[]`.
4. Renderers worden gekozen op basis van de beslisregels (zie §Renderer-keuze).
5. Alle enum-velden krijgen een `tagColors`-mapping.
6. `domain.ordinalOrders` bevat alle enum-velden met een logische volgorde.
7. `schemaContract.semanticFields` is volledig ingevuld.
8. `condFormattingRules` bevat minimaal 3 zinvolle regels.

---

## Input: CSV-schema

Dashboardtitel: {{DASHBOARD_TITLE}}

Schema (Layer 3 output):
{{SCHEMA_JSON}}

Steekproef records (eerste 10 rijen):
{{SAMPLE_RECORDS_JSON}}

---

## Schemaregels (SPEC-SCHEMA samenvatting)

Toplevel structuur:
{
  "app": { "title": string, "version": "1.0.0", "defaultTabId": string },
  "tabs": [{
    "id": string,
    "label": string,
    "dataSource": { "type": "dataset" },
    "columns": [{
      "key": string,           // veldnaam exact zoals in schema
      "label": string,         // leesbare Nederlandse kolomkop
      "visible": boolean,      // standaard zichtbaar?
      "type": "text"|"number"|"date"|"boolean"|"enum",
      "renderer": string,      // zie renderer-keuze
      "tagColors": {}          // alleen bij renderer "tag"
    }],
    "features": { "search": true, "filter": true, "sort": true, "group": true,
                  "condFormatting": true, "freeze": true, "multiSelect": true, "contextMenu": true },
    "exports": { "allow": ["csv","json","xlsx","html","markdown","png"],
                 "defaultScope": "filtered", "allowSelectionExport": true },
    "defaults": { "rowHeight": "compact", "visibleColumns": null, "sort": null, "grouping": [] },
    "schemaContract": {
      "primaryKey": string,    // veldnaam van unieke sleutel (id of eerste veld)
      "semanticFields": {
        "primaryLabel": string,   // naam/titel veld
        "secondaryLabel": string, // categorie/afdeling veld (of null)
        "owner": string,          // verantwoordelijk persoon veld (of null)
        "status": string,         // statusveld (of null)
        "priority": string,       // prioriteitveld (of null)
        "progress": string,       // voortgangsveld number 0-100 (of null)
        "activeFlag": string,     // boolean veld 'actief' (of null)
        "detailTitle": string,    // veld voor modal-titel
        "searchTextFields": []    // extra velden in zoekindex
      },
      "condFormattingRules": []
    }
  }],
  "domain": {
    "categoricalFields": [],  // alle enum-velden
    "averageFields": [],      // alle number-velden
    "booleanFields": [],      // alle boolean-velden
    "ordinalOrders": {},      // geordende enums
    "tagColors": {}           // kleurenmapping per veld
  }
}

---

## Renderer-keuze (beslisregels, in volgorde toepassen)

1. Veldnaam bevat "naam", "name", "titel", "title", "projectnaam" → `avatar` (persoon) of `text` (object)
   - Is het een persoonsnaam? → `avatar`
   - Is het een objectnaam/titel? → `text`
2. Veldnaam bevat "email", "mail" → `email`
3. Veldnaam bevat "telefoon", "phone", "tel", "code", "postcode" → `mono`
4. Type `enum` → `tag` (altijd)
5. Type `boolean` → `check` (altijd)
6. Type `date` → `date` (altijd)
7. Type `number`:
   a. Veldnaam bevat "budget", "kosten", "bedrag", "realisatie", "prijs", "waarde" → `budget`
   b. Veldnaam bevat "voortgang", "progress", "capaciteit", "percentage", "pct" → `progress`
   c. Veldnaam bevat "beoordeling", "score", "rating", "ster" → `star`
   d. Veldnaam bevat "km", "afstand", "uren", "uur", "dagen" → `number` (met suffix)
   e. Overig → `number`
8. Type `text`, overig → `text`

---

## tagColor-toewijzing

Gebruik deze semantische regels:
- Positief / actief / compleet / laag risico → `tag-success`
- Aandacht / matig / tijdelijk / waarschuwing → `tag-warning`
- Kritiek / negatief / hoog risico / ontbreekt → `tag-danger`
- Informatief / gepland / in review / neutraal-positief → `tag-info`
- Afgerond / hoog niveau / speciaal → `tag-purple`
- Geen specifieke betekenis / overig → `tag-neutral`

Bekende Nederlandse enum-patronen:
- Status: Actief→success, Voltooid→purple, On Hold→warning, In Review→info, Gepland→info
- Prioriteit/Risico: Hoog→danger, Middel→warning, Laag→success, Kritiek→danger
- Fase: Initiatief→info, Definitie→neutral, Ontwerp→warning, Realisatie→success, Afsluiting→purple
- Documentatie: Compleet→success, Incompleet→warning, Ontbreekt→danger
- Milieu: Positief→success, Neutraal→neutral, Negatief→danger
- Contract: Vast→success, Tijdelijk→neutral, Inhuur→warning, Detachering→purple
- Opleiding: WO→purple, HBO→info, MBO→success

---

## condFormattingRules

Stel minimaal 3 zinvolle regels op:
- Kritieke status of hoog risico → `cond-red`
- Succesvol voltooid of laag risico → `cond-green`
- Aandachtspunt (bijv. lage voortgang, wachtstatus) → `cond-yellow`

Formaat: { "field": "veldnaam", "op": "eq"|"ne"|"lt"|"gt"|"lte"|"gte", "value": waarde, "cssClass": "cond-red"|"cond-yellow"|"cond-green" }

---

Genereer nu de volledige dashboard-spec.json. Output alleen geldige JSON, niets anders.
```

---

## Richtlijnen voor spec-kwaliteit

### Kolomvolgorde
Stel kolommen in deze volgorde (meest relevant eerst):
1. Primaire naam/titel (visible: true)
2. Status, prioriteit (visible: true)
3. Verantwoordelijke persoon (visible: true)
4. Datum-velden (visible: true)
5. Voortgang/progress (visible: true)
6. Geldwaarden (visible: true)
7. Categorie/cluster (visible: true)
8. Overige relevante velden (visible: true)
9. Technische velden zoals `id` (visible: false)
10. Overige velden (visible: false)

### Zichtbaarheid
Stel `visible: false` voor:
- ID-velden (unieke sleutel zonder semantische waarde)
- Intern-technische velden
- Velden die alleen relevant zijn voor experts

### Tabbeschrijving
Geef de tab een beschrijvende naam (niet "Data" maar "Projecten", "Teamleden", "Subsidies", etc.).
Kies `id` op basis van de bestandsnaam of inhoud van het CSV (lowercase, geen spaties, geen speciale tekens).

### Grouping defaults
Kies een zinvol standaard-groeperingsveld als de data een duidelijke categorische dimensie heeft
(bijv. `"grouping": ["cluster"]` voor projecten per cluster).

---

## Voorbeeld gebruik

```
Input schema:
{
  "fields": [
    { "name": "id",         "type": "number",  "nullable": false },
    { "name": "projectnaam","type": "text",    "nullable": false },
    { "name": "status",     "type": "enum",    "nullable": false,
      "enumValues": ["Actief","Voltooid","On Hold","In Review","Gepland"] }
  ]
}

Input sample records:
[
  { "id": 1, "projectnaam": "Omgevingsvisie 2030", "status": "Actief" },
  { "id": 2, "projectnaam": "Feyenoord City",      "status": "In Review" }
]

Verwachte output (fragment):
{
  "app": { "title": "Projectenmonitor", "version": "1.0.0", "defaultTabId": "projecten" },
  "tabs": [{
    "id": "projecten",
    "label": "Projecten",
    "dataSource": { "type": "dataset" },
    "columns": [
      { "key": "projectnaam", "label": "Projectnaam", "visible": true,
        "type": "text", "renderer": "text" },
      { "key": "status", "label": "Status", "visible": true,
        "type": "enum", "renderer": "tag",
        "tagColors": {
          "Actief": "tag-success", "Voltooid": "tag-purple",
          "On Hold": "tag-warning", "In Review": "tag-info", "Gepland": "tag-info"
        }
      },
      { "key": "id", "label": "ID", "visible": false,
        "type": "number", "renderer": "number" }
    ],
    ...
  }]
}
```
